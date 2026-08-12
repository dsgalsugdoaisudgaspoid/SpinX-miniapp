<template>
    <view class="pol">
        <view class="banner">
            <text class="bi">🛡</text>
            <view class="bt"><text class="bt1">骑行意外险</text><text class="bt2">俱乐部为每场活动的参加者赠送骑行意外险，报名后自动生效。保险为补充保障，不替代自身安全注意义务。</text></view>
        </view>

        <view class="list">
            <view v-for="p in items" :key="p.policyId" class="card">
                <view class="top">
                    <text class="plan">{{ p.plan }}</text>
                    <text :class="['st', p.status]">{{ statusText(p.status) }}</text>
                </view>
                <view class="no"><text class="nl">保单号</text><text class="nv mono">{{ p.policyNo }}</text></view>
                <view class="rows">
                    <view class="r"><text class="rk">关联活动</text><text class="rv ellipsis flex1">{{ p.activityTitle || '—' }}</text></view>
                    <view class="r"><text class="rk">被保险人</text><text class="rv">{{ p.insuredName }}</text></view>
                    <view class="r"><text class="rk">意外身故/伤残</text><text class="rv mono">¥{{ fmtMoney(p.coverage) }}</text></view>
                    <view class="r"><text class="rk">意外医疗</text><text class="rv mono">¥{{ fmtMoney(p.medicalCoverage) }}</text></view>
                    <view class="r"><text class="rk">保障期间</text><text class="rv">{{ fmtDate(p.effectiveAt) }} ~ {{ fmtDate(p.expireAt) }}</text></view>
                    <view class="r"><text class="rk">承保</text><text class="rv">{{ p.provider }}</text></view>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">
                <text class="ee">🛡</text><text>暂无保单，报名活动后将自动生成</text>
            </view>
        </view>

        <view class="claim" @tap="goClaim"><text class="ci">🧾</text><text class="ct">理赔指引</text><text class="carw">›</text></view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { myPolicies } from '@/api/insurance.js'
import { fmtTime } from '@/common/util.js'

export default {
    data() { return { items: [], loading: false } },
    onShow() { this.load() },
    methods: {
        statusText(s) { return ({ active: '保障中', expired: '已到期', pending: '待生效', cancelled: '已失效' })[s] || s },
        fmtMoney(n) { return (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') },
        fmtDate(iso) { const t = fmtTime(iso); return t.md ? (t.md + ' ' + t.time) : '—' },
        async load() {
            this.loading = true
            try { const d = await myPolicies(); this.items = (d && d.list) || [] } catch (e) { this.items = [] } finally { this.loading = false }
        },
        goClaim() { uni.navigateTo({ url: '/pages/insurance/claim' }) }
    }
}
</script>

<style lang="scss" scoped>
.pol { min-height: 100vh; background: $paper; padding-bottom: 40rpx; }
.banner { display: flex; gap: 18rpx; margin: 20rpx 24rpx; background: $green-soft; border-radius: 24rpx; padding: 24rpx; }
.bi { font-size: 40rpx; flex: none; }
.bt1 { display: block; font-size: 27rpx; font-weight: 800; color: $green-deep; }
.bt2 { display: block; font-size: 21rpx; color: $ink-2; line-height: 1.6; margin-top: 8rpx; }
.list { padding: 0 24rpx; }
.card { background: $card; border-radius: 26rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 18rpx; }
.top { display: flex; align-items: center; }
.plan { font-size: 28rpx; font-weight: 800; }
.st { margin-left: auto; font-size: 20rpx; font-weight: 800; padding: 6rpx 16rpx; border-radius: 12rpx; }
.st.active { color: $green-deep; background: $green-soft; }
.st.expired, .st.cancelled { color: $muted; background: $paper; }
.st.pending { color: #b5750c; background: #fbf1e4; }
.no { display: flex; align-items: baseline; gap: 12rpx; margin-top: 14rpx; padding-bottom: 16rpx; border-bottom: 1rpx solid $hair; }
.nl { font-size: 21rpx; color: $muted; }
.nv { font-size: 27rpx; font-weight: 800; letter-spacing: 1rpx; }
.rows { margin-top: 14rpx; display: flex; flex-direction: column; gap: 12rpx; }
.r { display: flex; align-items: center; gap: 14rpx; }
.rk { font-size: 22rpx; color: $muted; flex: none; width: 170rpx; }
.rv { font-size: 24rpx; font-weight: 600; color: $ink-2; min-width: 0; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 120rpx 0; display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.ee { font-size: 70rpx; }
.claim { display: flex; align-items: center; gap: 16rpx; margin: 20rpx 24rpx 0; background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.ci { font-size: 34rpx; } .ct { flex: 1; font-size: 27rpx; font-weight: 700; } .carw { color: $faint; font-size: 32rpx; }
.safe-bottom { height: 40rpx; }
</style>
