<template>
    <view class="mn">
        <view class="head" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>
            <text class="eye">STUDENT ID · 学号</text>

            <!-- 已有号：号码本身就是这一页的主角 -->
            <block v-if="status === 'approved'">
                <text class="bigno mono">{{ spinxNo }}</text>
                <text class="hs">这是你在 SpinX 的学号</text>
            </block>
            <block v-else>
                <text class="ht">申请 SpinX 学号</text>
                <text class="hs">{{ headSub }}</text>
            </block>
        </view>

        <!-- 状态卡 -->
        <view v-if="status === 'pending'" class="card state pending">
            <text class="si">⏳</text>
            <view class="stx">
                <text class="st1">申请审核中</text>
                <text class="st2">提交于 {{ fmt(appliedAt) }}，班主任会尽快处理，结果将通过站内信通知你</text>
            </view>
        </view>
        <view v-else-if="status === 'rejected'" class="card state rejected">
            <text class="si">💬</text>
            <view class="stx">
                <text class="st1">本次申请未通过</text>
                <text class="st2">{{ rejectReason || '暂不符合发放条件' }}</text>
            </view>
        </view>
        <view v-else-if="status === 'approved'" class="card state done">
            <text class="si">✅</text>
            <view class="stx">
                <text class="st1">学号已发放</text>
                <text class="st2">入学 {{ joinedText }}，学号永久有效且不会变更</text>
            </view>
        </view>

        <!-- 说明：学号是什么、能用来做什么 -->
        <view class="card intro">
            <text class="it">SpinX 更像一个班级，学号就是你在这个班上的身份。</text>
            <text class="id2">审核通过后，你将获得一个永久且唯一的 5 位学号。</text>
            <view class="uses">
                <view class="use"><text class="ui">🪪</text><text class="ut">同学之间互相识别</text></view>
                <view class="use"><text class="ui">🔍</text><text class="ut">在 SpinX 里被同学找到</text></view>
                <view class="use"><text class="ui">✨</text><text class="ut">学生证身份展示</text></view>
                <view class="use"><text class="ui">🎫</text><text class="ut">未来合作商户权益核验</text></view>
            </view>
        </view>

        <!-- 定位说明：避免学号被当成等级 -->
        <view class="note">
            学号只是身份标识，不代表等级、先后或任何排序——号码大小和你在班上的位置没有半点关系。想升级看的是考核，不是学号。
        </view>

        <view v-if="canApply" class="g-btn apply" @tap="submit">
            {{ status === 'rejected' ? '重新申请' : '申请学号' }}
        </view>
        <view v-else-if="status === 'approved'" class="g-btn ghost" @tap="goProfile">查看我的学生证</view>

        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { myMemberNumber, applyMemberNumber } from '@/api/memberNumber.js'
import { statusBarHeight, fmtTime } from '@/common/util.js'

export default {
    data() {
        return {
            statusBar: 20, loading: false, submitting: false,
            status: 'none', spinxNo: '', rejectReason: '', appliedAt: '', joinedText: ''
        }
    },
    computed: {
        canApply() { return this.status === 'none' || this.status === 'rejected' },
        headSub() {
            if (this.status === 'pending') return '申请已提交，等待班主任审核'
            if (this.status === 'rejected') return '你可以修改情况后重新提交申请'
            return '永久唯一的 5 位学号，入学就跟着你'
        }
    },
    onShow() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/profile/profile' }) },
        fmt(t) { const d = fmtTime(t); return d.full || '—' },
        async load() {
            this.loading = true
            try {
                const d = await myMemberNumber()
                this.status = (d && d.status) || 'none'
                this.spinxNo = (d && d.spinxNo) || ''
                this.rejectReason = (d && d.rejectReason) || ''
                this.appliedAt = (d && d.appliedAt) || ''
                this.joinedText = this.sinceText(d && d.joinDate)
            } catch (e) {} finally { this.loading = false }
        },
        // 「入学 1 年 8 个月」——后端公开资料接口也有同款文案，这里本地算一份省一次请求
        sinceText(joinDate) {
            if (!joinDate) return ''
            const d = new Date(String(joinDate).replace(/-/g, '/'))
            if (isNaN(d.getTime())) return ''
            const now = new Date()
            let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
            if (now.getDate() < d.getDate()) months--
            if (months < 1) return '不到 1 个月'
            const y = Math.floor(months / 12), m = months % 12
            if (y > 0) return m > 0 ? `${y} 年 ${m} 个月` : `${y} 年`
            return `${m} 个月`
        },
        async submit() {
            if (this.submitting) return
            this.submitting = true
            try {
                await applyMemberNumber()
                uni.showToast({ title: '申请已提交', icon: 'success' })
                this.load()
            } catch (e) {} finally { this.submitting = false }
        },
        goProfile() {
            uni.navigateTo({
                url: '/pages/member/profile',
                fail: () => uni.showToast({ title: '学生证即将上线', icon: 'none' })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.mn { min-height: 100vh; background: $paper; }
.head { padding: 0 34rpx 46rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, $night-1, $night-2 60%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 14%, #fff, transparent); }
.nav { position: relative; height: 64rpx; }
.nbtn { width: 64rpx; height: 64rpx; border-radius: 50%; background: rgba(255,255,255,.14);
    display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; margin-top: 8rpx; }
.ht { position: relative; display: block; font-size: 42rpx; font-weight: 800; margin-top: 14rpx; }
.bigno { position: relative; display: block; font-size: 92rpx; font-weight: 800; letter-spacing: 10rpx; margin-top: 16rpx; }
.hs { position: relative; display: block; font-size: 21rpx; opacity: .82; margin-top: 10rpx; line-height: 1.5; }

.card { margin: -22rpx 24rpx 0; background: $card; border-radius: 26rpx; padding: 28rpx;
    box-shadow: 0 14rpx 34rpx -20rpx rgba(9,20,15,.4), inset 0 0 0 1rpx $hair; position: relative; z-index: 2; }
.card + .card { margin-top: 20rpx; }
.state { display: flex; align-items: flex-start; gap: 18rpx; }
.si { font-size: 40rpx; flex: none; }
.stx { flex: 1; min-width: 0; }
.st1 { display: block; font-size: 28rpx; font-weight: 800; }
.st2 { display: block; font-size: 22rpx; color: $muted; line-height: 1.6; margin-top: 8rpx; }
.state.pending .st1 { color: #b8760a; }
.state.rejected .st1 { color: #c0392b; }
.state.done .st1 { color: $green-deep; }

.it { display: block; font-size: 27rpx; font-weight: 700; line-height: 1.6; }
.id2 { display: block; font-size: 23rpx; color: $ink-2; line-height: 1.7; margin-top: 10rpx; }
.uses { margin-top: 22rpx; display: flex; flex-direction: column; gap: 16rpx; }
.use { display: flex; align-items: center; gap: 16rpx; }
.ui { font-size: 30rpx; width: 40rpx; flex: none; }
.ut { font-size: 24rpx; color: $ink; font-weight: 600; }

.note { margin: 22rpx 34rpx 0; font-size: 21rpx; color: $muted; line-height: 1.7; }
.apply { margin: 30rpx 24rpx 0; }
.ghost { margin: 30rpx 24rpx 0; background: $card; color: $green-deep; box-shadow: inset 0 0 0 2rpx $green-soft; }
.safe-bottom { height: 60rpx; }
</style>
