<template>
    <view class="about">
        <!-- 品牌 Hero -->
        <view class="hero" :style="{ paddingTop: (statusBar + 40) + 'px' }">
            <image class="watermark" :src="brand.logo.markWhite" mode="aspectFit"></image>
            <view class="stars"></view>
            <image class="wm" :src="brand.logo.wordmarkWhite" mode="aspectFit"></image>
            <text class="cn">环星骑行俱乐部</text>
            <text class="tagEn">{{ brand.taglineEn }}</text>
            <view class="badges">
                <text class="bd">📍 {{ brand.city }}</text>
                <text class="bd">{{ brand.ritual }}</text>
            </view>
        </view>

        <!-- 一句话口号 + 品牌释义 -->
        <view class="intro">
            <text class="slo">“{{ brand.slogan }}”</text>
            <text class="p">{{ brand.story }}</text>
        </view>

        <!-- 俱乐部数据 -->
        <view class="stats">
            <view v-for="(s, i) in brand.stats" :key="i" class="stat">
                <text class="sn mono">{{ s.n }}</text>
                <text class="sl">{{ s.l }}</text>
            </view>
        </view>

        <!-- 骑行文化 -->
        <view class="sec">我们的骑行文化</view>
        <view class="grid">
            <view v-for="(v, i) in brand.values" :key="i" class="cell">
                <text class="ci">{{ v.icon }}</text>
                <text class="ct">{{ v.t }}</text>
                <text class="cd">{{ v.d }}</text>
            </view>
        </view>

        <!-- 大事记时间线 -->
        <view class="sec">环星大事记</view>
        <view class="timeline">
            <view v-for="(e, i) in brand.timeline" :key="i" class="titem">
                <view class="track">
                    <view class="dot" :class="{ first: i === 0 }"></view>
                    <view v-if="i < brand.timeline.length - 1" class="rail"></view>
                </view>
                <view class="tbody">
                    <text class="tdate mono">{{ e.date }}</text>
                    <text class="ttitle">{{ e.title }}</text>
                    <text class="tdesc">{{ e.desc }}</text>
                </view>
            </view>
        </view>

        <!-- 成员分类 -->
        <view class="sec">成员分类</view>
        <view class="tiers">
            <view v-for="t in tiers" :key="t.key" class="tier">
                <text class="tico">{{ t.icon }}</text>
                <view class="tmid"><text class="tn">{{ t.name }} · {{ t.en }}</text><text class="td">{{ t.desc }}</text></view>
                <text class="tarw" v-if="t.key !== 'sun'">→</text>
            </view>
        </view>
        <text class="note">新加入即为「星星」。通过「考核活动」在规定时间内完成骑行，即可依次升级为月亮、太阳，解锁更多专属权益。</text>

        <!-- 落款 -->
        <view class="sign">
            <image class="sgw" :src="brand.logo.wordmarkBlack" mode="aspectFit"></image>
            <text class="sgc">环星骑行 · {{ brand.city }}</text>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getClubInfo } from '@/api/home.js'
import { statusBarHeight } from '@/common/util.js'
import { BRAND, MEMBER_TIERS } from '@/common/config.js'

export default {
    data() { return { statusBar: 20, brand: BRAND, tiers: MEMBER_TIERS, club: {} } },
    onLoad() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        async load() { try { const d = await getClubInfo(); this.club = d || {} } catch (e) {} }
    }
}
</script>

<style lang="scss" scoped>
.about { min-height: 100vh; background: $paper; }
.hero { padding: 0 40rpx 60rpx; color: #fff; position: relative; overflow: hidden; text-align: center;
    background: linear-gradient(165deg, $night-1, $night-2 58%, $night-3); }
