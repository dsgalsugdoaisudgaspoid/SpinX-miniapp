<template>
    <view class="orders">
        <view class="tabs">
            <text :class="['tb', tab === 'my' ? 'on' : '']" data-k="my" @tap="switchTab">我预约的</text>
            <text v-if="isCoach" :class="['tb', tab === 'recv' ? 'on' : '']" data-k="recv" @tap="switchTab">我接的单</text>
        </view>

        <view class="list">
            <view v-for="o in items" :key="o.orderId" class="card">
                <view class="top">
                    <view class="who">
                        <text class="wn">{{ tab === 'my' ? o.coachNickname : o.memberNickname }}</text>
                        <text v-if="tab === 'my' && o.coachLevelLabel" class="wl">{{ o.coachLevelLabel }}</text>
                    </view>
                    <text class="st" :style="stStyle(o.status)">{{ stText(o.status) }}</text>
                </view>
                <view class="info">
                    <text class="ir">🗓 {{ fmtTime(o.scheduledTime) }}</text>
                    <text class="ir">⏱ {{ o.hours }} 小时 · ¥{{ o.hourlyRate }}/时</text>
                    <text class="ir" v-if="o.meetingPoint">📍 {{ o.meetingPoint }}</text>
                    <text class="ir" v-if="o.note">📝 {{ o.note }}</text>
                </view>
                <view class="foot">
                    <text class="fee mono">¥{{ o.totalFee }}</text>
                    <view class="ops">
                        <!-- 会员操作 -->
                        <block v-if="tab === 'my'">
                            <text v-if="canCancel(o)" class="op ghost" :data-id="o.orderId" @tap="cancel">取消</text>
                            <text v-if="o.status === 'completed' && !o.rated" class="op primary" :data-id="o.orderId" @tap="openRate">评价</text>
                            <text v-if="o.rated" class="rated">已评价</text>
                        </block>
                        <!-- 陪练操作 -->
                        <block v-else>
                            <text v-if="o.status === 'paid'" class="op ghost" :data-id="o.orderId" @tap="reject">拒单</text>
                            <text v-if="o.status === 'paid'" class="op primary" :data-id="o.orderId" @tap="accept">接单</text>
                            <text v-if="o.status === 'accepted'" class="op primary" :data-id="o.orderId" @tap="complete">完成</text>
                        </block>
                    </view>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">
                <text class="ee">📋</text><text>暂无订单</text>
            </view>
        </view>

        <!-- 评分弹层 -->
        <view v-if="showRate" class="mask" @tap="closeRate"></view>
        <view v-if="showRate" class="rsheet">
            <text class="rt">给陪练评分</text>
            <view class="starrow">
                <text v-for="s in 5" :key="s" :class="['star', s <= rateScore ? 'on' : '']" :data-s="s" @tap="pickStar">★</text>
            </view>
            <input class="rcomment" v-model="rateComment" placeholder="说点什么（可选）" placeholder-class="ph" />
            <view class="g-btn rsubmit" @tap="submitRate">提交评价</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { myCoachOrders, receivedCoachOrders, handleCoachOrder, cancelCoachOrder, rateCoach } from '@/api/coach.js'
import { hasRole } from '@/store/user.js'
import { fmtTime } from '@/common/util.js'

