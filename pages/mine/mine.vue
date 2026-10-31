<template>
  <view class="page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-deco deco-1"></view>
      <view class="user-deco deco-2"></view>
      <view class="avatar" hover-class="press-scale" @click="chooseAvatar">
        <image v-if="avatarUrl" class="avatar-img" :src="avatarUrl" mode="aspectFill"></image>
        <u-icon v-else name="account-fill" color="#fff" size="64rpx"></u-icon>
        <view class="avatar-edit">
          <u-icon name="camera-fill" color="#3E8F72" size="20rpx"></u-icon>
        </view>
      </view>
      <view class="user-info">
        <view class="nick-row" hover-class="press-scale" @click="openName">
          <view class="nickname">{{ nickname }}</view>
          <view class="nick-edit">
            <u-icon name="edit-pen" color="#FFFFFF" size="24rpx"></u-icon>
          </view>
        </view>
        <view class="slogan">好好吃饭，慢慢变瘦</view>
      </view>
      <view class="user-tag">目标 {{ calorieTarget }}</view>
    </view>

    <view class="section-title">个人信息</view>
    <view class="menu-card">
      <view class="menu-item" hover-class="btn-hover" @click="openName">
        <view class="menu-left">
          <view class="icon-chip chip-mint">
            <u-icon name="account" color="#72C8A0" size="34rpx"></u-icon>
          </view>
          <view>
            <view class="menu-title">我的昵称</view>
            <view class="menu-desc">点击修改，最多 12 个字</view>
          </view>
        </view>
        <view class="menu-tag">{{ nickname }}</view>
      </view>
      <view class="menu-item">
        <view class="menu-left">
          <view class="icon-chip chip-pink">
            <u-icon :name="gender === 'male' ? 'man' : 'woman'" color="#E8B8C0" size="34rpx"></u-icon>
          </view>
          <view>
            <view class="menu-title">性别</view>
            <view class="menu-desc">{{ gender === 'male' ? '男生不展示生理期内容' : '女生默认开启生理期功能，可随时关闭' }}</view>
          </view>
        </view>
        <view class="gender-group">
          <view
            class="gender-chip"
            :class="{ 'gender-chip-on': gender === 'female' }"
            hover-class="btn-hover"
            @click="pickGender('female')"
          >
            女
          </view>
          <view
            class="gender-chip"
            :class="{ 'gender-chip-on': gender === 'male' }"
            hover-class="btn-hover"
            @click="pickGender('male')"
          >
            男
          </view>
        </view>
      </view>
    </view>

    <view v-if="gender === 'female'" class="section-title">周期与提醒</view>
    <view v-if="gender === 'female'" class="menu-card">
      <view class="menu-item" hover-class="btn-hover" @click="goPeriod">
        <view class="menu-left">
          <view class="icon-chip chip-pink">
            <u-icon name="calendar" color="#E8B8C0" size="34rpx"></u-icon>
          </view>
          <view>
            <view class="menu-title">生理期日历与管理</view>
            <view class="menu-desc">查看经期日历、修改周期设置</view>
          </view>
        </view>
        <u-icon class="menu-arrow" name="arrow-right" color="#C8C9CC" size="28rpx"></u-icon>
      </view>
      <view class="menu-item" hover-class="press-scale">
        <view class="menu-left">
          <view class="icon-chip chip-pink">
            <u-icon name="heart" color="#E8B8C0" size="34rpx"></u-icon>
          </view>
          <view>
            <view class="menu-title">生理期功能</view>
            <view class="menu-desc">开启后各页面展示生理期内容</view>
          </view>
        </view>
        <switch :checked="periodEnabled" color="#72C8A0" @change="onPeriodChange" />
      </view>
    </view>

    <view class="section-title">饮食管理</view>
    <view class="menu-card">
      <view class="menu-item" hover-class="btn-hover" @click="openFavs">
        <view class="menu-left">
          <view class="icon-chip chip-rose">
            <u-icon name="heart-fill" color="#F56C6C" size="32rpx"></u-icon>
          </view>
          <view>
            <view class="menu-title">我的收藏餐单</view>
            <view class="menu-desc">{{ favPlans.length ? favPlans.length + ' 套已收藏' : '把喜欢的配餐存起来' }}</view>
          </view>
        </view>
        <u-icon
          v-if="!favPlans.length"
          class="menu-arrow"
          name="arrow-right"
          color="#C8C9CC"
          size="28rpx"
        ></u-icon>
        <view v-else class="menu-tag">{{ favPlans.length }}</view>
      </view>
      <view class="menu-item" hover-class="btn-hover" @click="goAvoid">
        <view class="menu-left">
          <view class="icon-chip chip-yellow">
            <u-icon name="minus-circle" color="#E6A23C" size="34rpx"></u-icon>
          </view>
          <view class="menu-title">忌口食材管理</view>
        </view>
        <u-icon class="menu-arrow" name="arrow-right" color="#C8C9CC" size="28rpx"></u-icon>
      </view>
      <view class="menu-item" hover-class="btn-hover" @click="openCalorie">
        <view class="menu-left">
          <view class="icon-chip chip-green">
            <u-icon name="setting-fill" color="#72C8A0" size="34rpx"></u-icon>
          </view>
          <view>
            <view class="menu-title">每日热量设置</view>
            <view class="menu-desc">当前目标 {{ calorieTarget }} kcal</view>
          </view>
        </view>
        <view class="menu-tag">调整</view>
      </view>
      <view class="menu-item" hover-class="btn-hover" @click="showAbout">
        <view class="menu-left">
          <view class="icon-chip chip-mint">
            <u-icon name="question-circle" color="#72C8A0" size="34rpx"></u-icon>
          </view>
          <view class="menu-title">使用说明与免责声明</view>
        </view>
        <u-icon class="menu-arrow" name="arrow-right" color="#C8C9CC" size="28rpx"></u-icon>
      </view>
    </view>

    <!-- 每日热量设置弹窗 -->
    <u-popup :show="calorieShow" mode="bottom" round="24" @close="calorieShow = false">
      <view class="calorie-popup">
        <view class="calorie-title">每日热量设置</view>
        <view class="calorie-desc">目标仅供参考，建议控制在 1200-2000 kcal</view>
        <view class="calorie-current">
          <text class="calorie-num">{{ calorieTarget }}</text>
          <text class="calorie-unit">kcal / 天</text>
        </view>
        <view class="preset-row">
          <view
            class="preset-item"
            v-for="p in caloriePresets"
            :key="p"
            :class="{ 'preset-item-on': calorieDraft === p }"
            hover-class="btn-hover"
            @click="pickPreset(p)"
          >
            {{ p }}
          </view>
        </view>
        <view class="calorie-input-row">
          <text class="input-label">自定义</text>
          <input
            class="calorie-input"
            type="number"
            v-model="calorieDraft"
            placeholder="800 - 3000"
          />
          <text class="input-label">kcal</text>
        </view>
        <view class="calorie-actions">
          <view class="calorie-btn calorie-btn-plain" hover-class="btn-hover" @click="calorieShow = false">
            取消
          </view>
          <view class="calorie-btn calorie-btn-primary" hover-class="btn-hover" @click="saveCalorie">
            保存
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 修改昵称弹窗 -->
    <u-popup :show="nameShow" mode="bottom" round="24" @close="nameShow = false">
      <view class="name-popup">
        <view class="calorie-title">修改昵称</view>
        <view class="calorie-desc">取一个喜欢的名字，首页和我的页都会同步</view>
        <view class="name-input-row">
          <input class="name-input" type="text" v-model="nameDraft" maxlength="12" placeholder="请输入昵称" />
          <text class="name-count">{{ nameDraft.length }}/12</text>
        </view>
        <view class="calorie-actions">
          <view class="calorie-btn calorie-btn-plain" hover-class="btn-hover" @click="nameShow = false">
            取消
          </view>
          <view class="calorie-btn calorie-btn-primary" hover-class="btn-hover" @click="saveName">
            保存
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 我的收藏餐单弹窗 -->
    <u-popup :show="favShow" mode="bottom" round="24" @close="favShow = false">
      <view class="fav-popup">
        <view class="fav-head">
          <view class="fav-head-left">
            <view class="fav-title">我的收藏餐单</view>
            <view class="fav-sub">已收藏 {{ favPlans.length }} 套配餐方案</view>
          </view>
          <view class="fav-close-icon" hover-class="btn-hover" @click="favShow = false">
            <u-icon name="close" color="#9AA5A0" size="30rpx"></u-icon>
          </view>
        </view>

        <scroll-view scroll-y class="fav-scroll">
          <view v-if="!favPlans.length" class="fav-empty">
            <view class="fav-empty-heart">
              <u-icon name="heart" color="#E8B8C0" size="68rpx"></u-icon>
            </view>
            <view class="fav-empty-text">还没有收藏的餐单</view>
            <view class="fav-empty-sub">在配餐页点「收藏」，就会出现在这里</view>
            <view class="fav-empty-btn" hover-class="btn-hover" @click="goMeal">去配餐页看看</view>
          </view>

          <view class="fav-item" v-for="plan in favPlans" :key="plan.id">
            <view class="fav-item-head">
              <view>
                <view class="fav-plan-name">{{ plan.name }}</view>
                <view class="fav-plan-kcal">约 {{ plan.total }} kcal</view>
              </view>
              <view class="fav-remove" hover-class="btn-hover" @click="removeFav(plan.id)">移除</view>
            </view>
            <view class="fav-meal" v-for="(meal, mi) in plan.meals" :key="mi">
              <text class="fav-meal-type">{{ meal.type }}</text>
              <text class="fav-meal-foods">{{ meal.foods }}</text>
            </view>
          </view>
        </scroll-view>

        <view class="fav-foot">
          <view class="fav-btn" hover-class="btn-hover" @click="goMeal">去配餐页再挑挑</view>
        </view>
      </view>
    </u-popup>

    <footer-tip />
  </view>
