<template>
  <view class="page">
    <!-- 顶部：目标热量 + 生理阶段标签 + 换一批 -->
    <view class="top-card">
      <view class="top-deco"></view>
      <view class="top-left">
        <view class="target-label">今日目标热量</view>
        <view class="target-value">
          {{ targetCalorie }}<text class="target-unit"> kcal</text>
        </view>
        <view v-if="showPhaseTag" class="phase-tag">{{ phaseTag }}</view>
      </view>
      <view class="top-right">
        <view class="refresh-btn" hover-class="btn-hover" @click="refreshAll">
          <u-icon class="refresh-icon" name="reload" color="#3E8F72" size="28rpx"></u-icon>
          <text>换一批</text>
        </view>
      </view>
    </view>

    <!-- 横向滑动方案卡片组（最多4张） -->
    <scroll-view class="plan-scroll" scroll-x enhanced :show-scrollbar="false">
      <view class="plan-track">
        <view class="plan-card" v-for="(plan, pi) in plans" :key="plan.id" hover-class="press-scale">
          <view class="plan-head">
            <view class="plan-name">{{ plan.name }}</view>
            <view class="plan-total">约{{ planTotal(plan) }} kcal</view>
          </view>

          <view class="meal-block" v-for="(meal, mi) in plan.meals" :key="meal.type">
            <view class="meal-type">{{ meal.type }}</view>
            <view class="food-list">
              <view
                class="food-chip"
                v-for="(food, fi) in meal.items"
                :key="food.name"
                hover-class="chip-hover"
                @click="openReplace(pi, mi, fi)"
              >
                {{ food.name }}<text class="food-cal">{{ food.calorie }}kcal</text>
              </view>
            </view>
          </view>

          <view class="plan-footer" hover-class="press-scale">
            <view class="footer-btn" hover-class="btn-hover" @click="refreshOne(pi)">
              <u-icon class="footer-icon" name="reload" color="#FFFFFF" size="28rpx"></u-icon>
              <text>换一批</text>
            </view>
            <view
              class="footer-btn"
              :class="{ 'footer-btn-fav': favMap[plan.id] }"
              hover-class="btn-hover"
              @click="toggleFav(plan)"
            >
              <u-icon
                class="footer-icon"
                :name="favMap[plan.id] ? 'heart-fill' : 'heart'"
                :color="favMap[plan.id] ? '#F56C6C' : '#999999'"
                size="32rpx"
              ></u-icon>
              <text>{{ favMap[plan.id] ? '已收藏' : '收藏' }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 忌口食材过多时的灰色提示 -->
    <view v-if="plans.length < maxPlans" class="limit-tip">
      当前忌口食材较多，可选食材有限，仅为您生成{{ plans.length }}套方案，您可以调整忌口清单获得更多选择
    </view>

    <!-- 替换食材底部弹窗 -->
    <u-popup :show="popupShow" mode="bottom" round="24" :safeAreaInsetBottom="true" @close="popupShow = false">
      <view class="popup">
        <view class="popup-header">
          <view class="popup-title">替换食材</view>
          <view class="popup-close" hover-class="btn-hover" @click="popupShow = false">
            <u-icon name="close" color="#999999" size="32rpx"></u-icon>
          </view>
        </view>
        <view class="popup-current" v-if="selected.item">
          当前：<text class="popup-current-name">{{ selected.item.name }}</text>
          （{{ selected.mealType }} · {{ selected.item.calorie }}kcal）
        </view>
        <view class="popup-sub">同类型备选食材</view>
        <view class="alt-list">
          <view
            class="alt-item"
            v-for="alt in alternatives"
            :key="alt.name"
            hover-class="chip-hover"
            @click="replaceFood(alt)"
          >
            <view class="alt-name">{{ alt.name }}</view>
            <view class="alt-cal">{{ alt.calorie }} kcal</view>
          </view>
        </view>
      </view>
    </u-popup>

    <footer-tip />
  </view>
</template>

<script>
import { mealMock, homeMock } from '@/common/mock.js'

export default {
  data() {
    return {
      targetCalorie: mealMock.targetCalorie,
      maxPlans: 4,
      planCursor: 0,
      plans: [],
      favMap: {},
      showPhaseTag: true,
      phaseTag: '',
      popupShow: false,
      selected: { planIndex: -1, mealIndex: -1, itemIndex: -1, item: null, mealType: '' }
    }
  },
  computed: {
    // 过滤忌口食材后的可用方案模板（优先读本地忌口设置）
    availableTemplates() {
      const stored = uni.getStorageSync('avoidFoods')
      const avoid = stored === '' ? mealMock.avoidFoods || [] : stored
      if (!avoid.length) return mealMock.planPool
      return mealMock.planPool.filter(
        (p) => !p.meals.some((m) => m.items.some((f) => avoid.includes(f.name)))
      )
    },
    // 当前选中食材的同类型备选
    alternatives() {
      if (!this.selected.item) return []
      const pool = mealMock.ingredientPool[this.selected.item.type] || []
      return pool.filter((f) => f.name !== this.selected.item.name)
    }
  },
  onLoad() {
    this.loadFavs()
    this.buildPlans(0)
  },
  onShow() {
    this.loadFavs()
    // 生理期开关关闭时不显示阶段标签
    this.showPhaseTag = uni.getStorageSync('periodEnabled') !== false
    this.phaseTag = `${homeMock.periodInfo.phase}第${homeMock.periodInfo.day}天`
    // 每日热量目标跟随「我的」页设置
    const target = Number(uni.getStorageSync('calorieTarget'))
    this.targetCalorie =
      target >= 800 && target <= 3000 ? target : mealMock.targetCalorie
  },
  methods: {
    clone(obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    buildPlans(start) {
      const list = this.availableTemplates
      const count = Math.min(this.maxPlans, list.length)
      const result = []
      for (let i = 0; i < count; i++) {
        result.push(this.clone(list[(start + i) % list.length]))
      }
      this.plans = result
    },
    // 顶部换一批：轮换全部方案
    refreshAll() {
      const list = this.availableTemplates
      if (!list.length) return
      this.planCursor = (this.planCursor + 1) % list.length
      this.buildPlans(this.planCursor)
      uni.showToast({ title: '已为您换一批方案', icon: 'none' })
    },
    // 卡片换一批：用未展示的模板替换当前卡片
    refreshOne(pi) {
      const currentIds = this.plans.map((p) => p.id)
      const candidate = this.availableTemplates.find((t) => !currentIds.includes(t.id))
      if (!candidate) {
        uni.showToast({ title: '暂无更多方案，可调整忌口清单', icon: 'none' })
        return
      }
      this.$set(this.plans, pi, this.clone(candidate))
    },
    planTotal(plan) {
      return plan.meals.reduce((sum, m) => sum + m.items.reduce((s, f) => s + f.calorie, 0), 0)
    },
    // 收藏状态与本地缓存保持同步
    loadFavs() {
      const list = uni.getStorageSync('favPlans') || []
      const map = {}
      list.forEach((p) => {
        map[p.id] = true
      })
      this.favMap = map
    },
    toggleFav(plan) {
      const list = uni.getStorageSync('favPlans') || []
      const idx = list.findIndex((p) => p.id === plan.id)
      if (idx > -1) {
        list.splice(idx, 1)
      } else {
        list.unshift({
          ...this.clone(plan),
          total: this.planTotal(plan),
          savedAt: Date.now()
        })
      }
      uni.setStorageSync('favPlans', list)
      this.$set(this.favMap, plan.id, idx === -1)
      uni.showToast({
        title: idx === -1 ? '已收藏该方案' : '已取消收藏',
        icon: 'none'
      })
    },
    openReplace(pi, mi, fi) {
      const meal = this.plans[pi].meals[mi]
      this.selected = {
        planIndex: pi,
        mealIndex: mi,
        itemIndex: fi,
        item: meal.items[fi],
        mealType: meal.type
      }
      this.popupShow = true
    },
    replaceFood(alt) {
      const { planIndex, mealIndex, itemIndex } = this.selected
      const old = this.plans[planIndex].meals[mealIndex].items[itemIndex]
      this.$set(this.plans[planIndex].meals[mealIndex].items, itemIndex, {
        name: alt.name,
        calorie: alt.calorie,
        type: old.type
      })
      this.popupShow = false
      uni.showToast({ title: `已替换为${alt.name}`, icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: calc(150rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: transparent;
}

/* 顶部卡片 */
.top-card {
  position: relative;
  overflow: hidden;
  margin: 32rpx;
  background: linear-gradient(135deg, #6FC29B 0%, #8FD8B8 55%, #A6E4C6 100%);
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 12rpx 30rpx rgba(114, 200, 160, 0.24);
}
.top-deco {
  position: absolute;
  right: -90rpx;
  top: -130rpx;
  width: 250rpx;
  height: 250rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}
.top-left,
.top-right {
  position: relative;
  z-index: 1;
}
.target-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8rpx;
}
.target-value {
  font-size: 52rpx;
  font-weight: 700;
  color: #FFFFFF;
}
.target-unit {
  font-size: 24rpx;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
}
.top-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 20rpx;
}
.phase-tag {
  display: inline-block;
  font-size: 22rpx;
  color: #B25F73;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
  margin-top: 14rpx;
}
.refresh-btn {
  display: flex;
  align-items: center;
  white-space: nowrap;
  font-size: 26rpx;
  color: #3E8F72;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 999rpx;
  padding: 12rpx 28rpx;
  box-shadow: 0 4rpx 12rpx rgba(47, 125, 99, 0.12);
}
.refresh-icon {
  margin-right: 8rpx;
}
.btn-hover {
  opacity: 0.7;
}

/* 横向滑动卡片组 */
.plan-scroll {
  width: 100%;
  white-space: nowrap;
}
.plan-track {
  padding: 0 32rpx;
  font-size: 0;
}
.plan-card {
  display: inline-block;
  vertical-align: top;
  width: 620rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-right: 24rpx;
  box-shadow: 0 8rpx 26rpx rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  white-space: normal;
  transition: transform 0.3s ease;
}
.plan-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.plan-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #2F3A36;
}
.plan-total {
  font-size: 24rpx;
  color: #3E8F72;
  background: #EAF6EF;
  border-radius: 999rpx;
  padding: 6rpx 20rpx;
}

/* 餐次区块 */
.meal-block {
  margin-bottom: 18rpx;
}
.meal-type {
  font-size: 24rpx;
  color: #8FA39B;
  margin-bottom: 12rpx;
}
.meal-type::before {
  content: '';
  display: inline-block;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #BFE4D3;
  margin-right: 10rpx;
  vertical-align: middle;
}
.food-list {
  display: flex;
  flex-wrap: wrap;
}
.food-chip {
  font-size: 24rpx;
  color: #3E8F72;
  background: #F0F9F4;
  border: 1rpx solid #DCEFE5;
  border-radius: 999rpx;
  padding: 10rpx 22rpx;
  margin: 0 12rpx 12rpx 0;
}
.chip-hover {
  opacity: 0.6;
}
.food-cal {
  font-size: 20rpx;
  color: #9BC9B4;
  margin-left: 8rpx;
}

/* 卡片底部按钮 */
.plan-footer {
  display: flex;
  margin-top: 8rpx;
  transition: transform 0.3s ease;
}
.footer-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #FFFFFF;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 999rpx;
  padding: 14rpx 0;
  margin-right: 16rpx;
}
.footer-icon {
  margin-right: 8rpx;
}
.footer-btn:last-child {
  margin-right: 0;
  color: #7F8D88;
  background: #F5F9F7;
}
.footer-btn-fav {
  color: #F56C6C;
  background: #FEF2F2;
}

/* 忌口提示 */
.limit-tip {
  margin: 8rpx 32rpx 0;
  background: #F7F9F8;
  border: 1rpx solid #EDF1EF;
  border-radius: 18rpx;
  padding: 24rpx 28rpx;
  font-size: 24rpx;
  color: #9AA8A2;
  line-height: 1.6;
}

/* 替换弹窗 */
.popup {
  padding: 36rpx 32rpx 32rpx;
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2F3A36;
}
.popup-close {
  font-size: 32rpx;
  color: #999999;
  padding: 0 8rpx;
}
.popup-current {
  font-size: 26rpx;
  color: #8FA39B;
  margin-bottom: 20rpx;
}
.popup-current-name {
  color: #3E8F72;
  font-weight: 600;
}
.popup-sub {
  font-size: 24rpx;
  color: #8FA39B;
  margin-bottom: 16rpx;
}
.alt-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.alt-item {
  width: calc((100% - 32rpx) / 3);
  background: #F7FAF8;
  border: 1rpx solid #EDF3EF;
  border-radius: 16rpx;
  padding: 20rpx 12rpx;
  box-sizing: border-box;
  text-align: center;
}
.alt-name {
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 6rpx;
}
.alt-cal {
  font-size: 22rpx;
  color: #9AA8A2;
}

/* 按压缩放动效 */
.press-scale {
  transform: scale(0.98);
}
</style>
