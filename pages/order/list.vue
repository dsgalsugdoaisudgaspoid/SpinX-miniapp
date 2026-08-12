<template>
    <view class="ord">
        <view class="items">
            <view v-for="o in items" :key="o.orderId" class="card">
                <view class="top">
                    <text class="tt ellipsis flex1">{{ o.activityTitle || '活动报名' }}</text>
                    <text :class="['st', o.status]">{{ statusText(o.status) }}</text>
                </view>
                <view class="no"><text class="nl">订单号</text><text class="nv mono">{{ o.orderNo }}</text></view>
                <view class="rows">
                    <view class="r"><text class="rk">金额</text><text class="rv amt">¥{{ o.amount }}</text></view>
                    <view class="r"><text class="rk">下单时间</text><text class="rv">{{ fmtDate(o.createdAt) }}</text></view>
                    <view class="r" v-if="o.paidAt"><text class="rk">支付时间</text><text class="rv">{{ fmtDate(o.paidAt) }}</text></view>
                    <view class="r" v-if="o.refundedAt"><text class="rk">退款时间</text><text class="rv">{{ fmtDate(o.refundedAt) }}</text></view>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">
                <text class="ee">🧾</text><text>暂无订单</text>
            </view>
        </view>
        <text class="foot">收据凭证以微信支付账单为准 · 发票开具请联系俱乐部</text>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { myOrders } from '@/api/order.js'
import { fmtTime } from '@/common/util.js'

export default {
    data() { return { items: [], loading: false } },
    onShow() { this.load() },
    methods: {
        statusText(s) { return ({ unpaid: '待支付', paid: '已支付', refunded: '已退款' })[s] || s },
        fmtDate(iso) { const t = fmtTime(iso); return t.md ? (t.md + ' ' + t.time) : '—' },
        async load() {
            this.loading = true
            try { const d = await myOrders(); this.items = (d && d.list) || [] } catch (e) { this.items = [] } finally { this.loading = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.ord { min-height: 100vh; background: $paper; padding-top: 20rpx; }
.items { padding: 0 24rpx; }
.card { background: $card; border-radius: 26rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 18rpx; }
.top { display: flex; align-items: center; gap: 12rpx; }
.tt { font-size: 28rpx; font-weight: 800; min-width: 0; }
.st { flex: none; font-size: 20rpx; font-weight: 800; padding: 6rpx 16rpx; border-radius: 12rpx; }
.st.paid { color: $green-deep; background: $green-soft; }
.st.unpaid { color: #b5750c; background: #fbf1e4; }
.st.refunded { color: $muted; background: $paper; }
.no { display: flex; align-items: baseline; gap: 12rpx; margin-top: 14rpx; padding-bottom: 14rpx; border-bottom: 1rpx solid $hair; }
.nl { font-size: 21rpx; color: $muted; }
.nv { font-size: 24rpx; font-weight: 700; letter-spacing: 1rpx; }
.rows { margin-top: 12rpx; display: flex; flex-direction: column; gap: 10rpx; }
.r { display: flex; align-items: center; gap: 14rpx; }
.rk { font-size: 22rpx; color: $muted; flex: none; width: 150rpx; }
.rv { font-size: 24rpx; font-weight: 600; color: $ink-2; }
.rv.amt { font-size: 30rpx; font-weight: 800; color: $ink; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 120rpx 0; display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.ee { font-size: 70rpx; }
.foot { display: block; text-align: center; font-size: 20rpx; color: $faint; margin: 24rpx 40rpx 0; line-height: 1.6; }
.safe-bottom { height: 60rpx; }
</style>
