<template>
    <view class="ad" v-if="seg">
        <!-- 头部 -->
        <view class="head" :style="{ paddingTop: (statusBar + 30) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>
            <text :class="['dir', seg.direction]">{{ dirLabel(seg.direction) }}考核</text>
            <text class="name">{{ seg.name }}</text>
            <text class="tgt">通过后升级为 {{ tierEmoji(seg.targetTier) }} {{ seg.targetTierName }}</text>
            <view class="nums">
                <view class="num"><text class="nn mono">{{ seg.distance }}</text><text class="nl">公里</text></view>
                <view class="num"><text class="nn mono">{{ seg.timeLimitMinutes }}</text><text class="nl">限时(分)</text></view>
                <view class="num"><text class="nn">200</text><text class="nl">打卡半径(m)</text></view>
            </view>
        </view>

        <view class="body">
            <!-- 状态 -->
            <view v-if="seg.finished" :class="['status', seg.progress && seg.progress.passed ? 'pass' : 'fail']">
                <text class="sicon">{{ seg.progress && seg.progress.passed ? '🎉' : '⏳' }}</text>
                <view class="stxt">
                    <text class="st1">{{ seg.progress && seg.progress.passed ? '考核通过' : '未通过 · 超出限时' }}</text>
                    <text class="st2">用时 {{ fmtDur(seg.progress ? seg.progress.durationSec : 0) }}{{ seg.progress && seg.progress.passed ? ' · 成绩已计入赛段榜单' : '，可再次挑战' }}</text>
                </view>
            </view>
            <view v-else-if="seg.started" class="status ing">
                <text class="sicon">⏱</text>
                <view class="stxt"><text class="st1">计时中…</text><text class="st2">尽快骑到终点「{{ seg.endName }}」完成终点打卡</text></view>
            </view>

            <!-- 起终点 -->
            <view class="pts">
                <view class="prow"><text class="pdot start">起</text><view class="pinfo"><text class="pk">起点打卡</text><text class="pv">{{ seg.startName }}</text></view></view>
                <view class="pline"></view>
                <view class="prow"><text class="pdot end">终</text><view class="pinfo"><text class="pk">终点打卡</text><text class="pv">{{ seg.endName }}</text></view></view>
                <safe-map class="mapbox" :latitude="midLat" :longitude="midLng" :markers="markers" :scale="12" height="260rpx"></safe-map>
            </view>

            <!-- 规则 -->
            <view class="rules">
                <text class="rt">📋 考核规则</text>
                <text class="rl">· 到达起点 200m 内「起点打卡」，计时开始</text>
                <text class="rl">· 骑行至终点 200m 内「终点打卡」，计时结束</text>
                <text class="rl">· 全程用时 ≤ {{ seg.timeLimitMinutes }} 分钟即通过，升级为{{ seg.targetTierName }}</text>
                <text class="rl">· 常驻赛段，随时可挑战；成绩计入赛段榜单</text>
            </view>
            <view class="risk" v-if="seg.riskNotice"><text class="ri">⚠️</text><text class="rtx">{{ seg.riskNotice }}</text></view>

            <!-- 榜单入口 -->
            <view class="lbentry" @tap="goLeaderboard">
                <text class="lbi">🏆</text>
                <view class="lbt"><text class="lbt1">赛段榜单</text><text class="lbt2">历史成绩 · 每人取最好</text></view>
                <text class="lbarw">›</text>
            </view>
            <view class="safe-bottom"></view>
        </view>

        <!-- 底部：起点打卡 / 终点打卡 -->
        <view class="cta" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <view :class="['go2', seg.started ? 'done' : '']" @tap="onStart">
                <text class="gt">{{ seg.started ? '已在起点 ✓' : (seg.finished ? '重新挑战' : '起点打卡') }}</text>
            </view>
            <view :class="['go2', 'end', (!seg.started) ? 'off' : '']" @tap="onEnd">
                <text class="gt">终点打卡</text>
            </view>
        </view>
    </view>
</template>

<script>
import { getAssessment, checkinStart, checkinEnd } from '@/api/assessment.js'
import { statusBarHeight, distanceMeters } from '@/common/util.js'
import { isLoggedIn } from '@/store/user.js'
import { tierOf } from '@/common/config.js'
import SafeMap from '@/components/safe-map/safe-map.vue'

