<template>
    <view class="recs-page">
        <view class="tabs">
            <text v-for="t in tabs" :key="t.key" :class="['tb', type === t.key ? 'on' : '']" @tap="switchType(t.key)">{{ t.name }}</text>
        </view>

        <view class="list">
            <view v-for="(r, i) in items" :key="i" class="rec">
                <view class="ri" :style="{ background: r.type === 'earn' ? '#e6f9f0' : '#f0f3f2', color: r.type === 'earn' ? '#0ba968' : '#7a8a83' }">{{ r.type === 'earn' ? '＋' : '－' }}</view>
                <view class="mid">
                    <text class="t ellipsis">{{ r.title }}</text>
                    <text class="c mono">{{ catLabel(r.category) }} · {{ shortDate(r.createdAt) }}</text>
                    <text v-if="r.description" class="d ellipsis">{{ r.description }}</text>
                </view>
                <view class="right">
                    <text :class="['v', 'mono', r.points >= 0 ? 'up' : 'dn']">{{ r.points >= 0 ? '+' : '' }}{{ r.points }}</text>
                    <text class="bal mono">余 {{ r.balanceAfter }}</text>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">暂无积分记录</view>
            <view v-if="loading" class="tip">加载中…</view>
            <view v-if="noMore && items.length > 0" class="tip">没有更多了</view>
        </view>
    </view>
</template>

<script>
import { getRecords } from '@/api/points.js'

const CAT = {
    activity: '活动积分', full_attendance: '全勤加分', contribution: '贡献加分', share: '社交传播',
    referral: '拉新奖励', content: '内容创作', monthly_task: '月度任务', holiday_bonus: '节假日加成',
    public_welfare: '公益骑行', admin_adjust: '管理调整', spent: '积分消耗', penalty: '违规扣除', cleared: '违规清零'
}

export default {
    data() {
        return {
            tabs: [{ key: 'all', name: '全部' }, { key: 'earn', name: '获取' }, { key: 'spend', name: '消耗' }],
            type: 'all', items: [], page: 1, loading: false, noMore: false
        }
    },
    onLoad() { this.reload() },
    onReachBottom() { this.more() },
    methods: {
        catLabel(c) { return CAT[c] || c },
        shortDate(iso) { if (!iso) return ''; return iso.replace('T', ' ').slice(0, 16) },
        switchType(k) { if (this.type === k) return; this.type = k; this.reload() },
        async reload() { this.page = 1; this.noMore = false; this.items = []; await this.fetch(true) },
        async more() { if (this.loading || this.noMore) return; this.page++; await this.fetch(false) },
        async fetch(reset) {
            this.loading = true
            try {
                const d = await getRecords({ type: this.type, page: this.page, pageSize: 15 })
                const list = (d && d.list) || []
                this.items = reset ? list : this.items.concat(list)
                const pg = d && d.pagination
                if ((pg && this.page >= pg.totalPages) || list.length === 0) this.noMore = true
            } catch (e) {} finally { this.loading = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.recs-page { min-height: 100vh; background: $paper; }
.tabs { display: flex; gap: 30rpx; background: $card; padding: 22rpx 30rpx; position: sticky; top: 0; z-index: 5; }
.tb { font-size: 27rpx; color: $muted; font-weight: 600; padding-bottom: 8rpx; position: relative; }
.tb.on { color: $ink; font-weight: 800; }
.tb.on::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 34rpx; height: 5rpx; border-radius: 3rpx; background: $green; }
.list { padding: 20rpx 24rpx 40rpx; }
.rec { display: flex; align-items: center; gap: 20rpx; background: $card; border-radius: 24rpx; padding: 24rpx; margin-bottom: 14rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.ri { width: 64rpx; height: 64rpx; border-radius: 18rpx; display: flex; align-items: center; justify-content: center; font-size: 32rpx; flex: none; }
.mid { flex: 1; min-width: 0; }
.t { display: block; font-size: 27rpx; font-weight: 700; }
.c { display: block; font-size: 20rpx; color: $muted; margin-top: 4rpx; }
.d { display: block; font-size: 20rpx; color: $faint; margin-top: 4rpx; }
.right { text-align: right; flex: none; }
.v { font-weight: 800; font-size: 30rpx; }
.v.up { color: $green-deep; } .v.dn { color: $ink-2; }
.bal { display: block; font-size: 18rpx; color: $faint; margin-top: 4rpx; }
.empty, .tip { text-align: center; color: $faint; font-size: 23rpx; padding: 40rpx 0; }
</style>
