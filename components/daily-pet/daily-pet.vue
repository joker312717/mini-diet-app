<template>
  <view class="pet-card">
    <view class="pet-head">
      <text class="pet-title">我的小宠物</text>
      <text v-if="state.adopted" class="pet-status" :class="'st-' + state.mood">{{ state.statusText }}</text>
    </view>

    <!-- 未领养 -->
    <view v-if="!state.adopted" class="pet-empty">
      <view class="pet-stage">
        <view class="pet-halo"></view>
        <view class="pet calm">
          <view class="sprout">
            <view class="leaf leaf-l"></view>
            <view class="leaf leaf-r"></view>
            <view class="stem"></view>
          </view>
          <view class="pet-body">
            <view class="belly"></view>
            <view class="eye eye-l closed"></view>
            <view class="eye eye-r closed"></view>
            <view class="cheek cheek-l"></view>
            <view class="cheek cheek-r"></view>
            <view class="mouth"></view>
            <view class="arm arm-l"></view>
            <view class="arm arm-r"></view>
            <view class="foot foot-l"></view>
            <view class="foot foot-r"></view>
          </view>
        </view>
        <view class="pet-ground"></view>
      </view>
      <view class="empty-tip">还没有小宠物，领养一只陪你一起打卡吧</view>
      <view class="adopt-btn" hover-class="btn-hover" @click="onAdopt">领养一只小宠物</view>
    </view>

    <!-- 已领养 -->
    <view v-else class="pet-main">
      <view class="pet-stage">
        <view class="pet-halo"></view>
        <view class="pet" :class="[state.mood, 'body-' + state.body, { eating: feeding, petting: petting, surprise: reaction === 'surprise', shy: reaction === 'shy', dancing: dancing }]" @click="onTapPet">
          <!-- 头顶小豆芽 -->
          <view class="sprout">
            <view class="leaf leaf-l"></view>
            <view class="leaf leaf-r"></view>
            <view class="stem"></view>
          </view>

          <!-- 斗篷 / 翅膀穿在身体后面 -->
          <view v-if="state.accessory === 'cape'" class="acc-cape"></view>
          <view v-if="state.accessory === 'wings'" class="acc-wings"></view>

          <view class="pet-body">
            <view class="belly"></view>
            <view class="eye eye-l"></view>
            <view class="eye eye-r"></view>
            <!-- 待机眨眼：透明眼睑定时盖住眼睛 -->
            <view class="lid lid-l"></view>
            <view class="lid lid-r"></view>
            <view class="cheek cheek-l"></view>
            <view class="cheek cheek-r"></view>
            <view class="mouth"></view>
            <view class="arm arm-l"></view>
            <view class="arm arm-r"></view>
            <view class="foot foot-l"></view>
            <view class="foot foot-r"></view>
          </view>

          <!-- 动作道具：打卡举牌 / 抱小水杯 / 递纸巾 / 抱云朵 -->
          <view v-if="state.mood === 'happy'" class="prop prop-sign">
            <text class="sign-text">好棒</text>
          </view>
          <view v-if="state.mood === 'slim'" class="prop prop-cup">
            <view class="cup-straw"></view>
            <view class="cup-water"></view>
          </view>
          <view v-if="state.mood === 'angry'" class="prop prop-tissue"></view>
          <view v-if="state.mood === 'fat'" class="prop prop-cloud"></view>

          <view class="anger-mark"></view>

          <!-- 装扮 -->
          <view v-if="state.accessory === 'crown'" class="acc-crown"></view>
          <view v-if="state.accessory === 'scarf'" class="acc-scarf"></view>
          <view v-if="state.accessory === 'bow'" class="acc-bow"></view>
          <view v-if="state.accessory === 'flower'" class="acc-flower"></view>
          <view v-if="state.accessory === 'glasses'" class="acc-glasses"></view>
          <view v-if="state.accessory === 'bag'" class="acc-bag"></view>
        </view>
        <view class="pet-ground"></view>
        <!-- 投喂时落下的饭团 -->
        <view v-if="feeding" class="feed-drop"></view>
        <!-- 摸摸头飘出的爱心 -->
        <view
          v-for="h in hearts"
          :key="h.id"
          class="heart"
          :style="{ left: h.left + '%', animationDelay: h.delay + 'ms' }"
        ></view>
        <!-- 互动时飘出的星星 -->
        <text
          v-for="s in sparks"
          :key="s.id"
          class="spark"
          :style="{ left: s.left + '%', animationDelay: s.delay + 'ms' }"
        >✦</text>
      </view>

      <view class="pet-name" @click="startRename">
        <text>{{ state.name }}</text>
        <text class="pet-name-edit">改名</text>
      </view>

      <view v-if="editing" class="rename-row">
        <input
          class="rename-input"
          v-model="draftName"
          maxlength="8"
          placeholder="给它起个名字"
          confirm-type="done"
          @confirm="confirmRename"
        />
        <view class="rename-btn" hover-class="btn-hover" @click="confirmRename">确定</view>
        <view class="rename-btn rename-btn-plain" hover-class="btn-hover" @click="editing = false">取消</view>
      </view>

      <view class="pet-bubble">{{ bubbleText }}</view>
      <view class="pet-meta">
        <text>今日 {{ state.todayCalorie }} / {{ state.target }} kcal</text>
        <text class="meta-divider">｜</text>
        <text>连续达标 {{ state.streak }} 天</text>
      </view>

      <!-- 互动：摸摸头 / 逗它玩 / 说句话 -->
      <view class="pet-chips">
        <view class="chip" hover-class="btn-hover" @click="onPet">
          摸摸头 · {{ state.touchLeft }}
        </view>
        <view class="chip" hover-class="btn-hover" @click="onPlay">
          逗它玩 · {{ state.playLeft }}
        </view>
        <view class="chip" hover-class="btn-hover" @click="sayLine">说句话</view>
      </view>

      <!-- 装扮切换：亲密度解锁 -->
      <view class="acc-row">
        <view class="acc-head">
          <text class="acc-label">装扮</text>
          <text v-if="state.nextUnlock" class="acc-hint">
            再 {{ state.nextUnlock.remain }} 点解锁{{ state.nextUnlock.name }}
          </text>
        </view>
        <view class="acc-list">
          <view
            class="acc-item"
            v-for="a in state.accessories"
            :key="a.key"
            :class="{ 'acc-item-on': state.accessory === a.key, 'acc-item-locked': !a.unlocked }"
            hover-class="btn-hover"
            @click="onAccessory(a.key)"
          >
            <text class="acc-name">{{ a.name }}</text>
            <text class="acc-need">
              {{
                a.unlocked
                  ? (state.accessory === a.key ? '已穿戴' : '可穿戴')
                  : '需 ' + a.love + ' 亲密'
              }}
            </text>
          </view>
        </view>
      </view>

      <view class="pet-actions">
        <view class="love">
          <view class="love-dot"></view>
          <text class="love-text">Lv.{{ state.level }} 亲密度 {{ state.love }}</text>
          <view class="love-bar">
            <view class="love-bar-fill" :style="{ width: state.levelPercent + '%' }"></view>
          </view>
        </view>
        <view
          class="feed-btn"
          :class="{ 'feed-btn-done': state.feedLeft === 0 }"
          hover-class="btn-hover"
          @click="onFeed"
        >
          <text class="feed-btn-text">
            {{ state.feedLeft === 0 ? '今天吃饱啦' : '投喂 ' + state.feedCount + '/' + state.feedLimit }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  computePetState,
  adoptPet,
  feedPet,
  petPet,
  playPet,
  setAccessory,
  renamePet,
  randomLine
} from '@/common/pet.js'

