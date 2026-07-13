<template>
    <view class="points">
        <!-- 夜色顶部 -->
        <view class="ptop" :style="{ paddingTop: (statusBar + 8) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><text class="back" @tap="back">‹</text><text class="nt">我的积分</text></view>
            <text class="lv">MY POINTS · {{ summary.levelName || '入门骑行者' }}</text>
            <view class="bal">
                <text class="bnum mono">{{ balance }}</text><text class="bl">可用积分</text>
                <text v-if="summary.frozenStatus" class="frozen">❄ 兑换已冻结</text>
            </view>
            <view class="lvbar" v-if="summary.nextLevel">
                <view class="lline"><view class="lfill" :style="{ width: (summary.progressPercent||0) + '%' }"></view></view>
                <view class="lmeta">
                    <text>{{ summary.levelName }}</text>
                    <text>距 <text class="b">{{ summary.nextLevelName }}</text> 还需 <text class="b mono">{{ summary.pointsToNextLevel }}</text> 分</text>
                </view>
            </view>
            <view class="earn2">
                <text>本月获得 <text class="mono eplus">+{{ summary.monthEarned || 0 }}</text></text>
                <text>本月消耗 <text class="mono">-{{ summary.monthSpent || 0 }}</text></text>
            </view>
        </view>

        <!-- 等级阶梯 -->
        <view class="ladder">
            <view v-for="(lv, i) in levels" :key="lv.level" :class="['rung', rungState(i)]">
                <view class="line" v-if="i>0"></view>
                <view class="d"></view>
                <text class="nm">{{ shortName(lv.name) }}</text>
                <text class="pt mono">{{ lv.minPoints }}</text>
            </view>
        </view>

        <!-- 本月任务 -->
        <view class="sec-h"><text class="b">本月任务</text></view>
        <view class="mlist">
            <view v-for="m in missions" :key="m.id" class="mission">
                <view class="mi">{{ m.title.indexOf('分享') > -1 ? '↗' : '🚴' }}</view>
                <view class="mtxt">
                    <text class="mn">{{ m.title }}</text>
                    <view class="mb"><view class="mf" :style="{ width: pct(m.progress, m.target) + '%' }"></view></view>
                </view>
                <text class="rew mono">+{{ m.bonusPoints }}</text>
            </view>
            <view v-if="missions.length === 0" class="mempty">本月暂无任务</view>
        </view>

        <!-- 兑换商城 -->
        <view class="sec-h"><text class="b">积分兑换</text><text class="more" @tap="goMall">商城 ›</text></view>
        <view class="shop">
            <view v-for="(g, i) in items" :key="g.itemId" class="goods" @tap="doExchange(g)">
                <view :class="['gimg', 'g' + (i % 3 + 1)]">{{ emojiFor(g) }}</view>
                <text class="gn ellipsis-2">{{ g.name }}</text>
                <text class="gp mono">{{ g.pointsRequired }}</text>
                <text class="gs">{{ g.stock != null ? '库存 ' + g.stock : '不限量' }}</text>
            </view>
        </view>

        <!-- 积分明细 -->
        <view class="sec-h"><text class="b">积分明细</text><text class="more" @tap="goRecords">全部 ›</text></view>
        <view class="recs">
            <view v-for="(r, i) in records" :key="i" class="rec">
                <view class="ri">{{ r.type === 'earn' ? '＋' : '－' }}</view>
                <view class="rn">
                    <text class="rt ellipsis">{{ r.title }}</text>
                    <text class="rc mono">{{ r.category }} · {{ shortDate(r.createdAt) }}</text>
                </view>
                <text :class="['rv', 'mono', r.points >= 0 ? 'up' : 'dn']">{{ r.points >= 0 ? '+' : '' }}{{ r.points }}</text>
            </view>
            <view v-if="records.length === 0" class="mempty">暂无积分记录</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getSummary, getLevels, getMonthlyMissions, getExchangeItems, getRecords, exchange } from '@/api/points.js'
import { statusBarHeight, thousands } from '@/common/util.js'