export default {
    components: { SafeMap },
    data() { return { statusBar: 20, safeBottom: 0, id: null, seg: null, acting: false } },
    computed: {
        midLat() { return this.seg ? (this.seg.startLat + this.seg.endLat) / 2 : 30.66 },
        midLng() { return this.seg ? (this.seg.startLng + this.seg.endLng) / 2 : 104.06 },
        markers() {
            if (!this.seg) return []
            return [
                { id: 1, latitude: this.seg.startLat, longitude: this.seg.startLng, width: 28, height: 28, callout: { content: '起点 · ' + this.seg.startName, display: 'ALWAYS', padding: 6, borderRadius: 6 } },
                { id: 2, latitude: this.seg.endLat, longitude: this.seg.endLng, width: 28, height: 28, callout: { content: '终点 · ' + this.seg.endName, display: 'ALWAYS', padding: 6, borderRadius: 6 } }
            ]
        }
    },
    onLoad(q) {
        this.statusBar = statusBarHeight()
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.id = q.id
    },
    onShow() { if (this.id) this.load() },
    methods: {
        dirLabel(d) { return ({ east: '城东', south: '城南', west: '城西', north: '城北' })[d] || '' },
        tierEmoji(key) { return tierOf(key).icon },
        fmtDur(sec) { sec = sec || 0; const m = Math.floor(sec / 60), s = sec % 60; return m + '分' + (s < 10 ? '0' + s : s) + '秒' },
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/home/home' }) },
        async load() { try { this.seg = await getAssessment(this.id) } catch (e) {} },
        goLeaderboard() { uni.navigateTo({ url: '/pages/assessment/leaderboard?id=' + this.id }) },
        geoAct(tlat, tlng, label, fn) {
            if (!isLoggedIn()) { uni.navigateTo({ url: '/pages/login/login' }); return }
            if (this.acting) return
            this.acting = true
            uni.showLoading({ title: '定位中…', mask: true })
            let done = false
            const guard = setTimeout(() => { if (done) return; done = true; uni.hideLoading(); this.acting = false; uni.showModal({ title: '定位超时', content: '未能获取定位，请确认已开启定位（模拟器需先设置位置）后重试', showCancel: false, confirmText: '知道了' }) }, 8000)
            uni.getLocation({
                type: 'gcj02',
                success: async (loc) => {
                    if (done) return; done = true; clearTimeout(guard)
                    const d = distanceMeters(loc.latitude, loc.longitude, tlat, tlng)
                    if (d > 200) {
                        uni.hideLoading(); this.acting = false
                        uni.showModal({ title: `离${label}还太远`, content: `你距${label}约 ${Math.round(d)} 米，需到达 200 米范围内才能打卡`, showCancel: false, confirmText: '知道了' })
                        return
                    }
                    try { await fn(loc); uni.hideLoading() } catch (e) { uni.hideLoading() } finally { this.acting = false }
                },
                fail: () => { if (done) return; done = true; clearTimeout(guard); uni.hideLoading(); this.acting = false; uni.showModal({ title: '需要定位权限', content: '考核打卡需获取你的位置以核验是否到达打卡点，请在设置中开启位置信息', showCancel: false }) }
            })
        },
        onStart() {
            this.geoAct(this.seg.startLat, this.seg.startLng, '起点', async (loc) => {
                await checkinStart(this.id, { latitude: loc.latitude, longitude: loc.longitude })
                await this.load()
                uni.showToast({ title: '起点打卡成功 · 开始计时', icon: 'success' })
            })
        },
        onEnd() {
            if (!this.seg.started) { uni.showToast({ title: '请先在起点打卡', icon: 'none' }); return }
            this.geoAct(this.seg.endLat, this.seg.endLng, '终点', async (loc) => {
                const r = await checkinEnd(this.id, { latitude: loc.latitude, longitude: loc.longitude })
                await this.load()
                if (r && r.passed && r.upgraded) uni.showModal({ title: '🎉 考核通过', content: `用时 ${this.fmtDur(r.durationSec)}，恭喜升级为 ${r.newTierName}！`, showCancel: false, confirmText: '太棒了' })
                else if (r && r.passed) uni.showModal({ title: '✅ 考核通过', content: `用时 ${this.fmtDur(r.durationSec)}。你当前骑游等级 ${r.currentTierName} 已不低于本赛段目标（${r.segmentTierName}），等级保持不变，成绩已计入榜单。`, showCancel: false, confirmText: '知道了' })
                else uni.showModal({ title: '考核未通过', content: `用时 ${this.fmtDur(r ? r.durationSec : 0)}，超过限时 ${this.seg.timeLimitMinutes} 分钟，可再次挑战`, showCancel: false, confirmText: '知道了' })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.ad { height: 100vh; display: flex; flex-direction: column; background: $paper; }
.head { padding: 0 34rpx 30rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, $night-1, $night-2 60%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 14%, #fff, transparent); }
.nav { position: relative; }
.nbtn { width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 38rpx; }
.dir { position: relative; display: inline-block; font-size: 20rpx; font-weight: 800; color: #fff; padding: 6rpx 16rpx; border-radius: 14rpx; margin-top: 14rpx; }
.dir.east { background: #f0a017; } .dir.south { background: #12d07a; color: #04140c; } .dir.west { background: #6fd0ff; color: #04140c; } .dir.north { background: #8f6eff; }
.name { position: relative; display: block; font-size: 42rpx; font-weight: 800; margin-top: 14rpx; }
.tgt { position: relative; display: block; font-size: 23rpx; opacity: .9; margin-top: 10rpx; }
.nums { position: relative; display: flex; margin-top: 24rpx; background: rgba(255,255,255,.1); border-radius: 22rpx; padding: 22rpx 0; }
.num { flex: 1; text-align: center; }
.nn { display: block; font-size: 36rpx; font-weight: 800; letter-spacing: -1rpx; }
.nl { display: block; font-size: 19rpx; opacity: .8; margin-top: 6rpx; }

.body { flex: 1; overflow-y: auto; padding: 24rpx 28rpx 0; }
.status { display: flex; align-items: center; gap: 18rpx; border-radius: 22rpx; padding: 24rpx; margin-bottom: 22rpx; }
.status.pass { background: $green-soft; } .status.fail { background: #fbf1e4; } .status.ing { background: #e9f1fb; }
.sicon { font-size: 44rpx; }
.st1 { display: block; font-size: 28rpx; font-weight: 800; }
.status.pass .st1 { color: $green-deep; } .status.fail .st1 { color: #b5750c; } .status.ing .st1 { color: #2b6bb5; }
.st2 { display: block; font-size: 21rpx; color: $ink-2; margin-top: 6rpx; }

.pts { background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.prow { display: flex; align-items: center; gap: 18rpx; }
.pdot { width: 48rpx; height: 48rpx; border-radius: 50%; flex: none; display: flex; align-items: center; justify-content: center; font-size: 22rpx; font-weight: 800; color: #fff; }
.pdot.start { background: $green-deep; } .pdot.end { background: $coral; }
.pinfo { min-width: 0; }
.pk { display: block; font-size: 20rpx; color: $muted; font-weight: 700; }
.pv { display: block; font-size: 26rpx; font-weight: 700; margin-top: 4rpx; }
.pline { width: 2rpx; height: 26rpx; background: $line; margin: 6rpx 0 6rpx 23rpx; }
.mapbox { margin-top: 22rpx; }

.rules { background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-top: 20rpx; }
.rt { display: block; font-size: 27rpx; font-weight: 800; margin-bottom: 12rpx; }
.rl { display: block; font-size: 22rpx; color: $ink-2; line-height: 1.9; }
.risk { margin-top: 18rpx; background: #fbf7e8; border-radius: 18rpx; padding: 20rpx; display: flex; gap: 12rpx; }
.ri { font-size: 26rpx; } .rtx { flex: 1; font-size: 22rpx; color: #8a6d1a; line-height: 1.6; }

.lbentry { display: flex; align-items: center; gap: 16rpx; margin-top: 20rpx; background: $night-1; border-radius: 22rpx; padding: 24rpx; }
.lbi { font-size: 34rpx; }
.lbt { flex: 1; }
.lbt1 { display: block; color: #fff; font-size: 27rpx; font-weight: 800; }
.lbt2 { display: block; color: rgba(255,255,255,.6); font-size: 20rpx; margin-top: 4rpx; }
.lbarw { color: $green; font-size: 34rpx; font-weight: 800; }
.safe-bottom { height: 30rpx; }

.cta { display: flex; align-items: center; gap: 20rpx; padding: 18rpx 30rpx 0; border-top: 1rpx solid $hair; background: $card; }
.go2 { flex: 1; height: 96rpx; border-radius: 30rpx; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(120deg, $green, $green-deep); color: #04140c; }
.go2 .gt { font-weight: 800; font-size: 29rpx; }
.go2.done { background: $green-soft; color: $green-deep; box-shadow: inset 0 0 0 2rpx rgba(11,169,104,.35); }
.go2.end { background: $night-1; color: #fff; }
.go2.off { background: #d7ddda; color: #8a968f; }
</style>