.watermark { position: absolute; top: -30rpx; right: -60rpx; width: 460rpx; height: 460rpx; opacity: .06; }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 26%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 20%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 12%, #fff, transparent), radial-gradient(2rpx 2rpx at 34% 40%, #bfe9ff, transparent); }
.wm { position: relative; display: block; width: 360rpx; height: 58rpx; margin: 0 auto; }
.cn { position: relative; display: block; font-size: 30rpx; font-weight: 700; margin-top: 18rpx; letter-spacing: 2rpx; }
.tagEn { position: relative; display: block; font-size: 19rpx; letter-spacing: 3rpx; opacity: .72; margin-top: 16rpx; }
.badges { position: relative; display: flex; justify-content: center; flex-wrap: wrap; gap: 12rpx; margin-top: 24rpx; }
.bd { font-size: 19rpx; font-weight: 700; padding: 6rpx 18rpx; border-radius: 16rpx; background: rgba(255,255,255,.14); }

.intro { margin: -34rpx 28rpx 0; position: relative; z-index: 2; background: $card; border-radius: 28rpx; padding: 32rpx 30rpx; box-shadow: 0 18rpx 40rpx -18rpx rgba(9,20,15,.4); }
.slo { display: block; font-size: 30rpx; font-weight: 800; color: $green-deep; letter-spacing: 1rpx; }
.intro .p { display: block; font-size: 26rpx; color: $ink-2; line-height: 1.86; margin-top: 18rpx; }

.stats { display: flex; margin: 22rpx 28rpx 0; background: $card; border-radius: 26rpx; padding: 30rpx 8rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.stat { flex: 1; text-align: center; position: relative; }
.stat + .stat::before { content: ''; position: absolute; left: 0; top: 12rpx; bottom: 12rpx; width: 1rpx; background: $hair; }
.sn { display: block; font-size: 38rpx; font-weight: 800; color: $ink; letter-spacing: -1rpx; }
.sl { display: block; font-size: 20rpx; color: $muted; margin-top: 8rpx; }

.sec { font-size: 30rpx; font-weight: 800; margin: 36rpx 30rpx 18rpx; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); grid-gap: 18rpx; gap: 18rpx; padding: 0 28rpx; }
.cell { background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.ci { font-size: 44rpx; }
.ct { display: block; font-size: 27rpx; font-weight: 800; margin-top: 12rpx; }
.cd { display: block; font-size: 21rpx; color: $muted; margin-top: 8rpx; line-height: 1.6; min-height: 96rpx; }

/* 时间线 */
.timeline { padding: 4rpx 28rpx 0; }
.titem, .tbody { min-width: 0; }
.titem { display: flex; gap: 22rpx; }
.track { width: 24rpx; flex: none; display: flex; flex-direction: column; align-items: center; padding-top: 8rpx; }
.dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: $card; box-shadow: inset 0 0 0 4rpx $green; flex: none; }
.dot.first { background: $green; box-shadow: 0 0 0 6rpx $green-soft; }
.rail { flex: 1; width: 3rpx; background: $line; margin-top: 6rpx; min-height: 40rpx; }
.tbody { flex: 1; padding-bottom: 34rpx; }
.tdate { display: block; font-size: 22rpx; font-weight: 800; color: $green-deep; letter-spacing: 1rpx; }
.ttitle { display: block; font-size: 28rpx; font-weight: 800; margin-top: 6rpx; }
.tdesc { display: block; font-size: 22rpx; color: $muted; line-height: 1.66; margin-top: 8rpx; }

.tiers { padding: 0 28rpx; display: flex; flex-direction: column; gap: 14rpx; }
.tier { display: flex; align-items: center; gap: 20rpx; background: $card; border-radius: 22rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; position: relative; }
.tico { font-size: 48rpx; flex: none; }
.tmid { flex: 1; min-width: 0; }
.tn { display: block; font-size: 27rpx; font-weight: 800; }
.td { display: block; font-size: 21rpx; color: $muted; margin-top: 6rpx; }
.tarw { color: $faint; font-size: 30rpx; font-weight: 800; }
.note { display: block; margin: 18rpx 30rpx 0; font-size: 22rpx; color: $muted; line-height: 1.7; }

.sign { text-align: center; margin: 44rpx 0 0; }
.sgw { display: block; width: 220rpx; height: 34rpx; margin: 0 auto; opacity: .32; }
.sgc { display: block; font-size: 20rpx; color: $faint; margin-top: 12rpx; }
.safe-bottom { height: 60rpx; }
</style>
