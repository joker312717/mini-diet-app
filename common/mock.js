// 全局 mock 数据（暂不对接后端）
export const homeMock = {
  nickname: '小雅',
  // 生理期信息（periodEnabled 存储于本地缓存，默认开启）
  periodInfo: {
    phase: '经期',
    day: 2,
    tip: '优先好好吃饭，不追求掉秤'
  },
  // 今日热量
  calorie: {
    consumed: 1180,
    target: 1500
  },
  // 三大营养素（g）
  macros: {
    protein: 68,
    carbs: 122,
    fat: 36
  },
  // 连续规律减脂天数（>= 7 展示放纵餐提示卡片）
  consecutiveDays: 9
}

export const userMock = {
  nickname: '小雅',
  avatar: '',
  periodEnabled: true
}

// 录入饮食 mock
export const recordMock = {
  mealTypes: ['早餐', '午餐', '晚餐', '加餐'],
  // 用户标记的过敏食材
  allergicFoods: ['虾', '芒果'],
  // 食材库：热量与营养素均为每 100g 含量；cooling 表示偏寒凉食材
  foodLibrary: [
    { name: '米饭', calorie: 116, protein: 2.6, carbs: 25.9, fat: 0.3 },
    { name: '糙米饭', calorie: 111, protein: 2.6, carbs: 23.0, fat: 0.9 },
    { name: '燕麦', calorie: 377, protein: 15.0, carbs: 66.9, fat: 6.7 },
    { name: '全麦面包', calorie: 246, protein: 8.5, carbs: 44.5, fat: 3.2 },
    { name: '红薯', calorie: 86, protein: 1.6, carbs: 20.1, fat: 0.1 },
    { name: '玉米', calorie: 112, protein: 4.0, carbs: 22.8, fat: 1.2 },
    { name: '鸡蛋', calorie: 144, protein: 13.3, carbs: 2.8, fat: 8.8 },
    { name: '鸡胸肉', calorie: 133, protein: 19.4, carbs: 2.5, fat: 5.0 },
    { name: '牛肉', calorie: 125, protein: 20.2, carbs: 1.2, fat: 4.2 },
    { name: '鲈鱼', calorie: 105, protein: 18.6, carbs: 0.4, fat: 3.4 },
    { name: '虾', calorie: 93, protein: 18.6, carbs: 2.8, fat: 0.8 },
    { name: '三文鱼', calorie: 139, protein: 17.2, carbs: 0.0, fat: 7.8 },
    { name: '豆腐', calorie: 81, protein: 8.1, carbs: 4.2, fat: 3.7 },
    { name: '无糖豆浆', calorie: 31, protein: 3.0, carbs: 1.2, fat: 1.6 },
    { name: '低脂牛奶', calorie: 46, protein: 3.3, carbs: 5.0, fat: 1.3 },
    { name: '无糖酸奶', calorie: 62, protein: 3.1, carbs: 5.5, fat: 2.8 },
    { name: '西兰花', calorie: 36, protein: 4.1, carbs: 4.3, fat: 0.6 },
    { name: '菠菜', calorie: 28, protein: 2.6, carbs: 4.5, fat: 0.3 },
    { name: '黄瓜', calorie: 16, protein: 0.8, carbs: 2.9, fat: 0.2 },
    { name: '番茄', calorie: 20, protein: 0.9, carbs: 4.0, fat: 0.2 },
    { name: '苹果', calorie: 53, protein: 0.4, carbs: 13.7, fat: 0.3 },
    { name: '香蕉', calorie: 93, protein: 1.4, carbs: 22.0, fat: 0.2 },
    { name: '蓝莓', calorie: 57, protein: 0.7, carbs: 14.5, fat: 0.3 },
    { name: '西瓜', calorie: 31, protein: 0.6, carbs: 7.6, fat: 0.2, cooling: true },
    { name: '梨', calorie: 51, protein: 0.4, carbs: 13.3, fat: 0.2, cooling: true },
    { name: '绿豆汤', calorie: 45, protein: 1.8, carbs: 9.5, fat: 0.1, cooling: true },
    { name: '苦瓜', calorie: 22, protein: 1.0, carbs: 4.9, fat: 0.1, cooling: true },
    { name: '螃蟹', calorie: 103, protein: 17.5, carbs: 2.3, fat: 2.6, cooling: true },
    { name: '芒果', calorie: 65, protein: 0.6, carbs: 16.1, fat: 0.3 },
    // 主食与谷物（熟制为主）
    { name: '馒头', calorie: 223, protein: 7.0, carbs: 47.0, fat: 1.1 },
    { name: '花卷', calorie: 214, protein: 6.4, carbs: 45.6, fat: 1.0 },
    { name: '白粥', calorie: 46, protein: 1.1, carbs: 9.9, fat: 0.2 },
    { name: '小米粥', calorie: 46, protein: 1.4, carbs: 8.4, fat: 0.7 },
    { name: '面条', calorie: 137, protein: 4.5, carbs: 25.0, fat: 1.5 },
    { name: '米粉', calorie: 109, protein: 2.0, carbs: 24.9, fat: 0.2 },
    { name: '饺子', calorie: 240, protein: 8.0, carbs: 28.0, fat: 9.0 },
    { name: '包子', calorie: 227, protein: 8.0, carbs: 27.0, fat: 8.0 },
    { name: '土豆', calorie: 77, protein: 2.0, carbs: 17.2, fat: 0.2 },
    { name: '山药', calorie: 57, protein: 1.9, carbs: 12.4, fat: 0.2 },
    { name: '紫薯', calorie: 82, protein: 1.6, carbs: 18.9, fat: 0.2 },
    { name: '芋头', calorie: 56, protein: 2.2, carbs: 12.7, fat: 0.2 },
    { name: '藜麦', calorie: 120, protein: 4.4, carbs: 21.3, fat: 1.9 },
    { name: '意大利面', calorie: 158, protein: 5.8, carbs: 30.9, fat: 0.9 },
    // 肉禽
    { name: '猪里脊', calorie: 155, protein: 20.2, carbs: 0.7, fat: 7.9 },
    { name: '五花肉', calorie: 518, protein: 9.1, carbs: 0.0, fat: 53.0 },
    { name: '红烧肉', calorie: 500, protein: 13.0, carbs: 5.0, fat: 48.0 },
    { name: '羊肉', calorie: 203, protein: 19.0, carbs: 0.0, fat: 14.1 },
    { name: '鸡腿', calorie: 181, protein: 16.0, carbs: 0.0, fat: 13.0 },
    { name: '鸡翅', calorie: 194, protein: 17.4, carbs: 4.6, fat: 11.8 },
    { name: '鸭肉', calorie: 240, protein: 15.5, carbs: 0.2, fat: 19.7 },
    { name: '培根', calorie: 541, protein: 37.0, carbs: 1.4, fat: 45.0 },
    { name: '火腿', calorie: 330, protein: 16.0, carbs: 4.9, fat: 27.4 },
    { name: '香肠', calorie: 508, protein: 24.1, carbs: 11.2, fat: 40.7 },
    // 水产
    { name: '鳕鱼', calorie: 88, protein: 20.4, carbs: 0.5, fat: 0.5 },
    { name: '带鱼', calorie: 127, protein: 17.7, carbs: 3.1, fat: 4.9 },
    { name: '鱿鱼', calorie: 84, protein: 17.4, carbs: 3.0, fat: 1.4 },
    { name: '蛤蜊', calorie: 62, protein: 10.1, carbs: 2.8, fat: 1.1 },
    { name: '金枪鱼', calorie: 116, protein: 25.0, carbs: 0.0, fat: 1.0 },
    // 蛋奶豆制品
    { name: '蛋白', calorie: 60, protein: 11.6, carbs: 3.1, fat: 0.1 },
    { name: '鹌鹑蛋', calorie: 160, protein: 12.8, carbs: 2.1, fat: 11.1 },
    { name: '全脂牛奶', calorie: 65, protein: 3.3, carbs: 4.9, fat: 3.6 },
    { name: '奶酪', calorie: 328, protein: 25.7, carbs: 3.5, fat: 23.5 },
    { name: '豆腐干', calorie: 142, protein: 16.2, carbs: 11.5, fat: 7.2 },
    { name: '腐竹', calorie: 461, protein: 44.6, carbs: 22.3, fat: 21.7 },
    { name: '毛豆', calorie: 131, protein: 13.1, carbs: 10.5, fat: 5.0 },
    { name: '千张', calorie: 260, protein: 24.5, carbs: 5.5, fat: 16.0 },
    // 蔬菜
    { name: '生菜', calorie: 15, protein: 1.4, carbs: 2.0, fat: 0.3 },
    { name: '大白菜', calorie: 17, protein: 1.5, carbs: 3.2, fat: 0.1 },
    { name: '油麦菜', calorie: 15, protein: 1.4, carbs: 2.1, fat: 0.4 },
    { name: '胡萝卜', calorie: 39, protein: 1.0, carbs: 8.8, fat: 0.2 },
    { name: '洋葱', calorie: 40, protein: 1.1, carbs: 9.0, fat: 0.2 },
    { name: '青椒', calorie: 22, protein: 1.0, carbs: 5.4, fat: 0.2 },
    { name: '茄子', calorie: 23, protein: 1.1, carbs: 4.9, fat: 0.2 },
    { name: '香菇', calorie: 26, protein: 2.2, carbs: 5.2, fat: 0.3 },
    { name: '金针菇', calorie: 32, protein: 2.4, carbs: 6.0, fat: 0.4 },
    { name: '海带', calorie: 13, protein: 1.2, carbs: 2.1, fat: 0.1 },
    { name: '南瓜', calorie: 23, protein: 0.7, carbs: 5.3, fat: 0.1 },
    { name: '芦笋', calorie: 22, protein: 2.6, carbs: 4.9, fat: 0.1 },
    { name: '芹菜', calorie: 17, protein: 0.8, carbs: 3.9, fat: 0.1 },
    { name: '四季豆', calorie: 34, protein: 2.5, carbs: 6.7, fat: 0.3 },
    { name: '莲藕', calorie: 73, protein: 1.9, carbs: 16.4, fat: 0.2 },
    // 水果
    { name: '橙子', calorie: 48, protein: 0.8, carbs: 11.1, fat: 0.2 },
    { name: '葡萄', calorie: 44, protein: 0.5, carbs: 10.3, fat: 0.2 },
    { name: '草莓', calorie: 32, protein: 1.0, carbs: 7.1, fat: 0.2 },
    { name: '猕猴桃', calorie: 61, protein: 0.8, carbs: 14.5, fat: 0.6 },
    { name: '火龙果', calorie: 55, protein: 1.1, carbs: 13.3, fat: 0.2 },
    { name: '桃子', calorie: 42, protein: 0.6, carbs: 10.1, fat: 0.1 },
    { name: '圣女果', calorie: 25, protein: 0.9, carbs: 5.8, fat: 0.2 },
    // 坚果
    { name: '核桃', calorie: 646, protein: 14.9, carbs: 19.1, fat: 58.8 },
    { name: '杏仁', calorie: 578, protein: 21.2, carbs: 21.6, fat: 49.9 },
    { name: '花生', calorie: 574, protein: 24.8, carbs: 21.7, fat: 44.3 },
    { name: '腰果', calorie: 559, protein: 17.3, carbs: 30.2, fat: 43.9 },
    // 常见家常菜
    { name: '番茄炒蛋', calorie: 90, protein: 5.5, carbs: 4.0, fat: 6.2 },
    { name: '宫保鸡丁', calorie: 200, protein: 14.0, carbs: 9.0, fat: 12.0 },
    { name: '鱼香肉丝', calorie: 190, protein: 12.0, carbs: 8.0, fat: 11.0 },
    { name: '麻婆豆腐', calorie: 135, protein: 8.0, carbs: 6.0, fat: 8.5 },
    { name: '清蒸鲈鱼', calorie: 110, protein: 17.5, carbs: 1.0, fat: 4.0 },
    { name: '蒜蓉西兰花', calorie: 62, protein: 3.5, carbs: 5.0, fat: 3.5 },
    { name: '蛋炒饭', calorie: 186, protein: 5.5, carbs: 25.0, fat: 6.0 },
    { name: '牛肉面', calorie: 130, protein: 7.5, carbs: 18.0, fat: 3.5 },
    { name: '凉皮', calorie: 130, protein: 3.0, carbs: 24.0, fat: 3.0 },
    { name: '炸鸡', calorie: 280, protein: 20.0, carbs: 12.0, fat: 17.0 },
    { name: '薯条', calorie: 312, protein: 3.4, carbs: 41.0, fat: 15.0 },
    // 饮品与零食
    { name: '美式咖啡', calorie: 2, protein: 0.3, carbs: 0.0, fat: 0.0 },
    { name: '拿铁咖啡', calorie: 55, protein: 3.0, carbs: 5.0, fat: 3.0 },
    { name: '可乐', calorie: 43, protein: 0.0, carbs: 10.8, fat: 0.0 },
    { name: '奶茶', calorie: 60, protein: 1.0, carbs: 9.0, fat: 2.0 },
    { name: '橙汁', calorie: 45, protein: 0.7, carbs: 10.4, fat: 0.2 },
    { name: '薯片', calorie: 536, protein: 7.0, carbs: 49.0, fat: 34.0 },
    { name: '黑巧克力', calorie: 589, protein: 7.8, carbs: 45.9, fat: 42.6 },
    { name: '蛋糕', calorie: 347, protein: 6.0, carbs: 44.0, fat: 15.0 },
    { name: '苏打饼干', calorie: 435, protein: 8.0, carbs: 70.0, fat: 12.0 },
    { name: '白面包', calorie: 312, protein: 8.5, carbs: 58.6, fat: 3.1 }
  ]
}

