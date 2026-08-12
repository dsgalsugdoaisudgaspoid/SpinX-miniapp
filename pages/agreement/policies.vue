<template>
    <view class="pc">
        <view class="intro">骑行前的知情同意、平台的用户协议与隐私政策，均在此可随时查阅。涉及安全的协议在报名时会引导签署。</view>

        <view class="grp" v-if="signables.length">
            <text class="gt">需签署协议</text>
            <view v-for="a in signables" :key="a.agreementId" class="row" :data-id="a.agreementId" :data-signable="1" :data-signed="a.userSigned ? 1 : 0" @tap="open">
                <text class="ic">{{ iconOf(a.type) }}</text>
                <view class="mid"><text class="t">{{ a.title }}</text><text class="s ellipsis-2">{{ a.summary }}</text></view>
                <text :class="['tag', a.userSigned ? 'done' : '']">{{ a.userSigned ? '已签 ✓' : '待签' }}</text>
            </view>
        </view>

        <view class="grp" v-if="policies.length">
            <text class="gt">平台政策</text>
            <view v-for="a in policies" :key="a.agreementId" class="row" :data-id="a.agreementId" :data-signable="0" @tap="open">
                <text class="ic">{{ iconOf(a.type) }}</text>
                <view class="mid"><text class="t">{{ a.title }}</text><text class="s ellipsis-2">{{ a.summary }}</text></view>
                <text class="arw">›</text>
            </view>
        </view>

        <view v-if="!loading && list.length === 0" class="empty">暂无协议</view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { allAgreements } from '@/api/agreement.js'

const ICON = {
    safety_acknowledgement: '🛡', guardian_consent: '👪', insurance_authorization: '📄',
    terms_of_service: '📘', privacy_policy: '🔒', account_deletion: '🗑'
}

export default {
    data() { return { list: [], loading: false } },
    computed: {
        signables() { return this.list.filter(a => a.signable) },
        policies() { return this.list.filter(a => !a.signable) }
    },
    onShow() { this.load() },
    methods: {
        iconOf(t) { return ICON[t] || '📄' },
        async load() {
            this.loading = true
            try { const d = await allAgreements(); this.list = (d && d.list) || [] } catch (e) { this.list = [] } finally { this.loading = false }
        },
        open(e) {
            const ds = e.currentTarget.dataset
            if (String(ds.signable) === '1' && String(ds.signed) !== '1') {
                uni.navigateTo({ url: '/pages/agreement/sign?agreementId=' + ds.id })
            } else {
                uni.navigateTo({ url: '/pages/agreement/view?id=' + ds.id })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.pc { min-height: 100vh; background: $paper; padding-bottom: 40rpx; }
.intro { margin: 24rpx 28rpx 0; font-size: 22rpx; color: $muted; line-height: 1.7; }
.grp { margin-top: 26rpx; }
.gt { display: block; font-size: 25rpx; font-weight: 800; color: $ink-2; margin: 0 30rpx 12rpx; }
.row { display: flex; align-items: center; gap: 18rpx; margin: 0 28rpx 14rpx; background: $card; border-radius: 24rpx; padding: 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.ic { font-size: 40rpx; flex: none; }
.mid { flex: 1; min-width: 0; }
.t { display: block; font-size: 27rpx; font-weight: 800; }
.s { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 21rpx; color: $muted; line-height: 1.55; margin-top: 8rpx; }
.tag { flex: none; font-size: 20rpx; font-weight: 800; color: #b5750c; background: #fbf1e4; padding: 6rpx 16rpx; border-radius: 12rpx; }
.tag.done { color: $green-deep; background: $green-soft; }
.arw { flex: none; color: $faint; font-size: 34rpx; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 100rpx 0; }
.safe-bottom { height: 40rpx; }
</style>
