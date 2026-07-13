<template>
    <view class="myag">
        <!-- 待签署 -->
        <view v-if="pending.length" class="block">
            <view class="bh"><text class="bt">待签署</text><text class="warn">{{ pending.length }} 份待处理</text></view>
            <view v-for="a in pending" :key="a.agreementId" class="row pend" @tap="goSign(a)">
                <view class="doc warn2">📝</view>
                <view class="mid">
                    <text class="t">{{ a.title }}</text>
                    <text class="sub mono">{{ a.version }} · 需阅读 {{ a.requiredReadingSeconds || 30 }}s</text>
                </view>
                <text class="act">去签署 ›</text>
            </view>
        </view>

        <!-- 已签署存档 -->
        <view class="block">
            <view class="bh"><text class="bt">已签署存档</text><text class="lock">🔒 永久加密留档</text></view>
            <view v-for="a in signed" :key="a.archiveNo" class="row" @tap="viewArchive(a)">
                <view class="doc">📄</view>
                <view class="mid">
                    <text class="t">{{ a.title }}</text>
                    <text class="sub mono">{{ a.archiveNo }} · {{ a.version }}</text>
                    <text class="sub2">签署于 {{ shortDate(a.signedAt) }}</text>
                </view>
                <text class="dl">查看</text>
            </view>
            <view v-if="signed.length === 0 && pending.length === 0" class="empty">
                <text class="ee">📁</text><text>暂无签约记录</text>
                <text class="es">报名活动时会引导签署骑行安全协议</text>
            </view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { pendingAgreements, signedAgreements } from '@/api/agreement.js'

export default {
    data() { return { pending: [], signed: [] } },
    onShow() { this.load() },
    methods: {
        shortDate(iso) { if (!iso) return ''; return iso.replace('T', ' ').slice(0, 16) },
        async load() {
            try { const d = await pendingAgreements(); this.pending = (d && d.list) || [] } catch (e) {}
            try { const d = await signedAgreements(); this.signed = (d && d.list) || [] } catch (e) {}
        },
        goSign(a) { uni.navigateTo({ url: '/pages/agreement/sign?agreementId=' + a.agreementId }) },
        viewArchive(a) {
            uni.showModal({
                title: a.title,
                content: `档案编号：${a.archiveNo}\n版本：${a.version}\n签署时间：${this.shortDate(a.signedAt)}\n\n存档可用于举证，如需 PDF 请联系俱乐部导出。`,
                showCancel: false, confirmText: '知道了', confirmColor: '#0ba968'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.myag { min-height: 100vh; background: $paper; padding-top: 20rpx; }
.block { margin: 0 24rpx 24rpx; background: $card; border-radius: 26rpx; padding: 8rpx 26rpx 16rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.bh { display: flex; align-items: center; padding: 22rpx 0 10rpx; }
.bt { font-size: 28rpx; font-weight: 800; }
.warn { margin-left: auto; font-size: 20rpx; font-weight: 800; color: #b8760a; background: #fdf1dd; padding: 6rpx 16rpx; border-radius: 14rpx; }
.lock { margin-left: auto; font-size: 20rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 6rpx 16rpx; border-radius: 14rpx; }
.row { display: flex; align-items: center; gap: 18rpx; padding: 22rpx 0; border-bottom: 1rpx solid $hair; }
.row:last-child { border-bottom: 0; }
.doc { width: 66rpx; height: 66rpx; border-radius: 18rpx; background: $paper; display: flex; align-items: center; justify-content: center; font-size: 32rpx; flex: none; }
.doc.warn2 { background: #fdf1dd; }
.mid { flex: 1; min-width: 0; }
.t { display: block; font-size: 27rpx; font-weight: 700; }
.sub { display: block; font-size: 20rpx; color: $muted; margin-top: 4rpx; }
.sub2 { display: block; font-size: 20rpx; color: $faint; margin-top: 2rpx; }
.act { font-size: 22rpx; color: #b8760a; font-weight: 800; flex: none; }
.dl { font-size: 22rpx; color: $green-deep; font-weight: 800; flex: none; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 70rpx 0; display: flex; flex-direction: column; align-items: center; gap: 12rpx; }
.ee { font-size: 70rpx; }
.es { font-size: 21rpx; }
.safe-bottom { height: 40rpx; }
</style>