// 饮食记录历史 mock（结构与录入页保存的 dietRecords 一致）
const DAY_MS = 24 * 60 * 60 * 1000
const daysAgoAt = (daysAgo, h, m) => {
  const d = new Date(Date.now() - daysAgo * DAY_MS)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}
export const recordHistoryMock = [
  // 昨天
  {
    id: 'm1',
    mealType: '早餐',
    time: daysAgoAt(1, 8, 12),
    items: [
      { name: '燕麦', weight: 50, calorie: 189 },
      { name: '鸡蛋', weight: 60, calorie: 86 },
      { name: '低脂牛奶', weight: 250, calorie: 115 }
    ],
    totals: { calorie: 390, protein: 23.8, carbs: 47.7, fat: 12.0 }
  },
  {
    id: 'm2',
    mealType: '午餐',
    time: daysAgoAt(1, 12, 30),
    items: [
      { name: '糙米饭', weight: 200, calorie: 222 },
      { name: '鸡胸肉', weight: 120, calorie: 160 },
      { name: '西兰花', weight: 150, calorie: 54 }
    ],
    totals: { calorie: 436, protein: 34.7, carbs: 55.5, fat: 8.7 }
  },
  {
    id: 'm3',
    mealType: '晚餐',
    time: daysAgoAt(1, 18, 45),
    items: [
      { name: '红薯', weight: 180, calorie: 155 },
      { name: '鲈鱼', weight: 120, calorie: 126 },
      { name: '菠菜', weight: 150, calorie: 42 }
    ],
    totals: { calorie: 323, protein: 29.1, carbs: 43.5, fat: 4.8 }
  },
  {
    id: 'm4',
    mealType: '加餐',
    time: daysAgoAt(1, 15, 20),
    items: [{ name: '苹果', weight: 200, calorie: 106 }],
    totals: { calorie: 106, protein: 0.8, carbs: 27.4, fat: 0.6 }
  },
  // 前天
  {
    id: 'm5',
    mealType: '早餐',
    time: daysAgoAt(2, 7, 50),
    items: [
      { name: '全麦面包', weight: 80, calorie: 197 },
      { name: '无糖豆浆', weight: 300, calorie: 93 }
    ],
    totals: { calorie: 290, protein: 15.8, carbs: 39.2, fat: 7.4 }
  },
  {
    id: 'm6',
    mealType: '午餐',
    time: daysAgoAt(2, 12, 10),
    items: [
      { name: '米饭', weight: 180, calorie: 209 },
      { name: '牛肉', weight: 100, calorie: 125 },
      { name: '番茄', weight: 150, calorie: 30 }
    ],
    totals: { calorie: 364, protein: 26.3, carbs: 53.8, fat: 5.0 }
  },
  {
    id: 'm7',
    mealType: '晚餐',
    time: daysAgoAt(2, 19, 5),
    items: [
      { name: '玉米', weight: 200, calorie: 224 },
      { name: '豆腐', weight: 150, calorie: 122 },
      { name: '黄瓜', weight: 150, calorie: 24 }
    ],
    totals: { calorie: 370, protein: 21.4, carbs: 56.3, fat: 8.3 }
  },
  {
    id: 'm8',
    mealType: '加餐',
    time: daysAgoAt(2, 16, 40),
    items: [
      { name: '香蕉', weight: 120, calorie: 112 },
      { name: '蓝莓', weight: 100, calorie: 57 }
    ],
    totals: { calorie: 169, protein: 2.4, carbs: 40.9, fat: 0.5 }
  }
]

