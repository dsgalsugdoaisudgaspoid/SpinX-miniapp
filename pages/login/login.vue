<template>
    <view class="login">
        <view class="orbits">
            <view class="ring r1"></view>
            <view class="ring r2"></view>
            <view class="ring r3"></view>
            <view class="star"></view>
        </view>

        <view class="brand" :style="{ paddingTop: (statusBar + 40) + 'px' }">
            <view class="mark"><text class="mono">SX</text></view>
            <text class="wordmark">SPIN X</text>
            <text class="sub">环星骑行俱乐部</text>
            <text class="slogan">夜骑 · 拉练 · 公益骑 · 跨城骑</text>
        </view>

        <view class="panel">
            <button class="g-btn wx" open-type="getUserInfo" @tap="wxAuthLogin">
                <text class="wxi">✦</text> 微信一键登录
            </button>
            <view class="guest" @tap="continueAsGuest">
                <text>先逛逛（游客浏览）</text>
            </view>

            <view class="demo-title"><text>体验账号 · 免授权直接登录</text></view>
            <view class="demo-grid">
                <view v-for="a in demos" :key="a.code" class="demo" @tap="demoLogin(a)">
                    <text class="dl">{{ a.label }}</text>
                    <text class="dd">{{ a.desc }}</text>
                </view>
            </view>

            <text class="fine">登录即代表同意《用户协议》与《隐私政策》；出行前需签署骑行安全知情同意书。</text>
        </view>
    </view>
</template>

<script>
import { wxLogin, guestToken } from '@/api/auth.js'
import { DEMO_ACCOUNTS } from '@/common/config.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() {
        return { statusBar: 20, demos: DEMO_ACCOUNTS }
    },
    onLoad() {
        this.statusBar = statusBarHeight()
    },
    methods: {
        // 微信授权登录：wx.login 换 code，交后端 code2session
        wxAuthLogin() {
            uni.login({
                provider: 'weixin',
                success: async (res) => {
                    try {
                        await wxLogin({ code: res.code })
                        this.done()
                    } catch (e) {}
                },
                fail: () => uni.showToast({ title: '微信登录失败', icon: 'none' })
            })
        },
        // 体验账号：直接把约定 code 交给后端 mock 登录
        async demoLogin(a) {
            try {
                await wxLogin({ code: a.code })
                this.done()
            } catch (e) {}
        },
        async continueAsGuest() {
            try { await guestToken() } catch (e) {}
            this.backOrHome()
        },
        done() {
            uni.showToast({ title: '登录成功', icon: 'success' })
            setTimeout(() => this.backOrHome(), 500)
        },
        backOrHome() {
            const pages = getCurrentPages()
            if (pages.length > 1) uni.navigateBack()
            else uni.switchTab({ url: '/pages/home/home' })
        }
    }
}
</script>

<style lang="scss" scoped>
.login {
    min-height: 100vh;
    background: linear-gradient(165deg, $night-1 0%, $night-2 60%, $night-3 100%);
    position: relative; overflow: hidden;
}
.orbits { position: absolute; top: -160rpx; right: -220rpx; width: 720rpx; height: 720rpx; opacity: .5; }
.ring { position: absolute; border: 1rpx solid rgba(255,255,255,.16); border-radius: 50%; }
.r1 { inset: 0; } .r2 { inset: 120rpx; } .r3 { inset: 240rpx; border-color: rgba(18,208,122,.5); }
.star { position: absolute; top: 240rpx; left: 300rpx; width: 16rpx; height: 16rpx; background: $green; border-radius: 50%;
    box-shadow: 0 0 24rpx 4rpx rgba(18,208,122,.8); }

.brand { position: relative; z-index: 1; padding: 0 60rpx; display: flex; flex-direction: column; }
.mark { width: 108rpx; height: 108rpx; border-radius: 50%; border: 2rpx solid rgba(255,255,255,.3);
    display: flex; align-items: center; justify-content: center; }
.mark .mono { color: #fff; font-weight: 800; font-size: 40rpx; letter-spacing: -2rpx; }
.wordmark { color: #fff; font-size: 72rpx; font-weight: 800; font-style: italic; letter-spacing: 4rpx; margin-top: 34rpx; }
.sub { color: #fff; font-size: 34rpx; font-weight: 700; margin-top: 6rpx; }
.slogan { color: rgba(255,255,255,.7); font-size: 24rpx; margin-top: 14rpx; }

.panel {
    position: absolute; left: 0; right: 0; bottom: 0; z-index: 1;
    background: $card; border-radius: 44rpx 44rpx 0 0; padding: 48rpx 44rpx calc(48rpx + env(safe-area-inset-bottom));
}
.wx { background: linear-gradient(120deg, $green, $green-deep); }
.wx .wxi { margin-right: 12rpx; font-size: 30rpx; }
.guest { text-align: center; color: $muted; font-size: 26rpx; padding: 26rpx 0 6rpx; }

.demo-title { display: flex; align-items: center; justify-content: center; margin-top: 18rpx; }
.demo-title text { color: $faint; font-size: 22rpx; }
.demo-grid { display: flex; flex-wrap: wrap; gap: 18rpx; margin-top: 22rpx; }
.demo { width: calc(50% - 9rpx); background: $paper; border-radius: 22rpx; padding: 22rpx; box-sizing: border-box; }
.demo .dl { font-size: 28rpx; font-weight: 800; color: $ink; display: block; }
.demo .dd { font-size: 21rpx; color: $muted; margin-top: 6rpx; display: block; }
.fine { display: block; text-align: center; color: $faint; font-size: 20rpx; margin-top: 30rpx; line-height: 1.6; }
</style>
