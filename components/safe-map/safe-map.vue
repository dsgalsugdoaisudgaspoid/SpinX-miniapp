<template>
    <view class="smwrap" :style="wrapStyle">
        <map v-if="!failed" :id="mapId" class="sm" :latitude="latitude" :longitude="longitude" :markers="markers" :scale="scale"
            @updated="onUpdated" @error="onError" @markertap="onMarkerTap" @regionchange="onRegion" @tap="onTap"></map>
        <!-- 小尺寸缩略地图的"可点开"提示：这么小的图不给个视觉提示，用户不会知道能点 -->
        <view v-if="!failed && expandable" class="smbadge">🔍 查看大图</view>
        <view v-else-if="failed" class="sm smtip">
            <text class="smi">🗺</text>
            <text class="smt">{{ tip }}</text>
            <text class="smr" @tap="retry">点击重试</text>
        </view>
    </view>
</template>

<script>
/**
 * 带兜底的地图组件。
 *
 * 兜底策略：地图渲染成功会触发 `@updated`；若超过 timeout 仍未触发（组件加载失败、
 * 模拟器渲染异常、地图服务不可用等），就降级成占位提示，并提供「点击重试」重新挂载。
 * `@error` 在部分平台不一定会触发，这里一并绑定作为更快的失败信号，但不依赖它。
 *
 * 注意：判定为失败只是不再显示地图，页面其它信息（地点名称/列表）始终可用，
 * 因此即使误判也不会让用户丢失功能，且可一键重试。
 */
export default {
    name: 'safe-map',
    props: {
        latitude: { type: [Number, String], default: 0 },
        longitude: { type: [Number, String], default: 0 },
        markers: { type: Array, default: () => [] },
        scale: { type: [Number, String], default: 14 },
        height: { type: String, default: '260rpx' },
        radius: { type: String, default: '18rpx' },
        timeout: { type: Number, default: 4000 },
        tip: { type: String, default: '地图暂时无法显示' },
        // 缩略图场景（如活动详情里 180rpx 高的小地图）传 true：右下角露出"查看大图"提示，
        // 点击（含点地图任意处，不只是提示角标）交由父组件监听 @tap 决定具体行为
        // （成熟方案是 uni.openLocation 调起微信内置地图，见 pages/activity/detail.vue）
        expandable: { type: Boolean, default: false }
    },
    data() { return { failed: false, ready: false, timer: null, mapId: 'safemap_' + Math.random().toString(36).slice(2, 8) } },
    computed: {
        wrapStyle() { return { height: this.height, borderRadius: this.radius } }
    },
    mounted() { this.watch() },
    beforeDestroy() { this.clear() },
    methods: {
        watch() {
            this.clear()
            this.timer = setTimeout(() => { if (!this.ready) this.failed = true }, this.timeout)
        },
        clear() { if (this.timer) { clearTimeout(this.timer); this.timer = null } },
        onUpdated() { this.ready = true; this.clear() },
        onError() { this.clear(); this.failed = true },
        onMarkerTap(e) { this.$emit('markertap', e) },
        onTap() { this.$emit('tap') },
        // 缩放/平移结束后读取当前 scale，抛给父页用于按缩放级别稀释标记
        onRegion(e) {
            if (!e || e.type !== 'end') return
            try {
                const ctx = uni.createMapContext(this.mapId, this)
                ctx.getScale({ success: (r) => { if (r && r.scale != null) this.$emit('scalechange', r.scale) } })
            } catch (err) {}
        },
        retry() { this.failed = false; this.ready = false; this.watch() }
    }
}
</script>

<style lang="scss" scoped>
.smwrap { width: 100%; overflow: hidden; position: relative; }
.sm { width: 100%; height: 100%; }
.smbadge { position: absolute; right: 12rpx; bottom: 12rpx; font-size: 20rpx; font-weight: 700; color: #fff;
    background: rgba(14,27,36,.72); padding: 6rpx 16rpx; border-radius: 20rpx; pointer-events: none; }
.smtip { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8rpx;
    background: $paper; box-shadow: inset 0 0 0 1rpx $hair; }
.smi { font-size: 40rpx; }
.smt { font-size: 22rpx; color: $muted; }
.smr { font-size: 21rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 8rpx 20rpx; border-radius: 12rpx; margin-top: 4rpx; }
</style>