export default {
    data() {
        return { tab: 'my', items: [], loading: false, showRate: false, rateOrderId: null, rateScore: 5, rateComment: '' }
    },
    computed: { isCoach() { return hasRole('coach') } },
    onLoad(q) { if (q && q.tab === 'recv' && this.isCoach) this.tab = 'recv' },
    onShow() { this.load() },
    methods: {
        fmtTime(iso) { const t = fmtTime(iso); return t.full || '' },
        stText(s) { return ({ pending_pay: '待支付', paid: '待接单', accepted: '进行中', completed: '已完成', rejected: '已拒单', cancelled: '已取消', refunded: '已退款' })[s] || s },
        stStyle(s) {
            if (s === 'completed') return 'color:#0ba968;background:#e6f9f0'
            if (s === 'accepted') return 'color:#2b6bb5;background:#e9f1fb'
            if (s === 'paid') return 'color:#b8760a;background:#fdf1dd'
            if (s === 'rejected' || s === 'cancelled' || s === 'refunded') return 'color:#7a8a83;background:#f0f3f2'
            return 'color:#c0392b;background:#fdecea'
        },
        canCancel(o) { return o.status === 'pending_pay' || o.status === 'paid' },
        switchTab(e) { const k = e.currentTarget.dataset.k; if (this.tab === k) return; this.tab = k; this.load() },
        async load() {
            this.loading = true
            try {
                const api = this.tab === 'recv' ? receivedCoachOrders : myCoachOrders
                const d = await api({ page: 1, pageSize: 30 })
                this.items = (d && d.list) || []
            } catch (e) { this.items = [] } finally { this.loading = false }
        },
        doHandle(id, action, confirmText) {
            uni.showModal({
                title: '确认', content: confirmText, confirmColor: '#0ba968',
                success: async (r) => {
                    if (!r.confirm) return
                    try { await handleCoachOrder(id, { action }); uni.showToast({ title: '操作成功', icon: 'none' }); this.load() } catch (e) {}
                }
            })
        },
        accept(e) { this.doHandle(e.currentTarget.dataset.id, 'accept', '确认接单？请按约定时间到场') },
        reject(e) { this.doHandle(e.currentTarget.dataset.id, 'reject', '确认拒单？款项将原路退回会员') },
        complete(e) { this.doHandle(e.currentTarget.dataset.id, 'complete', '确认本次陪练已完成？') },
        cancel(e) {
            const id = e.currentTarget.dataset.id
            uni.showModal({
                title: '取消订单', content: '确认取消？已支付将发起退款', confirmColor: '#0ba968',
                success: async (r) => { if (!r.confirm) return; try { await cancelCoachOrder(id, '会员取消'); uni.showToast({ title: '已取消', icon: 'none' }); this.load() } catch (e) {} }
            })
        },
        openRate(e) { this.rateOrderId = e.currentTarget.dataset.id; this.rateScore = 5; this.rateComment = ''; this.showRate = true },
        closeRate() { this.showRate = false },
        pickStar(e) { this.rateScore = Number(e.currentTarget.dataset.s) },
        async submitRate() {
            try {
                await rateCoach(this.rateOrderId, { score: this.rateScore, comment: this.rateComment })
                this.showRate = false
                uni.showToast({ title: '感谢评价', icon: 'success' })
                this.load()
            } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.orders { min-height: 100vh; background: $paper; }
.tabs { display: flex; gap: 40rpx; background: $card; padding: 24rpx 30rpx; position: sticky; top: 0; z-index: 5; }
.tb { font-size: 30rpx; color: $muted; font-weight: 600; padding-bottom: 8rpx; position: relative; }
.tb.on { color: $ink; font-weight: 800; }
.tb.on::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 40rpx; height: 5rpx; border-radius: 3rpx; background: $green; }
.list { padding: 20rpx 24rpx 40rpx; }
.card { background: $card; border-radius: 26rpx; padding: 24rpx; margin-bottom: 16rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.top { display: flex; align-items: center; }
.who { display: flex; align-items: center; gap: 12rpx; }
.wn { font-size: 28rpx; font-weight: 800; }
.wl { font-size: 18rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 3rpx 10rpx; border-radius: 8rpx; }
.st { margin-left: auto; font-size: 20rpx; font-weight: 800; padding: 6rpx 16rpx; border-radius: 14rpx; }
.info { margin-top: 14rpx; display: flex; flex-direction: column; gap: 8rpx; }
.ir { font-size: 23rpx; color: $ink-2; }
.foot { display: flex; align-items: center; margin-top: 16rpx; padding-top: 16rpx; border-top: 1rpx solid $hair; }
.fee { font-size: 34rpx; font-weight: 800; color: $green-deep; }
.ops { margin-left: auto; display: flex; gap: 14rpx; align-items: center; }
.op { font-size: 24rpx; font-weight: 800; padding: 12rpx 28rpx; border-radius: 18rpx; }
.op.primary { background: $green; color: #04140c; }
.op.ghost { background: $paper; color: $muted; }
.rated { font-size: 22rpx; color: $faint; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 110rpx 0; display: flex; flex-direction: column; align-items: center; gap: 14rpx; }
.ee { font-size: 76rpx; }

.mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 20; }
.rsheet { position: fixed; left: 60rpx; right: 60rpx; top: 34%; z-index: 21; background: $card; border-radius: 30rpx; padding: 40rpx 30rpx; text-align: center; }
.rsheet .rt { font-size: 30rpx; font-weight: 800; }
.starrow { display: flex; justify-content: center; gap: 14rpx; margin: 26rpx 0; }
.star { font-size: 60rpx; color: $line; }
.star.on { color: $amber; }
.rcomment { background: $paper; border-radius: 18rpx; padding: 20rpx; font-size: 25rpx; }
.rsubmit { margin-top: 24rpx; }
.ph { color: $faint; }
.safe-bottom { height: 40rpx; }
</style>
