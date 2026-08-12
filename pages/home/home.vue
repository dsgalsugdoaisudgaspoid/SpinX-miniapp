<template>
    <view class="home">
        <!-- 顶部：SpinX 品牌头（右侧留白给微信胶囊）+ 搜索 -->
        <view class="topbg" :style="{ paddingTop: statusBar + 'px' }">
            <view class="brandbar">
                <view class="lock" @tap="goAbout">
                    <image class="blogo" :src="brand.logo.wordmarkBlack" mode="aspectFit"></image>
                    <text class="bsub">环星骑行 · {{ city }}</text>
                </view>
            </view>
            <view class="searchrow">
                <view class="search" @tap="goSearch">
                    <view class="mag"></view>
                    <text class="ph">搜索路线，活动…</text>
                </view>
                <!-- 单城时不显示切换箭头（只有一座城，弹个单选列表很怪）；进驻第二座城后自动变成真选择器 -->
                <view class="city" @tap="pickCity">
                    <text class="cdot"></text><text class="cname">{{ city }}</text><text v-if="multiCity" class="caret">▾</text>
                </view>
            </view>
            <view class="slogan">
                <text class="sgen">{{ brand.taglineEn }}</text>
            </view>
        </view>

        <!-- 暂未进驻本地：不阻断浏览，但如实告知，并给出「切到最近的城」与「许愿入驻」两条出路 -->
        <view class="notyet" v-if="showNotYet">
            <view class="nyhd">
                <text class="nyi">📍</text>
                <view class="nytxt">
                    <text class="nyt">SpinX 还没进驻你所在的城市</text>
                    <text class="nys">当前浏览的是{{ city || '其它城市' }}的内容</text>
                </view>
                <text class="nyx" @tap="dismissNotYet">✕</text>
            </view>
            <view class="nybtns">
                <view class="nybtn ghost" v-if="nearest" @tap="switchToNearest">切换到{{ nearest.name }}</view>
                <view class="nybtn solid" @tap="wishCity">希望 SpinX 来我的城市</view>
            </view>
        </view>

        <scroll-view scroll-y class="scroll">
            <!-- 双 Hero -->
            <view class="heros">
                <view class="hero a" @tap="goList('夜骑')">
                    <view class="stars"></view>
                    <text class="eye">NIGHT RIDE · 夜骑日历</text>
                    <text class="vol mono">113</text>
                    <text class="ht">环星夜骑日历</text>
                    <text class="hp">每周三 · 五 日落发车</text>
                </view>
                <view class="hero b" @tap="goLeaders">
                    <text class="eye">LEADERS · 领队</text>
                    <text class="vol mono">03</text>
                    <text class="ht">领队宇宙</text>
                    <text class="hp">认识带你上路的人</text>
                </view>
            </view>

            <!-- 陪练入口（第一版隐藏，FEATURES.coach 控制） -->
            <view class="coachbar" v-if="showCoach">
                <view class="cbcard find" @tap="goCoach">
                    <text class="cbi">🚴‍♂️</text>
                    <view class="cbtxt"><text class="cbt">找陪练</text><text class="cbs">认证陪练 · 按等级付费</text></view>
                </view>
                <view class="cbcard be" @tap="goCoachApply">
                    <text class="cbi">⭐</text>
                    <view class="cbtxt"><text class="cbt">成为陪练</text><text class="cbs">考核定级 · 接单赚钱</text></view>
                </view>
            </view>

            <!-- 榜单 + 任务 -->
            <view class="strip">
                <view class="mini" @tap="goRanking">
                    <view class="mt"><text>本月骑行榜</text><text class="mono em">TOP</text></view>
                    <view class="rankrow">
                        <view v-for="(r, i) in ranks" :key="i" class="rav"
                            :style="{ background: gradAt(i), marginLeft: i ? '-14rpx' : 0, zIndex: 9 - i }"></view>
                        <text class="more">+528 骑友</text>
                    </view>
                </view>
                <view class="mini" @tap="goPoints">
                    <view class="mt"><text>月度任务</text><text class="mono em">{{ mission.progress }}/{{ mission.total }}</text></view>
                    <view class="bar"><view class="barfill" :style="{ width: missionPct + '%' }"></view></view>
                    <text class="goal">{{ mission.title }}</text>
                </view>
            </view>

            <!-- 城市记忆地图入口 -->
            <view class="memmap" @tap="goMemoryMap">
                <text class="ethosic">🗺</text>
                <view class="ethosb"><text class="ethosk">城市记忆</text><text class="ethost ellipsis">环星在{{ city }}点亮过的地方，都在这张图上</text></view>
                <text class="ethosarw">›</text>
            </view>

            <!-- 俱乐部理念入口 -->
            <view class="ethos" @tap="goPhilosophy">
                <text class="ethosic">🏝</text>
                <view class="ethosb"><text class="ethosk">俱乐部理念</text><text class="ethost ellipsis">和小伙伴一起，去发现世界更多未知的美好</text></view>
                <text class="ethosarw">›</text>
            </view>

            <!-- 动态广场入口 -->
            <view class="feedentry" @tap="goFeed">
                <text class="fei">✍️</text>
                <view class="feb"><text class="fek">动态广场</text><text class="fet">看看大家的骑行故事，也发一条</text></view>
                <text class="fearw">›</text>
            </view>

            <!-- 分类 chips：紧贴活动列表，和下面的排序/列表是同一个功能整体 -->
            <scroll-view scroll-x class="chips" show-scrollbar="false">
                <view v-for="t in tags" :key="t.key"
                    :class="['chip', activeTag === t.key ? 'on' : '']" @tap="switchTag(t.key)">
                    <text v-if="t.icon" class="cic">{{ t.icon }}</text>{{ t.name }}
                </view>
            </scroll-view>

            <!-- 排序筛选 -->
            <view class="sortbar">
                <view class="sl"><text class="s1">近期发车</text><text class="s2">· 环星带你上路</text></view>
                <text class="so" @tap="toggleSort">⇅ {{ sortLabel }}</text>
                <text class="so" @tap="goSearch">◔ 筛选</text>
            </view>

            <!-- 活动列表 -->
            <view class="acts">
                <view v-for="a in list" :key="a.activityId" class="act" @tap="goDetail(a.activityId)">
                    <view class="poster">
                        <text class="ptag">{{ (a.tags && a.tags[0]) || '骑行' }}</text>
                        <text class="pseat"><text class="mono">{{ a.currentParticipants }}</text>/{{ a.maxParticipants }} 已上车</text>
                    </view>
                    <view class="info">
                        <view class="drow">
                            <text class="dbig mono">{{ fmt(a.startTime).date }}</text>
                            <text class="dsm">{{ fmt(a.startTime).weekday }} · {{ fmt(a.startTime).time }}</text>
                        </view>
                        <text class="atitle ellipsis-2">{{ a.title }}</text>
                        <view class="loc">
                            <text>📍</text><text class="lname ellipsis flex1">{{ a.meetingPoint }}</text>
                        </view>
                        <view class="metas">
                            <text class="pill">{{ a.distance }}km</text>
                            <text class="pill">难度 {{ starStr(a.difficulty) }}</text>
                            <text :class="['pill', a.fee > 0 ? 'free' : 'free']">{{ feeStr(a.fee) }}</text>
                        </view>
                        <view class="lead">
                            <view class="lav"></view>
                            <text>领队 {{ a.leader ? a.leader.nickname : '—' }}</text>
                        </view>
                    </view>
                </view>

                <view v-if="!loading && list.length === 0" class="empty">
                    <text>该分类暂时没有活动，换个标签看看～</text>
                </view>
            </view>

            <view class="safe-bottom"></view>
        </scroll-view>

        <!-- 公共抽奖悬浮入口（管理员发布后出现） -->
        <view class="fab" v-if="activeRaffle" @tap="goPublicRaffle">
            <text class="fabi">🎁</text>
            <text class="fabt">参与抽奖</text>
            <text class="fabdot"></text>
        </view>

        <!-- 领队发起活动悬浮按钮（仅领队可见） -->
        <view v-if="isLeader" class="fab-add" :class="{ raised: activeRaffle }" @tap="goCreate">
            <text class="fab-add-i">＋</text>
        </view>

        <!-- 活动结束后打开小程序：一句话总结今天的骑行 -->
        <ride-review :show="reviewShow" :pending="reviewPending" @done="onReviewDone" @close="onReviewClose"></ride-review>
    </view>
