<template>
    <view class="feed">
        <view class="items">
            <view v-for="p in items" :key="p.postId" class="card" :data-id="p.postId" @tap="goDetail">
                <view class="ph">
                    <view class="av" :style="{ backgroundImage: p.avatar ? ('url(' + p.avatar + ')') : '' }"></view>
                    <view class="who"><text class="nm">{{ p.nickname }}</text><text class="tm">{{ shortTime(p.createdAt) }}</text></view>
                </view>
                <text class="ct" v-if="p.content">{{ p.content }}</text>
                <view class="imgs" v-if="p.images && p.images.length">
                    <image v-for="(im, i) in p.images.slice(0, 9)" :key="i" class="im" :src="im" mode="aspectFill"></image>
                </view>
                <view v-if="p.activityTitle" class="actchip"><text class="aci">🚴</text><text class="act ellipsis">{{ p.activityTitle }}</text></view>
                <view class="meta">
                    <text :class="['mi', p.liked ? 'on' : '']" :data-id="p.postId" @tap.stop="toggleLike">{{ p.liked ? '♥' : '♡' }} {{ p.likes }}</text>
                    <text class="mi">💬 {{ p.commentCount }}</text>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">
                <text class="ee">✍️</text><text>{{ mine ? '还没有发布动态' : '还没有人发动态，来发第一条吧' }}</text>
            </view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>

        <view class="fab" @tap="goPublish"><text class="fabi">＋</text></view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { listPosts, myPosts, likePost } from '@/api/post.js'
import { isLoggedIn } from '@/store/user.js'

export default {
    data() { return { mine: false, items: [], loading: false } },
    onLoad(q) { this.mine = q && q.mine === '1'; if (this.mine) uni.setNavigationBarTitle({ title: '我的动态' }) },
    onShow() { this.load() },
    methods: {
        shortTime(iso) { if (!iso) return ''; return iso.replace('T', ' ').slice(5, 16) },
        async load() {
            this.loading = true
            try { const d = this.mine ? await myPosts({ page: 1, pageSize: 30 }) : await listPosts({ page: 1, pageSize: 30 }); this.items = (d && d.list) || [] }
            catch (e) { this.items = [] } finally { this.loading = false }
        },
        goDetail(e) { uni.navigateTo({ url: '/pages/posts/detail?id=' + e.currentTarget.dataset.id }) },
        goPublish() { if (!isLoggedIn()) { uni.navigateTo({ url: '/pages/login/login' }); return } uni.navigateTo({ url: '/pages/posts/publish' }) },
        async toggleLike(e) {
            const id = e.currentTarget.dataset.id
            const p = this.items.find(x => x.postId === +id); if (!p) return
            try { const r = await likePost(id); p.liked = r.liked; p.likes = r.likes } catch (err) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.feed { min-height: 100vh; background: $paper; }
.items { padding: 20rpx 24rpx 40rpx; }
.card { background: $card; border-radius: 28rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 20rpx; }
.ph { display: flex; align-items: center; gap: 16rpx; }
.av { width: 72rpx; height: 72rpx; border-radius: 50%; flex: none; background-color: #dfe8e4; background-size: cover; background-position: center; background-image: linear-gradient(140deg, #5ecb8f, #0ba968); }
.who { min-width: 0; }
.nm { display: block; font-size: 27rpx; font-weight: 800; }
.tm { display: block; font-size: 20rpx; color: $muted; margin-top: 4rpx; }
.ct { display: block; font-size: 27rpx; color: $ink-2; line-height: 1.7; margin-top: 18rpx; }
.imgs { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 16rpx; }
.im { width: calc(33.33% - 6rpx); height: 210rpx; border-radius: 14rpx; background: $paper; }
.actchip { display: inline-flex; align-items: center; gap: 8rpx; margin-top: 16rpx; background: $green-soft; padding: 8rpx 18rpx; border-radius: 14rpx; max-width: 100%; }
.aci { font-size: 22rpx; } .act { font-size: 21rpx; font-weight: 700; color: $green-deep; min-width: 0; }
.meta { display: flex; gap: 34rpx; margin-top: 18rpx; }
.mi { font-size: 24rpx; color: $muted; font-weight: 700; }
.mi.on { color: $coral; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 120rpx 0; display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.ee { font-size: 70rpx; }
.tip { text-align: center; color: $faint; font-size: 23rpx; padding: 30rpx 0; }
.fab { position: fixed; right: 40rpx; bottom: 80rpx; z-index: 20; width: 108rpx; height: 108rpx; border-radius: 50%; background: linear-gradient(135deg, #12d07a, #0ba968); box-shadow: 0 14rpx 30rpx -8rpx rgba(11,169,104,.7); display: flex; align-items: center; justify-content: center; }
.fabi { color: #04140c; font-size: 60rpx; font-weight: 300; line-height: 1; }
.safe-bottom { height: 40rpx; }
</style>
