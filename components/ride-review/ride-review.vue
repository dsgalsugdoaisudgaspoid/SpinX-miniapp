<template>
    <view class="rrmask" v-if="show" @tap="skip">
        <view class="rrsheet" @tap.stop>
            <view class="rrhd">
                <text class="rrk">今天的骑行 · 一句话总结</text>
                <brand-mark theme="light" width="72rpx"></brand-mark>
            </view>
            <text class="rrt ellipsis">{{ pending.activityTitle }}</text>

            <text class="rrlabel">这次骑行，你的收获是？</text>
            <view class="rrchips">
                <text v-for="f in options" :key="f" :class="['rrchip', tags.includes(f) ? 'on' : '']" :data-f="f" @tap="toggle">{{ f }}</text>
            </view>

            <text class="rrlabel">用一句话记住今天</text>
            <textarea class="rrnote" v-model="note" placeholder="例如：夜色很好，和新朋友一起冲上了坡顶" placeholder-class="rrph" maxlength="60" />
            <text class="rrcount">{{ note.length }}/60</text>

            <view class="rrgo" @tap="submit">记下这次骑行</view>
            <text class="rrskip" @tap="skip">先不写了</text>
        </view>
    </view>
</template>

<script>
import { submitFeeling, updateJournalEntry } from '@/api/journal.js'
import { FEELING_OPTIONS } from '@/common/config.js'
import BrandMark from '@/components/brand-mark/brand-mark.vue'

export default {
    name: 'ride-review',
    components: { BrandMark },
    props: {
        show: { type: Boolean, default: false },
        pending: { type: Object, default: () => ({}) }
    },
    data() { return { options: FEELING_OPTIONS, tags: [], note: '', submitting: false } },
    watch: {
        // 每次打开重置输入，避免上一场的残留
        show(v) { if (v) { this.tags = []; this.note = '' } }
    },
    methods: {
        toggle(e) {
            const f = e.currentTarget.dataset.f
            const i = this.tags.indexOf(f)
            if (i >= 0) this.tags.splice(i, 1); else this.tags.push(f)
        },
        async submit() {
            if (this.tags.length === 0 && !this.note.trim()) { uni.showToast({ title: '选个标签或写一句吧', icon: 'none' }); return }
            if (this.submitting) return
            this.submitting = true
            try {
                if (this.tags.length) await submitFeeling(this.pending.activityId, this.tags)
                if (this.note.trim()) await updateJournalEntry(this.pending.entryId, { note: this.note.trim() })
                uni.showToast({ title: '已记入骑行日记', icon: 'success' })
                this.$emit('done')
            } catch (e) {} finally { this.submitting = false }
        },
        skip() { this.$emit('close') }
    }
}
</script>

<style lang="scss" scoped>
.rrmask { position: fixed; inset: 0; z-index: 60; background: rgba(9,20,15,.6); display: flex; align-items: flex-end; }
.rrsheet { width: 100%; background: $card; border-radius: 34rpx 34rpx 0 0; padding: 36rpx 34rpx calc(30rpx + env(safe-area-inset-bottom)); }
.rrhd { display: flex; align-items: center; justify-content: space-between; }
.rrk { display: block; font-size: 20rpx; letter-spacing: 2rpx; color: $green-deep; font-weight: 800; }
.rrt { display: block; font-size: 34rpx; font-weight: 800; margin-top: 10rpx; }
.rrlabel { display: block; font-size: 25rpx; font-weight: 800; color: $ink; margin-top: 30rpx; }
.rrchips { display: flex; flex-wrap: wrap; gap: 14rpx; margin-top: 18rpx; }
.rrchip { font-size: 23rpx; font-weight: 700; padding: 14rpx 24rpx; border-radius: 18rpx; background: $paper; color: $ink-2; }
.rrchip.on { background: $green; color: #04140c; font-weight: 800; }
.rrnote { width: 100%; min-height: 130rpx; background: $paper; border-radius: 20rpx; padding: 22rpx; font-size: 26rpx; box-sizing: border-box; margin-top: 18rpx; }
.rrph { color: $faint; }
.rrcount { display: block; text-align: right; font-size: 20rpx; color: $faint; margin-top: 8rpx; }
.rrgo { margin-top: 22rpx; height: 88rpx; border-radius: 24rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 28rpx; display: flex; align-items: center; justify-content: center; }
.rrskip { display: block; text-align: center; color: $muted; font-size: 24rpx; padding: 24rpx 0 6rpx; }
</style>
