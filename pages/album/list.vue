<template>
    <view class="albums">
        <view class="head">
            <text class="ht">活动影像</text>
            <text class="hs">每一次骑行都值得被记录</text>
        </view>

        <view class="grid">
            <view v-for="a in items" :key="a.albumId" class="card" @tap="goDetail(a.albumId)">
                <view class="cover">
                    <image v-if="a.coverUrl" class="cimg" :src="a.coverUrl" mode="aspectFill" />
                    <text v-else class="cph">📸</text>
                    <text v-if="a.hasHighlightPhotos" class="hl">精选</text>
                    <text class="cnt mono">{{ a.photoCount || 0 }} 张</text>
                </view>
                <text class="title ellipsis-2">{{ a.title }}</text>
                <view class="meta">
                    <view class="pg"></view>
                    <text class="pn ellipsis flex1">{{ a.photographer ? spx(a.photographer.nickname) : '摄影师' }}</text>
                    <text class="likes">♥ {{ a.likes || 0 }}</text>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">暂无相册</view>
        </view>
        <view v-if="loading" class="tip">加载中…</view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { listAlbums } from '@/api/content.js'
import { spxName } from '@/common/util.js'

export default {
    data() { return { items: [], page: 1, loading: false, noMore: false } },
    onLoad() { this.reload() },
    onReachBottom() { this.more() },
    methods: {
        spx(n) { return spxName(n) },
        async reload() { this.page = 1; this.noMore = false; this.items = []; await this.fetch(true) },
        async more() { if (this.loading || this.noMore) return; this.page++; await this.fetch(false) },
        async fetch(reset) {
            this.loading = true
            try {
                const d = await listAlbums({ page: this.page, pageSize: 10 })
                const list = (d && d.list) || []
                this.items = reset ? list : this.items.concat(list)
                const pg = d && d.pagination
                if ((pg && this.page >= pg.totalPages) || list.length === 0) this.noMore = true
            } catch (e) {} finally { this.loading = false }
        },
        goDetail(id) { uni.navigateTo({ url: '/pages/album/detail?id=' + id }) }
    }
}
</script>

<style lang="scss" scoped>
.albums { min-height: 100vh; background: $paper; }
.head { padding: 30rpx 30rpx 10rpx; }
.ht { font-size: 40rpx; font-weight: 800; }
.hs { display: block; font-size: 22rpx; color: $muted; margin-top: 8rpx; }
.grid { display: flex; flex-wrap: wrap; gap: 18rpx; padding: 20rpx 24rpx 0; }
.card { width: calc(50% - 9rpx); box-sizing: border-box; background: $card; border-radius: 26rpx; padding: 14rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.cover { position: relative; height: 300rpx; border-radius: 20rpx; overflow: hidden; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(155deg, #0e1b24, #123a57, #0a5c86); }
.cimg { width: 100%; height: 100%; }
.cph { font-size: 80rpx; }
.hl { position: absolute; top: 14rpx; left: 14rpx; font-size: 18rpx; font-weight: 800; color: #04140c; background: $green; padding: 4rpx 12rpx; border-radius: 10rpx; }
.cnt { position: absolute; bottom: 14rpx; right: 14rpx; font-size: 18rpx; color: #fff; background: rgba(0,0,0,.4); padding: 4rpx 12rpx; border-radius: 10rpx; }
.title { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 26rpx; font-weight: 700; line-height: 1.3; margin: 14rpx 6rpx 0; min-height: 68rpx; }
.meta { display: flex; align-items: center; gap: 10rpx; margin: 8rpx 6rpx 6rpx; }
.pg { width: 30rpx; height: 30rpx; border-radius: 50%; background: linear-gradient(135deg, #b6f0c9, #5ecb8f); flex: none; }
.pn { font-size: 20rpx; color: $muted; }
.likes { font-size: 20rpx; color: $coral; font-weight: 700; }
.empty { width: 100%; text-align: center; color: $faint; font-size: 23rpx; padding: 80rpx 0; }
.tip { text-align: center; color: $faint; font-size: 22rpx; padding: 30rpx 0; }
.safe-bottom { height: 40rpx; }
.ellipsis-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
</style>
