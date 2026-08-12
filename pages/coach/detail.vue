<template>
    <view class="cd" v-if="coach">
        <view class="hero">
            <view class="stars"></view>
            <view class="av" :style="{ background: avatarBg }"></view>
            <text class="nm">{{ coach.nickname }}</text>
            <text class="lvbadge" :style="lvStyle">{{ coach.levelLabel }}陪练</text>
            <view class="metrics">
                <view class="m"><text class="mn mono">★{{ rating }}</text><text class="ml">评分</text></view>
                <view class="m"><text class="mn mono">{{ coach.totalOrders || 0 }}</text><text class="ml">接单</text></view>
                <view class="m"><text class="mn mono">{{ coach.avgSpeedKmh || '—' }}</text><text class="ml">均速km/h</text></view>
                <view class="m"><text class="mn mono">{{ coach.ridingYears || '—' }}</text><text class="ml">骑龄年</text></view>
            </view>
        </view>

        <view class="body">
            <view class="sec">陪练介绍</view>
            <text class="intro">{{ coach.intro || '暂无介绍' }}</text>
            <view class="tags" v-if="coach.tags && coach.tags.length">
                <text v-for="t in coach.tags" :key="t" class="tag">{{ t }}</text>
            </view>

            <view class="sec">计费</view>
            <view class="feecard">
                <text class="fl">时薪</text>
                <text class="fv mono">{{ money(coach.hourlyRate) }}<text class="fu">/小时</text></text>
                <text class="fnote">{{ coach.city || cityName }} · 线上预约，微信支付</text>
            </view>
        </view>

        <!-- 底部 CTA -->
        <view class="cta" :style="{ paddingBottom: 'calc(18rpx + ' + safeBottom + 'px)' }">
            <view class="cprice"><text class="cpn mono">{{ money(coach.hourlyRate) }}</text><text class="cpu">/时起</text></view>
            <view class="cbook" @tap="openBook">立即预约</view>
        </view>

        <!-- 预约弹层 -->
        <view v-if="showBook" class="mask" @tap="closeBook"></view>
        <view v-if="showBook" class="sheet" :style="{ paddingBottom: 'calc(20rpx + ' + safeBottom + 'px)' }" @tap.stop>
            <view class="shd"><text class="sht">预约 {{ coach.nickname }}</text><text class="close" @tap="closeBook">✕</text></view>
            <view class="frow"><text class="fk">日期</text><picker class="pk" mode="date" :value="date" @change="onDate"><text :class="['fv2', date ? '' : 'phc']">{{ date || '选择日期' }}</text></picker></view>
            <view class="frow"><text class="fk">时间</text><picker class="pk" mode="time" :value="time" @change="onTime"><text :class="['fv2', time ? '' : 'phc']">{{ time || '选择时间' }}</text></picker></view>
            <view class="frow"><text class="fk">时长</text>
                <view class="stepper">
                    <text class="stbtn" @tap="decHours">−</text>
                    <text class="stn mono">{{ hours }} 小时</text>
                    <text class="stbtn" @tap="incHours">＋</text>
                </view>
            </view>
            <view class="frow"><text class="fk">集合点</text><input class="fi2" v-model="meetingPoint" placeholder="如 东湖梨园广场" placeholder-class="ph" /></view>
            <view class="frow noline"><text class="fk">备注</text><input class="fi2" v-model="note" placeholder="想练的内容/目标（可选）" placeholder-class="ph" /></view>

            <view class="total">
                <text class="tl">合计</text>
                <text class="tv mono">¥{{ totalFee }}</text>
            </view>
            <view class="paybtn" @tap="submit">微信支付 ¥{{ totalFee }}</view>
        </view>
    </view>
</template>

<script>
import { getCoach, bookCoach, mockPayOrder } from '@/api/coach.js'
import { levelStyle } from '@/common/coachLevel.js'
import { isLoggedIn } from '@/store/user.js'
import { displayCityName } from '@/store/city.js'

export default {
    data() {
        return {
            id: null, coach: null, safeBottom: 0, cityName: displayCityName(),
            showBook: false, date: '', time: '', hours: 1, meetingPoint: '', note: '', submitting: false
        }
    },
    computed: {
        rating() { return this.coach && this.coach.rating != null ? Number(this.coach.rating).toFixed(1) : '5.0' },
        lvStyle() { return levelStyle(this.coach ? this.coach.level : '') },
        avatarBg() { return 'linear-gradient(135deg,#8fd3ff,#5e8bff)' },
        totalFee() { return this.coach ? Number(this.coach.hourlyRate) * this.hours : 0 }
    },
    onLoad(q) {
        this.id = q.id
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.load()
    },
    methods: {
        money(v) { return v == null ? '—' : '¥' + Number(v) },
        async load() { try { this.coach = await getCoach(this.id) } catch (e) {} },
        openBook() {
            if (!isLoggedIn()) { uni.navigateTo({ url: '/pages/login/login' }); return }
            this.showBook = true
        },
        closeBook() { this.showBook = false },
        onDate(e) { this.date = e.detail.value },
        onTime(e) { this.time = e.detail.value },
        incHours() { if (this.hours < 8) this.hours++ },
        decHours() { if (this.hours > 1) this.hours-- },
        async submit() {
            if (this.submitting) return
            if (!this.date || !this.time) { uni.showToast({ title: '请选择预约时间', icon: 'none' }); return }
            this.submitting = true
            try {
                const scheduledTime = `${this.date}T${this.time}:00`
                const r = await bookCoach({ coachId: Number(this.id), scheduledTime, hours: this.hours, meetingPoint: this.meetingPoint, note: this.note })
                await this.pay(r)
            } catch (e) {} finally { this.submitting = false }
        },
        async pay(order) {
            if (order.mock) {
                // 本地/开发：模拟支付成功
                await mockPayOrder(order.orderId)
                this.paid()
                return
            }
            // 生产：唤起微信支付
            const p = order.payParams || {}
            uni.requestPayment({
                provider: 'wxpay',
                timeStamp: p.timeStamp, nonceStr: p.nonceStr, package: p.package, signType: p.signType, paySign: p.paySign,
                success: () => this.paid(),
                fail: () => uni.showToast({ title: '支付未完成', icon: 'none' })
            })
        },
        paid() {
            this.showBook = false
            uni.showToast({ title: '预约支付成功', icon: 'success' })
            setTimeout(() => uni.navigateTo({ url: '/pages/coach/orders' }), 700)
        }
    }
}
</script>

