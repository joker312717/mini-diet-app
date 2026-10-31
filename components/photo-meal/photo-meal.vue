<template>
  <u-popup
    :show="visible"
    mode="bottom"
    :round="24"
    :safeAreaInsetBottom="true"
    closeable
    @close="close"
  >
    <view class="pm">
      <view class="pm-title">AI 识图分析热量</view>
      <view class="pm-sub">上传餐盘照片，自动识别食物并估算热量，结果可手动调整</view>

      <!-- 选择 / 预览照片 -->
      <view v-if="!imagePath" class="pm-upload" hover-class="pm-hover" @click="chooseImage">
        <u-icon name="camera-fill" color="#72C8A0" size="56rpx"></u-icon>
        <text class="pm-upload-text">选择餐盘照片</text>
        <text class="pm-upload-tip">建议光线充足、俯拍整盘食物</text>
      </view>
      <view v-else class="pm-preview" hover-class="pm-hover" @click="chooseImage">
        <image class="pm-image" :src="imagePath" mode="aspectFill"></image>
        <view class="pm-replace">{{ previewTip }}</view>
      </view>

      <!-- 分析按钮 -->
      <view
        class="pm-btn"
        :class="{ 'pm-btn-disabled': loading || !imagePath }"
        hover-class="pm-hover"
        @click="analyze"
      >
        <u-loading-icon v-if="loading" mode="circle" color="#ffffff" size="32rpx"></u-loading-icon>
        <text class="pm-btn-text">{{ loading ? '正在分析食物… ' + elapsed + 's' : (imagePath ? '开始 AI 分析' : '请先选择照片') }}</text>
      </view>

      <!-- 识别结果 -->
      <view v-if="items.length" class="pm-result">
        <view class="pm-result-head">
          <text class="pm-result-title">识别结果（{{ items.length }}）</text>
          <text class="pm-result-total">{{ totalCalorie }} kcal</text>
        </view>

        <view v-if="lowCount" class="pm-warn">
          <u-icon name="error-circle" color="#E6A23C" size="28rpx"></u-icon>
          <text class="pm-warn-text">有 {{ lowCount }} 项识别把握不大，请核对名称与克重</text>
        </view>

        <view class="pm-item" v-for="(item, index) in items" :key="item.name + index">
          <view class="pm-item-main">
            <view class="pm-item-name-wrap">
              <text class="pm-item-name">{{ item.name }}</text>
              <text v-if="item.confidence < 0.6" class="pm-low-tag">待确认</text>
            </view>
            <view class="pm-weight-box">
              <input class="pm-weight-input" type="digit" v-model="item.weight" />
              <text class="pm-weight-unit">g</text>
            </view>
          </view>
          <view class="pm-item-right">
            <text class="pm-item-cal">{{ item.unknown && !item.calorie ? '未收录热量' : itemCalorie(item) + ' kcal' }}</text>
            <view class="pm-item-del" @click.stop="removeItem(index)">
              <u-icon name="trash" color="#F56C6C" size="32rpx"></u-icon>
            </view>
          </view>
        </view>

        <view v-if="isMock" class="pm-mock-tip">
          {{ mockTip }}
        </view>

        <view class="pm-actions">
          <view class="pm-btn-cancel" hover-class="pm-hover" @click="close">取消</view>
          <view class="pm-btn-retake" hover-class="pm-hover" @click="retake">重拍</view>
          <view class="pm-btn-confirm" hover-class="pm-hover" @click="confirm">加入记录</view>
        </view>
      </view>
    </view>
  </u-popup>
</template>

<script>
import { analyzeFoodPhoto } from '@/common/photoEstimate.js'
import { compressImage } from '@/common/imageCompress.js'

