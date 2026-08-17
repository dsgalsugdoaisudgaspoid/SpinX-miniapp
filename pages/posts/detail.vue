<template>
    <view class="pd" v-if="post">
        <view class="body">
            <view class="ph" :data-uid="post.userId" @tap="goMember">
                <view class="av" :style="{ backgroundImage: post.avatar ? ('url(' + post.avatar + ')') : '' }"></view>
                <view class="who"><text class="nm">{{ spx(post.nickname) }}</text><text class="tm">{{ shortTime(post.createdAt) }}</text></view>
            </view>
            <text class="ct" v-if="post.content">{{ post.content }}</text>
            <view class="imgs" v-if="post.images && post.images.length">
                <image v-for="(im, i) in post.images" :key="i" class="im" :src="im" mode="widthFix" :data-i="i" @tap="preview"></image>
            </view>
            <view v-if="post.activityTitle" class="actchip" @tap="goActivity"><text class="aci">🚴</text><text class="act ellipsis flex1">{{ post.activityTitle }}</text><text class="arw">›</text></view>

            <view class="likebar">
                <text :class="['lk', post.liked ? 'on' : '']" @tap="toggleLike">{{ post.liked ? '♥' : '♡' }} {{ post.likes }}</text>
            </view>

            <view class="csec">评论 {{ (post.comments || []).length }}</view>
            <view v-for="(c, i) in post.comments" :key="i" class="crow" :data-uid="c.userId" @tap="goMember">
                <view class="cav"></view>
                <view class="cmid"><text class="cn">{{ spx(c.nickname) }}</text><text class="cc">{{ c.content }}</text><text class="ctm">{{ shortTime(c.createdAt) }}</text></view>
            </view>
            <view v-if="!(post.comments || []).length" class="cempty">还没有评论，来抢沙发～</view>
            <view class="safe-bottom"></view>
        </view>

        <view class="bar" :style="{ paddingBottom: 'calc(18rpx + ' + safeBottom + 'px)' }">
            <input class="cinput" v-model="comment" placeholder="友善评论…" placeholder-class="ph" confirm-type="send" @confirm="send" />
            <view class="send" @tap="send">发送</view>
        </view>
    </view>
</template>

<script>
import { getPost, likePost, commentPost } from '@/api/post.js'
import { spxName, goMemberProfile } from '@/common/util.js'

export default {
    data() { return { id: null, post: null, comment: '', safeBottom: 0 } },
    onLoad(q) {
        this.id = q.id
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.load()
    },
    methods: {
        spx(n) { return spxName(n) },
        goMember(e) { goMemberProfile(e.currentTarget.dataset.uid) },
        shortTime(iso) { if (!iso) return ''; return iso.replace('T', ' ').slice(5, 16) },
        async load() { try { this.post = await getPost(this.id) } catch (e) {} },
        preview(e) { const urls = this.post.images || []; uni.previewImage({ urls, current: urls[+e.currentTarget.dataset.i] }) },
        goActivity() { if (this.post.activityId) uni.navigateTo({ url: '/pages/activity/detail?id=' + this.post.activityId }) },
        async toggleLike() { try { const r = await likePost(this.id); this.post.liked = r.liked; this.post.likes = r.likes } catch (e) {} },
        async send() {
            const c = (this.comment || '').trim(); if (!c) return
            try { await commentPost(this.id, c); this.comment = ''; uni.showToast({ title: '已评论', icon: 'none' }); this.load() } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.pd { min-height: 100vh; background: $paper; }
.body { padding: 24rpx 28rpx 0; }
.ph { display: flex; align-items: center; gap: 16rpx; }
.av { width: 84rpx; height: 84rpx; border-radius: 50%; flex: none; background-color: #dfe8e4; background-size: cover; background-position: center; background-image: linear-gradient(140deg, #5ecb8f, #0ba968); }
.who { min-width: 0; }
.nm { display: block; font-size: 28rpx; font-weight: 800; }
.tm { display: block; font-size: 20rpx; color: $muted; margin-top: 4rpx; }
.ct { display: block; font-size: 29rpx; color: $ink; line-height: 1.8; margin-top: 20rpx; }
.imgs { margin-top: 18rpx; display: flex; flex-direction: column; gap: 12rpx; }
.im { width: 100%; border-radius: 18rpx; background: $card; }
.actchip { display: flex; align-items: center; gap: 8rpx; margin-top: 18rpx; background: $green-soft; padding: 14rpx 20rpx; border-radius: 16rpx; }
.aci { font-size: 24rpx; } .act { font-size: 23rpx; font-weight: 700; color: $green-deep; min-width: 0; } .arw { color: $green-deep; font-size: 28rpx; }
.likebar { margin-top: 20rpx; padding-bottom: 18rpx; border-bottom: 1rpx solid $hair; }
.lk { font-size: 28rpx; font-weight: 800; color: $muted; }
.lk.on { color: $coral; }
.csec { font-size: 27rpx; font-weight: 800; margin: 22rpx 0 14rpx; }
.crow { display: flex; gap: 16rpx; margin-bottom: 18rpx; }
.cav { width: 56rpx; height: 56rpx; border-radius: 50%; flex: none; background: linear-gradient(135deg, #8fd3ff, #5e8bff); }
.cmid { flex: 1; min-width: 0; }
.cn { display: block; font-size: 23rpx; font-weight: 800; color: $ink-2; }
.cc { display: block; font-size: 26rpx; color: $ink; margin-top: 6rpx; line-height: 1.6; }
.ctm { display: block; font-size: 19rpx; color: $faint; margin-top: 6rpx; }
.cempty { text-align: center; color: $faint; font-size: 23rpx; padding: 40rpx 0; }
.safe-bottom { height: 140rpx; }
.bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 16rpx; padding: 18rpx 24rpx 0; background: $card; border-top: 1rpx solid $hair; }
.cinput { flex: 1; height: 72rpx; background: $paper; border-radius: 36rpx; padding: 0 26rpx; font-size: 25rpx; }
.ph { color: $faint; }
.send { flex: none; height: 72rpx; padding: 0 28rpx; border-radius: 36rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 25rpx; display: flex; align-items: center; }
</style>
