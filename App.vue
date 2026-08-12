<script>
import { guestToken } from '@/api/auth.js'
import { ensureCityReady } from '@/store/city.js'

export default {
    onLaunch: function () {
        // 冷启动：若无登录态，静默走游客令牌，保证首页/活动可浏览
        const token = uni.getStorageSync('accessToken')
        if (!token) {
            guestToken().catch(() => {})
        }
        // 尽早发起城市兜底请求（不 await，不阻塞启动）：只访问公开接口，不调用 uni.getLocation，
        // 不会触发定位权限弹窗。真正的定位判定仍由 home.vue 的 initCity() 在用户看到首页时进行。
        ensureCityReady()
    },
    onShow: function () {},
    onHide: function () {}
}
</script>

<style lang="scss">
/* 全局样式（scss 变量由 uni.scss 自动注入，无需 @import） */

page {
    background-color: $paper;
    color: $ink;
    font-size: 26rpx;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    line-height: 1.5;
}

view, text, scroll-view { box-sizing: border-box; }

/* 通用工具类 */
.row { display: flex; flex-direction: row; align-items: center; }
.col { display: flex; flex-direction: column; }
.between { justify-content: space-between; }
.center { align-items: center; justify-content: center; }
.flex1 { flex: 1; }
.mono { font-family: 'DIN Alternate', 'SF Mono', Menlo, monospace; font-style: italic; }
.ellipsis { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.g-btn {
    height: 96rpx; border-radius: 30rpx;
    background: linear-gradient(120deg, $green, $green-deep);
    color: #04140c; font-weight: 800; font-size: 30rpx;
    display: flex; align-items: center; justify-content: center;
}
.g-btn--plain {
    background: $green-soft; color: $green-deep;
}
</style>
