<template>
  <view class="page">
    <!-- 日历组件（经期开启时展示） -->
    <view class="card cal-card" v-if="enabled">
      <view class="cal-title">{{ calYear }}年{{ calMonth }}月</view>
      <view class="cal-week">
        <text class="cal-week-item" v-for="w in weekLabels" :key="w">{{ w }}</text>
      </view>
      <view class="cal-grid">
        <view class="cal-cell" v-for="(cell, i) in calCells" :key="i">
          <view
            v-if="cell.day"
            class="cal-day"
            :class="{ 'cal-day-period': cell.isPeriod, 'cal-day-today': cell.isToday }"
          >
            {{ cell.day }}
          </view>
        </view>
      </view>
      <view class="cal-legend">
        <text class="legend-dot legend-period"></text>
        <text class="legend-text">经期</text>
        <text class="legend-dot legend-today"></text>
        <text class="legend-text">今天</text>
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="card">
      <view class="form-item">
        <text class="form-label">末次月经日期</text>
        <picker mode="date" :value="lastDate" :end="todayStr" @change="onLastDateChange">
          <view class="form-value" hover-class="press-scale">
            <text>{{ lastDate }}</text>
            <u-icon class="form-arrow" name="arrow-right" size="28rpx" color="#999"></u-icon>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="form-label">周期天数</text>
        <view class="form-value">
          <input class="form-input" type="number" v-model="cycleDays" @blur="onNumberBlur" />
          <text class="form-unit">天</text>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">经期持续天数</text>
        <view class="form-value">
          <input class="form-input" type="number" v-model="periodDays" @blur="onNumberBlur" />
          <text class="form-unit">天</text>
        </view>
      </view>
      <view class="form-item form-item-last">
        <view>
          <view class="form-label">生理期功能</view>
          <view class="form-desc">关闭后，各页面的生理期内容将全部隐藏</view>
        </view>
        <switch :checked="enabled" color="#72C8A0" @change="onToggle" />
      </view>
    </view>

    <template v-if="enabled">
      <!-- 推算结果 -->
      <view class="result-card">
        <view class="result-phase">
          <view class="phase-name">{{ phaseName }}</view>
          <view class="phase-day" v-if="phaseName === '经期'">第 {{ dayOffset }} 天</view>
        </view>
        <view class="result-tip">{{ phaseInfo.tip }}</view>
        <view class="result-next">预估下次来潮：{{ nextDateText }}</view>
      </view>

      <!-- 一键更新 -->
      <view class="period-btn" hover-class="btn-hover" @click="markToday">
        <u-icon class="period-btn-icon" name="calendar-fill" size="30rpx" color="#FFFFFF"></u-icon>
        <text>今天来月经</text>
      </view>

      <!-- 阶段小贴士 -->
      <view class="card tips-card">
        <view class="card-title">
          <u-icon class="card-title-icon" name="info-circle" size="30rpx" color="#E6A23C"></u-icon>
          <text>{{ phaseName }}小贴士</text>
        </view>
        <view class="tips-text">{{ phaseInfo.science }}</view>
      </view>
    </template>

    <!-- 关闭状态提示 -->
    <view v-else class="card off-card">
      <view class="off-icon">
        <u-icon name="info-circle" size="64rpx" color="#999999"></u-icon>
      </view>
      <view class="off-text">生理期功能已关闭，相关推算与提示已隐藏</view>
    </view>

    <footer-tip />
  </view>
</template>

<script>
import { periodMock } from '@/common/mock.js'

const SETTINGS_KEY = 'periodSettings'
const DAY_MS = 24 * 60 * 60 * 1000

