<template>
    <view class="manage">
        <!-- 统计 -->
        <view class="summary">
            <view class="s"><text class="sn mono">{{ summary.total || 0 }}</text><text class="sl">报名</text></view>
            <view class="s"><text class="sn mono">{{ summary.present || 0 }}</text><text class="sl">到场</text></view>
            <view class="s"><text class="sn mono">{{ summary.late || 0 }}</text><text class="sl">迟到</text></view>
            <view class="s"><text class="sn mono">{{ summary.absent || 0 }}</text><text class="sl">缺席</text></view>
            <view class="s"><text class="sn mono">{{ summary.waitlist || 0 }}</text><text class="sl">候补</text></view>
        </view>

        <view class="newbie" v-if="act.newbieCount > 0"><text class="nbi">🌱</text><text>本场新人 {{ act.newbieCount }} 人，记得主动介绍一下</text></view>

        <!-- B4：活动管理（改期 / 取消） -->
        <view class="mgmt">
            <view class="mrow">
                <text class="ml">改期至</text>
                <picker mode="date" :value="newDate" :start="todayStr" @change="onDate"><text class="mp mono">{{ newDate }}</text></picker>
                <picker mode="time" :value="newTime" @change="onTime"><text class="mp mono">{{ newTime }}</text></picker>
                <text class="mgo" @tap="reschedule">确认改期</text>
            </view>
            <view class="mrow noline">
                <text class="ml danger">取消整场活动</text>
                <text class="mgo danger" @tap="withdraw">取消活动</text>
            </view>
        </view>

        <!-- 路书码表：可同时绑定多个平台，发起时可不填，随时可在这里补录/修改/删除 -->
        <view class="mgmt">
            <view class="mrow" v-for="(l, i) in (act.routeLinks || [])" :key="i">
                <text class="ml">{{ l.brand }}</text>
                <text class="mp rb ellipsis">{{ l.externalId || '未填 ID' }}</text>
                <text class="mgo danger" :data-i="i" @tap="removeRouteLink">删除</text>
            </view>
            <view class="mrow noline">
                <text class="ml">{{ (act.routeLinks || []).length ? '再添加一个平台' : '路书信息' }}</text>
                <text class="mp rb ellipsis" v-if="!(act.routeLinks || []).length">未绑定</text>
                <text class="mgo" @tap="editRouteBook">＋ 添加</text>
            </view>
        </view>

        <!-- C1：赛后结算——填写真实骑行数据，随下方「一键发放活动积分」一并写入骑行档案，同一活动只能操作一次 -->
        <view class="recd" v-if="!act.pointsSettled">
            <text class="rct">赛后结算：发放积分同时写入骑行档案</text>
            <view class="drow">
                <view class="dcell"><input class="di mono" type="digit" v-model="rec.distance" placeholder="0" /><text class="du">里程 km</text></view>
                <view class="dcell"><input class="di mono" type="number" v-model="rec.duration" placeholder="0" /><text class="du">时长 min</text></view>
                <view class="dcell"><input class="di mono" type="number" v-model="rec.elevation" placeholder="0" /><text class="du">爬升 m</text></view>
            </view>
        </view>
        <view class="recd" v-else>
            <text class="rct">✅ 积分已发放，骑行档案已写入</text>
        </view>

        <view class="tabs">
            <text v-for="t in tabs" :key="t.k" :class="['tb', status === t.k ? 'on' : '']" @tap="switchStatus(t.k)">{{ t.n }}</text>
        </view>

        <view class="list">
            <view v-for="r in items" :key="r.registrationId" class="row">
                <view class="av" :data-uid="r.userId" @tap.stop="goMember"></view>
                <view class="mid">
                    <view class="l1"><text class="nm" :data-uid="r.userId" @tap.stop="goMember">{{ spx(r.nickname) }}</text><text v-if="r.signedAgreement" class="signed">已签约</text><text v-else class="unsigned">未签约</text></view>
                    <text class="ph mono">{{ r.phone }} · {{ r.hasExperience ? '有经验' : '新手' }}</text>
                    <view v-if="r.emergency" class="emg"><text class="emgi">🚑</text><text class="emgt">紧急 {{ r.emergency.name }}（{{ r.emergency.relation }}）{{ r.emergency.phone }}<text v-if="r.emergency.bloodType"> · {{ r.emergency.bloodType }}型</text><text v-if="r.emergency.hasAllergy" class="alg"> · 有过敏史</text></text></view>
                </view>
                <view class="ops">
                    <block v-if="r.status === 'pending'">
                        <text class="op reject" @tap="review(r, 'reject')">拒绝</text>
                        <text class="op approve" @tap="review(r, 'approve')">通过</text>
                    </block>
                    <text v-else-if="!r.checkinType" class="badge2">{{ statusText(r.status) }} · 待自助签到</text>
                    <view v-else class="ckwrap">
                        <text class="ckd" :style="ckStyle(r.checkinType)">{{ ckText(r.checkinType) }}</text>
                        <text class="award" :data-uid="r.userId" :data-name="r.nickname" @tap="openAward">🏅 颁发称号</text>
                    </view>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">该状态下暂无报名</view>
        </view>

        <view class="footer" :style="{ paddingBottom: 'calc(18rpx + ' + safeBottom + 'px)' }">
            <view v-if="!act.pointsSettled" class="g-btn" @tap="distribute">一键发放活动积分</view>
            <view v-else class="g-btn g-btn--plain">积分已发放</view>
        </view>
    </view>
