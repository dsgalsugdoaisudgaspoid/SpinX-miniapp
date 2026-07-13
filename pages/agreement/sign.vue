<template>
    <view class="sign" v-if="agreement">
        <view class="head">
            <text class="kk">SAFETY ACKNOWLEDGEMENT</text>
            <text class="h2">{{ agreement.title }}</text>
            <view class="ver">
                <text>当前版本</text><text class="vb">{{ agreement.version }}</text>
                <text>· 唯一档案编号提交后自动生成</text>
            </view>
        </view>

        <scroll-view scroll-y class="readbox" @scroll="onScroll">
            <rich-text :nodes="contentNodes"></rich-text>
        </scroll-view>

        <!-- 阅读计时 -->
        <view class="timer">
            <text class="ti">⏱ 阅读进度</text>
            <view class="tprog"><view class="tfill" :style="{ width: readPct + '%' }"></view></view>
            <text :class="['ts', canSign ? 'ok' : '']">{{ canSign ? '已达标 ✓ 可签署' : (required - readSeconds) + 's 后可签' }}</text>
        </view>

        <!-- 手写签名板 -->
        <view class="padwrap">
            <view class="padhint" v-if="!hasInk"><text>在此手写签名</text></view>
            <canvas canvas-id="sign" id="sign" class="pad"
                @touchstart="start" @touchmove="move" @touchend="end" disable-scroll="true"></canvas>
            <view class="baseline"></view>
            <text class="clear" @tap="clearPad">重写</text>
        </view>

        <view class="guard">
            <text class="gi">👪</text>
            <text class="gt">未成年会员需监护人线上代签补充协议，单独加密存档区分。</text>
        </view>

        <view class="footer" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <view :class="['g-btn', submitDisabled ? 'off' : '']" @tap="submit">
                ✍ 确认签署{{ activityId ? '并报名' : '' }}
            </view>
            <text class="fine">签名、身份证号将 AES 加密存储 · 签约记录永久留档、可随时导出举证</text>
        </view>
    </view>
</template>

<script>
import { getAgreement, signAgreement } from '@/api/agreement.js'
import { statusBarHeight } from '@/common/util.js'