export default {
  data() {
    return {
      state: computePetState(),
      feeding: false,
      petting: false,
      petTimer: null,
      hearts: [],
      heartSeq: 0,
      sparks: [],
      sparkSeq: 0,
      // 点身体随机表情：surprise 惊喜 / shy 害羞
      reaction: '',
      reactionTimer: null,
      dancing: false,
      danceTimer: null,
      editing: false,
      draftName: '',
      line: '',
      lineTimer: null,
      // 记录上一句台词，避免连续两次说同一句
      lastLine: ''
    }
  },
  computed: {
    bubbleText() {
      return this.line || this.state.tip
    }
  },
  mounted() {
    this.refresh()
  },
  beforeDestroy() {
    if (this.lineTimer) clearTimeout(this.lineTimer)
    if (this.petTimer) clearTimeout(this.petTimer)
    if (this.reactionTimer) clearTimeout(this.reactionTimer)
    if (this.danceTimer) clearTimeout(this.danceTimer)
  },
  methods: {
    // 页面 onShow / 挂载时读取最新状态
    refresh() {
      this.state = computePetState()
    },
    onAdopt() {
      adoptPet('团团')
      this.refresh()
      uni.showToast({ title: '领养成功，它叫团团', icon: 'none' })
    },
    onFeed() {
      if (this.feeding) return
      const res = feedPet()
      if (!res.ok) {
        uni.showToast({ title: res.msg, icon: 'none' })
        this.refresh()
        return
      }
      // 进食动画约 1 秒，期间按钮不可重复点击
      this.feeding = true
      this.refresh()
      setTimeout(() => {
        this.feeding = false
        uni.showToast({ title: '亲密度 +1', icon: 'none' })
      }, 1000)
    },
    pushHeart() {
      const id = ++this.heartSeq
      this.hearts.push({
        id,
        left: 34 + Math.round(Math.random() * 26),
        delay: Math.round(Math.random() * 180)
      })
      setTimeout(() => {
        this.hearts = this.hearts.filter((h) => h.id !== id)
      }, 1400)
    },
    // 摸摸头：点赞式互动，飘爱心
    onPet() {
      const res = petPet()
      if (!res.ok) {
        uni.showToast({ title: res.msg, icon: 'none' })
        this.refresh()
        return
      }
      this.pushHeart()
      this.refresh()
      // 被摸时露出眯眼笑脸，1.2 秒后恢复当前情绪
      this.petting = true
      if (this.petTimer) clearTimeout(this.petTimer)
      this.petTimer = setTimeout(() => {
        this.petting = false
      }, 1200)
      uni.showToast({ title: '亲密度 +1', icon: 'none' })
    },
    // 星星特效：count 个，随机横向位置与延迟
    pushSpark(count = 2) {
      for (let i = 0; i < count; i += 1) {
        const id = ++this.sparkSeq
        this.sparks.push({
          id,
          left: 22 + Math.round(Math.random() * 56),
          delay: Math.round(Math.random() * 220)
        })
        setTimeout(() => {
          this.sparks = this.sparks.filter((s) => s.id !== id)
        }, 1300)
      }
    },
    // 点一下身体：随机惊喜 / 害羞表情，配星星和一句台词
    onTapPet() {
      if (this.feeding || this.petting || this.dancing || this.reaction) return
      this.reaction = Math.random() < 0.5 ? 'surprise' : 'shy'
      this.pushSpark(2)
      if (this.reactionTimer) clearTimeout(this.reactionTimer)
      this.reactionTimer = setTimeout(() => {
        this.reaction = ''
      }, 1000)
      this.line = this.pickLine()
      if (this.lineTimer) clearTimeout(this.lineTimer)
      this.lineTimer = setTimeout(() => {
        this.line = ''
      }, 2400)
    },
    // 逗它玩：摇一摇跳舞，每天 3 次，亲密度 +1
    onPlay() {
      if (this.dancing) return
      const res = playPet()
      if (!res.ok) {
        uni.showToast({ title: res.msg, icon: 'none' })
        this.refresh()
        return
      }
      this.refresh()
      this.dancing = true
      this.pushSpark(4)
      this.line = this.pickLine()
      if (this.lineTimer) clearTimeout(this.lineTimer)
      this.lineTimer = setTimeout(() => {
        this.line = ''
      }, 2400)
      if (this.danceTimer) clearTimeout(this.danceTimer)
      this.danceTimer = setTimeout(() => {
        this.dancing = false
      }, 1200)
      uni.showToast({ title: '亲密度 +1', icon: 'none' })
    },
    // 取一句台词，最多重试 3 次避免和上一句重复
    pickLine() {
      let next = randomLine(this.state.mood)
      for (let i = 0; i < 3 && next === this.lastLine; i += 1) {
        next = randomLine(this.state.mood)
      }
      this.lastLine = next
      return next
    },
    // 说句话：随机一句宠物台词，3 秒后回到提示语
    sayLine() {
      this.line = this.pickLine()
      if (this.lineTimer) clearTimeout(this.lineTimer)
      this.lineTimer = setTimeout(() => {
        this.line = ''
      }, 3000)
    },
    startRename() {
      this.draftName = this.state.name
      this.editing = true
    },
    confirmRename() {
      const name = this.draftName.trim()
      if (!name) {
        uni.showToast({ title: '名字不能为空', icon: 'none' })
        return
      }
      renamePet(name)
      this.editing = false
      this.refresh()
      uni.showToast({ title: '名字改好啦', icon: 'none' })
    },
    onAccessory(key) {
      const res = setAccessory(key)
      if (!res.ok) {
        uni.showToast({ title: res.msg, icon: 'none' })
        return
      }
      this.refresh()
    }
  }
}
</script>

