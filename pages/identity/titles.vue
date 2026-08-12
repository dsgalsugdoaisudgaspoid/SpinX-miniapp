<template>
    <view class="tl">
        <view class="head" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>
            <text class="eye">MY TITLES · 我的称号</text>
            <text class="ht">每个称号，都是一件真实发生过的事</text>
            <text class="hs">{{ active.length }} 个已获得 · {{ locked.length }} 个待解锁</text>
        </view>

        <view class="sec">已获得</view>
        <view class="grid">
            <view v-for="t in active" :key="t.titleId" :class="['cell', 'on', t.kind === 'manual' ? 'manual' : '', primaryTitleId === t.titleId ? 'primary' : '']"
                :data-id="t.titleId" @tap="pick">
                <text class="ci">{{ t.icon }}</text>
                <text class="ct">{{ t.name }}</text>
                <text class="cd ellipsis-2">{{ t.desc || (t.awardedBy ? ('领队 ' + t.awardedBy + ' 颁发') : '') }}</text>
                <text v-if="primaryTitleId === t.titleId" class="ptag">主称号</text>
            </view>
            <view v-if="active.length === 0" class="empty-inline">还没有获得任何称号，去参加一场活动吧</view>
        </view>

        <view class="sec">待解锁</view>
        <view class="grid">
            <view v-for="t in locked" :key="t.titleId" class="cell off">
                <text class="ci">{{ t.icon }}</text>
                <text class="ct">{{ t.name }}</text>
                <text class="cd ellipsis-2">{{ t.desc }}</text>
            </view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getMyTitles, setPrimaryTitle } from '@/api/identity.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, active: [], catalog: [], primaryTitleId: null } },
    computed: {
        locked() {
            const gotIds = this.active.map(t => t.titleId)
            return this.catalog.filter(t => t.kind === 'auto' && !gotIds.includes(t.titleId))
        }
    },
    onShow() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/profile/profile' }) },
        async load() {
            try {
                const d = await getMyTitles()
                this.active = (d && d.active) || []
                this.catalog = (d && d.catalog) || []
                this.primaryTitleId = (d && d.primaryTitleId) || null
            } catch (e) {}
        },
        async pick(e) {
            const id = e.currentTarget.dataset.id
            if (id === this.primaryTitleId) return
            try {
                await setPrimaryTitle(id)
                this.primaryTitleId = id
                uni.showToast({ title: '已设为主称号', icon: 'success' })
            } catch (err) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.tl { min-height: 100vh; background: $paper; }
.head { padding: 0 40rpx 44rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, $night-1, $night-2 58%, $night-3); }
.nav { position: relative; margin-bottom: 14rpx; }
.nbtn { width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 24%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 18%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 12%, #fff, transparent); }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.ht { position: relative; display: block; font-size: 38rpx; font-weight: 800; margin-top: 14rpx; }
.hs { position: relative; display: block; font-size: 21rpx; opacity: .8; margin-top: 12rpx; }

.sec { font-size: 28rpx; font-weight: 800; margin: 32rpx 30rpx 16rpx; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); grid-gap: 18rpx; gap: 18rpx; padding: 0 28rpx; }
.cell { position: relative; background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; min-height: 190rpx; }
.cell.on { box-shadow: inset 0 0 0 2rpx $green; }
.cell.on.manual { box-shadow: inset 0 0 0 2rpx #f0a017; }
.cell.on.primary { background: $green-soft; }
.cell.off { opacity: .5; }
.ci { font-size: 44rpx; }
.ct { display: block; font-size: 26rpx; font-weight: 800; margin-top: 12rpx; }
.cd { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 20rpx; color: $muted; margin-top: 8rpx; line-height: 1.5; }
.ptag { position: absolute; top: 18rpx; right: 18rpx; font-size: 17rpx; font-weight: 800; color: $green-deep; background: rgba(255,255,255,.7); padding: 3rpx 10rpx; border-radius: 8rpx; }
.empty-inline { grid-column: 1 / -1; text-align: center; color: $faint; font-size: 22rpx; padding: 40rpx 0; }
.safe-bottom { height: 50rpx; }
</style>
