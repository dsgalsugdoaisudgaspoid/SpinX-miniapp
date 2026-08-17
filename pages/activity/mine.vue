<template>
    <view class="mine">
        <view class="tabs">
            <text v-for="t in tabs" :key="t.k" :class="['tb', status === t.k ? 'on' : '']" :data-k="t.k" @tap="switchStatus">{{ t.n }}</text>
        </view>

        <view class="items">
            <view v-for="a in items" :key="a.registrationId || a.activityId" class="card" @tap="goDetail(a)">
                <view class="poster">
                    <text class="ptag">{{ (a.tags && a.tags[0]) || '骑行' }}</text>
                    <text class="pstatus" :style="{ background: badgeBg(a) }">{{ myStatusText(a) }}</text>
                </view>
                <view class="info">
                    <view class="drow"><text class="dbig mono">{{ fmt(a.startTime).date }}</text><text class="dsm">{{ fmt(a.startTime).weekday }} · {{ fmt(a.startTime).time }}</text></view>
                    <text class="ct ellipsis-2">{{ a.title }}</text>
                    <view class="loc"><text>📍</text><text class="ellipsis flex1">{{ a.meetingPoint || '集合点待定' }}</text></view>
                    <view class="metas">
                        <text class="pill" v-if="a.distance">{{ a.distance }}km</text>
                        <text class="pill status">{{ regStatusText(a) }}</text>
                        <text v-if="canCancel(a)" class="cancelbtn" :data-id="a.activityId || a.id" :data-start="a.startTime" :data-title="a.title" @tap.stop="onCancel">取消报名</text>
                    </view>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">
                <text class="ee">🗓</text><text>还没有报名活动</text>
                <view class="g-btn g-btn--plain golist" @tap="goActivities">去看看活动</view>
            </view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
    </view>
</template>

<script>
import { myActivities } from '@/api/user.js'
import { cancelRegistration } from '@/api/activity.js'
import { fmtTime } from '@/common/util.js'
import { currentUser } from '@/store/user.js'

export default {
    data() {
        return {
            tabs: [{ k: '', n: '全部' }, { k: 'upcoming', n: '待参与' }, { k: 'completed', n: '已完成' }, { k: 'cancelled', n: '已取消' }],
            status: '', items: [], loading: false
        }
    },
    onShow() { this.load() },
    methods: {
        fmt(iso) { return fmtTime(iso) },
        myStatusText(a) { return ({ upcoming: '待参与', in_progress: '进行中', completed: '已完成', cancelled: '已取消' })[a.myStatus] || '待参与' },
        regStatusText(a) { return ({ pending: '待审核', approved: '已通过', auto_approved: '已报名', cancelled: '已取消', rejected: '被拒绝' })[a.registrationStatus] || '已报名' },
        badgeBg(a) {
            const s = a.myStatus
            if (s === 'completed') return 'rgba(120,138,131,.9)'
            if (s === 'cancelled') return 'rgba(120,138,131,.9)'
            if (s === 'in_progress') return 'rgba(18,208,122,.9)'
            return 'rgba(240,160,23,.92)'
        },
        switchStatus(e) { const k = e.currentTarget.dataset.k; if (this.status === k) return; this.status = k; this.load() },
        async load() {
            this.loading = true
            try {
                const d = await myActivities({ status: this.status || undefined, page: 1, pageSize: 30 })
                this.items = (d && d.list) || []
            } catch (e) { this.items = [] } finally { this.loading = false }
        },
        // 主领队不能取消自己主领的这场（后端也会拦），退出只能走转让主领队资格
        canCancel(a) {
            const me = currentUser()
            const isMainLeader = !!(me && a.leaderId === me.userId)
            return (a.myStatus || 'upcoming') === 'upcoming' && a.registrationStatus !== 'cancelled' && !isMainLeader
        },
        onCancel(e) {
            const ds = e.currentTarget.dataset
            const id = ds.id, title = ds.title
            const t = ds.start ? new Date(String(ds.start).replace(/-/g, '/').replace('T', ' ').replace('Z', '')).getTime() : 0
            const hrs = t ? (t - Date.now()) / 3600000 : 99
            const late = hrs >= 0 && hrs < 6
            uni.showModal({
                title: '取消报名',
                content: late ? `距活动开始不足 6 小时，取消将计一次爽约并扣 20 信誉分。确定取消「${title}」？` : `确定取消报名「${title}」？`,
                confirmText: '确定取消', confirmColor: late ? '#e0533d' : '#0ba968',
                success: async (m) => {
                    if (!m.confirm) return
                    try {
                        const r = await cancelRegistration(id, '用户取消')
                        let msg = '已取消报名'
                        if (r && r.refunded) msg = `已取消 · 退款 ¥${r.refundAmount}`
                        if (r && r.penalized) msg = `已取消 · 爽约扣 ${r.deducted} 分`
                        uni.showToast({ title: msg, icon: 'none' })
                        this.load()
                    } catch (e) {}
                }
            })
        },
        goDetail(a) { uni.navigateTo({ url: '/pages/activity/detail?id=' + (a.activityId || a.id) }) },
        goActivities() { uni.switchTab({ url: '/pages/activity/list' }) }
    }
}
</script>

