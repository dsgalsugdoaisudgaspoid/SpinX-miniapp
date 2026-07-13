<template>
    <view class="content">
        <view class="tabs">
            <text :class="['tb', tab === 'guide' ? 'on' : '']" @tap="switchTab('guide')">骑行攻略</text>
            <text :class="['tb', tab === 'column' ? 'on' : '']" @tap="switchTab('column')">科普专栏</text>
        </view>

        <view class="list">
            <view v-for="a in items" :key="a.id" class="card" @tap="goDetail(a)">
                <view class="cover">
                    <image v-if="a.coverUrl" class="cimg" :src="a.coverUrl" mode="aspectFill" />
                    <text v-else class="cph">{{ tab === 'column' ? '📖' : '🗺' }}</text>
                </view>
                <view class="body">
                    <text class="title ellipsis-2">{{ a.title }}</text>
                    <view class="tags" v-if="a.tags && a.tags.length">
                        <text v-for="t in a.tags.slice(0,3)" :key="t" class="tag">{{ t }}</text>
                    </view>
                    <view class="meta">
                        <text class="mt">👁 {{ a.views || 0 }}</text>
                        <text class="mt">♥ {{ a.likes || 0 }}</text>
                        <text class="date">{{ shortDate(a.createdAt) }}</text>
                    </view>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">暂无内容</view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
    </view>
</template>

<script>
import { listGuides, listColumns } from '@/api/content.js'

export default {
    data() { return { tab: 'guide', items: [], loading: false } },
    onLoad(q) { if (q && q.tab) this.tab = q.tab; this.load() },
    methods: {
        shortDate(iso) { if (!iso) return ''; return iso.replace('T', ' ').slice(0, 10) },
        switchTab(t) { if (this.tab === t) return; this.tab = t; this.load() },
        async load() {
            this.loading = true
            try {
                const api = this.tab === 'column' ? listColumns : listGuides
                const d = await api({ page: 1, pageSize: 20 })
                this.items = (d && d.list) || []
            } catch (e) { this.items = [] } finally { this.loading = false }
        },
        goDetail(a) {
            uni.setStorageSync('currentGuide', a)
            uni.navigateTo({ url: '/pages/content/detail?id=' + a.id })
        }
    }
}
</script>

<style lang="scss" scoped>
.content { min-height: 100vh; background: $paper; }
.tabs { display: flex; gap: 40rpx; background: $card; padding: 24rpx 30rpx; position: sticky; top: 0; z-index: 5; }
.tb { font-size: 30rpx; color: $muted; font-weight: 600; padding-bottom: 8rpx; position: relative; }
.tb.on { color: $ink; font-weight: 800; }
.tb.on::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 40rpx; height: 5rpx; border-radius: 3rpx; background: $green; }
.list { padding: 20rpx 24rpx 40rpx; }
.card { display: flex; gap: 20rpx; background: $card; border-radius: 26rpx; padding: 18rpx; margin-bottom: 18rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.cover { width: 200rpx; height: 160rpx; flex: none; border-radius: 20rpx; overflow: hidden; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(150deg, #123a2a, #0ba968); }
.cimg { width: 100%; height: 100%; }
.cph { font-size: 60rpx; }
.body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.title { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 29rpx; font-weight: 800; line-height: 1.35; }
.tags { display: flex; gap: 8rpx; margin-top: 10rpx; flex-wrap: wrap; }
.tag { font-size: 18rpx; color: $green-deep; background: $green-soft; padding: 3rpx 12rpx; border-radius: 10rpx; }
.meta { display: flex; align-items: center; gap: 18rpx; margin-top: auto; padding-top: 12rpx; }
.mt { font-size: 20rpx; color: $muted; }
.date { margin-left: auto; font-size: 19rpx; color: $faint; }
.empty, .tip { text-align: center; color: $faint; font-size: 23rpx; padding: 60rpx 0; }
.ellipsis-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
</style>