</template>

<script>
import { getRegistrations, reviewRegistration, distributePoints, getActivity, updateActivity, rescheduleActivity, withdrawActivity } from '@/api/activity.js'
import { spxName, goMemberProfile } from '@/common/util.js'
import { awardTitle } from '@/api/identity.js'

export default {
    data() {
        return {
            activityId: null, act: {}, summary: {}, status: 'all',
            tabs: [{ k: 'all', n: '全部' }, { k: 'pending', n: '待审核' }, { k: 'approved', n: '已通过' }, { k: 'cancelled', n: '已取消' }],
            items: [], loading: false, safeBottom: 0,
            newDate: '', newTime: '',
            rec: { distance: '', duration: '', elevation: '' },
            // 与发起活动页保持同一份可选品牌
            brandOpts: ['迈金 Magene', '佳明 Garmin', 'IGPSport', 'Strava', '其它']
        }
    },
    onLoad(q) {
        this.activityId = q.activityId
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.initSchedule()
        this.loadAct()
        this.load()
    },
    computed: {
        todayStr() { return this.fmtDate(new Date()) }
    },
    methods: {
        spx(n) { return spxName(n) },
        goMember(e) { goMemberProfile(e.currentTarget.dataset.uid) },
        fmtDate(d) {
            const pad = n => (n < 10 ? '0' : '') + n
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        },
        fmtHm(d) {
            const pad = n => (n < 10 ? '0' : '') + n
            return `${pad(d.getHours())}:${pad(d.getMinutes())}`
        },
        // 改期面板默认预填活动当前的出发时间（还没拿到活动详情时先用当前时刻兜底），
        // 而不是写死一个日期——写死的日期总有一天会变成过去，选不了也发现不了
        initSchedule(iso) {
            const d = iso ? new Date(iso.replace(/-/g, '/').replace('T', ' ')) : new Date()
            this.newDate = this.fmtDate(d)
            this.newTime = this.fmtHm(d)
        },
        statusText(s) { return ({ approved: '已通过', auto_approved: '已通过', pending: '待审核', pending_pay: '待支付' })[s] || s },
        ckText(c) { return ({ present: '已到场', late: '迟到', early_leave: '早退', absent: '缺席' })[c] || c },
        ckStyle(c) { return c === 'present' ? 'color:#0ba968;background:#e6f9f0' : (c === 'absent' ? 'color:#c0392b;background:#fdecea' : 'color:#b8760a;background:#fdf1dd') },
        async loadAct() {
            try {
                this.act = await getActivity(this.activityId) || {}
                if (this.act.startTime) this.initSchedule(this.act.startTime)
            } catch (e) {}
        },
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
        onDate(e) { this.newDate = e.detail.value },
        onTime(e) { this.newTime = e.detail.value },
        reschedule() {
            // 日期选择器已用 :start 挡掉过去的日期，但当天仍能选到比现在早的时间点，这里再兜底校验一次
            const picked = new Date((this.newDate + ' ' + this.newTime).replace(/-/g, '/'))
            if (picked.getTime() < Date.now()) {
                uni.showToast({ title: '改期时间不能早于当前时间', icon: 'none' }); return
            }
            const startTime = this.newDate + 'T' + this.newTime + ':00Z'
            uni.showModal({
                title: '确认改期', content: `将活动改期至 ${this.newDate} ${this.newTime}，并向全部报名会员群发通知？`, confirmColor: '#0ba968',
                success: async (m) => {
                    if (!m.confirm) return
                    try { const r = await rescheduleActivity(this.activityId, { startTime }); uni.showToast({ title: `已改期 · 通知 ${r.notified} 人`, icon: 'none' }); this.loadAct() } catch (e) {}
                }
            })
        },
        withdraw() {
            uni.showModal({
                title: '取消整场活动', content: '将取消本场活动、群发通知，并自动为已付费会员退款。此操作不可撤销，确定？', confirmText: '确定取消', confirmColor: '#e0533d',
                success: async (m) => {
                    if (!m.confirm) return
                    try {
                        const r = await withdrawActivity(this.activityId, '领队取消')
                        uni.showModal({ title: '活动已取消', content: `已通知 ${r.notified} 人${r.refundedCount ? `，为 ${r.refundedCount} 人退款共 ¥${r.refundedAmount}` : ''}。`, showCancel: false })
                        this.loadAct()
                    } catch (e) {}
                }
            })
        },
        // 路书码表：可同时绑定多个平台，发起时可以不填，这里随时补录/追加——先选品牌，再填路线 ID/链接
        editRouteBook() {
            uni.showActionSheet({
                itemList: this.brandOpts,
                success: (r) => {
                    const picked = this.brandOpts[r.tapIndex]
                    if (picked === '其它') {
                        uni.showModal({
                            title: '自定义品牌名称', editable: true, placeholderText: '如 骑记 / 咕咚',
                            success: (m) => { if (m.confirm && m.content && m.content.trim()) this.saveRouteLink(m.content.trim()) }
                        })
                        return
                    }
                    this.saveRouteLink(picked.split(' ')[0])
                }
            })
        },
        saveRouteLink(brand) {
            uni.showModal({
                title: `${brand} · 路线 ID / 链接`, editable: true, placeholderText: '如 12345678 或分享链接（可留空后补）',
                success: async (m) => {
                    if (!m.confirm) return
                    const links = (this.act.routeLinks || []).concat([{ brand, externalId: (m.content || '').trim() }])
                    try {
                        await updateActivity(this.activityId, { routeLinks: links })
                        uni.showToast({ title: '已更新', icon: 'success' })
                        this.loadAct()
                    } catch (e) {}
                }
            })
        },
        async removeRouteLink(e) {
            const i = +e.currentTarget.dataset.i
            const links = (this.act.routeLinks || []).slice()
            links.splice(i, 1)
            try {
                await updateActivity(this.activityId, { routeLinks: links })
                uni.showToast({ title: '已删除', icon: 'none' })
                this.loadAct()
            } catch (e) {}
        },
        openAward(e) {
            const uid = e.currentTarget.dataset.uid
            const name = spxName(e.currentTarget.dataset.name)
            uni.showModal({
                title: `为「${name}」颁发称号`, editable: true, placeholderText: '如：风雨无阻 / 本场最佳',
                success: async (r) => {
                    if (!r.confirm || !r.content || !r.content.trim()) return
                    try { await awardTitle(this.activityId, { userId: +uid, name: r.content.trim() }); uni.showToast({ title: '已颁发', icon: 'success' }) } catch (err) {}
                }
            })
        },
        distribute() {
            if (this.act.pointsSettled) { uni.showToast({ title: '本场活动积分已发放，不可重复操作', icon: 'none' }); return }
            const attended = this.items.filter(r => r.checkinType && r.checkinType !== 'absent')
            if (attended.length === 0) { uni.showToast({ title: '暂无已签到会员', icon: 'none' }); return }
            if (!(+this.rec.distance > 0)) { uni.showToast({ title: '请先填写有效里程', icon: 'none' }); return }
            if (!(+this.rec.duration > 0)) { uni.showToast({ title: '请先填写有效时长', icon: 'none' }); return }
            const base = this.act.basePoints || 30, bonus = this.act.fullAttendanceBonus || 10
            uni.showModal({
                title: '发放活动积分', confirmColor: '#0ba968',
                content: `将为 ${attended.length} 位到场会员发放积分（基础 ${base} / 全勤 ${bonus}），并把里程 ${this.rec.distance}km 等数据写入骑行档案。同一活动只能操作一次，确认无误？`,
                success: async (m) => {
                    if (!m.confirm) return
                    const members = attended.map(r => ({ userId: r.userId, basePoints: base, bonusPoints: bonus, reason: '全勤参与' }))
                    try {
                        const res = await distributePoints(this.activityId, {
                            members, distance: +this.rec.distance, duration: +this.rec.duration, elevation: +this.rec.elevation || 0
                        })
                        uni.showToast({ title: `已发放 ${res.distributed} 人`, icon: 'success' })
                        this.loadAct()
                        this.load()
                    } catch (e) {}
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
.newbie { display: flex; align-items: center; gap: 10rpx; margin: 0 24rpx 14rpx; background: $green-soft; border-radius: 18rpx; padding: 16rpx 20rpx; font-size: 22rpx; font-weight: 700; color: $green-deep; }
.nbi { font-size: 24rpx; }
.mgmt { margin: 0 24rpx 6rpx; background: $card; border-radius: 24rpx; padding: 4rpx 24rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.mrow { display: flex; align-items: center; gap: 14rpx; padding: 22rpx 0; border-bottom: 1rpx solid $hair; }
.mrow.noline { border-bottom: 0; }
.ml { font-size: 25rpx; font-weight: 700; color: $ink-2; flex: none; }
.ml.danger { color: #e0533d; }
.mp { font-size: 25rpx; color: $green-deep; font-weight: 700; background: $paper; padding: 8rpx 18rpx; border-radius: 12rpx; }
.mp.rb { flex: 1; min-width: 0; }
.mgo { margin-left: auto; font-size: 23rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 8rpx 22rpx; border-radius: 14rpx; flex: none; }
.mgo.danger { color: #e0533d; background: #fdecea; }
.recd { margin: 0 24rpx 6rpx; background: $card; border-radius: 24rpx; padding: 22rpx 24rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.rct { display: block; font-size: 24rpx; font-weight: 800; color: $ink-2; }
.drow { display: flex; gap: 14rpx; margin-top: 16rpx; }
.dcell { flex: 1; background: $paper; border-radius: 16rpx; padding: 16rpx 8rpx; text-align: center; }
.di { font-size: 32rpx; font-weight: 800; text-align: center; }
.du { display: block; font-size: 19rpx; color: $muted; margin-top: 6rpx; }
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
.emg { display: flex; align-items: center; gap: 8rpx; margin-top: 8rpx; }
.emgi { font-size: 20rpx; flex: none; }
.emgt { font-size: 19rpx; color: #2b6bb5; background: #eef3fb; padding: 4rpx 12rpx; border-radius: 10rpx; }
.emgt .alg { color: #c0392b; }
.ops { display: flex; align-items: center; gap: 12rpx; flex: none; }
.op { font-size: 22rpx; font-weight: 800; padding: 10rpx 22rpx; border-radius: 16rpx; }
.op.approve { background: $green; color: #04140c; }
.op.reject { background: $paper; color: $muted; }
.badge2 { font-size: 19rpx; color: $muted; }
.ckd { font-size: 20rpx; font-weight: 800; padding: 8rpx 18rpx; border-radius: 14rpx; }
.ckwrap { display: flex; flex-direction: column; align-items: flex-end; gap: 10rpx; }
.award { font-size: 19rpx; font-weight: 700; color: #b5750c; }
.empty { text-align: center; color: $faint; font-size: 23rpx; padding: 70rpx 0; }
.footer { position: fixed; left: 0; right: 0; bottom: 0; padding: 18rpx 24rpx 0; background: $card; border-top: 1rpx solid $hair; }
</style>
