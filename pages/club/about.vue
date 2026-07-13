<template>
    <view class="about">
        <view class="hero" style="padding-top: 50rpx">
            <view class="stars"></view>
            <view class="mark"><text class="mono">SX</text></view>
            <text class="wm">SPIN X</text>
            <text class="cn">{{ club.name || '环星骑行俱乐部' }}</text>
            <text class="sl">夜骑 · 拉练 · 公益骑 · 跨城骑</text>
        </view>

        <view class="intro">
            <text class="p">{{ club.description || '专为骑行爱好者打造的轻量化、全闭环、高合规官方俱乐部，覆盖会员管理、活动报名、出行合规、积分运营、内容展示全场景。' }}</text>
        </view>

        <view class="sec">四大原则</view>
        <view class="grid">
            <view class="cell"><text class="ci">🛡</text><text class="ct">合规优先</text><text class="cd">标准化电子合规流程，规避出行风险</text></view>
            <view class="cell"><text class="ci">🎯</text><text class="ct">权限分级</text><text class="cd">四角色各司其职，杜绝操作混乱</text></view>
            <view class="cell"><text class="ci">⭐</text><text class="ct">积分驱动</text><text class="cd">参与与传播双驱动的会员成长体系</text></view>
            <view class="cell"><text class="ci">⚡</text><text class="ct">轻量体验</text><text class="cd">微信一键进入，适配全年龄骑友</text></view>
        </view>

        <view class="sec">会员等级</view>
        <view class="levels">
            <view class="lv"><text class="ln">入门骑行者</text><text class="lp mono">0+</text></view>
            <view class="lv"><text class="ln">常驻会员</text><text class="lp mono">1000+</text></view>
            <view class="lv"><text class="ln">核心会员</text><text class="lp mono">3000+</text></view>
            <view class="lv"><text class="ln">荣誉会员</text><text class="lp mono">8000+</text></view>
        </view>
        <text class="note">等级永久不降级，凭积分成长，逐级解锁优先报名、周边兑换、保险补贴、装备借用等专属权益。</text>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getClubInfo } from '@/api/home.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, club: {} } },
    onLoad() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        async load() { try { const d = await getClubInfo(); this.club = d || {} } catch (e) {} }
    }
}
</script>

<style lang="scss" scoped>
.about { min-height: 100vh; background: $paper; }
.hero { padding: 0 40rpx 56rpx; color: #fff; position: relative; overflow: hidden; text-align: center;
    background: linear-gradient(165deg, #0e1b24, #123a57 60%, #0a5c86); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(2rpx 2rpx at 54% 14%, #fff, transparent); }
.mark { position: relative; width: 104rpx; height: 104rpx; border-radius: 50%; border: 2rpx solid rgba(255,255,255,.3); display: flex; align-items: center; justify-content: center; margin: 0 auto; }
.mark .mono { font-weight: 800; font-size: 38rpx; letter-spacing: -2rpx; }
.wm { position: relative; display: block; font-size: 64rpx; font-weight: 800; font-style: italic; letter-spacing: 4rpx; margin-top: 24rpx; }
.cn { position: relative; display: block; font-size: 32rpx; font-weight: 700; margin-top: 8rpx; }
.sl { position: relative; display: block; font-size: 23rpx; opacity: .8; margin-top: 14rpx; }

.intro { margin: -30rpx 28rpx 0; position: relative; z-index: 2; background: $card; border-radius: 28rpx; padding: 30rpx; box-shadow: 0 18rpx 40rpx -18rpx rgba(9,20,15,.4); }
.intro .p { font-size: 26rpx; color: $ink-2; line-height: 1.8; }

.sec { font-size: 30rpx; font-weight: 800; margin: 34rpx 30rpx 18rpx; }
.grid { display: flex; flex-wrap: wrap; gap: 18rpx; padding: 0 28rpx; }
.cell { width: calc(50% - 9rpx); background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.ci { font-size: 44rpx; } .ct { display: block; font-size: 27rpx; font-weight: 800; margin-top: 12rpx; }
.cd { display: block; font-size: 21rpx; color: $muted; margin-top: 8rpx; line-height: 1.5; }

.levels { display: flex; gap: 12rpx; padding: 0 28rpx; }
.lv { flex: 1; background: $card; border-radius: 20rpx; padding: 22rpx 8rpx; text-align: center; box-shadow: inset 0 0 0 1rpx $hair; }
.ln { display: block; font-size: 20rpx; font-weight: 700; }
.lp { display: block; font-size: 22rpx; color: $green-deep; font-weight: 800; margin-top: 6rpx; }
.note { display: block; margin: 18rpx 30rpx 0; font-size: 22rpx; color: $muted; line-height: 1.7; }
.safe-bottom { height: 60rpx; }
</style>
