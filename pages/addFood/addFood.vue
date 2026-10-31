<template>
  <view class="page">
    <!-- 页面标题 -->
    <view class="page-title">录入饮食记录</view>

    <!-- 餐次单选 -->
    <view class="meal-tabs">
      <view
        class="meal-tab"
        :class="{ 'meal-tab-active': mealType === t }"
        v-for="t in mealTypes"
        :key="t"
        hover-class="btn-hover"
        @click="mealType = t"
      >
        {{ t }}
      </view>
    </view>

    <!-- 食材搜索框 -->
    <view class="search-box">
      <u-icon class="search-icon" name="search" color="#999" size="32rpx"></u-icon>
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索食材，如：鸡胸肉"
        placeholder-class="search-placeholder"
      />
      <view v-if="keyword" class="search-clear" @click="keyword = ''">
        <u-icon name="close" color="#999" size="28rpx"></u-icon>
      </view>
    </view>

    <!-- AI 识图入口 -->
    <view class="photo-entry" hover-class="row-hover" @click="openPhotoEstimate">
      <u-icon name="camera-fill" color="#72C8A0" size="36rpx"></u-icon>
      <text class="photo-entry-text">AI 识图估算热量</text>
      <u-icon name="arrow-right" color="#999999" size="26rpx"></u-icon>
    </view>

    <!-- 食材库列表 -->
    <view class="card">
      <view class="card-title">食材库（每100g热量）</view>
      <view v-if="!filteredFoods.length" class="empty-text">未找到相关食材</view>
      <view
        class="food-row"
        v-for="food in filteredFoods"
        :key="food.name"
        hover-class="row-hover"
        @click="addFood(food)"
      >
        <view class="food-left">
          <text class="food-name">{{ food.name }}</text>
          <text v-if="isAllergic(food)" class="tag tag-red">过敏</text>
          <text v-if="food.cooling" class="tag tag-yellow">寒凉</text>
        </view>
        <view class="food-right">
          <text class="food-cal">{{ food.calorie }} kcal/100g</text>
          <view class="food-add">
            <u-icon v-if="isSelected(food)" name="checkmark-circle-fill" color="#72C8A0" size="36rpx"></u-icon>
            <u-icon v-else name="plus-circle-fill" color="#72C8A0" size="36rpx"></u-icon>
          </view>
        </view>
      </view>
    </view>

    <!-- 校验提示 -->
    <view v-if="hasAllergic" class="warn-banner warn-red">
      <u-icon class="warn-icon" name="warning" color="#F56C6C" size="30rpx"></u-icon>
      <text>该食材是您标记的过敏食材，请谨慎</text>
    </view>
    <view v-if="showCoolingTip" class="warn-banner warn-yellow">
      <u-icon class="warn-icon" name="info-circle" color="#E6A23C" size="30rpx"></u-icon>
      <text>当前经期，该食材偏寒凉，建议少吃</text>
    </view>

    <!-- 选中食材卡片列表 -->
    <view class="card" v-if="selected.length">
      <view class="card-title">已选食材（{{ selected.length }}）</view>
      <view class="selected-item" v-for="(item, index) in selected" :key="item.name" hover-class="press-scale">
        <view class="selected-main">
          <view class="food-left">
            <text class="food-name">{{ item.name }}</text>
            <text v-if="isAllergic(item)" class="tag tag-red">过敏</text>
            <text v-if="item.cooling" class="tag tag-yellow">寒凉</text>
          </view>
          <view class="selected-detail">
            <view class="weight-box">
              <input
                class="weight-input"
                type="digit"
                v-model="item.weight"
              />
              <text class="weight-unit">g</text>
            </view>
            <text class="item-cal">{{ itemCalorie(item) }} kcal</text>
            <view class="item-delete" hover-class="btn-hover" @click="removeFood(index)">
              <u-icon name="trash" color="#F56C6C" size="32rpx"></u-icon>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 实时汇总 -->
    <view class="summary-card">
      <view class="summary-total">
        <text class="summary-num">{{ totals.calorie }}</text>
        <text class="summary-label">合计热量 kcal</text>
      </view>
      <view class="summary-macros">
        <view class="macro">
          <view class="macro-num">{{ totals.protein }}g</view>
          <view class="macro-label">蛋白质</view>
        </view>
        <view class="macro">
          <view class="macro-num">{{ totals.carbs }}g</view>
          <view class="macro-label">碳水</view>
        </view>
        <view class="macro">
          <view class="macro-num">{{ totals.fat }}g</view>
          <view class="macro-label">脂肪</view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="action-bar">
      <view class="btn btn-clear" hover-class="btn-hover" @click="clearAll">清空全部</view>
      <view class="btn btn-save" hover-class="btn-hover" @click="saveRecord">保存记录</view>
    </view>

    <photo-meal ref="photoMeal" @confirm="onPhotoConfirm" />

    <footer-tip />
  </view>
