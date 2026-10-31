<template>
  <view class="page">
    <!-- 日期选择器 -->
    <picker mode="date" :value="selectedDate" :end="todayStr" @change="onDateChange">
      <view class="date-bar" hover-class="btn-hover">
        <u-icon class="date-icon" name="calendar" color="#72C8A0" size="32rpx"></u-icon>
        <text class="date-text">{{ selectedDate }} 星期{{ weekday }}</text>
        <u-icon name="arrow-down" color="#999" size="24rpx"></u-icon>
      </view>
    </picker>

    <!-- 当日汇总卡片 -->
    <view class="summary-card">
      <view class="summary-total">
        <text class="summary-num">{{ totals.calorie }}</text>
        <text class="summary-label">当日总热量 kcal</text>
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
	
	<view class="card">
	  <view class="card-title">AI 拍照分析热量</view>
	  <view class="photo-row">
	    <view class="photo-action photo-action-primary" hover-class="btn-hover" @click="takePhoto">
	      <u-icon name="camera-fill" color="#FFFFFF" size="34rpx"></u-icon>
	      <text class="photo-action-text">拍摄食物照片</text>
	    </view>
	    <view class="photo-action" hover-class="btn-hover" @click="chooseImg">
	      <u-icon name="photo" color="#3E8F72" size="34rpx"></u-icon>
	      <text class="photo-action-text">从相册选择</text>
	    </view>
	  </view>
	  <view class="photo-tip">选好照片后可一键 AI 识别热量，识别结果支持手动调整重量</view>
	</view>

    <!-- 按餐次分组展示 -->
    <view class="card" v-for="group in groupedRecords" :key="group.type">
      <view class="card-title">
        {{ group.type }}
        <text class="group-cal">{{ group.calorie }} kcal</text>
      </view>
      <view v-if="!group.items.length" class="empty-line">暂无记录</view>
      <view class="record-item" v-for="item in group.items" :key="item.key" hover-class="press-scale">
        <view class="record-main">
          <view class="record-name">{{ item.name }}</view>
          <view class="record-sub">{{ item.weight }}g · {{ item.timeText }} 录入</view>
        </view>
        <view class="record-right">
          <text class="record-cal">{{ item.calorie }} kcal</text>
          <view class="record-delete" hover-class="btn-hover" @click="removeItem(item)">
            <u-icon name="trash" color="#F56C6C" size="32rpx"></u-icon>
          </view>
        </view>
      </view>
    </view>

    <!-- 整天无记录 -->
    <view v-if="!dayRecords.length" class="card empty-card">
      <view class="empty-text">这一天还没有饮食记录</view>
      <view class="empty-btn" hover-class="btn-hover" @click="goAdd">去录入饮食</view>
    </view>

    <photo-meal ref="photoMeal" @confirm="onPhotoConfirm" />

    <footer-tip />
  </view>
</template>

<script>
import { recordHistoryMock, recordMock } from '@/common/mock.js'
import PhotoMeal from '@/components/photo-meal/photo-meal.vue'
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MEAL_ORDER = [
  { type: '早餐' },
  { type: '午餐' },
  { type: '晚餐' },
  { type: '加餐' }
]

