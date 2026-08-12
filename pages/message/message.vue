<template>
    <view class="msg">
        <view class="mtabs">
            <text v-for="c in cats" :key="c.key" :class="['mt', cat === c.key ? 'on' : '']" @tap="switchCat(c.key)">{{ c.name }}</text>
            <text class="readall" @tap="readAll">全部已读</text>
        </view>

        <view class="mlist">
            <view v-for="n in list" :key="n.id" :class="['item', n.read ? '' : 'unread']" @tap="open(n)">
                <view class="ic" :style="{ background: iconBg(n.category) }">{{ iconOf(n.category) }}</view>
                <view class="body">
                    <view class="top"><text class="t ellipsis flex1">{{ n.title }}</text><text class="time">{{ shortTime(n.createdAt) }}</text></view>
                    <text class="c ellipsis-2">{{ n.content }}</text>
                    <text v-if="n.type === 'emergency'" class="emg">紧急</text>
                </view>
                <view v-if="!n.read" class="reddot"></view>
            </view>
            <view v-if="!loading && list.length === 0" class="empty">
                <text class="ee">📭</text><text>暂无消息</text>
            </view>
        </view>
    </view>
</template>

<script>
import { notifications } from '@/api/user.js'
import { request } from '@/common/request.js'
import { isLoggedIn } from '@/store/user.js'

export default {
    data() {
        return {
            cats: [{ key: '', name: '全部' }, { key: 'activity', name: '活动' }, { key: 'point', name: '积分' }, { key: 'announcement', name: '公告' }, { key: 'system', name: '系统' }],
            cat: '', list: [], loading: false
        }
    },
    onShow() { if (!isLoggedIn()) { this.list = []; return } this.load() },
    methods: {
        iconOf(c) { return { activity: '🚴', point: '⭐', album: '📸', announcement: '📢', system: '🔔' }[c] || '🔔' },
        iconBg(c) { return { activity: '#e6f9f0', point: '#fff4e0', album: '#f3ecff', announcement: '#e9f1fb', system: '#eef2f0' }[c] || '#eef2f0' },
        shortTime(iso) { if (!iso) return ''; const s = iso.replace('T', ' '); return s.slice(5, 16) },
        switchCat(k) { if (this.cat === k) return; this.cat = k; this.load() },
        async load() {
            this.loading = true
            try { const d = await notifications({ category: this.cat || undefined, page: 1, pageSize: 30 }); this.list = (d && d.list) || [] } catch (e) { this.list = [] } finally { this.loading = false }
        },
        async open(n) {
            if (!n.read) { try { await request({ url: `/notifications/${n.id}/read`, method: 'PUT' }); n.read = true } catch (e) {} }
            switch (n.category) {
                case 'activity':
                    uni.navigateTo({ url: n.relatedId ? '/pages/activity/detail?id=' + n.relatedId : '/pages/activity/mine' }); break
                case 'point':
                    uni.navigateTo({ url: '/pages/points/records' }); break
                case 'album':
                    uni.navigateTo({ url: '/pages/album/list' }); break
                default: // 公告 / 系统：无独立详情页，弹层展示全文
                    uni.showModal({ title: n.title, content: n.content, showCancel: false, confirmText: '知道了' })
            }
        },
        async readAll() {
            try { await request({ url: '/notifications/read-all', method: 'PUT' }); this.list.forEach(n => n.read = true); uni.showToast({ title: '已全部已读', icon: 'none' }) } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.msg { min-height: 100vh; }
.mtabs { display: flex; align-items: center; gap: 26rpx; background: $card; padding: 20rpx 24rpx; position: sticky; top: 0; z-index: 5; }
.mt { font-size: 26rpx; color: $muted; font-weight: 600; }
.mt.on { color: $ink; font-weight: 800; }
.readall { margin-left: auto; font-size: 22rpx; color: $green-deep; font-weight: 700; }

.mlist { padding: 16rpx 24rpx; }
.item { display: flex; gap: 20rpx; background: $card; border-radius: 24rpx; padding: 24rpx; margin-bottom: 16rpx; position: relative; box-shadow: inset 0 0 0 1rpx $hair; }
.ic { width: 72rpx; height: 72rpx; border-radius: 20rpx; display: flex; align-items: center; justify-content: center; font-size: 34rpx; flex: none; }
.body { flex: 1; min-width: 0; }
.top { display: flex; align-items: baseline; gap: 12rpx; }
.t { font-size: 27rpx; font-weight: 800; }
.time { font-size: 19rpx; color: $faint; }
.c { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 23rpx; color: $ink-2; margin-top: 8rpx; line-height: 1.5; }
.emg { display: inline-block; margin-top: 10rpx; font-size: 18rpx; font-weight: 800; color: #c0392b; background: #fdecea; padding: 3rpx 12rpx; border-radius: 10rpx; }
.reddot { position: absolute; top: 26rpx; right: 26rpx; width: 14rpx; height: 14rpx; border-radius: 50%; background: $coral; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 120rpx 0; display: flex; flex-direction: column; align-items: center; gap: 16rpx; }
.ee { font-size: 70rpx; }
.ellipsis-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
</style>
