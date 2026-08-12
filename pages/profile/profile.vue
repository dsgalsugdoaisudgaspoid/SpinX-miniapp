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
                            <text class="rb core" @tap="goAssessment">骑游等级 · {{ tierIcon }} {{ profile.memberTierName || '星星' }} ›</text>
                            <view v-if="primaryTitle" @tap="goTitles"><title-badge :title="primaryTitle" size="sm"></title-badge></view>
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
                <view class="arc" @tap="goMyActivities"><text class="an mono">{{ archive.totalActivities || 0 }}</text><text class="al">参与活动</text></view>
                <view class="arc" @tap="goRanking"><text class="an mono">{{ archive.totalDistance || 0 }}</text><text class="al">骑行 km</text></view>
                <view class="arc" @tap="goRanking"><text class="an mono">#{{ rank }}</text><text class="al">月度排名</text></view>
            </view>

            <!-- 骑游等级说明卡 -->
            <view class="tiercard" @tap="goAssessment">
                <view class="tchd">
                    <text class="tclabel">骑游等级</text>
                    <text class="tcnow">{{ tierIcon }} {{ profile.memberTierName || '星星' }}</text>
                    <text class="tcgo">考核升级 ›</text>
                </view>
                <view class="ladder">
                    <block v-for="(t, i) in tiers" :key="t.key">
                        <view :class="['lstep', reached(t.key) ? 'reached' : '', t.key === curTierKey ? 'on' : '']">
                            <text class="lsi">{{ t.icon }}</text>
                            <text class="lsn">{{ t.name }}</text>
                        </view>
                        <text v-if="i < tiers.length - 1" :class="['larw', reached(tiers[i+1].key) ? 'reached' : '']">→</text>
                    </block>
                </view>
                <text class="tcdesc">{{ tierDesc }}</text>
            </view>

            <!-- 身份与记忆：本次改造的核心资产，视觉权重高于下面的更多服务 -->
            <view class="idsec">
                <text class="idtitle">身份与记忆</text>
                <view class="idgrid">
                    <view class="id2" @tap="goAchievements"><text class="idi">🏆</text><text class="idt">我的成就</text></view>
                    <view class="id2" @tap="goTitles"><text class="idi">🏷</text><text class="idt">我的称号</text></view>
                    <view class="id2" @tap="goJournal"><text class="idi">📔</text><text class="idt">骑行日记</text></view>
                </view>
                <view class="mates" v-if="coRiders.length">
                    <text class="matest">🤝 我的骑行伙伴</text>
                    <view class="matelist">
                        <view v-for="m in coRiders" :key="m.userId" class="mate">
                            <view class="mav" :style="{ backgroundImage: m.avatar ? ('url(' + m.avatar + ')') : '' }"></view>
                            <text class="man ellipsis">{{ m.nickname }}</text>
                            <text class="mac mono">{{ m.rideCount }} 次</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 九宫格入口 -->
            <view class="grid">
                <view class="g6" @tap="goMyActivities"><text class="gi">🗓</text><text class="gt">我的活动</text></view>
                <view class="g6" @tap="goAgreements"><text class="gi">📝</text><text class="gt">我的协议</text></view>
                <view class="g6" @tap="goOrders"><text class="gi">🧾</text><text class="gt">我的订单</text></view>
                <view class="g6" @tap="goExchangeRecords"><text class="gi">🎁</text><text class="gt">我的兑换</text></view>
                <view class="g6" @tap="goAlbums"><text class="gi">📸</text><text class="gt">活动影像</text></view>
                <view class="g6" @tap="goPoints"><text class="gi">⭐</text><text class="gt">积分中心</text></view>
                <view class="g6" @tap="goMsg"><text class="gi">🔔</text><text class="gt">消息通知</text><text v-if="unread>0" class="dot">{{ unread }}</text></view>
            </view>

            <!-- 更多服务 -->
            <view class="more-srv">
                <view class="mrow" @tap="goMilestone"><text class="mi">🏅</text><text class="mt2 lead">骑行纪念碑 · 年度回忆</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goCredit"><text class="mi">🎖</text><text class="mt2 lead">我的信誉分</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goSafety"><text class="mi">🚑</text><text class="mt2 lead">安全档案 · 紧急联系人</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goInsurance"><text class="mi">🛡</text><text class="mt2 lead">我的保单 · 骑行意外险</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goAssessment"><text class="mi">🎯</text><text class="mt2 lead">考核赛段 · 冲刺月亮 / 太阳</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goLottery"><text class="mi">🎁</text><text class="mt2 lead">幸运抽奖 · 积分换好礼</text><text class="marw">›</text></view>
                <view v-if="showCoach" class="mrow" @tap="goCoachCenter"><text class="mi">🚴‍♂️</text><text class="mt2 lead">陪练中心 · 找陪练 / 成为陪练</text><text class="marw">›</text></view>
                <view v-if="showCoach" class="mrow" @tap="goCoachOrders"><text class="mi">📋</text><text class="mt2">我的陪练预约</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goMyPosts"><text class="mi">✍️</text><text class="mt2">我的动态</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goContent"><text class="mi">🗺</text><text class="mt2">骑行攻略 / 科普专栏</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goFeedback"><text class="mi">📮</text><text class="mt2">反馈投诉</text><text class="marw">›</text></view>
                <view class="mrow" @tap="goAbout"><text class="mi">ℹ️</text><text class="mt2">俱乐部介绍</text><text class="marw">›</text></view>
                <view v-if="isLeaderRole" class="mrow" @tap="goCreate"><text class="mi">🚩</text><text class="mt2 lead">发起活动（领队）</text><text class="marw">›</text></view>
                <view v-if="isAdmin" class="mrow" @tap="goRaffleAdmin"><text class="mi">🎁</text><text class="mt2 lead">发布公共抽奖（管理员）</text><text class="marw">›</text></view>
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

            <!-- 本地测试：一键切换体验角色（仅连本地 mock 服务时出现，真机连正式域名自动隐藏） -->
            <view v-if="isLocalDev" class="devbox">
                <text class="devt">🧪 本地测试 · 切换角色</text>
                <text class="devs">当前：{{ profile.nickname || '—' }}{{ roleLabels.length ? '（' + roleLabels.join(' ') + '）' : '' }}</text>
                <view class="devgrid">
                    <view v-for="a in demos" :key="a.code" :class="['devrole', profile.nickname === a.desc.split(' · ')[0] ? 'on' : '']" :data-code="a.code" @tap="switchRole">
                        <text class="drl">{{ a.label }}</text>
                        <text class="drd">{{ a.desc }}</text>
                    </view>
                </view>
            </view>

            <view class="logout" @tap="doLogout">退出登录</view>
        </template>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getProfile, ridingArchive, myAgreements, unreadCount } from '@/api/user.js'
