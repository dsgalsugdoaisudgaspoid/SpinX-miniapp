<template>
    <view class="av" v-if="ag">
        <view class="head">
            <text class="kk">{{ typeLabel }}</text>
            <text class="h2">{{ ag.title }}</text>
            <view class="ver">
                <text>当前版本</text><text class="vb">{{ ag.version }}</text>
                <text v-if="ag.userSigned" class="signed">· 已签署 ✓</text>
            </view>
        </view>
        <view class="body"><rich-text :nodes="contentNodes"></rich-text></view>
        <view class="foot">本文本为电子存档版本 · {{ ag.version }}</view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getAgreement } from '@/api/agreement.js'

const TYPE_LABEL = {
    safety_acknowledgement: 'SAFETY ACKNOWLEDGEMENT',
    guardian_consent: 'GUARDIAN CONSENT',
    insurance_authorization: 'INSURANCE',
    terms_of_service: 'TERMS OF SERVICE',
    privacy_policy: 'PRIVACY POLICY',
    account_deletion: 'ACCOUNT DELETION'
}

export default {
    data() { return { id: null, ag: null } },
    computed: {
        typeLabel() { return (this.ag && TYPE_LABEL[this.ag.type]) || 'AGREEMENT' },
        contentNodes() {
            const c = (this.ag && this.ag.content) || ''
            return '<div style="font-size:25rpx;line-height:1.95;color:#4b584f">' + c.replace(/\n/g, '<br/>') + '</div>'
        }
    },
    onLoad(q) { this.id = q.id; this.load() },
    methods: {
        async load() {
            try { this.ag = await getAgreement(this.id); if (this.ag && this.ag.title) uni.setNavigationBarTitle({ title: this.ag.title }) } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.av { min-height: 100vh; background: $paper; }
.head { padding: 34rpx 32rpx 6rpx; background: $card; }
.kk { font-size: 20rpx; letter-spacing: 3rpx; color: $muted; }
.h2 { display: block; font-size: 38rpx; font-weight: 800; margin-top: 12rpx; line-height: 1.3; }
.ver { display: flex; align-items: center; gap: 12rpx; margin-top: 16rpx; font-size: 22rpx; color: $muted; }
.vb { font-family: 'SF Mono', Menlo, monospace; background: $paper; padding: 4rpx 14rpx; border-radius: 10rpx; color: $ink-2; }
.signed { color: $green-deep; font-weight: 700; }
.body { margin: 24rpx 28rpx 0; background: $card; border-radius: 24rpx; padding: 30rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.foot { text-align: center; font-size: 20rpx; color: $faint; margin: 24rpx 0 0; }
.safe-bottom { height: 60rpx; }
</style>
