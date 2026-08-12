<template>
    <view class="cr">
        <view class="hero" :style="{ paddingTop: (statusBar + 24) + 'px', background: heroBg }">
            <view class="stars"></view>
            <view class="nbtn" :style="{ top: (statusBar + 12) + 'px' }" @tap="back">‹</view>
            <text class="kk">CREDIT SCORE · 信誉分</text>
            <text class="score mono">{{ score }}</text>
            <text class="lvl">{{ levelText }}</text>
            <text class="hint">{{ canJoinHot ? '信誉良好，可正常报名全部活动' : '低于 ' + threshold + ' 分，暂不能报名热门活动' }}</text>
        </view>

        <view class="rules">
            <text class="rt">规则</text>
            <text class="rl">· 新会员默认 100 分，准时参加、全勤签到可逐步恢复</text>
            <text class="rl">· 报名后未到场（爽约）：每次扣 20 分并记录</text>
            <text class="rl">· 活动开始前 {{ cutoffHours }} 小时内取消：计一次爽约，扣 20 分</text>
            <text class="rl">· 信誉分低于 {{ threshold }} 分：暂时限制报名热门活动</text>
        </view>

        <view class="sec">信誉记录</view>
        <view class="list">
            <view v-for="(r, i) in records" :key="i" class="row">
                <text class="ic">{{ r.delta < 0 ? '⚠️' : '✅' }}</text>
                <view class="mid"><text class="rr">{{ r.reason }}</text><text class="rd">{{ shortDate(r.createdAt) }}</text></view>
                <text :class="['delta', r.delta < 0 ? 'down' : 'up']">{{ r.delta > 0 ? '+' : '' }}{{ r.delta }}</text>
            </view>
            <view v-if="records.length === 0" class="empty">暂无记录，保持良好信誉～</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getCredit } from '@/api/user.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, score: 100, threshold: 70, canJoinHot: true, cutoffHours: 6, records: [] } },
    computed: {
        levelText() { return this.score >= 90 ? '信誉极佳' : this.score >= 70 ? '信誉良好' : this.score >= 50 ? '信誉受损' : '信誉较差' },
        heroBg() {
            return this.canJoinHot
                ? 'linear-gradient(160deg,#0e1b24,#123a57 60%,#0a5c86)'
                : 'linear-gradient(160deg,#3a1414,#5a1d1d 60%,#7a2a2a)'
        }
    },
    onShow() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/profile/profile' }) },
        shortDate(iso) { return iso ? iso.slice(0, 10) : '' },
        async load() {
            try {
                const d = await getCredit()
                if (!d) return
                this.score = d.score; this.threshold = d.threshold; this.canJoinHot = d.canJoinHot
                this.cutoffHours = d.cutoffHours; this.records = d.records || []
            } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.cr { min-height: 100vh; background: $paper; }
.hero { padding: 0 40rpx 46rpx; text-align: center; color: #fff; position: relative; overflow: hidden; }
.nbtn { position: absolute; left: 24rpx; width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; z-index: 3; }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 24% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 70% 24%, #cdefff, transparent), radial-gradient(2rpx 2rpx at 54% 14%, #fff, transparent); }
.kk { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.score { position: relative; display: block; font-size: 120rpx; font-weight: 800; letter-spacing: -2rpx; line-height: 1.1; margin-top: 12rpx; }
.lvl { position: relative; display: block; font-size: 26rpx; font-weight: 800; }
.hint { position: relative; display: block; font-size: 21rpx; opacity: .85; margin-top: 14rpx; }

.rules { margin: -26rpx 28rpx 0; position: relative; z-index: 2; background: $card; border-radius: 26rpx; padding: 26rpx; box-shadow: 0 16rpx 36rpx -18rpx rgba(9,20,15,.4); }
.rt { display: block; font-size: 25rpx; font-weight: 800; margin-bottom: 12rpx; }
.rl { display: block; font-size: 22rpx; color: $muted; line-height: 1.9; }

.sec { font-size: 28rpx; font-weight: 800; margin: 30rpx 30rpx 14rpx; }
.list { margin: 0 28rpx; }
.row { display: flex; align-items: center; gap: 18rpx; background: $card; border-radius: 22rpx; padding: 22rpx 24rpx; margin-bottom: 14rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.ic { font-size: 30rpx; flex: none; }
.mid { flex: 1; min-width: 0; }
.rr { display: block; font-size: 25rpx; font-weight: 700; }
.rd { display: block; font-size: 20rpx; color: $muted; margin-top: 6rpx; }
.delta { font-size: 30rpx; font-weight: 800; flex: none; }
.delta.down { color: $coral; } .delta.up { color: $green-deep; }
.empty { text-align: center; color: $faint; font-size: 23rpx; padding: 60rpx 0; }
.safe-bottom { height: 60rpx; }
</style>
