<template>
    <view class="home">
        <!-- 顶部：状态栏占位 + 城市 + 搜索（右侧留白给微信胶囊） -->
        <view class="topbg" :style="{ paddingTop: statusBar + 'px' }">
            <view class="topbar">
                <view class="city" @tap="pickCity">
                    <text class="cname">{{ city }}</text><text class="caret">▾</text>
                </view>
                <view class="search" @tap="goSearch">
                    <view class="mag"></view>
                    <text class="ph">搜索路线，活动…</text>
                </view>
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
                <view class="hero b" @tap="goList()">
                    <text class="eye">LEADERS · 领队</text>
                    <text class="vol mono">02</text>
                    <text class="ht">领队宇宙</text>
                    <text class="hp">认识带你上路的人</text>
                </view>
            </view>

            <!-- 分类 chips -->
            <scroll-view scroll-x class="chips" show-scrollbar="false">
                <view v-for="t in tags" :key="t.key"
                    :class="['chip', activeTag === t.key ? 'on' : '']" @tap="switchTag(t.key)">
                    <text v-if="t.icon" class="cic">{{ t.icon }}</text>{{ t.name }}
                </view>
            </scroll-view>

            <!-- 榜单 + 任务 -->
            <view class="strip">
                <view class="mini" @tap="goPoints">
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

            <!-- 排序筛选 -->
            <view class="sortbar">
                <view class="sl"><text class="s1">迎风出发</text><text class="s2">，把自由踩出来</text></view>
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
    </view>
</template>

<script>
import { getHome } from '@/api/home.js'
import { listActivities } from '@/api/activity.js'
import { statusBarHeight, fmtTime, stars, fmtFee } from '@/common/util.js'

export default {
    data() {
        return {
            statusBar: 20,
            city: '成都',
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
            mission: { title: '本月累计骑行 3 次 · +100', progress: 2, total: 3 }
        }
    },
    computed: {
        missionPct() {
            const t = this.mission.total || 1
            return Math.min(100, Math.round((this.mission.progress / t) * 100))
        },
        sortLabel() { return this.sort === 'time' ? '最近开始' : '最热门' }
    },
    onLoad() {
        this.statusBar = statusBarHeight()
        this.loadHome()
        this.loadList()
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
                const d = await listActivities({ status: 'upcoming', tag: this.activeTag || undefined, pageSize: 10, page: 1 })
                this.list = (d && d.list) || []
            } catch (e) { this.list = [] } finally { this.loading = false }
        },
        switchTag(key) { if (this.activeTag === key) return; this.activeTag = key; this.loadList() },
        toggleSort() { this.sort = this.sort === 'time' ? 'hot' : 'time' },
        goDetail(id) { uni.navigateTo({ url: '/pages/activity/detail?id=' + id }) },
        goList(tag) { uni.switchTab({ url: '/pages/activity/list' }) },
        goPoints() { uni.navigateTo({ url: '/pages/points/points' }) },
        goSearch() { uni.switchTab({ url: '/pages/activity/list' }) },
        pickCity() { uni.showToast({ title: '仅开放成都', icon: 'none' }) }
    }
}
</script>

<style lang="scss" scoped>
.home { height: 100vh; display: flex; flex-direction: column; }
.topbg { background: linear-gradient(180deg, #e7f6ee, $paper); }
.topbar { display: flex; align-items: center; gap: 16rpx; padding: 12rpx 24rpx 20rpx 30rpx; padding-right: 200rpx; }
.city { display: flex; align-items: center; gap: 4rpx; }
.cname { font-size: 34rpx; font-weight: 800; color: $ink; }
.caret { font-size: 20rpx; color: $muted; }
.search { flex: 1; height: 72rpx; border-radius: 40rpx; background: $card; display: flex; align-items: center; gap: 14rpx;
    padding: 0 26rpx; box-shadow: inset 0 0 0 1rpx $line; }
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
</style>
