<template>
    <view class="manage">
        <!-- 统计 -->
        <view class="summary">
            <view class="s"><text class="sn mono">{{ summary.total || 0 }}</text><text class="sl">报名</text></view>
            <view class="s"><text class="sn mono">{{ summary.present || 0 }}</text><text class="sl">到场</text></view>
            <view class="s"><text class="sn mono">{{ summary.late || 0 }}</text><text class="sl">迟到</text></view>
            <view class="s"><text class="sn mono">{{ summary.absent || 0 }}</text><text class="sl">缺席</text></view>
        </view>

        <view class="tabs">
            <text v-for="t in tabs" :key="t.k" :class="['tb', status === t.k ? 'on' : '']" @tap="switchStatus(t.k)">{{ t.n }}</text>
        </view>

        <view class="list">
            <view v-for="r in items" :key="r.registrationId" class="row">
                <view class="av"></view>
                <view class="mid">
                    <view class="l1"><text class="nm">{{ r.nickname }}</text><text v-if="r.signedAgreement" class="signed">已签约</text><text v-else class="unsigned">未签约</text></view>
                    <text class="ph mono">{{ r.phone }} · {{ r.hasExperience ? '有经验' : '新手' }}</text>
                </view>
                <view class="ops">
                    <block v-if="r.status === 'pending'">
                        <text class="op reject" @tap="review(r, 'reject')">拒绝</text>
                        <text class="op approve" @tap="review(r, 'approve')">通过</text>
                    </block>
                    <block v-else-if="!r.checkinType">
                        <text class="badge2">{{ statusText(r.status) }}</text>
                        <text class="op checkin" @tap="doCheckin(r)">签到</text>
                    </block>
                    <text v-else class="ckd" :style="ckStyle(r.checkinType)">{{ ckText(r.checkinType) }}</text>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">该状态下暂无报名</view>
        </view>

        <view class="footer" :style="{ paddingBottom: 'calc(18rpx + ' + safeBottom + 'px)' }">
            <view class="g-btn" @tap="distribute">一键发放活动积分</view>
        </view>
    </view>
</template>

<script>
import { getRegistrations, reviewRegistration, checkin, distributePoints, getActivity } from '@/api/activity.js'

export default {
    data() {
        return {
            activityId: null, act: {}, summary: {}, status: 'all',
            tabs: [{ k: 'all', n: '全部' }, { k: 'pending', n: '待审核' }, { k: 'approved', n: '已通过' }, { k: 'cancelled', n: '已取消' }],
            items: [], loading: false, safeBottom: 0
        }
    },
    onLoad(q) {
        this.activityId = q.activityId
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.loadAct()
        this.load()
    },
    methods: {
        statusText(s) { return ({ approved: '已通过', auto_approved: '已通过', pending: '待审核' })[s] || s },
        ckText(c) { return ({ present: '已到场', late: '迟到', early_leave: '早退', absent: '缺席' })[c] || c },
        ckStyle(c) { return c === 'present' ? 'color:#0ba968;background:#e6f9f0' : (c === 'absent' ? 'color:#c0392b;background:#fdecea' : 'color:#b8760a;background:#fdf1dd') },
        async loadAct() { try { this.act = await getActivity(this.activityId) || {} } catch (e) {} },
        async load() {
            this.loading = true
            try {
                const d = await getRegistrations(this.activityId, { status: this.status, page: 1, pageSize: 100 })
                this.items = (d && d.list) || []
                if (d && d.summary) this.summary = d.summary
            } catch (e) { this.items = [] } finally { this.loading = false }
        },
        switchStatus(k) { if (this.status === k) return; this.status = k; this.load() },
        async review(r, action) {
            try { await reviewRegistration(this.activityId, r.registrationId, { action }); uni.showToast({ title: action === 'approve' ? '已通过' : '已拒绝', icon: 'none' }); this.load() } catch (e) {}
        },
        async doCheckin(r) {
            try { await checkin(this.activityId, { userId: r.userId, checkinType: 'present' }); uni.showToast({ title: '已签到', icon: 'success' }); this.load() } catch (e) {}
        },
        distribute() {
            const present = this.items.filter(r => r.checkinType === 'present')
            if (present.length === 0) { uni.showToast({ title: '暂无已签到会员', icon: 'none' }); return }
            const base = this.act.basePoints || 30, bonus = this.act.fullAttendanceBonus || 10
            uni.showModal({
                title: '发放活动积分', content: `将为 ${present.length} 位已到场会员发放 基础 ${base} + 全勤 ${bonus} 积分？`, confirmColor: '#0ba968',
                success: async (m) => {
                    if (!m.confirm) return
                    const members = present.map(r => ({ userId: r.userId, basePoints: base, bonusPoints: bonus, reason: '全勤参与' }))
                    try { const res = await distributePoints(this.activityId, members); uni.showToast({ title: `已发放 ${res.distributed} 人`, icon: 'success' }); this.load() } catch (e) {}
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.manage { min-height: 100vh; background: $paper; }
.summary { display: flex; margin: 20rpx 24rpx; background: linear-gradient(150deg, #0e1b24, #123a57); border-radius: 26rpx; padding: 28rpx 10rpx; }
.s { flex: 1; text-align: center; color: #fff; }
.sn { display: block; font-weight: 800; font-size: 44rpx; letter-spacing: -1rpx; }
.sl { display: block; font-size: 20rpx; opacity: .8; margin-top: 4rpx; }
.tabs { display: flex; gap: 30rpx; background: $card; padding: 20rpx 30rpx; position: sticky; top: 0; z-index: 5; }
.tb { font-size: 26rpx; color: $muted; font-weight: 600; padding-bottom: 8rpx; position: relative; }
.tb.on { color: $ink; font-weight: 800; }
.tb.on::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 34rpx; height: 5rpx; border-radius: 3rpx; background: $green; }
.list { padding: 16rpx 24rpx 160rpx; }
.row { display: flex; align-items: center; gap: 18rpx; background: $card; border-radius: 24rpx; padding: 22rpx; margin-bottom: 14rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.av { width: 64rpx; height: 64rpx; border-radius: 50%; background: linear-gradient(135deg, #8fd3ff, #5e8bff); flex: none; }
.mid { flex: 1; min-width: 0; }
.l1 { display: flex; align-items: center; gap: 12rpx; }
.nm { font-size: 27rpx; font-weight: 800; }
.signed { font-size: 18rpx; color: $green-deep; background: $green-soft; padding: 3rpx 10rpx; border-radius: 8rpx; }
.unsigned { font-size: 18rpx; color: #b8760a; background: #fdf1dd; padding: 3rpx 10rpx; border-radius: 8rpx; }
.ph { display: block; font-size: 20rpx; color: $muted; margin-top: 6rpx; }
.ops { display: flex; align-items: center; gap: 12rpx; flex: none; }
.op { font-size: 22rpx; font-weight: 800; padding: 10rpx 22rpx; border-radius: 16rpx; }
.op.approve { background: $green; color: #04140c; }
.op.reject { background: $paper; color: $muted; }
.op.checkin { background: $green-soft; color: $green-deep; }
.badge2 { font-size: 19rpx; color: $muted; }
.ckd { font-size: 20rpx; font-weight: 800; padding: 8rpx 18rpx; border-radius: 14rpx; }
.empty { text-align: center; color: $faint; font-size: 23rpx; padding: 70rpx 0; }
.footer { position: fixed; left: 0; right: 0; bottom: 0; padding: 18rpx 24rpx 0; background: $card; border-top: 1rpx solid $hair; }
</style>