// 忌口食材管理 mock
export const avoidMock = {
  // 过敏食材
  allergic: ['虾', '芒果'],
  // 手动添加的不爱吃食材
  dislike: ['香菜'],
  // 偏好标签：勾选后其食材自动归类为忌口
  prefTags: [
    { key: 'vegetarian', label: '素食', foods: ['牛肉', '鸡胸肉', '鲈鱼', '虾', '三文鱼', '螃蟹'] },
    { key: 'noRedMeat', label: '不吃红肉', foods: ['牛肉'] },
    { key: 'noSeafood', label: '不吃海鲜', foods: ['虾', '鲈鱼', '三文鱼', '螃蟹'] },
    { key: 'noOffal', label: '不吃动物内脏', foods: ['猪肝', '鸡胗', '鸭血'] }
  ]
}

// 生理期管理 mock
const pad2 = (n) => String(n).padStart(2, '0')
const fmtYmd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
export const periodMock = {
  // 默认设置：末次月经为昨天（即经期第2天，与首页 mock 一致）
  settings: {
    lastDate: fmtYmd(new Date(Date.now() - DAY_MS)),
    cycleDays: 28,
    periodDays: 5
  },
  // 各生理阶段提示与科普
  phases: {
    经期: {
      tip: '优先好好吃饭，不追求掉秤',
      science: '经期身体较虚弱，建议优先温热、富含铁的食物，如瘦肉、菠菜、红枣；避免剧烈运动，注意保暖和休息。'
    },
    卵泡期: {
      tip: '代谢回升，适合安排运动',
      science: '卵泡期雌激素上升，精力与代谢状态较好，可适当增加运动量，同时保证蛋白质摄入充足。'
    },
    排卵期: {
      tip: '状态在线，保持规律饮食',
      science: '排卵期体温略升，保持清淡均衡的饮食，多喝水、少熬夜，让好状态延续。'
    },
    黄体期: {
      tip: '容易嘴馋，允许小幅放松',
      science: '黄体期容易水肿和嘴馋，建议少盐少糖，主食可选粗粮；情绪波动时，记得给自己多一点耐心。'
    }
  }
}

