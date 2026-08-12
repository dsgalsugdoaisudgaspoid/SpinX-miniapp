<template>
    <view class="checkin">
        <view class="hero" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <text class="bike">🚴</text>
            <text class="slogan">迎风出发，把自由踩出来</text>
            <text class="sub">到达集合点后，在活动详情页一键定位签到，全勤有额外积分</text>
        </view>

        <view class="scanwrap">
            <view class="g-btn scan" @tap="goToday">📍 定位签到 · 今天的活动</view>
            <view v-if="isLeader" class="createbtn" @tap="goCreate"><text class="ci2">🚩</text>发起新活动</view>
        </view>

        <view class="sec">我报名的活动</view>
        <view class="mine">
            <view v-for="a in items" :key="a.activityId || a.id" class="row" @tap="goDetail(a)">
                <view class="dt"><text class="dd mono">{{ fmt(a.startTime).date }}</text><text class="dw">{{ fmt(a.startTime).weekday }}</text></view>
                <view class="mid">
                    <text class="tt ellipsis">{{ a.title }}</text>
                    <text class="ll ellipsis">📍 {{ a.meetingPoint || '集合点待定' }} · {{ fmt(a.startTime).time }}</text>
                </view>
                <text class="badge" :style="{ background: badgeBg(a), color: badgeColor(a) }">{{ myStatus(a) }}</text>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">
                <text>还没有报名活动</text>
                <view class="g-btn g-btn--plain golist" @tap="goList">去看看活动</view>
            </view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { myActivities } from '@/api/user.js'
import { isLoggedIn, hasRole } from '@/store/user.js'
import { fmtTime } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, items: [], loading: false } },
    computed: { isLeader() { return hasRole('leader') || hasRole('admin') } },
    onLoad() { try { this.statusBar = uni.getSystemInfoSync().statusBarHeight || 20 } catch (e) {} },
    onShow() { if (isLoggedIn()) this.load() },
    methods: {
        fmt(iso) { return fmtTime(iso) },
        isToday(iso) { if (!iso) return false; const d = new Date(iso), n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate() },
        // 当日已报名、未取消、未完成的活动（用于自动跳转与「今天的活动」按钮）
        todayActivity() {
            return this.items.find(a => {
                const s = a.myStatus || a.registrationStatus || a.activityStatus
                return this.isToday(a.startTime) && s !== 'cancelled' && s !== 'completed'
            })
        },
        myStatus(a) { return { pending: '待审核', approved: '已通过', auto_approved: '待出发', upcoming: '待出发', in_progress: '进行中', completed: '已完成', cancelled: '已取消' }[a.myStatus || a.registrationStatus] || '待出发' },
        badgeBg(a) { const s = a.myStatus || a.registrationStatus; return s === 'completed' ? '#eef2f0' : (s === 'pending' ? '#fdf1dd' : '#e6f9f0') },
        badgeColor(a) { const s = a.myStatus || a.registrationStatus; return s === 'completed' ? '#7a8a83' : (s === 'pending' ? '#b8760a' : '#0ba968') },
        async load() {
            this.loading = true
            try {
                const d = await myActivities({ page: 1, pageSize: 20 }); this.items = (d && d.list) || []
                this.maybeAutoOpen()
            } catch (e) {} finally { this.loading = false }
        },
        // 当日有活动 → 直接进详情页提示定位签到，减少操作链路；每天只自动跳一次，避免来回切 tab 反复弹
        maybeAutoOpen() {
            const a = this.todayActivity()
            if (!a) return
            const today = new Date().toDateString()
            if (uni.getStorageSync('autoCheckinOpenedDate') === today) return
            uni.setStorageSync('autoCheckinOpenedDate', today)
            uni.navigateTo({ url: '/pages/activity/detail?id=' + (a.activityId || a.id) + '&checkin=1' })
        },
        goToday() {
            if (!isLoggedIn()) { uni.navigateTo({ url: '/pages/login/login' }); return }
            const a = this.todayActivity()
            if (!a) { uni.showToast({ title: '今天没有已报名的活动', icon: 'none' }); return }
            uni.navigateTo({ url: '/pages/activity/detail?id=' + (a.activityId || a.id) + '&checkin=1' })
        },
        goDetail(a) { uni.navigateTo({ url: '/pages/activity/detail?id=' + (a.activityId || a.id) }) },
        goList() { uni.switchTab({ url: '/pages/activity/list' }) },
        goCreate() { uni.navigateTo({ url: '/pages/leader/create' }) }
    }
}
</script>

<style lang="scss" scoped>
.checkin { min-height: 100vh; }
.hero { padding: 0 40rpx 50rpx; text-align: center; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, #0e1b24, #123a57 60%, #0a5c86); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 24% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 70% 24%, #bfe9ff, transparent), radial-gradient(2rpx 2rpx at 54% 14%, #fff, transparent); }
.bike { position: relative; font-size: 120rpx; filter: drop-shadow(0 0 26rpx rgba(111,208,255,.6)); }
.slogan { position: relative; display: block; font-size: 38rpx; font-weight: 800; margin-top: 16rpx; }
.sub { position: relative; display: block; font-size: 22rpx; opacity: .82; margin-top: 14rpx; line-height: 1.6; }

.scanwrap { margin: -30rpx 28rpx 0; position: relative; z-index: 2; display: flex; flex-direction: column; gap: 16rpx; }
.scan { box-shadow: 0 16rpx 30rpx -12rpx rgba(18,208,122,.6); }
.createbtn { height: 88rpx; border-radius: 28rpx; background: $card; box-shadow: inset 0 0 0 1rpx $line; display: flex; align-items: center; justify-content: center; gap: 10rpx; font-size: 28rpx; font-weight: 800; color: $ink; }
.ci2 { font-size: 30rpx; }

.sec { font-size: 30rpx; font-weight: 800; margin: 34rpx 30rpx 16rpx; }
.mine { margin: 0 28rpx; }
.row { display: flex; align-items: center; gap: 22rpx; background: $card; border-radius: 24rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.dt { width: 96rpx; text-align: center; flex: none; }
.dd { display: block; font-weight: 800; font-size: 34rpx; letter-spacing: -1rpx; }
.dw { display: block; font-size: 19rpx; color: $muted; }
.mid { flex: 1; min-width: 0; }
.tt { display: block; font-size: 27rpx; font-weight: 800; }
.ll { display: block; font-size: 21rpx; color: $muted; margin-top: 6rpx; }
.badge { font-size: 20rpx; font-weight: 800; padding: 6rpx 16rpx; border-radius: 14rpx; flex: none; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 70rpx 0; }
.golist { display: inline-flex; margin-top: 26rpx; padding: 0 40rpx; height: 76rpx; }
.safe-bottom { height: 60rpx; }
</style>