<style scoped>
.pet-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  border-top: 4rpx solid rgba(114, 200, 160, 0.25);
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 24rpx;
}
.pet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.pet-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}
.pet-status {
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
}
.st-angry {
  color: #E6A23C;
  background: #FDF4E6;
}
.st-happy {
  color: #4A9B7D;
  background: #EAF6F0;
}
.st-fat {
  color: #999999;
  background: #F2F4F3;
}
.st-slim {
  color: #4A9B7D;
  background: #EAF6F0;
}

/* 舞台 */
.pet-stage {
  position: relative;
  height: 268rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 24rpx 0 6rpx;
}
/* 背后柔光 */
.pet-halo {
  position: absolute;
  bottom: 10rpx;
  left: 50%;
  width: 300rpx;
  height: 250rpx;
  margin-left: -150rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 58%, rgba(206, 240, 219, 0.6) 0%, rgba(206, 240, 219, 0.25) 46%, rgba(206, 240, 219, 0) 74%);
  pointer-events: none;
}
.pet {
  position: relative;
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: 44rpx;
  z-index: 1;
}

/* 头顶小豆芽 */
.sprout {
  position: absolute;
  top: 0;
  left: 50%;
  width: 62rpx;
  height: 40rpx;
  margin-left: -31rpx;
  transform-origin: 50% 92%;
  animation: sproutSway 3.6s ease-in-out infinite;
}
.leaf {
  position: absolute;
  width: 34rpx;
  height: 24rpx;
  background: linear-gradient(135deg, #BCEAC6 0%, #85D19C 100%);
  box-shadow: inset -2rpx -2rpx 6rpx rgba(86, 158, 108, 0.18);
}
.leaf-l {
  left: -2rpx;
  top: 8rpx;
  border-radius: 62% 38% 56% 44%;
  transform: rotate(-24deg);
}
.leaf-r {
  right: -2rpx;
  top: 8rpx;
  border-radius: 38% 62% 44% 56%;
  transform: rotate(24deg);
}
.stem {
  position: absolute;
  left: 50%;
  top: 18rpx;
  width: 6rpx;
  height: 20rpx;
  margin-left: -3rpx;
  border-radius: 4rpx;
  background: linear-gradient(180deg, #BCEAC6 0%, #8FD6A4 100%);
}

/* 身体 */
.pet-body {
  position: relative;
  width: 160rpx;
  height: 178rpx;
  border-radius: 52% 52% 42% 42% / 56% 56% 44% 44%;
  background: radial-gradient(120% 110% at 32% 20%, #D8F2E1 0%, #B7E5C7 40%, #96D3AA 72%, #82C69A 100%);
  box-shadow:
    inset -10rpx -14rpx 26rpx rgba(104, 166, 128, 0.26),
    inset 12rpx 14rpx 30rpx rgba(255, 255, 255, 0.5),
    0 16rpx 32rpx rgba(110, 175, 140, 0.22);
  transition: width 0.45s cubic-bezier(0.34, 1.4, 0.64, 1), height 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
}
/* 左上高光 */
.pet-body::before {
  content: '';
  position: absolute;
  left: 18rpx;
  top: 18rpx;
  width: 70rpx;
  height: 50rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0) 72%);
  transform: rotate(-24deg);
  pointer-events: none;
}
.body-fat .pet-body {
  width: 186rpx;
  height: 180rpx;
  border-radius: 52% 52% 40% 40% / 56% 56% 44% 44%;
}
.body-slim .pet-body {
  width: 142rpx;
  height: 182rpx;
  border-radius: 50% 50% 40% 40% / 56% 56% 44% 44%;
}

/* 肚皮：奶油薄荷色，避免大面积纯白 */
.belly {
  position: absolute;
  left: 50%;
  bottom: 14rpx;
  width: 104rpx;
  height: 104rpx;
  margin-left: -52rpx;
  border-radius: 50%;
  background: radial-gradient(120% 100% at 40% 18%, #F7FBEA 0%, #EDF7DC 58%, #DFF0CB 100%);
  box-shadow: inset 0 6rpx 12rpx rgba(150, 185, 150, 0.14);
}

/* 眼睛：深棕圆眼 + 双层高光 */
.eye {
  position: absolute;
  top: 60rpx;
  width: 30rpx;
  height: 32rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 34% 28%, #7C5948 0%, #563C2D 55%, #3B2720 100%);
  box-shadow: inset 0 -3rpx 5rpx rgba(0, 0, 0, 0.22);
  transition: all 0.3s ease;
}
.eye::after {
  content: '';
  position: absolute;
  left: 6rpx;
  top: 6rpx;
  width: 11rpx;
  height: 11rpx;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 13rpx 13rpx 0 -3.5rpx rgba(255, 255, 255, 0.75);
}
.eye-l {
  left: 34rpx;
}
.eye-r {
  right: 34rpx;
}
/* 弯眼（开心 / 变瘦 / 眯眼） */
.eye.closed {
  width: 30rpx;
  height: 14rpx;
  background: transparent;
  box-shadow: none;
  border-top: 4rpx solid #563C2D;
  border-radius: 30rpx 30rpx 0 0;
}
.eye.closed::after {
  display: none;
}

/* 腮红 */
.cheek {
  position: absolute;
  top: 96rpx;
  width: 38rpx;
  height: 22rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(247, 183, 194, 0.92) 0%, rgba(247, 183, 194, 0.4) 58%, rgba(247, 183, 194, 0) 100%);
}
.cheek-l {
  left: 16rpx;
}
.cheek-r {
  right: 16rpx;
}

/* 嘴 */
.mouth {
  position: absolute;
  left: 50%;
  top: 106rpx;
  width: 24rpx;
  height: 11rpx;
  margin-left: -12rpx;
  border-bottom: 3rpx solid #7A5A4A;
  border-radius: 0 0 24rpx 24rpx;
  transition: all 0.3s ease;
}

/* 手臂 */
.arm {
  position: absolute;
  top: 106rpx;
  width: 40rpx;
  height: 28rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, #C4EAD1 0%, #93D0A8 100%);
  box-shadow: inset -2rpx -3rpx 6rpx rgba(100, 160, 125, 0.34);
}
.arm-l {
  left: -20rpx;
  transform: rotate(14deg);
}
.arm-r {
  right: -20rpx;
  transform: rotate(-18deg);
}

/* 小脚丫 */
.foot {
  position: absolute;
  bottom: -14rpx;
  width: 50rpx;
  height: 24rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #B7E5C7 0%, #8DCCA0 100%);
  box-shadow: inset 0 -3rpx 5rpx rgba(100, 160, 125, 0.34);
}
.foot::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 7rpx;
  width: 7rpx;
  height: 7rpx;
  margin-left: -3.5rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 11rpx 0 0 rgba(255, 255, 255, 0.6), -11rpx 0 0 rgba(255, 255, 255, 0.6);
}
.foot-l {
  left: 22rpx;
}
.foot-r {
  right: 22rpx;
}

