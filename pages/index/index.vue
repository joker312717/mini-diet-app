<template>
  <view class="page">
    <!-- 顶部：欢迎 + 日期 -->
    <view class="header">
      <view class="hello-wrap">
        <view class="hello">你好，{{ nickname }}</view>
        <view class="hello-sub">今天也好好吃饭吧</view>
      </view>
      <view class="date-pill">{{ todayText }}</view>
    </view>

    <!-- 生理期提示条（女生且开启时展示）；男生改为蛋白质补给 -->
    <view v-if="periodEnabled" class="period-banner">
      <text class="period-dot"></text>
      <text class="period-text">当前：{{ periodInfo.phase }}第{{ periodInfo.day }}天｜{{ periodInfo.tip }}</text>
    </view>
    <view v-else class="period-banner protein-banner">
      <text class="period-dot protein-dot"></text>
      <text class="period-text protein-text">蛋白质补给：今日 {{ macros.protein }}/{{ proteinTarget }}g｜{{ proteinShort }}</text>
    </view>

    <!-- 今日热量卡片 -->
    <view class="cal-card">
      <view class="cal-deco cal-deco-a"></view>
      <view class="cal-deco cal-deco-b"></view>
      <view class="cal-top">
        <view class="cal-consumed">
          <text class="cal-num">{{ calorie.consumed }}</text>
          <text class="cal-unit">kcal</text>
          <view class="cal-label">今日已摄入热量</view>
        </view>
        <view class="cal-target">
          <view class="cal-target-num">{{ calorie.target }}</view>
          <view class="cal-target-label">目标热量 kcal</view>
        </view>
      </view>
      <view class="progress">
        <view class="progress-inner" :style="{ width: calPercent + '%' }"></view>
      </view>
      <view class="macros">
        <text class="macro-item">蛋白 {{ macros.protein }}g</text>
        <text class="macro-divider">｜</text>
        <text class="macro-item">碳水 {{ macros.carbs }}g</text>
        <text class="macro-divider">｜</text>
        <text class="macro-item">脂肪 {{ macros.fat }}g</text>
      </view>
    </view>

    <!-- 四宫格功能 -->
    <view class="grid-card" hover-class="press-scale">
      <view
        class="grid-item"
        v-for="item in grids"
        :key="item.text"
        hover-class="grid-item-hover"
        @click="onGridClick(item)"
      >
        <view class="grid-icon">
          <u-icon v-if="item.text === '智能配餐'" name="order" color="#72C8A0" size="48rpx"></u-icon>
          <u-icon v-else-if="item.text === '录入饮食'" name="edit-pen" color="#E6A23C" size="48rpx"></u-icon>
          <u-icon v-else-if="item.text === '每日复盘'" name="file-text-fill" color="#72C8A0" size="48rpx"></u-icon>
          <u-icon v-else-if="item.text === '蛋白质补给'" name="thumb-up-fill" color="#72C8A0" size="48rpx"></u-icon>
          <u-icon v-else name="heart-fill" color="#E8B8C0" size="48rpx"></u-icon>
        </view>
        <view class="grid-text">{{ item.text }}</view>
      </view>
    </view>

    <!-- 放纵餐提示卡片（满足条件才展示） -->
    <view v-if="showCheatCard" class="cheat-card">
      <view class="cheat-title">
        <u-icon class="cheat-gift-icon" name="gift-fill" color="#E6A23C" size="32rpx"></u-icon>
        <text class="cheat-title-text">你已连续{{ consecutiveDays }}天规律减脂，可以安排一次科学放纵餐啦！适当放松更利于长期减脂不反弹</text>
      </view>
      <view class="cheat-actions">
        <view class="cheat-btn cheat-btn-primary" hover-class="btn-hover" @click="onViewCheatPlan">查看方案</view>
        <view class="cheat-btn cheat-btn-outline" hover-class="btn-hover" @click="onDelayCheat">延后2-3天</view>
        <view class="cheat-btn cheat-btn-text" hover-class="btn-hover" @click="onDismissCheat">本次不需要</view>
      </view>
    </view>

    <!-- 放纵餐方案弹窗 -->
    <u-popup
      :show="cheatPlanVisible"
      mode="bottom"
      :round="16"
      :safeAreaInsetBottom="true"
      closeable
      @close="closeCheatPlan"
    >
      <view class="plan">
        <scroll-view scroll-y class="plan-scroll" :show-scrollbar="false">
          <view class="plan-head">
            <view class="plan-badge">
              <u-icon name="gift-fill" color="#E6A23C" size="36rpx"></u-icon>
            </view>
            <view class="plan-head-text">
              <view class="plan-title">科学放纵餐方案</view>
              <view class="plan-sub">热量上限可放宽至 {{ cheatLimit }} kcal，建议安排在午餐</view>
            </view>
          </view>

          <view class="plan-block">
            <view class="plan-block-head">
              <view class="plan-block-title">
                <text class="plan-block-dot plan-block-dot-warm"></text>
                <text>放纵餐 · 三选一</text>
                <text class="plan-block-hint">{{ cheatKcalRange }} kcal</text>
              </view>
              <view class="plan-refresh" hover-class="plan-refresh-hover" @click="refreshCheatOptions">
                <u-icon name="reload" color="#72C8A0" size="24rpx"></u-icon>
                <text class="plan-refresh-text">{{ cheatOptionIndex + 1 }}/{{ cheatOptionSets.length }}</text>
              </view>
            </view>
            <view class="plan-option" v-for="(o, i) in cheatOptions" :key="i">
              <view class="plan-option-top">
                <text class="plan-option-index">{{ i + 1 }}</text>
                <text class="plan-option-name">{{ o.name }}</text>
                <text class="plan-option-kcal">{{ o.kcal }} kcal</text>
              </view>
              <view class="plan-chips">
                <text class="plan-chip" v-for="(item, ii) in o.items" :key="ii">
                  {{ item.name }}<text class="plan-chip-kcal">{{ item.kcal }}</text>
                </text>
              </view>
            </view>
          </view>

          <view class="plan-block">
            <view class="plan-block-head">
              <view class="plan-block-title">
                <text class="plan-block-dot"></text>
                <text>另外两餐 · 照常清淡</text>
                <text class="plan-block-hint">{{ lightMeal.total }} kcal</text>
              </view>
              <view class="plan-refresh" hover-class="plan-refresh-hover" @click="refreshLightMeals">
                <u-icon name="reload" color="#72C8A0" size="24rpx"></u-icon>
                <text class="plan-refresh-text">{{ lightMealIndex + 1 }}/{{ lightMealSets.length }}</text>
              </view>
            </view>

            <view class="plan-meal">
              <view class="plan-meal-head">
                <text class="plan-meal-tag">早餐</text>
                <text class="plan-meal-name">{{ lightMeal.breakfast.name }}</text>
                <text class="plan-meal-kcal">{{ lightMeal.breakfast.kcal }} kcal</text>
              </view>
              <view class="plan-chips">
                <text class="plan-chip" v-for="(item, ii) in lightMeal.breakfast.items" :key="ii">
                  {{ item.name }}<text class="plan-chip-kcal">{{ item.kcal }}</text>
                </text>
              </view>
            </view>

            <view class="plan-meal">
              <view class="plan-meal-head">
                <text class="plan-meal-tag">晚餐</text>
                <text class="plan-meal-name">{{ lightMeal.dinner.name }}</text>
                <text class="plan-meal-kcal">{{ lightMeal.dinner.kcal }} kcal</text>
              </view>
              <view class="plan-chips">
                <text class="plan-chip" v-for="(item, ii) in lightMeal.dinner.items" :key="ii">
                  {{ item.name }}<text class="plan-chip-kcal">{{ item.kcal }}</text>
                </text>
              </view>
            </view>
          </view>

          <view class="plan-sum">
            <text class="plan-sum-label">全天预估热量</text>
            <text class="plan-sum-value">{{ fullDayRange }} kcal</text>
          </view>

          <view class="plan-tip">不用严格照搬：主食换主食、蛋白换蛋白，蔬菜尽量保留，按自己口味替换同类食物即可。</view>
        </scroll-view>

        <view class="plan-btn" hover-class="plan-btn-hover" @click="closeCheatPlan">我知道了</view>
      </view>
    </u-popup>

    <!-- 蛋白质补给弹窗（男生专属入口） -->
    <u-popup :show="proteinVisible" mode="bottom" round="24" :safeAreaInsetBottom="true" @close="proteinVisible = false">
      <view class="protein-pop">
        <view class="protein-head">
          <u-icon name="thumb-up-fill" color="#72C8A0" size="44rpx"></u-icon>
          <text class="protein-title">蛋白质补给</text>
        </view>

        <view class="protein-nums">
          <text class="protein-cur">{{ macros.protein }}g</text>
          <text class="protein-goal">/ {{ proteinTarget }}g</text>
        </view>
        <view class="protein-bar">
          <view class="protein-fill" :style="{ width: proteinPercent + '%' }"></view>
        </view>
        <view class="protein-tip">{{ proteinTip }}</view>

        <view class="protein-list">
          <view class="protein-row" v-for="f in proteinFoods" :key="f.name">
            <text class="protein-food">{{ f.name }}</text>
            <text class="protein-g">蛋白 {{ f.protein }}g ｜ {{ f.portion }}</text>
          </view>
        </view>

        <view class="protein-btn" hover-class="btn-hover" @click="proteinVisible = false">知道了</view>
      </view>
    </u-popup>

    <footer-tip />
  </view>
