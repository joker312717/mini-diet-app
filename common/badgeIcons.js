// 徽章专属图案：统一的「简约可爱」矢量风格
// 规格：48x48 网格 / 3.2rpx 圆头描边 / 视觉重心集中在 11~37 / 每枚带一枚小星点作为家族签名
// 单色实现，颜色由使用场景传入（墙内为品牌色，弹窗圆底为白色，未解锁为浅灰）

const SPARKLE = (c, x, y, r) =>
  `<circle cx="${x}" cy="${y}" r="${r || 1.8}" fill="${c}" stroke="none" fill-opacity="0.5"/>`

const paint = (inner, color) => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">` +
    `<g fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">` +
    inner +
    `</g></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// 1 初次记录：一支削好的小铅笔
const pencil = (c) => `
  <g transform="rotate(-35 24 24)">
    <rect x="12" y="19.5" width="18" height="9" rx="4.5"/>
    <path d="M30 19.5 L36.5 24 L30 28.5"/>
  </g>
  ${SPARKLE(c, 12.5, 36.5)}
`

// 2 连续7天：七颗小圆点围成一圈
const sevenDots = (c) => {
  const dots = [
    [24, 11], [34.2, 15.9], [36.7, 26.9], [29.6, 35.7],
    [18.4, 35.7], [11.3, 26.9], [13.8, 15.9]
  ]
  return dots
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}" stroke="none" fill-opacity="0.65"/>`)
    .join('') + `<circle cx="24" cy="24" r="4.6" fill="${c}" stroke="none"/>`
}

// 3 配餐达人：一碗热气腾腾的饭
const bowl = (c) => `
  <path d="M11 25 H37"/>
  <path d="M13 25 C13 31 17.9 36 24 36 C30.1 36 35 31 35 25"/>
  <path d="M20 18.5 C18.6 16 21.4 14 20 11.5"/>
  <path d="M28 18.5 C26.6 16 29.4 14 28 11.5"/>
  ${SPARKLE(c, 38.5, 14)}
`

// 4 贴心呵护：一颗圆润爱心
const heart = (c) => `
  <path d="M24 34 C16 27 12 23 12 19 C12 15.7 14.7 13 18 13 C20.5 13 22.7 14.4 24 16.4 C25.3 14.4 27.5 13 30 13 C33.3 13 36 15.7 36 19 C36 23 32 27 24 34 Z"
    fill="${c}" stroke="none"/>
  ${SPARKLE(c, 36, 12)}
`

// 5 坚持21天：一只小时钟
const clock = (c) => `
  <circle cx="24" cy="24" r="13"/>
  <path d="M24 16.5 V24 L29.5 27.5"/>
  <circle cx="24" cy="24" r="1.8" fill="${c}" stroke="none"/>
  ${SPARKLE(c, 37, 12.5)}
`

// 6 月度满勤：一本打勾的小日历
const calendar = (c) => `
  <rect x="11" y="14" width="26" height="23" rx="5"/>
  <path d="M11 21 H37"/>
  <path d="M18 10.5 V16"/>
  <path d="M30 10.5 V16"/>
  <path d="M18 28 L22 32 L30 23.5"/>
  ${SPARKLE(c, 38, 38)}
`

// 7 力量补给（男生专属）：一只小哑铃
const dumbbell = (c) => `
  <g transform="rotate(-30 24 24)">
    <rect x="17.5" y="21.8" width="13" height="4.4" rx="2.2" fill="${c}" stroke="none"/>
    <rect x="11.5" y="16.5" width="5.5" height="15" rx="2.75" fill="${c}" stroke="none"/>
    <rect x="31" y="16.5" width="5.5" height="15" rx="2.75" fill="${c}" stroke="none"/>
  </g>
  ${SPARKLE(c, 37.5, 12)}
`

const PAINTERS = { 1: pencil, 2: sevenDots, 3: bowl, 4: heart, 5: clock, 6: calendar, 7: dumbbell }

// 兜底：一颗小星星
function star(c) {
  return `<path d="M24 12 L27.6 20.4 L36.6 21.1 L29.7 27 L31.7 35.8 L24 31.2 L16.3 35.8 L18.3 27 L11.4 21.1 L20.4 20.4 Z" fill="${c}" stroke="none"/>`
}

// 徽章 id + 颜色 -> 图标 data URI
export function getBadgeGlyph(id, color) {
  const c = color || '#72C8A0'
  const draw = PAINTERS[id] || star
  return paint(draw(c), c)
}