</template>

<script>
import { userMock, homeMock } from '@/common/mock.js'

export default {
  data() {
    return {
      nickname: userMock.nickname,
      // 性别：female / male，默认女生（与原有生理期默认开启一致）
      gender: 'female',
      periodEnabled: true,
      // 修改昵称
      nameShow: false,
      nameDraft: '',
      // 每日热量目标
      calorieTarget: homeMock.calorie.target,
      calorieDraft: homeMock.calorie.target,
      caloriePresets: [1200, 1350, 1500, 1650, 1800],
      calorieShow: false,
      favShow: false,
      favPlans: [],
      avatarUrl: ''
    }
  },
  onShow() {
    this.nickname = uni.getStorageSync('userName') || userMock.nickname
    this.gender = uni.getStorageSync('userGender') === 'male' ? 'male' : 'female'
    // 男生不展示生理期，也不读取旧开关状态，避免其它页面出现生理期内容
    this.periodEnabled = this.gender === 'female' && uni.getStorageSync('periodEnabled') !== false
    this.loadCalorie()
    this.loadFavs()
    this.avatarUrl = uni.getStorageSync('avatarUrl') || ''
  },
  methods: {
    openName() {
      this.nameDraft = this.nickname
      this.nameShow = true
    },
    saveName() {
      const name = String(this.nameDraft || '').trim()
      if (!name) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' })
        return
      }
      uni.setStorageSync('userName', name)
      this.nickname = name
      this.nameShow = false
      uni.showToast({ title: '昵称已更新', icon: 'none' })
    },
    // 切换性别：女生自动开启生理期，男生则全站隐藏生理期内容
    pickGender(gender) {
      if (this.gender === gender) return
      this.gender = gender
      uni.setStorageSync('userGender', gender)
      if (gender === 'female') {
        this.periodEnabled = true
        uni.setStorageSync('periodEnabled', true)
        uni.showToast({ title: '已切换为女生，生理期功能已开启', icon: 'none' })
      } else {
        this.periodEnabled = false
        uni.setStorageSync('periodEnabled', false)
        uni.showToast({ title: '已切换为男生，生理期内容已隐藏', icon: 'none' })
      }
    },
    goPeriod() {
      uni.navigateTo({ url: '/pages/period/period' })
    },
    goAvoid() {
      uni.navigateTo({ url: '/pages/avoid/avoid' })
    },
    loadCalorie() {
      const saved = Number(uni.getStorageSync('calorieTarget'))
      this.calorieTarget = saved >= 800 && saved <= 3000 ? saved : homeMock.calorie.target
      this.calorieDraft = this.calorieTarget
    },
    openCalorie() {
      this.loadCalorie()
      this.calorieShow = true
    },
    pickPreset(kcal) {
      this.calorieDraft = kcal
    },
    saveCalorie() {
      const kcal = Number(this.calorieDraft)
      if (!kcal || kcal < 800 || kcal > 3000) {
        uni.showToast({ title: '请输入 800-3000 之间的热量', icon: 'none' })
        return
      }
      const target = Math.round(kcal)
      uni.setStorageSync('calorieTarget', target)
      this.calorieTarget = target
      this.calorieDraft = target
      this.calorieShow = false
      uni.showToast({ title: `已设为 ${target} kcal`, icon: 'none' })
    },
    // 读取本地收藏的餐单，并把食材列表拼成一行文案
    loadFavs() {
      const list = uni.getStorageSync('favPlans') || []
      this.favPlans = list.map((p) => ({
        ...p,
        meals: (p.meals || []).map((m) => ({
          type: m.type,
          foods: (m.items || []).map((i) => i.name).join('、')
        }))
      }))
    },
    openFavs() {
      this.loadFavs()
      this.favShow = true
    },
    removeFav(id) {
      const list = (uni.getStorageSync('favPlans') || []).filter((p) => p.id !== id)
      uni.setStorageSync('favPlans', list)
      this.loadFavs()
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    },
    goMeal() {
      this.favShow = false
      uni.switchTab({ url: '/pages/meal/meal' })
    },
    // 上传头像：H5 走 file + canvas 压缩，其他端走系统相册
    chooseAvatar() {
      // #ifdef H5
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0]
        if (file) this.cropAvatar(file)
      }
      input.click()
      // #endif
      // #ifndef H5
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: (res) => {
          this.setAvatar(res.tempFilePaths[0])
        }
      })
      // #endif
    },
    // 居中裁成正方形并压到 240px，避免长边图片撑爆本地缓存
    cropAvatar(file) {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const size = 240
          const canvas = document.createElement('canvas')
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext('2d')
          const side = Math.min(img.width, img.height)
          const sx = (img.width - side) / 2
          const sy = (img.height - side) / 2
          ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
          this.setAvatar(canvas.toDataURL('image/jpeg', 0.82))
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    },
    setAvatar(url) {
      uni.setStorageSync('avatarUrl', url)
      this.avatarUrl = url
      uni.showToast({ title: '头像已更新', icon: 'none' })
    },
    showAbout() {
      uni.showModal({
        title: '使用说明与免责声明',
        content: '本工具仅饮食科普参考，不具备医疗诊断功能；经期、过敏相关建议不能替代医嘱。如有身体不适，请及时就医。',
        showCancel: false,
        confirmText: '我知道了',
        confirmColor: '#72C8A0'
      })
    },
    onPeriodChange(e) {
      this.periodEnabled = e.detail.value
      uni.setStorageSync('periodEnabled', this.periodEnabled)
      uni.showToast({
        title: this.periodEnabled ? '已开启生理期提示' : '已关闭生理期提示',
        icon: 'none'
      })
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
.btn-hover {
  opacity: 0.7;
}
.press-scale {
  transform: scale(0.98);
}

/* 用户信息卡片 */
.user-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  box-shadow: 0 12rpx 28rpx rgba(114, 200, 160, 0.22);
}
.user-deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}
.deco-1 {
  width: 260rpx;
  height: 260rpx;
  right: -88rpx;
  top: -130rpx;
}
.deco-2 {
  width: 160rpx;
  height: 160rpx;
  right: 10rpx;
  bottom: -94rpx;
  background: rgba(255, 255, 255, 0.08);
}
.avatar {
  position: relative;
  z-index: 1;
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.26);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}
.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
}
.avatar-edit {
  position: absolute;
  right: -6rpx;
  bottom: -6rpx;
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(47, 125, 99, 0.18);
}
.user-info {
  position: relative;
  z-index: 1;
  flex: 1;
}
.nickname {
  font-size: 34rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}