export default {
  data() {
    return {
      enabled: true,
      lastDate: periodMock.settings.lastDate,
      cycleDays: periodMock.settings.cycleDays,
      periodDays: periodMock.settings.periodDays,
      weekLabels: ['日', '一', '二', '三', '四', '五', '六'],
      calYear: 0,
      calMonth: 0,
      calCells: []
    }
  },
  computed: {
    todayStr() {
      return this.fmtYmd(new Date())
    },
    // 今天是周期第几天（末次月经为第1天）
    dayOffset() {
      const diff = this.startOfDay(new Date()) - this.startOfDay(this.parseDate(this.lastDate))
      return Math.round(diff / DAY_MS) + 1
    },
    phaseName() {
      return this.phaseOf(this.dayOffset)
    },
    phaseInfo() {
      return periodMock.phases[this.phaseName]
    },
    // 预估下次来潮日期
    nextDateText() {
      let next = this.addDays(this.parseDate(this.lastDate), Number(this.cycleDays) || 28)
      const today = this.startOfDay(new Date())
      while (next < today) {
        next = this.addDays(next, Number(this.cycleDays) || 28)
      }
      return this.fmtYmd(next)
    }
  },
  onLoad() {
    // 读取本地设置与总开关
    const saved = uni.getStorageSync(SETTINGS_KEY)
    if (saved) {
      this.lastDate = saved.lastDate
      this.cycleDays = saved.cycleDays
      this.periodDays = saved.periodDays
    }
    this.enabled = uni.getStorageSync('periodEnabled') !== false
    this.buildCalendar()
  },
  methods: {
    parseDate(str) {
      return new Date(str.replace(/-/g, '/'))
    },
    startOfDay(d) {
      const t = new Date(d)
      t.setHours(0, 0, 0, 0)
      return t
    },
    addDays(d, n) {
      return new Date(d.getTime() + n * DAY_MS)
    },
    fmtYmd(d) {
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
    },
    // 推算第 offset 天所属阶段
    phaseOf(offset) {
      const cycle = Number(this.cycleDays) || 28
      const period = Number(this.periodDays) || 5
      if (offset < 1) return '黄体期'
      const day = ((offset - 1) % cycle) + 1
      if (day <= period) return '经期'
      const ovu = cycle - 14
      if (day < ovu - 1) return '卵泡期'
      if (day <= ovu + 1) return '排卵期'
      return '黄体期'
    },
    // 构建当月日历，标记经期日期
    buildCalendar() {
      const now = new Date()
      this.calYear = now.getFullYear()
      this.calMonth = now.getMonth() + 1
      const firstWeekday = new Date(this.calYear, now.getMonth(), 1).getDay()
      const daysInMonth = new Date(this.calYear, now.getMonth() + 1, 0).getDate()
      const periodSet = this.buildPeriodSet()
      const todayKey = `${this.calYear}-${this.calMonth}-${now.getDate()}`
      const cells = []
      for (let i = 0; i < firstWeekday; i++) cells.push({ day: 0 })
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${this.calYear}-${this.calMonth}-${d}`
        cells.push({
          day: d,
          isPeriod: periodSet.has(key),
          isToday: key === todayKey
        })
      }
      this.calCells = cells
    },
    // 生成前后若干周期的经期日期集合
    buildPeriodSet() {
      const set = new Set()
      const cycle = Number(this.cycleDays) || 28
      const period = Number(this.periodDays) || 5
      const start = this.parseDate(this.lastDate)
      for (let k = -3; k <= 3; k++) {
        const s = this.addDays(start, k * cycle)
        for (let i = 0; i < period; i++) {
          const d = this.addDays(s, i)
          set.add(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`)
        }
      }
      return set
    },
    onLastDateChange(e) {
      this.lastDate = e.detail.value
      this.saveSettings()
    },
    onNumberBlur() {
      // 简单范围校验
      let cycle = parseInt(this.cycleDays, 10)
      if (isNaN(cycle) || cycle < 20) cycle = 20
      if (cycle > 45) cycle = 45
      let period = parseInt(this.periodDays, 10)
      if (isNaN(period) || period < 1) period = 1
      if (period > 10) period = 10
      this.cycleDays = cycle
      this.periodDays = period
      this.saveSettings()
    },
    onToggle(e) {
      this.enabled = e.detail.value
      uni.setStorageSync('periodEnabled', this.enabled)
      uni.showToast({
        title: this.enabled ? '已开启生理期功能' : '已关闭生理期功能',
        icon: 'none'
      })
    },
    // 一键把今天设为经期起始日
    markToday() {
      this.lastDate = this.todayStr
      this.saveSettings()
      uni.showToast({ title: '已更新经期起始日', icon: 'success' })
    },
    saveSettings() {
      uni.setStorageSync(SETTINGS_KEY, {
        lastDate: this.lastDate,
        cycleDays: Number(this.cycleDays) || 28,
        periodDays: Number(this.periodDays) || 5
      })
      this.buildCalendar()
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

/* 通用卡片 */
.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}
.card-title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 20rpx;
}
.card-title-icon {
  margin-right: 10rpx;
}
.btn-hover {
  opacity: 0.7;
}
.press-scale {
  transform: scale(0.98);
}