export default {
  data() {
    return {
      visible: false,
      imagePath: '',
      sourceType: 'album',
      loading: false,
      // 分析已用秒数，让等待过程有反馈
      elapsed: 0,
      timer: null,
      // 压缩后的图片（有 blob 时走 fetch 上传）
      compressed: null,
      compressedSize: 0,
      compressing: false,
      pickToken: 0,
      items: [],
      isMock: false
    }
  },
  computed: {
    totalCalorie() {
      let sum = 0
      this.items.forEach((i) => {
        sum += this.itemCalorie(i)
      })
      return sum
    },
    // 示例数据提示（仅在后端未配置时出现）
    mockTip() {
      return '当前为示例数据，配置服务端接口后显示真实分析结果'
    },
    // 置信度低于 0.6 的条目数量，用于顶部提醒
    lowCount() {
      return this.items.filter((i) => Number(i.confidence) < 0.6).length
    },
    // 预览右下角提示：显示压缩后体积，让用户知道上传变快了
    previewTip() {
      if (this.compressing) return '正在压缩…'
      if (this.compressedSize) return `已压缩 ${Math.round(this.compressedSize / 1024)}KB · 点击更换`
      return '点击更换照片'
    }
  },
  methods: {
    // 供父页面通过 ref 调用；sourceType 为 camera 时直接调起拍照
    open(sourceType) {
      this.sourceType = sourceType === 'camera' ? 'camera' : 'album'
      this.visible = true
      this.imagePath = ''
      this.items = []
      this.isMock = false
      this.loading = false
      this.compressed = null
      this.compressedSize = 0
      this.compressing = false
      this.pickToken += 1
    },
    close() {
      this.visible = false
      this.loading = false
      this.stopTimer()
    },
    validWeight(item) {
      const w = Number(item.weight)
      return isNaN(w) || w <= 0 ? 0 : w
    },
    itemCalorie(item) {
      return Math.round((item.calorie * this.validWeight(item)) / 100)
    },
    chooseImage() {
      const onPicked = (path) => {
        this.imagePath = path
        this.items = []
        this.isMock = false
        this.compressed = null
        this.compressedSize = 0
        this.compressing = true
        const token = ++this.pickToken
        compressImage(path).then((obj) => {
          // 压缩期间用户又换了一张图，丢弃旧结果
          if (token !== this.pickToken) return
          this.compressing = false
          if (obj.blob) {
            this.compressed = obj
            this.compressedSize = obj.size
            this.imagePath = obj.path
          }
        })
      }
      if (uni.chooseMedia) {
        uni.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sizeType: ['compressed'],
          sourceType: [this.sourceType],
          success: (res) => {
            if (res.tempFiles && res.tempFiles.length) onPicked(res.tempFiles[0].tempFilePath)
          }
        })
      } else {
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: [this.sourceType],
          success: (res) => {
            if (res.tempFilePaths && res.tempFilePaths.length) onPicked(res.tempFilePaths[0])
          }
        })
      }
    },
    retake() {
      this.imagePath = ''
      this.items = []
      this.isMock = false
      this.compressed = null
      this.compressedSize = 0
      this.compressing = false
      this.chooseImage()
    },
    analyze() {
      if (!this.imagePath) {
        uni.showToast({ title: '请先选择照片', icon: 'none' })
        return
      }
      if (this.loading) return
      if (this.compressing) {
        uni.showToast({ title: '图片正在压缩，请稍候', icon: 'none' })
        return
      }
      this.loading = true
      this.elapsed = 0
      this.stopTimer()
      this.timer = setInterval(() => {
        this.elapsed += 1
      }, 1000)
      analyzeFoodPhoto(this.imagePath, '', this.compressed)
        .then((res) => {
          this.items = res.items
          this.isMock = res.mock
        })
        .catch((err) => {
          uni.showToast({ title: err.message || '分析失败', icon: 'none' })
        })
        .finally(() => {
          this.loading = false
          this.stopTimer()
        })
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    removeItem(index) {
      this.items.splice(index, 1)
    },
    confirm() {
      if (!this.items.length) {
        uni.showToast({ title: '暂无可加入的食材', icon: 'none' })
        return
      }
      const list = this.items
        .filter((i) => this.validWeight(i) > 0)
        .map((i) => ({ ...i, weight: this.validWeight(i) }))
      if (!list.length) {
        uni.showToast({ title: '请先填写重量', icon: 'none' })
        return
      }
      this.$emit('confirm', list)
      this.close()
    }
  }
}
</script>