export default {
    data() {
        return { statusBar: 20, summary: {}, levels: [], missions: [], items: [], records: [] }
    },
    computed: {
        balance() { return thousands(this.summary.totalPoints || 0) }
    },
    onLoad() { this.statusBar = statusBarHeight() },
    onShow() { this.loadAll() },
    methods: {
        goMall() { uni.navigateTo({ url: '/pages/exchange/mall' }) },
        goRecords() { uni.navigateTo({ url: '/pages/points/records' }) },
        pct(p, t) { return Math.min(100, Math.round(((p || 0) / (t || 1)) * 100)) },
        shortName(n) { return (n || '').replace('会员', '').replace('骑行者', '') },
        shortDate(iso) { if (!iso) return ''; const s = iso.replace('T', ' '); return s.slice(5, 10) },
        emojiFor(g) {
            const c = g.category || ''
            if (c === 'activity_priority') return '🎟'
            if (c === 'insurance') return '🛡'
            if (c === 'bike_tool') return '🔧'
            if ((g.name || '').indexOf('水壶') > -1) return '🍶'
            if ((g.name || '').indexOf('头巾') > -1) return '🧣'
            return '🎁'
        },
        rungState(i) {
            const cur = this.summary.currentLevel
            const idx = this.levels.findIndex(l => l.level === cur)
            if (i < idx) return 'done'
            if (i === idx) return 'cur'
            return ''
        },
        async loadAll() {
            try { this.summary = await getSummary() } catch (e) {}
            try { const d = await getLevels(); this.levels = (d && d.levels) || [] } catch (e) {}
            try { const d = await getMonthlyMissions(); this.missions = (d && d.missions) || [] } catch (e) {}
            try { this.items = (await getExchangeItems()) || [] } catch (e) {}
            try { const d = await getRecords({ pageSize: 6, page: 1 }); this.records = (d && d.list) || [] } catch (e) {}
        },
        doExchange(g) {
            if ((this.summary.totalPoints || 0) < g.pointsRequired) { uni.showToast({ title: '积分不足', icon: 'none' }); return }
            uni.showModal({
                title: '确认兑换',
                content: `使用 ${g.pointsRequired} 积分兑换「${g.name}」？兑换后线下自提核销。`,
                confirmColor: '#0ba968',
                success: async (r) => {
                    if (!r.confirm) return
                    try {
                        const res = await exchange({ itemId: g.itemId, quantity: 1, pickupMethod: 'pickup' })
                        uni.showModal({ title: '兑换成功', content: '核销码：' + (res.verifyCode || '—') + '\n请到门店出示核销', showCancel: false, confirmColor: '#0ba968' })
                        this.loadAll()
                    } catch (e) {}
                }
            })
        },
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/profile/profile' }) }
    }
}
</script>

