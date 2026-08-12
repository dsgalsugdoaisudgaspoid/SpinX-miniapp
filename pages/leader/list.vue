<template>
    <view class="leaders">
        <!-- 头图 -->
        <view class="lhead" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <text class="eye">LEADERS · 领队宇宙</text>
            <text class="lt">认识带你上路的人</text>
            <text class="lp">每一位领队，都是一条你还没骑过的路线</text>
        </view>

        <view class="items">
            <view v-for="l in list" :key="l.userId" class="lcard" :data-id="l.userId" @tap="goDetail">
                <view class="av" :style="{ backgroundImage: l.avatar ? ('url(' + l.avatar + ')') : '' }"></view>
                <view class="mid">
                    <view class="nline">
                        <text class="nick">{{ l.nickname }}</text>
                        <text class="title">{{ l.title }}</text>
                    </view>
                    <view class="tags">
                        <text v-for="(s, i) in l.specialties" :key="i" class="tag">{{ s }}</text>
                        <text class="tag ghost">骑龄 {{ l.ridingYears }} 年</text>
                    </view>
                    <text class="bio ellipsis-2">{{ l.bio }}</text>
                    <view class="stat">
                        <text class="si"><text class="sn mono">{{ l.ledCount }}</text> 场带队</text>
                        <text class="si"><text class="sn mono">{{ l.totalKm }}</text> km</text>
                        <text v-if="l.upcomingCount > 0" class="up">近期 {{ l.upcomingCount }} 场</text>
                    </view>
                </view>
                <text class="arw">›</text>
            </view>

            <view v-if="!loading && list.length === 0" class="empty">暂无领队</view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { listLeaders } from '@/api/leader.js'
import { currentCityCode, ensureCityReady } from '@/store/city.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, list: [], loading: false } },
    onLoad() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        async load() {
            this.loading = true
            try {
                // 确保 cityCode 一定有值再请求，否则会被 request 层当空参数剔除，退化成"不按城市过滤"
                await ensureCityReady()
                const d = await listLeaders({ page: 1, pageSize: 50, cityCode: currentCityCode() })
                this.list = (d && d.list) || []
            } catch (e) { this.list = [] } finally { this.loading = false }
        },
        goDetail(e) { uni.navigateTo({ url: '/pages/leader/detail?id=' + e.currentTarget.dataset.id }) }
    }
}
</script>

<style lang="scss" scoped>
.leaders { min-height: 100vh; background: $paper; }
.lhead { padding: 0 40rpx 44rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, $night-1, $night-2 60%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 14%, #fff, transparent); }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.lt { position: relative; display: block; font-size: 42rpx; font-weight: 800; margin-top: 14rpx; }
.lp { position: relative; display: block; font-size: 22rpx; opacity: .8; margin-top: 10rpx; }

.items { padding: 20rpx 24rpx 0; margin-top: -20rpx; position: relative; z-index: 2; }
.lcard { display: flex; align-items: center; gap: 22rpx; background: $card; border-radius: 28rpx; padding: 24rpx 22rpx; box-shadow: 0 14rpx 34rpx -20rpx rgba(9,20,15,.4), inset 0 0 0 1rpx $hair; margin-bottom: 20rpx; }
.av { width: 108rpx; height: 108rpx; border-radius: 30rpx; flex: none; background-color: #dfe8e4; background-size: cover; background-position: center;
    background-image: linear-gradient(140deg, #5ecb8f, #0ba968); box-shadow: 0 0 0 4rpx $green-soft; }
.mid { flex: 1; min-width: 0; }
.nline { display: flex; align-items: center; gap: 12rpx; }
.nick { font-size: 30rpx; font-weight: 800; }
.title { font-size: 19rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 4rpx 12rpx; border-radius: 10rpx; }
.tags { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 10rpx; }
.tag { font-size: 19rpx; font-weight: 700; padding: 4rpx 12rpx; border-radius: 10rpx; background: $paper; color: $ink-2; }
.tag.ghost { color: $muted; }
.bio { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 22rpx; color: $muted; line-height: 1.5; margin-top: 12rpx; }
.stat { display: flex; align-items: center; gap: 20rpx; margin-top: 14rpx; }
.si { font-size: 21rpx; color: $muted; }
.sn { font-weight: 800; color: $ink; font-size: 24rpx; }
.up { font-size: 19rpx; font-weight: 800; color: #fff; background: $amber; padding: 4rpx 12rpx; border-radius: 10rpx; }
.arw { color: $faint; font-size: 34rpx; flex: none; }
.empty, .tip { text-align: center; color: $faint; font-size: 23rpx; padding: 60rpx 0; }
.safe-bottom { height: 40rpx; }
</style>