/* 动作道具：举牌 */
.prop-sign {
  position: absolute;
  top: 6rpx;
  right: -46rpx;
  width: 88rpx;
  height: 60rpx;
  border-radius: 14rpx;
  background: linear-gradient(160deg, #FFFFFF 0%, #F2FBF6 100%);
  border: 2rpx solid #D5EDDF;
  box-shadow: 0 8rpx 18rpx rgba(114, 200, 160, 0.24), inset 0 -3rpx 0 rgba(190, 225, 205, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: 50% 100%;
  animation: signSwing 1.8s ease-in-out infinite;
}
/* 牌下的小木杆 */
.prop-sign::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 100%;
  width: 6rpx;
  height: 26rpx;
  margin-left: -3rpx;
  border-radius: 4rpx;
  background: linear-gradient(180deg, #DCEFE3 0%, #C2E2D1 100%);
}
.sign-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #4A9B7D;
}

/* 动作道具：抱小水杯 */
.prop-cup {
  position: absolute;
  right: -2rpx;
  top: 104rpx;
  width: 46rpx;
  height: 54rpx;
  border-radius: 8rpx 8rpx 12rpx 12rpx;
  background: linear-gradient(180deg, #FFFFFF 0%, #F4FAF7 100%);
  border: 2rpx solid #DCEBE3;
  box-shadow: 0 5rpx 12rpx rgba(120, 170, 150, 0.14);
}
/* 杯子里的薄荷水 */
.cup-water {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32rpx;
  border-radius: 4rpx 4rpx 10rpx 10rpx;
  background: linear-gradient(180deg, #AEE5CC 0%, #7FCCA8 100%);
}
/* 吸管 */
.cup-straw {
  position: absolute;
  right: 10rpx;
  top: -16rpx;
  width: 7rpx;
  height: 26rpx;
  border-radius: 4rpx;
  background: linear-gradient(180deg, #F7C9CF 0%, #E8B0B9 100%);
  transform: rotate(12deg);
}

/* 动作道具：递纸巾 */
.prop-tissue {
  position: absolute;
  left: -10rpx;
  top: 110rpx;
  width: 50rpx;
  height: 44rpx;
  border-radius: 5rpx;
  background: linear-gradient(160deg, #FFFFFF 0%, #F6FAF7 100%);
  border: 1rpx solid #E8EFEA;
  box-shadow: 0 5rpx 12rpx rgba(0, 0, 0, 0.06);
  transform: rotate(-8deg);
}
/* 抽出来的第二张 */
.prop-tissue::before {
  content: '';
  position: absolute;
  left: 5rpx;
  top: -9rpx;
  width: 40rpx;
  height: 22rpx;
  border-radius: 6rpx 10rpx 0 0;
  background: #FFFFFF;
  border: 1rpx solid #EDF3EF;
  transform: rotate(7deg);
}
.prop-tissue::after {
  content: '';
  position: absolute;
  left: 9rpx;
  top: 15rpx;
  width: 26rpx;
  height: 2rpx;
  background: #E2EAE5;
  box-shadow: 0 9rpx 0 #E2EAE5;
}

/* 动作道具：抱云朵 */
.prop-cloud {
  position: absolute;
  left: 50%;
  bottom: 32rpx;
  width: 106rpx;
  height: 48rpx;
  margin-left: -53rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #FFFFFF 0%, #F1F8F4 100%);
  box-shadow: 0 10rpx 20rpx rgba(120, 170, 150, 0.18);
  animation: cloudFloat 2.6s ease-in-out infinite;
}
.prop-cloud::before,
.prop-cloud::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(180deg, #FFFFFF 0%, #F4FAF6 100%);
}
.prop-cloud::before {
  left: 10rpx;
  top: -20rpx;
  width: 46rpx;
  height: 46rpx;
}
.prop-cloud::after {
  right: 14rpx;
  top: -13rpx;
  width: 34rpx;
  height: 34rpx;
}

/* 生气时的斜眉与怒气符 */
.anger-mark {
  position: absolute;
  top: 34rpx;
  right: -6rpx;
  width: 32rpx;
  height: 32rpx;
  opacity: 0;
}
.anger-mark::before,
.anger-mark::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 5rpx;
  height: 28rpx;
  margin-left: -2.5rpx;
  margin-top: -14rpx;
  border-radius: 4rpx;
  background: #E6A23C;
}
.anger-mark::before {
  transform: rotate(38deg);
}
.anger-mark::after {
  transform: rotate(-38deg);
}
.pet.angry .anger-mark {
  opacity: 1;
  animation: angerPulse 1s ease-in-out infinite;
}
.pet.angry .eye {
  width: 26rpx;
  height: 8rpx;
  border-radius: 8rpx;
  background: #563C2D;
  top: 64rpx;
  box-shadow: none;
}
.pet.angry .eye::after {
  display: none;
}
.pet.angry .eye-l {
  transform: rotate(14deg);
}
.pet.angry .eye-r {
  transform: rotate(-14deg);
}
.pet.angry .mouth {
  top: 108rpx;
  border-bottom: none;
  border-top: 3rpx solid #7A5A4A;
  border-radius: 24rpx 24rpx 0 0;
}

/* 开心：弯眼 + 举牌跳动 */
.pet.happy .eye,
.pet.slim .eye,
.pet.calm .eye {
  width: 30rpx;
  height: 14rpx;
  background: transparent;
  box-shadow: none;
  border-top: 4rpx solid #563C2D;
  border-radius: 30rpx 30rpx 0 0;
}
.pet.happy .eye::after,
.pet.slim .eye::after,
.pet.calm .eye::after {
  display: none;
}
.pet.happy {
  animation: petHop 1.6s ease-in-out infinite;
}

/* 发胖：眯眼 + 圆嘴 + 呼吸，抱着云朵 */
.pet.fat .eye {
  width: 22rpx;
  height: 9rpx;
  border-radius: 9rpx;
  background: #563C2D;
  top: 64rpx;
  box-shadow: none;
}
.pet.fat .eye::after {
  display: none;
}
.pet.fat .mouth {
  top: 104rpx;
  width: 18rpx;
  height: 18rpx;
  margin-left: -9rpx;
  border: 3rpx solid #7A5A4A;
  border-radius: 50%;
}
.pet.fat {
  animation: petBreathe 2.4s ease-in-out infinite;
}

/* 变瘦：轻盈浮动 */
.pet.slim {
  animation: petFloat 2.6s ease-in-out infinite;
}

/* 进食：张嘴 + 轻跳 */
.pet.eating {
  animation: petEat 0.5s ease-in-out 2;
}
.pet.eating .mouth {
  top: 98rpx;
  width: 26rpx;
  height: 26rpx;
  margin-left: -13rpx;
  border: 3rpx solid #7A5A4A;
  border-radius: 50%;
  background: rgba(122, 90, 74, 0.12);
}
@keyframes petEat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}

/* 被摸头：眯眼笑 + 脸颊泛红 + 轻轻弹跳 */
.pet.petting {
  animation: petPat 0.5s ease-in-out 2;
}
.pet.petting .eye {
  width: 30rpx;
  height: 14rpx;
  background: transparent;
  box-shadow: none;
  border-top: 4rpx solid #563C2D;
  border-radius: 30rpx 30rpx 0 0;
  transform: none;
}
.pet.petting .eye::after {
  display: none;
}
.pet.petting .mouth {
  top: 102rpx;
  width: 32rpx;
  height: 18rpx;
  margin-left: -16rpx;
  border: none;
  border-bottom: 4rpx solid #7A5A4A;
  border-radius: 0 0 32rpx 32rpx;
  background: transparent;
}
.pet.petting .cheek {
  background: radial-gradient(circle, rgba(243, 148, 164, 0.95) 0%, rgba(243, 148, 164, 0) 100%);
  transform: scale(1.12);
}
@keyframes petPat {
  0%, 100% { transform: translateY(0) scale(1); }
  45% { transform: translateY(6rpx) scale(1.05, 0.95); }
}

/* 地面投影 */
.pet-ground {
  position: absolute;
  bottom: 0;
  left: 50%;
  margin-left: -84rpx;
  width: 168rpx;
  height: 22rpx;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(138, 193, 163, 0.34) 0%, rgba(138, 193, 163, 0.12) 45%, rgba(138, 193, 163, 0) 74%);
}

/* 投喂掉落的小饭团 */
.feed-drop {
  position: absolute;
  top: 46rpx;
  left: 50%;
  width: 30rpx;
  height: 30rpx;
  margin-left: -15rpx;
  border-radius: 42% 42% 50% 50%;
  background: linear-gradient(160deg, #FFFFFF 0%, #F3F6F2 100%);
  border: 2rpx solid #E7ECE8;
  animation: feedFall 1s ease-in forwards;
}
.feed-drop::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 9rpx;
  width: 12rpx;
  height: 8rpx;
  margin-left: -6rpx;
  border-radius: 2rpx;
  background: #4A9B7D;
}
@keyframes feedFall {
  0% { transform: translateY(-28rpx) scale(0.9); opacity: 0; }
  25% { opacity: 1; }
  70% { transform: translateY(74rpx) scale(1); opacity: 1; }
  100% { transform: translateY(88rpx) scale(1); opacity: 0; }
}

/* 文案 */
.pet-name {
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 8rpx;
}
.pet-name-edit {
  font-size: 20rpx;
  font-weight: 400;
  color: #A9B7B0;
  border: 1rpx solid #E3ECE7;
  border-radius: 999rpx;
  padding: 2rpx 12rpx;
  margin-left: 10rpx;
}

/* 改名输入行 */
.rename-row {
  display: flex;
  align-items: center;
  margin: 12rpx 0 8rpx;
}
.rename-input {
  flex: 1;
  height: 60rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  color: #333333;
  background: #F6FBF7;
  border-radius: 12rpx;
}
.rename-btn {
  min-width: 96rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 24rpx;
  color: #FFFFFF;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 12rpx;
  margin-left: 12rpx;
}
.rename-btn-plain {
  color: #8A9691;
  background: #F0F4F2;
}

/* 互动按钮 */
.pet-chips {
  display: flex;
  margin-top: 16rpx;
}
.chip {
  flex: 1;
  height: 62rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23rpx;
  color: #4A9B7D;
  background: #EFF8F3;
  border: 1rpx solid #DCEFE4;
  border-radius: 999rpx;
}
.chip + .chip {
  margin-left: 14rpx;
}

/* 装扮：按亲密度解锁 */
.acc-row {
  margin-top: 16rpx;
}
.acc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10rpx;
}
.acc-label {
  font-size: 22rpx;
  color: #9AA3A0;
}
.acc-hint {
  font-size: 20rpx;
  color: #C6A15E;
}
.acc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}
.acc-item {
  width: calc((100% - 20rpx) / 3);
  height: 78rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 14rpx;
  background: #F7FAF8;
  border: 1rpx solid #EDF3EF;
}
.acc-name {
  font-size: 22rpx;
  color: #7F8D88;
}
.acc-need {
  font-size: 18rpx;
  color: #B9C4BF;
  margin-top: 2rpx;
}
.acc-item-on {
  background: #E8F5EE;
  border-color: #CBE8D8;
}
.acc-item-on .acc-name {
  color: #3E8F72;
  font-weight: 600;
}
.acc-item-on .acc-need {
  color: #6FB79A;
}
.acc-item-locked {
  background: #FAFBFB;
  border-color: #F0F3F2;
}
.acc-item-locked .acc-name {
  color: #BFC9C5;
}
.acc-item-locked .acc-need {
  color: #CBD4D0;
}
.pet-bubble {
  font-size: 24rpx;
  color: #666666;
  text-align: center;
  line-height: 1.6;
  background: #F6FBF7;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
}
.pet-meta {
  font-size: 22rpx;
  color: #999999;
  text-align: center;
  margin-top: 16rpx;
}
.meta-divider {
  color: #D8DEDC;
  margin: 0 8rpx;
}

