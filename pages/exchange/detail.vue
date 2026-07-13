<template>
    <view class="gd" v-if="item">
        <view class="hero" :class="'g' + heroTone">{{ emoji }}</view>

        <view class="body">
            <text class="name">{{ item.name }}</text>
            <view class="pricerow">
                <text class="price mono">{{ item.pointsRequired }}<text class="u">积分</text></text>
                <text class="stock">{{ item.stock != null ? '库存 ' + item.stock : '不限量' }}</text>
            </view>
            <text class="desc">{{ item.description || '暂无描述' }}</text>

            <view class="info">
                <view class="ir"><text class="ik">兑换方式</text><text class="iv">线下自提 · 门店核销</text></view>
                <view class="ir"><text class="ik">自提点</text><text class="iv">{{ item.pickupLocation || 'Spin X 环星门店' }}</text></view>
                <view class="ir" v-if="item.category === 'activity_priority'"><text class="ik">有效期</text><text class="iv">兑换后 7 日内有效，过期返还积分</text></view>
                <view class="ir noline"><text class="ik">温馨提示</text><text class="iv">线上仅完成积分扣减，实物 / 权益线下核销</text></view>
            </view>
        </view>

        <view class="footer" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <view class="mybal"><text>我的积分</text><text class="mv mono">{{ balance }}</text></view>
            <view :class="['g-btn', canExchange ? '' : 'off']" @tap="doExchange">{{ btnText }}</view>
        </view>
    </view>
</template>

<script>
import { getExchangeItem, exchange, getSummary } from '@/api/points.js'
import { thousands } from '@/common/util.js'

export default {
    data() { return { id: null, item: null, summary: {}, safeBottom: 0 } },
    computed: {
        balance() { return thousands(this.summary.totalPoints || 0) },
        heroTone() { return ((this.item && this.item.itemId) || 1) % 3 + 1 },
        emoji() {
            if (!this.item) return '🎁'
            const c = this.item.category, n = this.item.name || ''
            if (c === 'activity_priority') return '🎟'
            if (c === 'insurance') return '🛡'
            if (c === 'bike_tool') return '🔧'
            if (n.indexOf('水壶') > -1) return '🍶'
            if (n.indexOf('头巾') > -1) return '🧣'
            return '🎁'
        },
        canExchange() {
            if (!this.item) return false
            if (!this.item.isAvailable) return false
            if (this.item.stock != null && this.item.stock <= 0) return false
            return (this.summary.totalPoints || 0) >= this.item.pointsRequired
        },
        btnText() {
            if (!this.item) return ''
            if (!this.item.isAvailable || (this.item.stock != null && this.item.stock <= 0)) return '已下架 / 无库存'
            if ((this.summary.totalPoints || 0) < this.item.pointsRequired) return '积分不足'
            return '立即兑换'
        }
    },
    onLoad(q) {
        this.id = q.id
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.load()
    },
    methods: {
        async load() {
            try { this.item = await getExchangeItem(this.id) } catch (e) {}
            try { this.summary = await getSummary() } catch (e) {}
        },
        doExchange() {
            if (!this.canExchange) return
            uni.showModal({
                title: '确认兑换', content: `使用 ${this.item.pointsRequired} 积分兑换「${this.item.name}」？`, confirmColor: '#0ba968',
                success: async (r) => {
                    if (!r.confirm) return
                    try {
                        const res = await exchange({ itemId: this.item.itemId, quantity: 1, pickupMethod: 'pickup' })
                        uni.showModal({ title: '兑换成功', content: '核销码：' + (res.verifyCode || '—') + '\n可在「兑换记录」查看，到门店出示核销', showCancel: false, confirmColor: '#0ba968',
                            success: () => this.load() })
                    } catch (e) {}
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.gd { min-height: 100vh; background: $paper; padding-bottom: 180rpx; }
.hero { height: 460rpx; display: flex; align-items: center; justify-content: center; font-size: 200rpx; }
.hero.g1 { background: linear-gradient(150deg, #e9f1fb, #d6e6fb); } .hero.g2 { background: linear-gradient(150deg, #fbf1e4, #f7e3c8); } .hero.g3 { background: linear-gradient(150deg, #e6f9f0, #c9f2df); }
.body { margin-top: -34rpx; background: $card; border-radius: 36rpx 36rpx 0 0; padding: 34rpx 30rpx 0; }
.name { font-size: 38rpx; font-weight: 800; }
.pricerow { display: flex; align-items: baseline; gap: 16rpx; margin-top: 18rpx; }
.price { font-weight: 800; color: $green-deep; font-size: 52rpx; }
.price .u { font-size: 24rpx; margin-left: 4rpx; }
.stock { margin-left: auto; font-size: 23rpx; color: $muted; }
.desc { display: block; margin-top: 20rpx; font-size: 25rpx; color: $ink-2; line-height: 1.7; }
.info { margin-top: 26rpx; background: $paper; border-radius: 22rpx; padding: 8rpx 24rpx; }
.ir { display: flex; gap: 24rpx; padding: 22rpx 0; border-bottom: 1rpx solid $line; }
.ir.noline { border-bottom: 0; }
.ik { width: 130rpx; flex: none; color: $muted; font-size: 24rpx; font-weight: 700; }
.iv { flex: 1; font-size: 24rpx; color: $ink; }
.footer { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 22rpx; padding: 18rpx 30rpx 0; background: $card; border-top: 1rpx solid $hair; }
.mybal { display: flex; flex-direction: column; }
.mybal text:first-child { font-size: 19rpx; color: $muted; }
.mv { font-weight: 800; font-size: 32rpx; color: $green-deep; }
.g-btn { flex: 1; }
.g-btn.off { background: #d7ddda; color: #8a968f; }
</style>
