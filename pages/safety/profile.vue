<template>
    <view class="sp">
        <view class="banner">
            <text class="bi">🚑</text>
            <view class="bt"><text class="bt1">安全档案</text><text class="bt2">紧急联系人与健康信息仅用于活动安全保障，仅领队与管理员在必要时脱敏可见。</text></view>
        </view>

        <view class="group">
            <view class="gh">紧急联系人 · 必填</view>
            <view class="frow"><text class="fk">姓名</text><input class="fi" v-model="form.emergencyName" placeholder="紧急联系人姓名" placeholder-class="ph" /></view>
            <view class="frow"><text class="fk">关系</text>
                <picker mode="selector" :range="relations" @change="onRelation"><text class="fpick">{{ form.emergencyRelation || '请选择 ›' }}</text></picker>
            </view>
            <view class="frow noline"><text class="fk">电话</text><input class="fi" type="number" v-model="form.emergencyPhone" placeholder="紧急联系人手机号" placeholder-class="ph" /></view>
        </view>

        <view class="group">
            <view class="gh">健康信息 · 选填（利于紧急处置）</view>
            <view class="frow"><text class="fk">血型</text>
                <picker mode="selector" :range="bloodTypes" @change="onBlood"><text class="fpick">{{ form.bloodType || '请选择 ›' }}</text></picker>
            </view>
            <view class="frow col"><text class="fk">过敏史</text><input class="fi2" v-model="form.allergies" placeholder="如青霉素过敏；无则留空" placeholder-class="ph" /></view>
            <view class="frow col noline"><text class="fk">既往病史</text><input class="fi2" v-model="form.medicalHistory" placeholder="如心脏病、哮喘等；无则留空" placeholder-class="ph" /></view>
        </view>

        <view class="group">
            <view class="gh">保险</view>
            <view class="frow noline"><text class="fk">保单号</text><input class="fi" v-model="form.insuranceNo" placeholder="已投保可填写，便于理赔" placeholder-class="ph" /></view>
        </view>

        <view class="incrow" @tap="goIncident"><text class="inci">🧾</text><text class="inct">发生事故？点此上报存档</text><text class="incarw">›</text></view>

        <view class="footer" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <view :class="['g-btn', canSave ? '' : 'off']" @tap="save">保存安全档案</view>
            <text class="fine">🔒 敏感信息加密存储 · 遵循《隐私政策》最小必要原则</text>
        </view>
    </view>
</template>

<script>
import { getSafetyProfile, updateSafetyProfile } from '@/api/user.js'

export default {
    data() {
        return {
            safeBottom: 0,
            relations: ['配偶', '父母', '子女', '兄弟姐妹', '朋友', '其他'],
            bloodTypes: ['A', 'B', 'O', 'AB', '不清楚'],
            form: { emergencyName: '', emergencyRelation: '', emergencyPhone: '', bloodType: '', allergies: '', medicalHistory: '', insuranceNo: '' }
        }
    },
    computed: {
        canSave() { return !!(this.form.emergencyName.trim() && /^\d{6,}$/.test(this.form.emergencyPhone.trim())) }
    },
    onLoad() {
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.load()
    },
    methods: {
        async load() { try { const d = await getSafetyProfile(); if (d) this.form = Object.assign(this.form, d) } catch (e) {} },
        onRelation(e) { this.form.emergencyRelation = this.relations[e.detail.value] },
        onBlood(e) { this.form.bloodType = this.bloodTypes[e.detail.value] },
        goIncident() { uni.navigateTo({ url: '/pages/safety/incident' }) },
        async save() {
            if (!this.canSave) { uni.showToast({ title: '请填写紧急联系人姓名与有效电话', icon: 'none' }); return }
            try {
                await updateSafetyProfile(this.form)
                uni.showToast({ title: '已保存', icon: 'success' })
                setTimeout(() => uni.navigateBack(), 700)
            } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.sp { min-height: 100vh; background: $paper; padding: 20rpx 0 40rpx; }
.banner { display: flex; gap: 18rpx; margin: 0 24rpx 20rpx; background: #eef3fb; border-radius: 24rpx; padding: 24rpx; }
.bi { font-size: 40rpx; flex: none; }
.bt1 { display: block; font-size: 27rpx; font-weight: 800; color: #2b6bb5; }
.bt2 { display: block; font-size: 21rpx; color: $ink-2; line-height: 1.6; margin-top: 8rpx; }
.group { margin: 0 24rpx 20rpx; background: $card; border-radius: 26rpx; padding: 0 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.gh { font-size: 22rpx; color: $muted; font-weight: 700; padding: 22rpx 0 6rpx; }
.frow { display: flex; align-items: center; gap: 20rpx; padding: 26rpx 0; border-bottom: 1rpx solid $hair; min-height: 40rpx; }
.frow.noline { border-bottom: 0; }
.frow.col { flex-direction: column; align-items: stretch; gap: 12rpx; }
.fk { font-size: 27rpx; font-weight: 600; color: $ink; flex: none; width: 130rpx; }
.frow.col .fk { width: auto; }
.fi { flex: 1; text-align: right; font-size: 27rpx; color: $ink; }
.fi2 { width: 100%; font-size: 25rpx; background: $paper; border-radius: 14rpx; padding: 18rpx; box-sizing: border-box; }
.ph { color: $faint; }
.fpick { font-size: 26rpx; color: $green-deep; font-weight: 700; margin-left: auto; }
.incrow { display: flex; align-items: center; gap: 14rpx; margin: 0 24rpx 20rpx; background: $card; border-radius: 20rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.inci { font-size: 30rpx; } .inct { flex: 1; font-size: 24rpx; font-weight: 600; color: $ink-2; } .incarw { color: $faint; font-size: 30rpx; }
.footer { padding: 10rpx 24rpx 0; }
.g-btn.off { background: #d7ddda; color: #8a968f; }
.fine { display: block; text-align: center; font-size: 20rpx; color: $muted; margin-top: 16rpx; }
</style>