/* 投喂区 */
.pet-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F1F5F3;
}
.love {
  display: flex;
  align-items: center;
}
.love-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #E8B8C0;
  margin-right: 10rpx;
}
.love-text {
  font-size: 22rpx;
  color: #999999;
}
.love-bar {
  width: 96rpx;
  height: 8rpx;
  margin-left: 12rpx;
  border-radius: 4rpx;
  background: #EDF3F0;
  overflow: hidden;
}
.love-bar-fill {
  height: 100%;
  border-radius: 4rpx;
  background: linear-gradient(90deg, #E8B8C0 0%, #F5CDD4 100%);
  transition: width 0.3s ease;
}

/* 装扮：小皇冠 / 小围巾 */
.acc-crown {
  position: absolute;
  left: 50%;
  top: -16rpx;
  width: 70rpx;
  height: 38rpx;
  margin-left: -35rpx;
  background: linear-gradient(180deg, #FFE6A8 0%, #F3C565 100%);
  clip-path: polygon(0% 100%, 0% 34%, 18% 62%, 38% 12%, 62% 12%, 82% 62%, 100% 34%, 100% 100%);
  filter: drop-shadow(0 4rpx 6rpx rgba(203, 155, 60, 0.35));
  animation: sproutSway 3.6s ease-in-out infinite;
}
.acc-scarf {
  position: absolute;
  left: 50%;
  top: 56rpx;
  width: 128rpx;
  height: 24rpx;
  margin-left: -64rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #F9CDD5 0%, #E9AFBB 100%);
  box-shadow: 0 4rpx 10rpx rgba(214, 150, 166, 0.28);
}
.acc-scarf::after {
  content: '';
  position: absolute;
  right: 8rpx;
  top: 18rpx;
  width: 22rpx;
  height: 34rpx;
  border-radius: 6rpx 6rpx 10rpx 10rpx;
  background: linear-gradient(180deg, #F3BFC9 0%, #E3A2AF 100%);
  transform: rotate(-8deg);
}

/* 蝴蝶结：两个蝴蝶结瓣 + 中心结 */
.acc-bow {
  position: absolute;
  left: 50%;
  top: -2rpx;
  width: 16rpx;
  height: 16rpx;
  margin-left: -8rpx;
  border-radius: 50%;
  background: #F2B7C3;
  box-shadow: 0 4rpx 8rpx rgba(200, 120, 140, 0.25);
}
.acc-bow::before,
.acc-bow::after {
  content: '';
  position: absolute;
  top: -6rpx;
  width: 30rpx;
  height: 28rpx;
  background: linear-gradient(135deg, #FBD5DD 0%, #E9A6B6 100%);
}
.acc-bow::before {
  left: -28rpx;
  border-radius: 70% 30% 40% 60% / 60% 40% 60% 40%;
  transform: rotate(-14deg);
}
.acc-bow::after {
  right: -28rpx;
  border-radius: 30% 70% 60% 40% / 40% 60% 40% 60%;
  transform: rotate(14deg);
}

/* 小斗篷：披在身体后面，两侧和下摆露出 */
.acc-cape {
  position: absolute;
  left: 50%;
  top: 66rpx;
  width: 200rpx;
  height: 180rpx;
  margin-left: -100rpx;
  border-radius: 34rpx 34rpx 92rpx 92rpx / 26rpx 26rpx 104rpx 104rpx;
  background: linear-gradient(160deg, rgba(196, 220, 244, 0.95) 0%, rgba(160, 190, 228, 0.95) 100%);
  box-shadow: 0 14rpx 24rpx rgba(140, 168, 200, 0.22);
}
/* 胖形态更宽，保证两侧仍有露出 */
.body-fat .acc-cape {
  width: 214rpx;
  margin-left: -107rpx;
}

/* 花环：沿头顶一圈的小花点 */
.acc-flower {
  position: absolute;
  left: 50%;
  top: 26rpx;
  width: 88rpx;
  height: 88rpx;
  margin-left: -44rpx;
  border-radius: 50%;
  background:
    radial-gradient(circle 7rpx at 50% 3%, #F7A9B9 99%, rgba(0, 0, 0, 0)),
    radial-gradient(circle 6rpx at 84% 18%, #FFD98A 99%, rgba(0, 0, 0, 0)),
    radial-gradient(circle 7rpx at 96% 60%, #F7A9B9 99%, rgba(0, 0, 0, 0)),
    radial-gradient(circle 6rpx at 66% 94%, #FFD98A 99%, rgba(0, 0, 0, 0)),
    radial-gradient(circle 7rpx at 26% 92%, #F7A9B9 99%, rgba(0, 0, 0, 0)),
    radial-gradient(circle 6rpx at 4% 52%, #FFD98A 99%, rgba(0, 0, 0, 0)),
    radial-gradient(circle 6rpx at 22% 12%, #FFD98A 99%, rgba(0, 0, 0, 0));
  animation: sproutSway 4.2s ease-in-out infinite;
}

/* 圆框眼镜：两片镜片正好罩住眼睛 */
.acc-glasses {
  position: absolute;
  left: 0;
  top: 98rpx;
  width: 160rpx;
  height: 44rpx;
  background: linear-gradient(#6B4A3A, #6B4A3A) no-repeat 50% 20rpx / 20rpx 3rpx;
}
.acc-glasses::before,
.acc-glasses::after {
  content: '';
  position: absolute;
  top: 0;
  width: 44rpx;
  height: 44rpx;
  box-sizing: border-box;
  border: 3rpx solid #6B4A3A;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}
.acc-glasses::before {
  left: 27rpx;
}
.acc-glasses::after {
  left: 89rpx;
}

/* 小翅膀：从身体两侧探出来，轻轻扇动 */
.acc-wings {
  position: absolute;
  left: 50%;
  top: 96rpx;
  width: 96rpx;
  height: 66rpx;
  margin-left: -48rpx;
}
.acc-wings::before,
.acc-wings::after {
  content: '';
  position: absolute;
  top: 0;
  width: 80rpx;
  height: 66rpx;
  background: linear-gradient(160deg, #FFFFFF 0%, #DCEBF8 100%);
  box-shadow: 0 6rpx 14rpx rgba(150, 180, 210, 0.22);
  animation: wingFlap 2.4s ease-in-out infinite;
}
.acc-wings::before {
  left: -64rpx;
  border-radius: 70% 30% 60% 40% / 62% 72% 28% 38%;
  transform-origin: 100% 40%;
}
.acc-wings::after {
  right: -64rpx;
  border-radius: 30% 70% 40% 60% / 72% 62% 38% 28%;
  transform-origin: 0% 40%;
  animation-delay: 0.25s;
}
@keyframes wingFlap {
  0%, 100% { transform: rotate(0deg) scaleX(1); }
  50% { transform: rotate(-4deg) scaleX(0.92); }
}

/* 小挎包：挂在身体右侧 */
.acc-bag {
  position: absolute;
  right: -8rpx;
  top: 118rpx;
  width: 54rpx;
  height: 58rpx;
  border-radius: 12rpx 12rpx 18rpx 18rpx;
  background: linear-gradient(160deg, #EAC07A 0%, #D69F45 100%);
  box-shadow: 0 8rpx 16rpx rgba(180, 140, 70, 0.28);
}
.acc-bag::before {
  content: '';
  position: absolute;
  left: 6rpx;
  right: 6rpx;
  top: 0;
  height: 18rpx;
  border-radius: 10rpx 10rpx 4rpx 4rpx;
  background: #C9903A;
}
.acc-bag::after {
  content: '';
  position: absolute;
  left: 50%;
  top: -20rpx;
  width: 8rpx;
  height: 22rpx;
  margin-left: -4rpx;
  border-radius: 4rpx;
  background: #C9903A;
}

/* 摸摸头飘出的爱心 */
.heart {
  position: absolute;
  bottom: 96rpx;
  width: 18rpx;
  height: 18rpx;
  margin-left: -9rpx;
  border-radius: 2rpx;
  background: #F2A2B0;
  pointer-events: none;
  animation: heartFloat 1.2s ease-out forwards;
}
.heart::before,
.heart::after {
  content: '';
  position: absolute;
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #F2A2B0;
}
.heart::before {
  left: 0;
  top: -9rpx;
}
.heart::after {
  right: -9rpx;
  top: 0;
}
@keyframes heartFloat {
  0% { opacity: 0; transform: translateY(0) rotate(-45deg) scale(0.6); }
  22% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-96rpx) rotate(-45deg) scale(1.05); }
}
.feed-btn {
  min-width: 200rpx;
  height: 64rpx;
  padding: 0 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  box-shadow: 0 6rpx 16rpx rgba(114, 200, 160, 0.28);
}
.feed-btn-text {
  font-size: 24rpx;
  color: #FFFFFF;
}
.feed-btn-done {
  background: #EEF3F1;
  box-shadow: none;
}
.feed-btn-done .feed-btn-text {
  color: #9AA3A0;
}

/* 领养空状态 */
.pet-empty {
  padding-top: 8rpx;
}
.empty-tip {
  font-size: 24rpx;
  color: #999999;
  text-align: center;
}
.adopt-btn {
  margin: 20rpx auto 0;
  width: 320rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  font-size: 26rpx;
  color: #FFFFFF;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 999rpx;
  box-shadow: 0 8rpx 20rpx rgba(114, 200, 160, 0.3);
}
.btn-hover {
  opacity: 0.75;
}

/* 动效 */
@keyframes petHop {
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-18rpx); }
  70% { transform: translateY(0); }
}
@keyframes signSwing {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
}
@keyframes petFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10rpx); }
}
@keyframes petBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes angerPulse {
  0%, 100% { opacity: 0.6; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1.06); }
}
@keyframes sproutSway {
  0%, 100% { transform: rotate(-2.5deg); }
  50% { transform: rotate(2.5deg); }
}
@keyframes cloudFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5rpx); }
}

/* ===== 新增互动表情与动画 ===== */

/* 待机眨眼：眼睑在每轮动画的末尾快速合上再打开 */
.lid {
  position: absolute;
  top: 60rpx;
  width: 30rpx;
  height: 32rpx;
  border-radius: 50%;
  background: linear-gradient(180deg, #B7E5C7 0%, #96D3AA 100%);
  transform: scaleY(0);
  transform-origin: 50% 0;
  animation: petBlink 5.4s ease-in-out infinite;
  pointer-events: none;
  z-index: 3;
}
.lid-l {
  left: 34rpx;
}
.lid-r {
  right: 34rpx;
}
/* 弯眼状态本身已是闭眼，不再叠眼睑 */
.pet.happy .lid,
.pet.slim .lid,
.pet.calm .lid,
.pet.shy .lid,
.pet.petting .lid {
  display: none;
}

/* 惊喜：眼睛睁大、小圆嘴、身体轻轻一弹 */
.pet.surprise .eye {
  transform: scale(1.22);
}
.pet.surprise .eye::after {
  transform: scale(1.1);
}
.pet.surprise .mouth {
  width: 16rpx;
  height: 16rpx;
  margin-left: -8rpx;
  border: none;
  border-radius: 50%;
  background: #7A5A4A;
}
.pet.surprise {
  animation: petStartle 0.6s ease;
}

/* 害羞：眯眼笑 + 腮红放大 + 小嘴微弯 */
.pet.shy .eye {
  width: 30rpx;
  height: 14rpx;
  background: transparent;
  box-shadow: none;
  border-top: 4rpx solid #563C2D;
  border-radius: 30rpx 30rpx 0 0;
}
.pet.shy .eye::after {
  display: none;
}
.pet.shy .cheek {
  transform: scale(1.3);
}
.pet.shy .mouth {
  width: 18rpx;
  height: 9rpx;
  margin-left: -9rpx;
}

/* 逗它玩：左右摇摆 + 轻微弹跳 */
.pet.dancing {
  animation: petDance 0.6s ease-in-out 2;
}

/* 互动星星 */
.spark {
  position: absolute;
  bottom: 150rpx;
  font-size: 26rpx;
  color: #F2C14E;
  text-shadow: 0 2rpx 6rpx rgba(242, 193, 78, 0.35);
  animation: sparkFloat 1.2s ease-out forwards;
  pointer-events: none;
  z-index: 3;
}

@keyframes petBlink {
  0%, 86%, 100% { transform: scaleY(0); }
  90%, 94% { transform: scaleY(1); }
  96% { transform: scaleY(0); }
}
@keyframes petStartle {
  0% { transform: scale(1); }
  30% { transform: scale(1.1, 0.94); }
  60% { transform: scale(0.98, 1.03); }
  100% { transform: scale(1); }
}
@keyframes petDance {
  0%, 100% { transform: rotate(0) translateY(0); }
  25% { transform: rotate(-10deg) translateY(-10rpx); }
  50% { transform: rotate(0) translateY(0); }
  75% { transform: rotate(10deg) translateY(-10rpx); }
}
@keyframes sparkFloat {
  0% { opacity: 0; transform: translateY(12rpx) scale(0.6) rotate(0deg); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-76rpx) scale(1.1) rotate(40deg); }
}
</style>
