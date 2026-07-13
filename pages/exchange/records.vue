<template>
    <view class="er">
        <view class="list">
            <view v-for="r in items" :key="r.recordId" class="rec">
                <view class="top">
                    <text class="nm ellipsis flex1">{{ r.itemName }}</text>
                    <text class="st" :style="stStyle(r.status)">{{ stText(r.status) }}</text>
                </view>
                <view class="mid">
                    <text class="cost mono">-{{ r.pointsCost }} 积分</text>
                    <text class="qty">x{{ r.quantity }}</text>
                    <text class="time">{{ shortDate(r.createdAt) }}</text>
                </view>
                <view v-if="r.status === 'pending_pickup'" class="code">
                    <view class="cl">
                        <text class="ck">核销码</text>
                        <text class="cv mono">{{ r.verifyCode }}</text>
                    </view>
                    <text class="tip">{{ r.expireAt ? '有效期至 ' + shortDate(r.expireAt) : '到门店出示核销' }}</text>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">
                <text class="ee">🎁</text><text>还没有兑换记录</text>
                <view class="g-btn g-btn--plain go" @tap="goMall">去积分商城</view>
            </view>
            <view v-if="loading" class="tip2">加载中…</view>
        </view>
    </view>
</template>

<script>
import { myExchangeRecords } from '@/api/user.js'

export default {
    data() { return { items: [], loading: false } },
    onShow() { this.load() },
    methods: {
        shortDate(iso) { if (!iso) return ''; return iso.replace('T', ' ').slice(0, 16) },
        stText(s) { return { pending_pickup: '待核销', picked_up: '已核销', expired: '已过期', cancelled: '已取消' }[s] || s },
        stStyle(s) {
            if (s === 'pending_pickup') return 'color:#b8760a;background:#fdf1dd'
            if (s === 'picked_up') return 'color:#0ba968;background:#e6f9f0'
            return 'color:#7a8a83;background:#f0f3f2'
        },
        async load() {
            this.loading = true
            try { const d = await myExchangeRecords({ page: 1, pageSize: 30 }); this.items = (d && d.list) || [] } catch (e) {} finally { this.loading = false }
        },
        goMall() { uni.navigateTo({ url: '/pages/exchange/mall' }) }
    }
}
</script>

<style lang="scss" scoped>
.er { min-height: 100vh; background: $paper; }
.list { padding: 20rpx 24rpx 40rpx; }
.rec { background: $card; border-radius: 26rpx; padding: 26rpx; margin-bottom: 16rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.top { display: flex; align-items: center; gap: 14rpx; }
.nm { font-size: 28rpx; font-weight: 800; }
.st { font-size: 20rpx; font-weight: 800; padding: 6rpx 16rpx; border-radius: 14rpx; flex: none; }
.mid { display: flex; align-items: center; gap: 16rpx; margin-top: 12rpx; }
.cost { font-size: 24rpx; font-weight: 800; color: $ink-2; }
.qty { font-size: 22rpx; color: $muted; }
.time { margin-left: auto; font-size: 20rpx; color: $faint; }
.code { display: flex; align-items: center; margin-top: 18rpx; padding-top: 18rpx; border-top: 1rpx dashed $line; }
.cl { display: flex; flex-direction: column; }
.ck { font-size: 19rpx; color: $muted; }
.cv { font-size: 34rpx; font-weight: 800; letter-spacing: 2rpx; color: $green-deep; }
.tip { margin-left: auto; font-size: 20rpx; color: $muted; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 110rpx 0; display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.ee { font-size: 76rpx; }
.go { display: inline-flex; margin-top: 20rpx; padding: 0 40rpx; height: 76rpx; }
.tip2 { text-align: center; color: $faint; font-size: 23rpx; padding: 40rpx 0; }
</style>