</template>

<script>
import { homeMock } from '@/common/mock.js'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export default {
  data() {
    return {
      nickname: homeMock.nickname,
      periodEnabled: true,
      periodInfo: homeMock.periodInfo,
      calorie: homeMock.calorie,
      macros: homeMock.macros,
      consecutiveDays: homeMock.consecutiveDays,
      cheatDismissed: false,
      cheatPlanVisible: false,
      cheatOptionIndex: 0,
      // 每条放纵餐按「单品估算热量」拆分，总热量由 items 累加得出（不做硬编码）
      cheatOptionSets: [
        [
          {
            name: '番茄牛肉意面',
            items: [
              { name: '意面 1 份', kcal: 300 },
              { name: '番茄牛肉酱 1 份', kcal: 180 },
              { name: '田园沙拉 1 份', kcal: 90 },
              { name: '无糖气泡水', kcal: 0 }
            ]
          },
          {
            name: '寿司拼盘',
            items: [
              { name: '寿司 8 贯', kcal: 560 },
              { name: '味增汤 1 碗', kcal: 60 },
              { name: '无糖茶', kcal: 0 }
            ]
          },
          {
            name: '轻食汉堡',
            items: [
              { name: '汉堡 1 个（不加酱）', kcal: 560 },
              { name: '玉米杯 1 份', kcal: 110 },
              { name: '无糖可乐', kcal: 0 }
            ]
          }
        ],
        [
          {
            name: '清汤麻辣烫',
            items: [
              { name: '蔬菜 1 份', kcal: 90 },
              { name: '豆制品 1 份', kcal: 150 },
              { name: '瘦肉 1 份', kcal: 220 },
              { name: '清汤底 1 份', kcal: 110 },
              { name: '无糖茶', kcal: 0 }
            ]
          },
          {
            name: '披萨两块',
            items: [
              { name: '披萨 2 块', kcal: 560 },
              { name: '蔬菜沙拉 1 份', kcal: 90 },
              { name: '无糖气泡水', kcal: 0 }
            ]
          },
          {
            name: '烤肉套餐',
            items: [
              { name: '烤肉 150g', kcal: 450 },
              { name: '生菜包 1 份', kcal: 60 },
              { name: '大麦茶', kcal: 0 }
            ]
          }
        ],
        [
          {
            name: '牛肉面',
            items: [
              { name: '牛肉面 1 碗（少油）', kcal: 560 },
              { name: '烫青菜 1 份', kcal: 60 }
            ]
          },
          {
            name: '轻食沙拉碗',
            items: [
              { name: '鸡胸沙拉碗 1 份', kcal: 380 },
              { name: '全麦面包 1 片', kcal: 100 },
              { name: '无糖酸奶 1 杯', kcal: 80 }
            ]
          },
          {
            name: '寿司卷',
            items: [
              { name: '加州卷 8 块', kcal: 480 },
              { name: '味增汤 1 碗', kcal: 60 },
              { name: '无糖茶', kcal: 0 }
            ]
          }
        ],
        [
          {
            name: '炸鸡三块',
            items: [
              { name: '炸鸡 3 块（去皮）', kcal: 480 },
              { name: '萝卜泡菜 1 份', kcal: 30 },
              { name: '无糖可乐', kcal: 0 }
            ]
          },
          {
            name: '小龙虾盖饭',
            items: [
              { name: '小龙虾盖饭 半份', kcal: 480 },
              { name: '凉拌黄瓜 1 份', kcal: 40 }
            ]
          },
          {
            name: '三明治套餐',
            items: [
              { name: '全麦三明治 1 个', kcal: 380 },
              { name: '蔬菜沙拉 1 份', kcal: 60 },
              { name: '无糖豆浆 1 杯', kcal: 90 }
            ]
          }
        ],
        [
          {
            name: '清汤火锅',
            items: [
              { name: '火锅 1 人份（清汤）', kcal: 550 },
              { name: '蘸料 1 小碟', kcal: 60 },
              { name: '冬瓜蔬菜 1 份', kcal: 60 }
            ]
          },
          {
            name: '卤肉饭',
            items: [
              { name: '卤肉饭 1 小碗', kcal: 480 },
              { name: '烫青菜 1 份', kcal: 60 },
              { name: '无糖茶', kcal: 0 }
            ]
          },
          {
            name: '意式焗饭',
            items: [
              { name: '焗饭 半份', kcal: 420 },
              { name: '蔬菜汤 1 碗', kcal: 80 }
            ]
          }
        ],
        [
          {
            name: '荞麦面套餐',
            items: [
              { name: '荞麦冷面 1 份', kcal: 420 },
              { name: '溏心蛋 1 个', kcal: 80 },
              { name: '无糖茶', kcal: 0 }
            ]
          },
          {
            name: '烤鸡腿饭',
            items: [
              { name: '烤鸡腿 1 只（去皮）', kcal: 380 },
              { name: '糙米饭 半碗', kcal: 130 },
              { name: '生菜 1 份', kcal: 30 }
            ]
          },
          {
            name: '墨西哥卷饼',
            items: [
              { name: '鸡肉卷饼 1 个', kcal: 480 },
              { name: '玉米杯 1 份', kcal: 110 },
              { name: '无糖气泡水', kcal: 0 }
            ]
          }
        ],
        [
          {
            name: '酸菜鱼套餐',
            items: [
              { name: '酸菜鱼 1 份（少油）', kcal: 520 },
              { name: '米饭 半碗', kcal: 130 }
            ]
          },
          {
            name: '咖喱饭',
            items: [
              { name: '鸡肉咖喱饭 半份', kcal: 480 },
              { name: '水煮西兰花 1 份', kcal: 50 }
            ]
          },
          {
            name: '泰式炒河粉',
            items: [
              { name: '炒河粉 半份', kcal: 420 },
              { name: '青木瓜沙拉 1 份', kcal: 90 },
              { name: '无糖茶', kcal: 0 }
            ]
          }
        ],
        [
          {
            name: '烤肉串套餐',
            items: [
              { name: '烤串 8 串（少油）', kcal: 520 },
              { name: '烤蔬菜 1 份', kcal: 70 },
              { name: '大麦茶', kcal: 0 }
            ]
          },
          {
            name: '日式定食',
            items: [
              { name: '烤鱼定食 1 份', kcal: 520 },
              { name: '味增汤 1 碗', kcal: 60 },
              { name: '无糖茶', kcal: 0 }
            ]
          },
          {
            name: '鸡胸汉堡套餐',
            items: [
              { name: '鸡胸汉堡 1 个', kcal: 480 },
              { name: '玉米杯 1 份', kcal: 110 },
              { name: '无糖可乐', kcal: 0 }
            ]
          }
        ]
      ],
      // 放纵餐当天的另外两餐（清淡版），同样按单品热量累加
      lightMealIndex: 0,
      lightMealSets: [
        {
          breakfast: {
            name: '燕麦牛奶套餐',
            items: [
              { name: '燕麦牛奶 1 碗', kcal: 200 },
              { name: '水煮蛋 1 个', kcal: 80 },
              { name: '蓝莓 1 小把', kcal: 50 }
            ]
          },
          dinner: {
            name: '清蒸鱼套餐',
            items: [
              { name: '清蒸鱼 1 份', kcal: 180 },
              { name: '蒜蓉西兰花 1 份', kcal: 60 },
              { name: '糙米饭 半碗', kcal: 130 }
            ]
          }
        },
        {
          breakfast: {
            name: '吐司煎蛋套餐',
            items: [
              { name: '全麦吐司 2 片', kcal: 180 },
              { name: '煎蛋 1 个', kcal: 90 },
              { name: '无糖豆浆 1 杯', kcal: 80 }
            ]
          },
          dinner: {
            name: '番茄豆腐汤套餐',
            items: [
              { name: '番茄豆腐汤 1 碗', kcal: 120 },
              { name: '清炒时蔬 1 份', kcal: 70 },
              { name: '玉米 半根', kcal: 110 }
            ]
          }
        },
        {
          breakfast: {
            name: '小米粥鸡蛋羹',
            items: [
              { name: '小米粥 1 碗', kcal: 140 },
              { name: '鸡蛋羹 1 份', kcal: 100 },
              { name: '小番茄 1 小份', kcal: 30 }
            ]
          },
          dinner: {
            name: '鸡胸沙拉套餐',
            items: [
              { name: '鸡胸肉沙拉 1 份', kcal: 250 },
              { name: '全麦面包 1 片', kcal: 100 },
              { name: '无糖酸奶 1 杯', kcal: 80 }
            ]
          }
        },
        {
          breakfast: {
            name: '酸奶燕麦碗',
            items: [
              { name: '无糖酸奶 1 杯', kcal: 80 },
              { name: '燕麦 40g', kcal: 150 },
              { name: '香蕉 半根', kcal: 45 }
            ]
          },
          dinner: {
            name: '番茄牛肉汤套餐',
            items: [
              { name: '番茄牛肉汤 1 碗', kcal: 200 },
              { name: '蒸南瓜 1 份', kcal: 90 },
              { name: '蒜蓉菠菜 1 份', kcal: 60 }
            ]
          }
        },
        {
          breakfast: {
            name: '红薯双蛋套餐',
            items: [
              { name: '红薯 1 个', kcal: 130 },
              { name: '水煮蛋 2 个', kcal: 160 },
              { name: '无糖豆浆 1 杯', kcal: 80 }
            ]
          },
          dinner: {
            name: '虾仁炒蛋套餐',
            items: [
              { name: '虾仁炒蛋 1 份', kcal: 180 },
              { name: '清炒时蔬 1 份', kcal: 60 },
              { name: '杂粮饭 半碗', kcal: 120 }
            ]
          }
        },
        {
          breakfast: {
            name: '紫薯豆浆套餐',
            items: [
              { name: '蒸紫薯 1 个', kcal: 130 },
              { name: '水煮蛋 1 个', kcal: 80 },
              { name: '无糖豆浆 1 杯', kcal: 80 }
            ]
          },
          dinner: {
            name: '冬瓜排骨汤套餐',
            items: [
              { name: '冬瓜排骨汤 1 碗', kcal: 220 },
              { name: '清炒油麦菜 1 份', kcal: 60 },
              { name: '米饭 半碗', kcal: 130 }
            ]
          }
        },
        {
          breakfast: {
            name: '玉米鸡蛋套餐',
            items: [
              { name: '玉米 1 根', kcal: 150 },
              { name: '水煮蛋 1 个', kcal: 80 },
              { name: '无糖酸奶 1 杯', kcal: 80 }
            ]
          },
          dinner: {
            name: '白菜豆腐煲套餐',
            items: [
              { name: '白菜豆腐煲 1 份', kcal: 200 },
              { name: '蒸红薯 1 个', kcal: 130 },
              { name: '凉拌黄瓜 1 份', kcal: 40 }
            ]
          }
        },
        {
          breakfast: {
            name: '全麦贝果套餐',
            items: [
              { name: '全麦贝果 1 个', kcal: 220 },
              { name: '无糖酸奶 1 杯', kcal: 80 },
              { name: '苹果 半个', kcal: 45 }
            ]
          },
          dinner: {
            name: '番茄龙利鱼套餐',
            items: [
              { name: '番茄龙利鱼 1 份', kcal: 190 },
              { name: '蒜蓉生菜 1 份', kcal: 60 },
              { name: '藜麦饭 半碗', kcal: 110 }
            ]
          }
        }
      ],
      // 蛋白质补给弹窗（男生入口）
      proteinVisible: false,
      proteinFoods: [
        { name: '鸡胸肉', portion: '100g', protein: 24 },
        { name: '鸡蛋', portion: '2 个', protein: 13 },
        { name: '希腊酸奶', portion: '150g', protein: 14 },
        { name: '三文鱼', portion: '100g', protein: 20 },
        { name: '豆腐', portion: '150g', protein: 12 },
        { name: '牛奶', portion: '250ml', protein: 8 }
      ]
    }
  },
  computed: {
    // 男生模式下第四格换成蛋白质补给（弹窗），女生保持生理期管理
    grids() {
      const list = [
        { text: '智能配餐', type: 'tab', url: '/pages/meal/meal' },
        { text: '录入饮食', type: 'page', url: '/pages/addFood/addFood' },
        { text: '每日复盘', type: 'page', url: '/pages/review/review' }
      ]
      if (this.periodEnabled) {
        list.push({ text: '生理期管理', type: 'page', url: '/pages/period/period' })
      } else {
        list.push({ text: '蛋白质补给', type: 'protein' })
      }
      return list
    },
    // 蛋白质目标按供能占比 20% 估算：热量目标 × 20% ÷ 4 kcal/g
    proteinTarget() {
      return Math.round((this.calorie.target * 0.2) / 4)
    },
    proteinPercent() {
      const p = Math.round((this.macros.protein / this.proteinTarget) * 100)
      return Math.min(Math.max(p, 0), 100)
    },
    proteinTip() {
      const remain = this.proteinTarget - this.macros.protein
      return remain > 0
        ? `还差 ${remain}g，可以从下面的食物里补一补`
        : '今天蛋白质吃够了，保持这个节奏就好'
    },
    proteinShort() {
      const remain = this.proteinTarget - this.macros.protein
      return remain > 0 ? `还差 ${remain}g` : '今日已达标'
    },
    todayText() {
      const d = new Date()
      return `${d.getMonth() + 1}月${d.getDate()}日 星期${WEEKDAYS[d.getDay()]}`
    },
    calPercent() {
      const p = Math.round((this.calorie.consumed / this.calorie.target) * 100)
      return Math.min(Math.max(p, 0), 100)
    },
    showCheatCard() {
      // 满足条件才展示：连续规律减脂天数达标且未被用户关闭
      return !this.cheatDismissed && this.consecutiveDays >= 7
    },
    cheatLimit() {
      // 放纵餐当日可放宽的热量上限
      return this.calorie.target + 300
    },
    cheatOptions() {
      // 当前展示的三条放纵餐选项：总热量 = 各单品热量之和
      return this.cheatOptionSets[this.cheatOptionIndex].map((o) => {
        const kcal = o.items.reduce((sum, item) => sum + item.kcal, 0)
        return {
          name: o.name,
          kcal,
          items: o.items
        }
      })
    },
    cheatKcalRange() {
      // 当前这组三条方案的热量区间，用于标题展示
      const list = this.cheatOptions.map((o) => o.kcal)
      return `${Math.min(...list)}-${Math.max(...list)}`
    },
    lightMeal() {
      // 当前另外两餐（早餐 / 晚餐）：总热量 = 各单品热量之和
      const cur = this.lightMealSets[this.lightMealIndex]
      const build = (meal) => {
        const kcal = meal.items.reduce((sum, item) => sum + item.kcal, 0)
        return {
          name: meal.name,
          kcal,
          items: meal.items
        }
      }
      const breakfast = build(cur.breakfast)
      const dinner = build(cur.dinner)
      return {
        breakfast,
        dinner,
        total: breakfast.kcal + dinner.kcal
      }
    },
    fullDayRange() {
      // 放纵餐（三选一）加上另外两餐后的全天热量区间
      const list = this.cheatOptions.map((o) => o.kcal + this.lightMeal.total)
      return `${Math.min(...list)}-${Math.max(...list)}`
    }
  },
  onShow() {
    // 昵称可在我的页修改
    this.nickname = uni.getStorageSync('userName') || homeMock.nickname
    // 读取生理期开关（默认开启；男生不展示）
    const gender = uni.getStorageSync('userGender') === 'male' ? 'male' : 'female'
    this.periodEnabled = gender === 'female' && uni.getStorageSync('periodEnabled') !== false
    // 读取每日热量目标（我的页可修改，默认 1500）
    const target = Number(uni.getStorageSync('calorieTarget'))
    this.calorie = {
      ...homeMock.calorie,
      target: target >= 800 && target <= 3000 ? target : homeMock.calorie.target
    }
  },
  methods: {
    onGridClick(item) {
      if (item.type === 'protein') {
        this.proteinVisible = true
        return
      }
      if (item.type === 'tab') {
        uni.switchTab({ url: item.url })
        return
      }
      uni.navigateTo({ url: item.url })
    },
    onViewCheatPlan() {
      this.cheatPlanVisible = true
    },
    closeCheatPlan() {
      this.cheatPlanVisible = false
    },
    refreshCheatOptions() {
      // 循环切换到下一组放纵餐选项
      this.cheatOptionIndex = (this.cheatOptionIndex + 1) % this.cheatOptionSets.length
    },
    refreshLightMeals() {
      // 循环切换到下一组早餐 + 晚餐搭配
      this.lightMealIndex = (this.lightMealIndex + 1) % this.lightMealSets.length
    },
    onDelayCheat() {
      this.cheatDismissed = true
      uni.showToast({ title: '已延后，继续保持哦', icon: 'none' })
    },
    onDismissCheat() {
      this.cheatDismissed = true
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx 32rpx calc(150rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: transparent;
}

/* 顶部欢迎区 */
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28rpx;
}
.hello-wrap {
  flex: 1;
  min-width: 0;
}
.hello {
  font-size: 42rpx;
  font-weight: 600;
  color: #2F3A36;
  letter-spacing: 0.5rpx;
}
.hello-sub {
  font-size: 24rpx;
  color: #9AA8A2;
  margin-top: 8rpx;
}
.date-pill {
  flex-shrink: 0;
  font-size: 22rpx;
  color: #3E8F72;
  background: #EAF6EF;
  border-radius: 999rpx;
  padding: 10rpx 22rpx;
  margin-left: 20rpx;
}

/* 生理期提示条 */
.period-banner {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #FDF3F5 0%, #F9ECEF 100%);
  border: 1rpx solid #EFD2D8;
  border-radius: 18rpx;
  padding: 22rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 18rpx rgba(232, 184, 192, 0.16);
}
.period-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #E8B8C0;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.period-text {
  font-size: 26rpx;
  color: #C07E8F;
}

/* 男生：蛋白质补给提示条 */
.protein-banner {
  background: linear-gradient(135deg, #F2FBF6 0%, #E9F7EF 100%);
  border-color: #D3EBDD;
  box-shadow: 0 6rpx 18rpx rgba(114, 200, 160, 0.16);
}
.protein-dot {
  background: #72C8A0;
}
.protein-text {
  color: #4A9B7D;
}

/* 蛋白质补给弹窗 */
.protein-pop {
  background: #FFFFFF;
  padding: 40rpx 32rpx 32rpx;
}
.protein-head {
  display: flex;
  align-items: center;
}
.protein-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
  margin-left: 12rpx;
}
.protein-nums {
  display: flex;
  align-items: baseline;
  margin-top: 24rpx;
}
.protein-cur {
  font-size: 52rpx;
  font-weight: 700;
  color: #72C8A0;
}
.protein-goal {
  font-size: 28rpx;
  color: #999999;
  margin-left: 8rpx;
}
.protein-bar {
  height: 14rpx;
  border-radius: 999rpx;
  background: #EFF4F1;
  margin-top: 16rpx;
  overflow: hidden;
}
.protein-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #8FD8B8 0%, #72C8A0 100%);
}
.protein-tip {
  font-size: 24rpx;
  color: #8A9490;
  margin-top: 14rpx;
  line-height: 1.6;
}
.protein-list {
  margin-top: 22rpx;
  border-top: 1rpx solid #F0F2F1;
}
.protein-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #F5F7F6;
}
.protein-food {
  font-size: 28rpx;
  color: #333333;
}
.protein-g {
  font-size: 24rpx;
  color: #72C8A0;
}
.protein-btn {
  margin-top: 26rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 999rpx;
  background: #72C8A0;
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
}

