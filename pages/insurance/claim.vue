<template>
    <view class="cl">
        <view class="hero">
            <text class="kk">CLAIM GUIDE</text>
            <text class="h2">理赔指引</text>
            <text class="sub">发生意外后，请尽快按以下流程处理，并保留全部凭证。</text>
        </view>

        <view class="steps">
            <view v-for="(s, i) in steps" :key="i" class="step">
                <text class="idx mono">{{ i + 1 }}</text>
                <view class="sb"><text class="st">{{ s.t }}</text><text class="sd">{{ s.d }}</text></view>
            </view>
        </view>

        <view class="sec">理赔所需材料</view>
        <view class="mats">
            <text v-for="(m, i) in materials" :key="i" class="mat">· {{ m }}</text>
        </view>

        <view class="tip">
            <text class="ti">⚠️</text>
            <text class="tt">属于保险条款除外责任（如酒后骑行、严重违反交通规则、既往疾病、未按约定佩戴头盔等）的情形，保险公司有权拒赔，具体以保单条款为准。理赔时限一般较短，请及时报案。</text>
        </view>

        <view class="contact">
            <text class="cc">如需协助，可通过小程序「反馈投诉」联系俱乐部，或拨打保单上载明的保险公司报案电话。</text>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            steps: [
                { t: '立即报案', d: '事故发生后第一时间拨打保单载明的保险公司报案电话，并告知领队；紧急情况先拨打 120 / 122。' },
                { t: '及时就医', d: '前往二级及以上公立医院就诊，保留挂号、病历、诊断、费用票据等全部原件。' },
                { t: '收集材料', d: '按下方清单收集理赔材料；涉及交通事故的，取得交警事故认定书。' },
                { t: '提交理赔', d: '在条款约定时限内向保险公司提交理赔申请，可请俱乐部协助对接。' },
                { t: '等待结案', d: '保险公司核定后赔付到指定账户；对结果有异议可申诉。' }
            ],
            materials: [
                '被保险人身份证件',
                '保单号 / 投保凭证（见「我的保单」）',
                '医院诊断证明与病历',
                '医疗费用发票及费用清单原件',
                '事故经过说明（领队可协助出具活动证明）',
                '涉及交通事故的：交警事故认定书',
                '银行卡账户信息'
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
.cl { min-height: 100vh; background: $paper; padding-bottom: 40rpx; }
.hero { padding: 40rpx 32rpx 30rpx; background: $card; }
.kk { font-size: 20rpx; letter-spacing: 3rpx; color: $muted; }
.h2 { display: block; font-size: 40rpx; font-weight: 800; margin-top: 12rpx; }
.sub { display: block; font-size: 23rpx; color: $muted; margin-top: 14rpx; line-height: 1.6; }
.steps { padding: 24rpx 28rpx 0; display: flex; flex-direction: column; gap: 16rpx; }
.step { display: flex; gap: 20rpx; background: $card; border-radius: 24rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.idx { width: 52rpx; height: 52rpx; flex: none; border-radius: 50%; background: $green-soft; color: $green-deep; font-weight: 800; font-size: 28rpx; display: flex; align-items: center; justify-content: center; }
.sb { flex: 1; min-width: 0; }
.st { display: block; font-size: 27rpx; font-weight: 800; }
.sd { display: block; font-size: 22rpx; color: $muted; line-height: 1.7; margin-top: 8rpx; }
.sec { font-size: 28rpx; font-weight: 800; margin: 32rpx 30rpx 14rpx; }
.mats { margin: 0 28rpx; background: $card; border-radius: 24rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; display: flex; flex-direction: column; gap: 12rpx; }
.mat { font-size: 24rpx; color: $ink-2; line-height: 1.5; }
.tip { display: flex; gap: 12rpx; margin: 22rpx 28rpx 0; background: #fbf7e8; border-radius: 20rpx; padding: 22rpx; }
.ti { font-size: 26rpx; flex: none; } .tt { flex: 1; font-size: 22rpx; color: #8a6d1a; line-height: 1.7; }
.contact { margin: 20rpx 30rpx 0; }
.cc { font-size: 22rpx; color: $muted; line-height: 1.7; }
.safe-bottom { height: 40rpx; }
</style>
