/**
 * H5 图片压缩
 *
 * 手机原图动辄 3-8MB，直接上传会让识图慢好几秒。
 * 这里用 canvas 把长边缩到 maxSize（默认 1600px）、转成 JPEG，通常只剩 300-600KB。
 * 长边与质量都比纯速度优先的 1280/0.8 高一档，让模型能看清食物纹理与油光，提升识别准确率。
 *
 * 返回 { path, blob, size }：
 *   path —— 可用于 <image> 预览和 uni.uploadFile（压缩失败时回退原图）
 *   blob —— 压缩后的图片二进制，H5 下走 uploadBlob 上传
 */
export function compressImage(filePath, { maxSize = 1600, quality = 0.85, fileName = 'food.jpg' } = {}) {
  // #ifdef H5
  return new Promise((resolve) => {
    const img = new Image()
    const fail = () => resolve({ path: filePath, blob: null, size: 0 })
    img.onerror = fail
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const width = Math.round(img.width * scale)
      const height = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        fail()
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            fail()
            return
          }
          resolve({ path: URL.createObjectURL(blob), blob, size: blob.size, fileName })
        },
        'image/jpeg',
        quality
      )
    }
    img.src = filePath
  })
  // #endif

  // #ifndef H5
  return Promise.resolve({ path: filePath, blob: null, size: 0 })
  // #endif
}
