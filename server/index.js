const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// 读取同目录 .env（零依赖的简易实现）
function loadEnv() {
  const file = path.join(__dirname, '.env')
  if (!fs.existsSync(file)) return
  fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) return
      const value = m[2].replace(/^["']|["']$/g, '')
      if (!process.env[m[1]]) process.env[m[1]] = value
    })
}
loadEnv()

const PORT = Number(process.env.PORT) || 3001
// OpenAI 兼容的视觉模型服务地址，默认阿里云百炼（DashScope）兼容模式
const BASE_URL = (process.env.MODEL_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').replace(/\/$/, '')
const MODEL = process.env.VISION_MODEL || 'qwen3-vl-plus'
const API_KEY = process.env.MODEL_API_KEY || ''
// 百炼的 omni 系列默认会先「深度思考」再回答，识图场景会白白多等 15 秒以上；
// 关闭后实测从 20s 降到 5s 左右，识别结果无明显差别。需要思考时设 MODEL_THINKING=true
const IS_DASHSCOPE = /dashscope|aliyun/.test(BASE_URL)
const ENABLE_THINKING = process.env.MODEL_THINKING === 'true'
const MAX_BYTES = 8 * 1024 * 1024
const RATE_LIMIT = 20
const RATE_WINDOW = 60 * 60 * 1000

// 简单的内存限流：每个 IP 每小时最多 20 次
const hits = new Map()
function rateLimited(ip) {
  const now = Date.now()
  const rec = hits.get(ip)
  if (!rec || now - rec.start > RATE_WINDOW) {
    hits.set(ip, { start: now, count: 1 })
    return false
  }
  rec.count += 1
  return rec.count > RATE_LIMIT
}

// 识别结果缓存：同一张图片只调用一次大模型
// key 为图片字节的 sha256，重复上传同一张照片直接命中，不产生模型费用
const CACHE_TTL = Number(process.env.CACHE_TTL_HOURS || 24) * 60 * 60 * 1000
const CACHE_MAX = Number(process.env.CACHE_MAX || 200)
const cache = new Map()

function cacheKey(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function cacheGet(key) {
  const rec = cache.get(key)
  if (!rec) return null
  if (Date.now() - rec.at > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  // 命中后移到队尾，实现最简 LRU
  cache.delete(key)
  cache.set(key, rec)
  return rec.items
}

function cacheSet(key, items) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value)
  cache.set(key, { at: Date.now(), items })
}

// 只支持单文件 + 文本字段的精简 multipart 解析
function parseMultipart(buffer, boundary) {
  const sep = Buffer.from('--' + boundary)
  const parts = []
  let cursor = buffer.indexOf(sep)
  while (cursor !== -1) {
    const next = buffer.indexOf(sep, cursor + sep.length)
    if (next === -1) break
    const chunk = buffer.slice(cursor + sep.length + 2, next)
    const headerEnd = chunk.indexOf('\r\n\r\n')
    if (headerEnd !== -1) {
      const headers = chunk.slice(0, headerEnd).toString('utf8')
      const body = chunk.slice(headerEnd + 4, chunk.length - 2)
      const name = (headers.match(/name="([^"]*)"/) || [])[1] || ''
      const type = (headers.match(/content-type:\s*([^\r\n]+)/i) || [])[1] || ''
      parts.push({ name, type: type.trim(), data: body })
    }
    cursor = next
  }
  return parts
}

const PROMPT = `你是专业营养师兼食物视觉分析师。识别餐盘照片中的每种食物，估算可食用重量（克）与每 100g 营养，用于减脂热量记录。
识别规则：
1. 先判断菜品类型与烹饪方式（蒸/煮/烤/煎/炒/炸/红烧），名称带做法，如「香煎三文鱼」「清炒油麦菜」。红烧、油炸、糖醋类按含油糖的实际做法给热量。
2. 复合菜（番茄炒蛋、宫保鸡丁、盖浇饭）拆成可计量的主要食材；汤类按「汤底+主要配料」合并为一项并计入油。
3. 重量以餐具为参照：常见白瓷盘直径 20-24cm，一碗米饭 150-200g，一个鸡蛋约 50g，一掌心肉约 100g，一小碗汤 250-300g。按盘中可见面积与堆高估算，不要照菜名套固定值。
4. 每种食物单独一项，最多 8 项；明显含油的酱汁、汤汁计入对应菜品热量。
5. confidence 取值：种类与份量都确定 ≥0.9；种类确定但重量不确定 0.5-0.8；不确定是什么食物 <0.5。
输出：只输出 JSON，不要解释、不要 markdown：
{"items":[{"name":"香煎三文鱼","weight":150,"confidence":0.9,"calorie100":206,"protein100":22.5,"carbs100":0,"fat100":12}]}
calorie100/protein100/carbs100/fat100 为每 100g 的合理数值，不能为空或 0（纯蔬菜脂肪可接近 0）。无法判断为食物时返回 {"items":[]}`

function extractJson(text) {
  if (!text) return null
  const cleaned = text.replace(/```json|```/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch (e) {
    return null
  }
}

function normalizeItems(data) {
  const list = Array.isArray(data && data.items) ? data.items : []
  return list
    .slice(0, 8)
    .map((r) => {
      const name = String((r && r.name) || '').trim()
      if (!name) return null
      const weight = Math.min(2000, Math.max(1, Math.round(Number(r.weight) || 100)))
      const confidence = r.confidence == null ? 0.7 : Math.min(1, Math.max(0, Number(r.confidence)))
      const item = { name, weight, confidence }
      ;['calorie100', 'protein100', 'carbs100', 'fat100'].forEach((k) => {
        if (r[k] != null) item[k] = Number(r[k]) || 0
      })
      return item
    })
    .filter(Boolean)
}

async function callVisionModel(dataUrl) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      // 仅百炼支持该参数，其它服务商不传，避免 400
      ...(IS_DASHSCOPE ? { enable_thinking: ENABLE_THINKING } : {}),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            { type: 'text', text: PROMPT }
          ]
        }
      ]
    })
  })
  const text = await res.text()
  if (!res.ok) {
    // 鉴权/开通类错误给出可操作提示，避免前端只看到 403 原文
    if (res.status === 401 || res.status === 403) {
      const denied = text.includes('AccessDenied') || text.includes('Unpurchased')
      throw new Error(
        denied
          ? `模型「${MODEL}」未开通或无权限，请到模型服务平台开通后重试`
          : '模型服务鉴权失败，请检查 MODEL_API_KEY'
      )
    }
    throw new Error(`模型服务返回 ${res.status}: ${text.slice(0, 200)}`)
  }
  const body = JSON.parse(text)
  const content = body.choices && body.choices[0] && body.choices[0].message && body.choices[0].message.content
  const parsed = extractJson(typeof content === 'string' ? content : JSON.stringify(content))
  if (!parsed) throw new Error('模型输出不是合法 JSON')
  return normalizeItems(parsed)
}

