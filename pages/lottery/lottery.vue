<template>
    <view class="lot">
        <view class="lhead" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <text class="eye">LUCKY DRAW · 幸运抽奖</text>
            <text class="lt">积分换好礼</text>
            <view class="ptbar">
                <text class="pt">我的积分 <text class="mono ptv">{{ info.myPoints }}</text></text>
                <text class="ch">可抽 {{ info.myChances }} 次 · {{ info.cost }} 积分/次</text>
            </view>
        </view>

        <!-- 九宫格转盘 -->
        <view class="wheel">
            <view v-for="(c, i) in cells" :key="i" :class="['cell', c.center ? 'ctr' : '', (!c.center && c.outerIndex === activeIndex) ? 'hot' : '']"
                :data-center="c.center ? '1' : '0'" @tap="onCell">
                <block v-if="c.center">
                    <text class="drawbtn">{{ spinning ? '开奖中' : '抽一次' }}</text>
                    <text class="drawsub">-{{ info.cost }} 积分</text>
                </block>
                <block v-else-if="c.prize">
                    <text class="pico">{{ c.prize.icon }}</text>
                    <text class="pname ellipsis">{{ c.prize.name }}</text>
                </block>
            </view>
        </view>

        <!-- 近期中奖 -->
        <view class="winbox" v-if="info.recentWinners && info.recentWinners.length">
            <text class="wt">🎊 近期中奖</text>
            <view v-for="(w, i) in info.recentWinners" :key="i" class="wrow">
                <text class="wn">{{ spx(w.nickname) }}</text>
                <text class="wg ellipsis flex1">抽中 {{ w.prizeName }}</text>
            </view>
        </view>
        <text class="foot">奖品由 SpinX 环星俱乐部提供 · 实物奖品到店领取</text>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { lotteryInfo, lotteryDraw } from '@/api/lottery.js'
import { statusBarHeight, spxName } from '@/common/util.js'
import { isLoggedIn } from '@/store/user.js'

export default {
    data() {
        return { statusBar: 20, info: { cost: 100, myPoints: 0, myChances: 0, prizes: [], recentWinners: [] }, activeIndex: 0, spinning: false }
    },
    computed: {
        // 3×3 九宫格 DOM 顺序，中心为抽奖按钮，外圈 8 格按顺时针 outerIndex
        cells() {
            const order = [0, 1, 2, 7, 'c', 3, 6, 5, 4]
            return order.map(x => x === 'c' ? { center: true } : { center: false, outerIndex: x, prize: this.info.prizes[x] })
        }
    },
    onShow() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        spx(n) { return spxName(n) },
        onCell(e) { if (String(e.currentTarget.dataset.center) === '1') this.draw() },
        async load() { try { const d = await lotteryInfo(); if (d) this.info = d } catch (e) {} },
        async draw() {
            if (this.spinning) return
            if (!isLoggedIn()) { uni.navigateTo({ url: '/pages/login/login' }); return }
            if ((this.info.myChances || 0) < 1) { uni.showModal({ title: '积分不足', content: `抽一次需 ${this.info.cost} 积分，多参加活动攒积分吧`, showCancel: false, confirmText: '知道了' }); return }
            this.spinning = true
            try {
                const r = await lotteryDraw()
                const target = this.info.prizes.findIndex(p => p.prizeId === r.prize.prizeId)
                await this.spinTo(target < 0 ? 0 : target)
                this.info.myPoints = r.remainPoints
                this.info.myChances = r.remainChances
                this.showResult(r.prize)
                this.load()
            } catch (e) {} finally { this.spinning = false }
        },
        spinTo(target) {
            return new Promise(resolve => {
                const start = this.activeIndex < 0 ? 0 : this.activeIndex
                const totalSteps = 8 * 3 + ((target - start + 8) % 8)
                let step = 0
                const tick = () => {
                    this.activeIndex = (this.activeIndex + 1) % 8
                    step++
                    if (step >= totalSteps) { resolve(); return }
                    const remain = totalSteps - step
                    const interval = remain <= 8 ? 90 + (8 - remain) * 45 : 70
                    setTimeout(tick, interval)
                }
                setTimeout(tick, 70)
            })
        },
        showResult(prize) {
            const none = prize.type === 'none', retry = prize.type === 'retry'
            uni.showModal({
                title: none ? '谢谢参与' : (retry ? '🎫 再抽一次' : '🎉 恭喜中奖'),
                content: none ? '差一点点，再试试手气～' : (retry ? '本次积分已返还，可以再抽一次' : `获得「${prize.name}」，实物奖品到店领取`),
                showCancel: false, confirmText: '好的'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.lot { min-height: 100vh; background: $paper; }
.lhead { padding: 0 34rpx 44rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, #2a1436, #4a1d57 55%, #7a2e86); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 24%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 18%, #ffd7f5, transparent), radial-gradient(3rpx 3rpx at 54% 12%, #fff, transparent); }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.lt { position: relative; display: block; font-size: 44rpx; font-weight: 800; margin-top: 12rpx; }
.ptbar { position: relative; display: flex; align-items: baseline; gap: 18rpx; margin-top: 20rpx; flex-wrap: wrap; }
.pt { font-size: 24rpx; font-weight: 700; }
.ptv { font-size: 34rpx; font-weight: 800; color: #ffd36e; margin: 0 4rpx; }
.ch { font-size: 21rpx; opacity: .82; }

.wheel { display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 16rpx; gap: 16rpx; padding: 26rpx 28rpx 0; margin-top: -20rpx; position: relative; z-index: 2; }
.cell { height: 200rpx; background: $card; border-radius: 24rpx; box-shadow: inset 0 0 0 1rpx $hair;
    display: flex; flex-direction: column; align-items: center; justify-content: center; }
.cell .pico, .cell .pname, .cell .drawbtn, .cell .drawsub { margin: 4rpx 0; }
.cell.hot { box-shadow: inset 0 0 0 4rpx $green; background: $green-soft; transform: scale(1.02); }
.pico { font-size: 56rpx; }
.pname { font-size: 21rpx; font-weight: 700; color: $ink-2; max-width: 90%; text-align: center; }
.cell.ctr { background: linear-gradient(135deg, #7a2e86, #b5379e); box-shadow: 0 14rpx 30rpx -12rpx rgba(122,46,134,.7); }
.drawbtn { color: #fff; font-size: 34rpx; font-weight: 800; }
.drawsub { color: rgba(255,255,255,.85); font-size: 20rpx; }

.winbox { margin: 30rpx 28rpx 0; background: $card; border-radius: 24rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.wt { display: block; font-size: 25rpx; font-weight: 800; margin-bottom: 8rpx; }
.wrow { display: flex; align-items: center; gap: 12rpx; padding: 14rpx 0; border-top: 1rpx solid $hair; font-size: 23rpx; }
.wrow:first-of-type { border-top: 0; }
.wn { font-weight: 800; color: $ink; }
.wg { color: $muted; }
.foot { display: block; text-align: center; font-size: 20rpx; color: $faint; margin: 26rpx 40rpx 0; line-height: 1.6; }
.safe-bottom { height: 50rpx; }
</style>
