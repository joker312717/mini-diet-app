import { recordMock } from './mock.js'
import { isBackendReady, upload, uploadBlob } from './request.js'

/**
 * AI 识图分析食物热量 —— 服务层
 *
 * 后端接口约定（小程序端不可直连大模型，需由自己的服务端转发）：
 *   POST  {API_BASE}/api/food/analyze
 *   Content-Type: multipart/form-data
 *   字段: file = 图片文件；mealType = 餐次（可选）
 *   返回: { "items": [ { "name": "米饭", "weight": 180, "confidence": 0.92 } ] }
 *         name 建议与食材库名称一致，命中后自动补全营养数据；
 *         未命中时可按以下形式返回每100g营养：
 *         { "name": "自定义菜名", "weight": 150, "calorie100": 200, "protein100": 8, "carbs100": 20, "fat100": 6 }
 *
 * 未配置后端或接口异常时，自动回退到本地示例数据，保证演示链路可用。
 */
// 示例识别结果，模拟模型对一张餐盘照片的输出
const MOCK_RESULT = [
  { name: '糙米饭', weight: 180, confidence: 0.94 },
  { name: '鸡胸肉', weight: 120, confidence: 0.88 },
  { name: '西兰花', weight: 150, confidence: 0.91 }
]

// 去掉括号备注与常见烹饪前缀，提升「煎三文鱼」「清炒西兰花」这类名字的命中率
const COOK_PREFIX = /^(香煎|煎|炸|清炒|炒|水煮|煮|蒸|烤|红烧|凉拌|白灼|卤|炖|焖|拌)/
function normalizeName(name) {
  return String(name || '')
    .replace(/[（(].*?[)）]/g, '')
    .replace(COOK_PREFIX, '')
    .trim()
}

// 按名称在食材库中查找：先精确匹配，再按包含关系取最长匹配
export function findFood(name) {
  const list = recordMock.foodLibrary
  const raw = String(name || '').trim()
  const clean = normalizeName(raw)
  const candidates = [raw, clean].filter(Boolean)
  for (const c of candidates) {
    const exact = list.find((f) => f.name === c)
    if (exact) return exact
  }
  let best = null
  for (const f of list) {
    // 单字匹配太容易误判（如「肉」会命中鸡胸肉），要求双方至少 2 个字
    const hit = candidates.some(
      (c) =>
        (f.name.length >= 2 && c.includes(f.name)) ||
        (c.length >= 2 && f.name.includes(c))
    )
    if (hit && (!best || f.name.length > best.name.length)) best = f
  }
  return best
}

/**
 * 把「食材名 + 估算克重」补全为可加入录入列表的条目
 * 返回值结构与输入页 selected 项一致（calorie/protein/carbs/fat 均为每100g数值）
 * confidence 为模型置信度，未返回时按 1 处理
 */
export function enrichItems(raw) {
  return raw.map((r) => {
    const weight = Math.max(1, Math.round(Number(r.weight) || 100))
    const confidence = r.confidence == null ? 1 : Math.max(0, Math.min(1, Number(r.confidence)))
    const base = findFood(r.name)
    if (base) return { ...base, weight, confidence }
    return {
      name: r.name,
      weight,
      confidence,
      calorie: Number(r.calorie100) || 0,
      protein: Number(r.protein100) || 0,
      carbs: Number(r.carbs100) || 0,
      fat: Number(r.fat100) || 0,
      unknown: true
    }
  })
}

/**
 * 分析一张餐盘照片
 * @param {String} filePath 本地图片临时路径
 * @param {String} mealType 餐次（早餐/午餐/晚餐/加餐）
 * @param {Object} compressed 前端压缩结果（可选），有 blob 时走 fetch 上传，避免大图拖慢
 * @returns {Promise<{items: Array, mock: Boolean, fallback: Boolean}>}
 */
export function analyzeFoodPhoto(filePath, mealType = '', compressed = null) {
  // 未配置后端：返回示例数据
  if (!isBackendReady()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ items: enrichItems(MOCK_RESULT), mock: true })
      }, 1200)
    })
  }

  const formData = mealType ? { mealType } : {}
  const payload =
    compressed && compressed.blob
      ? uploadBlob({
          url: '/api/food/analyze',
          blob: compressed.blob,
          name: 'file',
          fileName: compressed.fileName || 'food.jpg',
          formData
        })
      : upload({ url: '/api/food/analyze', filePath, name: 'file', formData })

  return payload
    .then((body) => {
      if (!body || !Array.isArray(body.items) || !body.items.length) {
        throw new Error('未识别出食物，请换一张照片试试')
      }
      return { items: enrichItems(body.items), mock: false }
    })
    .catch((err) => {
      // 上线版不返回示例数据，避免用户误以为识别成功；直接抛出友好提示
      throw new Error(err.message || '识别服务暂时不可用，请稍后重试')
    })
}
