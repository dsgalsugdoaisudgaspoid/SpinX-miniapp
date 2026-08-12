<template>
    <view class="jl">
        <view class="head" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>
            <text class="eye">MY JOURNAL · 骑行日记</text>
            <text class="ht">你在 SpinX 的每一段路，都被记住了</text>
            <text class="hs">{{ items.length }} 段旅程</text>
        </view>

        <view class="timeline">
            <view v-for="(e, i) in items" :key="e.entryId" class="item">
                <view class="track">
                    <view class="dot" :class="{ first: i === 0 }"></view>
                    <view v-if="i < items.length - 1" class="rail"></view>
                </view>
                <view class="card">
                    <view class="crow1"><text class="cdate mono">{{ fmt(e.date).md }}</text><text class="cwd">{{ fmt(e.date).weekday }}</text></view>
                    <text class="ctitle">{{ e.activityTitle }}</text>
                    <view class="cloc"><text>📍</text><text class="ellipsis flex1">{{ e.meetingPoint || '集合点待定' }}</text></view>
                    <view class="cmetas">
                        <text class="pill" v-if="e.distance">{{ e.distance }}km</text>
                        <text class="pill" v-if="e.companions && e.companions.length">与 {{ e.companions.map(c => c.nickname).join('、') }} 同行</text>
                    </view>
                    <view class="ctags" v-if="e.feelingTags && e.feelingTags.length">
                        <text v-for="t in e.feelingTags" :key="t" class="tag">{{ t }}</text>
                    </view>

                    <block v-if="editingId === e.entryId">
                        <textarea class="cnote-edit" v-model="draftNote" placeholder="写点什么，记住这一天…" placeholder-class="ph" />
                        <view class="cimgs" v-if="draftPhotos.length">
                            <image v-for="(im, pi) in draftPhotos" :key="pi" class="cim" :src="im" mode="aspectFill"></image>
                        </view>
                        <view class="cedit-ops">
                            <text class="ceop" @tap="addPhoto">＋ 加照片</text>
                            <text class="ceop cancel" :data-id="e.entryId" @tap="cancelEdit">取消</text>
                            <text class="ceop save" :data-id="e.entryId" @tap="saveEdit">保存</text>
                        </view>
                    </block>
                    <block v-else>
                        <text v-if="e.userNote" class="cnote">“{{ e.userNote }}”</text>
                        <view class="cimgs" v-if="e.photos && e.photos.length">
                            <image v-for="(im, pi) in e.photos" :key="pi" class="cim" :src="im" mode="aspectFill"></image>
                        </view>
                        <text class="cadd" :data-id="e.entryId" :data-note="e.userNote" @tap="startEdit">{{ e.userNote ? '✏️ 编辑记录' : '✏️ 补充这段记忆' }}</text>
                    </block>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">
                <text class="ee">📔</text><text>参加过的每一场骑行，都会自动出现在这里</text>
            </view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { myJournal, updateJournalEntry } from '@/api/journal.js'
import { fmtTime, statusBarHeight } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, items: [], loading: false, editingId: null, draftNote: '', draftPhotos: [] } },
    onShow() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/profile/profile' }) },
        fmt(iso) { return fmtTime(iso) },
        async load() {
            this.loading = true
            try { const d = await myJournal(); this.items = (d && d.list) || [] } catch (e) { this.items = [] } finally { this.loading = false }
        },
        startEdit(e) {
            const id = +e.currentTarget.dataset.id
            const entry = this.items.find(x => x.entryId === id)
            this.editingId = id
            this.draftNote = (entry && entry.userNote) || ''
            this.draftPhotos = (entry && entry.photos && entry.photos.slice()) || []
        },
        cancelEdit() { this.editingId = null },
        addPhoto() {
            uni.chooseImage({
                count: 9 - this.draftPhotos.length, sizeType: ['compressed'],
                success: (res) => { this.draftPhotos = this.draftPhotos.concat(res.tempFilePaths || []) }
            })
        },
        async saveEdit(e) {
            const id = +e.currentTarget.dataset.id
            try {
                const updated = await updateJournalEntry(id, { note: this.draftNote, photos: this.draftPhotos })
                const entry = this.items.find(x => x.entryId === id)
                if (entry) { entry.userNote = updated.userNote; entry.photos = updated.photos }
                this.editingId = null
                uni.showToast({ title: '已保存', icon: 'success' })
            } catch (err) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.jl { min-height: 100vh; background: $paper; }
.head { padding: 0 40rpx 44rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, $night-1, $night-2 58%, $night-3); }
.nav { position: relative; margin-bottom: 14rpx; }
.nbtn { width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 24%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 18%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 12%, #fff, transparent); }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.ht { position: relative; display: block; font-size: 34rpx; font-weight: 800; margin-top: 14rpx; line-height: 1.4; }
.hs { position: relative; display: block; font-size: 21rpx; opacity: .8; margin-top: 12rpx; }

.timeline { padding: 28rpx 28rpx 0; }
.item { display: flex; gap: 20rpx; }
.track { width: 24rpx; flex: none; display: flex; flex-direction: column; align-items: center; padding-top: 10rpx; }
.dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: $card; box-shadow: inset 0 0 0 4rpx $green; flex: none; }
.dot.first { background: $green; box-shadow: 0 0 0 6rpx $green-soft; }
.rail { flex: 1; width: 3rpx; background: $line; margin-top: 6rpx; min-height: 20rpx; }
.card { flex: 1; min-width: 0; background: $card; border-radius: 24rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 26rpx; }
.crow1 { display: flex; align-items: baseline; gap: 12rpx; }
.cdate { font-size: 30rpx; font-weight: 800; letter-spacing: -1rpx; }
.cwd { font-size: 20rpx; color: $muted; }
.ctitle { display: block; font-size: 27rpx; font-weight: 800; margin-top: 10rpx; }
.cloc { display: flex; align-items: center; gap: 8rpx; margin-top: 10rpx; font-size: 21rpx; color: $muted; }
.cmetas { display: flex; gap: 10rpx; margin-top: 14rpx; flex-wrap: wrap; }
.pill { font-size: 20rpx; font-weight: 700; padding: 5rpx 14rpx; border-radius: 12rpx; background: $paper; color: $ink-2; }
.ctags { display: flex; gap: 8rpx; margin-top: 14rpx; flex-wrap: wrap; }
.tag { font-size: 19rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 4rpx 14rpx; border-radius: 10rpx; }
.cnote { display: block; margin-top: 16rpx; font-size: 23rpx; color: $ink-2; font-style: italic; line-height: 1.6; }
.cimgs { display: flex; flex-wrap: wrap; gap: 8rpx; margin-top: 14rpx; }
.cim { width: 140rpx; height: 140rpx; border-radius: 14rpx; background: $paper; }
.cadd { display: block; margin-top: 16rpx; font-size: 21rpx; font-weight: 700; color: $green-deep; }
.cnote-edit { width: 100%; height: 140rpx; font-size: 24rpx; background: $paper; border-radius: 14rpx; padding: 18rpx; box-sizing: border-box; margin-top: 16rpx; }
.ph { color: $faint; }
.cedit-ops { display: flex; align-items: center; gap: 22rpx; margin-top: 14rpx; }
.ceop { font-size: 22rpx; font-weight: 700; color: $muted; }
.ceop.save { margin-left: auto; color: $green-deep; font-weight: 800; }
.ceop.cancel { color: $faint; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 100rpx 0 40rpx; display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.ee { font-size: 70rpx; }
.tip { text-align: center; color: $faint; font-size: 23rpx; padding: 40rpx 0; }
.safe-bottom { height: 50rpx; }
</style>
