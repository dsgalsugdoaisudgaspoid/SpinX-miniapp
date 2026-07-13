<template>
    <view class="cd" v-if="guide">
        <image v-if="guide.coverUrl" class="cover" :src="guide.coverUrl" mode="aspectFill" />
        <view v-else class="coverph"><text>🚴</text></view>

        <view class="sheet">
            <text class="title">{{ guide.title }}</text>
            <view class="meta">
                <view class="ag"></view>
                <text class="an">环星骑行 · 官方内容</text>
                <text class="dt">{{ shortDate(guide.createdAt) }}</text>
            </view>
            <view class="tags" v-if="guide.tags && guide.tags.length">
                <text v-for="t in guide.tags" :key="t" class="tag">#{{ t }}</text>
            </view>
            <view class="article">
                <rich-text :nodes="nodes"></rich-text>
            </view>
            <view class="stat">
                <text>👁 {{ guide.views || 0 }} 阅读</text>
                <text>♥ {{ guide.likes || 0 }} 喜欢</text>
            </view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
export default {
    data() { return { guide: null } },
    computed: {
        nodes() {
            const c = (this.guide && this.guide.content) || ''
            const safe = c.replace(/</g, '&lt;').replace(/\n/g, '<br/>')
            return '<div style="font-size:28rpx;line-height:1.9;color:#33433c">' + safe + '</div>'
        }
    },
    onLoad() {
        try { this.guide = uni.getStorageSync('currentGuide') || null } catch (e) {}
        if (this.guide && this.guide.title) uni.setNavigationBarTitle({ title: this.guide.title.slice(0, 12) })
    },
    methods: {
        shortDate(iso) { if (!iso) return ''; return iso.replace('T', ' ').slice(0, 10) }
    }
}
</script>

<style lang="scss" scoped>
.cd { min-height: 100vh; background: $card; }
.cover { width: 100%; height: 380rpx; }
.coverph { height: 300rpx; display: flex; align-items: center; justify-content: center; font-size: 130rpx;
    background: linear-gradient(160deg, #0e1b24, #123a57 60%, #0a5c86); }
.sheet { padding: 30rpx; }
.title { font-size: 42rpx; font-weight: 800; line-height: 1.3; }
.meta { display: flex; align-items: center; gap: 12rpx; margin-top: 20rpx; }
.ag { width: 44rpx; height: 44rpx; border-radius: 50%; background: linear-gradient(135deg, #5ecb8f, #0ba968); }
.an { font-size: 23rpx; color: $ink-2; font-weight: 600; }
.dt { margin-left: auto; font-size: 21rpx; color: $faint; }
.tags { display: flex; gap: 10rpx; margin-top: 18rpx; flex-wrap: wrap; }
.tag { font-size: 21rpx; color: $green-deep; background: $green-soft; padding: 5rpx 14rpx; border-radius: 12rpx; }
.article { margin-top: 26rpx; }
.stat { display: flex; gap: 30rpx; margin-top: 34rpx; padding-top: 24rpx; border-top: 1rpx solid $hair; color: $muted; font-size: 23rpx; }
.safe-bottom { height: 60rpx; }
</style>