// 允许跨域的前端域名，逗号分隔；留空则放开（方便本地调试）
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function allowOriginFor(req) {
  const origin = req.headers.origin
  if (!ALLOWED_ORIGINS.length) return '*'
  return origin && ALLOWED_ORIGINS.includes(origin) ? origin : ''
}

function send(res, status, payload) {
  const body = JSON.stringify(payload)
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Vary': 'Origin',
    'Content-Length': Buffer.byteLength(body)
  }
  // 未命中白名单时不发 CORS 头，浏览器会拦下跨域请求
  if (res.allowOrigin) headers['Access-Control-Allow-Origin'] = res.allowOrigin
  res.writeHead(status, headers)
  res.end(body)
}

const server = http.createServer((req, res) => {
  // 每个请求先算好跨域头，send() 直接复用
  res.allowOrigin = allowOriginFor(req)
  if (req.method === 'OPTIONS') return send(res, 204, {})
  if (req.method === 'GET' && req.url === '/api/health') {
    return send(res, 200, { ok: true, model: MODEL, keyReady: Boolean(API_KEY) })
  }
  if (req.method !== 'POST' || req.url !== '/api/food/analyze') {
    return send(res, 404, { message: '接口不存在' })
  }

  const ip = req.socket.remoteAddress || 'unknown'

  const type = req.headers['content-type'] || ''
  let raw = []
  let size = 0
  req.on('data', (chunk) => {
    size += chunk.length
    if (size > MAX_BYTES) {
      req.destroy()
      send(res, 413, { message: '图片太大了，请压缩后再传' })
      return
    }
    raw.push(chunk)
  })
  req.on('end', async () => {
    try {
      if (size === 0) return send(res, 400, { message: '没有收到图片' })
      const buffer = Buffer.concat(raw)
      let dataUrl = ''
      let imageBuffer = null

      if (type.includes('multipart/form-data')) {
        const boundary = (type.match(/boundary=(.+)$/) || [])[1]
        if (!boundary) return send(res, 400, { message: '缺少 boundary' })
        const parts = parseMultipart(buffer, boundary)
        const file = parts.find((p) => p.name === 'file' && p.type)
        if (!file || !file.data.length) return send(res, 400, { message: '没有收到图片文件' })
        imageBuffer = file.data
        dataUrl = `data:${file.type};base64,${file.data.toString('base64')}`
      } else if (type.includes('application/json')) {
        const body = JSON.parse(buffer.toString('utf8'))
        const image = body && body.image
        if (!image || !/^data:image\//.test(image)) return send(res, 400, { message: 'image 需为 dataURL' })
        dataUrl = image
        imageBuffer = Buffer.from((image.split(',')[1] || ''), 'base64')
      } else {
        return send(res, 415, { message: '不支持的 Content-Type' })
      }

      // 命中缓存直接返回，既省钱也不占用限流次数
      const key = cacheKey(imageBuffer)
      const cached = cacheGet(key)
      if (cached) return send(res, 200, { items: cached, cached: true })

      if (rateLimited(ip)) return send(res, 429, { message: '识别太频繁，请稍后再试' })
      if (!API_KEY) return send(res, 503, { message: '服务端未配置视觉模型 key' })

      const items = await callVisionModel(dataUrl)
      if (!items.length) return send(res, 422, { message: '没认出来是食物，换个角度再拍一张' })
      cacheSet(key, items)
      send(res, 200, { items, cached: false })
    } catch (err) {
      send(res, 502, { message: err.message || '模型调用失败' })
    }
  })
})

server.listen(PORT, () => {
  console.log(`food-analyze server: http://localhost:${PORT}`)
  console.log(`model: ${MODEL} | key: ${API_KEY ? '已配置' : '未配置（请写入 .env）'}`)
})
