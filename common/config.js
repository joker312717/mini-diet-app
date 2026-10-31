/**
 * 接口地址配置
 *
 * 本地调试（运行到浏览器 / HBuilderX 运行）：使用 DEV_BASE
 * 发行打包（NODE_ENV=production）：若 PROD_BASE 已填，自动切换到线上地址
 *
 * 上线时只需要改 PROD_BASE 一处，本地调试不受影响
 */
const DEV_BASE = 'http://localhost:3001'
// 例：'https://api.your-domain.com'（留空则发行版仍用 DEV_BASE）
const PROD_BASE = ''

const IS_PROD =
  typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production'

export const API_BASE = IS_PROD && PROD_BASE ? PROD_BASE : DEV_BASE