export default {
  components: { PhotoMeal },
  
  data() {
    return {
      selectedDate: '',
      records: []
	  
    }
  },
  computed: {
    todayStr() {
      return this.fmtDate(new Date())
    },
    weekday() {
      return WEEKDAYS[new Date(this.selectedDate.replace(/-/g, '/')).getDay()]
    },
    // 当前选中日期的记录
    dayRecords() {
      return this.records.filter((r) => this.fmtDate(new Date(r.time)) === this.selectedDate)
    },
    // 按餐次分组并展平为条目
    groupedRecords() {
      return MEAL_ORDER.map((m) => {
        const items = []
        let calorie = 0
        this.dayRecords
          .filter((r) => r.mealType === m.type)
          .forEach((r) => {
            calorie += r.totals.calorie
            r.items.forEach((food, fi) => {
              items.push({
                key: `${r.id}-${fi}`,
                recordId: r.id,
                itemIndex: fi,
                name: food.name,
                weight: food.weight,
                calorie: food.calorie,
                timeText: this.fmtTime(new Date(r.time))
              })
            })
          })
        items.sort((a, b) => a.timeText.localeCompare(b.timeText))
        return { ...m, items, calorie }
      })
    },
    totals() {
      const sum = { calorie: 0, protein: 0, carbs: 0, fat: 0 }
      this.dayRecords.forEach((r) => {
        sum.calorie += r.totals.calorie
        sum.protein += r.totals.protein
        sum.carbs += r.totals.carbs
        sum.fat += r.totals.fat
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
    if (!this.selectedDate) this.selectedDate = this.todayStr
    this.loadRecords()
  },
  methods: {
    fmtDate(d) {
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${d.getFullYear()}-${m}-${day}`
    },
    fmtTime(d) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },
	
    loadRecords() {
      // mock 历史数据（深拷贝，避免删除操作污染模块级 mock 数据）
      const mock = recordHistoryMock.map((r) => ({
        ...r,
        items: r.items.map((i) => ({ ...i })),
        totals: { ...r.totals },
        source: 'mock'
      }))
      // 录入页保存的真实记录（本地缓存）
      const stored = (uni.getStorageSync('dietRecords') || []).map((r, i) => ({
        ...r,
        id: `s${i}`,
        source: 'store'
      }))
      this.records = mock.concat(stored)
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value
    },
    // 删除单条食材记录
    removeItem(item) {
      const record = this.records.find((r) => r.id === item.recordId)
      if (!record) return
      record.items.splice(item.itemIndex, 1)
      if (!record.items.length) {
        this.records = this.records.filter((r) => r.id !== item.recordId)
      } else {
        this.recalcTotals(record)
      }
      this.persistStoreRecords()
      uni.showToast({ title: '已删除', icon: 'none' })
    },
    // 删除食材后按食材库重新计算该记录的营养汇总
    recalcTotals(record) {
      const sum = { calorie: 0, protein: 0, carbs: 0, fat: 0 }
      record.items.forEach((i) => {
        const food = recordMock.foodLibrary.find((f) => f.name === i.name)
        const w = i.weight / 100
        sum.calorie += i.calorie
        if (food) {
          sum.protein += food.protein * w
          sum.carbs += food.carbs * w
          sum.fat += food.fat * w
        }
      })
      record.totals = {
        calorie: Math.round(sum.calorie),
        protein: Math.round(sum.protein * 10) / 10,
        carbs: Math.round(sum.carbs * 10) / 10,
        fat: Math.round(sum.fat * 10) / 10
      }
    },
    // 仅持久化录入页产生的记录（mock 数据不回写）
    persistStoreRecords() {
      const stored = this.records
        .filter((r) => r.source === 'store')
        .map((r) => ({
          mealType: r.mealType,
          time: r.time,
          items: r.items,
          totals: r.totals
        }))
      uni.setStorageSync('dietRecords', stored)
      // 重载以保持 id 与缓存下标一致
      this.loadRecords()
    },
    // AI 拍照分析：拍摄 / 相册都打开识图弹窗
    takePhoto() {
      if (this.$refs.photoMeal) this.$refs.photoMeal.open('camera')
    },
    chooseImg() {
      if (this.$refs.photoMeal) this.$refs.photoMeal.open('album')
    },
    // 识别结果写入当日「加餐」记录
    onPhotoConfirm(list) {
      const items = list.map((i) => ({
        name: i.name,
        weight: i.weight,
        calorie: Math.round((i.calorie * i.weight) / 100)
      }))
      const sum = { calorie: 0, protein: 0, carbs: 0, fat: 0 }
      list.forEach((i) => {
        const w = i.weight / 100
        sum.calorie += i.calorie * w
        sum.protein += (i.protein || 0) * w
        sum.carbs += (i.carbs || 0) * w
        sum.fat += (i.fat || 0) * w
      })
      const record = {
        mealType: '加餐',
        time: Date.now(),
        items,
        totals: {
          calorie: Math.round(sum.calorie),
          protein: Math.round(sum.protein * 10) / 10,
          carbs: Math.round(sum.carbs * 10) / 10,
          fat: Math.round(sum.fat * 10) / 10
        }
      }
      const stored = uni.getStorageSync('dietRecords') || []
      stored.unshift(record)
      uni.setStorageSync('dietRecords', stored)
      this.loadRecords()
      uni.showToast({ title: `已加入 ${items.length} 种食材`, icon: 'none' })
    },
    goAdd() {
      uni.navigateTo({ url: '/pages/addFood/addFood' })
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

/* 日期选择器 */
.date-bar {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 4rpx rgba(47, 125, 99, 0.04), 0 10rpx 26rpx rgba(47, 125, 99, 0.08);
  transition: transform 0.3s ease;
}
.date-icon {
  margin-right: 12rpx;
}
.date-text {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}


/* AI拍照卡片 */
.card-title{
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
.photo-btn{
  margin:10rpx 0;
}
.img-wrap{
  margin-top:20rpx;
}
.img-wrap image{
  width:100%;
  height:320rpx;
  border-radius:12rpx;
}
.tip{
  text-align:center;
  margin-top:10rpx;
  color:#666;
  font-size:26rpx;
}
/* AI 拍照分析卡片 */
.photo-row {
  display: flex;
  margin-top: 16rpx;
}
.photo-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  font-size: 26rpx;
  color: #3E8F72;
  background: #F3F9F6;
  border: 1rpx solid #DCEFE5;
  border-radius: 999rpx;
}
.photo-action + .photo-action {
  margin-left: 16rpx;
}
.photo-action-primary {
  color: #FFFFFF;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(114, 200, 160, 0.24);
}
.photo-action-text {
  margin-left: 10rpx;
}
.photo-tip {
  font-size: 22rpx;
  color: #A3ABA7;
  line-height: 1.6;
  margin-top: 16rpx;
}

/* 汇总卡片 */
.summary-card {
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 10rpx rgba(47, 125, 99, 0.08), 0 18rpx 40rpx rgba(114, 200, 160, 0.22);
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

/* 餐次分组卡片 */
.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 4rpx rgba(47, 125, 99, 0.04), 0 14rpx 34rpx rgba(47, 125, 99, 0.09);
}
.card-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8rpx;
}
.group-cal {
  font-size: 24rpx;
  font-weight: 400;
  color: #72C8A0;
  margin-left: 16rpx;
}
.empty-line {
  font-size: 26rpx;
  color: #999999;
  padding: 24rpx 0;
  text-align: center;
}

/* 记录条目 */
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F2F1;
  transition: transform 0.3s ease;
}
.record-item:last-child {
  border-bottom: none;
}
.record-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 6rpx;
}
.record-sub {
  font-size: 22rpx;
  color: #999999;
}
.record-right {
  display: flex;
  align-items: center;
}
.record-cal {
  font-size: 26rpx;
  font-weight: 600;
  color: #72C8A0;
  margin-right: 20rpx;
}
.record-delete {
  display: flex;
  align-items: center;
  padding: 8rpx 4rpx;
}

/* 空状态 */
.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 32rpx;
}
.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 32rpx;
}
.empty-btn {
  font-size: 28rpx;
  color: #FFFFFF;
  background: #72C8A0;
  border-radius: 999rpx;
  padding: 16rpx 48rpx;
}
.btn-hover {
  opacity: 0.7;
}
.press-scale {
  transform: scale(0.98);
}
</style>
