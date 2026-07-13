<template>
    <view class="list">
        <view class="filters">
            <view class="ftabs">
                <text v-for="f in statusTabs" :key="f.key" :class="['ft', status === f.key ? 'on' : '']" @tap="switchStatus(f.key)">{{ f.name }}</text>
            </view>
        </view>

        <scroll-view scroll-x class="tagbar" v-if="!mine" show-scrollbar="false">
            <text v-for="t in tags" :key="t.key" :class="['tg', tag === t.key ? 'on' : '']" @tap="switchTag(t.key)">{{ t.name }}</text>
        </scroll-view>

        <view class="items">
            <view v-for="a in items" :key="a.activityId || a.id" class="card" @tap="goDetail(a)">
                <view class="poster">
                    <text class="ptag">{{ (a.tags && a.tags[0]) || (a.title && a.title.indexOf('夜') > -1 ? '夜骑' : '骑行') }}</text>
                    <text class="pstatus" :style="{ background: statusColor(a) }">{{ statusText(a) }}</text>
                </view>
                <view class="info">
                    <view class="drow"><text class="dbig mono">{{ fmt(startOf(a)).date }}</text><text class="dsm">{{ fmt(startOf(a)).weekday }} · {{ fmt(startOf(a)).time }}</text></view>
                    <text class="ct ellipsis-2">{{ a.title }}</text>
                    <view class="loc"><text>📍</text><text class="ellipsis flex1">{{ a.meetingPoint || '集合点待定' }}</text></view>
                    <view class="metas">
                        <text class="pill" v-if="a.distance">{{ a.distance }}km</text>
                        <text class="pill" v-if="!mine">{{ a.currentParticipants }}/{{ a.maxParticipants }} 人</text>
                        <text class="pill free" v-if="!mine">{{ feeStr(a.fee) }}</text>
                        <text class="pill mine" v-if="mine">{{ myStatusText(a) }}</text>
                    </view>
                </view>
            </view>

            <view v-if="!loading && items.length === 0" class="empty">暂无活动</view>
            <view v-if="loading" class="loadingtip">加载中…</view>
            <view v-if="noMore && items.length > 0" class="nomore">没有更多了</view>
        </view>
    </view>
</template>

<script>
import { listActivities } from '@/api/activity.js'
import { myActivities } from '@/api/user.js'
import { fmtTime, fmtFee } from '@/common/util.js'

export default {
    data() {
        return {
            mine: false,
            statusTabs: [{ key: 'all', name: '全部' }, { key: 'upcoming', name: '即将开始' }, { key: 'ongoing', name: '进行中' }, { key: 'completed', name: '已结束' }],
            status: 'all',
            tags: [{ key: '', name: '全部' }, { key: '休闲骑', name: '休闲骑' }, { key: '拉练', name: '拉练' }, { key: '公益骑', name: '公益骑' }, { key: '新手友好', name: '夜骑' }, { key: '跨城骑', name: '跨城' }],
            tag: '',
            items: [], page: 1, loading: false, noMore: false
        }
    },
    onLoad(q) {
        this.mine = q && q.mine === '1'
        if (this.mine) uni.setNavigationBarTitle({ title: '我的活动' })
        this.reload()
    },
    onReachBottom() { this.loadMore() },
    methods: {
        fmt(iso) { return fmtTime(iso) },
        feeStr(f) { return fmtFee(f) },
        startOf(a) { return a.startTime },
        statusText(a) {
            const s = a.activityStatus || a.status
            return { upcoming: '报名中', ongoing: '进行中', completed: '已结束', cancelled: '已取消', withdrawn: '已下架' }[s] || '报名中'
        },
        statusColor(a) {
            const s = a.activityStatus || a.status
            if (s === 'ongoing') return 'rgba(18,208,122,.9)'
            if (s === 'completed' || s === 'cancelled' || s === 'withdrawn') return 'rgba(120,138,131,.9)'
            return 'rgba(240,160,23,.92)'
        },
        myStatusText(a) {
            return { pending: '待审核', approved: '已通过', auto_approved: '已报名', cancelled: '已取消', rejected: '被拒绝', completed: '已完成', in_progress: '进行中', upcoming: '待出发' }[a.myStatus || a.registrationStatus] || '已报名'
        },
        async reload() {
            this.page = 1; this.noMore = false; this.items = []
            await this.fetch(true)
        },
        async loadMore() {
            if (this.loading || this.noMore) return
            this.page++
            await this.fetch(false)
        },
        async fetch(reset) {
            this.loading = true
            try {
                let d
                if (this.mine) d = await myActivities({ page: this.page, pageSize: 10 })
                else d = await listActivities({ status: this.status, tag: this.tag || undefined, page: this.page, pageSize: 10 })
                const list = (d && d.list) || []
                this.items = reset ? list : this.items.concat(list)
                const pg = d && d.pagination
                if (pg && this.page >= pg.totalPages) this.noMore = true
                if (list.length === 0) this.noMore = true
            } catch (e) {} finally { this.loading = false }
        },
        switchStatus(k) { if (this.status === k) return; this.status = k; this.reload() },
        switchTag(k) { if (this.tag === k) return; this.tag = k; this.reload() },
        goDetail(a) { uni.navigateTo({ url: '/pages/activity/detail?id=' + (a.activityId || a.id) }) }
    }
}
</script>

