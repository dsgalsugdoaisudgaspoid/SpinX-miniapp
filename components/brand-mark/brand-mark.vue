<template>
    <image class="brand-mark" :style="markStyle" :src="src" mode="aspectFit"></image>
</template>

<script>
import { BRAND } from '@/common/config.js'

/**
 * SpinX 品牌水印角标：低透明度小字标，用于强化"这是 SpinX 系统"的归属感。
 * 只做视觉印记，不可点击、不承载信息——需要点击跳转关于页的场景请用 home.vue 那种带 tap 的完整品牌头，不要用这个。
 */
export default {
    name: 'brand-mark',
    props: {
        // dark：深色底用白色字标；light：浅色底用黑色字标
        theme: { type: String, default: 'dark' },
        width: { type: String, default: '110rpx' }
    },
    computed: {
        src() { return this.theme === 'light' ? BRAND.logo.wordmarkBlack : BRAND.logo.wordmarkWhite },
        // 字标原图宽高比约 6.35:1，按宽度等比算高度，避免每个引用处都要手算
        markStyle() {
            const w = parseFloat(this.width) || 110
            const unit = String(this.width).replace(String(w), '') || 'rpx'
            return { width: this.width, height: (w / 6.35).toFixed(1) + unit }
        }
    }
}
</script>

<style lang="scss" scoped>
.brand-mark { opacity: .34; pointer-events: none; }
</style>
