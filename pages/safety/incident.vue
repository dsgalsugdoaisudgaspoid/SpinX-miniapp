<template>
    <view class="inc">
        <view class="banner">
            <text class="bi">🧾</text>
            <view class="bt"><text class="bt1">事故上报 · 补录存档</text><text class="bt2">如实填写事故经过，便于俱乐部处理、保险理赔与后续改进。紧急情况请先 SOS 或拨打 120。</text></view>
        </view>

        <view class="group">
            <view class="frow"><text class="fk">事故类型</text>
                <picker mode="selector" :range="types" @change="onType"><text class="fpick">{{ form.type || '请选择 ›' }}</text></picker>
            </view>
            <view class="frow"><text class="fk">伤情程度</text>
                <picker mode="selector" :range="levels" @change="onLevel"><text class="fpick">{{ form.injuryLevel || '请选择 ›' }}</text></picker>
            </view>
            <view class="frow col noline"><text class="fk">经过描述</text>
                <textarea class="fa" v-model="form.description" placeholder="时间、地点、如何发生、当前处置情况等" placeholder-class="ph" />
            </view>
        </view>

        <view class="group">
            <view class="frow noline" @tap="grabLocation">
                <text class="fk flex1">当前位置</text>
                <text class="loc mono">{{ locText }}</text>
                <text class="locbtn">{{ located ? '重新定位' : '获取' }}</text>
            </view>
        </view>

        <view class="footer" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <view :class="['g-btn', canSubmit ? '' : 'off']" @tap="submit">提交事故报告</view>
        </view>
    </view>
</template>

<script>
import { fileIncident } from '@/api/safety.js'

export default {
    data() {
        return {
            safeBottom: 0, activityId: null, located: false,
            types: ['摔车/失控', '车辆碰撞', '机械故障', '身体不适', '其他'],
            levels: ['无伤', '轻微擦伤', '需要就医', '严重/送医'],
            form: { type: '', injuryLevel: '', description: '', latitude: null, longitude: null }
        }
    },
    computed: {
        canSubmit() { return !!(this.form.type && this.form.injuryLevel && this.form.description.trim()) },
        locText() { return this.located ? (this.form.latitude.toFixed(4) + ', ' + this.form.longitude.toFixed(4)) : '未获取' }
    },
    onLoad(q) {
        this.activityId = (q && q.activityId) || null
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
    },
    methods: {
        onType(e) { this.form.type = this.types[e.detail.value] },
        onLevel(e) { this.form.injuryLevel = this.levels[e.detail.value] },
        grabLocation() {
            uni.getLocation({
                type: 'gcj02',
                success: (loc) => { this.form.latitude = loc.latitude; this.form.longitude = loc.longitude; this.located = true; uni.showToast({ title: '已获取位置', icon: 'none' }) },
                fail: () => uni.showToast({ title: '未能获取定位', icon: 'none' })
            })
        },
        async submit() {
            if (!this.canSubmit) { uni.showToast({ title: '请填写类型、伤情与经过', icon: 'none' }); return }
            try {
                await fileIncident(Object.assign({ activityId: this.activityId }, this.form))
                uni.showToast({ title: '已提交并存档', icon: 'success' })
                setTimeout(() => uni.navigateBack(), 800)
            } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.inc { min-height: 100vh; background: $paper; padding: 20rpx 0 40rpx; }
.banner { display: flex; gap: 18rpx; margin: 0 24rpx 20rpx; background: #fbf1e4; border-radius: 24rpx; padding: 24rpx; }
.bi { font-size: 40rpx; flex: none; }
.bt1 { display: block; font-size: 27rpx; font-weight: 800; color: #b5750c; }
.bt2 { display: block; font-size: 21rpx; color: $ink-2; line-height: 1.6; margin-top: 8rpx; }
.group { margin: 0 24rpx 20rpx; background: $card; border-radius: 26rpx; padding: 0 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.frow { display: flex; align-items: center; gap: 20rpx; padding: 26rpx 0; border-bottom: 1rpx solid $hair; min-height: 40rpx; }
.frow.noline { border-bottom: 0; }
.frow.col { flex-direction: column; align-items: stretch; gap: 12rpx; }
.fk { font-size: 27rpx; font-weight: 600; color: $ink; flex: none; width: 150rpx; }
.frow.col .fk { width: auto; }
.fpick { font-size: 26rpx; color: $green-deep; font-weight: 700; margin-left: auto; }
.fa { width: 100%; height: 180rpx; font-size: 25rpx; background: $paper; border-radius: 14rpx; padding: 18rpx; box-sizing: border-box; }
.ph { color: $faint; }
.loc { font-size: 24rpx; color: $muted; margin-right: 12rpx; }
.locbtn { font-size: 22rpx; color: $green-deep; font-weight: 700; }
.footer { padding: 10rpx 24rpx 0; }
.g-btn.off { background: #d7ddda; color: #8a968f; }
</style>