<style lang="scss" scoped>
.list { min-height: 100vh; }
.filters { background: $card; padding: 16rpx 24rpx; position: sticky; top: 0; z-index: 5; }
.ftabs { display: flex; gap: 30rpx; }
.ft { font-size: 27rpx; color: $muted; font-weight: 600; padding-bottom: 8rpx; position: relative; }
.ft.on { color: $ink; font-weight: 800; }
.ft.on::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 34rpx; height: 5rpx; border-radius: 3rpx; background: $green; }
.tagbar { white-space: nowrap; background: $card; padding: 4rpx 24rpx 18rpx; }
.tg { display: inline-block; height: 56rpx; line-height: 56rpx; padding: 0 24rpx; border-radius: 18rpx; margin-right: 14rpx; background: $paper; font-size: 24rpx; color: $ink-2; font-weight: 600; }
.tg.on { background: $green; color: #04140c; font-weight: 800; }

.items { padding: 20rpx 24rpx 40rpx; }
.card { display: flex; gap: 22rpx; background: $card; border-radius: 30rpx; padding: 20rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 20rpx; }
.poster { width: 190rpx; flex: none; border-radius: 22rpx; height: 240rpx; position: relative; overflow: hidden;
    background: linear-gradient(155deg, #0e1b24, #123a57, #0a5c86); padding: 16rpx; }
.ptag { font-size: 18rpx; font-weight: 800; color: #fff; background: rgba(255,255,255,.18); padding: 4rpx 12rpx; border-radius: 10rpx; }
.pstatus { position: absolute; bottom: 16rpx; left: 16rpx; font-size: 18rpx; font-weight: 800; color: #04140c; padding: 5rpx 14rpx; border-radius: 12rpx; }
.info { flex: 1; min-width: 0; }
.drow { display: flex; align-items: baseline; gap: 12rpx; }
.dbig { font-weight: 800; font-size: 36rpx; letter-spacing: -1rpx; }
.dsm { font-size: 20rpx; color: $muted; }
.ct { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-top: 12rpx; font-size: 28rpx; font-weight: 800; line-height: 1.3; }
.loc { display: flex; align-items: center; gap: 8rpx; margin-top: 12rpx; font-size: 22rpx; color: $muted; }
.metas { display: flex; gap: 10rpx; margin-top: 16rpx; flex-wrap: wrap; }
.pill { font-size: 20rpx; font-weight: 700; padding: 5rpx 14rpx; border-radius: 12rpx; background: $paper; color: $ink-2; }
.pill.free { background: $green-soft; color: $green-deep; }
.pill.mine { background: #eef3fb; color: #2b6bb5; }
.empty, .loadingtip, .nomore { text-align: center; color: $faint; font-size: 23rpx; padding: 50rpx 0; }
</style>