// 每日复盘报告 mock
export const reviewMock = {
  targetCalorie: 1500,
  // 近7天热量基线（当天与前一天优先使用真实记录，无记录时回退到这里）
  weekCalories: [
    { daysAgo: 6, calorie: 1350 },
    { daysAgo: 5, calorie: 1420 },
    { daysAgo: 4, calorie: 1180 },
    { daysAgo: 3, calorie: 1510 },
    { daysAgo: 2, calorie: 1290 },
    { daysAgo: 1, calorie: 0 },
    { daysAgo: 0, calorie: 0 }
  ],
  // 不同生理阶段的复盘文案（语气温和，不制造身材焦虑）
  phaseTexts: {
    normal: {
      label: '普通减脂期',
      summary: '今天的节奏很稳。减脂不在于某一天多完美，而在于每一天都算数。',
      suggestions: ['三餐规律，加餐优先水果或无糖酸奶', '喝水满8杯', '晚餐尽量在睡前3小时完成']
    },
    period: {
      label: '经期',
      summary: '身体正在努力运转，吃得暖和、规律就是满分表现，不必盯着热量数字。',
      suggestions: ['优先温热好消化的食物，如小米粥、炖汤', '适当补充富含铁的食物，如瘦肉、菠菜', '今天不追求热量缺口，吃饱睡好更重要']
    },
    prePeriod: {
      label: '经前期',
      summary: '经前期容易嘴馋和水肿，你已经做得很棒了，允许自己小幅放松。',
      suggestions: ['主食可选粗粮，饱腹感更持久', '少盐少糖，帮助缓解水肿', '想吃东西时先喝杯温水，等10分钟再决定']
    },
    golden: {
      label: '经后黄金期',
      summary: '这段时间代谢状态很好，保持规律饮食、搭配适量运动，效率会更高。',
      suggestions: ['蛋白质吃够，如鸡蛋、鱼虾、豆制品', '可以安排一些喜欢的运动', '保持记录习惯，状态会越来越稳']
    }
  }
}