/* 日历卡片 */
.cal-card {
  border-top: 4rpx solid rgba(232, 184, 192, 0.3);
}

/* 日历 */
.cal-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  text-align: center;
  margin-bottom: 24rpx;
}
.cal-week {
  display: flex;
  margin-bottom: 12rpx;
}
.cal-week-item {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: #999999;
}
.cal-grid {
  display: flex;
  flex-wrap: wrap;
}
.cal-cell {
  width: 14.28%;
  display: flex;
  justify-content: center;
  margin-bottom: 12rpx;
}
.cal-day {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #333333;
}
.cal-day-period {
  background: #E8B8C0;
  color: #FFFFFF;
}
.cal-day-today {
  border: 2rpx solid #72C8A0;
  box-sizing: border-box;
}
.cal-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
}
.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}
.legend-period {
  background: #E8B8C0;
}
.legend-today {
  border: 2rpx solid #72C8A0;
  box-sizing: border-box;
  margin-left: 32rpx;
}
.legend-text {
  font-size: 22rpx;
  color: #999999;
}

/* 表单 */
.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F0F2F1;
}
.form-item-last {
  border-bottom: none;
}
.form-label {
  font-size: 28rpx;
  color: #333333;
}
.form-desc {
  font-size: 22rpx;
  color: #999999;
  margin-top: 6rpx;
}
.form-value {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #666666;
  transition: transform 0.3s ease;
}
.form-arrow {
  margin-left: 8rpx;
}
.form-input {
  width: 100rpx;
  text-align: right;
  font-size: 28rpx;
  color: #333333;
}
.form-unit {
  font-size: 24rpx;
  color: #999999;
  margin-left: 8rpx;
}

/* 推算结果 */
.result-card {
  background: linear-gradient(135deg, #E8B8C0 0%, #F2CDD4 100%);
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(232, 184, 192, 0.20);
}
.result-phase {
  display: flex;
  align-items: baseline;
  margin-bottom: 12rpx;
}
.phase-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-right: 16rpx;
}
.phase-day {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}
.result-tip {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 16rpx;
}
.result-next {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

/* 一键更新按钮 */
.period-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
  background: #72C8A0;
  border-radius: 999rpx;
  padding: 24rpx 0;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(114, 200, 160, 0.18);
}
.period-btn-icon {
  margin-right: 10rpx;
}

/* 小贴士 */
.tips-card {
  background: #FDF3E3;
  border: 1rpx solid #F0D9B5;
  box-shadow: 0 4rpx 20rpx rgba(230, 162, 60, 0.15);
}
.tips-text {
  font-size: 26rpx;
  color: #8A6D3B;
  line-height: 1.7;
}

/* 关闭状态 */
.off-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 32rpx;
}
.off-icon {
  margin-bottom: 16rpx;
}
.off-text {
  font-size: 26rpx;
  color: #999999;
}
</style>