<style lang="scss" scoped>
.points { min-height: 100vh; background: $paper; }
.ptop { padding: 0 36rpx 32rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(150deg, #0e1b24, #123a2a 55%, #0ba968); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 20%, #fff, transparent), radial-gradient(2rpx 2rpx at 76% 30%, #cfeee0, transparent), radial-gradient(2rpx 2rpx at 60% 12%, #fff, transparent); }
.nav { position: relative; display: flex; align-items: center; height: 72rpx; }
.nav .back { font-size: 46rpx; width: 60rpx; }
.nav .nt { font-size: 32rpx; font-weight: 700; }
.lv { position: relative; font-size: 21rpx; letter-spacing: 2rpx; opacity: .88; margin-top: 6rpx; }
.bal { position: relative; display: flex; align-items: flex-end; gap: 16rpx; margin-top: 12rpx; }
.bnum { font-weight: 800; font-size: 86rpx; letter-spacing: -3rpx; line-height: .9; }
.bl { font-size: 24rpx; opacity: .85; padding-bottom: 10rpx; }
.frozen { font-size: 20rpx; background: rgba(255,255,255,.2); padding: 4rpx 12rpx; border-radius: 10rpx; margin-bottom: 10rpx; }
.lvbar { position: relative; margin-top: 30rpx; }
.lline { height: 16rpx; border-radius: 10rpx; background: rgba(255,255,255,.2); overflow: hidden; }
.lfill { height: 100%; background: #fff; border-radius: 10rpx; }
.lmeta { display: flex; justify-content: space-between; margin-top: 14rpx; font-size: 22rpx; opacity: .95; }
.lmeta .b { font-weight: 800; }
.earn2 { position: relative; display: flex; gap: 40rpx; margin-top: 22rpx; font-size: 22rpx; opacity: .92; }
.earn2 .eplus { color: #d6ffe9; font-weight: 800; }

.ladder { display: flex; justify-content: space-between; margin: 28rpx 28rpx 0; background: $card; border-radius: 26rpx; padding: 30rpx 24rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.rung { flex: 1; text-align: center; position: relative; }
.rung .line { position: absolute; top: 10rpx; left: -50%; width: 100%; height: 4rpx; background: $line; }
.rung.done .line, .rung.cur .line { background: $green; }
.rung .d { width: 24rpx; height: 24rpx; border-radius: 50%; background: $line; margin: 0 auto 14rpx; position: relative; z-index: 1; }
.rung.done .d { background: $green; } .rung.cur .d { background: $green; box-shadow: 0 0 0 8rpx $green-soft; }
.rung .nm { display: block; font-size: 22rpx; font-weight: 700; }
.rung.cur .nm { color: $green-deep; }
.rung .pt { display: block; font-size: 19rpx; color: $muted; }

.sec-h { display: flex; align-items: baseline; justify-content: space-between; margin: 34rpx 30rpx 18rpx; }
.sec-h .b { font-size: 32rpx; font-weight: 800; }
.sec-h .more { font-size: 22rpx; color: $muted; }

.mlist { margin: 0 28rpx; display: flex; flex-direction: column; gap: 16rpx; }
.mission { display: flex; align-items: center; gap: 20rpx; background: $card; border-radius: 24rpx; padding: 22rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.mi { width: 68rpx; height: 68rpx; border-radius: 20rpx; background: $green-soft; display: flex; align-items: center; justify-content: center; font-size: 34rpx; }
.mtxt { flex: 1; }
.mn { display: block; font-size: 25rpx; font-weight: 800; }
.mb { height: 12rpx; border-radius: 8rpx; background: $hair; margin-top: 14rpx; overflow: hidden; }
.mf { height: 100%; background: $green; }
.rew { font-weight: 800; color: $green-deep; font-size: 28rpx; }
.mempty { text-align: center; color: $faint; font-size: 23rpx; padding: 40rpx 0; }

.shop { display: flex; gap: 16rpx; margin: 0 28rpx; }
.goods { flex: 1; background: $card; border-radius: 24rpx; padding: 18rpx; box-shadow: inset 0 0 0 1rpx $hair; text-align: center; }
.gimg { height: 112rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; font-size: 50rpx; margin-bottom: 14rpx; }
.g1 { background: linear-gradient(140deg, #e9f1fb, #d6e6fb); } .g2 { background: linear-gradient(140deg, #fbf1e4, #f7e3c8); } .g3 { background: linear-gradient(140deg, #e6f9f0, #c9f2df); }
.gn { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 22rpx; font-weight: 700; line-height: 1.3; min-height: 58rpx; }
.gp { display: block; font-weight: 800; color: $green-deep; font-size: 26rpx; margin-top: 8rpx; }
.gs { display: block; font-size: 18rpx; color: $muted; margin-top: 4rpx; }

.recs { margin: 0 30rpx; background: $card; border-radius: 24rpx; padding: 6rpx 24rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.rec { display: flex; align-items: center; gap: 18rpx; padding: 22rpx 0; border-bottom: 1rpx solid $hair; }
.rec:last-child { border-bottom: 0; }
.ri { width: 56rpx; height: 56rpx; border-radius: 16rpx; background: $paper; display: flex; align-items: center; justify-content: center; font-size: 30rpx; color: $ink-2; }
.rn { flex: 1; min-width: 0; }
.rt { display: block; font-size: 25rpx; font-weight: 700; }
.rc { display: block; font-size: 19rpx; color: $muted; margin-top: 4rpx; }
.rv { font-weight: 800; font-size: 28rpx; }
.rv.up { color: $green-deep; } .rv.dn { color: $muted; }
.safe-bottom { height: 60rpx; }
.ellipsis-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
</style>