/* 昵称可点击修改 */
.nick-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  transition: transform 0.3s ease;
}
.nick-row .nickname {
  margin-bottom: 0;
}
.nick-edit {
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12rpx;
}
/* 性别切换 */
.gender-group {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  background: #F4F7F5;
  border-radius: 999rpx;
  padding: 4rpx;
}
.gender-chip {
  font-size: 24rpx;
  color: #8FA39B;
  padding: 10rpx 28rpx;
  border-radius: 999rpx;
  transition: all 0.3s ease;
}
.gender-chip-on {
  color: #3E8F72;
  background: #FFFFFF;
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(114, 200, 160, 0.2);
}
/* 修改昵称弹窗 */
.name-popup {
  padding: 40rpx 40rpx 36rpx;
}
.name-input-row {
  display: flex;
  align-items: center;
  margin: 28rpx 0 8rpx;
  border: 1rpx solid #E6EDE9;
  border-radius: 16rpx;
  padding: 0 20rpx;
  height: 88rpx;
}
.name-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}
.name-count {
  font-size: 22rpx;
  color: #B0BAB5;
}
.slogan {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}
.user-tag {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  font-size: 20rpx;
  color: #2F7D63;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 999rpx;
  padding: 8rpx 18rpx;
}

/* 分组标题 */
.section-title {
  font-size: 24rpx;
  color: #8FA39B;
  letter-spacing: 1rpx;
  margin: 6rpx 0 14rpx 10rpx;
}

