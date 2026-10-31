<template>
  <view class="page">
    <!-- 日期选择器 -->
    <picker mode="date" :value="selectedDate" :end="todayStr" @change="onDateChange">
      <view class="date-bar" hover-class="btn-hover">
        <u-icon class="date-icon" name="calendar" size="32rpx" color="#72C8A0"></u-icon>
        <text class="date-text">{{ selectedDate }}</text>
        <u-icon class="date-arrow" name="arrow-down" size="24rpx" color="#999"></u-icon>
      </view>
    </picker>

    <!-- 评分卡片 -->
    <view class="score-card">
      <view class="score-left">
        <view class="score-num">{{ score === null ? '--' : score }}</view>
        <view class="score-label">今日评分</view>
      </view>
      <view class="score-right">
        <view class="phase-tag" :class="{ 'phase-tag-period': phaseKey === 'period' }">
          {{ phaseText.label }}
        </view>
        <view class="score-cal" v-if="score !== null">
          已摄入 {{ totals.calorie }} / 目标 {{ targetCalorie }} kcal
        </view>
        <view class="score-cal" v-else>当天暂无饮食记录</view>
      </view>
    </view>

    <!-- 近7天热量折线图 -->
    <view class="card">
      <view class="card-title">近7天热量</view>
      <view class="chart" @click="closeTooltip">
        <view
          class="chart-line"
          v-for="(l, i) in chartLines"
          :key="'line' + i"
          :style="{ left: l.left + 'rpx', top: l.top + 'rpx', width: l.width + 'rpx', transform: 'rotate(' + l.angle + 'deg)', background: l.color }"
        ></view>
        <view
          class="chart-value"
          v-for="(p, i) in chartPoints"
          :key="'val' + i"
          :style="{ left: p.x - 50 + 'rpx', top: p.y - 44 + 'rpx' }"
        >{{ p.calorie || '' }}</view>
        <!-- 点击热区（坐标收敛到图表区内，避免负值定位） -->
        <view
          class="chart-hit"
          v-for="(p, i) in chartPoints"
          :key="'hit' + i"
          :style="{ left: p.hitLeft + 'rpx', top: p.hitTop + 'rpx' }"
          @click.stop="selectPoint(i)"
        ></view>
        <view
          class="chart-point"
          :class="{ 'chart-point-active': activePointIndex === i }"
          v-for="(p, i) in chartPoints"
          :key="'point' + i"
          :style="{ left: p.x - 8 + 'rpx', top: p.y - 8 + 'rpx', background: p.color }"
        ></view>
        <!-- 点击详情气泡 -->
        <view
          v-if="activePoint"
          class="chart-tooltip"
          :style="{ left: activePoint.tipLeft + 'rpx', top: activePoint.tipTop + 'rpx' }"
        >
          <view class="tooltip-date">
            {{ activePoint.dateLabel }}
            <text v-if="activePoint.isPeriod" class="tooltip-period">经期</text>
          </view>
          <view class="tooltip-cal">{{ activePoint.calorie ? activePoint.calorie + ' kcal' : '无记录' }}</view>
          <view class="tooltip-diff" v-if="activePoint.calorie">{{ activePoint.diffText }}</view>
        </view>
      </view>
      <view class="chart-dates">
        <text class="chart-date" v-for="(p, i) in chartPoints" :key="'d' + i">{{ p.dateLabel }}</text>
      </view>
      <view class="chart-legend" v-if="periodEnabled">
        <text class="legend-dot legend-period"></text>
        <text class="legend-text">经期</text>
        <text class="legend-dot legend-normal"></text>
        <text class="legend-text">其他日期</text>
      </view>
    </view>

    <!-- 诊断总结 -->
    <view class="card summary-card">
      <view class="card-title">
        <u-icon class="card-title-icon" name="file-text-fill" size="32rpx" color="#72C8A0"></u-icon>
        <text>诊断总结</text>
      </view>
      <view class="summary-text">{{ phaseText.summary }}</view>
    </view>

    <!-- 明日饮食建议 -->
    <view class="card">
      <view class="card-title">
        <u-icon class="card-title-icon" name="checkmark-circle-fill" size="32rpx" color="#72C8A0"></u-icon>
        <text>明日饮食建议</text>
      </view>
      <view class="goal-item" v-for="(s, i) in phaseText.suggestions" :key="i">
        <text class="goal-dot"></text>
        <text class="goal-text">{{ s }}</text>
      </view>
    </view>

    <footer-tip />
  </view>
</template>

<script>
import { reviewMock, recordHistoryMock, periodMock } from '@/common/mock.js'

