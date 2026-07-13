<template>
    <view class="detail" v-if="act">
        <!-- 自定义导航 -->
        <view class="nav" :style="{ paddingTop: statusBar + 'px' }">
            <view class="nbtn" @tap="back">‹</view>
            <text class="ntitle ellipsis">{{ act.title }}</text>
        </view>

        <scroll-view scroll-y class="scroll">
            <!-- 夜色封面 -->
            <view class="cover" :style="{ paddingTop: (statusBar + 44) + 'px' }">
                <view class="grain"></view>
                <view class="cmeta">
                    <text class="cvol">骑行 vol.113</text>
                    <text class="cline">{{ range }} · 费用 {{ feeStr }}（含保险）</text>
                </view>
                <text class="cbike">🚴</text>
                <view class="dots"><view class="dot on"></view><view class="dot"></view><view class="dot"></view></view>
            </view>

            <view class="sheet">
                <text class="title">🚴 {{ act.title }}</text>
                <view class="subline">
                    <text class="badge-ins">🛡 意外保障</text>
                    <text class="tg ellipsis flex1">{{ subtitle }}</text>
                </view>

                <!-- 信息卡 -->
                <view class="infocard">
                    <view class="irow">
                        <text class="iic">🕘</text>
                        <view><text class="ik">活动时间</text><text class="iv">{{ range }}</text></view>
                    </view>
                    <view class="irow bt">
                        <text class="iic">📍</text>
                        <view class="flex1">
                            <text class="ik">集合地点 · {{ act.meetingPoint ? '' : '' }}距你 3.2km</text>
                            <text class="iv">{{ act.meetingPoint }}</text>
                            <map v-if="hasGeo" class="map" :latitude="lat" :longitude="lng" :markers="markers" :scale="15"></map>
                        </view>
                    </view>
                    <view class="irow bt">
                        <text class="iic">👥</text>
                        <view class="flex1">
                            <text class="ik">{{ act.maxParticipants }} 人一起 · {{ act.currentParticipants }}/{{ act.maxParticipants }} 已报名</text>
                            <view class="people">
                                <view v-for="i in avatarCount" :key="i" class="pav" :style="{ background: gradAt(i-1), marginLeft: i>1 ? '-18rpx' : 0, zIndex: 9-i }"></view>
                                <text class="pcnt">{{ leftText }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 参与更安心 -->
                <text class="sec">参与更安心</text>
                <view class="safe3">
                    <view class="safe s1"><text class="st">💰 费用包含</text><text class="sp">{{ act.feeDescription || '领队服务、摄影跟拍、保障车' }}</text></view>
                    <view class="safe s2"><text class="st">↩ 退款政策</text><text class="sp">开始前 24h 全额退，超时协商</text></view>
                    <view class="safe s3"><text class="st">🛡 意外保障</text><text class="sp">每场含骑行意外险，出行更安心</text></view>
                </view>

                <!-- 积分提示 -->
                <view class="ptip" v-if="act.userPoints">
                    <text>🎯 全程参与可得</text>
                    <text class="pv mono">+{{ (act.userPoints.basePoints||0) + (act.userPoints.fullAttendanceBonus||0) }}</text>
                    <text>积分（基础 {{ act.userPoints.basePoints }} + 全勤 {{ act.userPoints.fullAttendanceBonus }}）</text>
                </view>

                <!-- 本场怎么玩 -->
                <text class="sec">本场怎么玩 · 领队阵容</text>
                <view class="howto" v-if="act.leader">
                    <view class="role">
                        <text class="rk">主领队</text>
                        <text class="who">@{{ act.leader.nickname }}</text>
                        <text class="rchip lead">领队</text>
                    </view>
                    <view class="role" v-for="c in (act.coLeaders||[])" :key="c.userId">
                        <text class="rk">副领队</text>
                        <text class="who">@{{ c.nickname }}</text>
                        <text class="rchip">签到 · 名单</text>
                    </view>
                </view>
                <text class="desc" v-if="act.description">{{ act.description }}</text>

                <view class="risk" v-if="act.riskNotice">
                    <text class="ri">⚠️</text><text class="rt">{{ act.riskNotice }}</text>
                </view>

                <view v-if="isLeader" class="leadentry" @tap="goManage">
                    <text class="le-i">👥</text>
                    <view class="le-t"><text class="le-t1">报名管理</text><text class="le-t2">审核 · 签到 · 一键发分</text></view>
                    <text class="le-arw">›</text>
                </view>

                <view class="safe-bottom"></view>
            </view>
        </scroll-view>

        <!-- 底部 CTA -->
        <view class="cta" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <view class="qa" @tap="share"><text class="qi">↗</text><text>分享</text></view>
            <view :class="['go', ctaDisabled ? 'off' : '']" @tap="onCta">
                <text class="gt">{{ ctaText }}</text>
                <text v-if="!ctaDisabled && !act.isAgreementSigned" class="gs">需签署《骑行安全知情同意书》</text>
            </view>
        </view>
    </view>
</template>

<script>
import { getActivity, registerActivity, shareActivity } from '@/api/activity.js'
import { statusBarHeight, fmtRange, fmtFee } from '@/common/util.js'
import { isLoggedIn, hasRole } from '@/store/user.js'

export default {
    data() {
        return { statusBar: 20, safeBottom: 0, id: null, act: null, registering: false }
    },
    computed: {
        range() { return this.act ? fmtRange(this.act.startTime, this.act.endTime) : '' },
        feeStr() { return this.act ? fmtFee(this.act.fee) : '' },
        subtitle() { return this.act && this.act.tags ? this.act.tags.join(' · ') : '骑行' },
        hasGeo() { return this.act && this.act.meetingLatitude && this.act.meetingLongitude },
        lat() { return Number(this.act.meetingLatitude) },
        lng() { return Number(this.act.meetingLongitude) },
        markers() {
            if (!this.hasGeo) return []
            return [{ id: 1, latitude: this.lat, longitude: this.lng, width: 30, height: 30, callout: { content: '集合地点', display: 'ALWAYS', padding: 6, borderRadius: 6 } }]
        },
        isLeader() { return hasRole('leader') || hasRole('admin') },
        avatarCount() { return Math.min(5, this.act ? (this.act.currentParticipants || 0) : 0) || 1 },
        leftText() {
            if (!this.act) return ''
            const left = (this.act.maxParticipants || 0) - (this.act.currentParticipants || 0)
            return left > 0 ? `还差 ${left} 位` : '已满员'
        },
        ctaDisabled() {
            if (!this.act) return true
            const s = this.act.status
            return s === 'completed' || s === 'cancelled' || s === 'withdrawn' ||
                (!this.act.isRegistered && (this.act.currentParticipants >= this.act.maxParticipants))
        },
        ctaText() {
            if (!this.act) return ''
            const s = this.act.status
            if (s === 'completed') return '活动已结束'
            if (s === 'cancelled' || s === 'withdrawn') return '活动已取消'
            if (this.act.isRegistered) return '已报名 · 查看我的活动'
            if (this.act.currentParticipants >= this.act.maxParticipants) return '已满员'
            return `报名 ${this.feeStr}${this.act.fee > 0 ? '（含保险）' : ''}`
        }
    },
    onLoad(q) {
        this.statusBar = statusBarHeight()
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.id = q.id
    },
    // 用 onShow 而非 onLoad：报名→签约→返回、或登录返回后自动刷新报名状态/人数
    onShow() {
        if (this.id) this.load()
    },
    methods: {
        gradAt(i) {
            const g = ['linear-gradient(135deg,#ffd36e,#ff8f6e)', 'linear-gradient(135deg,#8fd3ff,#5e8bff)', 'linear-gradient(135deg,#b6f0c9,#5ecb8f)', 'linear-gradient(135deg,#c9b6ff,#8f6eff)', 'linear-gradient(135deg,#ffb6d1,#ff6f97)']
            return g[i % g.length]
        },
        async load() {
            try { this.act = await getActivity(this.id) } catch (e) {}
        },
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/home/home' }) },
        goManage() { uni.navigateTo({ url: '/pages/leader/manage?activityId=' + this.id }) },
        async onCta() {
            if (this.ctaDisabled) return
            if (this.act.isRegistered) { uni.navigateTo({ url: '/pages/profile/profile' }); return }
            if (!isLoggedIn()) { uni.navigateTo({ url: '/pages/login/login' }); return }
            if (this.registering) return
            this.registering = true
            try {
                const r = await registerActivity(this.id, { hasExperience: true })
                if (r && r.needSignAgreement && r.agreementId) {
                    uni.showToast({ title: '报名成功，请签署协议', icon: 'none' })
                    setTimeout(() => {
                        uni.navigateTo({ url: `/pages/agreement/sign?agreementId=${r.agreementId}&activityId=${this.id}` })
                    }, 600)
                } else {
                    uni.showToast({ title: '报名成功', icon: 'success' })
                    this.load()
                }
            } catch (e) {} finally { this.registering = false }
        },
        async share() {
            try { const r = await shareActivity(this.id, 'moments'); if (r && r.pointsGranted) uni.showToast({ title: `分享 +${r.points} 积分`, icon: 'none' }) } catch (e) {}
        }
    },
    // 转发（微信原生分享）
    onShareAppMessage() {
        return { title: this.act ? this.act.title : '环星骑行', path: '/pages/activity/detail?id=' + this.id }
    }
}
</script>

<style lang="scss" scoped>
.detail { height: 100vh; display: flex; flex-direction: column; background: $card; }
.nav { position: fixed; top: 0; left: 0; right: 0; z-index: 10; display: flex; align-items: center; gap: 16rpx; padding: 0 24rpx 12rpx; }
.nbtn { width: 64rpx; height: 64rpx; border-radius: 50%; background: rgba(255,255,255,.85); backdrop-filter: blur(10rpx);
    display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: $ink; }
.ntitle { flex: 1; font-size: 28rpx; font-weight: 700; color: $ink; opacity: 0; }

.scroll { flex: 1; }
.cover { height: 480rpx; position: relative; overflow: hidden; color: #fff;
    background: linear-gradient(165deg, #0c1a24 0%, #123a57 52%, #0a5c86 100%); display: flex; flex-direction: column; align-items: center; }
.grain { position: absolute; inset: 0; opacity: .8;
    background: radial-gradient(2rpx 2rpx at 24% 34%, #fff, transparent), radial-gradient(2rpx 2rpx at 66% 22%, #bfe9ff, transparent), radial-gradient(2rpx 2rpx at 82% 52%, #fff, transparent), radial-gradient(2rpx 2rpx at 44% 66%, #fff, transparent); }
.cmeta { position: relative; z-index: 1; text-align: center; margin-top: 20rpx; }
.cvol { display: block; font-size: 30rpx; font-weight: 700; }
.cline { display: block; font-size: 21rpx; opacity: .85; margin-top: 10rpx; }
.cbike { position: relative; z-index: 1; font-size: 150rpx; margin-top: 40rpx; filter: drop-shadow(0 0 30rpx rgba(111,208,255,.6)); }
.dots { position: absolute; bottom: 40rpx; display: flex; gap: 10rpx; }
.dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: rgba(255,255,255,.45); }
.dot.on { width: 32rpx; border-radius: 6rpx; background: $green; }

.sheet { position: relative; margin-top: -40rpx; background: $card; border-radius: 40rpx 40rpx 0 0; padding: 36rpx 30rpx 0; }
.title { font-size: 40rpx; font-weight: 800; line-height: 1.3; }
.subline { display: flex; align-items: center; gap: 14rpx; margin-top: 22rpx; }
.badge-ins { font-size: 21rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 8rpx 16rpx; border-radius: 14rpx; }
.tg { font-size: 24rpx; color: $ink-2; font-weight: 600; background: $paper; padding: 8rpx 16rpx; border-radius: 14rpx; }

.infocard { background: $paper; border-radius: 26rpx; padding: 26rpx; margin-top: 26rpx; }
.irow { display: flex; gap: 20rpx; align-items: flex-start; }
.irow.bt { margin-top: 24rpx; padding-top: 24rpx; border-top: 1rpx solid $line; }
.iic { font-size: 30rpx; width: 36rpx; }
.ik { display: block; font-size: 21rpx; color: $muted; font-weight: 700; }
.iv { display: block; font-size: 27rpx; font-weight: 700; margin-top: 6rpx; }
.map { width: 100%; height: 180rpx; border-radius: 20rpx; margin-top: 20rpx; }
.people { display: flex; align-items: center; margin-top: 18rpx; }
.pav { width: 64rpx; height: 64rpx; border-radius: 50%; border: 3rpx solid #fff; }
.pcnt { margin-left: 22rpx; font-size: 25rpx; font-weight: 800; }

.sec { display: block; font-size: 30rpx; font-weight: 800; margin: 32rpx 0 18rpx; }
.safe3 { display: flex; gap: 14rpx; }
.safe { flex: 1; border-radius: 22rpx; padding: 22rpx 18rpx; }
.safe.s1 { background: #fbf1e4; } .safe.s2 { background: #e9f1fb; } .safe.s3 { background: $green-soft; }
.st { display: block; font-size: 23rpx; font-weight: 800; }
.safe.s1 .st { color: #b5750c; } .safe.s2 .st { color: #2b6bb5; } .safe.s3 .st { color: $green-deep; }
.sp { display: block; font-size: 20rpx; line-height: 1.5; color: $ink-2; margin-top: 14rpx; }

.ptip { margin-top: 24rpx; background: $green-soft; border-radius: 20rpx; padding: 20rpx 24rpx; font-size: 23rpx; color: $green-deep; display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; }
.ptip .pv { font-weight: 800; font-size: 30rpx; }

.howto { display: flex; flex-direction: column; gap: 18rpx; }
.role { display: flex; align-items: center; gap: 16rpx; font-size: 25rpx; }
.rk { width: 110rpx; color: $muted; font-weight: 700; font-size: 22rpx; }
.who { font-weight: 700; flex: 1; }
.rchip { font-size: 19rpx; font-weight: 800; padding: 5rpx 14rpx; border-radius: 12rpx; background: $paper; color: $ink-2; }
.rchip.lead { background: $green-soft; color: $green-deep; }
.desc { display: block; margin-top: 18rpx; font-size: 24rpx; color: $ink-2; line-height: 1.7; }
.risk { margin-top: 24rpx; background: #fbf7e8; border-radius: 18rpx; padding: 20rpx; display: flex; gap: 12rpx; }
.ri { font-size: 26rpx; } .rt { flex: 1; font-size: 22rpx; color: #8a6d1a; line-height: 1.6; }
.leadentry { display: flex; align-items: center; gap: 16rpx; margin-top: 24rpx; background: $night-1; border-radius: 22rpx; padding: 24rpx; }
.le-i { font-size: 34rpx; }
.le-t { flex: 1; }
.le-t1 { display: block; color: #fff; font-size: 27rpx; font-weight: 800; }
.le-t2 { display: block; color: rgba(255,255,255,.6); font-size: 20rpx; margin-top: 4rpx; }
.le-arw { color: $green; font-size: 34rpx; font-weight: 800; }
.safe-bottom { height: 40rpx; }

.cta { display: flex; align-items: center; gap: 22rpx; padding: 18rpx 30rpx 0; border-top: 1rpx solid $hair; background: $card; }
.qa { display: flex; flex-direction: column; align-items: center; gap: 4rpx; font-size: 19rpx; color: $muted; font-weight: 600; }
.qa .qi { font-size: 34rpx; }
.go { flex: 1; height: 96rpx; border-radius: 30rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c;
    display: flex; flex-direction: column; align-items: center; justify-content: center; }
.go.off { background: #d7ddda; color: #8a968f; }
.go .gt { font-weight: 800; font-size: 30rpx; }
.go .gs { font-size: 19rpx; opacity: .8; margin-top: 2rpx; }
</style>
