<template>
    <view class="ad" v-if="album">
        <view class="head">
            <text class="title">{{ album.title }}</text>
            <text class="sub">{{ album.activityTitle }} · {{ (album.media && album.media.length) || 0 }} 张</text>
            <view class="tools">
                <text class="sort" @tap="toggleSort">{{ sortBy === 'highlight' ? '精选优先' : '按时间' }} ⇅</text>
                <text v-if="isPhotographer" class="upload" @tap="uploadPhotos">＋ 上传照片</text>
            </view>
            <text v-if="isPhotographer" class="tip">长按照片可设精选、加 SpinX 水印{{ aiAvailable ? '、AI 风格化' : '' }}</text>
        </view>

        <view class="gallery">
            <view v-for="m in media" :key="m.mediaId" class="cell" @tap="preview(m)" @longpress="onLong(m)">
                <image v-if="m.url && !m.url.includes('cdn.spinx.example')" class="pic" :src="m.url" mode="aspectFill" />
                <view v-else class="ph"><text>{{ m.type === 'video' ? '🎬' : '🏞' }}</text></view>
                <text v-if="m.highlight" class="hl">精选</text>
                <text v-if="m.aiStyle" class="ai">AI · {{ m.aiStyle }}</text>
                <text v-else-if="m.watermarked" class="wm">SPX</text>
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
import {
    getAlbum, likeAlbum, commentAlbum, addAlbumPhotos, setPhotoHighlight, setPhotoWatermark,
    listAiStyles, submitAiStylize, getAiTask
} from '@/api/content.js'
import { hasRole } from '@/store/user.js'
import { BASE_URL, API_PREFIX } from '@/common/config.js'

