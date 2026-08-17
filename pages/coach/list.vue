<template>
    <view class="clist">
        <view class="head">
            <text class="ht">找陪练</text>
            <text class="hs">平台考核认证 · 等级挂钩时薪</text>
        </view>

        <!-- 等级筛选 -->
        <scroll-view scroll-x class="levels" show-scrollbar="false">
            <text v-for="l in levelTabs" :key="l.key" :class="['lv', level === l.key ? 'on' : '']" :data-k="l.key" @tap="switchLevel" :style="level === l.key ? l.onStyle : ''">{{ l.name }}</text>
        </scroll-view>

        <view class="sortbar">
            <text :class="['so', sort === 'rating' ? 'on' : '']" data-k="rating" @tap="switchSort">口碑优先</text>
            <text :class="['so', sort === 'price_asc' ? 'on' : '']" data-k="price_asc" @tap="switchSort">价格低到高</text>
            <text :class="['so', sort === 'price_desc' ? 'on' : '']" data-k="price_desc" @tap="switchSort">价格高到低</text>
        </view>

        <view class="items">
            <view v-for="c in items" :key="c.coachId" class="card" @tap="goDetail(c.coachId)">
                <view class="av" :style="{ background: avatarBg(c.coachId) }"></view>
                <view class="mid">
                    <view class="l1">
                        <text class="nm">{{ spx(c.nickname) }}</text>
                        <text class="lvbadge" :style="levelStyle(c.level)">{{ c.levelLabel }}</text>
                    </view>
                    <text class="intro ellipsis">{{ c.intro || '暂无介绍' }}</text>
                    <view class="tags">
                        <text v-for="t in (c.tags || [])" :key="t" class="tag">{{ t }}</text>
                    </view>
                    <view class="stat">
                        <text class="rt">★ {{ fmtRating(c.rating) }}</text>
                        <text class="od">{{ c.totalOrders || 0 }} 单</text>
                        <text class="sp" v-if="c.avgSpeedKmh">均速 {{ c.avgSpeedKmh }}km/h</text>
                    </view>
                </view>
                <view class="price">
                    <text class="pn mono">{{ money(c.hourlyRate) }}</text>
                    <text class="pu">/时</text>
                </view>
            </view>
            <view v-if="!loading && items.length === 0" class="empty">该档位暂无陪练</view>
            <view v-if="loading" class="tip">加载中…</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { listCoaches } from '@/api/coach.js'
import { currentCityCode, ensureCityReady } from '@/store/city.js'
import { levelStyle } from '@/common/coachLevel.js'
import { spxName } from '@/common/util.js'

export default {
    data() {
        return {
            levelTabs: [
                { key: '', name: '全部', onStyle: 'background:#12d07a;color:#04140c' },
                { key: 'bronze', name: '青铜', onStyle: 'background:#cd7f32;color:#fff' },
                { key: 'gold', name: '黄金', onStyle: 'background:#f0a017;color:#4a2e00' },
                { key: 'diamond', name: '钻石', onStyle: 'background:#4fc3f7;color:#062a3a' },
                { key: 'king', name: '王者', onStyle: 'background:#a855f7;color:#fff' }
            ],
            level: '', sort: 'rating', items: [], loading: false, noMore: false, page: 1
        }
    },
    onLoad() { this.reload() },
    onReachBottom() { this.more() },
    methods: {
        levelStyle,
        spx(n) { return spxName(n) },
        money(v) { return v == null ? '—' : '¥' + Number(v) },
        fmtRating(r) { return r == null ? '5.0' : Number(r).toFixed(1) },
        avatarBg(id) {
            const g = ['linear-gradient(135deg,#8fd3ff,#5e8bff)', 'linear-gradient(135deg,#ffd36e,#ff8f6e)', 'linear-gradient(135deg,#b6f0c9,#5ecb8f)', 'linear-gradient(135deg,#c9b6ff,#8f6eff)']
            return g[(id || 0) % g.length]
        },
        switchLevel(e) { const k = e.currentTarget.dataset.k; if (this.level === k) return; this.level = k; this.reload() },
        switchSort(e) { const k = e.currentTarget.dataset.k; if (this.sort === k) return; this.sort = k; this.reload() },
        async reload() { this.page = 1; this.noMore = false; this.items = []; await this.fetch(true) },
        async more() { if (this.loading || this.noMore) return; this.page++; await this.fetch(false) },
        async fetch(reset) {
            this.loading = true
            try {
                // 确保 cityCode 一定有值再请求，否则会被 request 层当空参数剔除，退化成"不按城市过滤"
                await ensureCityReady()
                const d = await listCoaches({ level: this.level || undefined, sort: this.sort, cityCode: currentCityCode(), page: this.page, pageSize: 10 })
                const list = (d && d.list) || []
                this.items = reset ? list : this.items.concat(list)
                const pg = d && d.pagination
                if ((pg && this.page >= pg.totalPages) || list.length === 0) this.noMore = true
            } catch (e) {} finally { this.loading = false }
        },
        goDetail(id) { uni.navigateTo({ url: '/pages/coach/detail?id=' + id }) }
    }
}
</script>

<style lang="scss" scoped>
.clist { min-height: 100vh; background: $paper; }
.head { padding: 30rpx 30rpx 10rpx; }
.ht { font-size: 40rpx; font-weight: 800; }
.hs { display: block; font-size: 22rpx; color: $muted; margin-top: 8rpx; }
.levels { white-space: nowrap; padding: 16rpx 24rpx 4rpx; }
.lv { display: inline-block; height: 60rpx; line-height: 60rpx; padding: 0 26rpx; border-radius: 18rpx; margin-right: 14rpx;
    background: $card; box-shadow: inset 0 0 0 1rpx $line; font-size: 25rpx; font-weight: 700; color: $ink-2; }
.sortbar { display: flex; gap: 24rpx; padding: 16rpx 30rpx 8rpx; }
.so { font-size: 23rpx; color: $muted; font-weight: 600; }
.so.on { color: $green-deep; font-weight: 800; }
.items { padding: 12rpx 24rpx 0; }
.card { display: flex; gap: 20rpx; background: $card; border-radius: 28rpx; padding: 22rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 18rpx; }
.av { width: 96rpx; height: 96rpx; border-radius: 26rpx; flex: none; }
.mid { flex: 1; min-width: 0; }
.l1 { display: flex; align-items: center; gap: 12rpx; }
.nm { font-size: 29rpx; font-weight: 800; }
.lvbadge { font-size: 19rpx; font-weight: 800; padding: 4rpx 12rpx; border-radius: 10rpx; }
.intro { display: block; font-size: 22rpx; color: $muted; margin-top: 8rpx; }
.tags { display: flex; gap: 8rpx; margin-top: 10rpx; flex-wrap: wrap; }
.tag { font-size: 18rpx; color: $green-deep; background: $green-soft; padding: 3rpx 12rpx; border-radius: 10rpx; }
.stat { display: flex; gap: 18rpx; margin-top: 12rpx; font-size: 20rpx; color: $muted; }
.rt { color: $amber; font-weight: 700; }
.price { text-align: right; flex: none; align-self: flex-end; }
.pn { font-size: 34rpx; font-weight: 800; color: $green-deep; }
.pu { font-size: 20rpx; color: $muted; }
.empty, .tip { text-align: center; color: $faint; font-size: 23rpx; padding: 70rpx 0; }
.safe-bottom { height: 40rpx; }
</style>