</template>

<script>
import { getHome } from '@/api/home.js'
import { listActivities } from '@/api/activity.js'
import { activePublicRaffle } from '@/api/publicRaffle.js'
import { pendingReview } from '@/api/journal.js'
import { listCities, requestCity } from '@/api/city.js'
import { isLoggedIn, hasRole } from '@/store/user.js'
import { currentCity, currentCityCode, setCity, cachedCityList, cacheCityList, isManuallyChosen, markSwitchDeclined, isSwitchDeclined } from '@/store/city.js'
import { statusBarHeight, fmtTime, stars, fmtFee, detectCity, nearestCity } from '@/common/util.js'
import { FEATURES, BRAND } from '@/common/config.js'
import RideReview from '@/components/ride-review/ride-review.vue'

export default {
    components: { RideReview },
    data() {
        return {
            showCoach: FEATURES.coach,
            brand: BRAND,
            statusBar: 20,
            city: (currentCity() && currentCity().name) || BRAND.city,
            cities: cachedCityList(),
            notYetDismissed: false,
            outOfService: false,
            myCoords: null,
            nearest: null,
            reviewShow: false,
            reviewPending: {},
            reviewDismissed: [],
            tags: [
                { key: '', name: '骑行', icon: '🚴' },
                { key: '休闲骑', name: '休闲骑' },
                { key: '拉练', name: '拉练' },
                { key: '公益骑', name: '公益骑' },
                { key: '新手友好', name: '夜骑' },
                { key: '跨城骑', name: '跨城' }
            ],
            activeTag: '',
            sort: 'time',
            list: [],
            loading: false,
            ranks: [0, 1, 2],
            mission: { title: '本月累计骑行 3 次 · +100', progress: 2, total: 3 },
            activeRaffle: null,
            isLeader: false
        }
    },
    computed: {
        missionPct() {
            const t = this.mission.total || 1
            return Math.min(100, Math.round((this.mission.progress / t) * 100))
        },
        sortLabel() { return this.sort === 'time' ? '最近开始' : '最热门' },
        /** 只有一座城时隐藏切换入口——弹一个单选列表毫无意义。 */
        multiCity() { return this.cities.length >= 2 },
        showNotYet() { return this.outOfService && !this.notYetDismissed }
    },
    onLoad() {
        this.statusBar = statusBarHeight()
        // 定位判定放 onLoad 而非 App.onLaunch：冷启动即弹定位授权是小程序审核常见驳回点
        this.initCity()
        this.loadHome()
    },
    // loadList 放 onShow：切城后从别的 tab 回来要刷新，否则是上一个城市的脏数据
    onShow() {
        this.isLeader = hasRole('leader')
        this.loadList()
        this.loadActiveRaffle()
        this.checkPendingReview()
    },
    onPullDownRefresh() {
        Promise.all([this.loadHome(), this.loadList()]).finally(() => uni.stopPullDownRefresh())
    },
    methods: {
        fmt(iso) { return fmtTime(iso) },
        starStr(l) { return stars(l).slice(0, l || 0) || '★' },
        feeStr(f) { return fmtFee(f) },
        gradAt(i) {
            const g = ['linear-gradient(135deg,#ffd36e,#ff8f6e)', 'linear-gradient(135deg,#8fd3ff,#5e8bff)', 'linear-gradient(135deg,#b6f0c9,#5ecb8f)']
            return g[i % g.length]
        },
        async loadHome() {
            try {
                const d = await getHome()
                if (d && d.monthlyMission) {
                    this.mission = {
                        title: d.monthlyMission.title || this.mission.title,
                        progress: d.monthlyMission.progress ?? 0,
                        total: d.monthlyMission.total ?? 3
                    }
                }
                if (d && Array.isArray(d.monthlyRank) && d.monthlyRank.length) {
                    this.ranks = d.monthlyRank.slice(0, 3)
                }
            } catch (e) {}
        },
        async loadList() {
            this.loading = true
            try {
                const d = await listActivities({ status: 'upcoming', tag: this.activeTag || undefined, cityCode: currentCityCode(), pageSize: 10, page: 1 })
                this.list = (d && d.list) || []
            } catch (e) { this.list = [] } finally { this.loading = false }
        },

        // ---------------- 城市 ----------------

        /**
         * 冷启动确定当前城市：先拿城市目录（缓存优先，后台刷新），再按定位判定。
         * 定位优先——用户人在哪就看哪座城；但手动选过的城市不被静默覆盖（先询问）。
         */
        async initCity() {
            let cities = cachedCityList()
            try {
                const d = await listCities()
                if (d && Array.isArray(d.list) && d.list.length) { cities = d.list; cacheCityList(cities) }
            } catch (e) {}
            this.cities = cities || []
            if (!this.cities.length) return // 后端未配置城市：保持原样，不打扰用户

            const { city: detected, coords } = await detectCity(this.cities)
            this.myCoords = coords

            if (detected) {
                this.outOfService = false
                this.nearest = null
                const cur = currentCity()
                if (!cur) {
                    this.applyCity(detected, 'auto')          // 首次进入：静默采用定位结果
                } else if (cur.code !== detected.code) {
                    if (isManuallyChosen()) {
                        this.askSwitch(detected)             // 手动选过 → 先问再切，不擅自改
                    } else {
                        this.applyCity(detected, 'auto')     // 之前也是自动 → 静默跟随定位
                    }
                }
            } else if (coords) {
                // 拿到了定位，但不在任何运营城市服务范围内 → 才有资格说「还没进驻你所在的城市」
                this.outOfService = true
                const near = nearestCity(this.cities, coords)
                if (!currentCity() && near) {
                    // 还没有可用城市：先落到最近的城，保证有内容可看；横幅会如实告知这不是本地内容
                    this.applyCity(near, 'auto')
                }
                // 已经在最近的城市上时就不再提供「切换到该城」的按钮（否则是个无效操作）
                this.nearest = near && near.code !== currentCityCode() ? near : null
            } else {
                // 定位失败/被拒/开发者工具未设位置——我们并不知道用户在哪，
                // 此时断言「还没进驻你所在的城市」是错的。静默退回默认城市，不显示任何提示。
                this.outOfService = false
                this.nearest = null
                if (!currentCity() && this.cities.length) {
                    this.applyCity(this.cities[0], 'auto')
                }
            }
            this.syncCityName()
        },

        applyCity(city, source) {
            setCity(city, source)
            this.syncCityName()
            this.loadList()
        },

        syncCityName() {
            const c = currentCity()
            this.city = (c && c.name) || BRAND.city
        },

        askSwitch(detected) {
            if (isSwitchDeclined(detected.code)) return
            uni.showModal({
                title: '切换城市',
                content: `检测到你在${detected.name}，是否切换到${detected.name}的活动与骑行记忆？`,
                confirmText: '切换', cancelText: '不用',
                success: (m) => {
                    if (m.confirm) this.applyCity(detected, 'auto')
                    else markSwitchDeclined(detected.code)
                }
            })
        },

        pickCity() {
            if (!this.multiCity) {
                uni.showToast({ title: `SpinX 现已扎根${this.city}，更多城市即将上线`, icon: 'none' })
                return
            }
            const names = this.cities.map(c => c.name)
            uni.showActionSheet({
                itemList: names,
                success: (r) => {
                    const picked = this.cities[r.tapIndex]
                    if (picked && picked.code !== currentCityCode()) this.applyCity(picked, 'manual')
                }
            })
        },

        switchToNearest() {
            if (!this.nearest) return
            this.applyCity(this.nearest, 'manual')
            this.outOfService = false
            this.nearest = null
        },

        dismissNotYet() { this.notYetDismissed = true },

        /** 「希望 SpinX 来我的城市」：一键留下需求信号，城市名可选填。 */
        wishCity() {
            uni.showModal({
                title: '希望 SpinX 来我的城市',
                content: '留下你所在的城市，我们会优先考虑进驻需求高的地方',
                editable: true,
                placeholderText: '城市名（选填）',
                confirmText: '提交',
                success: async (m) => {
                    if (!m.confirm) return
                    try {
                        const d = await requestCity({
                            cityName: (m.content || '').trim() || undefined,
                            latitude: this.myCoords ? this.myCoords.latitude : undefined,
                            longitude: this.myCoords ? this.myCoords.longitude : undefined
                        })
                        uni.showToast({ title: d && d.duplicated ? '你的心愿已收到过啦' : '已收到，谢谢你的期待', icon: 'none' })
                        this.notYetDismissed = true
                    } catch (e) {}
                }
            })
        },
        switchTag(key) { if (this.activeTag === key) return; this.activeTag = key; this.loadList() },
        toggleSort() { this.sort = this.sort === 'time' ? 'hot' : 'time' },
        goDetail(id) { uni.navigateTo({ url: '/pages/activity/detail?id=' + id }) },
        goList(tag) { uni.switchTab({ url: '/pages/activity/list' }) },
        goLeaders() { uni.navigateTo({ url: '/pages/leader/list' }) },
        goPhilosophy() { uni.navigateTo({ url: '/pages/club/philosophy' }) },
        goMemoryMap() { uni.navigateTo({ url: '/pages/memory/map' }) },
        goFeed() { uni.navigateTo({ url: '/pages/posts/list' }) },
        async loadActiveRaffle() { try { this.activeRaffle = await activePublicRaffle() } catch (e) { this.activeRaffle = null } },
        goPublicRaffle() { if (this.activeRaffle) uni.navigateTo({ url: '/pages/public-raffle/detail?id=' + this.activeRaffle.raffleId }) },
        goCreate() { uni.navigateTo({ url: '/pages/leader/create' }) },
        // 打开小程序：若有参与过但没写收获的活动，弹出一句话总结（本次会话跳过的不再打扰）
        async checkPendingReview() {
            if (this.reviewShow || !isLoggedIn()) return
            try {
                const d = await pendingReview()
                const p = d && d.pending
                if (p && this.reviewDismissed.indexOf(p.entryId) === -1) { this.reviewPending = p; this.reviewShow = true }
            } catch (e) {}
        },
        onReviewDone() { this.reviewShow = false },
        onReviewClose() {
            if (this.reviewPending && this.reviewPending.entryId != null) this.reviewDismissed.push(this.reviewPending.entryId)
            this.reviewShow = false
        },
        goPoints() { uni.navigateTo({ url: '/pages/points/points' }) },
        goRanking() { uni.navigateTo({ url: '/pages/ranking/ranking' }) },
        goCoach() { uni.navigateTo({ url: '/pages/coach/list' }) },
        goCoachApply() { uni.navigateTo({ url: '/pages/coach/apply' }) },
        goSearch() { uni.switchTab({ url: '/pages/activity/list' }) },
        goAbout() { uni.navigateTo({ url: '/pages/club/about' }) }
    }
}
</script>

