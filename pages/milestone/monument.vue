<template>
    <view class="mono-page">
        <!-- ========== 荣誉总览 ========== -->
        <block v-if="mode === 'list'">
            <view class="hero" :style="{ paddingTop: (statusBar + 24) + 'px' }">
                <view class="stars"></view>
                <view class="nbtn" :style="{ top: (statusBar + 12) + 'px' }" @tap="back">‹</view>
                <text class="htag">🏅 骑行纪念碑</text>
                <text class="hname">{{ journey.nickname || '骑友' }}</text>
                <text class="hsub">{{ journey.levelName || '入门骑行者' }} · 骑龄 {{ journey.ridingYears || 0 }} 年</text>

                <view class="stat3">
                    <view class="s"><text class="sn mono">{{ journey.totalActivities || 0 }}</text><text class="sl">参与活动</text></view>
                    <view class="s"><text class="sn mono">{{ journey.totalDistance || 0 }}</text><text class="sl">骑行 km</text></view>
                    <view class="s"><text class="sn mono">{{ journey.totalDurationHours || 0 }}</text><text class="sl">骑行小时</text></view>
                </view>
            </view>

            <!-- 年度回忆入口 -->
            <view class="sec" v-if="availableYears.length">
                <text class="sec-t">🎞 年度回忆</text>
                <view class="years">
                    <view v-for="y in availableYears" :key="y" class="ycard" @tap="openAnnual(y)">
                        <text class="yn mono">{{ y }}</text>
                        <text class="yl">年度总结 ›</text>
                    </view>
                </view>
            </view>

            <!-- 已解锁纪念碑 -->
            <view class="sec">
                <text class="sec-t">✨ 已解锁的纪念碑</text>
                <view v-if="milestones.length === 0" class="empty">
                    还没有解锁纪念碑。参加第一次活动，即可点亮「第一次骑行」纪念碑。
                </view>
                <view v-for="m in milestones" :key="m.id" class="mcard" @tap="openMilestone(m)">
                    <text class="mico">{{ m.type === 'annual_review' ? '🎞' : '🏅' }}</text>
                    <view class="mbody">
                        <text class="mt">{{ m.title }}</text>
                        <text class="ms">{{ m.subtitle }}</text>
                    </view>
                    <text class="marw">›</text>
                </view>
            </view>

            <!-- 纪念碑是精选高光，骑行日记是完整流水，两者不合并 -->
            <view class="jlink" @tap="goJournal">
                <text class="jli">📔</text><text class="jlt">查看完整骑行日记</text><text class="jlarw">›</text>
            </view>
            <view class="safe-bottom"></view>
        </block>

        <!-- ========== 年度回忆故事线 ========== -->
        <block v-else>
            <swiper class="story" :vertical="true" :indicator-dots="false" :current="idx" @change="onSwipe">
                <swiper-item v-for="(c, i) in chapters" :key="c.key || i">
                    <view class="page" :class="'p-' + (i % 4)">
                        <view class="stars"></view>
                        <text class="ctag">{{ c.tag }}</text>
                        <view class="cmid">
                            <text class="ctitle">{{ c.title }}</text>
                            <text v-if="c.bigNumber" class="cbig mono">{{ c.bigNumber }}</text>
                            <text v-if="c.bigLabel" class="cbiglabel">{{ c.bigLabel }}</text>
                            <text class="cbody">{{ c.body }}</text>
                        </view>
                        <text class="chint">{{ i < chapters.length - 1 ? '上滑继续 ↑' : '' }}</text>
                    </view>
                </swiper-item>
            </swiper>
            <view class="story-top" :style="{ paddingTop: (statusBar + 8) + 'px' }">
                <text class="sback" @tap="backToList">‹ 返回</text>
                <text class="sprog mono">{{ idx + 1 }} / {{ chapters.length }}</text>
            </view>
        </block>
    </view>
</template>

<script>
import { getMonument, getAnnualReview } from '@/api/milestone.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() {
        return {
            statusBar: 20,
            mode: 'list',
            journey: {},
            milestones: [],
            availableYears: [],
            chapters: [],
            idx: 0
        }
    },
    onLoad(opts) {
        this.statusBar = statusBarHeight()
        this.load()
        // 支持从通知直达某个纪念碑：?annual=2026
        if (opts && opts.annual) this.pendingAnnual = Number(opts.annual)
    },
    methods: {
        async load() {
            try {
                const d = await getMonument()
                this.journey = d.journey || {}
                this.milestones = d.milestones || []
                this.availableYears = d.availableAnnualYears || []
                if (this.pendingAnnual) { this.openAnnual(this.pendingAnnual); this.pendingAnnual = null }
            } catch (e) { /* toast 已在 request 层统一处理 */ }
        },
        openMilestone(m) {
            if (m.type === 'annual_review') {
                this.enterStory(m)
            } else {
                this.showFirstRide(m)
            }
        },
        async openAnnual(year) {
            try {
                const m = await getAnnualReview(year)
                this.enterStory(m)
            } catch (e) { /* ignore */ }
        },
        enterStory(m) {
            this.chapters = m.chapters || []
            if (this.chapters.length === 0) {
                uni.showToast({ title: '暂无年度回忆内容', icon: 'none' })
                return
            }
            this.idx = 0
            this.mode = 'story'
        },
        showFirstRide(m) {
            const s = m.stats || {}
            const lines = [m.subtitle]
            if (s.activityTitle) lines.push('首骑：' + s.activityTitle)
            if (s.distance) lines.push('里程：' + s.distance + ' km')
            if (s.bonusPoints) lines.push('荣誉积分 +' + s.bonusPoints)
            uni.showModal({ title: '🏅 ' + m.title, content: lines.join('\n'), showCancel: false, confirmText: '知道了' })
        },
        onSwipe(e) { this.idx = e.detail.current },
        backToList() { this.mode = 'list'; this.idx = 0 },
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/profile/profile' }) },
        goJournal() { uni.navigateTo({ url: '/pages/journal/list' }) }
    }
}
</script>