export default {
    data() {
        return {
            id: null, album: null, sortBy: 'time', liked: false, likes: 0, comment: '',
            safeBottom: 0, uploading: false,
            aiStyles: [], aiAvailable: false, aiNotice: '', aiRunning: false
        }
    },
    computed: {
        media() { return (this.album && this.album.media) || [] },
        isPhotographer() { return hasRole('photographer') || hasRole('admin') }
    },
    onLoad(q) {
        this.id = q.id
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.load()
        if (this.isPhotographer) this.loadAiStyles()
    },
    methods: {
        // 拉不到风格（后端未开启 AI）时静默降级：菜单里就不出现这一项，不打扰摄影师
        async loadAiStyles() {
            try {
                const r = await listAiStyles()
                this.aiAvailable = !!(r && r.available)
                this.aiStyles = (r && r.styles) || []
                this.aiNotice = (r && r.notice) || ''
            } catch (e) { this.aiAvailable = false }
        },
        async load() {
            try { this.album = await getAlbum(this.id, this.sortBy); this.likes = this.album.likes || 0 } catch (e) {}
        },
        toggleSort() { this.sortBy = this.sortBy === 'highlight' ? 'time' : 'highlight'; this.load() },
        // D2：调用 uni.uploadFile（真机上传至 OSS 得 CDN url）
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
        uploadPhotos() {
            if (this.uploading) return
            uni.chooseImage({
                count: 9, sizeType: ['compressed'],
                success: async (res) => {
                    const paths = res.tempFilePaths || []
                    if (!paths.length) return
                    this.uploading = true
                    uni.showLoading({ title: '上传中…', mask: true })
                    const urls = []
                    for (const fp of paths) {
                        // 必须用服务端返回的地址：本地临时路径（wxfile://）只在当前设备当次会话有效，
                        // 存进相册后别人打不开，后端也没法据此加水印
                        const url = await this.uploadOne(fp)
                        if (url) urls.push(url)
                    }
                    if (!urls.length) {
                        uni.hideLoading(); this.uploading = false
                        uni.showToast({ title: '上传失败，请重试', icon: 'none' })
                        return
                    }
                    const failed = paths.length - urls.length
                    try {
                        await addAlbumPhotos(this.id, urls)
                        uni.hideLoading()
                        uni.showToast({ title: failed ? `已上传 ${urls.length} 张，${failed} 张失败` : `已上传 ${urls.length} 张`, icon: failed ? 'none' : 'success' })
                        this.load()
                    }
                    catch (e) { uni.hideLoading() } finally { this.uploading = false }
                }
            })
        },
        onLong(m) {
            if (!this.isPhotographer) return
            // 用数组组装菜单项与动作，避免下标写死——视频没有水印项，两者会错位
            const actions = [{
                label: m.highlight ? '取消精选' : '设为精选',
                run: () => setPhotoHighlight(this.id, m.mediaId, !m.highlight)
            }]
            if (m.type !== 'video') {
                actions.push({
                    label: m.watermarked ? '去掉 SpinX 水印' : '加 SpinX 水印',
                    run: () => setPhotoWatermark(this.id, m.mediaId, !m.watermarked),
                    loading: m.watermarked ? '还原中…' : '生成中…'
                })
                // AI 生成图不能再拿去生成，否则会一层层叠加失真
                if (this.aiAvailable && this.aiStyles.length && !m.aiStyle) {
                    actions.push({ label: 'AI 风格化…', pick: () => this.pickAiStyle(m) })
                }
            }
            uni.showActionSheet({
                itemList: actions.map(a => a.label),
                success: async (res) => {
                    const action = actions[res.tapIndex]
                    if (!action) return
                    // 需要二级选择的项（AI 风格）走自己的流程，不套这里的 loading/toast
                    if (action.pick) { action.pick(); return }
                    if (action.loading) uni.showLoading({ title: action.loading, mask: true })
                    try {
                        await action.run()
                        if (action.loading) uni.hideLoading()
                        uni.showToast({ title: '已更新', icon: 'none' })
                        this.load()
                    } catch (e) {
                        if (action.loading) uni.hideLoading()
                        uni.showToast({ title: (e && e.message) || '该照片不可编辑', icon: 'none' })
                    }
                }
            })
        },
        pickAiStyle(m) {
            if (this.aiRunning) { uni.showToast({ title: '已有生成中的任务', icon: 'none' }); return }
            const styles = this.aiStyles
            uni.showActionSheet({
                itemList: styles.map(s => s.name),
                success: (res) => {
                    const style = styles[res.tapIndex]
                    if (!style) return
                    uni.showModal({
                        title: '生成「' + style.name + '」版本',
                        content: (style.description ? style.description + '\n\n' : '')
                            + (this.aiNotice || 'AI 生成图会作为额外一张追加到相册，不会替换原图。'),
                        confirmText: '开始生成',
                        success: (r) => { if (r.confirm) this.runAiStylize(m, style) }
                    })
                }
            })
        },
        async runAiStylize(m, style) {
            this.aiRunning = true
            uni.showLoading({ title: '正在生成…', mask: true })
            try {
                const task = await submitAiStylize(this.id, m.mediaId, style.styleKey)
                const done = await this.pollAiTask(task.taskId)
                uni.hideLoading()
                if (done.status === 'succeeded') {
                    uni.showToast({ title: '已生成' + style.name, icon: 'success' })
                    this.load()
                } else {
                    uni.showModal({
                        title: '生成失败',
                        content: done.errorMessage || '请稍后重试',
                        showCancel: false
                    })
                }
            } catch (e) {
                uni.hideLoading()
                uni.showToast({ title: (e && e.message) || '提交失败', icon: 'none' })
            } finally {
                this.aiRunning = false
            }
        },
        /** 每 2 秒查一次，最多等 3 分钟——超时只是不再等，后端任务仍会自己走完。 */
        pollAiTask(taskId) {
            return new Promise((resolve) => {
                let tries = 0
                const tick = async () => {
                    tries++
                    let t = null
                    try { t = await getAiTask(taskId) } catch (e) {}
                    if (t && (t.status === 'succeeded' || t.status === 'failed')) return resolve(t)
                    if (tries >= 90) return resolve({ status: 'failed', errorMessage: '生成超时，稍后可下拉刷新查看' })
                    setTimeout(tick, 2000)
                }
                tick()
            })
        },
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
.upload { margin-left: auto; font-size: 23rpx; font-weight: 800; color: #04140c; background: $green; padding: 8rpx 22rpx; border-radius: 14rpx; }
.tip { display: block; font-size: 20rpx; color: $faint; margin-top: 12rpx; }
.gallery { display: flex; flex-wrap: wrap; gap: 6rpx; padding: 16rpx 6rpx 160rpx; }
.cell { position: relative; width: calc(33.33% - 4rpx); height: 240rpx; border-radius: 14rpx; overflow: hidden; }
.pic { width: 100%; height: 100%; }
.ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 60rpx;
    background: linear-gradient(150deg, #d8e6ef, #b9d3e6); }
.hl { position: absolute; top: 10rpx; left: 10rpx; font-size: 16rpx; font-weight: 800; color: #04140c; background: $green; padding: 3rpx 10rpx; border-radius: 8rpx; }
.wm { position: absolute; top: 10rpx; right: 10rpx; font-size: 16rpx; font-weight: 800; color: #fff; background: rgba(0,0,0,.45); padding: 3rpx 10rpx; border-radius: 8rpx; letter-spacing: 1rpx; }
.ai { position: absolute; top: 10rpx; right: 10rpx; max-width: 70%; font-size: 16rpx; font-weight: 800; color: #fff; background: rgba(88,60,190,.75); padding: 3rpx 10rpx; border-radius: 8rpx; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
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
