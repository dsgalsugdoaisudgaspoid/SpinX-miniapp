<template>
    <view class="alist">
        <view class="ahead" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <text class="eye">ASSESSMENT · 考核赛段</text>
            <text class="at">冲刺更高成员分类</text>
            <text class="ap">自主考核 · 起点终点各 200m 打卡 · 限时内完成即升级</text>
            <view class="mytier">
                <text class="mtl">我的分类</text>
                <text class="mtv">{{ tierIcon }} {{ myTierName }}</text>
            </view>
        </view>

        <view class="segs">
            <view v-for="s in list" :key="s.segmentId" class="seg" :data-id="s.segmentId" @tap="goDetail">
                <view class="stop">
                    <text :class="['dir', s.direction]">{{ dirLabel(s.direction) }}</text>
                    <text class="sname ellipsis flex1">{{ s.name }}</text>
                    <text class="tgt">{{ tierEmoji(s.targetTier) }} {{ s.targetTierName }}</text>
                </view>
                <view class="route">
                    <text class="pt">{{ s.startName }}</text>
                    <text class="line">→</text>
                    <text class="pt ellipsis flex1">{{ s.endName }}</text>
                </view>
                <view class="smeta">
                    <text class="pill">{{ s.distance }}km</text>
                    <text class="pill lim">⏱ 限时 {{ s.timeLimitMinutes }} 分钟</text>
                    <text class="pill">{{ s.finishers }} 人完赛</text>
                </view>
            </view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { listAssessments } from '@/api/assessment.js'
import { currentCityCode, ensureCityReady } from '@/store/city.js'
import { statusBarHeight } from '@/common/util.js'
import { tierOf } from '@/common/config.js'

export default {
    data() { return { statusBar: 20, list: [], myTier: 'star', myTierName: '星星', loading: false } },
    computed: { tierIcon() { return tierOf(this.myTier).icon } },
    onShow() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        dirLabel(d) { return ({ east: '城东', south: '城南', west: '城西', north: '城北' })[d] || '' },
        tierEmoji(key) { return tierOf(key).icon },
        async load() {
            this.loading = true
            try {
                // 确保 cityCode 一定有值再请求，否则会被 request 层当空参数剔除，退化成"不按城市过滤"
                await ensureCityReady()
                const d = await listAssessments({ cityCode: currentCityCode() })
                this.list = (d && d.list) || []
                this.myTier = (d && d.myTier) || 'star'
                this.myTierName = (d && d.myTierName) || '星星'
            } catch (e) { this.list = [] } finally { this.loading = false }
        },
        goDetail(e) { uni.navigateTo({ url: '/pages/assessment/detail?id=' + e.currentTarget.dataset.id }) }
    }
}
</script>

<style lang="scss" scoped>
.alist { min-height: 100vh; background: $paper; }
.ahead { padding: 0 34rpx 46rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, $night-1, $night-2 60%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 14%, #fff, transparent); }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.at { position: relative; display: block; font-size: 42rpx; font-weight: 800; margin-top: 14rpx; }
.ap { position: relative; display: block; font-size: 21rpx; opacity: .82; margin-top: 10rpx; line-height: 1.5; }
.mytier { position: relative; display: inline-flex; align-items: center; gap: 12rpx; margin-top: 22rpx; background: rgba(255,255,255,.12); padding: 12rpx 22rpx; border-radius: 18rpx; }
.mtl { font-size: 20rpx; opacity: .8; }
.mtv { font-size: 26rpx; font-weight: 800; }

.segs { padding: 20rpx 24rpx 0; margin-top: -22rpx; position: relative; z-index: 2; }
.seg { background: $card; border-radius: 28rpx; padding: 26rpx; box-shadow: 0 14rpx 34rpx -20rpx rgba(9,20,15,.4), inset 0 0 0 1rpx $hair; margin-bottom: 20rpx; }
.stop { display: flex; align-items: center; gap: 14rpx; }
.dir { font-size: 20rpx; font-weight: 800; color: #fff; padding: 6rpx 16rpx; border-radius: 14rpx; flex: none; }
.dir.east { background: #f0a017; } .dir.south { background: #12d07a; color: #04140c; } .dir.west { background: #6fd0ff; color: #04140c; } .dir.north { background: #8f6eff; }
.sname { font-size: 30rpx; font-weight: 800; }
.tgt { font-size: 21rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 6rpx 14rpx; border-radius: 12rpx; flex: none; }
.route { display: flex; align-items: center; gap: 12rpx; margin-top: 18rpx; font-size: 24rpx; color: $ink-2; font-weight: 600; }
.route .line { color: $green-deep; font-weight: 800; }
.route .pt { min-width: 0; }
.smeta { display: flex; gap: 10rpx; margin-top: 18rpx; flex-wrap: wrap; }
.pill { font-size: 20rpx; font-weight: 700; padding: 6rpx 14rpx; border-radius: 12rpx; background: $paper; color: $ink-2; }
.pill.lim { background: #fbf1e4; color: #b5750c; }
.tip { text-align: center; color: $faint; font-size: 23rpx; padding: 40rpx 0; }
.safe-bottom { height: 40rpx; }
</style>
