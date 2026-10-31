<template>
  <view class="page">
    <!-- 双标签切换 -->
    <view class="tabs">
      <view
        class="tab"
        :class="{ 'tab-active': tabIndex === 0 }"
        hover-class="btn-hover"
        @click="tabIndex = 0"
      >
        过敏食材
      </view>
      <view
        class="tab"
        :class="{ 'tab-active': tabIndex === 1 }"
        hover-class="btn-hover"
        @click="tabIndex = 1"
      >
        不爱吃食材
      </view>
    </view>

    <!-- 搜索 + 添加 -->
    <view class="add-bar">
      <u-icon class="add-search" name="search" color="#999" size="32rpx"></u-icon>
      <input
        class="add-input"
        v-model="keyword"
        :placeholder="tabIndex === 0 ? '搜索或输入过敏食材' : '搜索或输入不爱吃的食材'"
        placeholder-class="add-placeholder"
        confirm-type="done"
        @confirm="addFood"
      />
      <view class="add-btn" hover-class="btn-hover" @click="addFood">
        <u-icon class="add-btn-icon" name="plus" color="#fff" size="28rpx"></u-icon>添加
      </view>
    </view>

    <!-- 黑名单列表 -->
    <view class="card">
      <view class="card-title">
        {{ tabIndex === 0 ? '我的过敏食材' : '我的不爱吃食材' }}（{{ displayList.length }}）
      </view>
      <view v-if="!displayList.length" class="empty-line">暂无内容，可在上方添加</view>
      <view class="food-chips" v-else>
        <view class="food-chip" hover-class="press-scale" v-for="name in displayList" :key="name">
          <text class="chip-name">{{ name }}</text>
          <text v-if="tabIndex === 1 && isFromTag(name)" class="chip-tag">标签</text>
          <u-icon
            class="chip-del"
            hover-class="btn-hover"
            @click="removeFood(name)"
            name="close"
            color="#999"
            size="22rpx"
          ></u-icon>
        </view>
      </view>
    </view>

    <!-- 偏好标签批量勾选 -->
    <view class="card">
      <view class="card-title">饮食偏好（勾选后自动归类为忌口）</view>
      <view class="tag-row">
        <view
          class="pref-tag"
          :class="{ 'pref-tag-on': checkedTags[t.key] }"
          v-for="t in prefTags"
          :key="t.key"
          hover-class="btn-hover"
          @click="toggleTag(t.key)"
        >
          <u-icon
            v-if="checkedTags[t.key]"
            class="pref-check"
            name="checkmark"
            color="#fff"
            size="24rpx"
          ></u-icon>{{ t.label }}
        </view>
      </view>
      <view class="tag-hint">勾选标签后，相关食材将自动加入「不爱吃食材」名单</view>
    </view>

    <footer-tip />
  </view>
</template>

<script>
import { avoidMock } from '@/common/mock.js'

const SETTINGS_KEY = 'avoidSettings'

