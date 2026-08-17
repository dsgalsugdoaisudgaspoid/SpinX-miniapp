<template>
    <view class="ld">
        <!-- 领队头部 -->
        <view class="head" :style="{ paddingTop: (statusBar + 30) + 'px' }">
            <view class="stars"></view>
            <view class="top">
                <view class="av"></view>
                <view class="who">
                    <view class="nline"><text class="nick">{{ leader.nickname ? spx(leader.nickname) : '领队' }}</text><text class="title">{{ leader.title }}</text></view>
                    <text class="meta">🚲 骑龄 {{ leader.ridingYears }} 年 · 📍 {{ leader.city }}</text>
                </view>
            </view>
            <view class="tags">
                <text v-for="(s, i) in leader.specialties" :key="i" class="tag">{{ s }}</text>
            </view>
            <view class="nums">
                <view class="num"><text class="nn mono">{{ leader.ledCount || 0 }}</text><text class="nl">场带队</text></view>
                <view class="num"><text class="nn mono">{{ leader.totalKm || 0 }}</text><text class="nl">带队 km</text></view>
                <view class="num"><text class="nn mono">{{ leader.upcomingCount || 0 }}</text><text class="nl">近期活动</text></view>
            </view>
        </view>

        <view class="bio" v-if="leader.bio">{{ leader.bio }}</view>

        <view class="sectop">
            <text class="sec">TA 带的车</text>
            <text class="filt" @tap="goFilter">在活动页筛选 TA ›</text>
        </view>

        <view class="acts">
            <view v-for="a in activities" :key="a.activityId" class="card" :data-id="a.activityId" @tap="goActivity">
                <view class="poster">
                    <text class="ptag">{{ (a.tags && a.tags[0]) || '骑行' }}</text>
                    <text class="pstatus" :style="{ background: statusColor(a) }">{{ statusText(a) }}</text>
                </view>
                <view class="info">
                    <view class="drow"><text class="dbig mono">{{ fmt(a.startTime).date }}</text><text class="dsm">{{ fmt(a.startTime).weekday }} · {{ fmt(a.startTime).time }}</text></view>
                    <text class="ct ellipsis-2">{{ a.title }}</text>
                    <view class="loc"><text>📍</text><text class="ellipsis flex1">{{ a.meetingPoint || '集合点待定' }}</text></view>
                    <view class="metas">
                        <text class="pill" v-if="a.distance">{{ a.distance }}km</text>
                        <text class="pill">{{ a.currentParticipants }}/{{ a.maxParticipants }} 人</text>
                    </view>
                </view>
            </view>
            <view v-if="!loading && activities.length === 0" class="empty">这位领队暂时没有活动</view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getLeader } from '@/api/leader.js'
import { statusBarHeight, fmtTime, spxName } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, id: '', leader: {}, activities: [], loading: false } },
    onLoad(q) { this.statusBar = statusBarHeight(); this.id = (q && q.id) || ''; this.load() },
    methods: {
        spx(n) { return spxName(n) },
        fmt(iso) { return fmtTime(iso) },
        statusText(a) { return ({ upcoming: '报名中', ongoing: '进行中', completed: '已结束', cancelled: '已取消' })[a.status] || '报名中' },
        statusColor(a) {
            if (a.status === 'ongoing') return 'rgba(18,208,122,.9)'
            if (a.status === 'completed' || a.status === 'cancelled') return 'rgba(120,138,131,.9)'
            return 'rgba(240,160,23,.92)'
        },
        async load() {
            this.loading = true
            try {
                const d = await getLeader(this.id)
                this.leader = d || {}
                this.activities = (d && d.activities) || []
                if (d && d.nickname) uni.setNavigationBarTitle({ title: d.nickname })
            } catch (e) { this.leader = {}; this.activities = [] } finally { this.loading = false }
        },
        goActivity(e) { uni.navigateTo({ url: '/pages/activity/detail?id=' + e.currentTarget.dataset.id }) },
        goFilter() {
            // 活动列表是 tabBar 页，switchTab 不支持传参，改用 storage 传递筛选领队
            uni.setStorageSync('spinx_leader_filter', String(this.id))
            uni.switchTab({ url: '/pages/activity/list' })
        }
    }
}
</script>

<style lang="scss" scoped>
.ld { min-height: 100vh; background: $paper; }
.head { padding: 0 34rpx 30rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, $night-1, $night-2 60%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 14%, #fff, transparent); }
.top { position: relative; display: flex; align-items: center; gap: 24rpx; }
.av { width: 128rpx; height: 128rpx; border-radius: 36rpx; flex: none; background: linear-gradient(140deg, #5ecb8f, #0ba968); box-shadow: 0 0 0 4rpx rgba(255,255,255,.25); }
.who { min-width: 0; }
.nline { display: flex; align-items: center; gap: 14rpx; }
.nick { font-size: 40rpx; font-weight: 800; }
.title { font-size: 20rpx; font-weight: 800; color: #04140c; background: $green; padding: 5rpx 14rpx; border-radius: 12rpx; }
.meta { display: block; font-size: 22rpx; opacity: .86; margin-top: 12rpx; }
.tags { position: relative; display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 22rpx; }
.tag { font-size: 20rpx; font-weight: 700; padding: 6rpx 16rpx; border-radius: 14rpx; background: rgba(255,255,255,.16); }
.nums { position: relative; display: flex; margin-top: 26rpx; background: rgba(255,255,255,.1); border-radius: 22rpx; padding: 22rpx 0; }
.num { flex: 1; text-align: center; }
.nn { display: block; font-size: 36rpx; font-weight: 800; letter-spacing: -1rpx; }
.nl { display: block; font-size: 19rpx; opacity: .8; margin-top: 6rpx; }

.bio { margin: 24rpx 28rpx 0; background: $card; border-radius: 24rpx; padding: 26rpx; font-size: 25rpx; color: $ink-2; line-height: 1.8; box-shadow: inset 0 0 0 1rpx $hair; }

.sectop { display: flex; align-items: baseline; margin: 32rpx 30rpx 16rpx; }
.sec { font-size: 30rpx; font-weight: 800; margin-right: auto; }
.filt { font-size: 22rpx; font-weight: 700; color: $green-deep; }

.acts { padding: 0 24rpx 0; }
.card { display: flex; gap: 22rpx; background: $card; border-radius: 30rpx; padding: 20rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 20rpx; }
.poster { width: 190rpx; flex: none; border-radius: 22rpx; height: 234rpx; position: relative; overflow: hidden;
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
.empty, .tip { text-align: center; color: $faint; font-size: 23rpx; padding: 50rpx 0; }
.safe-bottom { height: 50rpx; }
</style>