<style scoped>
.pm {
  background: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  padding: 40rpx 32rpx 32rpx;
}
.pm-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
}
.pm-sub {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.6;
  margin-bottom: 28rpx;
}

/* 上传区 */
.pm-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 260rpx;
  border: 2rpx dashed #C9E7D9;
  border-radius: 16rpx;
  background: #F7FCF9;
  margin-bottom: 24rpx;
  transition: transform 0.3s ease;
}
.pm-upload-text {
  font-size: 28rpx;
  color: #72C8A0;
  font-weight: 500;
  margin-top: 16rpx;
}
.pm-upload-tip {
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
}

/* 预览 */
.pm-preview {
  position: relative;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  transition: transform 0.3s ease;
}
.pm-image {
  width: 100%;
  height: 320rpx;
  display: block;
}
.pm-replace {
  position: absolute;
  right: 16rpx;
  bottom: 16rpx;
  font-size: 22rpx;
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
}

/* 分析按钮 */
.pm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 999rpx;
  background: #72C8A0;
  transition: transform 0.3s ease;
}
.pm-btn-disabled {
  background: #B7DFCC;
}
.pm-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
  margin-left: 12rpx;
}

/* 结果 */
.pm-result {
  margin-top: 28rpx;
}
.pm-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}
.pm-result-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}
.pm-result-total {
  font-size: 28rpx;
  font-weight: 600;
  color: #72C8A0;
}
.pm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F2F1;
}
.pm-item:last-child {
  border-bottom: none;
}
.pm-item-main {
  display: flex;
  align-items: center;
}
.pm-item-name {
  font-size: 28rpx;
  color: #333333;
  margin-right: 20rpx;
}
.pm-weight-box {
  display: flex;
  align-items: center;
  border: 1rpx solid #E0E6E3;
  border-radius: 12rpx;
  padding: 0 14rpx;
  height: 54rpx;
}
.pm-weight-input {
  width: 90rpx;
  font-size: 26rpx;
  color: #333333;
  text-align: center;
}
.pm-weight-unit {
  font-size: 24rpx;
  color: #999999;
}
.pm-item-right {
  display: flex;
  align-items: center;
}
.pm-item-cal {
  font-size: 26rpx;
  color: #72C8A0;
  font-weight: 600;
}
.pm-item-del {
  display: flex;
  align-items: center;
  padding: 8rpx 0 8rpx 20rpx;
}
.pm-mock-tip {
  font-size: 22rpx;
  color: #999999;
  margin-top: 16rpx;
}
.pm-warn {
  display: flex;
  align-items: center;
  background: #FDF6EC;
  border-radius: 12rpx;
  padding: 14rpx 20rpx;
  margin-bottom: 12rpx;
}
.pm-warn-text {
  font-size: 22rpx;
  color: #B9863B;
  margin-left: 10rpx;
}
.pm-item-name-wrap {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}
.pm-item-name-wrap .pm-item-name {
  margin-right: 0;
}
.pm-low-tag {
  font-size: 20rpx;
  color: #E6A23C;
  background: #FDF6EC;
  border-radius: 8rpx;
  padding: 2rpx 10rpx;
  margin-left: 10rpx;
}

/* 底部操作 */
.pm-actions {
  display: flex;
  margin-top: 32rpx;
}
.pm-btn-cancel {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #999999;
  border: 1rpx solid #E0E6E3;
  border-radius: 999rpx;
  padding: 20rpx 0;
  margin-right: 16rpx;
  transition: transform 0.3s ease;
}
.pm-btn-retake {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #3E8F72;
  background: #EAF6EF;
  border-radius: 999rpx;
  padding: 20rpx 0;
  margin-right: 16rpx;
  transition: transform 0.3s ease;
}
.pm-btn-confirm {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
  background: #72C8A0;
  border-radius: 999rpx;
  padding: 20rpx 0;
  margin-left: 24rpx;
  transition: transform 0.3s ease;
}
.pm-hover {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>