export default {
  data() {
    return {
      tabIndex: 0,
      keyword: '',
      allergicList: [...avoidMock.allergic],
      dislikeManual: [...avoidMock.dislike],
      prefTags: avoidMock.prefTags,
      checkedTags: {}
    }
  },
  computed: {
    // 勾选标签自动归类的食材
    tagFoods() {
      const set = new Set()
      this.prefTags.forEach((t) => {
        if (this.checkedTags[t.key]) t.foods.forEach((f) => set.add(f))
      })
      return [...set]
    },
    displayList() {
      if (this.tabIndex === 0) return this.allergicList
      return [...new Set([...this.dislikeManual, ...this.tagFoods])]
    }
  },
  onLoad() {
    const saved = uni.getStorageSync(SETTINGS_KEY)
    if (saved) {
      this.allergicList = saved.allergic || []
      this.dislikeManual = saved.dislike || []
      this.checkedTags = saved.tags || {}
    }
  },
  methods: {
    isFromTag(name) {
      return this.tagFoods.indexOf(name) > -1 && this.dislikeManual.indexOf(name) === -1
    },
    addFood() {
      const name = this.keyword.trim()
      if (!name) {
        uni.showToast({ title: '请输入食材名称', icon: 'none' })
        return
      }
      const list = this.tabIndex === 0 ? this.allergicList : this.dislikeManual
      if (this.displayList.indexOf(name) > -1) {
        uni.showToast({ title: '该食材已在名单中', icon: 'none' })
        return
      }
      list.push(name)
      this.keyword = ''
      this.save()
      uni.showToast({ title: '已添加', icon: 'success' })
    },
    removeFood(name) {
      if (this.tabIndex === 0) {
        this.allergicList = this.allergicList.filter((n) => n !== name)
      } else if (this.dislikeManual.indexOf(name) > -1) {
        this.dislikeManual = this.dislikeManual.filter((n) => n !== name)
      } else {
        uni.showToast({ title: '该食材来自偏好标签，取消勾选即可移除', icon: 'none' })
        return
      }
      this.save()
    },
    toggleTag(key) {
      this.$set(this.checkedTags, key, !this.checkedTags[key])
      this.save()
    },
    save() {
      uni.setStorageSync(SETTINGS_KEY, {
        allergic: this.allergicList,
        dislike: this.dislikeManual,
        tags: this.checkedTags
      })
      // 同步给其他页面使用：录入页过敏提醒、配餐页方案过滤
      uni.setStorageSync('allergicFoods', this.allergicList)
      uni.setStorageSync('avoidFoods', [...new Set([...this.allergicList, ...this.dislikeManual, ...this.tagFoods])])
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
.press-scale {
  transform: scale(0.98);
}

/* 双标签 */
.tabs {
  display: flex;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 8rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}
.tab {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
  padding: 16rpx 0;
  border-radius: 12rpx;
}
.tab-active {
  background: #72C8A0;
  color: #FFFFFF;
  font-weight: 600;
}

/* 添加栏 */
.add-bar {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 12rpx 12rpx 12rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}
.add-search {
  margin-right: 16rpx;
  flex-shrink: 0;
}
.add-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  height: 64rpx;
}
.add-placeholder {
  color: #999999;
}
.add-btn {
  font-size: 28rpx;
  color: #FFFFFF;
  background: #72C8A0;
  border-radius: 12rpx;
  padding: 12rpx 36rpx;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}
.add-btn-icon {
  margin-right: 8rpx;
}

/* 卡片 */
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
.empty-line {
  font-size: 26rpx;
  color: #999999;
  text-align: center;
  padding: 24rpx 0;
}

/* 食材 chips */
.food-chips {
  display: flex;
  flex-wrap: wrap;
}
.food-chip {
  display: flex;
  align-items: center;
  background: #F0F2F1;
  border-radius: 999rpx;
  padding: 10rpx 14rpx 10rpx 24rpx;
  margin: 0 16rpx 16rpx 0;
  transition: transform 0.3s ease;
}
.chip-name {
  font-size: 26rpx;
  color: #333333;
}
.chip-tag {
  font-size: 20rpx;
  color: #72C8A0;
  background: #EAF6F0;
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
  margin-left: 10rpx;
}
.chip-del {
  padding: 0 10rpx 0 14rpx;
}

/* 偏好标签 */
.tag-row {
  display: flex;
  flex-wrap: wrap;
}
.pref-tag {
  font-size: 26rpx;
  color: #666666;
  background: #F6F8F7;
  border: 1rpx solid #E0E6E3;
  border-radius: 999rpx;
  padding: 14rpx 32rpx;
  margin: 0 16rpx 16rpx 0;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}
.pref-check {
  margin-right: 6rpx;
}
.pref-tag-on {
  color: #FFFFFF;
  background: #72C8A0;
  border-color: #72C8A0;
}
.tag-hint {
  font-size: 22rpx;
  color: #999999;
  line-height: 1.6;
}
</style>