const DAY_MS = 24 * 60 * 60 * 1000
const CHART_W = 620 // rpx
const CHART_H = 300 // rpx

export default {
  data() {
    return {
      targetCalorie: reviewMock.targetCalorie,
      selectedDate: '',
      records: [],
      periodEnabled: true,
      periodSettings: periodMock.settings,
      activePointIndex: -1
    }
  },
  computed: {
    todayStr() {
      return this.fmtYmd(new Date())
    },
    selectedDateObj() {
      return this.parseDate(this.selectedDate)
    },
    // 所选日期的记录
    dayRecords() {
      return this.records.filter((r) => this.fmtYmd(new Date(r.time)) === this.selectedDate)
    },
    totals() {
      let calorie = 0
      this.dayRecords.forEach((r) => (calorie += r.totals.calorie))
      return { calorie: Math.round(calorie) }
    },
    // 评分：越接近目标越高，无记录为 null
    score() {
      if (!this.dayRecords.length) return null
      const ratio = this.totals.calorie / this.targetCalorie
      return Math.round(Math.max(60, 100 - Math.abs(ratio - 1) * 100))
    },
    // 所选日期处于周期第几天
    dayOffset() {
      const diff =
        this.startOfDay(this.selectedDateObj) -
        this.startOfDay(this.parseDate(this.periodSettings.lastDate))
      return Math.round(diff / DAY_MS) + 1
    },
    // 生理阶段：经期 / 经前期 / 经后黄金期 / 普通减脂期
    phaseKey() {
      if (!this.periodEnabled) return 'normal'
      const cycle = Number(this.periodSettings.cycleDays) || 28
      const period = Number(this.periodSettings.periodDays) || 5
      if (this.dayOffset < 1) return 'normal'
      const day = ((this.dayOffset - 1) % cycle) + 1
      if (day <= period) return 'period'
      const ovu = cycle - 14
      if (day < ovu - 1) return 'golden'
      if (day <= ovu + 1) return 'normal'
      return 'prePeriod'
    },
    phaseText() {
      return reviewMock.phaseTexts[this.phaseKey]
    },
    // 近7天数据（以所选日期为最后一天）
    weekData() {
      const list = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(this.selectedDateObj.getTime() - i * DAY_MS)
        const key = this.fmtYmd(d)
        const real = this.records
          .filter((r) => this.fmtYmd(new Date(r.time)) === key)
          .reduce((s, r) => s + r.totals.calorie, 0)
        const mockItem = reviewMock.weekCalories.find((w) => w.daysAgo === i)
        list.push({
          date: d,
          dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
          calorie: Math.round(real) || (mockItem ? mockItem.calorie : 0),
          isPeriod: this.isPeriodDay(d)
        })
      }
      return list
    },
    chartPoints() {
      const maxV = Math.max(...this.weekData.map((w) => w.calorie), 1) * 1.15
      const step = CHART_W / 6
      return this.weekData.map((w, i) => {
        const x = i * step
        const y = (1 - w.calorie / maxV) * (CHART_H - 40) + 20
        return {
          x,
          y,
          // 点击热区坐标（60rpx 见方，收敛到图表区内）
          hitLeft: Math.min(Math.max(x - 30, 0), CHART_W - 60),
          hitTop: Math.min(Math.max(y - 30, 0), CHART_H - 60),
          calorie: w.calorie,
          dateLabel: w.dateLabel,
          color: w.isPeriod && this.periodEnabled ? '#E8B8C0' : '#72C8A0'
        }
      })
    },
    // 当前选中的数据点详情（含气泡位置）
    activePoint() {
      const i = this.activePointIndex
      if (typeof i !== 'number' || i < 0) return null
      const points = this.chartPoints || []
      const week = this.weekData || []
      const p = points[i]
      const w = week[i]
      if (!p || !w) return null
      const diff = w.calorie - this.targetCalorie
      const diffText = diff > 0 ? `超出目标 ${diff} kcal` : diff < 0 ? `低于目标 ${-diff} kcal` : '刚好达标'
      return {
        dateLabel: w.dateLabel,
        calorie: w.calorie,
        isPeriod: w.isPeriod && this.periodEnabled,
        diffText,
        // 气泡宽 220rpx，左右越界时向内收敛
        tipLeft: Math.min(Math.max(p.x - 110, 0), CHART_W - 220),
        tipTop: Math.max(p.y - 150, 0)
      }
    },
    chartLines() {
      const lines = []
      for (let i = 0; i < this.chartPoints.length - 1; i++) {
        const p1 = this.chartPoints[i]
        const p2 = this.chartPoints[i + 1]
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        lines.push({
          left: p1.x,
          top: p1.y,
          width: Math.sqrt(dx * dx + dy * dy),
          angle: (Math.atan2(dy, dx) * 180) / Math.PI,
          color: '#D5EDE0'
        })
      }
      return lines
    }
  },
  onLoad() {
    this.selectedDate = this.todayStr
  },
  onShow() {
    this.periodEnabled = uni.getStorageSync('periodEnabled') !== false
    this.periodSettings = uni.getStorageSync('periodSettings') || periodMock.settings
    // 每日热量目标跟随「我的」页设置
    const target = Number(uni.getStorageSync('calorieTarget'))
    this.targetCalorie =
      target >= 800 && target <= 3000 ? target : reviewMock.targetCalorie
    // mock 历史 + 录入的真实记录
    const stored = uni.getStorageSync('dietRecords') || []
    this.records = recordHistoryMock.concat(stored)
  },
  methods: {
    selectPoint(i) {
      // 再次点击同一点则收起
      this.activePointIndex = this.activePointIndex === i ? -1 : i
    },
    closeTooltip() {
      if (this.activePointIndex !== -1) this.activePointIndex = -1
    },
    parseDate(str) {
      return new Date(str.replace(/-/g, '/'))
    },
    startOfDay(d) {
      const t = new Date(d)
      t.setHours(0, 0, 0, 0)
      return t
    },
    fmtYmd(d) {
      const p = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
    },
    // 判断某天是否为经期
    isPeriodDay(date) {
      const cycle = Number(this.periodSettings.cycleDays) || 28
      const period = Number(this.periodSettings.periodDays) || 5
      const start = this.startOfDay(this.parseDate(this.periodSettings.lastDate))
      const diff = Math.round((this.startOfDay(date) - start) / DAY_MS)
      if (diff < 0) {
        const day = ((diff % cycle) + cycle) % cycle
        return day < period
      }
      return diff % cycle < period
    },
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.activePointIndex = -1
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
.btn-hover {
  opacity: 0.7;
}

/* 日期选择器 */
.date-bar {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
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

/* 评分卡片 */
.score-card {
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(114, 200, 160, 0.18);
}
.score-left {
  margin-right: 40rpx;
  text-align: center;
}
.score-num {
  font-size: 88rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}
.score-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 10rpx;
}
.score-right {
  flex: 1;
}
.phase-tag {
  display: inline-block;
  font-size: 22rpx;
  color: #FFFFFF;
  border: 1rpx solid rgba(255, 255, 255, 0.7);
  border-radius: 999rpx;
  padding: 6rpx 24rpx;
  margin-bottom: 16rpx;
}
.phase-tag-period {
  background: #E8B8C0;
  border-color: #E8B8C0;
}
.score-cal {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.95);
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

/* 折线图 */
.chart {
  position: relative;
  width: 620rpx;
  height: 300rpx;
  margin: 0 auto;
}
.chart-line {
  position: absolute;
  height: 2rpx;
  transform-origin: left center;
}
.chart-point {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}
.chart-point-active {
  box-shadow: 0 0 0 8rpx rgba(114, 200, 160, 0.25);
}
.chart-hit {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  z-index: 2;
}
.chart-tooltip {
  position: absolute;
  z-index: 3;
  width: 220rpx;
  background: #333333;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.18);
}
.tooltip-date {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6rpx;
}
.tooltip-period {
  font-size: 20rpx;
  color: #FFFFFF;
  background: #E8B8C0;
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
  margin-left: 10rpx;
}
.tooltip-cal {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 4rpx;
}
.tooltip-diff {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.7);
}
.chart-value {
  position: absolute;
  width: 100rpx;
  text-align: center;
  font-size: 20rpx;
  color: #999999;
}
.chart-dates {
  display: flex;
  width: 620rpx;
  margin: 12rpx auto 0;
}
.chart-date {
  flex: 1;
  text-align: center;
  font-size: 20rpx;
  color: #999999;
}
.chart-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
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
.legend-normal {
  background: #72C8A0;
  margin-left: 32rpx;
}
.legend-text {
  font-size: 22rpx;
  color: #999999;
}

/* 诊断总结 */
.summary-card {
  background: #FDF3E3;
  border: 1rpx solid #F0D9B5;
  box-shadow: 0 4rpx 20rpx rgba(230, 162, 60, 0.15);
}
.summary-text {
  font-size: 26rpx;
  color: #8A6D3B;
  line-height: 1.7;
}

/* 明日建议 */
.goal-item {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
}
.goal-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #72C8A0;
  margin-right: 16rpx;
  flex-shrink: 0;
}
.goal-text {
  font-size: 28rpx;
  color: #333333;
}
</style>
