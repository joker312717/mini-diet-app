<template>
  <view class="page">
    <!-- 激励语录卡片 -->
    <view class="quote-card">
      <view class="quote-mark">“</view>
      <view class="quote-text">{{ currentQuote }}</view>
      <view class="quote-refresh" hover-class="btn-hover" @click="nextQuote">换一句</view>
    </view>

    <!-- 我的小宠物 -->
    <daily-pet ref="petCard" />

    <!-- 连续打卡卡片 -->
    <view class="card">
      <view class="checkin-head">
        <view>
          <view class="streak-num">{{ streakDays }}<text class="streak-unit"> 天</text></view>
          <view class="streak-label">连续打卡</view>
        </view>
        <view
          class="checkin-btn"
          :class="{ 'checkin-btn-done': checkedToday }"
          hover-class="btn-hover"
          @click="checkin"
        >
          {{ checkedToday ? '今日已打卡' : '今日打卡' }}
        </view>
      </view>
      <view class="week-row">
        <view class="week-item" v-for="(done, i) in weekCheckins" :key="i">
          <view
            class="week-dot"
            :class="{
              'week-dot-done': done,
              'week-dot-today': i === todayIndex && !done
            }"
          >
            <u-icon v-if="done" name="checkmark" color="#fff" size="28rpx"></u-icon>
          </view>
          <view class="week-label" :class="{ 'week-label-today': i === todayIndex }">
            {{ weekLabels[i] }}
          </view>
        </view>
      </view>
    </view>

    <!-- 徽章墙 -->
    <view class="card">
      <view class="card-title">徽章墙</view>
      <view class="badge-grid">
        <view
          class="badge-item"
          :class="{ 'badge-locked': !badge.unlocked }"
          v-for="badge in badges"
          :key="badge.id"
          hover-class="btn-hover"
          @click="openBadge(badge)"
        >
          <view class="badge-icon">
            <image class="badge-glyph" :src="badgeGlyph(badge)" mode="aspectFit"></image>
          </view>
          <view class="badge-name">{{ badge.name }}</view>
          <view class="badge-desc">{{ badge.unlocked ? badge.condition : badge.progress }}</view>
        </view>
      </view>
    </view>

    <!-- 徽章详情弹窗 -->
    <u-popup :show="badgePopupShow" mode="center" round="24" @close="badgePopupShow = false">
      <view
        class="badge-popup"
        :class="{ 'popup-locked': activeBadge && !activeBadge.unlocked }"
        v-if="activeBadge"
      >
        <view class="popup-stage">
          <view v-if="activeBadge.unlocked" class="halo halo-1"></view>
          <view v-if="activeBadge.unlocked" class="halo halo-2"></view>
          <view
            class="badge-popup-icon"
            :class="{
              'badge-popup-locked': !activeBadge.unlocked,
              'icon-heart': activeBadge.unlocked && activeBadge.icon === 'heart-fill'
            }"
          >
            <image class="badge-glyph-lg" :src="badgeGlyph(activeBadge, true)" mode="aspectFit"></image>
          </view>
          <!-- 奖章外圈：八颗小圆点组成的旋转花环 -->
          <view
            v-if="activeBadge.unlocked"
            class="medal-ring"
            :class="{ 'ring-heart': activeBadge.icon === 'heart-fill' }"
          ></view>
          <text v-if="activeBadge.unlocked" class="spark spark-1"></text>
          <text v-if="activeBadge.unlocked" class="spark spark-2"></text>
          <text v-if="activeBadge.unlocked" class="spark spark-3"></text>
        </view>

        <!-- 卡片四角小闪光 -->
        <view v-if="activeBadge.unlocked" class="corner-star cs-1"></view>
        <view v-if="activeBadge.unlocked" class="corner-star cs-2"></view>
        <view v-if="activeBadge.unlocked" class="corner-star cs-3"></view>
        <view v-if="activeBadge.unlocked" class="corner-star cs-4"></view>

        <view class="badge-popup-name">{{ activeBadge.name }}</view>
        <view
          class="badge-popup-status"
          :class="{ 'status-locked': !activeBadge.unlocked }"
        >
          {{ activeBadge.unlocked ? '已解锁' : `未解锁 ${activeBadge.progress}` }}
        </view>

        <view v-if="badgeProgress" class="popup-progress">
          <view class="popup-progress-bar">
            <view class="popup-progress-fill" :style="{ width: badgeProgress.percent + '%' }"></view>
          </view>
          <text class="popup-progress-text">{{ badgeProgress.cur }}/{{ badgeProgress.total }}</text>
        </view>

        <view class="badge-popup-row">
          <text class="badge-popup-label">解锁条件</text>
          <text class="badge-popup-value">{{ activeBadge.condition }}</text>
        </view>
        <view class="badge-popup-row">
          <text class="badge-popup-label">徽章介绍</text>
          <text class="badge-popup-value">{{ activeBadge.intro }}</text>
        </view>
        <view class="badge-popup-btn" hover-class="btn-hover" @click="badgePopupShow = false">
          我知道了
        </view>
      </view>
    </u-popup>

    <!-- 达标成功弹窗 -->
    <u-popup :show="achieveShow" mode="center" round="24" @close="achieveShow = false">
      <view class="achieve-popup" v-if="achieveBadge">
        <view class="achieve-confetti">
          <u-icon name="gift-fill" color="#E6A23C" size="72rpx"></u-icon>
        </view>
        <view class="achieve-title">达标成功</view>
        <view class="achieve-badge">
          <view class="achieve-badge-icon">
            <image class="badge-glyph-lg" :src="badgeGlyph(achieveBadge)" mode="aspectFit"></image>
          </view>
          <view class="achieve-badge-name">{{ achieveBadge.name }}</view>
        </view>
        <view class="achieve-text">{{ achieveText }}</view>
        <view class="achieve-actions">
          <view class="achieve-btn achieve-btn-plain" hover-class="btn-hover" @click="achieveShow = false">
            知道了
          </view>
          <view class="achieve-btn achieve-btn-primary" hover-class="btn-hover" @click="savePoster">
            保存海报
          </view>
        </view>
      </view>
    </u-popup>

    <footer-tip />
  </view>