export default {
    data() {
        return {
            agreementId: null, activityId: null,
            agreement: null, required: 30, readSeconds: 0, timer: null,
            ctx: null, hasInk: false, last: null, safeBottom: 0, submitting: false
        }
    },
    computed: {
        contentNodes() {
            const c = (this.agreement && this.agreement.content) || ''
            return '<div style="font-size:24rpx;line-height:1.9;color:#33433c">' +
                c.replace(/\n/g, '<br/>') + '</div>'
        },
        readPct() { return Math.min(100, Math.round((this.readSeconds / this.required) * 100)) },
        canSign() { return this.readSeconds >= this.required },
        submitDisabled() { return !this.canSign || !this.hasInk || this.submitting }
    },
    onLoad(q) {
        this.agreementId = q.agreementId
        this.activityId = q.activityId || null
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.load()
        this.timer = setInterval(() => {
            if (this.readSeconds < this.required) this.readSeconds++
            else clearInterval(this.timer)
        }, 1000)
    },
    onReady() {
        this.ctx = uni.createCanvasContext('sign', this)
        this.ctx.setStrokeStyle('#0e1b24')
        this.ctx.setLineWidth(4)
        this.ctx.setLineCap('round')
        this.ctx.setLineJoin('round')
    },
    onUnload() { if (this.timer) clearInterval(this.timer) },
    methods: {
        async load() {
            try {
                this.agreement = await getAgreement(this.agreementId)
                if (this.agreement && this.agreement.requiredReadingSeconds) this.required = this.agreement.requiredReadingSeconds
            } catch (e) {}
        },
        onScroll() {},
        start(e) {
            const p = e.touches[0]
            this.last = { x: p.x, y: p.y }
            this.hasInk = true
        },
        move(e) {
            const p = e.touches[0]
            if (!this.last) { this.last = { x: p.x, y: p.y }; return }
            this.ctx.beginPath()
            this.ctx.moveTo(this.last.x, this.last.y)
            this.ctx.lineTo(p.x, p.y)
            this.ctx.stroke()
            this.ctx.draw(true)
            this.last = { x: p.x, y: p.y }
        },
        end() { this.last = null },
        clearPad() {
            this.ctx.clearRect(0, 0, 2000, 2000)
            this.ctx.draw()
            this.hasInk = false
        },
        submit() {
            if (this.submitDisabled) {
                if (!this.canSign) uni.showToast({ title: `请阅读满 ${this.required} 秒`, icon: 'none' })
                else if (!this.hasInk) uni.showToast({ title: '请先手写签名', icon: 'none' })
                return
            }
            this.submitting = true
            uni.canvasToTempFilePath({
                canvasId: 'sign',
                success: (res) => {
                    uni.getFileSystemManager().readFile({
                        filePath: res.tempFilePath, encoding: 'base64',
                        success: (r) => this.doSign('data:image/png;base64,' + r.data),
                        fail: () => this.doSign('data:image/png;base64,') // 兜底仍提交
                    })
                },
                fail: () => this.doSign('data:image/png;base64,')
            }, this)
        },
        async doSign(signature) {
            try {
                await signAgreement(this.agreementId, { signature, readDuration: this.readSeconds })
                uni.showToast({ title: this.activityId ? '签署完成，报名生效' : '签署完成', icon: 'success' })
                setTimeout(() => {
                    const pages = getCurrentPages()
                    pages.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/home/home' })
                }, 800)
            } catch (e) {
                // code 2004: 阅读时长不足
                if (e && e.code === 2004) uni.showToast({ title: e.message || '阅读时长不足', icon: 'none' })
            } finally { this.submitting = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.sign { min-height: 100vh; background: $paper; display: flex; flex-direction: column; }
.head { padding: 34rpx 32rpx 6rpx; background: $card; }
.kk { font-size: 20rpx; letter-spacing: 3rpx; color: $muted; }
.h2 { display: block; font-size: 40rpx; font-weight: 800; margin-top: 12rpx; }
.ver { display: flex; align-items: center; gap: 12rpx; margin-top: 16rpx; font-size: 22rpx; color: $muted; }
.vb { font-family: 'SF Mono', Menlo, monospace; background: $paper; padding: 4rpx 14rpx; border-radius: 10rpx; color: $ink-2; }

.readbox { margin: 24rpx 28rpx 0; background: $card; border-radius: 24rpx; padding: 28rpx; height: 300rpx; }

.timer { display: flex; align-items: center; gap: 16rpx; margin: 24rpx 32rpx 0; font-size: 22rpx; color: $muted; }
.tprog { flex: 1; height: 12rpx; border-radius: 8rpx; background: $hair; overflow: hidden; }
.tfill { height: 100%; background: $green; border-radius: 8rpx; transition: width .3s; }
.ts.ok { color: $green-deep; font-weight: 800; }

.padwrap { position: relative; margin: 26rpx 28rpx 0; height: 260rpx; background: $card; border-radius: 24rpx; box-shadow: inset 0 0 0 3rpx $green-soft; overflow: hidden; }
.pad { width: 100%; height: 260rpx; }
.padhint { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: $faint; font-size: 24rpx; pointer-events: none; }
.baseline { position: absolute; left: 34rpx; right: 34rpx; bottom: 60rpx; border-bottom: 3rpx dashed $line; }
.clear { position: absolute; right: 24rpx; top: 20rpx; font-size: 22rpx; color: $muted; background: $paper; padding: 8rpx 20rpx; border-radius: 14rpx; }

.guard { display: flex; align-items: center; gap: 14rpx; margin: 22rpx 28rpx 0; padding: 22rpx; border-radius: 20rpx; background: #fbf7e8; }
.gi { font-size: 28rpx; } .gt { flex: 1; font-size: 22rpx; color: #8a6d1a; line-height: 1.5; }

.footer { padding: 28rpx 28rpx 0; margin-top: auto; }
.g-btn.off { background: #d7ddda; color: #8a968f; }
.fine { display: block; text-align: center; font-size: 20rpx; color: $muted; margin-top: 18rpx; line-height: 1.5; }
</style>
