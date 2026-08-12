<template>
    <view class="ac">
        <!-- 夜色头部：总体进度 -->
        <view class="head" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>
            <text class="eye">ACHIEVEMENTS · 我的成就</text>
            <text class="ht">每一枚徽章，都是一段骑出来的路</text>

            <view class="ring">
                <view class="rbar"><view class="rfill" :style="{ width: summary.percent + '%' }"></view></view>
                <text class="rtxt mono">{{ summary.unlocked || 0 }} / {{ summary.total || 0 }} 已解锁 · 累计奖励 {{ summary.earnedPoints || 0 }} 积分</text>
            </view>
        </view>

        <!-- 分类筛选 -->
        <scroll-view class="tabbar" scroll-x :show-scrollbar="false">
            <text :class="['tb', cat === '' ? 'on' : '']" @tap="pickCat('')">全部</text>
            <text v-for="c in categories" :key="c.category"
                :class="['tb', cat === c.category ? 'on' : '']"
                :data-c="c.category" @tap="pickCatEv">{{ c.categoryName }} {{ c.unlocked }}/{{ c.total }}</text>
        </scroll-view>

        <!-- 成就分组 -->
        <view v-for="c in shownCategories" :key="c.category" class="group">
            <view class="sec">
                <text class="sect">{{ c.categoryName }}</text>
                <text class="secn mono">{{ c.unlocked }}/{{ c.total }}</text>
            </view>
            <view class="grid">
                <view v-for="a in c.items" :key="a.achievementId"
                    :class="['cell', a.unlocked ? ('on ' + a.tier) : 'off']" @tap="showDetail(a)">
                    <text class="ci">{{ a.unlocked ? a.icon : '🔒' }}</text>
                    <text class="ct">{{ a.name }}</text>
                    <text class="cd">{{ a.description }}</text>
                    <!-- 未解锁显示进度条，已解锁显示徽章等级 -->
                    <block v-if="!a.unlocked">
                        <view class="pbar"><view class="pfill" :style="{ width: a.progressPercent + '%' }"></view></view>
                        <text class="ptxt mono">{{ a.progress }} / {{ a.threshold }}</text>
                    </block>
                    <text v-else class="tiertag">{{ tierName(a.tier) }} · +{{ a.rewardPoints }}</text>
                </view>
            </view>
        </view>

        <view v-if="!loading && categories.length === 0" class="empty">暂无成就目录</view>
        <view class="safe-bottom"></view>

        <!-- 新解锁恭喜弹层 -->
        <view v-if="popup" class="mask" @tap="closePopup">
            <view class="pop" @tap.stop>
                <text class="popi">{{ popup.icon }}</text>
                <text class="popt">解锁成就</text>
                <text class="popn">{{ popup.name }}</text>
                <text class="popd">{{ popup.description }}</text>
                <text v-if="popup.rewardPoints > 0" class="popp mono">奖励 +{{ popup.rewardPoints }} 积分</text>
                <view class="popbtn" @tap="closePopup">{{ queue.length > 0 ? '下一个' : '收下了' }}</view>
            </view>
        </view>
    </view>
</template>

<script>
import { getMyAchievements } from '@/api/achievement.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() {
        return {
            statusBar: 20,
            loading: false,
            summary: {},
            categories: [],
            cat: '',
            queue: [],
            popup: null
        }
    },
    computed: {
        shownCategories() {
            return this.cat ? this.categories.filter(c => c.category === this.cat) : this.categories
        }
    },
    onShow() {
        this.statusBar = statusBarHeight()
        this.load()
    },
    methods: {
        back() {
            const p = getCurrentPages()
            p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/profile/profile' })
        },
        tierName(t) { return { bronze: '青铜', silver: '白银', gold: '黄金' }[t] || '青铜' },
        pickCat(c) { this.cat = c },
        pickCatEv(e) { this.cat = e.currentTarget.dataset.c },
        async load() {
            this.loading = true
            try {
                const d = await getMyAchievements()
                this.summary = (d && d.summary) || {}
                this.categories = (d && d.categories) || []
                // 打开页面时后端已结算，这里把本次新解锁的逐个弹出来
                const newly = (d && d.newlyUnlocked) || []
                if (newly.length) { this.queue = newly.slice(); this.popup = this.queue.shift() }
            } catch (e) { /* toast 已由 request 层统一处理 */ } finally {
                this.loading = false
            }
        },
        showDetail(a) {
            const lines = [a.description]
            if (a.unlocked) {
                lines.push('已解锁 · ' + this.tierName(a.tier) + ' 徽章')
                if (a.rewardPoints > 0) lines.push('奖励 +' + a.rewardPoints + ' 积分')
            } else {
                lines.push('当前进度：' + a.progress + ' / ' + a.threshold)
            }
            uni.showModal({
                title: (a.unlocked ? a.icon : '🔒') + ' ' + a.name,
                content: lines.join('\n'), showCancel: false, confirmText: '知道了'
            })
        },
        closePopup() { this.popup = this.queue.length ? this.queue.shift() : null }
    }
}
</script>

