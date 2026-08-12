<template>
    <view class="mm">
        <!-- 夜空 hero -->
        <view class="head" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>
            <text class="eye">MEMORY MAP · 城市记忆</text>
            <text class="ht">环星在{{ cityName }}留下的地方</text>
            <text class="hp">每一个亮点，都是一条路线的终点</text>
            <view class="hstats">
                <view class="hs"><text class="hsn mono">{{ stats.places || 0 }}</text><text class="hsl">个地点</text></view>
                <view class="hs"><text class="hsn mono">{{ stats.routes || 0 }}</text><text class="hsl">条路线</text></view>
                <view class="hs"><text class="hsn mono">{{ stats.upcoming || 0 }}</text><text class="hsl">场可报名</text></view>
            </view>
        </view>

        <!-- 筛选：已点亮（骑过、已成记忆）/ 未点亮（还没骑进记忆的路线） -->
        <view class="filters">
            <text :class="['fbtn', filter === 'all' ? 'on' : '']" data-f="all" @tap="setFilter">全部 {{ stats.places || 0 }}</text>
            <text :class="['fbtn', filter === 'lit' ? 'on' : '']" data-f="lit" @tap="setFilter">✨ 已点亮 {{ stats.lit || 0 }}</text>
            <text :class="['fbtn', filter === 'unlit' ? 'on' : '']" data-f="unlit" @tap="setFilter">◦ 未点亮 {{ stats.unlit || 0 }}</text>
        </view>

        <!-- 地图：终点高亮，近期有活动的点更大更醒目。地图异常时组件内部自动降级，下方列表始终可用 -->
        <view v-if="filteredClusters.length" class="mapwrap">
            <safe-map class="mapbox" :latitude="center.latitude" :longitude="center.longitude"
                :markers="markers" :scale="11" height="520rpx" radius="0"
                tip="地图暂时无法显示，可直接看下方地点列表" @markertap="onMarkerTap" @scalechange="onScale"></safe-map>
            <view v-if="thinned" class="thintip">已按区域聚合显示 {{ markers.length }} 个代表地点，放大地图查看更多</view>
        </view>

        <view class="places">
            <text class="sec">{{ filterLabel }}</text>
            <view v-for="c in filteredClusters" :key="c.clusterId" :class="['pcard', c.hasUpcoming ? 'live' : '']" :data-id="c.clusterId" @tap="openCluster">
                <view class="prow1">
                    <text class="pico">{{ kindIcon(c.kind) }}</text>
                    <text class="pname ellipsis flex1">{{ c.name }}</text>
                    <text :class="['plit', c.lit ? 'on' : '']">{{ c.lit ? '✨ 已点亮' : '◦ 未点亮' }}</text>
                </view>
                <text class="pmeta">{{ c.totalCount }} 条路线以这里为终点{{ kindText(c.kind) }}<text v-if="c.hasUpcoming"> · 近期 {{ c.upcomingCount }} 场可报名</text></text>
            </view>
            <view v-if="!loading && filteredClusters.length === 0" class="empty">
                <text class="ee">🗺</text><text>{{ emptyText }}</text>
            </view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
        <view class="safe-bottom"></view>

        <!-- 终点详情弹层：列出所有以此为终点的路线 -->
        <view class="mask" v-if="active" @tap="closeCluster">
            <view class="sheet" @tap.stop>
                <view class="shd">
                    <view class="shrow"><text class="sht">{{ active.name }}</text><text :class="['plit', active.lit ? 'on' : '']">{{ active.lit ? '✨ 已点亮' : '◦ 未点亮' }}</text></view>
                    <text class="shs">{{ active.totalCount }} 条路线以这里为终点 · {{ active.lit ? '已骑进城市记忆' : '还没被骑亮，去点亮它' }}</text>
                </view>
                <scroll-view scroll-y class="slist">
                    <view v-for="(i, idx) in active.items" :key="idx" :class="['irow', i.isUpcoming ? 'up' : '']"
                        :data-type="i.type" :data-id="i.type === 'activity' ? i.activityId : i.segmentId" @tap="openItem">
                        <view class="imid">
                            <view class="il1">
                                <text class="ititle ellipsis flex1">{{ i.type === 'activity' ? i.title : i.name }}</text>
                                <text v-if="i.isUpcoming" class="ibadge">可报名</text>
                            </view>
                            <text class="isub">{{ itemSub(i) }}</text>
                        </view>
                        <text class="iarw">›</text>
                    </view>
                </scroll-view>
                <view class="sclose" @tap="closeCluster">关闭</view>
            </view>
        </view>
    </view>