/* 菜单卡片 */
.menu-card {
  background: #FFFFFF;
  border-radius: 22rpx;
  padding: 6rpx 28rpx;
  margin-bottom: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
}
.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F3F6F4;
  transition: transform 0.3s ease;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.icon-chip {
  width: 68rpx;
  height: 68rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.chip-pink {
  background: #FDF1F3;
}
.chip-rose {
  background: #FEF2F2;
}
.chip-yellow {
  background: #FDF6EC;
}
.chip-green {
  background: #EDF8F2;
}
.chip-mint {
  background: #EFF6F3;
}
.menu-title {
  font-size: 30rpx;
  color: #333333;
}
.menu-desc {
  font-size: 22rpx;
  color: #A3ABA7;
  margin-top: 6rpx;
}
.menu-arrow {
  flex-shrink: 0;
}
.menu-tag {
  flex-shrink: 0;
  font-size: 21rpx;
  color: #3E8F72;
  background: #E8F5EE;
  border-radius: 999rpx;
  padding: 8rpx 22rpx;
}

/* 每日热量设置弹窗 */
.calorie-popup {
  padding: 40rpx 40rpx 36rpx;
}
.calorie-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  text-align: center;
}
.calorie-desc {
  font-size: 22rpx;
  color: #999999;
  text-align: center;
  margin-top: 8rpx;
}
.calorie-current {
  text-align: center;
  margin: 28rpx 0 24rpx;
}
.calorie-num {
  font-size: 64rpx;
  font-weight: 700;
  color: #72C8A0;
}
.calorie-unit {
  font-size: 22rpx;
  color: #999999;
  margin-left: 8rpx;
}
.preset-row {
  display: flex;
}
.preset-item {
  flex: 1;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  font-size: 24rpx;
  color: #7F8D88;
  background: #F5F9F7;
  border: 1rpx solid #E8F0EC;
  border-radius: 12rpx;
}
.preset-item + .preset-item {
  margin-left: 12rpx;
}
.preset-item-on {
  color: #3E8F72;
  font-weight: 600;
  background: #E8F5EE;
  border-color: #CBE8D8;
}
.calorie-input-row {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}
.input-label {
  font-size: 22rpx;
  color: #999999;
}
.calorie-input {
  flex: 1;
  height: 72rpx;
  padding: 0 20rpx;
  margin: 0 16rpx;
  font-size: 26rpx;
  color: #333333;
  text-align: center;
  background: #F5F9F7;
  border-radius: 12rpx;
}
.calorie-actions {
  display: flex;
  margin-top: 32rpx;
}
.calorie-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 28rpx;
}
.calorie-btn-plain {
  color: #8A9691;
  background: #F0F4F2;
  margin-right: 20rpx;
}
.calorie-btn-primary {
  color: #FFFFFF;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
}
/* 收藏餐单弹窗 */
.fav-popup {
  padding: 32rpx 32rpx 24rpx;
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
}
.fav-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.fav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #2F3A36;
}
.fav-sub {
  font-size: 22rpx;
  color: #9AA5A0;
  margin-top: 8rpx;
}
.fav-close-icon {
  padding: 8rpx;
}
.fav-scroll {
  max-height: 56vh;
}
.fav-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56rpx 0 40rpx;
}
.fav-empty-heart {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: #FDF5F6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fav-empty-text {
  font-size: 28rpx;
  color: #3A4742;
  margin-top: 20rpx;
}
.fav-empty-sub {
  font-size: 22rpx;
  color: #9AA5A0;
  margin-top: 8rpx;
}
.fav-empty-btn {
  margin-top: 26rpx;
  font-size: 26rpx;
  color: #3E8F72;
  background: #EAF6EF;
  border-radius: 999rpx;
  padding: 14rpx 36rpx;
}
.fav-item {
  background: #F8FBF9;
  border: 1rpx solid #E9F1ED;
  border-radius: 18rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}
.fav-item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.fav-plan-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2F3A36;
}
.fav-plan-kcal {
  font-size: 22rpx;
  color: #8FA39B;
  margin-top: 6rpx;
}
.fav-remove {
  font-size: 22rpx;
  color: #F56C6C;
  background: #FEF2F2;
  border-radius: 999rpx;
  padding: 6rpx 20rpx;
}
.fav-meal {
  display: flex;
  font-size: 23rpx;
  line-height: 1.7;
}
.fav-meal-type {
  flex-shrink: 0;
  color: #3E8F72;
  background: #EAF6EF;
  border-radius: 8rpx;
  padding: 0 10rpx;
  margin: 4rpx 12rpx 0 0;
}
.fav-meal-foods {
  flex: 1;
  color: #6B7772;
}
.fav-foot {
  margin-top: 16rpx;
}
.fav-btn {
  text-align: center;
  font-size: 28rpx;
  color: #FFFFFF;
  background: linear-gradient(135deg, #72C8A0 0%, #8FD8B8 100%);
  border-radius: 999rpx;
  padding: 20rpx 0;
  box-shadow: 0 8rpx 20rpx rgba(114, 200, 160, 0.24);
}
</style>
