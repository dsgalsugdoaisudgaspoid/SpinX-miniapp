<template>
    <view class="lb">
        <view class="lhead" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <text class="eye">LEADERBOARD · 赛段榜单</text>
            <text class="lt">{{ dirName }} · {{ name }}</text>
            <text class="lp">历史考核成绩 · 每人取最好一次 · 限时 {{ timeLimit }} 分钟</text>
        </view>

        <view class="mine" v-if="myRank">
            <text class="mrk mono">NO.{{ myRank.rank }}</text>
            <view class="mav"></view>
            <view class="mmid"><text class="mn">我 · {{ spx(myRank.nickname) }}</text><text class="ms">最好成绩 {{ fmtDur(myRank.durationSec) }}</text></view>
            <text class="mtag">我的名次</text>
        </view>

        <view class="listbox">
            <view class="lhd"><text>完整榜单</text><text class="cnt">共 {{ list.length }} 人完赛</text></view>
            <view v-for="u in list" :key="u.userId" class="row" :class="{ me: myRank && u.userId === myRank.userId }" :data-uid="u.userId" @tap="goMember">
                <text class="rk mono" :class="'r' + u.rank">{{ u.rank <= 3 ? medal(u.rank) : u.rank }}</text>
                <view class="rav" :style="{ backgroundImage: u.avatar ? ('url(' + u.avatar + ')') : '' }"></view>
                <view class="rmid"><text class="rn ellipsis">{{ spx(u.nickname) }}</text><text class="rs">{{ shortDate(u.finishedAt) }} 完赛</text></view>
                <text class="rtime mono">{{ fmtDur(u.durationSec) }}</text>
            </view>
            <view v-if="!loading && list.length === 0" class="empty">该赛段还没有完赛成绩，快去挑战第一名！</view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { assessmentLeaderboard } from '@/api/assessment.js'
import { statusBarHeight, spxName, goMemberProfile } from '@/common/util.js'
import { isLoggedIn } from '@/store/user.js'

export default {
    data() { return { statusBar: 20, id: null, name: '', dirName: '', timeLimit: 0, list: [], myRank: null, loading: false } },
    onLoad(q) { this.statusBar = statusBarHeight(); this.id = q.id; this.load() },
    methods: {
        spx(n) { return spxName(n) },
        goMember(e) { goMemberProfile(e.currentTarget.dataset.uid) },
        medal(r) { return r === 1 ? '🥇' : r === 2 ? '🥈' : '🥉' },
        fmtDur(sec) { sec = sec || 0; const m = Math.floor(sec / 60), s = sec % 60; return m + '分' + (s < 10 ? '0' + s : s) + '秒' },
        shortDate(iso) { if (!iso) return ''; return iso.slice(5, 10) },
        async load() {
            this.loading = true
            try {
                const d = await assessmentLeaderboard(this.id)
                this.list = (d && d.list) || []
                this.name = (d && d.name) || ''
                this.dirName = (d && d.dirName) || ''
                this.timeLimit = (d && d.timeLimitMinutes) || 0
                this.myRank = isLoggedIn() ? (d && d.myRank) || null : null
            } catch (e) { this.list = [] } finally { this.loading = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.lb { min-height: 100vh; background: $paper; }
.lhead { padding: 0 34rpx 40rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, $night-1, $night-2 58%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 20%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 16%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 10%, #fff, transparent); }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.lt { position: relative; display: block; font-size: 40rpx; font-weight: 800; margin-top: 12rpx; }
.lp { position: relative; display: block; font-size: 21rpx; opacity: .8; margin-top: 10rpx; line-height: 1.5; }

.mine { display: flex; align-items: center; gap: 20rpx; margin: 22rpx 28rpx 0; background: $night-2; border-radius: 26rpx; padding: 24rpx 26rpx; box-shadow: 0 16rpx 36rpx -20rpx rgba(14,27,36,.8); }
.mrk { font-size: 32rpx; font-weight: 800; color: $green; flex: none; letter-spacing: -1rpx; }
.mav { width: 84rpx; height: 84rpx; border-radius: 24rpx; flex: none; background: linear-gradient(140deg, #5ecb8f, #0ba968); box-shadow: 0 0 0 3rpx rgba(255,255,255,.2); }
.mmid { flex: 1; min-width: 0; }
.mn { display: block; font-size: 28rpx; font-weight: 800; color: #fff; }
.ms { display: block; font-size: 21rpx; color: rgba(255,255,255,.7); margin-top: 8rpx; }
.mtag { font-size: 19rpx; font-weight: 700; color: #04140c; background: $green; padding: 6rpx 14rpx; border-radius: 12rpx; flex: none; }

.listbox { margin: 22rpx 28rpx 0; background: $card; border-radius: 28rpx; padding: 6rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.lhd { display: flex; align-items: baseline; padding: 24rpx 0 12rpx; font-size: 27rpx; font-weight: 800; }
.lhd .cnt { margin-left: auto; font-size: 20rpx; color: $muted; font-weight: 600; }
.row { display: flex; align-items: center; gap: 20rpx; padding: 20rpx 0; border-top: 1rpx solid $hair; }
.row.me { margin: 0 -16rpx; padding: 20rpx 16rpx; background: $green-soft; border-radius: 18rpx; border-top-color: transparent; }
.rk { width: 52rpx; text-align: center; font-size: 28rpx; font-weight: 800; color: $muted; flex: none; }
.rk.r1, .rk.r2, .rk.r3 { font-size: 34rpx; }
.rav { width: 72rpx; height: 72rpx; border-radius: 22rpx; flex: none; background-color: #dfe8e4; background-size: cover; background-position: center;
    background-image: linear-gradient(140deg, #5ecb8f, #0ba968); }
.rmid { flex: 1; min-width: 0; }
.rn { display: block; font-size: 27rpx; font-weight: 700; }
.rs { display: block; font-size: 20rpx; color: $muted; margin-top: 6rpx; }
.rtime { font-size: 28rpx; font-weight: 800; color: $ink; flex: none; letter-spacing: -1rpx; }
.empty, .tip { text-align: center; color: $faint; font-size: 23rpx; padding: 50rpx 0; }
.safe-bottom { height: 50rpx; }
</style>
