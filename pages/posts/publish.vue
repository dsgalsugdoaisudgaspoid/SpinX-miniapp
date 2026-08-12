<template>
    <view class="pub">
        <textarea class="ta" v-model="content" placeholder="分享这次骑行的故事、风景或吐槽…友善发言，敏感词会被拦截" placeholder-class="ph" maxlength="500" />

        <view class="imgs">
            <view v-for="(im, i) in images" :key="i" class="im">
                <image class="pic" :src="im" mode="aspectFill"></image>
                <text class="del" :data-i="i" @tap="removeImg">✕</text>
            </view>
            <view v-if="images.length < 9" class="add" @tap="chooseImgs"><text class="addi">＋</text><text class="addt">添加图片</text></view>
        </view>

        <view class="linkrow" @tap="pickActivity">
            <text class="li">🚴</text>
            <text class="lt flex1">{{ linkedTitle || '关联活动（可选）' }}</text>
            <text v-if="linkedTitle" class="lclear" @tap.stop="clearLink">清除</text>
            <text v-else class="larw">›</text>
        </view>

        <view class="footer" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <view :class="['g-btn', canPost ? '' : 'off']" @tap="publish">发布动态</view>
        </view>
    </view>
</template>

<script>
import { createPost } from '@/api/post.js'
import { myActivities } from '@/api/user.js'
import { BASE_URL, API_PREFIX } from '@/common/config.js'

export default {
    data() { return { content: '', images: [], safeBottom: 0, posting: false, myacts: [], linkedId: null, linkedTitle: '' } },
    computed: { canPost() { return !this.posting && (!!this.content.trim() || this.images.length > 0) } },
    onLoad() {
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        myActivities({ page: 1, pageSize: 20 }).then(d => { this.myacts = (d && d.list) || [] }).catch(() => {})
    },
    methods: {
        uploadOne(filePath) {
            return new Promise((resolve) => {
                uni.uploadFile({
                    url: BASE_URL + API_PREFIX + '/upload', filePath, name: 'file',
                    header: { Authorization: 'Bearer ' + (uni.getStorageSync('accessToken') || '') },
                    success: (r) => { try { const d = JSON.parse(r.data); resolve((d && d.data && d.data.url) || null) } catch (e) { resolve(null) } },
                    fail: () => resolve(null)
                })
            })
        },
        chooseImgs() {
            uni.chooseImage({
                count: 9 - this.images.length, sizeType: ['compressed'],
                success: async (res) => {
                    const paths = res.tempFilePaths || []
                    uni.showLoading({ title: '上传中…', mask: true })
                    for (const fp of paths) { await this.uploadOne(fp); this.images.push(fp) } // 开发期用临时路径；上线用返回 cdn
                    uni.hideLoading()
                }
            })
        },
        removeImg(e) { this.images.splice(+e.currentTarget.dataset.i, 1) },
        pickActivity() {
            if (!this.myacts.length) { uni.showToast({ title: '暂无可关联的活动', icon: 'none' }); return }
            uni.showActionSheet({
                itemList: this.myacts.slice(0, 6).map(a => a.title),
                success: (r) => { const a = this.myacts[r.tapIndex]; this.linkedId = a.activityId || a.id; this.linkedTitle = a.title }
            })
        },
        clearLink() { this.linkedId = null; this.linkedTitle = '' },
        async publish() {
            if (!this.canPost) { uni.showToast({ title: '请填写内容或添加图片', icon: 'none' }); return }
            this.posting = true
            try {
                await createPost({ content: this.content.trim(), images: this.images, activityId: this.linkedId, activityTitle: this.linkedTitle })
                uni.showToast({ title: '已发布', icon: 'success' })
                setTimeout(() => uni.navigateBack(), 700)
            } catch (e) {} finally { this.posting = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.pub { min-height: 100vh; background: $paper; padding: 20rpx 24rpx 0; }
.ta { width: 100%; min-height: 220rpx; background: $card; border-radius: 24rpx; padding: 26rpx; font-size: 28rpx; line-height: 1.7; box-sizing: border-box; box-shadow: inset 0 0 0 1rpx $hair; }
.ph { color: $faint; }
.imgs { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 18rpx; }
.im { position: relative; width: calc(33.33% - 8rpx); height: 210rpx; }
.pic { width: 100%; height: 100%; border-radius: 16rpx; }
.del { position: absolute; top: 8rpx; right: 8rpx; width: 40rpx; height: 40rpx; border-radius: 50%; background: rgba(0,0,0,.55); color: #fff; font-size: 24rpx; display: flex; align-items: center; justify-content: center; }
.add { width: calc(33.33% - 8rpx); height: 210rpx; border-radius: 16rpx; background: $card; box-shadow: inset 0 0 0 2rpx $line; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx; }
.addi { font-size: 50rpx; color: $faint; font-weight: 300; line-height: 1; }
.addt { font-size: 20rpx; color: $muted; }
.linkrow { display: flex; align-items: center; gap: 14rpx; margin-top: 18rpx; background: $card; border-radius: 22rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.li { font-size: 28rpx; } .lt { font-size: 25rpx; font-weight: 600; color: $ink-2; min-width: 0; }
.lclear { font-size: 22rpx; color: $coral; font-weight: 700; } .larw { color: $faint; font-size: 30rpx; }
.footer { padding: 26rpx 0 0; }
.g-btn.off { background: #d7ddda; color: #8a968f; }
</style>
