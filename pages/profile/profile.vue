<template>
    <view class="profile">
        <!-- 夜色头部 -->
        <view class="phead" :style="{ paddingTop: (statusBar + 12) + 'px' }">
            <view class="stars"></view>
            <block v-if="loggedIn">
                <view class="topset" @tap="goSettings">⚙</view>
                <view class="u">
                    <view class="ua"></view>
                    <view class="uinfo">
                        <text class="uname">{{ profile.nickname || '骑友' }}</text>
                        <text class="uno mono">会员编号 {{ profile.memberNo || '—' }}</text>
                        <view class="rbadges">
                            <text class="rb core">{{ profile.levelName || '入门骑行者' }}</text>
                            <text v-for="r in roleLabels" :key="r" class="rb">{{ r }}</text>
                        </view>
                    </view>
                </view>
            </block>
            <block v-else>
                <view class="guestbox">
                    <text class="gtitle">登录环星，解锁全部功能</text>
                    <text class="gsub">报名骑行 · 积分成长 · 合规签约</text>
                    <view class="g-btn glogin" @tap="goLogin">登录 / 注册</view>
                </view>
            </block>
        </view>

        <template v-if="loggedIn">
            <!-- 骑行档案 -->
            <view class="archive">
                <view class="arc"><text class="an mono">{{ archive.totalActivities || 0 }}</text><text class="al">参与活动</text></view>
                <view class="arc"><text class="an mono">{{ archive.totalDistance || 0 }}</text><text class="al">骑行 km</text></view>
                <view class="arc"><text class="an mono">{{ hours }}</text><text class="al">累计 h</text></view>
                <view class="arc"><text class="an mono">#{{ rank }}</text><text class="al">月度排名</text></view>
            </view>

            <!-- 九宫格入口 -->
            <view class="grid">
                <view class="g6" @tap="goMyActivities"><text class="gi">🗓</text><text class="gt">我的活动</text></view>
                <view class="g6" @tap="goAgreements"><text class="gi">📝</text><text class="gt">我的协议</text></view>
                <view class="g6" @tap="goExchangeRecords"><text class="gi">🎁</text><text class="gt">我的兑换</text></view>
                <view class="g6" @tap="goAlbums"><text class="gi">📸</text><text class="gt">活动影像</text></view>
                <view class="g6" @tap="goPoints"><text class="gi">⭐</text><text class="gt">积分中心</text></view>
                <view class="g6" @tap="goMsg"><text class="gi">🔔</text><text class="gt">消息通知</text><text v-if="unread>0" class="dot">{{ unread }}</text></view>
            </view>

            <!-- 更多服务 -->
            <view class="more-srv">
                <view class="mrow" @tap="goContent"><text class="mi">🗺</text><text class="mt2">骑行攻略 / 科普专栏</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goFeedback"><text class="mi">📮</text><text class="mt2">反馈投诉</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goAbout"><text class="mi">ℹ️</text><text class="mt2">俱乐部介绍</text><text class="marw">›</text></view>
                <view v-if="isLeaderRole" class="mrow" @tap="goCreate"><text class="mi">🚩</text><text class="mt2 lead">发起活动（领队）</text><text class="marw">›</text></view>
            </view>

            <!-- 合规档案 -->
            <view class="agree" id="agreements">
                <view class="ah"><text>📁 合规档案</text><text class="lock">🔒 加密存档</text></view>
                <view v-for="a in agreements" :key="a.archiveNo" class="arow">
                    <view class="doc">📄</view>
                    <view class="an2"><text class="at">{{ a.title }}</text><text class="asub mono">{{ a.archiveNo }} · {{ a.version }}</text></view>
                    <text class="st">已签署 ✓</text>
                </view>
                <view v-if="agreements.length === 0" class="aempty">暂无签约记录，报名活动时将引导签署</view>
            </view>

            <view class="logout" @tap="doLogout">退出登录</view>
        </template>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getProfile, ridingArchive, myAgreements, unreadCount } from '@/api/user.js'
