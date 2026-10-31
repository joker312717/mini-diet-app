<script>
export default {
  onLaunch() {},
  onShow() {},
  onHide() {}
}
</script>

<style lang="scss">
@import '@/uni_modules/uview-ui/index.scss';

/* uview 图标字体：当前安装包缺失字体文件，这里手动补上声明 */
@font-face {
  font-family: 'uicon-iconfont';
  src: url('/static/fonts/uiconfont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

page {
  min-height: 100vh;
  background-color: #F2F8F5;
  background-image: radial-gradient(130% 80% at 50% -6%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 52%),
    radial-gradient(circle at 10% 2%, rgba(114, 200, 160, 0.30) 0%, rgba(114, 200, 160, 0) 38%),
    radial-gradient(circle at 92% 6%, rgba(232, 184, 192, 0.28) 0%, rgba(232, 184, 192, 0) 34%),
    radial-gradient(circle at 86% 92%, rgba(114, 200, 160, 0.22) 0%, rgba(114, 200, 160, 0) 44%),
    radial-gradient(circle at 4% 78%, rgba(166, 228, 198, 0.20) 0%, rgba(166, 228, 198, 0) 30%),
    radial-gradient(circle at 52% 40%, rgba(238, 199, 127, 0.16) 0%, rgba(238, 199, 127, 0) 36%),
    radial-gradient(circle at 44% 96%, rgba(199, 185, 226, 0.18) 0%, rgba(199, 185, 226, 0) 28%),
    url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'%3E%3Cg fill='none' stroke='%2372C8A0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' opacity='0.16'%3E%3Cpath d='M34 66c16-3 29 7 33 22-16 3-29-7-33-22z'/%3E%3Cpath d='M34 66c9 7 18 12 33 22'/%3E%3Cpath d='M186 44v20'/%3E%3Cpath d='M186 44c-10-1-18 5-20 15 10 1 17-5 20-15z'/%3E%3Cpath d='M186 44c7 0 12 4 14 10'/%3E%3Cpath d='M120 228c-8-6-13-11-13-18 0-6 6-9 13-5 7-4 13-1 13 5 0 7-5 12-13 18z'/%3E%3C/g%3E%3Cg fill='none' stroke='%23E8B8C0' stroke-width='2' stroke-linecap='round' opacity='0.16'%3E%3Cpath d='M206 176c9-6 18-1 18 8 0 8-9 14-18 20-9-6-18-12-18-20 0-9 9-14 18-8z'/%3E%3Cpath d='M78 168c12-2 22 6 25 17-12 2-21-6-25-17z'/%3E%3Cpath d='M78 168c7 5 14 9 25 17'/%3E%3C/g%3E%3Cg fill='none' stroke='%23E2B567' stroke-width='2' stroke-linecap='round' opacity='0.16'%3E%3Cpath d='M150 100l3 7 7 3-7 3-3 7-3-7-7-3 7-3z'/%3E%3Cpath d='M24 150c10-2 18 5 21 14-10 2-18-5-21-14z'/%3E%3C/g%3E%3Cg fill='none' stroke='%23B9A8DB' stroke-width='2' stroke-linecap='round' opacity='0.16'%3E%3Cpath d='M100 30c-6-5-10-9-10-14 0-4 4-6 10-3 6-3 10 1 10 3 0 5-4 9-10 14z'/%3E%3Cpath d='M242 118l2 5 5 2-5 2-2 5-2-5-5-2 5-2z'/%3E%3C/g%3E%3C/svg%3E"),
    linear-gradient(180deg, #FFFFFF 0%, #F2F8F5 100%);
  background-size: auto, auto, auto, auto, auto, auto, auto, 260rpx 260rpx, auto;
  background-attachment: fixed;
  font-size: 28rpx;
  color: #333333;
}
/* 白色面板：自上而下的极淡渐层，配合投影形成轻微透视感 */
.card,
.grid-card,
.plan-card,
.date-bar,
.menu-card,
.popup,
.pm,
.photo-entry,
.search-box,
.tabs,
.add-bar,
.plan-option {
  background-image: linear-gradient(180deg, #FFFFFF 0%, #FBFDFC 55%, #F2F8F5 100%) !important;
}
</style>