<style lang="scss" scoped>
.cd { min-height: 100vh; background: $paper; padding-bottom: 160rpx; }
.hero { padding: 40rpx 30rpx 30rpx; text-align: center; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, #0e1b24, #123a57 60%, #0a5c86); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 22% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(2rpx 2rpx at 54% 14%, #fff, transparent); }
.av { position: relative; width: 130rpx; height: 130rpx; border-radius: 40rpx; margin: 0 auto; box-shadow: 0 0 0 4rpx rgba(255,255,255,.25); }
.nm { position: relative; display: block; font-size: 38rpx; font-weight: 800; margin-top: 18rpx; }
.lvbadge { position: relative; display: inline-block; font-size: 21rpx; font-weight: 800; padding: 5rpx 16rpx; border-radius: 12rpx; margin-top: 12rpx; }
.metrics { position: relative; display: flex; margin-top: 26rpx; background: rgba(255,255,255,.1); border-radius: 22rpx; padding: 20rpx 0; }
.m { flex: 1; text-align: center; }
.mn { display: block; font-size: 34rpx; font-weight: 800; }
.ml { display: block; font-size: 18rpx; opacity: .8; margin-top: 4rpx; }

.body { padding: 8rpx 30rpx; }
.sec { font-size: 30rpx; font-weight: 800; margin: 30rpx 0 14rpx; }
.intro { display: block; font-size: 26rpx; color: $ink-2; line-height: 1.7; }
.tags { display: flex; gap: 10rpx; margin-top: 16rpx; flex-wrap: wrap; }
.tag { font-size: 21rpx; color: $green-deep; background: $green-soft; padding: 5rpx 16rpx; border-radius: 12rpx; }
.feecard { background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.fl { font-size: 24rpx; color: $muted; }
.fv { display: block; font-size: 48rpx; font-weight: 800; color: $green-deep; margin-top: 6rpx; }
.fu { font-size: 24rpx; color: $muted; margin-left: 4rpx; }
.fnote { display: block; font-size: 21rpx; color: $faint; margin-top: 10rpx; }

.cta { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 20rpx; padding: 18rpx 30rpx 0; background: $card; border-top: 1rpx solid $hair; }
.cprice { display: flex; flex-direction: column; }
.cpn { font-size: 38rpx; font-weight: 800; color: $green-deep; }
.cpu { font-size: 19rpx; color: $muted; }
.cbook { flex: 1; height: 92rpx; border-radius: 28rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 30rpx; display: flex; align-items: center; justify-content: center; }

.mask { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 20; }
.sheet { position: fixed; left: 0; right: 0; bottom: 0; z-index: 21; background: $card; border-radius: 36rpx 36rpx 0 0; padding: 30rpx 30rpx 0; }
.shd { display: flex; align-items: center; margin-bottom: 10rpx; }
.sht { font-size: 32rpx; font-weight: 800; }
.close { margin-left: auto; font-size: 30rpx; color: $muted; padding: 8rpx; }
.frow { display: flex; align-items: center; gap: 20rpx; padding: 24rpx 0; border-bottom: 1rpx solid $hair; }
.frow.noline { border-bottom: 0; }
.fk { font-size: 26rpx; font-weight: 600; width: 110rpx; }
.pk, .fv2, .fi2 { flex: 1; text-align: right; font-size: 26rpx; }
.fv2.phc { color: $faint; }
.ph { color: $faint; }
.stepper { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 22rpx; }
.stbtn { width: 56rpx; height: 56rpx; border-radius: 16rpx; background: $paper; text-align: center; line-height: 52rpx; font-size: 34rpx; color: $ink; }
.stn { font-size: 26rpx; font-weight: 700; min-width: 120rpx; text-align: center; }
.total { display: flex; align-items: baseline; justify-content: flex-end; gap: 14rpx; padding: 24rpx 0 10rpx; }
.tl { font-size: 24rpx; color: $muted; }
.tv { font-size: 44rpx; font-weight: 800; color: $green-deep; }
.paybtn { height: 96rpx; border-radius: 28rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 30rpx; display: flex; align-items: center; justify-content: center; margin-top: 8rpx; }
</style>
