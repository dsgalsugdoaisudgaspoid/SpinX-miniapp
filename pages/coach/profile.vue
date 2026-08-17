<template>
    <view class="cprofile">
        <block v-if="profile && profile.status === 'active'">
            <view class="hero">
                <view class="stars"></view>
                <view class="av"></view>
                <text class="nm">{{ spx(profile.nickname) }}</text>
                <text class="lvbadge" :style="lvStyle">{{ profile.levelLabel }}陪练</text>
                <text class="rate mono">{{ money(profile.hourlyRate) }}/小时</text>
            </view>

            <view class="metrics">
                <view class="m"><text class="mn mono">★{{ rating }}</text><text class="ml">评分</text></view>
                <view class="m"><text class="mn mono">{{ profile.ratingCount || 0 }}</text><text class="ml">评价</text></view>
                <view class="m"><text class="mn mono">{{ profile.totalOrders || 0 }}</text><text class="ml">接单</text></view>
                <view class="m"><text class="mn mono">{{ profile.avgSpeedKmh || '—' }}</text><text class="ml">均速</text></view>
            </view>

            <view class="block">
                <text class="bt">我的介绍</text>
                <text class="bi">{{ profile.intro || '暂无' }}</text>
                <view class="tags" v-if="profile.tags && profile.tags.length">
                    <text v-for="t in profile.tags" :key="t" class="tag">{{ t }}</text>
                </view>
            </view>

            <view class="g-btn goorders" @tap="goOrders">查看我接的订单</view>
            <text class="hint">等级与时薪由平台考核核定，如需调整请联系管理员</text>
        </block>

        <view v-else-if="profile && profile.status === 'pending'" class="statebox">
            <text class="si">⏳</text><text class="st">陪练申请审核中</text><text class="ss">平台考核后会通知你</text>
        </view>

        <view v-else class="statebox">
            <text class="si">🚴</text>
            <text class="st">{{ profile && profile.status === 'rejected' ? '上次考核未通过' : '你还不是陪练' }}</text>
            <text class="ss">通过平台考核，按等级接单赚收入</text>
            <view class="g-btn apply" @tap="goApply">申请成为陪练</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { myCoachProfile } from '@/api/coach.js'
import { levelStyle } from '@/common/coachLevel.js'
import { spxName } from '@/common/util.js'

export default {
    data() { return { profile: null } },
    computed: {
        rating() { return this.profile && this.profile.rating != null ? Number(this.profile.rating).toFixed(1) : '5.0' },
        lvStyle() { return levelStyle(this.profile ? this.profile.level : '') }
    },
    onShow() { this.load() },
    methods: {
        spx(n) { return spxName(n) },
        money(v) { return v == null ? '—' : '¥' + Number(v) },
        async load() { try { this.profile = await myCoachProfile() } catch (e) { this.profile = null } },
        goOrders() { uni.navigateTo({ url: '/pages/coach/orders?tab=recv' }) },
        goApply() { uni.navigateTo({ url: '/pages/coach/apply' }) }
    }
}
</script>

<style lang="scss" scoped>
.cprofile { min-height: 100vh; background: $paper; }
.hero { padding: 44rpx 30rpx 34rpx; text-align: center; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, #0e1b24, #123a57 60%, #0a5c86); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 22% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent); }
.av { position: relative; width: 120rpx; height: 120rpx; border-radius: 38rpx; margin: 0 auto; background: linear-gradient(135deg, #5ecb8f, #0ba968); box-shadow: 0 0 0 4rpx rgba(255,255,255,.25); }
.nm { position: relative; display: block; font-size: 38rpx; font-weight: 800; margin-top: 16rpx; }
.lvbadge { position: relative; display: inline-block; font-size: 21rpx; font-weight: 800; padding: 5rpx 16rpx; border-radius: 12rpx; margin-top: 12rpx; }
.rate { position: relative; display: block; font-size: 30rpx; font-weight: 800; margin-top: 14rpx; color: #d6ffe9; }
.metrics { display: flex; margin: -20rpx 24rpx 0; position: relative; z-index: 2; background: $card; border-radius: 24rpx; padding: 26rpx 0; box-shadow: 0 16rpx 34rpx -18rpx rgba(9,20,15,.4); }
.m { flex: 1; text-align: center; }
.mn { display: block; font-size: 36rpx; font-weight: 800; }
.ml { display: block; font-size: 19rpx; color: $muted; margin-top: 4rpx; }
.block { margin: 26rpx 24rpx 0; background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.bt { font-size: 26rpx; font-weight: 800; }
.bi { display: block; font-size: 25rpx; color: $ink-2; line-height: 1.7; margin-top: 12rpx; }
.tags { display: flex; gap: 10rpx; margin-top: 14rpx; flex-wrap: wrap; }
.tag { font-size: 21rpx; color: $green-deep; background: $green-soft; padding: 5rpx 14rpx; border-radius: 12rpx; }
.goorders { margin: 26rpx 24rpx 0; }
.hint { display: block; text-align: center; font-size: 21rpx; color: $faint; margin-top: 16rpx; }

.statebox { margin: 60rpx 24rpx; background: $card; border-radius: 28rpx; padding: 70rpx 30rpx; text-align: center; box-shadow: inset 0 0 0 1rpx $hair; }
.statebox .si { font-size: 72rpx; }
.statebox .st { display: block; font-size: 30rpx; font-weight: 800; margin-top: 18rpx; }
.statebox .ss { display: block; font-size: 23rpx; color: $muted; margin-top: 10rpx; }
.statebox .apply { margin-top: 30rpx; }
.safe-bottom { height: 40rpx; }
</style>
