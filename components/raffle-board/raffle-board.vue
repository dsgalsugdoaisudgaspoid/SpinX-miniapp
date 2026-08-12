<template>
    <view class="raffle" v-if="raffle && raffle.enabled">
        <view class="rfhd"><text class="rft">{{ title }}</text><text :class="['rfst', raffle.drawn ? 'done' : '']">{{ statusText }}</text></view>
        <view class="prizes">
            <view v-for="p in raffle.prizes" :key="p.prizeId" class="prz">
                <text class="pzi">{{ p.icon }}</text>
                <view class="pzmid"><text class="pzc">{{ p.category }}</text><text class="pzn ellipsis">{{ p.name }}</text></view>
                <text class="pzq mono">×{{ p.quantity }}</text>
            </view>
        </view>
        <view v-if="raffle.myPrize" class="rfwin">🎉 你抽中了「{{ raffle.myPrize.category }} · {{ raffle.myPrize.prizeName }}」，到店领取</view>
        <text v-if="note" class="rfnote">{{ note }}</text>
    </view>
</template>

<script>
export default {
    name: 'raffle-board',
    props: {
        raffle: { type: Object, default: null },
        title: { type: String, default: '🎁 抽奖' },
        statusText: { type: String, default: '' },
        note: { type: String, default: '' }
    }
}
</script>

<style lang="scss" scoped>
.raffle { background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.rfhd { display: flex; align-items: center; }
.rft { font-size: 28rpx; font-weight: 800; }
.rfst { margin-left: auto; font-size: 20rpx; font-weight: 800; color: #b5750c; background: #fbf1e4; padding: 6rpx 16rpx; border-radius: 14rpx; }
.rfst.done { color: $green-deep; background: $green-soft; }
.prizes { margin-top: 18rpx; display: flex; flex-direction: column; gap: 12rpx; }
.prz { display: flex; align-items: center; gap: 16rpx; background: $paper; border-radius: 18rpx; padding: 18rpx 20rpx; }
.pzi { font-size: 40rpx; flex: none; }
.pzmid { flex: 1; min-width: 0; }
.pzc { display: block; font-size: 19rpx; font-weight: 800; color: #b5750c; }
.pzn { display: block; font-size: 25rpx; font-weight: 700; margin-top: 4rpx; }
.pzq { font-size: 28rpx; font-weight: 800; color: $ink; flex: none; }
.rfwin { margin-top: 16rpx; font-size: 24rpx; font-weight: 800; color: #04140c; background: $green; border-radius: 16rpx; padding: 18rpx; text-align: center; }
.rfnote { display: block; margin-top: 14rpx; font-size: 21rpx; color: $muted; line-height: 1.6; }
</style>
