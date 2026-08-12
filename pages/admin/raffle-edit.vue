<template>
    <view class="re">
        <block v-if="isAdmin">
            <view class="sec">基本信息</view>
            <view class="card">
                <view class="frow"><text class="fl">标题</text><input class="fi" v-model="title" placeholder="如：环星夏夜·会员专属抽奖" /></view>
                <view class="frow col"><text class="fl">说明</text><textarea class="fa" v-model="description" placeholder="抽奖说明、领奖方式等" /></view>
                <view class="frow"><text class="fl">开奖日期</text>
                    <picker mode="date" :value="dateStr" @change="onDate"><text class="fpick">{{ dateStr }} ›</text></picker>
                </view>
                <view class="frow"><text class="fl">开奖时间</text>
                    <picker mode="time" :value="timeStr" @change="onTime"><text class="fpick">{{ timeStr }} ›</text></picker>
                </view>
            </view>

            <view class="sec">奖品设置<text class="addp" @tap="addPrize">＋ 添加奖品</text></view>
            <view class="card">
                <view v-for="(p, i) in prizes" :key="i" class="prow">
                    <input class="pc" v-model="p.category" placeholder="奖级(如一等奖)" />
                    <input class="pn" v-model="p.name" placeholder="奖品名称" />
                    <input class="pq" v-model="p.quantity" type="number" placeholder="数量" />
                    <text class="pdel" :data-i="i" @tap="delPrize">✕</text>
                </view>
                <view v-if="prizes.length === 0" class="pempty">请至少添加一个奖品</view>
            </view>

            <view class="sec">预览</view>
            <view class="card pv">
                <raffle-board :raffle="preview" title="🎁 奖品预览" status-text="草稿" note="发布后，所有用户首页右下角会出现「参与抽奖」入口"></raffle-board>
            </view>

            <view class="footer" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
                <view :class="['g-btn', canPublish ? '' : 'off']" @tap="publish">🎁 发布公共抽奖</view>
            </view>
        </block>

        <view v-else class="noauth">
            <text class="nai">🔒</text>
            <text class="nat">仅超级管理员可发布公共抽奖</text>
        </view>
    </view>
</template>

<script>
import { createPublicRaffle } from '@/api/publicRaffle.js'
import { statusBarHeight } from '@/common/util.js'
import { hasRole } from '@/store/user.js'
import RaffleBoard from '@/components/raffle-board/raffle-board.vue'

export default {
    components: { RaffleBoard },
    data() {
        return {
            isAdmin: false, safeBottom: 0,
            title: '', description: '',
            dateStr: '2026-08-10', timeStr: '20:00',
            prizes: [{ category: '一等奖', name: '', quantity: '1' }],
            submitting: false
        }
    },
    computed: {
        canPublish() { return !this.submitting && this.title.trim() && this.prizes.length > 0 && this.prizes.every(p => p.name.trim()) },
        preview() {
            const icons = ['🥇', '🥈', '🥉', '🎁', '🎀', '🏅']
            return {
                enabled: true, drawn: false, myPrize: null,
                prizes: this.prizes.map((p, i) => ({ prizeId: i + 1, name: p.name || '奖品', icon: icons[i] || '🎁', category: p.category || '奖品', quantity: +p.quantity || 1 }))
            }
        }
    },
    onLoad() {
        this.isAdmin = hasRole('admin')
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
    },
    methods: {
        onDate(e) { this.dateStr = e.detail.value },
        onTime(e) { this.timeStr = e.detail.value },
        addPrize() { this.prizes.push({ category: '', name: '', quantity: '1' }) },
        delPrize(e) { this.prizes.splice(+e.currentTarget.dataset.i, 1) },
        async publish() {
            if (!this.canPublish) { uni.showToast({ title: '请填写标题和至少一个奖品', icon: 'none' }); return }
            this.submitting = true
            const icons = ['🥇', '🥈', '🥉', '🎁', '🎀', '🏅']
            const payload = {
                title: this.title.trim(), description: this.description.trim(),
                drawAt: this.dateStr + 'T' + this.timeStr + ':00Z',
                prizes: this.prizes.map((p, i) => ({ category: p.category || '奖品', name: p.name, icon: icons[i] || '🎁', quantity: +p.quantity || 1 })),
                status: 'published'
            }
            try {
                await createPublicRaffle(payload)
                uni.showToast({ title: '发布成功', icon: 'success' })
                setTimeout(() => uni.navigateBack(), 800)
            } catch (e) {} finally { this.submitting = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.re { min-height: 100vh; background: $paper; padding-bottom: 40rpx; }
.sec { display: flex; align-items: center; font-size: 28rpx; font-weight: 800; margin: 28rpx 30rpx 14rpx; }
.addp { margin-left: auto; font-size: 22rpx; font-weight: 700; color: $green-deep; }
.card { margin: 0 28rpx; background: $card; border-radius: 24rpx; padding: 10rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.card.pv { padding: 20rpx; }
.frow { display: flex; align-items: center; gap: 18rpx; padding: 22rpx 0; border-bottom: 1rpx solid $hair; }
.frow:last-child { border-bottom: 0; }
.frow.col { flex-direction: column; align-items: stretch; gap: 12rpx; }
.fl { font-size: 25rpx; font-weight: 700; color: $ink-2; flex: none; width: 130rpx; }
.fi { flex: 1; font-size: 26rpx; text-align: right; }
.fa { width: 100%; height: 120rpx; font-size: 25rpx; background: $paper; border-radius: 16rpx; padding: 16rpx; box-sizing: border-box; }
.frow.col .fl { width: auto; }
.fpick { font-size: 26rpx; color: $green-deep; font-weight: 700; }
.prow { display: flex; align-items: center; gap: 12rpx; padding: 18rpx 0; border-bottom: 1rpx solid $hair; }
.prow:last-child { border-bottom: 0; }
.pc { width: 170rpx; flex: none; font-size: 24rpx; background: $paper; border-radius: 12rpx; padding: 12rpx 14rpx; }
.pn { flex: 1; min-width: 0; font-size: 24rpx; background: $paper; border-radius: 12rpx; padding: 12rpx 14rpx; }
.pq { width: 110rpx; flex: none; font-size: 24rpx; background: $paper; border-radius: 12rpx; padding: 12rpx 14rpx; text-align: center; }
.pdel { flex: none; color: $faint; font-size: 28rpx; padding: 0 6rpx; }
.pempty { text-align: center; color: $faint; font-size: 22rpx; padding: 24rpx 0; }
.footer { padding: 28rpx 28rpx 0; }
.g-btn.off { background: #d7ddda; color: #8a968f; }
.noauth { text-align: center; padding: 200rpx 0; display: flex; flex-direction: column; align-items: center; gap: 20rpx; }
.nai { font-size: 90rpx; }
.nat { font-size: 26rpx; color: $muted; }
</style>
