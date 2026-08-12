<template>
    <view class="phi">
        <!-- 理念 Hero -->
        <view class="hero">
            <view class="stars"></view>
            <text class="kick">{{ p.kicker }}</text>
            <text class="cn">我们的理念</text>
            <view class="hl"><text v-for="(l, i) in headlineLines" :key="i" class="hll">{{ l }}</text></view>
        </view>

        <!-- 理念阐释 -->
        <view class="ecard">
            <view class="ebar"></view>
            <text class="et">{{ p.ethos }}</text>
        </view>

        <!-- 主理人愿景 -->
        <view class="sec">{{ p.visionTitle }}</view>
        <view class="vcard">
            <text class="vq">“</text>
            <text class="vt">{{ p.vision }}</text>
        </view>

        <!-- 理念条目 -->
        <view class="tenets">
            <view v-for="(t, i) in p.tenets" :key="i" class="tn">
                <text class="tni">{{ t.icon }}</text>
                <view class="tnb"><text class="tnt">{{ t.t }}</text><text class="tnd">{{ t.d }}</text></view>
            </view>
        </view>

        <!-- 落款 -->
        <view class="sign">
            <image class="sgw" :src="brand.logo.wordmarkBlack" mode="aspectFit"></image>
            <text class="sgc">{{ p.signoff }}</text>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { BRAND } from '@/common/config.js'

export default {
    data() { return { brand: BRAND, p: BRAND.philosophy } },
    computed: {
        headlineLines() { return (this.p.ethosHeadline || '').split('\n') }
    }
}
</script>

<style lang="scss" scoped>
.phi { min-height: 100vh; background: $paper; }
.hero { padding: 56rpx 40rpx 64rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, $night-1, $night-2 58%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .55;
    background: radial-gradient(2rpx 2rpx at 18% 24%, #fff, transparent), radial-gradient(2rpx 2rpx at 74% 18%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 52% 12%, #fff, transparent), radial-gradient(2rpx 2rpx at 36% 40%, #bfe9ff, transparent); }
.kick { position: relative; display: block; font-size: 20rpx; letter-spacing: 3rpx; opacity: .8; }
.cn { position: relative; display: block; font-size: 24rpx; font-weight: 700; opacity: .9; margin-top: 14rpx; letter-spacing: 2rpx; }
.hl { position: relative; margin-top: 20rpx; }
.hll { display: block; font-size: 46rpx; font-weight: 800; line-height: 1.4; letter-spacing: 1rpx; }

.ecard { margin: -34rpx 28rpx 0; position: relative; z-index: 2; background: $card; border-radius: 28rpx; padding: 30rpx 30rpx 30rpx 34rpx; box-shadow: 0 18rpx 40rpx -18rpx rgba(9,20,15,.4); overflow: hidden; }
.ebar { position: absolute; left: 0; top: 30rpx; bottom: 30rpx; width: 8rpx; border-radius: 0 6rpx 6rpx 0; background: linear-gradient(180deg, $green, $green-deep); }
.et { display: block; font-size: 26rpx; color: $ink-2; line-height: 1.95; }

.sec { font-size: 30rpx; font-weight: 800; margin: 36rpx 30rpx 16rpx; }
.vcard { margin: 0 28rpx; background: $card; border-radius: 28rpx; padding: 30rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.vq { display: block; font-size: 66rpx; font-weight: 800; color: $green; line-height: .6; height: 38rpx; }
.vt { display: block; font-size: 26rpx; color: $ink-2; line-height: 1.9; margin-top: 6rpx; }

.tenets { padding: 18rpx 28rpx 0; display: flex; flex-direction: column; gap: 18rpx; }
.tn { display: flex; gap: 22rpx; background: $card; border-radius: 26rpx; padding: 28rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.tni { font-size: 52rpx; flex: none; line-height: 1.2; }
.tnb { flex: 1; min-width: 0; }
.tnt { display: block; font-size: 29rpx; font-weight: 800; }
.tnd { display: block; font-size: 23rpx; color: $muted; line-height: 1.8; margin-top: 10rpx; }

.sign { text-align: center; margin: 44rpx 0 0; }
.sgw { display: block; width: 220rpx; height: 34rpx; margin: 0 auto; opacity: .3; }
.sgc { display: block; font-size: 21rpx; color: $faint; margin-top: 12rpx; letter-spacing: 1rpx; }
.safe-bottom { height: 60rpx; }
</style>
