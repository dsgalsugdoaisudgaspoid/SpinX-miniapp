<template>
    <view v-if="title" :class="['tbadge', kind === 'manual' ? 'manual' : '', size]">
        <text class="tbi">{{ title.icon }}</text>
        <text class="tbn">{{ title.name }}</text>
    </view>
</template>

<script>
export default {
    name: 'title-badge',
    props: {
        title: { type: Object, default: null }, // { icon, name, kind? }
        size: { type: String, default: 'md' }    // 'sm' | 'md'
    },
    computed: {
        kind() { return this.title && this.title.kind }
    }
}
</script>

<style lang="scss" scoped>
.tbadge { display: inline-flex; align-items: center; gap: 6rpx; padding: 6rpx 16rpx; border-radius: 14rpx;
    background: $green; color: #04140c; font-weight: 800; }
.tbadge.manual { background: linear-gradient(120deg, #ffd36e, #f0a017); }
.tbadge.sm { padding: 4rpx 12rpx; border-radius: 10rpx; }
.tbi { font-size: 22rpx; }
.tbadge.sm .tbi { font-size: 19rpx; }
.tbn { font-size: 21rpx; }
.tbadge.sm .tbn { font-size: 18rpx; }
</style>
