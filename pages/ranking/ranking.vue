<template>
    <view class="rank">
        <!-- 头部 -->
        <view class="rhead" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <text class="eye">MONTHLY RANKING · 本月骑行榜</text>
            <text class="rt">谁踩得最远</text>
            <text class="rp">按本月在环星参加活动的累计骑行距离排名 · {{ monthLabel }}</text>

            <!-- 前三名领奖台 -->
            <view class="podium" v-if="top3.length">
                <view v-for="(u, i) in top3" :key="u.userId" :class="['pod', 'p' + u.rank]" :data-uid="u.userId" @tap="goMember">
                    <view class="pav" :style="{ backgroundImage: u.avatar ? ('url(' + u.avatar + ')') : '' }"></view>
                    <text class="pmedal">{{ medal(u.rank) }}</text>
                    <text class="pname ellipsis">{{ spx(u.nickname) }}</text>
                    <text class="pkm mono">{{ u.distance }}<text class="unit">km</text></text>
                </view>
            </view>
        </view>

        <!-- 我的排名 -->
        <view class="mine" v-if="myRank">
            <text class="mrk mono">{{ myRank.rank <= 99 ? ('NO.' + myRank.rank) : '99+' }}</text>
            <view class="mav"></view>
            <view class="mmid"><text class="mn">我 · {{ spx(myRank.nickname) }}</text><text class="ms">本月 {{ myRank.rides }} 场 · 累计 {{ myRank.distance }}km</text></view>
            <text class="mtag">我的排名</text>
        </view>

        <!-- 完整榜单（第 4 名起） -->
        <view class="listbox">
            <view class="lhd"><text>完整榜单</text><text class="cnt">共 {{ totalRiders }} 位骑友上榜</text></view>
            <view v-for="u in rest" :key="u.userId" class="row" :class="{ me: myRank && u.userId === myRank.userId }" :data-uid="u.userId" @tap="goMember">
                <text class="rk mono">{{ u.rank }}</text>
                <view class="rav" :style="{ backgroundImage: u.avatar ? ('url(' + u.avatar + ')') : '' }"></view>
                <view class="rmid"><text class="rn ellipsis">{{ spx(u.nickname) }}</text><text class="rs">{{ u.rides }} 场活动</text></view>
                <text class="rkm mono">{{ u.distance }}<text class="unit">km</text></text>
            </view>
            <view v-if="!loading && list.length === 0" class="empty">本月还没有骑行数据</view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>

        <text class="foot">榜单每日 08:00 更新 · 数据来自小程序活动签到里程</text>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getRanking } from '@/api/home.js'
import { statusBarHeight, spxName, goMemberProfile } from '@/common/util.js'
import { isLoggedIn } from '@/store/user.js'