<style lang="scss" scoped>
.mine { min-height: 100vh; background: $paper; }
.tabs { display: flex; gap: 30rpx; background: $card; padding: 22rpx 30rpx; position: sticky; top: 0; z-index: 5; }
.tb { font-size: 27rpx; color: $muted; font-weight: 600; padding-bottom: 8rpx; position: relative; }
.tb.on { color: $ink; font-weight: 800; }
.tb.on::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 34rpx; height: 5rpx; border-radius: 3rpx; background: $green; }
.items { padding: 20rpx 24rpx 40rpx; }
.card { display: flex; gap: 22rpx; background: $card; border-radius: 30rpx; padding: 20rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 20rpx; }
.poster { width: 190rpx; flex: none; border-radius: 22rpx; height: 240rpx; position: relative; overflow: hidden;
    background: linear-gradient(155deg, #0e1b24, #123a57, #0a5c86); padding: 16rpx; }
.ptag { font-size: 18rpx; font-weight: 800; color: #fff; background: rgba(255,255,255,.18); padding: 4rpx 12rpx; border-radius: 10rpx; }
.pstatus { position: absolute; bottom: 16rpx; left: 16rpx; font-size: 18rpx; font-weight: 800; color: #fff; padding: 5rpx 14rpx; border-radius: 12rpx; }
.info { flex: 1; min-width: 0; }
.drow { display: flex; align-items: baseline; gap: 12rpx; }
.dbig { font-weight: 800; font-size: 36rpx; letter-spacing: -1rpx; }
.dsm { font-size: 20rpx; color: $muted; }
.ct { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-top: 12rpx; font-size: 28rpx; font-weight: 800; line-height: 1.3; }
.loc { display: flex; align-items: center; gap: 8rpx; margin-top: 12rpx; font-size: 22rpx; color: $muted; }
.metas { display: flex; gap: 10rpx; margin-top: 16rpx; flex-wrap: wrap; }
.pill { font-size: 20rpx; font-weight: 700; padding: 5rpx 14rpx; border-radius: 12rpx; background: $paper; color: $ink-2; }
.pill.status { background: #eef3fb; color: #2b6bb5; }
.cancelbtn { font-size: 20rpx; font-weight: 700; padding: 5rpx 16rpx; border-radius: 12rpx; background: $paper; color: $muted; box-shadow: inset 0 0 0 1rpx $line; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 110rpx 0; display: flex; flex-direction: column; align-items: center; gap: 14rpx; }
.ee { font-size: 76rpx; }
.golist { display: inline-flex; margin-top: 20rpx; padding: 0 40rpx; height: 76rpx; }
.tip { text-align: center; color: $faint; font-size: 23rpx; padding: 40rpx 0; }
</style>
