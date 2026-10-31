/**
 * 统一的网络请求封装
 *
 * API_BASE 为空：整个项目处于「前端演示模式」，AI 识图等能力走本地示例数据
 * API_BASE 有值：所有请求走真实服务
 *
 * 地址在 common/config.js 中按环境切换：本地用 DEV_BASE，发行版用 PROD_BASE
 */
import { API_BASE } from './config.js'

export { API_BASE }

export const TIMEOUT = 10000
// 视觉模型单次识别通常要 10-30 秒，上传单独放宽超时
export const UPLOAD_TIMEOUT = 60000

// 后端是否已接入
export function isBackendReady() {
  return !!API_BASE
}

function normalizeError(res, fallbackMsg) {
  let msg = fallbackMsg
  const data = res && res.data
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      msg = parsed.message || parsed.msg || msg
    } catch (e) {
      // 非 JSON 响应，保持默认文案
    }
  } else if (data && (data.message || data.msg)) {
    msg = data.message || data.msg
  }
  const err = new Error(msg)
  err.statusCode = res && res.statusCode
  return err
}

function parseBody(data) {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch (e) {
    return null
  }
}

/**
 * 普通 JSON 请求
 * @returns {Promise<any>} 已解析的响应体
 */
export function request({ url, method = 'GET', data = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    if (!API_BASE) {
      reject(new Error('后端未配置'))
      return
    }
    uni.request({
      url: API_BASE + url,
      method,
      data,
      timeout: TIMEOUT,
      header: { 'Content-Type': 'application/json', ...header },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parseBody(res.data))
        } else {
          reject(normalizeError(res, '服务异常，请稍后重试'))
        }
      },
      fail() {
        reject(new Error('网络连接失败，请检查网络后重试'))
      }
    })
  })
}

/**
 * 直接上传 Blob（H5 图片压缩后使用）
 * uni.uploadFile 只认本地路径，压缩后的 Blob 走 fetch + FormData
 * @returns {Promise<any>} 已解析的响应体
 */
export function uploadBlob({ url, blob, name = 'file', fileName = 'food.jpg', formData = {} }) {
  return new Promise((resolve, reject) => {
    if (!API_BASE) {
      reject(new Error('后端未配置'))
      return
    }
    // #ifdef H5
    const form = new FormData()
    Object.keys(formData).forEach((k) => form.append(k, formData[k]))
    form.append(name, blob, fileName)
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const timer = controller
      ? setTimeout(() => controller.abort(), UPLOAD_TIMEOUT)
      : null
    fetch(API_BASE + url, {
      method: 'POST',
      body: form,
      signal: controller ? controller.signal : undefined
    })
      .then((res) =>
        res.text().then((text) => {
          if (res.ok) {
            const body = parseBody(text)
            if (body) resolve(body)
            else reject(new Error('服务返回格式异常'))
            return
          }
          let msg = '上传失败，请稍后重试'
          try {
            const parsed = JSON.parse(text)
            msg = parsed.message || parsed.msg || msg
          } catch (e) {
            // 非 JSON 响应，保持默认文案
          }
          const err = new Error(msg)
          err.statusCode = res.status
          reject(err)
        })
      )
      .catch((err) => {
        reject(new Error(err && err.name === 'AbortError' ? '识别超时，请稍后重试' : '网络连接失败，请检查网络后重试'))
      })
      .finally(() => {
        if (timer) clearTimeout(timer)
      })
    // #endif
    // #ifndef H5
    reject(new Error('当前平台不支持 Blob 上传'))
    // #endif
  })
}

/**
 * 文件上传（multipart/form-data）
 * @returns {Promise<any>} 已解析的响应体
 */
export function upload({ url, filePath, name = 'file', formData = {} }) {
  return new Promise((resolve, reject) => {
    if (!API_BASE) {
      reject(new Error('后端未配置'))
      return
    }
    uni.uploadFile({
      url: API_BASE + url,
      filePath,
      name,
      formData,
      timeout: UPLOAD_TIMEOUT,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = parseBody(res.data)
          if (body) resolve(body)
          else reject(new Error('服务返回格式异常'))
        } else {
          reject(normalizeError(res, '上传失败，请稍后重试'))
        }
      },
      fail() {
        reject(new Error('网络连接失败，请检查网络后重试'))
      }
    })
  })
}