export default {
    data() { return { statusBar: 20, list: [], myRank: null, month: '', totalRiders: 0, loading: false } },
    computed: {
        top3() { return this.list.slice(0, 3) },
        rest() { return this.list.slice(3) },
        monthLabel() {
            if (!this.month) return '本月'
            const parts = this.month.split('-')
            return parts.length === 2 ? (parts[0] + ' 年 ' + (+parts[1]) + ' 月') : this.month
        }
    },
    onLoad() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        spx(n) { return spxName(n) },
        goMember(e) { goMemberProfile(e.currentTarget.dataset.uid) },
        medal(rank) { return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '' },
        async load() {
            this.loading = true
            try {
                const d = await getRanking()
                this.list = (d && d.list) || []
                this.month = (d && d.month) || ''
                this.totalRiders = (d && d.totalRiders) || this.list.length
                this.myRank = isLoggedIn() ? (d && d.myRank) || null : null
            } catch (e) { this.list = [] } finally { this.loading = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.rank { min-height: 100vh; background: $paper; }
.rhead { padding: 0 34rpx 40rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, $night-1, $night-2 58%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 20%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 16%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 10%, #fff, transparent); }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.rt { position: relative; display: block; font-size: 44rpx; font-weight: 800; margin-top: 12rpx; }
.rp { position: relative; display: block; font-size: 21rpx; opacity: .8; margin-top: 10rpx; line-height: 1.5; }

/* 领奖台 */
.podium { position: relative; display: flex; align-items: flex-end; justify-content: center; gap: 20rpx; margin-top: 40rpx; }
.pod { flex: 1; max-width: 200rpx; background: rgba(255,255,255,.08); border-radius: 24rpx; padding: 20rpx 12rpx; text-align: center; position: relative; }
.pod.p1 { order: 2; background: rgba(240,160,23,.2); box-shadow: inset 0 0 0 2rpx rgba(255,209,110,.6); padding-top: 30rpx; }
.pod.p2 { order: 1; }
.pod.p3 { order: 3; }
.pav { width: 96rpx; height: 96rpx; border-radius: 50%; margin: 0 auto; background-color: #2a4258; background-size: cover; background-position: center;
    background-image: linear-gradient(140deg, #5ecb8f, #0ba968); box-shadow: 0 0 0 4rpx rgba(255,255,255,.2); }
.pod.p1 .pav { width: 118rpx; height: 118rpx; }
.pmedal { display: block; font-size: 32rpx; margin-top: -18rpx; }
.pname { display: block; font-size: 22rpx; font-weight: 700; margin-top: 6rpx; max-width: 100%; }
.pkm { display: block; font-size: 30rpx; font-weight: 800; margin-top: 6rpx; color: #ffd36e; letter-spacing: -1rpx; }
.unit { font-size: 18rpx; font-weight: 700; margin-left: 4rpx; opacity: .8; }

/* 我的排名 */
.mine { display: flex; align-items: center; gap: 20rpx; margin: 22rpx 28rpx 0; background: $night-2; border-radius: 26rpx; padding: 24rpx 26rpx; box-shadow: 0 16rpx 36rpx -20rpx rgba(14,27,36,.8); }
.mrk { font-size: 34rpx; font-weight: 800; color: $green; flex: none; letter-spacing: -1rpx; }
.mav { width: 84rpx; height: 84rpx; border-radius: 24rpx; flex: none; background: linear-gradient(140deg, #5ecb8f, #0ba968); box-shadow: 0 0 0 3rpx rgba(255,255,255,.2); }
.mmid { flex: 1; min-width: 0; }
.mn { display: block; font-size: 28rpx; font-weight: 800; color: #fff; }
.ms { display: block; font-size: 21rpx; color: rgba(255,255,255,.7); margin-top: 8rpx; }
.mtag { font-size: 19rpx; font-weight: 700; color: #04140c; background: $green; padding: 6rpx 14rpx; border-radius: 12rpx; flex: none; }

/* 榜单 */
.listbox { margin: 22rpx 28rpx 0; background: $card; border-radius: 28rpx; padding: 6rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.lhd { display: flex; align-items: baseline; padding: 24rpx 0 12rpx; font-size: 27rpx; font-weight: 800; }
.lhd .cnt { margin-left: auto; font-size: 20rpx; color: $muted; font-weight: 600; }
.row { display: flex; align-items: center; gap: 20rpx; padding: 20rpx 0; border-top: 1rpx solid $hair; }
.row.me { margin: 0 -16rpx; padding: 20rpx 16rpx; background: $green-soft; border-radius: 18rpx; border-top-color: transparent; }
.rk { width: 48rpx; text-align: center; font-size: 28rpx; font-weight: 800; color: $muted; flex: none; }
.rav { width: 72rpx; height: 72rpx; border-radius: 22rpx; flex: none; background-color: #dfe8e4; background-size: cover; background-position: center;
    background-image: linear-gradient(140deg, #5ecb8f, #0ba968); }
.rmid { flex: 1; min-width: 0; }
.rn { display: block; font-size: 27rpx; font-weight: 700; }
.rs { display: block; font-size: 20rpx; color: $muted; margin-top: 6rpx; }
.rkm { font-size: 30rpx; font-weight: 800; color: $ink; flex: none; letter-spacing: -1rpx; }
.rkm .unit { color: $muted; }
.empty, .tip { text-align: center; color: $faint; font-size: 23rpx; padding: 50rpx 0; }
.foot { display: block; text-align: center; font-size: 20rpx; color: $faint; margin: 26rpx 40rpx 0; line-height: 1.6; }
.safe-bottom { height: 50rpx; }
</style>