/* 今日热量卡片 */
.cal-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #6FC29B 0%, #8FD8B8 55%, #A6E4C6 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 30rpx rgba(114, 200, 160, 0.24);
}
.cal-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}
.cal-deco-a {
  width: 240rpx;
  height: 240rpx;
  right: -80rpx;
  top: -120rpx;
}
.cal-deco-b {
  width: 150rpx;
  height: 150rpx;
  left: -60rpx;
  bottom: -80rpx;
  background: rgba(255, 255, 255, 0.08);
}
.cal-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24rpx;
}
.cal-num {
  font-size: 64rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.cal-unit {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-left: 8rpx;
}
.cal-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 6rpx;
}
.cal-target {
  text-align: right;
}
.cal-target-num {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
}
.cal-target-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 6rpx;
}
.progress {
  position: relative;
  z-index: 1;
  height: 16rpx;
  background: rgba(255, 255, 255, 0.28);
  border-radius: 999rpx;
  overflow: hidden;
  margin-bottom: 26rpx;
}
.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #FFFFFF 0%, #F2FFF8 100%);
  border-radius: 999rpx;
  box-shadow: 0 0 12rpx rgba(255, 255, 255, 0.6);
}
.macros {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.macro-item {
  font-size: 23rpx;
  color: #FFFFFF;
  background: rgba(255, 255, 255, 0.18);
  border: 1rpx solid rgba(255, 255, 255, 0.24);
  border-radius: 999rpx;
  padding: 6rpx 20rpx;
  margin-right: 12rpx;
}
.macro-divider {
  display: none;
}

/* 四宫格 */
.grid-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 20rpx 8rpx;
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 26rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}
.grid-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0;
}
.grid-item-hover {
  opacity: 0.6;
}
.grid-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 26rpx;
  background: #F1FAF5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14rpx;
}
.grid-item:nth-child(2) .grid-icon {
  background: #FDF6EC;
}
.grid-item:nth-child(4) .grid-icon {
  background: #FCF2F4;
}
.grid-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #3A4742;
}