</template>

<script>
import { recordMock, homeMock } from '@/common/mock.js'
import PhotoMeal from '@/components/photo-meal/photo-meal.vue'

export default {
  components: { PhotoMeal },
  data() {
    return {
      mealTypes: recordMock.mealTypes,
      mealType: '早餐',
      keyword: '',
      foodLibrary: recordMock.foodLibrary,
      selected: [],
      inPeriod: false
    }
  },
  computed: {
    filteredFoods() {
      const kw = this.keyword.trim()
      if (!kw) return this.foodLibrary
      return this.foodLibrary.filter((f) => f.name.indexOf(kw) > -1)
    },
    // 选中列表中是否含过敏食材
    hasAllergic() {
      return this.selected.some((i) => this.isAllergic(i))
    },
    // 经期中选中了寒凉食材
    showCoolingTip() {
      return this.inPeriod && this.selected.some((i) => i.cooling)
    },
    totals() {
      const sum = { calorie: 0, protein: 0, carbs: 0, fat: 0 }
      this.selected.forEach((i) => {
        const w = this.validWeight(i) / 100
        sum.calorie += i.calorie * w
        sum.protein += i.protein * w
        sum.carbs += i.carbs * w
        sum.fat += i.fat * w
      })
      return {
        calorie: Math.round(sum.calorie),
        protein: Math.round(sum.protein * 10) / 10,
        carbs: Math.round(sum.carbs * 10) / 10,
        fat: Math.round(sum.fat * 10) / 10
      }
    }
  },
  onShow() {
    // 生理期开启且当前处于经期
    const enabled = uni.getStorageSync('periodEnabled') !== false
    this.inPeriod = enabled && homeMock.periodInfo.phase === '经期'
  },
  methods: {
    isAllergic(food) {
      const stored = uni.getStorageSync('allergicFoods')
      const list = stored === '' ? recordMock.allergicFoods : stored
      return list.indexOf(food.name) > -1
    },
    isSelected(food) {
      return this.selected.some((i) => i.name === food.name)
    },
    validWeight(item) {
      const w = Number(item.weight)
      return isNaN(w) || w <= 0 ? 0 : w
    },
    itemCalorie(item) {
      return Math.round((item.calorie * this.validWeight(item)) / 100)
    },
    addFood(food) {
      if (this.isSelected(food)) {
        uni.showToast({ title: '该食材已在列表中', icon: 'none' })
        return
      }
      this.selected.push({ ...food, weight: 100 })
    },
    openPhotoEstimate() {
      this.$refs.photoMeal.open()
    },
    onPhotoConfirm(items) {
      let added = 0
      items.forEach((item) => {
        if (this.isSelected(item)) return
        this.selected.push({ ...item, weight: this.validWeight(item) || 100 })
        added++
      })
      if (added) {
        uni.showToast({ title: `已加入 ${added} 种食材`, icon: 'none' })
      } else {
        uni.showToast({ title: '食材已在列表中', icon: 'none' })
      }
    },
    removeFood(index) {
      this.selected.splice(index, 1)
    },
    clearAll() {
      if (!this.selected.length) {
        uni.showToast({ title: '列表已是空的', icon: 'none' })
        return
      }
      this.selected = []
      uni.showToast({ title: '已清空', icon: 'none' })
    },
    saveRecord() {
      if (!this.selected.length) {
        uni.showToast({ title: '请先添加食材', icon: 'none' })
        return
      }
      const record = {
        mealType: this.mealType,
        time: Date.now(),
        items: this.selected.map((i) => ({
          name: i.name,
          weight: this.validWeight(i),
          calorie: this.itemCalorie(i)
        })),
        totals: this.totals
      }
      const list = uni.getStorageSync('dietRecords') || []
      list.push(record)
      uni.setStorageSync('dietRecords', list)
      uni.showToast({ title: '保存成功', icon: 'success' })
      this.selected = []
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32rpx;
  box-sizing: border-box;
  background: transparent;
}
.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #333333;
  margin-bottom: 24rpx;
}

/* 餐次单选 */
.meal-tabs {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}
.meal-tab {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
  padding: 16rpx 0;
  border-radius: 12rpx;
  transition: transform 0.3s ease;
}
.meal-tab-active {
  background: #72C8A0;
  color: #FFFFFF;
  font-weight: 600;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 0 28rpx;
  height: 88rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}
.search-icon {
  margin-right: 12rpx;
}
.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}
.search-placeholder {
  color: #999999;
}
.search-clear {
  display: flex;
  align-items: center;
  padding: 0 8rpx;
}