// 激励页 mock
export const motivateMock = {
  // 激励语录（可换一句）
  quotes: [
    '好好吃饭，是对自己最温柔的照顾。',
    '不追求快，只追求稳，坚持就会看到改变。',
    '经期也可以好好吃饭，你的身体值得被善待。',
    '偶尔放纵不可怕，放弃才可怕。',
    '每一餐的规律，都是在为未来的自己储蓄健康。',
    '减重不是惩罚自己，而是学会爱自己。',
    '慢一点没关系，别停下来就好。',
    '身体不是敌人，别用饿来惩罚它。',
    '今天的自律，不会辜负明天的你。',
    '一顿吃多不算失败，只算一顿饭。',
    '把饭吃得香一点，把日子过得轻一点。',
    '稳定的习惯，胜过偶尔的狠劲。',
    '你不是在变瘦，你是在变健康。',
    '每记录一次，就多了解自己一点。'
  ],
  // 连续打卡天数（不含今天，打卡后 +1）
  streakDays: 8,
  // 本周打卡情况（周一 ~ 周日）
  weekCheckins: [true, true, true, false, true, true, false],
  // 成就徽章（condition 解锁条件 / intro 介绍说明）
  badges: [
    { id: 1, icon: 'edit-pen-fill', name: '初次记录', condition: '完成第1次饮食记录', intro: '迈出记录的第一步，就是改变的开始。', unlocked: true },
    { id: 2, icon: 'calendar-fill', name: '连续7天', condition: '连续打卡满7天', intro: '七天的坚持，正在悄悄变成习惯。', unlocked: true },
    { id: 3, icon: 'order', name: '配餐达人', condition: '收藏3套配餐方案', intro: '懂得搭配的人，减脂路上从不挨饿。', unlocked: true },
    { id: 4, icon: 'heart-fill', name: '贴心呵护', condition: '开启生理期管理', intro: '学会倾听身体的声音，也是一种自律。', unlocked: true },
    { id: 5, icon: 'clock-fill', name: '坚持21天', condition: '连续打卡满21天', intro: '21天养成一个习惯，你正在路上。', unlocked: false, progress: '8/21' },
    { id: 6, icon: 'star-fill', name: '月度满勤', condition: '单月打卡满30天', intro: '满勤不是目标，而是你认真的样子。', unlocked: false, progress: '9/30' },
    { id: 7, icon: 'thumb-up-fill', name: '力量补给', condition: '单日蛋白质达标累计30天', intro: '把蛋白质吃够，状态和力气都会回来。', unlocked: false, progress: '6/30', maleOnly: true }
  ],
  // 达标鼓励文案（区分普通 / 经期版本）
  achieveText: {
    normal: '太棒了！每一次认真记录，都是在靠近更好的自己。继续保持这份节奏～',
    period: '经期中也坚持好好照顾自己，真的很了不起。放轻松，你做得很好～'
  }
}