<style lang="scss" scoped>
.home { height: 100vh; display: flex; flex-direction: column; }
.topbg { background: linear-gradient(180deg, #dff3e9 0%, #eaf6f1 44%, $paper 100%); }

/* 品牌头：SpinX 官方字标 logo（右侧留白给微信胶囊） */
.brandbar { display: flex; align-items: center; padding: 14rpx 24rpx 4rpx 30rpx; padding-right: 200rpx; }
.lock { display: flex; flex-direction: column; align-items: flex-start; gap: 6rpx; }
.blogo { width: 240rpx; height: 38rpx; }
.bsub { font-size: 19rpx; font-weight: 700; color: $muted; letter-spacing: 2rpx; }

.searchrow { display: flex; align-items: center; gap: 14rpx; padding: 14rpx 24rpx 0 28rpx; }
.city { display: flex; align-items: center; gap: 6rpx; flex: none; padding: 0 20rpx; height: 72rpx; border-radius: 40rpx;
    background: $card; box-shadow: inset 0 0 0 1rpx $line; }
.cdot { width: 12rpx; height: 12rpx; border-radius: 50%; background: $green; }
.cname { font-size: 26rpx; font-weight: 800; color: $ink; }
.caret { font-size: 18rpx; color: $muted; }

/* 暂未进驻本地：如实告知但不阻断浏览 */
.notyet { margin: 0 24rpx 4rpx; background: #fffaf0; border-radius: 22rpx; padding: 22rpx 24rpx; box-shadow: inset 0 0 0 2rpx #f5e3bd; }
.nyhd { display: flex; align-items: flex-start; gap: 14rpx; }
.nyi { font-size: 30rpx; flex: none; }
.nytxt { flex: 1; min-width: 0; }
.nyt { display: block; font-size: 26rpx; font-weight: 800; color: #a06a08; }
.nys { display: block; font-size: 21rpx; color: #b5893a; margin-top: 6rpx; }
.nyx { flex: none; font-size: 26rpx; color: #c9a768; padding: 0 4rpx; }
.nybtns { display: flex; gap: 14rpx; margin-top: 18rpx; }
.nybtn { flex: 1; height: 72rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center;
    font-size: 24rpx; font-weight: 800; }
.nybtn.ghost { background: $card; color: $ink; box-shadow: inset 0 0 0 1rpx $hair; }
.nybtn.solid { background: linear-gradient(120deg, $green, $green-deep); color: #04140c; }
.search { flex: 1; height: 72rpx; border-radius: 40rpx; background: $card; display: flex; align-items: center; gap: 14rpx;
    padding: 0 26rpx; box-shadow: inset 0 0 0 1rpx $line; }

.slogan { padding: 16rpx 30rpx 20rpx; }
.sgen { font-size: 24rpx; color: $green-deep; font-weight: 800; font-style: italic; letter-spacing: 1rpx; }
.search .mag { width: 26rpx; height: 26rpx; border: 3rpx solid $muted; border-radius: 50%; position: relative; }
.search .mag::after { content: ''; position: absolute; width: 10rpx; height: 3rpx; background: $muted; right: -6rpx; bottom: 0; transform: rotate(45deg); }
.search .ph { color: $faint; font-size: 24rpx; }

.scroll { flex: 1; }

.heros { display: flex; gap: 18rpx; padding: 6rpx 24rpx 0; }
.hero { position: relative; border-radius: 28rpx; overflow: hidden; height: 300rpx; color: #fff;
    display: flex; flex-direction: column; justify-content: flex-end; padding: 24rpx; }
.hero.a { flex: 1.32; background: linear-gradient(150deg, #0e1b24, #123a57 60%, #0a5c86); }
.hero.b { flex: 1; background: linear-gradient(150deg, #123a2a, #0ba968 90%); }
.hero .stars { position: absolute; inset: 0; opacity: .7;
    background: radial-gradient(2rpx 2rpx at 22% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(2rpx 2rpx at 84% 46%, #fff, transparent); }
.hero .eye { position: absolute; top: 22rpx; left: 24rpx; font-size: 18rpx; letter-spacing: 2rpx; opacity: .9; }
.hero .vol { position: absolute; top: 44rpx; left: 24rpx; font-weight: 800; font-size: 62rpx; letter-spacing: -2rpx; }
.hero .ht { font-size: 32rpx; font-weight: 800; }
.hero .hp { font-size: 20rpx; opacity: .9; margin-top: 6rpx; }

.chips { white-space: nowrap; padding: 26rpx 24rpx 8rpx; }
.chip { display: inline-flex; align-items: center; height: 66rpx; padding: 0 26rpx; border-radius: 22rpx; margin-right: 16rpx;
    background: $card; box-shadow: inset 0 0 0 1rpx $line; font-size: 25rpx; font-weight: 600; color: $ink-2; }
.chip.on { background: $green; color: #04140c; box-shadow: none; font-weight: 800; }
.chip .cic { margin-right: 8rpx; font-size: 26rpx; }

.coachbar { display: flex; gap: 18rpx; padding: 20rpx 24rpx 0; }
.cbcard { flex: 1; display: flex; align-items: center; gap: 14rpx; border-radius: 24rpx; padding: 22rpx 20rpx; }
.cbcard.find { background: linear-gradient(120deg, #12d07a, #0ba968); }
.cbcard.be { background: linear-gradient(120deg, #123a57, #0a5c86); }
.cbi { font-size: 44rpx; }
.cbtxt { display: flex; flex-direction: column; }
.cbt { font-size: 28rpx; font-weight: 800; color: #fff; }
.cbcard.find .cbt { color: #04140c; }
.cbs { font-size: 18rpx; margin-top: 4rpx; color: rgba(255,255,255,.82); }
.cbcard.find .cbs { color: rgba(4,20,12,.7); }
.strip { display: flex; gap: 18rpx; padding: 12rpx 24rpx 0; }
.mini { flex: 1; background: $card; border-radius: 26rpx; padding: 22rpx 24rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.mt { display: flex; justify-content: space-between; align-items: center; font-size: 22rpx; color: $muted; font-weight: 700; }
.mt .em { color: $green-deep; font-weight: 800; }
.rankrow { display: flex; align-items: center; margin-top: 18rpx; }
.rav { width: 50rpx; height: 50rpx; border-radius: 50%; border: 3rpx solid #fff; }
.more { margin-left: 16rpx; font-size: 21rpx; color: $muted; }
.bar { height: 14rpx; border-radius: 8rpx; background: $hair; margin-top: 20rpx; overflow: hidden; }
.barfill { height: 100%; border-radius: 8rpx; background: linear-gradient(90deg, $green, $green-deep); }
.goal { display: block; font-size: 21rpx; margin-top: 14rpx; color: $ink-2; font-weight: 600; }

.ethos, .memmap { display: flex; align-items: center; gap: 18rpx; margin: 22rpx 24rpx 0; padding: 24rpx 26rpx; border-radius: 26rpx;
    background: linear-gradient(120deg, $night-1, $night-2 70%, $night-3); color: #fff; }
.memmap { background: linear-gradient(120deg, $night-2, $night-3 70%, #0d7ba8); }
.ethosic { font-size: 44rpx; flex: none; }
.ethosb { flex: 1; min-width: 0; }
.ethosk { display: block; font-size: 19rpx; letter-spacing: 2rpx; color: $green; font-weight: 800; }
.ethost { display: block; font-size: 26rpx; font-weight: 800; margin-top: 6rpx; }
.ethosarw { color: rgba(255,255,255,.6); font-size: 34rpx; font-weight: 800; flex: none; }

.feedentry { display: flex; align-items: center; gap: 16rpx; margin: 22rpx 24rpx 0; padding: 24rpx 26rpx; border-radius: 26rpx; background: $card; box-shadow: inset 0 0 0 1rpx $hair; }
.fei { font-size: 40rpx; flex: none; }
.feb { flex: 1; min-width: 0; }
.fek { display: block; font-size: 27rpx; font-weight: 800; }
.fet { display: block; font-size: 21rpx; color: $muted; margin-top: 6rpx; }
.fearw { color: $faint; font-size: 34rpx; flex: none; }

.sortbar { display: flex; align-items: center; gap: 24rpx; padding: 30rpx 26rpx 16rpx; }
.sl { margin-right: auto; }
.sl .s1 { color: $ink; font-weight: 800; font-size: 26rpx; }
.sl .s2 { color: $muted; font-size: 24rpx; }
.so { color: $ink-2; font-weight: 700; font-size: 25rpx; }

.acts { padding: 4rpx 24rpx 0; }
.act { display: flex; gap: 22rpx; background: $card; border-radius: 30rpx; padding: 20rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 20rpx; }
.poster { width: 208rpx; flex: none; border-radius: 22rpx; height: 264rpx; position: relative; overflow: hidden;
    background: linear-gradient(155deg, #0e1b24, #123a57, #0a5c86); display: flex; flex-direction: column; justify-content: space-between; padding: 16rpx; }
.ptag { align-self: flex-start; font-size: 18rpx; font-weight: 800; color: #fff; background: rgba(255,255,255,.18); padding: 4rpx 12rpx; border-radius: 10rpx; }
.pseat { color: #fff; font-size: 19rpx; text-align: center; opacity: .92; }
.info { flex: 1; min-width: 0; }
.drow { display: flex; align-items: baseline; gap: 12rpx; }
.dbig { font-weight: 800; font-size: 38rpx; letter-spacing: -1rpx; color: $ink; }
.dsm { font-size: 20rpx; color: $muted; }
.atitle { margin-top: 12rpx; font-size: 29rpx; font-weight: 800; line-height: 1.3; }
.ellipsis-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.loc { display: flex; align-items: center; gap: 8rpx; margin-top: 12rpx; font-size: 22rpx; color: $muted; }
.lname { color: $ink-2; }
.metas { display: flex; gap: 10rpx; margin-top: 16rpx; flex-wrap: wrap; }
.pill { font-size: 20rpx; font-weight: 700; padding: 5rpx 14rpx; border-radius: 12rpx; background: $paper; color: $ink-2; }
.pill.free { background: $green-soft; color: $green-deep; }
.lead { display: flex; align-items: center; gap: 10rpx; margin-top: 16rpx; font-size: 21rpx; color: $muted; }
.lav { width: 34rpx; height: 34rpx; border-radius: 50%; background: linear-gradient(135deg, #5ecb8f, #0ba968); }

.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 80rpx 0; }
.safe-bottom { height: 40rpx; }

/* 公共抽奖悬浮入口 */
.fab { position: fixed; right: 26rpx; bottom: 60rpx; z-index: 40; display: flex; align-items: center; gap: 8rpx;
    background: linear-gradient(120deg, #b5379e, #7a2e86); color: #fff; padding: 18rpx 28rpx; border-radius: 40rpx;
    box-shadow: 0 14rpx 30rpx -8rpx rgba(122,46,134,.7); }
.fabi { font-size: 34rpx; }
.fabt { font-size: 24rpx; font-weight: 800; }
.fabdot { position: absolute; top: 6rpx; right: 12rpx; width: 16rpx; height: 16rpx; border-radius: 50%; background: #ff5a5a; box-shadow: 0 0 0 4rpx rgba(255,90,90,.25); }
/* 领队发起活动悬浮按钮 */
.fab-add { position: fixed; right: 40rpx; bottom: 80rpx; z-index: 41; width: 108rpx; height: 108rpx; border-radius: 50%;
    background: linear-gradient(135deg, #12d07a, #0ba968); box-shadow: 0 14rpx 30rpx -8rpx rgba(11,169,104,.7);
    display: flex; align-items: center; justify-content: center; }
.fab-add.raised { bottom: 200rpx; }
.fab-add-i { color: #04140c; font-size: 60rpx; font-weight: 300; line-height: 1; }
</style>