import { logout, wxLogin } from '@/api/auth.js'
import { getMyTitles, getCoRiders } from '@/api/identity.js'
import { isLoggedIn, hasRole } from '@/store/user.js'
import { statusBarHeight } from '@/common/util.js'
import { FEATURES, tierOf, MEMBER_TIERS, BASE_URL, DEMO_ACCOUNTS } from '@/common/config.js'
import TitleBadge from '@/components/title-badge/title-badge.vue'

export default {
    components: { TitleBadge },
    data() {
        return { showCoach: FEATURES.coach, tiers: MEMBER_TIERS, statusBar: 20, loggedIn: false, profile: {}, archive: {}, agreements: [], unread: 0, primaryTitle: null, coRiders: [], // 判断是否连的是开发环境后端：localhost（模拟器联调）或局域网 IP（真机调试，如 192.168.x.x）。
                // 真正的安全边界在后端——mock 登录仅在 spinx.wechat.mock-enabled=true 时可用，且生产环境
                // 启动校验会强制禁止该开关为 true，这里放宽只是让真机调试也能看到这个测试用的切换角色入口。
                isLocalDev: /localhost|127\.0\.0\.1|^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(BASE_URL), demos: DEMO_ACCOUNTS }
    },
    computed: {
        roleLabels() {
            const map = { leader: '🚴 领队', photographer: '📸 摄影师', ambassador: '📣 城市小小宣传官', admin: '⚙️ 管理员' }
            const roles = (this.profile.roles || []).filter(r => r !== 'member')
            return roles.map(r => map[r]).filter(Boolean)
        },
        tierIcon() { return tierOf(this.profile.memberTier).icon },
        curTierKey() { return this.profile.memberTier || 'star' },
        tierDesc() {
            const idx = MEMBER_TIERS.findIndex(t => t.key === this.curTierKey)
            const next = MEMBER_TIERS[idx + 1]
            if (!next) return '你已达最高骑游等级 ☀️太阳 —— 环星核心骑手！'
            return `骑游等级随考核成长：新成员为「星星」，通过「考核赛段」在限时内完成骑行即可升级。当前${MEMBER_TIERS[idx].name}，下一级 ${next.icon}${next.name}。`
        },
        rank() { return (this.profile.stats && this.profile.stats.rank) || '—' },
        isLeaderRole() { return hasRole('leader') || hasRole('admin') },
        isAdmin() { return hasRole('admin') }
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
            try {
                const d = await getMyTitles()
                const active = (d && d.active) || []
                this.primaryTitle = active.find(t => t.titleId === d.primaryTitleId) || active[0] || null
            } catch (e) {}
            try { const d = await getCoRiders(); this.coRiders = (d && d.list) || [] } catch (e) {}
        },
        goAchievements() { uni.navigateTo({ url: '/pages/achievement/list' }) },
        goTitles() { uni.navigateTo({ url: '/pages/identity/titles' }) },
        goJournal() { uni.navigateTo({ url: '/pages/journal/list' }) },
        goLogin() { uni.navigateTo({ url: '/pages/login/login' }) },
        goSettings() { uni.navigateTo({ url: '/pages/settings/settings' }) },
        goPoints() { uni.navigateTo({ url: '/pages/points/points' }) },
        goMsg() { uni.switchTab({ url: '/pages/message/message' }) },
        goMyActivities() { uni.navigateTo({ url: '/pages/activity/mine' }) },
        goAgreements() { uni.navigateTo({ url: '/pages/agreement/my' }) },
        goExchangeRecords() { uni.navigateTo({ url: '/pages/exchange/records' }) },
        goOrders() { uni.navigateTo({ url: '/pages/order/list' }) },
        goAlbums() { uni.navigateTo({ url: '/pages/album/list' }) },
        goMyPosts() { uni.navigateTo({ url: '/pages/posts/list?mine=1' }) },
        goContent() { uni.navigateTo({ url: '/pages/content/list' }) },
        goFeedback() { uni.navigateTo({ url: '/pages/feedback/feedback' }) },
        goAbout() { uni.navigateTo({ url: '/pages/club/about' }) },
        goCreate() { uni.navigateTo({ url: '/pages/leader/create' }) },
        goCoachCenter() { uni.navigateTo({ url: '/pages/coach/profile' }) },
        goCoachOrders() { uni.navigateTo({ url: '/pages/coach/orders' }) },
        goSafety() { uni.navigateTo({ url: '/pages/safety/profile' }) },
        goCredit() { uni.navigateTo({ url: '/pages/credit/credit' }) },
        goMilestone() { uni.navigateTo({ url: '/pages/milestone/monument' }) },
        goInsurance() { uni.navigateTo({ url: '/pages/insurance/policies' }) },
        goAssessment() { uni.navigateTo({ url: '/pages/assessment/list' }) },
        goLottery() { uni.navigateTo({ url: '/pages/lottery/lottery' }) },
        goRaffleAdmin() { uni.navigateTo({ url: '/pages/admin/raffle-edit' }) },
        goRanking() { uni.navigateTo({ url: '/pages/ranking/ranking' }) },
        reached(key) {
            const ci = MEMBER_TIERS.findIndex(t => t.key === this.curTierKey)
            const ki = MEMBER_TIERS.findIndex(t => t.key === key)
            return ki <= ci
        },
        // 本地测试：切换体验角色（复用体验账号登录，切换后重新拉取本页数据）
        async switchRole(e) {
            const code = e.currentTarget.dataset.code
            try {
                await wxLogin({ code })
                this.loggedIn = isLoggedIn()
                await this.loadAll()
                uni.showToast({ title: '已切换角色', icon: 'success' })
            } catch (err) {}
        },
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

/* 骑游等级说明卡 */
.tiercard { margin: 20rpx 28rpx 0; background: $card; border-radius: 26rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.tchd { display: flex; align-items: baseline; gap: 12rpx; }
.tclabel { font-size: 24rpx; font-weight: 800; }
.tcnow { font-size: 26rpx; font-weight: 800; color: $green-deep; }
.tcgo { margin-left: auto; font-size: 22rpx; font-weight: 700; color: $muted; }
.ladder { display: flex; align-items: center; gap: 10rpx; margin-top: 20rpx; }
.lstep { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6rpx; padding: 16rpx 0; border-radius: 18rpx; background: $paper; opacity: .45; }
.lstep.reached { opacity: 1; }
.lstep.on { background: $green-soft; box-shadow: inset 0 0 0 2rpx $green; opacity: 1; }
.lsi { font-size: 40rpx; }
.lsn { font-size: 20rpx; font-weight: 800; }
.larw { color: $faint; font-size: 26rpx; font-weight: 800; flex: none; }
.larw.reached { color: $green-deep; }
.tcdesc { display: block; font-size: 21rpx; color: $muted; line-height: 1.7; margin-top: 18rpx; }

/* 身份与记忆 */
.idsec { margin: 20rpx 28rpx 0; background: $card; border-radius: 26rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.idtitle { display: block; font-size: 26rpx; font-weight: 800; }
.idgrid { display: grid; grid-template-columns: repeat(3, 1fr); grid-gap: 16rpx; gap: 16rpx; margin-top: 18rpx; }
.id2 { background: $paper; border-radius: 20rpx; padding: 24rpx 0; text-align: center; }
.idi { font-size: 40rpx; }
.idt { display: block; font-size: 22rpx; font-weight: 700; margin-top: 10rpx; }
.mates { margin-top: 24rpx; padding-top: 24rpx; border-top: 1rpx solid $hair; }
.matest { display: block; font-size: 24rpx; font-weight: 800; }
.matelist { display: flex; gap: 22rpx; margin-top: 18rpx; overflow-x: auto; }
.mate { flex: none; width: 108rpx; display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.mav { width: 80rpx; height: 80rpx; border-radius: 50%; background-color: #dfe8e4; background-size: cover; background-position: center;
    background-image: linear-gradient(140deg, #5ecb8f, #0ba968); }
.man { max-width: 100%; font-size: 20rpx; font-weight: 700; color: $ink-2; }
.mac { font-size: 18rpx; color: $muted; }

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
.devbox { margin: 24rpx 28rpx 0; background: #fffaf0; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 2rpx #f5e3bd; }
.devt { display: block; font-size: 25rpx; font-weight: 800; color: #a06a08; }
.devs { display: block; font-size: 21rpx; color: #b5893a; margin-top: 8rpx; }
.devgrid { display: flex; flex-wrap: wrap; gap: 14rpx; margin-top: 18rpx; }
.devrole { width: calc(50% - 7rpx); box-sizing: border-box; background: $card; border-radius: 18rpx; padding: 18rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.devrole.on { box-shadow: inset 0 0 0 2rpx $green; background: $green-soft; }
.drl { display: block; font-size: 26rpx; font-weight: 800; color: $ink; }
.drd { display: block; font-size: 20rpx; color: $muted; margin-top: 6rpx; }

.logout { margin: 24rpx 28rpx 0; text-align: center; color: $muted; font-size: 25rpx; background: $card; border-radius: 24rpx; padding: 28rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.safe-bottom { height: 60rpx; }
</style>