</template>

<script>
import { motivateMock, homeMock } from '@/common/mock.js'
import { getBadgeGlyph } from '@/common/badgeIcons.js'
import DailyPet from '@/components/daily-pet/daily-pet.vue'

const CHECKIN_KEY = 'lastCheckInDate'

export default {
  components: { DailyPet },
  data() {
    return {
      allQuotes: motivateMock.quotes,
      quoteIndex: 0,
      // 生理期功能是否开启（男生模式关闭后，语录里不展示经期相关内容）
      periodOn: true,
      streakDays: motivateMock.streakDays,
      weekCheckins: [...motivateMock.weekCheckins],
      weekLabels: ['一', '二', '三', '四', '五', '六', '日'],
      allBadges: motivateMock.badges,
      checkedToday: false,
      todayIndex: 0,
      inPeriod: false,
      // 徽章详情弹窗
      badgePopupShow: false,
      activeBadge: null,
      // 达标成功弹窗
      achieveShow: false,
      achieveBadge: null
    }
  },
  computed: {
    // 男生模式下过滤掉经期/生理期相关语录，其余语录全部保留
    quotes() {
      if (this.periodOn) return this.allQuotes
      return this.allQuotes.filter((q) => !/经期|生理期|大姨妈/.test(q))
    },
    currentQuote() {
      return this.quotes[this.quoteIndex] || this.quotes[0]
    },
    // 男生模式：隐藏生理期相关徽章、补上男生专属徽章；女生模式：保留原 6 枚、隐藏男生专属
    badges() {
      if (this.periodOn) return this.allBadges.filter((b) => !b.maleOnly)
      return this.allBadges.filter(
        (b) => !/生理期|经期|大姨妈/.test(b.name + b.condition + b.intro)
      )
    },
    // 鼓励文案：经期版本 / 普通版本
    achieveText() {
      return this.inPeriod ? motivateMock.achieveText.period : motivateMock.achieveText.normal
    },
    // 未解锁徽章的进度（progress 形如 "8/21"）
    badgeProgress() {
      if (!this.activeBadge || this.activeBadge.unlocked) return null
      const parts = String(this.activeBadge.progress || '').split('/')
      const cur = Number(parts[0]) || 0
      const total = Number(parts[1]) || 0
      return {
        cur,
        total,
        percent: total ? Math.min(100, Math.round((cur / total) * 100)) : 0
      }
    }
  },
  onShow() {
    // 宠物状态跟随最新饮食记录刷新
    if (this.$refs.petCard) this.$refs.petCard.refresh()
    // 周一为一周起点
    this.todayIndex = (new Date().getDay() + 6) % 7
    this.checkedToday = uni.getStorageSync(CHECKIN_KEY) === this.todayStr()
    if (this.checkedToday) {
      this.$set(this.weekCheckins, this.todayIndex, true)
    }
    const enabled = uni.getStorageSync('periodEnabled') !== false
    this.periodOn = enabled
    this.inPeriod = enabled && homeMock.periodInfo.phase === '经期'
    // 语录池变短后，把越界的下标拉回第一句
    if (this.quoteIndex >= this.quotes.length) this.quoteIndex = 0
  },
  methods: {
    // 徽章图案：onDark 用于深色圆底（纯白图案），否则按徽章配色
    badgeGlyph(badge, onDark) {
      if (!badge) return ''
      if (!badge.unlocked) return getBadgeGlyph(badge.id, '#C0C4CC')
      if (onDark) return getBadgeGlyph(badge.id, '#FFFFFF')
      return getBadgeGlyph(badge.id, badge.id === 4 ? '#E8B8C0' : '#72C8A0')
    },
    todayStr() {
      const d = new Date()
      return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
    },
    nextQuote() {
      this.quoteIndex = (this.quoteIndex + 1) % this.quotes.length
    },
    checkin() {
      if (this.checkedToday) {
        uni.showToast({ title: '今天已经打过卡啦', icon: 'none' })
        return
      }
      this.checkedToday = true
      this.streakDays += 1
      this.$set(this.weekCheckins, this.todayIndex, true)
      uni.setStorageSync(CHECKIN_KEY, this.todayStr())
      // 打卡成功后立即刷新宠物状态，表情从「不开心」切到「开心」
      if (this.$refs.petCard) this.$refs.petCard.refresh()
      // 打卡达标，弹出达标成功弹窗（演示：展示连续7天徽章）
      this.achieveBadge = this.badges.find((b) => b.id === 2)
      setTimeout(() => {
        this.achieveShow = true
      }, 300)
    },
    openBadge(badge) {
      this.activeBadge = badge
      this.badgePopupShow = true
    },
    // 保存海报：H5 用 canvas 绘制后直接下载，其他端提示截图保存
    savePoster() {
      const badge = this.achieveBadge
      if (!badge) return
      // #ifdef H5
      this.drawPoster(badge)
      // #endif
      // #ifndef H5
      uni.showToast({ title: '请长按图片或截图保存', icon: 'none' })
      // #endif
    },
    // 用 canvas 画一张 750×1000 的达标海报
    drawPoster(badge) {
      const W = 750
      const H = 1000
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext('2d')
      const cx = W / 2

      // 背景与顶部色带
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0, '#FFFFFF')
      bg.addColorStop(1, '#E8F6EF')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)
      const band = ctx.createLinearGradient(0, 0, W, 300)
      band.addColorStop(0, '#72C8A0')
      band.addColorStop(1, '#8FD8B8')
      ctx.fillStyle = band
      ctx.fillRect(0, 0, W, 300)

      // 徽章白色底盘
      ctx.beginPath()
      ctx.arc(cx, 300, 118, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
      ctx.fill()

      const finish = () => {
        ctx.textAlign = 'center'
        ctx.fillStyle = '#2F3A36'
        ctx.font = '600 40px "PingFang SC","Microsoft YaHei",sans-serif'
        ctx.fillText('达标成功', cx, 492)
        ctx.font = '600 34px "PingFang SC","Microsoft YaHei",sans-serif'
        ctx.fillText(badge.name, cx, 546)
        ctx.fillStyle = '#8FA39B'
        ctx.font = '24px "PingFang SC","Microsoft YaHei",sans-serif'
        ctx.fillText(`解锁于 ${this.fmtToday()}`, cx, 588)

        ctx.strokeStyle = '#E3EEE8'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(150, 630)
        ctx.lineTo(600, 630)
        ctx.stroke()

        ctx.fillStyle = '#4A5751'
        ctx.font = '26px "PingFang SC","Microsoft YaHei",sans-serif'
        this.wrapText(ctx, this.achieveText, cx, 690, 560, 44)

        ctx.fillStyle = '#9AA5A0'
        ctx.font = '22px "PingFang SC","Microsoft YaHei",sans-serif'
        ctx.fillText('好好吃饭，慢慢变瘦 · 减脂饮食记录', cx, 918)

        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `达标海报-${badge.name}.png`
        link.click()
        this.achieveShow = false
        uni.showToast({ title: '海报已保存', icon: 'none' })
      }

      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, cx - 62, 238, 124, 124)
        finish()
      }
      img.onerror = finish
      img.src = this.badgeGlyph(badge)
    },
    // 逐字换行，避免长句溢出画布
    wrapText(ctx, text, cx, startY, maxWidth, lineHeight) {
      let line = ''
      let y = startY
      for (const ch of String(text)) {
        const test = line + ch
        if (line && ctx.measureText(test).width > maxWidth) {
          ctx.fillText(line, cx, y)
          line = ch
          y += lineHeight
        } else {
          line = test
        }
      }
      if (line) ctx.fillText(line, cx, y)
    },
    fmtToday() {
      const d = new Date()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${d.getFullYear()}-${m}-${day}`
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

/* 激励语录卡片 */
.quote-card {
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  position: relative;
  box-shadow: 0 6rpx 20rpx rgba(114, 200, 160, 0.18);
}
.quote-mark {
  font-size: 72rpx;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1;
  margin-bottom: 8rpx;
}
.quote-text {
  font-size: 32rpx;
  color: #FFFFFF;
  line-height: 1.7;
  margin-bottom: 24rpx;
}
.quote-refresh {
  display: inline-block;
  font-size: 24rpx;
  color: #FFFFFF;
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  border-radius: 999rpx;
  padding: 8rpx 28rpx;
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
  margin-bottom: 20rpx;
}
.btn-hover {
  opacity: 0.7;
}
.press-scale {
  transform: scale(0.98);
}

/* 打卡 */
.checkin-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28rpx;
}
.streak-num {
  font-size: 56rpx;
  font-weight: 700;
  color: #72C8A0;
}
.streak-unit {
  font-size: 24rpx;
  font-weight: 400;
  color: #999999;
}
.streak-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
}
.checkin-btn {
  font-size: 28rpx;
  color: #FFFFFF;
  background: #72C8A0;
  border-radius: 999rpx;
  padding: 16rpx 40rpx;
  transition: transform 0.3s ease;
}
.checkin-btn-done {
  background: #EAF6F0;
  color: #72C8A0;
}
.week-row {
  display: flex;
}
.week-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.week-dot {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: #F0F2F1;
  color: #FFFFFF;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}
.week-dot-done {
  background: #72C8A0;
}
.week-dot-today {
  background: #FFFFFF;
  border: 1rpx dashed #72C8A0;
}
.week-label {
  font-size: 22rpx;
  color: #999999;
}
.week-label-today {
  color: #72C8A0;
  font-weight: 600;
}

/* 徽章墙 */
.badge-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.badge-item {
  position: relative;
  width: calc((100% - 32rpx) / 3);
  margin: 0;
  background: #EAF6F0;
  border-radius: 16rpx;
  padding: 24rpx 12rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}
.badge-locked {
  background: #F0F2F1;
  opacity: 0.7;
}
/* 已解锁卡片：右上角两枚小装饰点 */
.badge-item:not(.badge-locked)::after {
  content: '';
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: rgba(114, 200, 160, 0.45);
  box-shadow: -14rpx 8rpx 0 rgba(114, 200, 160, 0.25);
}
.badge-icon {
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}
/* 徽章专属图案 */
.badge-glyph {
  width: 72rpx;
  height: 72rpx;
}
.badge-glyph-lg {
  width: 92rpx;
  height: 92rpx;
}
/* 已解锁徽章：圆形白底 + 薄荷绿弱发光（未解锁保持置灰、无发光） */
.badge-item:not(.badge-locked) .badge-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 0 16rpx rgba(114, 200, 160, 0.35);
}
.badge-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 6rpx;
}
.badge-desc {
  font-size: 20rpx;
  color: #999999;
  text-align: center;
  line-height: 1.5;
}

/* 徽章详情弹窗 */
.badge-popup {
  position: relative;
  width: 560rpx;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(165deg, #FFFFFF 0%, #F3FAF7 55%, #E9F6F0 100%);
  border: 1rpx solid rgba(114, 200, 160, 0.22);
  border-radius: 24rpx;
  box-shadow: 0 16rpx 48rpx rgba(114, 200, 160, 0.22);
  overflow: hidden;
  animation: popIn 360ms cubic-bezier(0.22, 1.2, 0.36, 1) both;
}
/* 顶部薄荷光晕 */
.badge-popup::before {
  content: '';
  position: absolute;
  top: -180rpx;
  left: 50%;
  width: 400rpx;
  height: 400rpx;
  margin-left: -200rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(114, 200, 160, 0.35) 0%, rgba(114, 200, 160, 0) 68%);
  pointer-events: none;
}
.popup-locked {
  background: linear-gradient(165deg, #FFFFFF 0%, #F6F7F7 55%, #EDEFEF 100%);
  border-color: #E6E8E8;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.06);
}
.popup-locked::before {
  background: radial-gradient(circle, rgba(190, 195, 195, 0.3) 0%, rgba(190, 195, 195, 0) 68%);
}

/* 徽章图标舞台 */
.popup-stage {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}
.halo {
  position: absolute;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 1rpx solid rgba(114, 200, 160, 0.55);
  animation: haloPulse 2.6s ease-out infinite;
}
.halo-2 {
  animation-delay: 1.1s;
}
.badge-popup-icon {
  position: relative;
  width: 148rpx;
  height: 148rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 26%, #9FE0C2 0%, #72C8A0 62%, #5FB48E 100%);
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(114, 200, 160, 0.35), inset 0 0 0 9rpx rgba(255, 255, 255, 0.18);
  animation: iconPop 420ms cubic-bezier(0.22, 1.4, 0.36, 1) both;
}
/* 贴心呵护等粉色徽章：豆沙粉渐变底 + 白色图标 */
.icon-heart {
  background: radial-gradient(circle at 32% 26%, #F7DDE3 0%, #E8B8C0 62%, #D9A2AC 100%);
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 24rpx rgba(232, 184, 192, 0.4), inset 0 0 0 9rpx rgba(255, 255, 255, 0.18);
}
.badge-popup-locked {
  background: radial-gradient(circle at 32% 26%, #FAFBFB 0%, #EAEDED 62%, #DDDFDF 100%);
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}
/* 奖章外圈花环：八颗小圆点，缓慢旋转 */
.medal-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -98rpx;
  margin-top: -98rpx;
  width: 196rpx;
  height: 196rpx;
  border-radius: 50%;
  background-image:
    radial-gradient(circle 4rpx at 50% 0%, rgba(114, 200, 160, 0.75), rgba(114, 200, 160, 0) 100%),
    radial-gradient(circle 4rpx at 85.4% 14.6%, rgba(114, 200, 160, 0.6), rgba(114, 200, 160, 0) 100%),
    radial-gradient(circle 4rpx at 100% 50%, rgba(114, 200, 160, 0.75), rgba(114, 200, 160, 0) 100%),
    radial-gradient(circle 4rpx at 85.4% 85.4%, rgba(114, 200, 160, 0.6), rgba(114, 200, 160, 0) 100%),
    radial-gradient(circle 4rpx at 50% 100%, rgba(114, 200, 160, 0.75), rgba(114, 200, 160, 0) 100%),
    radial-gradient(circle 4rpx at 14.6% 85.4%, rgba(114, 200, 160, 0.6), rgba(114, 200, 160, 0) 100%),
    radial-gradient(circle 4rpx at 0% 50%, rgba(114, 200, 160, 0.75), rgba(114, 200, 160, 0) 100%),
    radial-gradient(circle 4rpx at 14.6% 14.6%, rgba(114, 200, 160, 0.6), rgba(114, 200, 160, 0) 100%);
  animation: slowSpin 22s linear infinite;
  pointer-events: none;
}
.ring-heart {
  background-image:
    radial-gradient(circle 4rpx at 50% 0%, rgba(232, 184, 192, 0.9), rgba(232, 184, 192, 0) 100%),
    radial-gradient(circle 4rpx at 85.4% 14.6%, rgba(232, 184, 192, 0.72), rgba(232, 184, 192, 0) 100%),
    radial-gradient(circle 4rpx at 100% 50%, rgba(232, 184, 192, 0.9), rgba(232, 184, 192, 0) 100%),
    radial-gradient(circle 4rpx at 85.4% 85.4%, rgba(232, 184, 192, 0.72), rgba(232, 184, 192, 0) 100%),
    radial-gradient(circle 4rpx at 50% 100%, rgba(232, 184, 192, 0.9), rgba(232, 184, 192, 0) 100%),
    radial-gradient(circle 4rpx at 14.6% 85.4%, rgba(232, 184, 192, 0.72), rgba(232, 184, 192, 0) 100%),
    radial-gradient(circle 4rpx at 0% 50%, rgba(232, 184, 192, 0.9), rgba(232, 184, 192, 0) 100%),
    radial-gradient(circle 4rpx at 14.6% 14.6%, rgba(232, 184, 192, 0.72), rgba(232, 184, 192, 0) 100%);
}
@keyframes slowSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
/* 环绕小星点 */
.spark {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #72C8A0;
  animation: twinkle 2s ease-in-out infinite;
}
.spark-1 {
  top: 24rpx;
  left: 30rpx;
  animation-delay: 0.2s;
}
.spark-2 {
  top: 40rpx;
  right: 24rpx;
  width: 6rpx;
  height: 6rpx;
  background: #E8B8C0;
  animation-delay: 0.9s;
}
.spark-3 {
  bottom: 34rpx;
  left: 52rpx;
  width: 6rpx;
  height: 6rpx;
  animation-delay: 1.4s;
}

/* 卡片四角小闪光：四角星，交替明暗 */
.corner-star {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  background: #72C8A0;
  -webkit-clip-path: polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%);
  clip-path: polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%);
  animation: starTwinkle 2.4s ease-in-out infinite;
  pointer-events: none;
}
.cs-1 {
  top: 26rpx;
  left: 26rpx;
  animation-delay: 0.3s;
}
.cs-2 {
  top: 30rpx;
  right: 30rpx;
  width: 12rpx;
  height: 12rpx;
  background: #E8B8C0;
  animation-delay: 1.1s;
}
.cs-3 {
  bottom: 30rpx;
  left: 34rpx;
  width: 12rpx;
  height: 12rpx;
  animation-delay: 1.6s;
}
.cs-4 {
  bottom: 26rpx;
  right: 26rpx;
  animation-delay: 0.7s;
}
@keyframes starTwinkle {
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50% { opacity: 0.9; transform: scale(1); }
}

.badge-popup-name {
  position: relative;
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}
.badge-popup-status {
  position: relative;
  font-size: 22rpx;
  color: #FFFFFF;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 999rpx;
  padding: 6rpx 26rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 16rpx rgba(114, 200, 160, 0.3);
}
.status-locked {
  color: #8A8A8A;
  background: #EDEFEF;
  box-shadow: none;
}

/* 未解锁进度条 */
.popup-progress {
  width: 100%;
  margin-bottom: 24rpx;
}
.popup-progress-bar {
  height: 12rpx;
  background: #EDEFEF;
  border-radius: 999rpx;
  overflow: hidden;
}
.popup-progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #9BC9B4 0%, #72C8A0 100%);
  transform-origin: left center;
  animation: fillGrow 620ms ease-out both;
}
.popup-progress-text {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #999999;
  margin-top: 10rpx;
}

.badge-popup-row {
  position: relative;
  width: 100%;
  margin-bottom: 18rpx;
}
.badge-popup-label {
  display: block;
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}
.badge-popup-value {
  display: block;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}
.badge-popup-btn {
  position: relative;
  width: 100%;
  text-align: center;
  font-size: 30rpx;
  color: #FFFFFF;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 999rpx;
  padding: 20rpx 0;
  margin-top: 12rpx;
  box-shadow: 0 10rpx 24rpx rgba(114, 200, 160, 0.28);
}

/* 内容逐项淡入（延迟错开） */
.badge-popup-name,
.badge-popup-status,
.popup-progress,
.badge-popup-row,
.badge-popup-btn {
  animation: fadeUp 400ms ease-out both;
}
.badge-popup-name {
  animation-delay: 0.05s;
}
.badge-popup-status {
  animation-delay: 0.1s;
}
.popup-progress {
  animation-delay: 0.14s;
}
.badge-popup-row {
  animation-delay: 0.2s;
}
.badge-popup-row + .badge-popup-row {
  animation-delay: 0.26s;
}
.badge-popup-btn {
  animation-delay: 0.32s;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.82) translateY(24rpx);
  }
  60% {
    opacity: 1;
    transform: scale(1.03) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes iconPop {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  70% {
    opacity: 1;
    transform: scale(1.08);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes haloPulse {
  0% {
    opacity: 0.7;
    transform: scale(0.85);
  }
  100% {
    opacity: 0;
    transform: scale(1.7);
  }
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.7);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fillGrow {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* 达标成功弹窗 */
.achieve-popup {
  width: 560rpx;
  padding: 56rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.06);
}
.achieve-confetti {
  margin-bottom: 8rpx;
}
.achieve-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
  margin-bottom: 28rpx;
}
.achieve-badge {
  background: #EAF6F0;
  border-radius: 16rpx;
  padding: 28rpx 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28rpx;
}
.achieve-badge-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  box-shadow: 0 0 16rpx rgba(114, 200, 160, 0.35);
}
.achieve-badge-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}
.achieve-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.7;
  text-align: center;
  margin-bottom: 36rpx;
}
.achieve-actions {
  display: flex;
  width: 100%;
}
.achieve-btn {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  border-radius: 999rpx;
  padding: 20rpx 0;
}
.achieve-btn-plain {
  border: 1rpx solid #CCCCCC;
  color: #999999;
  margin-right: 24rpx;
}
.achieve-btn-primary {
  background: #72C8A0;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