// 智能配餐 mock
export const mealMock = {
  targetCalorie: 1500,
  // 忌口食材清单：往数组里加食材名（如 '白灼虾'），含该食材的方案将被过滤，
  // 当可用方案不足 4 套时，页面会展示灰色提示条
  avoidFoods: [],
  // 同类型备选食材库（用于点击食材后的替换弹窗）
  ingredientPool: {
    主食: [
      { name: '糙米饭', calorie: 180 },
      { name: '燕麦', calorie: 150 },
      { name: '全麦面包', calorie: 160 },
      { name: '玉米', calorie: 150 },
      { name: '红薯', calorie: 130 },
      { name: '荞麦面', calorie: 210 },
      { name: '藜麦饭', calorie: 170 },
      { name: '小米粥', calorie: 120 },
      { name: '杂粮饭', calorie: 180 },
      { name: '魔芋米饭', calorie: 60 },
      { name: '蒸南瓜', calorie: 90 }
    ],
    蛋白: [
      { name: '水煮蛋', calorie: 70 },
      { name: '清蒸鲈鱼', calorie: 150 },
      { name: '白灼虾', calorie: 110 },
      { name: '香煎鸡胸', calorie: 220 },
      { name: '卤牛肉', calorie: 180 },
      { name: '清蒸鳕鱼', calorie: 140 },
      { name: '豆腐', calorie: 110 },
      { name: '无糖酸奶', calorie: 60 },
      { name: '无糖豆浆', calorie: 90 },
      { name: '低脂牛奶', calorie: 80 }
    ],
    蔬菜: [
      { name: '凉拌黄瓜', calorie: 30 },
      { name: '蒜蓉西兰花', calorie: 60 },
      { name: '清炒时蔬', calorie: 50 },
      { name: '菠菜', calorie: 45 },
      { name: '芦笋', calorie: 40 },
      { name: '生菜', calorie: 25 },
      { name: '炒油麦菜', calorie: 45 },
      { name: '冬瓜', calorie: 25 }
    ],
    水果: [
      { name: '苹果', calorie: 80 },
      { name: '蓝莓', calorie: 60 },
      { name: '柚子', calorie: 70 },
      { name: '奇异果', calorie: 60 },
      { name: '香蕉', calorie: 90 },
      { name: '橙子', calorie: 70 }
    ]
  },
  // 方案模板池（页面最多展示 4 套）
  planPool: [
    {
      id: 1,
      name: '家常清淡版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '燕麦牛奶粥', calorie: 220, type: '主食' },
            { name: '水煮蛋', calorie: 70, type: '蛋白' },
            { name: '凉拌黄瓜', calorie: 30, type: '蔬菜' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '糙米饭', calorie: 180, type: '主食' },
            { name: '清蒸鲈鱼', calorie: 150, type: '蛋白' },
            { name: '蒜蓉西兰花', calorie: 60, type: '蔬菜' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '小米南瓜粥', calorie: 160, type: '主食' },
            { name: '白灼虾', calorie: 110, type: '蛋白' },
            { name: '清炒时蔬', calorie: 50, type: '蔬菜' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '苹果', calorie: 80, type: '水果' },
            { name: '无糖酸奶', calorie: 60, type: '蛋白' }
          ]
        }
      ]
    },
    {
      id: 2,
      name: '外卖懒人版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '全麦三明治', calorie: 260, type: '主食' },
            { name: '无糖豆浆', calorie: 90, type: '蛋白' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '轻食鸡胸沙拉', calorie: 320, type: '蛋白' },
            { name: '玉米段', calorie: 110, type: '主食' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '番茄鸡蛋荞麦面', calorie: 380, type: '主食' },
            { name: '生菜', calorie: 25, type: '蔬菜' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '蓝莓', calorie: 60, type: '水果' },
            { name: '低脂牛奶', calorie: 80, type: '蛋白' }
          ]
        }
      ]
    },
    {
      id: 3,
      name: '高蛋白塑形版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '鸡蛋白', calorie: 90, type: '蛋白' },
            { name: '全麦面包', calorie: 160, type: '主食' },
            { name: '无糖酸奶', calorie: 60, type: '蛋白' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '香煎鸡胸', calorie: 220, type: '蛋白' },
            { name: '藜麦饭', calorie: 170, type: '主食' },
            { name: '菠菜', calorie: 45, type: '蔬菜' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '清蒸鳕鱼', calorie: 140, type: '蛋白' },
            { name: '红薯', calorie: 130, type: '主食' },
            { name: '芦笋', calorie: 40, type: '蔬菜' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '黄瓜条', calorie: 20, type: '蔬菜' },
            { name: '低脂牛奶', calorie: 80, type: '蛋白' }
          ]
        }
      ]
    },
    {
      id: 4,
      name: '高饱腹抗饿版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '玉米', calorie: 150, type: '主食' },
            { name: '水煮蛋', calorie: 70, type: '蛋白' },
            { name: '无糖豆浆', calorie: 90, type: '蛋白' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '荞麦面', calorie: 210, type: '主食' },
            { name: '卤牛肉', calorie: 180, type: '蛋白' },
            { name: '生菜', calorie: 25, type: '蔬菜' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '魔芋米饭', calorie: 60, type: '主食' },
            { name: '豆腐菌菇煲', calorie: 160, type: '蛋白' },
            { name: '炒油麦菜', calorie: 45, type: '蔬菜' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '柚子', calorie: 70, type: '水果' },
            { name: '凉拌黄瓜', calorie: 30, type: '蔬菜' }
          ]
        }
      ]
    },
    {
      id: 5,
      name: '低脂轻食版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '蔬菜蛋饼', calorie: 180, type: '蛋白' },
            { name: '小米粥', calorie: 120, type: '主食' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '金枪鱼沙拉', calorie: 240, type: '蛋白' },
            { name: '全麦意面', calorie: 200, type: '主食' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '冬瓜虾仁汤', calorie: 120, type: '蛋白' },
            { name: '蒸南瓜', calorie: 90, type: '主食' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '奇异果', calorie: 60, type: '水果' },
            { name: '低脂牛奶', calorie: 80, type: '蛋白' }
          ]
        }
      ]
    },
    {
      id: 6,
      name: '快手便当版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '三角饭团', calorie: 230, type: '主食' },
            { name: '溏心蛋', calorie: 75, type: '蛋白' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '照烧鸡腿便当', calorie: 350, type: '蛋白' },
            { name: '杂粮饭', calorie: 180, type: '主食' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '蔬菜豆腐汤', calorie: 110, type: '蛋白' },
            { name: '玉米', calorie: 150, type: '主食' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '香蕉', calorie: 90, type: '水果' },
            { name: '橙子', calorie: 70, type: '水果' }
          ]
        }
      ]
    },
    {
      id: 7,
      name: '中式食堂版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '小米粥', calorie: 120, type: '主食' },
            { name: '水煮蛋', calorie: 70, type: '蛋白' },
            { name: '凉拌黄瓜', calorie: 30, type: '蔬菜' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '杂粮饭', calorie: 180, type: '主食' },
            { name: '番茄炒蛋', calorie: 200, type: '蛋白' },
            { name: '清炒时蔬', calorie: 50, type: '蔬菜' },
            { name: '冬瓜排骨汤', calorie: 90, type: '蔬菜' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '荞麦面', calorie: 210, type: '主食' },
            { name: '卤牛肉', calorie: 180, type: '蛋白' },
            { name: '菠菜', calorie: 45, type: '蔬菜' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '苹果', calorie: 80, type: '水果' },
            { name: '无糖酸奶', calorie: 60, type: '蛋白' }
          ]
        }
      ]
    },
    {
      id: 8,
      name: '便利店速食版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '全麦三明治', calorie: 260, type: '主食' },
            { name: '无糖豆浆', calorie: 90, type: '蛋白' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '即食鸡胸', calorie: 180, type: '蛋白' },
            { name: '三角饭团', calorie: 230, type: '主食' },
            { name: '生菜沙拉', calorie: 60, type: '蔬菜' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '关东煮（萝卜海带）', calorie: 120, type: '蔬菜' },
            { name: '玉米', calorie: 150, type: '主食' },
            { name: '低脂牛奶', calorie: 80, type: '蛋白' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '无糖酸奶', calorie: 60, type: '蛋白' },
            { name: '蓝莓', calorie: 60, type: '水果' }
          ]
        }
      ]
    },
    {
      id: 9,
      name: '经期暖身版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '红枣小米粥', calorie: 200, type: '主食' },
            { name: '水煮蛋', calorie: 70, type: '蛋白' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '杂粮饭', calorie: 180, type: '主食' },
            { name: '番茄炖牛腩', calorie: 240, type: '蛋白' },
            { name: '清炒菠菜', calorie: 45, type: '蔬菜' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '南瓜小米粥', calorie: 160, type: '主食' },
            { name: '香菇鸡肉煲', calorie: 200, type: '蛋白' },
            { name: '芦笋', calorie: 40, type: '蔬菜' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '蒸苹果', calorie: 80, type: '水果' },
            { name: '温热低脂牛奶', calorie: 80, type: '蛋白' }
          ]
        }
      ]
    },
    {
      id: 10,
      name: '素食轻盈版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '燕麦', calorie: 150, type: '主食' },
            { name: '全麦面包', calorie: 160, type: '主食' },
            { name: '无糖豆浆', calorie: 90, type: '蛋白' },
            { name: '蓝莓', calorie: 60, type: '水果' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '藜麦饭', calorie: 170, type: '主食' },
            { name: '香煎豆腐', calorie: 180, type: '蛋白' },
            { name: '蒜蓉西兰花', calorie: 60, type: '蔬菜' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '魔芋米饭', calorie: 60, type: '主食' },
            { name: '豆腐菌菇煲', calorie: 160, type: '蛋白' },
            { name: '炒油麦菜', calorie: 45, type: '蔬菜' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '奇异果', calorie: 60, type: '水果' },
            { name: '香蕉', calorie: 90, type: '水果' },
            { name: '无糖酸奶', calorie: 60, type: '蛋白' }
          ]
        }
      ]
    },
    {
      id: 11,
      name: '周末慢煮版',

      meals: [
        {
          type: '早餐',
          items: [
            { name: '蔬菜蛋饼', calorie: 180, type: '蛋白' },
            { name: '低脂牛奶', calorie: 80, type: '蛋白' },
            { name: '橙子', calorie: 70, type: '水果' }
          ]
        },
        {
          type: '午餐',
          items: [
            { name: '杂粮饭', calorie: 180, type: '主食' },
            { name: '清蒸鲈鱼', calorie: 150, type: '蛋白' },
            { name: '蒜蓉西兰花', calorie: 60, type: '蔬菜' },
            { name: '芦笋', calorie: 40, type: '蔬菜' }
          ]
        },
        {
          type: '晚餐',
          items: [
            { name: '红薯', calorie: 130, type: '主食' },
            { name: '香煎鸡胸', calorie: 220, type: '蛋白' },
            { name: '清炒时蔬', calorie: 50, type: '蔬菜' }
          ]
        },
        {
          type: '加餐',
          items: [
            { name: '无糖酸奶', calorie: 60, type: '蛋白' },
            { name: '蓝莓', calorie: 60, type: '水果' }
          ]
        }
      ]
    }
  ]
}