</template>

<script>
import { getMemoryMap } from '@/api/memoryMap.js'
import { currentCityCode, currentCityName, ensureCityReady } from '@/store/city.js'
import { statusBarHeight, fmtTime } from '@/common/util.js'
import { BRAND } from '@/common/config.js'
import SafeMap from '@/components/safe-map/safe-map.vue'

export default {
    components: { SafeMap },
    data() {
        return {
            statusBar: 20, clusters: [], stats: {}, loading: false, active: null, curScale: 11, filter: 'all',
            cityName: currentCityName() || BRAND.city,
            // 初始占位；真实中心由后端按城市返回（有簇→簇心均值，无簇→该城市中心）
            center: { latitude: 30.66, longitude: 104.06 }
        }
    },
    computed: {
        // 带原始下标的簇（markertap 靠原始下标定位），先按筛选过滤
        indexedFiltered() {
            return this.clusters
                .map((c, i) => ({ c, i }))
                .filter(({ c }) => this.filter === 'all' || (this.filter === 'lit' ? c.lit : !c.lit))
        },
        filteredClusters() { return this.indexedFiltered.map(x => x.c) },
        filterLabel() { return this.filter === 'lit' ? '已点亮的地点' : (this.filter === 'unlit' ? '未点亮的地点' : '地点列表') },
        emptyText() {
            if (this.filter === 'lit') return '还没有点亮的地点，参加并完成一场活动就会点亮这里'
            if (this.filter === 'unlit') return '没有未点亮的地点了，这座城的路线你们都骑过了'
            return '还没有地点被点亮，办一场活动就会出现在这里'
        },
        // 热度：近期可报名的活动权重最高，其次路线总数——同一网格内优先保留热门路线的代表点
        rankedFiltered() {
            return this.indexedFiltered
                .map(({ c, i }) => ({ c, i, hot: (c.upcomingCount || 0) * 100 + c.totalCount }))
                .sort((a, b) => b.hot - a.hot)
        },
        // 按经纬度网格分桶，网格边长随缩放级别变化：缩得越小格子越大。
        // rankedFiltered 已按热度降序，遍历时每个格子第一次出现的点必然是格内最热的那个，
        // 后续同格的点直接归并计数即可，不需要额外排序。
        clusteredMarkers() {
            const gridSize = this.gridSizeForScale(this.curScale)
            const buckets = new Map()
            for (const item of this.rankedFiltered) {
                const { c } = item
                const key = Math.floor(c.latitude / gridSize) + '_' + Math.floor(c.longitude / gridSize)
                const bucket = buckets.get(key)
                if (!bucket) buckets.set(key, { ...item, mergedCount: 1 })
                else bucket.mergedCount++
            }
            return Array.from(buckets.values())
        },
        markers() {
            return this.clusteredMarkers.map(({ c, i, mergedCount }) => ({
                id: i, // 原始下标，markertap 时用来定位对应簇
                latitude: c.latitude,
                longitude: c.longitude,
                width: c.hasUpcoming ? 36 : 26,
                height: c.hasUpcoming ? 36 : 26,
                // 名称气泡仅在点击时显示，避免多个地名标签常显互相重叠造成"密集"观感；点标记本身即打开详情
                callout: {
                    content: c.name + (c.lit ? ' · 已点亮' : '') + (c.hasUpcoming ? ' · 近期有活动' : '')
                        + (mergedCount > 1 ? ` · 附近还有${mergedCount - 1}处` : ''),
                    display: 'BYCLICK', padding: 6, borderRadius: 6
                }
            }))
        },
        thinned() { return this.markers.length < this.indexedFiltered.length }
    },
    onShow() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        // 缩放级别（3~18）→ 网格边长（经纬度度数），指数映射：每减小 1 级 scale，网格放大约 1.55 倍。
        // scale=18（街道级）≈ 150m 网格，scale=3（省级）≈ 300km 网格；成都纬度下按 1 度≈100km 粗略换算。
        gridSizeForScale(scale) {
            const s = Math.max(3, Math.min(18, scale == null ? 11 : scale))
            const finestGridKm = 0.15
            const growth = 1.55
            const km = finestGridKm * Math.pow(growth, 18 - s)
            return km / 100
        },
        kindIcon(k) { return k === 'segment' ? '🎯' : (k === 'mixed' ? '✨' : '📍') },
        kindText(k) { return k === 'segment' ? '（考核赛段）' : (k === 'mixed' ? '（含考核赛段）' : '') },
        itemSub(i) {
            if (i.type === 'activity') {
                const t = fmtTime(i.startTime)
                return `${t.md || ''} · ${i.distance || 0}km · 从 ${i.meetingPoint || '—'} 出发`
            }
            return `考核赛段 · ${i.dirName} · ${i.distance}km · 限时 ${i.timeLimitMinutes} 分钟 · 目标 ${i.targetTierName}`
        },
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/home/home' }) },
        async load() {
            this.loading = true
            try {
                // 确保 cityCode 一定有值再请求，否则会被 request 层当空参数剔除，退化成"不按城市过滤"
                await ensureCityReady()
                this.cityName = currentCityName() || BRAND.city
                const d = await getMemoryMap({ cityCode: currentCityCode() })
                this.clusters = (d && d.clusters) || []
                this.stats = (d && d.stats) || {}
                if (d && d.center) this.center = d.center
            } catch (e) { this.clusters = [] } finally { this.loading = false }
        },
        setFilter(e) { this.filter = e.currentTarget.dataset.f },
        onMarkerTap(e) {
            const idx = e.detail.markerId // 原始下标（0 起）
            this.active = this.clusters[idx] || null
        },
        onScale(scale) { this.curScale = scale },
        openCluster(e) {
            const id = e.currentTarget.dataset.id
            this.active = this.clusters.find(c => c.clusterId === id) || null
        },
        closeCluster() { this.active = null },
        openItem(e) {
            const ds = e.currentTarget.dataset
            const url = ds.type === 'activity'
                ? '/pages/activity/detail?id=' + ds.id
                : '/pages/assessment/detail?id=' + ds.id
            this.active = null
            uni.navigateTo({ url })
        }
    }
}
</script>