/* 放纵餐提示卡片 */
.cheat-card {
  background: linear-gradient(160deg, #FFFAF0 0%, #FDF0DC 100%);
  border: 1rpx solid #F2DCB8;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(230, 162, 60, 0.16);
}
.cheat-title {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #8A6D3B;
  line-height: 1.7;
  margin-bottom: 24rpx;
}
.cheat-gift-icon {
  margin-right: 12rpx;
  flex-shrink: 0;
}
.cheat-actions {
  display: flex;
  align-items: center;
}
.cheat-btn {
  border-radius: 999rpx;
  font-size: 26rpx;
  padding: 14rpx 32rpx;
  margin-right: 20rpx;
}
.btn-hover {
  opacity: 0.7;
}
.cheat-btn-primary {
  background: #E6A23C;
  color: #FFFFFF;
}
.cheat-btn-outline {
  border: 1rpx solid #E6A23C;
  color: #E6A23C;
}
.cheat-btn-text {
  color: #999999;
  padding: 14rpx 8rpx;
  margin-right: 0;
}

/* 放纵餐方案弹窗 */
.plan {
  background: linear-gradient(180deg, #F4FAF7 0%, #FFFFFF 30%);
}
.plan-scroll {
  max-height: 66vh;
  padding: 40rpx 32rpx 8rpx;
  box-sizing: border-box;
}
.plan-head {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}
.plan-badge {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: #FDF3E3;
  border: 1rpx solid #F2DFC0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.plan-head-text {
  flex: 1;
}
.plan-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
}
.plan-sub {
  font-size: 24rpx;
  color: #8A8A8A;
  margin-top: 10rpx;
  line-height: 1.5;
}
.plan-block {
  margin-bottom: 28rpx;
}
.plan-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18rpx;
}
.plan-block-title {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
}
.plan-block-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #72C8A0;
  margin-right: 12rpx;
  flex-shrink: 0;
}
.plan-block-dot-warm {
  background: #E6A23C;
}
.plan-block-hint {
  font-size: 22rpx;
  color: #9BC9B4;
  margin-left: 12rpx;
}
.plan-refresh {
  display: flex;
  align-items: center;
  border: 1rpx solid rgba(114, 200, 160, 0.55);
  border-radius: 999rpx;
  padding: 6rpx 16rpx;
  flex-shrink: 0;
}
.plan-refresh-text {
  font-size: 22rpx;
  color: #72C8A0;
  margin-left: 6rpx;
}
.plan-refresh-hover {
  opacity: 0.7;
}