<style lang="scss" scoped>
.ac { min-height: 100vh; background: $paper; }

/* 头部 */
.head { padding: 0 40rpx 44rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, $night-1, $night-2 58%, $night-3); }
.nav { position: relative; margin-bottom: 14rpx; }
.nbtn { width: 60rpx; height: 60rpx; border-radius: 50%; background: rgba(255,255,255,.16); display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 24%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 18%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 12%, #fff, transparent); }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; }
.ht { position: relative; display: block; font-size: 38rpx; font-weight: 800; margin-top: 14rpx; }
.ring { position: relative; margin-top: 26rpx; }
.rbar { height: 12rpx; border-radius: 8rpx; background: rgba(255,255,255,.18); overflow: hidden; }
.rfill { height: 100%; border-radius: 8rpx; background: linear-gradient(90deg, #12d07a, #6fd0ff); }
.rtxt { display: block; font-size: 21rpx; opacity: .85; margin-top: 12rpx; }

/* 分类筛选 */
.tabbar { white-space: nowrap; background: $card; padding: 18rpx 28rpx; }
.tb { display: inline-block; height: 56rpx; line-height: 56rpx; padding: 0 24rpx; border-radius: 18rpx;
    margin-right: 14rpx; background: $paper; font-size: 23rpx; color: $ink-2; font-weight: 600; }
.tb.on { background: $green; color: #04140c; font-weight: 800; }

/* 分组与卡片 */
.group { margin-top: 8rpx; }
.sec { display: flex; align-items: baseline; justify-content: space-between; margin: 30rpx 30rpx 16rpx; }
.sect { font-size: 28rpx; font-weight: 800; color: $ink; }
.secn { font-size: 22rpx; color: $muted; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); grid-gap: 18rpx; gap: 18rpx; padding: 0 28rpx; }
.cell { position: relative; background: $card; border-radius: 24rpx; padding: 26rpx;
    box-shadow: inset 0 0 0 1rpx $hair; min-height: 210rpx; }
.cell.on { box-shadow: inset 0 0 0 2rpx $green; }
.cell.on.silver { box-shadow: inset 0 0 0 2rpx #9fb4c7; }
.cell.on.gold { box-shadow: inset 0 0 0 2rpx #f0a017; background: linear-gradient(160deg, #fffdf5, #fff7e6); }
.cell.off { opacity: .55; }
.ci { font-size: 44rpx; }
.ct { display: block; font-size: 26rpx; font-weight: 800; margin-top: 12rpx; }
.cd { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;
    font-size: 20rpx; color: $muted; margin-top: 8rpx; line-height: 1.5; }
.pbar { height: 8rpx; border-radius: 6rpx; background: $hair; overflow: hidden; margin-top: 16rpx; }
.pfill { height: 100%; border-radius: 6rpx; background: $green; }
.ptxt { display: block; font-size: 19rpx; color: $muted; margin-top: 8rpx; }
.tiertag { display: inline-block; font-size: 19rpx; font-weight: 800; color: $green-deep;
    background: $green-soft; padding: 4rpx 12rpx; border-radius: 8rpx; margin-top: 16rpx; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 80rpx 0; }
.safe-bottom { height: 60rpx; }

/* 新解锁弹层 */
.mask { position: fixed; inset: 0; background: rgba(6,14,20,.68); z-index: 50;
    display: flex; align-items: center; justify-content: center; }
.pop { width: 560rpx; background: $card; border-radius: 32rpx; padding: 48rpx 40rpx; text-align: center; }
.popi { font-size: 96rpx; }
.popt { display: block; font-size: 22rpx; color: $muted; letter-spacing: 4rpx; margin-top: 16rpx; }
.popn { display: block; font-size: 40rpx; font-weight: 800; color: $ink; margin-top: 10rpx; }
.popd { display: block; font-size: 24rpx; color: $ink-2; line-height: 1.6; margin-top: 16rpx; }
.popp { display: block; font-size: 26rpx; font-weight: 800; color: $green-deep; margin-top: 20rpx; }
.popbtn { margin-top: 36rpx; height: 84rpx; line-height: 84rpx; border-radius: 20rpx;
    background: linear-gradient(135deg, #12d07a, #0ba968); color: #04140c; font-size: 28rpx; font-weight: 800; }
</style>
