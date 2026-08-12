<template>
    <view class="mc">
        <view class="hero" :style="{ paddingTop: (statusBar + 30) + 'px' }">
            <view class="stars"></view>
            <view class="nbtn" :style="{ top: (statusBar + 12) + 'px' }" @tap="back">‹</view>
            <text class="kk">CHECK-IN CODE</text>
            <text class="h2">我的签到码</text>
            <text class="sub">到集合点后，出示此码给领队扫码签到</text>
        </view>

        <view class="codecard">
            <view class="qrbox">
                <text class="qrhint" v-if="!code">生成中…</text>
                <block v-else>
                    <text class="qico">📷</text>
                    <text class="cbig mono">{{ code }}</text>
                </block>
            </view>
            <view class="cd" v-if="code">
                <text v-if="left > 0" class="cdt">有效期 <text class="mono cdv">{{ mmss }}</text>，过期请刷新</text>
                <text v-else class="cdt exp">已过期，请刷新签到码</text>
            </view>
            <view class="ops">
                <view class="op" @tap="refresh">🔄 刷新签到码</view>
            </view>
        </view>

        <view class="tips">
            <text class="tt">· 签到码 5 分钟有效，且仅可被扫描一次</text>
            <text class="tt">· 领队在「活动 → 报名管理」扫码即可完成签到</text>
            <text class="tt">· 全勤参与可获得额外积分</text>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { issueCheckinCode } from '@/api/activity.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, code: '', expireTs: 0, left: 0, timer: null } },
    computed: {
        mmss() { const s = Math.max(0, this.left); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60) }
    },
    onLoad() { this.statusBar = statusBarHeight(); this.refresh() },
    onUnload() { if (this.timer) clearInterval(this.timer) },
    methods: {
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/checkin/checkin' }) },
        async refresh() {
            try {
                const d = await issueCheckinCode()
                if (!d || !d.code) return
                this.code = d.code
                this.expireTs = new Date(d.expireAt).getTime()
                this.tick()
                if (this.timer) clearInterval(this.timer)
                this.timer = setInterval(this.tick, 1000)
            } catch (e) {}
        },
        tick() {
            this.left = Math.max(0, Math.round((this.expireTs - Date.now()) / 1000))
            if (this.left <= 0 && this.timer) { clearInterval(this.timer); this.timer = null }
        }
    }
}
</script>

<style lang="scss" scoped>
.mc { min-height: 100vh; background: $paper; }
.hero { padding: 0 40rpx 60rpx; text-align: center; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, $night-1, $night-2 60%, $night-3); }
.nbtn { position: absolute; left: 24rpx; width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; z-index: 3; }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 24% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 70% 24%, #bfe9ff, transparent), radial-gradient(2rpx 2rpx at 54% 14%, #fff, transparent); }
.kk { position: relative; font-size: 19rpx; letter-spacing: 3rpx; opacity: .8; }
.h2 { position: relative; display: block; font-size: 42rpx; font-weight: 800; margin-top: 12rpx; }
.sub { position: relative; display: block; font-size: 22rpx; opacity: .82; margin-top: 12rpx; }

.codecard { margin: -40rpx 40rpx 0; position: relative; z-index: 2; background: $card; border-radius: 30rpx; padding: 34rpx 30rpx; box-shadow: 0 20rpx 44rpx -18rpx rgba(9,20,15,.4); text-align: center; }
.qrbox { height: 360rpx; border-radius: 24rpx; background: $paper; box-shadow: inset 0 0 0 2rpx $green-soft;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18rpx; }
.qico { font-size: 90rpx; }
.qrhint { color: $faint; font-size: 24rpx; }
.cbig { font-size: 40rpx; font-weight: 800; letter-spacing: 2rpx; color: $ink; }
.cd { margin-top: 22rpx; }
.cdt { font-size: 22rpx; color: $muted; } .cdt.exp { color: $coral; font-weight: 700; }
.cdv { font-weight: 800; color: $green-deep; }
.ops { margin-top: 26rpx; }
.op { height: 88rpx; border-radius: 26rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 28rpx; display: flex; align-items: center; justify-content: center; }
.tips { margin: 30rpx 40rpx 0; display: flex; flex-direction: column; gap: 10rpx; }
.tt { font-size: 22rpx; color: $muted; line-height: 1.6; }
.safe-bottom { height: 60rpx; }
</style>
