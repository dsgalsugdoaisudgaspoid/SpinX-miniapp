<template>
    <view class="ad" v-if="album">
        <view class="head">
            <text class="title">{{ album.title }}</text>
            <text class="sub">{{ album.activityTitle }} · {{ (album.media && album.media.length) || 0 }} 张</text>
            <view class="tools">
                <text class="sort" @tap="toggleSort">{{ sortBy === 'highlight' ? '精选优先' : '按时间' }} ⇅</text>
            </view>
        </view>

        <view class="gallery">
            <view v-for="m in media" :key="m.mediaId" class="cell" @tap="preview(m)">
                <image v-if="m.url && !m.url.includes('cdn.spinx.example')" class="pic" :src="m.url" mode="aspectFill" />
                <view v-else class="ph"><text>{{ m.type === 'video' ? '🎬' : '🏞' }}</text></view>
                <text v-if="m.highlight" class="hl">精选</text>
                <text v-if="m.type === 'video'" class="play">▶</text>
            </view>
            <view v-if="media.length === 0" class="empty">相册还没有照片</view>
        </view>

        <!-- 点赞 + 评论输入 -->
        <view class="bar" :style="{ paddingBottom: 'calc(18rpx + ' + safeBottom + 'px)' }">
            <view class="like" @tap="toggleLike">
                <text :class="['heart', liked ? 'on' : '']">{{ liked ? '♥' : '♡' }}</text>
                <text class="lc mono">{{ likes }}</text>
            </view>
            <input class="cinput" v-model="comment" placeholder="友善评论，敏感词会被拦截" placeholder-class="ph" confirm-type="send" @confirm="sendComment" />
            <view class="send" @tap="sendComment">发送</view>
        </view>
    </view>
</template>

<script>
import { getAlbum, likeAlbum, commentAlbum } from '@/api/content.js'

export default {
    data() { return { id: null, album: null, sortBy: 'time', liked: false, likes: 0, comment: '', safeBottom: 0 } },
    computed: { media() { return (this.album && this.album.media) || [] } },
    onLoad(q) {
        this.id = q.id
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.load()
    },
    methods: {
        async load() {
            try { this.album = await getAlbum(this.id, this.sortBy); this.likes = this.album.likes || 0 } catch (e) {}
        },
        toggleSort() { this.sortBy = this.sortBy === 'highlight' ? 'time' : 'highlight'; this.load() },
        preview(m) {
            // 仅当点击的是真实图片时预览；占位图/视频给出提示，避免 current 失效报错
            const real = m.url && !m.url.includes('cdn.spinx.example') && m.type !== 'video'
            if (!real) { uni.showToast({ title: '演示占位素材，接入 OSS 后可查看', icon: 'none' }); return }
            const urls = this.media.filter(x => x.url && !x.url.includes('cdn.spinx.example') && x.type !== 'video').map(x => x.url)
            uni.previewImage({ urls, current: m.url })
        },
        async toggleLike() {
            try { const r = await likeAlbum(this.id); this.liked = r.liked; this.likes = r.likes } catch (e) {}
        },
        async sendComment() {
            const c = (this.comment || '').trim()
            if (!c) return
            try {
                const r = await commentAlbum(this.id, c)
                this.comment = ''
                uni.showToast({ title: r && r.blocked ? '评论含敏感词已屏蔽' : '评论成功', icon: 'none' })
            } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.ad { min-height: 100vh; background: $paper; }
.head { padding: 26rpx 30rpx 12rpx; background: $card; }
.title { font-size: 36rpx; font-weight: 800; }
.sub { display: block; font-size: 22rpx; color: $muted; margin-top: 8rpx; }
.tools { display: flex; margin-top: 14rpx; }
.sort { font-size: 23rpx; color: $ink-2; font-weight: 700; background: $paper; padding: 8rpx 20rpx; border-radius: 14rpx; }
.gallery { display: flex; flex-wrap: wrap; gap: 6rpx; padding: 16rpx 6rpx 160rpx; }
.cell { position: relative; width: calc(33.33% - 4rpx); height: 240rpx; border-radius: 14rpx; overflow: hidden; }
.pic { width: 100%; height: 100%; }
.ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 60rpx;
    background: linear-gradient(150deg, #d8e6ef, #b9d3e6); }
.hl { position: absolute; top: 10rpx; left: 10rpx; font-size: 16rpx; font-weight: 800; color: #04140c; background: $green; padding: 3rpx 10rpx; border-radius: 8rpx; }
.play { position: absolute; inset: 0; margin: auto; width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(0,0,0,.4); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24rpx; }
.empty { width: 100%; text-align: center; color: $faint; font-size: 23rpx; padding: 80rpx 0; }
.bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 16rpx; padding: 18rpx 24rpx 0; background: $card; border-top: 1rpx solid $hair; }
.like { display: flex; flex-direction: column; align-items: center; }
.heart { font-size: 40rpx; color: $muted; line-height: 1; }
.heart.on { color: $coral; }
.lc { font-size: 18rpx; color: $muted; }
.cinput { flex: 1; height: 72rpx; background: $paper; border-radius: 36rpx; padding: 0 26rpx; font-size: 25rpx; }
.ph { color: $faint; }
.send { flex: none; height: 72rpx; padding: 0 28rpx; border-radius: 36rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 25rpx; display: flex; align-items: center; }
</style>
