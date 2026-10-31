// 小宠物状态逻辑：根据打卡与热量记录推导情绪和体型
import { homeMock } from './mock.js'

const PET_KEY = 'petState'
const RECORDS_KEY = 'dietRecords'
const FEED_KEY = 'petFeedState'
const TOUCH_KEY = 'petTouchState'
const PLAY_KEY = 'petPlayState'
const FEED_LIMIT = 3
const TOUCH_LIMIT = 5
const PLAY_LIMIT = 3
const DAY_MS = 24 * 60 * 60 * 1000

const pad2 = (n) => String(n).padStart(2, '0')
const fmt = (t) => {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// 读取已领养的宠物信息
export function getPet() {
  const saved = uni.getStorageSync(PET_KEY)
  if (saved && saved.adopted) return saved
  return { adopted: false, name: '团团', adoptedAt: 0 }
}

// 领养 / 改名
export function adoptPet(name) {
  const pet = { adopted: true, name: name || '团团', adoptedAt: Date.now() }
  uni.setStorageSync(PET_KEY, pet)
  return pet
}

export function renamePet(name) {
  const pet = getPet()
  if (!pet.adopted || !name) return pet
  const next = { ...pet, name }
  uni.setStorageSync(PET_KEY, next)
  return next
}

// 今日投喂次数（跨天自动清零）
function getFeedState() {
  const saved = uni.getStorageSync(FEED_KEY)
  const today = fmt(Date.now())
  if (!saved || saved.date !== today) return { date: today, count: 0 }
  return saved
}

// 投喂：每天最多 3 次，每次亲密度 +1
export function feedPet() {
  const pet = getPet()
  if (!pet.adopted) return { ok: false, msg: '先领养一只小宠物吧' }
  const feed = getFeedState()
  if (feed.count >= FEED_LIMIT) {
    return { ok: false, msg: '它今天吃得饱饱的啦，明天再来投喂' }
  }
  const nextFeed = { date: feed.date, count: feed.count + 1 }
  uni.setStorageSync(FEED_KEY, nextFeed)
  const nextPet = { ...pet, love: (pet.love || 0) + 1 }
  uni.setStorageSync(PET_KEY, nextPet)
  return { ok: true, count: nextFeed.count, limit: FEED_LIMIT }
}

// 今日摸摸头次数（跨天自动清零）
function getTouchState() {
  const saved = uni.getStorageSync(TOUCH_KEY)
  const today = fmt(Date.now())
  if (!saved || saved.date !== today) return { date: today, count: 0 }
  return saved
}

// 摸摸头：每天最多 5 次，每次亲密度 +1
export function petPet() {
  const pet = getPet()
  if (!pet.adopted) return { ok: false, msg: '先领养一只小宠物吧' }
  const touch = getTouchState()
  if (touch.count >= TOUCH_LIMIT) {
    return { ok: false, msg: '它今天被摸得很满足啦，明天再来' }
  }
  const nextTouch = { date: touch.date, count: touch.count + 1 }
  uni.setStorageSync(TOUCH_KEY, nextTouch)
  const nextPet = { ...pet, love: (pet.love || 0) + 1 }
  uni.setStorageSync(PET_KEY, nextPet)
  return { ok: true, count: nextTouch.count, limit: TOUCH_LIMIT }
}

// 陪它玩：每天最多 3 次，每次亲密度 +1
export function playPet() {
  const pet = getPet()
  if (!pet.adopted) return { ok: false, msg: '先领养一只小宠物吧' }
  const saved = uni.getStorageSync(PLAY_KEY)
  const today = fmt(Date.now())
  const play = saved && saved.date === today ? saved : { date: today, count: 0 }
  if (play.count >= PLAY_LIMIT) {
    return { ok: false, msg: '它玩累啦，休息一下明天再玩' }
  }
  const nextPlay = { date: play.date, count: play.count + 1 }
  uni.setStorageSync(PLAY_KEY, nextPlay)
  const nextPet = { ...pet, love: (pet.love || 0) + 1 }
  uni.setStorageSync(PET_KEY, nextPet)
  return { ok: true, count: nextPlay.count, limit: PLAY_LIMIT }
}

// 装扮清单：按亲密度解锁
export const ACCESSORIES = [
  { key: 'none', name: '不戴', love: 0 },
  { key: 'scarf', name: '小围巾', love: 5 },
  { key: 'crown', name: '小皇冠', love: 15 },
  { key: 'bow', name: '蝴蝶结', love: 30 },
  { key: 'cape', name: '小斗篷', love: 50 },
  { key: 'flower', name: '花环', love: 70 },
  { key: 'glasses', name: '圆框眼镜', love: 90 },
  { key: 'wings', name: '小翅膀', love: 120 },
  { key: 'bag', name: '小挎包', love: 150 }
]

// 换装：未达亲密度会被拦下
export function setAccessory(key) {
  const pet = getPet()
  if (!pet.adopted) return { ok: false, msg: '先领养一只小宠物吧' }
  const item = ACCESSORIES.find((a) => a.key === key) || ACCESSORIES[0]
  if ((pet.love || 0) < item.love) {
    return { ok: false, msg: `亲密度达到 ${item.love} 才能解锁${item.name}` }
  }
  uni.setStorageSync(PET_KEY, { ...pet, accessory: item.key })
  return { ok: true }
}

// 宠物随口说的话，按当前情绪分组
const PET_LINES = {
  angry: [
    '今天还没记录，我有点小情绪…',
    '别灰心，先记一顿就好啦',
    '摸一下我，我们就和好吧',
    '我等的不是你完美，是你来记录',
    '先喝口水，回来再补也不迟',
    '不记录也没关系，但我有点想你',
    '今天想吃点什么？我陪你一起算',
    '就算今天乱糟糟，明天也可以重来'
  ],
  happy: [
    '打卡成功！我举牌给你看～',
    '你今天很自律，我很开心',
    '明天也要记得记录哦',
    '给你比个心，接住啦',
    '今天这一步，走得很漂亮',
    '奖励你一颗小星星',
    '被你认真对待的感觉真好',
    '这样稳稳地过日子，最可爱'
  ],
  fat: [
    '吃多了也没关系，慢慢来',
    '抱抱云朵，明天清淡一点',
    '我陪你一起瘦回去',
    '偶尔一顿，不定义你',
    '肚子圆圆的也挺可爱嘛',
    '别自责啦，我抱抱你',
    '明天早餐清淡些，我们重新出发',
    '少喝一杯甜饮，比饿一顿更有用'
  ],
  slim: [
    '连续达标，状态真棒',
    '记得喝水呀',
    '我好像又轻了一点，嘿嘿',
    '这样稳稳地吃，最不容易反弹',
    '你今天也很努力，我看得见',
    '蛋白质够不够？我盯着呢',
    '一起把好状态存起来',
    '走路都轻飘飘的～'
  ]
}

export function randomLine(mood) {
  const list = PET_LINES[mood] || PET_LINES.happy
  return list[Math.floor(Math.random() * list.length)]
}

// 计算宠物当前的形态与文案
export function computePetState() {
  const pet = getPet()
  const records = uni.getStorageSync(RECORDS_KEY) || []
  const savedTarget = Number(uni.getStorageSync('calorieTarget'))
  const target =
    savedTarget >= 800 && savedTarget <= 3000 ? savedTarget : homeMock.calorie.target

  // 按天汇总热量
  const dayMap = {}
  const daySet = {}
  records.forEach((r) => {
    if (!r || !r.time) return
    const key = fmt(r.time)
    const cal = (r.totals && r.totals.calorie) || 0
    dayMap[key] = (dayMap[key] || 0) + cal
    daySet[key] = true
  })

  const todayKey = fmt(Date.now())
  const todayCalorie = Math.round(dayMap[todayKey] || 0)
  // 打卡按钮写入的是「2026-10-5」这种未补零格式，统一补零后再比较
  const checkParts = String(uni.getStorageSync('lastCheckInDate') || '').split('-')
  const checkinKey =
    checkParts.length === 3
      ? `${checkParts[0]}-${pad2(Number(checkParts[1]) || 0)}-${pad2(Number(checkParts[2]) || 0)}`
      : ''
  const checkedIn = !!daySet[todayKey] || checkinKey === todayKey
  const overLine = Math.round(target * 1.1)

  // 连续达标天数（今天未打卡时从昨天往前算）
  let streak = 0
  const start = checkedIn ? 0 : 1
  for (let i = start; i < 60; i++) {
    const key = fmt(Date.now() - i * DAY_MS)
    const cal = dayMap[key]
    if (daySet[key] && cal <= target * 1.05) {
      streak++
    } else {
      break
    }
  }

  // 情绪与体型：未打卡就生气 > 热量超标就发胖 > 连续自律就变瘦 > 打卡就开心
  let mood = 'happy'
  if (!checkedIn) mood = 'angry'
  else if (todayCalorie > overLine) mood = 'fat'
  else if (streak >= 3) mood = 'slim'

  const body = mood === 'fat' ? 'fat' : mood === 'slim' ? 'slim' : 'normal'

  const statusText = {
    angry: '还没打卡，先递张纸巾给你',
    happy: '打卡成功，正在举牌庆祝',
    fat: '今天吃多了，抱着云朵歇一歇',
    slim: '连着自律，抱着水杯提醒你喝水'
  }[mood]

  const tip = {
    angry: '别灰心，随手记一顿就好，我陪着你',
    happy: '你做到了，明天也记得按时记录哦',
    fat: '明天少吃点高热量小零食，陪我慢慢瘦回去',
    slim: '状态真棒，多喝水、蛋白质吃够，继续保持'
  }[mood]

  const feed = getFeedState()
  const touch = getTouchState()
  const savedPlay = uni.getStorageSync(PLAY_KEY)
  const play =
    savedPlay && savedPlay.date === fmt(Date.now())
      ? savedPlay
      : { date: fmt(Date.now()), count: 0 }
  const love = pet.love || 0
  // 装扮解锁进度
  const accessories = ACCESSORIES.map((a) => ({ ...a, unlocked: love >= a.love }))
  const nextItem = accessories.find((a) => !a.unlocked)

  return {
    adopted: pet.adopted,
    name: pet.name,
    mood,
    body,
    statusText,
    tip,
    todayCalorie,
    target,
    streak,
    overKcal: Math.max(0, todayCalorie - overLine),
    totalDays: Object.keys(daySet).length,
    love,
    level: Math.floor(love / 10) + 1,
    levelPercent: (love % 10) * 10,
    accessory: pet.accessory || 'none',
    accessories,
    nextUnlock: nextItem
      ? { name: nextItem.name, love: nextItem.love, remain: nextItem.love - love }
      : null,
    feedCount: feed.count,
    feedLimit: FEED_LIMIT,
    feedLeft: Math.max(0, FEED_LIMIT - feed.count),
    touchCount: touch.count,
    touchLimit: TOUCH_LIMIT,
    touchLeft: Math.max(0, TOUCH_LIMIT - touch.count),
    playCount: play.count,
    playLimit: PLAY_LIMIT,
    playLeft: Math.max(0, PLAY_LIMIT - play.count)
  }
}
