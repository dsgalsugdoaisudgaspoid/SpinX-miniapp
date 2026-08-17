<template>
    <view class="mall">
        <view class="balbar">
            <text class="bl">我的可用积分</text>
            <text class="bn mono">{{ balance }}</text>
            <text class="brec" @tap="goRecords">兑换记录 ›</text>
        </view>

        <scroll-view scroll-x class="cats" show-scrollbar="false">
            <text v-for="c in cats" :key="c.key" :class="['cat', category === c.key ? 'on' : '']" @tap="switchCat(c.key)">{{ c.name }}</text>
        </scroll-view>

        <view class="grid">
            <view v-for="(g, i) in items" :key="g.itemId" class="goods" @tap="goDetail(g.itemId)">
                <view :class="['gimg', 'g' + (i % 3 + 1)]">{{ emojiFor(g) }}</view>
                <text class="gn ellipsis-2">{{ g.name }}</text>
                <view class="grow">
                    <text class="gp mono">{{ g.pointsRequired }}<text class="unit">分</text></text>
                    <text class="gs">{{ g.stock != null ? '剩' + g.stock : '不限' }}</text>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">该分类暂无商品</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getExchangeItems, getSummary } from '@/api/points.js'
import { thousands } from '@/common/util.js'

export default {
    data() {
        return {
            cats: [{ key: '', name: '全部' }, { key: 'merchandise', name: '俱乐部周边' }, { key: 'activity_priority', name: '优先报名' }, { key: 'insurance', name: '保险补贴' }, { key: 'bike_tool', name: '骑行工具' }],
            category: '', items: [], summary: {}, loading: false
        }
    },
    computed: { balance() { return thousands(this.summary.totalPoints || 0) } },
    onShow() { this.load() },
    methods: {
        emojiFor(g) {
            const c = g.category || ''
            if (c === 'activity_priority') return '🎟'
            if (c === 'insurance') return '🛡'
            if (c === 'bike_tool') return '🔧'
            if ((g.name || '').indexOf('水壶') > -1) return '🍶'
            if ((g.name || '').indexOf('头巾') > -1) return '🧣'
            if ((g.name || '').indexOf('队服') > -1) return '👕'
            return '🎁'
        },
        async load() {
            try { this.summary = await getSummary() } catch (e) {}
            this.loading = true
            try { this.items = (await getExchangeItems(this.category || undefined)) || [] } catch (e) { this.items = [] } finally { this.loading = false }
        },
        switchCat(k) { if (this.category === k) return; this.category = k; this.load() },
        goDetail(id) { uni.navigateTo({ url: '/pages/exchange/detail?id=' + id }) },
        goRecords() { uni.navigateTo({ url: '/pages/exchange/records' }) }
    }
}
</script>

<style lang="scss" scoped>
.mall { min-height: 100vh; background: $paper; }
.balbar { display: flex; align-items: center; gap: 16rpx; margin: 20rpx 24rpx; background: linear-gradient(150deg, #0e1b24, #123a2a 60%, #0ba968); border-radius: 26rpx; padding: 28rpx 30rpx; color: #fff; }
.bl { font-size: 24rpx; opacity: .85; }
.bn { font-weight: 800; font-size: 48rpx; letter-spacing: -1rpx; }
.brec { margin-left: auto; font-size: 22rpx; background: rgba(255,255,255,.18); padding: 8rpx 18rpx; border-radius: 16rpx; }
.cats { white-space: nowrap; padding: 0 24rpx 8rpx; }
.cat { display: inline-block; height: 58rpx; line-height: 58rpx; padding: 0 24rpx; border-radius: 18rpx; margin-right: 14rpx; background: $card; font-size: 24rpx; color: $ink-2; font-weight: 600; box-shadow: inset 0 0 0 1rpx $line; }
.cat.on { background: $green; color: #04140c; font-weight: 800; box-shadow: none; }
.grid { display: flex; flex-wrap: wrap; gap: 18rpx; padding: 16rpx 24rpx 40rpx; }
.goods { width: calc(50% - 9rpx); box-sizing: border-box; background: $card; border-radius: 26rpx; padding: 20rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.gimg { height: 200rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; font-size: 90rpx; margin-bottom: 16rpx; }
.g1 { background: linear-gradient(140deg, #e9f1fb, #d6e6fb); } .g2 { background: linear-gradient(140deg, #fbf1e4, #f7e3c8); } .g3 { background: linear-gradient(140deg, #e6f9f0, #c9f2df); }
.gn { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 26rpx; font-weight: 700; line-height: 1.3; min-height: 68rpx; }
.grow { display: flex; align-items: baseline; margin-top: 10rpx; }
.gp { font-weight: 800; color: $green-deep; font-size: 34rpx; }
.gp .unit { font-size: 20rpx; margin-left: 2rpx; }
.gs { margin-left: auto; font-size: 20rpx; color: $muted; }
.empty { width: 100%; text-align: center; color: $faint; font-size: 23rpx; padding: 80rpx 0; }
.safe-bottom { height: 40rpx; }
.ellipsis-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
</style>