/* 放纵餐选项卡片 */
.plan-option {
  background: #FFFFFF;
  border: 1rpx solid #EDF3F0;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 6rpx 18rpx rgba(114, 200, 160, 0.07);
}
.plan-option-top {
  display: flex;
  align-items: center;
  margin-bottom: 14rpx;
}
.plan-option-index {
  width: 36rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  border-radius: 50%;
  background: #FDF3E3;
  color: #E6A23C;
  font-size: 22rpx;
  margin-right: 14rpx;
  flex-shrink: 0;
}
.plan-option-name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
}
.plan-option-kcal {
  font-size: 24rpx;
  font-weight: 500;
  color: #E6A23C;
}

/* 食材小标签 */
.plan-chips {
  display: flex;
  flex-wrap: wrap;
}
.plan-chip {
  font-size: 22rpx;
  color: #5E7A70;
  background: #F3F8F6;
  border-radius: 10rpx;
  padding: 8rpx 14rpx;
  margin: 0 10rpx 10rpx 0;
}
.plan-chip-kcal {
  font-size: 20rpx;
  color: #A9CDBD;
  margin-left: 8rpx;
}

/* 早餐 / 晚餐卡片 */
.plan-meal {
  background: #FFFFFF;
  border: 1rpx solid #EDF3F0;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 14rpx;
  box-shadow: 0 6rpx 18rpx rgba(114, 200, 160, 0.07);
}
.plan-meal-head {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}
.plan-meal-tag {
  font-size: 22rpx;
  color: #4A9B7D;
  background: #EAF6F0;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
  margin-right: 14rpx;
  flex-shrink: 0;
}
.plan-meal-name {
  flex: 1;
  font-size: 26rpx;
  font-weight: 500;
  color: #333333;
}
.plan-meal-kcal {
  font-size: 22rpx;
  color: #9BC9B4;
}

/* 全天合计 */
.plan-sum {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F3FAF7;
  border: 1rpx solid #E4F2EB;
  border-radius: 16rpx;
  padding: 22rpx 28rpx;
  margin-bottom: 24rpx;
}
.plan-sum-label {
  font-size: 24rpx;
  color: #5E7A70;
}
.plan-sum-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #72C8A0;
}
.plan-tip {
  font-size: 22rpx;
  color: #9A9A9A;
  line-height: 1.7;
  margin-bottom: 28rpx;
}
.plan-btn {
  margin: 8rpx 32rpx 32rpx;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  color: #FFFFFF;
  text-align: center;
  font-size: 30rpx;
  border-radius: 999rpx;
  padding: 22rpx 0;
  box-shadow: 0 8rpx 20rpx rgba(114, 200, 160, 0.28);
  transition: transform 0.3s ease;
}
.plan-btn-hover {
  opacity: 0.85;
  transform: scale(0.98);
}

/* 按压缩放动效 */
.press-scale {
  transform: scale(0.98);
}
</style>