import { logout } from '@/api/auth.js'
import { isLoggedIn, hasRole } from '@/store/user.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() {
        return { statusBar: 20, loggedIn: false, profile: {}, archive: {}, agreements: [], unread: 0 }
    },
    computed: {
        roleLabels() {
            const map = { leader: '🚴 领队', photographer: '📸 摄影师', admin: '⚙️ 管理员' }
            const roles = (this.profile.roles || []).filter(r => r !== 'member')
            return roles.map(r => map[r]).filter(Boolean)
        },
        hours() { return Math.round((this.archive.totalDuration || 0) / 60) },
        rank() { return (this.profile.stats && this.profile.stats.rank) || '—' },
        isLeaderRole() { return hasRole('leader') || hasRole('admin') }
    },
    onLoad() { this.statusBar = statusBarHeight() },
    onShow() {
        this.loggedIn = isLoggedIn()
        if (this.loggedIn) this.loadAll()
    },
    methods: {
        async loadAll() {
            try { this.profile = await getProfile() } catch (e) {}
            try { this.archive = await ridingArchive() } catch (e) {}
            try { const d = await myAgreements(); this.agreements = (d && d.list) || [] } catch (e) {}
            try { const d = await unreadCount(); this.unread = (d && d.count) || 0 } catch (e) {}
        },
        goLogin() { uni.navigateTo({ url: '/pages/login/login' }) },
        goSettings() { uni.navigateTo({ url: '/pages/settings/settings' }) },
        goPoints() { uni.navigateTo({ url: '/pages/points/points' }) },
        goMsg() { uni.switchTab({ url: '/pages/message/message' }) },
        goMyActivities() { uni.navigateTo({ url: '/pages/activity/list?mine=1' }) },
        goAgreements() { uni.navigateTo({ url: '/pages/agreement/my' }) },
        goExchangeRecords() { uni.navigateTo({ url: '/pages/exchange/records' }) },
        goAlbums() { uni.navigateTo({ url: '/pages/album/list' }) },
        goContent() { uni.navigateTo({ url: '/pages/content/list' }) },
        goFeedback() { uni.navigateTo({ url: '/pages/feedback/feedback' }) },
        goAbout() { uni.navigateTo({ url: '/pages/club/about' }) },
        goCreate() { uni.navigateTo({ url: '/pages/leader/create' }) },
        doLogout() {
            uni.showModal({
                title: '退出登录', content: '确定退出当前账号？', confirmColor: '#0ba968',
                success: async (r) => { if (r.confirm) { await logout('用户主动退出'); this.loggedIn = false; this.profile = {}; uni.showToast({ title: '已退出', icon: 'none' }) } }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.profile { min-height: 100vh; background: $paper; }
.phead { padding: 0 36rpx 60rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, #0e1b24, #123a57); }
.stars { position: absolute; inset: 0; opacity: .4;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 76% 24%, #bfe9ff, transparent), radial-gradient(2rpx 2rpx at 54% 14%, #fff, transparent); }
.u { position: relative; display: flex; align-items: center; gap: 24rpx; padding-top: 20rpx; }
.ua { width: 116rpx; height: 116rpx; border-radius: 34rpx; background: linear-gradient(140deg, #5ecb8f, #0ba968); box-shadow: 0 0 0 4rpx rgba(255,255,255,.25); }
.uname { font-size: 40rpx; font-weight: 800; }
.uno { display: block; font-size: 22rpx; opacity: .8; margin-top: 8rpx; }
.rbadges { display: flex; gap: 12rpx; margin-top: 16rpx; flex-wrap: wrap; }
.rb { font-size: 20rpx; font-weight: 800; padding: 6rpx 16rpx; border-radius: 14rpx; background: rgba(255,255,255,.16); }
.rb.core { background: $green; color: #04140c; }

.guestbox { position: relative; padding: 40rpx 0 10rpx; }
.gtitle { display: block; font-size: 36rpx; font-weight: 800; }
.gsub { display: block; font-size: 24rpx; opacity: .8; margin-top: 12rpx; }
.glogin { margin-top: 30rpx; }

.archive { display: flex; margin: -40rpx 28rpx 0; background: $card; border-radius: 30rpx; padding: 30rpx 10rpx;
    box-shadow: 0 20rpx 44rpx -18rpx rgba(9,20,15,.4); position: relative; z-index: 2; }
.arc { flex: 1; text-align: center; }
.an { display: block; font-weight: 800; font-size: 40rpx; letter-spacing: -1rpx; }
.al { display: block; font-size: 19rpx; color: $muted; margin-top: 6rpx; }

.grid { display: flex; flex-wrap: wrap; gap: 18rpx; margin: 26rpx 28rpx 0; }
.g6 { width: calc(33.33% - 12rpx); background: $card; border-radius: 26rpx; padding: 28rpx 0; text-align: center; box-shadow: inset 0 0 0 1rpx $hair; position: relative; }
.gi { font-size: 44rpx; } .gt { display: block; font-size: 22rpx; font-weight: 700; margin-top: 12rpx; }
.dot { position: absolute; top: 20rpx; right: 40rpx; min-width: 30rpx; height: 30rpx; padding: 0 8rpx; border-radius: 16rpx; background: $coral; color: #fff; font-size: 18rpx; font-weight: 800; line-height: 30rpx; }

.agree { margin: 26rpx 28rpx 0; background: $card; border-radius: 26rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.ah { display: flex; align-items: center; font-size: 27rpx; font-weight: 800; }
.ah .lock { margin-left: auto; font-size: 20rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 6rpx 16rpx; border-radius: 14rpx; }
.arow { display: flex; align-items: center; gap: 18rpx; margin-top: 22rpx; }
.doc { width: 60rpx; height: 60rpx; border-radius: 16rpx; background: $paper; display: flex; align-items: center; justify-content: center; font-size: 30rpx; }
.an2 { flex: 1; min-width: 0; }
.at { display: block; font-size: 25rpx; font-weight: 700; }
.asub { display: block; font-size: 19rpx; color: $muted; margin-top: 4rpx; }
.st { font-size: 21rpx; color: $green-deep; font-weight: 800; }
.aempty { color: $faint; font-size: 22rpx; text-align: center; padding: 24rpx 0 6rpx; }

.topset { position: absolute; top: 100rpx; right: 30rpx; z-index: 3; width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 32rpx; }
.more-srv { margin: 26rpx 28rpx 0; background: $card; border-radius: 26rpx; padding: 0 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.mrow { display: flex; align-items: center; gap: 18rpx; padding: 28rpx 0; border-bottom: 1rpx solid $hair; }
.mrow:last-child { border-bottom: 0; }
.mi { font-size: 34rpx; width: 44rpx; text-align: center; }
.mt2 { flex: 1; font-size: 27rpx; font-weight: 600; }
.mt2.lead { color: $green-deep; font-weight: 800; }
.marw { color: $faint; font-size: 30rpx; }
.logout { margin: 24rpx 28rpx 0; text-align: center; color: $muted; font-size: 25rpx; background: $card; border-radius: 24rpx; padding: 28rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.safe-bottom { height: 60rpx; }
</style>