<style lang="scss" scoped>
.mono-page { min-height: 100vh; background: $paper; }

/* ---- 荣誉总览 ---- */
.hero { padding: 0 40rpx 56rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, #0e1b24, #123a57 60%, #0a5c86); }
.nbtn { position: absolute; left: 24rpx; width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; z-index: 3; }
.stars { position: absolute; inset: 0; opacity: .45; pointer-events: none;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent),
                radial-gradient(2rpx 2rpx at 76% 24%, #bfe9ff, transparent),
                radial-gradient(2rpx 2rpx at 54% 14%, #fff, transparent),
                radial-gradient(2rpx 2rpx at 38% 68%, #cfeeff, transparent),
                radial-gradient(2rpx 2rpx at 88% 60%, #fff, transparent); }
.htag { position: relative; display: inline-block; font-size: 24rpx; letter-spacing: 2rpx; opacity: .85; }
.hname { position: relative; display: block; font-size: 48rpx; font-weight: 800; margin-top: 16rpx; }
.hsub { position: relative; display: block; font-size: 26rpx; opacity: .8; margin-top: 8rpx; }
.stat3 { position: relative; display: flex; margin-top: 40rpx; gap: 20rpx; }
.stat3 .s { flex: 1; background: rgba(255,255,255,.08); border-radius: 20rpx; padding: 24rpx 0; text-align: center;
    border: 1rpx solid rgba(255,255,255,.14); }
.sn { display: block; font-size: 44rpx; font-weight: 800; color: #12d07a; }
.sl { display: block; font-size: 22rpx; opacity: .8; margin-top: 8rpx; }

.sec { padding: 32rpx 32rpx 0; }
.sec-t { display: block; font-size: 30rpx; font-weight: 700; color: $ink; margin-bottom: 20rpx; }
.years { display: flex; flex-wrap: wrap; gap: 20rpx; }
.ycard { width: 210rpx; background: $card; border-radius: 20rpx; padding: 28rpx; box-shadow: 0 6rpx 20rpx rgba(14,27,36,.06);
    display: flex; flex-direction: column; }
.yn { font-size: 44rpx; font-weight: 800; color: $ink; }
.yl { font-size: 24rpx; color: $green-deep; margin-top: 8rpx; }

.mcard { display: flex; align-items: center; gap: 20rpx; background: $card; border-radius: 20rpx; padding: 28rpx;
    margin-bottom: 18rpx; box-shadow: 0 6rpx 20rpx rgba(14,27,36,.06); }
.mico { font-size: 48rpx; }
.mbody { flex: 1; display: flex; flex-direction: column; }
.mt { font-size: 30rpx; font-weight: 700; color: $ink; }
.ms { font-size: 24rpx; color: $muted; margin-top: 6rpx; }
.marw { color: $faint; font-size: 40rpx; }
.empty { background: $card; border-radius: 20rpx; padding: 40rpx; color: $muted; font-size: 26rpx; line-height: 1.6; text-align: center; }
.jlink { display: flex; align-items: center; gap: 16rpx; margin: 32rpx 32rpx 0; background: $night-1; border-radius: 22rpx; padding: 26rpx 28rpx; }
.jli { font-size: 32rpx; } .jlt { flex: 1; color: #fff; font-size: 26rpx; font-weight: 700; } .jlarw { color: $green; font-size: 32rpx; font-weight: 800; }

/* ---- 年度回忆故事线 ---- */
.story { width: 100vw; height: 100vh; }
.page { width: 100%; height: 100%; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 200rpx 56rpx 120rpx; box-sizing: border-box; color: #fff; }
.p-0 { background: linear-gradient(160deg, #0e1b24, #123a57); }
.p-1 { background: linear-gradient(160deg, #0a5c86, #0e1b24); }
.p-2 { background: linear-gradient(160deg, #123a57, #0ba968); }
.p-3 { background: linear-gradient(160deg, #1b2a3a, #6a3fb0); }
.ctag { position: relative; font-size: 26rpx; letter-spacing: 4rpx; opacity: .8; }
.cmid { position: relative; flex: 1; display: flex; flex-direction: column; justify-content: center; }
.ctitle { font-size: 44rpx; font-weight: 800; line-height: 1.4; }
.cbig { font-size: 128rpx; font-weight: 900; color: #12d07a; margin: 24rpx 0 4rpx; line-height: 1.1; }
.cbiglabel { font-size: 28rpx; opacity: .85; }
.cbody { font-size: 30rpx; line-height: 1.7; opacity: .92; margin-top: 32rpx; }
.chint { position: relative; text-align: center; font-size: 24rpx; opacity: .7; }
.story-top { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: space-between;
    padding-left: 32rpx; padding-right: 32rpx; padding-bottom: 12rpx; }
.sback { color: #fff; font-size: 30rpx; }
.sprog { color: rgba(255,255,255,.85); font-size: 26rpx; }

.safe-bottom { height: 60rpx; }
</style>