<style lang="scss" scoped>
.mm { min-height: 100vh; background: $paper; }
.head { padding: 0 34rpx 46rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, $night-1, $night-2 60%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 14%, #fff, transparent), radial-gradient(2rpx 2rpx at 34% 62%, #bfe9ff, transparent); }
.nav { position: relative; margin-bottom: 14rpx; }
.nbtn { width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.ht { position: relative; display: block; font-size: 42rpx; font-weight: 800; margin-top: 14rpx; }
.hp { position: relative; display: block; font-size: 21rpx; opacity: .82; margin-top: 10rpx; }
.hstats { position: relative; display: flex; margin-top: 26rpx; background: rgba(255,255,255,.1); border-radius: 22rpx; padding: 22rpx 0; }
.hs { flex: 1; text-align: center; }
.hsn { display: block; font-size: 36rpx; font-weight: 800; letter-spacing: -1rpx; }
.hsl { display: block; font-size: 19rpx; opacity: .8; margin-top: 6rpx; }

.mapwrap { position: relative; }
.thintip { position: absolute; left: 20rpx; right: 20rpx; bottom: 16rpx; background: rgba(14,27,36,.82); color: #fff; font-size: 20rpx; line-height: 1.5; border-radius: 16rpx; padding: 12rpx 18rpx; text-align: center; }

/* 筛选栏：上浮压住 hero 底部，独立成一条 paper 底色的带子，不与地图重叠 */
.filters { display: flex; gap: 14rpx; padding: 18rpx 24rpx; margin-top: -22rpx; position: relative; z-index: 3; background: $paper; border-radius: 26rpx 26rpx 0 0; }
.fbtn { font-size: 23rpx; font-weight: 800; color: $ink-2; background: $card; box-shadow: inset 0 0 0 1rpx $hair; padding: 14rpx 24rpx; border-radius: 18rpx; }
.fbtn.on { background: $green; color: #04140c; box-shadow: none; }

.places { padding: 24rpx 24rpx 0; }
.sec { display: block; font-size: 28rpx; font-weight: 800; margin-bottom: 16rpx; }
.pcard { background: $card; border-radius: 26rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 18rpx; }
.pcard.live { box-shadow: inset 0 0 0 2rpx $green; }
.prow1 { display: flex; align-items: center; gap: 14rpx; }
.pico { font-size: 34rpx; flex: none; }
.pname { font-size: 29rpx; font-weight: 800; min-width: 0; }
.plit { flex: none; font-size: 19rpx; font-weight: 800; padding: 6rpx 14rpx; border-radius: 12rpx; color: $muted; background: $paper; }
.plit.on { color: #04140c; background: linear-gradient(120deg, #ffe08a, #ffc24d); }
.pmeta { display: block; font-size: 21rpx; color: $muted; margin-top: 12rpx; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 100rpx 0; display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.ee { font-size: 70rpx; }
.tip { text-align: center; color: $faint; font-size: 23rpx; padding: 40rpx 0; }
.safe-bottom { height: 50rpx; }

/* 终点详情弹层 */
.mask { position: fixed; inset: 0; z-index: 50; background: rgba(9,20,15,.6); display: flex; align-items: flex-end; }
.sheet { width: 100%; background: $card; border-radius: 34rpx 34rpx 0 0; padding: 34rpx 30rpx 30rpx; max-height: 76vh; display: flex; flex-direction: column; }
.shd { flex: none; }
.shrow { display: flex; align-items: center; gap: 14rpx; }
.sht { flex: 1; min-width: 0; font-size: 34rpx; font-weight: 800; }
.shs { display: block; font-size: 21rpx; color: $muted; margin-top: 8rpx; }
.slist { flex: 1; max-height: 52vh; margin-top: 20rpx; }
.irow { display: flex; align-items: center; gap: 16rpx; background: $paper; border-radius: 22rpx; padding: 22rpx 24rpx; margin-bottom: 14rpx; }
.irow.up { background: $green-soft; }
.imid { flex: 1; min-width: 0; }
.il1 { display: flex; align-items: center; gap: 12rpx; }
.ititle { font-size: 27rpx; font-weight: 800; min-width: 0; }
.ibadge { flex: none; font-size: 18rpx; font-weight: 800; color: #04140c; background: $green; padding: 4rpx 12rpx; border-radius: 10rpx; }
.isub { display: block; font-size: 20rpx; color: $muted; margin-top: 8rpx; line-height: 1.5; }
.iarw { flex: none; color: $faint; font-size: 32rpx; }
.sclose { flex: none; margin-top: 16rpx; height: 84rpx; border-radius: 24rpx; background: $paper; color: $ink; font-size: 27rpx; font-weight: 800;
    display: flex; align-items: center; justify-content: center; }
</style>
