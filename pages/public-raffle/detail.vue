<template>
    <view class="pr" v-if="raffle">
        <view class="head" :style="{ paddingTop: (statusBar + 12) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>
            <text class="eye">PUBLIC DRAW · 公共抽奖</text>
            <text class="ttl">{{ raffle.title }}</text>
            <text class="desc" v-if="raffle.description">{{ raffle.description }}</text>
            <view class="metaline">
                <text class="ml">👥 {{ raffle.entrantCount }} 人参与</text>
                <text class="ml">🕑 {{ raffle.drawn ? '已开奖' : (drawAtText + ' 开奖') }}</text>
            </view>
        </view>

        <view class="body">
            <raffle-board :raffle="raffle" title="🎁 奖品设置" :status-text="statusText" :note="note"></raffle-board>

            <!-- 开奖名单 -->
            <view class="winbox" v-if="raffle.drawn && raffle.winners.length">
                <text class="wt">🏆 中奖名单</text>
                <view v-for="(w, i) in raffle.winners" :key="i" class="wrow">
                    <text class="wc">{{ w.category }}</text>
                    <text class="wp ellipsis flex1">{{ w.prizeName }}</text>
                    <text class="wn">{{ w.nickname }}</text>
                </view>
            </view>
            <view class="safe-bottom" :style="{ height: (110 + safeBottom) + 'px' }"></view>
        </view>

        <view class="cta" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <view v-if="raffle.drawn" class="go off"><text class="gt">抽奖已结束</text></view>
            <view v-else-if="raffle.joined" class="go done"><text class="gt">✓ 已参与 · 等待开奖</text></view>
            <view v-else class="go" @tap="join"><text class="gt">立即参与抽奖</text></view>
        </view>
    </view>
</template>

<script>
import { getPublicRaffle, joinPublicRaffle } from '@/api/publicRaffle.js'
import { statusBarHeight, fmtTime } from '@/common/util.js'
import { isLoggedIn } from '@/store/user.js'
import { requestSubscribe } from '@/common/subscribe.js'
import RaffleBoard from '@/components/raffle-board/raffle-board.vue'

export default {
    components: { RaffleBoard },
    data() { return { statusBar: 20, safeBottom: 0, id: null, raffle: null, joining: false } },
    computed: {
        drawAtText() {
            const r = this.raffle
            if (!r || !r.drawAt) return '待定'
            const t = fmtTime(r.drawAt)
            return t.md ? (t.md + ' ' + t.time) : ''
        },
        statusText() {
            const r = this.raffle
            if (!r) return ''
            return r.drawn ? '已开奖' : (r.joined ? '已参与' : '进行中')
        },
        note() {
            const r = this.raffle
            if (!r) return ''
            if (!r.drawn) return `${this.drawAtText} 开奖 · 共 ${r.entrantCount} 人参与` + (r.joined ? ' · 你已参与本次抽奖' : ' · 点击下方按钮即可参与')
            const base = `已于 ${this.drawAtText} 开奖 · 共 ${r.entrantCount} 人参与`
            return (!r.myPrize && r.joined) ? (base + ' · 很遗憾未中奖，下次继续') : base
        }
    },
    onLoad(q) {
        this.statusBar = statusBarHeight()
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.id = q.id
    },
    onShow() { if (this.id) this.load() },
    methods: {
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/home/home' }) },
        async load() { try { this.raffle = await getPublicRaffle(this.id) } catch (e) {} },
        async join() {
            if (!isLoggedIn()) { uni.navigateTo({ url: '/pages/login/login' }); return }
            if (this.joining) return
            this.joining = true
            try {
                this.raffle = await joinPublicRaffle(this.id)
                requestSubscribe(['lottery']) // B1：参与抽奖 → 引导订阅开奖通知
                uni.showToast({ title: '已参与抽奖，等待开奖', icon: 'success' })
            } catch (e) {} finally { this.joining = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.pr { min-height: 100vh; background: $paper; }
.head { padding: 0 34rpx 34rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, #2a1436, #4a1d57 55%, #7a2e86); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 24%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 18%, #ffd7f5, transparent), radial-gradient(3rpx 3rpx at 54% 12%, #fff, transparent); }
.nav { position: relative; margin-bottom: 14rpx; }
.nbtn { width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.18); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.ttl { position: relative; display: block; font-size: 40rpx; font-weight: 800; margin-top: 12rpx; line-height: 1.25; }
.desc { position: relative; display: block; font-size: 22rpx; opacity: .85; margin-top: 12rpx; line-height: 1.6; }
.metaline { position: relative; display: flex; gap: 22rpx; margin-top: 18rpx; }
.ml { font-size: 21rpx; font-weight: 600; opacity: .9; }

.body { padding: 22rpx 28rpx 0; }
.winbox { margin-top: 20rpx; background: $card; border-radius: 24rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.wt { display: block; font-size: 27rpx; font-weight: 800; margin-bottom: 8rpx; }
.wrow { display: flex; align-items: center; gap: 14rpx; padding: 16rpx 0; border-top: 1rpx solid $hair; font-size: 23rpx; }
.wc { font-size: 19rpx; font-weight: 800; color: #b5750c; background: #fbf1e4; padding: 5rpx 12rpx; border-radius: 10rpx; flex: none; }
.wp { font-weight: 700; min-width: 0; }
.wn { color: $ink-2; font-weight: 700; flex: none; }

.cta { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; padding: 18rpx 30rpx 0; background: $card; border-top: 1rpx solid $hair; box-shadow: 0 -8rpx 24rpx -10rpx rgba(9,20,15,.16); }
.go { height: 96rpx; border-radius: 30rpx; background: linear-gradient(120deg, #b5379e, #7a2e86); color: #fff; display: flex; align-items: center; justify-content: center; }
.go .gt { font-weight: 800; font-size: 30rpx; }
.go.done { background: $green-soft; color: $green-deep; box-shadow: inset 0 0 0 2rpx rgba(11,169,104,.35); }
.go.off { background: #d7ddda; color: #8a968f; }
</style>
