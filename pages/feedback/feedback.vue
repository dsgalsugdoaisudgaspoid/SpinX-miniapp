<template>
    <view class="fb">
        <view class="tabs">
            <text :class="['tb', tab === 'new' ? 'on' : '']" @tap="switchNew">我要反馈</text>
            <text :class="['tb', tab === 'mine' ? 'on' : '']" @tap="switchMine">我的反馈</text>
        </view>

        <!-- 新建反馈 -->
        <view v-if="tab === 'new'" class="form">
            <view class="fld">
                <text class="lb">反馈类型</text>
                <view class="chips">
                    <text v-for="t in types" :key="t.k" :class="['chip', form.type === t.k ? 'on' : '']" :data-k="t.k" @tap="pickType">{{ t.n }}</text>
                </view>
            </view>
            <view class="fld">
                <text class="lb">相关分类</text>
                <view class="chips">
                    <text v-for="c in cats" :key="c.k" :class="['chip', form.category === c.k ? 'on' : '']" :data-k="c.k" @tap="pickCat">{{ c.n }}</text>
                </view>
            </view>
            <view class="fld">
                <text class="lb">具体描述</text>
                <textarea class="ta" v-model="form.content" placeholder="详细描述你遇到的问题或建议，我们会在 24 小时内处理并回复" placeholder-class="ph" maxlength="500" />
                <text class="count">{{ (form.content || '').length }}/500</text>
            </view>
            <view class="tip3">💚 会员反馈后 24 小时内管理员必须处理并线上回复</view>
            <view :class="['g-btn', form.content ? '' : 'off']" @tap="submit">提交反馈</view>
        </view>

        <!-- 我的反馈 -->
        <view v-else class="mylist">
            <view v-for="f in list" :key="f.id" class="item">
                <view class="top">
                    <text class="ty">{{ typeName(f.type) }} · {{ catName(f.category) }}</text>
                    <text class="st" :style="stStyle(f.status)">{{ stName(f.status) }}</text>
                </view>
                <text class="ct">{{ f.content }}</text>
                <text class="tm mono">{{ shortDate(f.createdAt) }}</text>
                <view v-if="f.replyContent" class="reply">
                    <text class="rl">官方回复</text>
                    <text class="rc">{{ f.replyContent }}</text>
                </view>
            </view>
            <view v-if="!loading && list.length === 0" class="empty">
                <text class="ee">📮</text><text>还没有反馈记录</text>
            </view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { submitFeedback, myFeedback } from '@/api/feedback.js'

export default {
    data() {
        return {
            tab: 'new',
            types: [{ k: 'complaint', n: '投诉' }, { k: 'suggestion', n: '建议' }, { k: 'other', n: '其他' }],
            cats: [{ k: 'activity', n: '活动' }, { k: 'service', n: '服务' }, { k: 'point', n: '积分' }, { k: 'system', n: '系统' }, { k: 'other', n: '其他' }],
            form: { type: 'suggestion', category: 'activity', content: '' },
            list: [], loading: false
        }
    },
    methods: {
        switchNew() { this.tab = 'new' },
        pickType(e) { this.form.type = e.currentTarget.dataset.k },
        pickCat(e) { this.form.category = e.currentTarget.dataset.k },
        typeName(t) { return ({ complaint: '投诉', suggestion: '建议', other: '其他' })[t] || t },
        catName(c) { return ({ activity: '活动', service: '服务', point: '积分', system: '系统', other: '其他' })[c] || c },
        stName(s) { return ({ pending: '待处理', processing: '处理中', resolved: '已解决', closed: '已关闭' })[s] || s },
        stStyle(s) {
            if (s === 'resolved') return 'color:#0ba968;background:#e6f9f0'
            if (s === 'processing') return 'color:#2b6bb5;background:#e9f1fb'
            if (s === 'pending') return 'color:#b8760a;background:#fdf1dd'
            return 'color:#7a8a83;background:#f0f3f2'
        },
        shortDate(iso) { if (!iso) return ''; return iso.replace('T', ' ').slice(0, 16) },
        async submit() {
            if (!this.form.content.trim()) return
            try {
                await submitFeedback({ type: this.form.type, category: this.form.category, content: this.form.content.trim() })
                uni.showToast({ title: '已提交', icon: 'success' })
                this.form.content = ''
                setTimeout(() => this.switchMine(), 600)
            } catch (e) {}
        },
        switchMine() { this.tab = 'mine'; this.loadMine() },
        async loadMine() {
            this.loading = true
            try { const d = await myFeedback({ page: 1, pageSize: 20 }); this.list = (d && d.list) || [] } catch (e) {} finally { this.loading = false }
        }
    }
}
</script>

<style lang="scss" scoped>
.fb { min-height: 100vh; background: $paper; }
.tabs { display: flex; gap: 40rpx; background: $card; padding: 24rpx 30rpx; position: sticky; top: 0; z-index: 5; }
.tb { font-size: 30rpx; color: $muted; font-weight: 600; padding-bottom: 8rpx; position: relative; }
.tb.on { color: $ink; font-weight: 800; }
.tb.on::after { content: ''; position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 40rpx; height: 5rpx; border-radius: 3rpx; background: $green; }

.form { padding: 24rpx; }
.fld { margin-bottom: 26rpx; }
.lb { display: block; font-size: 25rpx; font-weight: 800; margin-bottom: 16rpx; }
.chips { display: flex; gap: 14rpx; flex-wrap: wrap; }
.chip { height: 60rpx; line-height: 60rpx; padding: 0 26rpx; border-radius: 18rpx; background: $card; box-shadow: inset 0 0 0 1rpx $line; font-size: 25rpx; color: $ink-2; font-weight: 600; }
.chip.on { background: $green; color: #04140c; font-weight: 800; box-shadow: none; }
.ta { width: 100%; min-height: 240rpx; background: $card; border-radius: 24rpx; padding: 24rpx; font-size: 27rpx; box-shadow: inset 0 0 0 1rpx $line; box-sizing: border-box; }
.ph { color: $faint; }
.count { display: block; text-align: right; font-size: 20rpx; color: $faint; margin-top: 8rpx; }
.tip3 { background: $green-soft; color: $green-deep; font-size: 22rpx; padding: 18rpx 22rpx; border-radius: 18rpx; margin-bottom: 24rpx; }
.g-btn.off { background: #d7ddda; color: #8a968f; }

.mylist { padding: 20rpx 24rpx 40rpx; }
.item { background: $card; border-radius: 26rpx; padding: 26rpx; margin-bottom: 16rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.top { display: flex; align-items: center; }
.ty { font-size: 23rpx; color: $muted; font-weight: 700; }
.st { margin-left: auto; font-size: 20rpx; font-weight: 800; padding: 6rpx 16rpx; border-radius: 14rpx; }
.ct { display: block; font-size: 27rpx; margin-top: 14rpx; line-height: 1.6; }
.tm { display: block; font-size: 19rpx; color: $faint; margin-top: 12rpx; }
.reply { margin-top: 18rpx; padding: 18rpx; background: $paper; border-radius: 18rpx; }
.rl { font-size: 20rpx; font-weight: 800; color: $green-deep; }
.rc { display: block; font-size: 24rpx; color: $ink-2; margin-top: 8rpx; line-height: 1.6; }
.empty { text-align: center; color: $faint; font-size: 24rpx; padding: 110rpx 0; display: flex; flex-direction: column; align-items: center; gap: 14rpx; }
.ee { font-size: 76rpx; }
.safe-bottom { height: 40rpx; }
</style>