/* 通用卡片 */
.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}
.card-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 16rpx;
}
.empty-text {
  font-size: 26rpx;
  color: #999999;
  text-align: center;
  padding: 32rpx 0;
}

/* 食材行 */
.food-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F2F1;
  transition: transform 0.3s ease;
}
.food-row:last-child {
  border-bottom: none;
}
.row-hover {
  opacity: 0.6;
}
.food-left {
  display: flex;
  align-items: center;
}
.food-name {
  font-size: 28rpx;
  color: #333333;
}
.food-right {
  display: flex;
  align-items: center;
}
.food-cal {
  font-size: 24rpx;
  color: #999999;
  margin-right: 16rpx;
}
.food-add {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
}

/* 标签 */
.tag {
  font-size: 20rpx;
  border-radius: 8rpx;
  padding: 2rpx 12rpx;
  margin-left: 12rpx;
}
.tag-red {
  color: #F56C6C;
  background: #FDEDED;
}
.tag-yellow {
  color: #E6A23C;
  background: #FDF3E3;
}

/* 校验提示 */
.warn-banner {
  display: flex;
  align-items: center;
  border-radius: 16rpx;
  padding: 24rpx 28rpx;
  font-size: 26rpx;
  margin-bottom: 24rpx;
}
.warn-icon {
  margin-right: 12rpx;
}
.warn-red {
  color: #F56C6C;
  background: #FDEDED;
  border: 1rpx solid #F8CACA;
}
.warn-yellow {
  color: #E6A23C;
  background: #FDF3E3;
  border: 1rpx solid #F0D9B5;
}

/* 选中项 */
.selected-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F2F1;
  transition: transform 0.3s ease;
}
.selected-item:last-child {
  border-bottom: none;
}
.selected-detail {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
}
.weight-box {
  display: flex;
  align-items: center;
  border: 1rpx solid #E0E6E3;
  border-radius: 12rpx;
  padding: 0 16rpx;
  height: 56rpx;
}
.weight-input {
  width: 100rpx;
  font-size: 26rpx;
  color: #333333;
  text-align: center;
}
.weight-unit {
  font-size: 24rpx;
  color: #999999;
}
.item-cal {
  flex: 1;
  font-size: 26rpx;
  color: #72C8A0;
  font-weight: 600;
  margin-left: 24rpx;
}
.item-delete {
  display: flex;
  align-items: center;
  padding: 8rpx 16rpx;
}

/* 汇总卡片 */
.summary-card {
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(114, 200, 160, 0.18);
}
.summary-total {
  text-align: center;
  margin-bottom: 24rpx;
}
.summary-num {
  font-size: 56rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-right: 12rpx;
}
.summary-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}
.summary-macros {
  display: flex;
}
.macro {
  flex: 1;
  text-align: center;
}
.macro-num {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 6rpx;
}
.macro-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

/* 底部按钮 */
.action-bar {
  display: flex;
  margin-top: 8rpx;
}
.btn {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  border-radius: 999rpx;
  padding: 22rpx 0;
  transition: transform 0.3s ease;
}
.btn-save {
  background: #72C8A0;
  color: #FFFFFF;
  font-weight: 600;
  margin-left: 24rpx;
}
.btn-clear {
  border: 1rpx solid #CCCCCC;
  color: #999999;
}
.btn-hover {
  opacity: 0.7;
}
.press-scale {
  transform: scale(0.98);
}

/* AI 识图入口 */
.photo-entry {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease;
}
.photo-entry-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-left: 16rpx;
}
</style>
