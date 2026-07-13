<template>
    <view class="create">
        <view class="group">
            <view class="frow"><text class="fk">活动名称</text><input class="fi" v-model="f.title" placeholder="如 夜游浣花溪" placeholder-class="ph" /></view>
            <view class="frow col">
                <text class="fk">活动介绍</text>
                <textarea class="ta" v-model="f.description" placeholder="路线亮点、强度、注意事项…" placeholder-class="ph" maxlength="500" />
            </view>
        </view>

        <view class="group">
            <view class="frow"><text class="fk">出发日期</text><picker class="pk" mode="date" :value="f.startDate" data-key="startDate" @change="onPick"><text :class="['fv', f.startDate ? '' : 'phc']">{{ f.startDate || '选择日期' }}</text></picker></view>
            <view class="frow"><text class="fk">出发时间</text><picker class="pk" mode="time" :value="f.startTime" data-key="startTime" @change="onPick"><text :class="['fv', f.startTime ? '' : 'phc']">{{ f.startTime || '选择时间' }}</text></picker></view>
            <view class="frow"><text class="fk">结束时间</text><picker class="pk" mode="time" :value="f.endTime" data-key="endTime" @change="onPick"><text :class="['fv', f.endTime ? '' : 'phc']">{{ f.endTime || '选择时间' }}</text></picker></view>
            <view class="frow noline"><text class="fk">报名截止</text><picker class="pk" mode="date" :value="f.deadlineDate" data-key="deadlineDate" @change="onPick"><text :class="['fv', f.deadlineDate ? '' : 'phc']">{{ f.deadlineDate || '选择日期' }}</text></picker></view>
        </view>

        <view class="group">
            <view class="frow"><text class="fk">集合地点</text><input class="fi" v-model="f.meetingPoint" placeholder="如 028.C 青年创意社区" placeholder-class="ph" /></view>
            <view class="frow"><text class="fk">骑行里程</text><input class="fi" type="number" v-model="f.distance" placeholder="km" placeholder-class="ph" /></view>
            <view class="frow"><text class="fk">难度星级</text><picker class="pk" :range="difficulties" :value="f.difficulty - 1" @change="onDifficulty"><text class="fv">{{ starText }}</text></picker></view>
            <view class="frow noline"><text class="fk">人数上限</text><input class="fi" type="number" v-model="f.maxParticipants" placeholder="如 25" placeholder-class="ph" /></view>
        </view>

        <view class="group">
            <view class="frow col">
                <text class="fk">活动标签</text>
                <view class="chips">
                    <text v-for="t in tagOpts" :key="t" :class="['chip', f.tags.includes(t) ? 'on' : '']" @tap="toggleTag(t)">{{ t }}</text>
                </view>
            </view>
            <view class="frow"><text class="fk">线下费用</text><input class="fi" type="number" v-model="f.fee" placeholder="0 为免费" placeholder-class="ph" /></view>
            <view class="frow"><text class="fk">基础积分</text><input class="fi" type="number" v-model="f.basePoints" placeholder="如 30" placeholder-class="ph" /></view>
            <view class="frow"><text class="fk">全勤加分</text><input class="fi" type="number" v-model="f.fullAttendanceBonus" placeholder="如 10" placeholder-class="ph" /></view>
            <view class="frow noline"><text class="fk flex1">自动通过报名</text><switch :checked="f.approvalMode === 'auto'" color="#12d07a" @change="onApproval" /></view>
        </view>

        <view class="g-btn submit" @tap="submit">发布活动</view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { createActivity } from '@/api/activity.js'

export default {
    data() {
        return {
            difficulties: ['★', '★★', '★★★', '★★★★', '★★★★★'],
            tagOpts: ['休闲骑', '拉练', '公益骑', '亲子骑', '跨城骑', '新手友好'],
            f: {
                title: '', description: '', startDate: '', startTime: '', endTime: '', deadlineDate: '',
                meetingPoint: '', distance: '', difficulty: 2, maxParticipants: '', tags: [],
                fee: '', basePoints: 30, fullAttendanceBonus: 10, approvalMode: 'auto'
            }
        }
    },
    computed: {
        starText() { return '★'.repeat(this.f.difficulty) }
    },
    methods: {
        onPick(e) { this.f[e.currentTarget.dataset.key] = e.detail.value },
        onDifficulty(e) { this.f.difficulty = Number(e.detail.value) + 1 },
        onApproval(e) { this.f.approvalMode = e.detail.value ? 'auto' : 'manual' },
        toggleTag(t) { const i = this.f.tags.indexOf(t); i > -1 ? this.f.tags.splice(i, 1) : this.f.tags.push(t) },
        iso(date, time) { return date ? `${date}T${time || '00:00'}:00` : undefined },
        async submit() {
            if (!this.f.title || !this.f.startDate || !this.f.meetingPoint) {
                uni.showToast({ title: '请填写名称、日期与集合地点', icon: 'none' }); return
            }
            const payload = {
                title: this.f.title, description: this.f.description, meetingPoint: this.f.meetingPoint,
                startTime: this.iso(this.f.startDate, this.f.startTime),
                endTime: this.iso(this.f.startDate, this.f.endTime),
                deadline: this.iso(this.f.deadlineDate || this.f.startDate, '20:00'),
                distance: this.f.distance ? Number(this.f.distance) : undefined,
                difficulty: this.f.difficulty,
                maxParticipants: this.f.maxParticipants ? Number(this.f.maxParticipants) : undefined,
                tags: this.f.tags, fee: this.f.fee ? Number(this.f.fee) : 0,
                basePoints: Number(this.f.basePoints) || 30, fullAttendanceBonus: Number(this.f.fullAttendanceBonus) || 10,
                approvalMode: this.f.approvalMode
            }
            try {
                await createActivity(payload)
                uni.showToast({ title: '发布成功', icon: 'success' })
                setTimeout(() => uni.navigateBack(), 700)
            } catch (e) {}
        }
    }
}
</script>

<style lang="scss" scoped>
.create { min-height: 100vh; background: $paper; padding-top: 20rpx; }
.group { margin: 0 24rpx 24rpx; background: $card; border-radius: 26rpx; padding: 0 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.frow { display: flex; align-items: center; gap: 20rpx; padding: 26rpx 0; border-bottom: 1rpx solid $hair; min-height: 40rpx; }
.frow.noline { border-bottom: 0; }
.frow.col { flex-direction: column; align-items: stretch; gap: 16rpx; }
.fk { font-size: 27rpx; font-weight: 600; color: $ink; white-space: nowrap; }
.fi { flex: 1; text-align: right; font-size: 27rpx; }
.pk { flex: 1; }
.fv { flex: 1; text-align: right; font-size: 27rpx; color: $ink; }
.fv.phc { color: $faint; }
.arw { color: $faint; }
.ph { color: $faint; }
.ta { width: 100%; min-height: 180rpx; background: $paper; border-radius: 18rpx; padding: 20rpx; font-size: 26rpx; box-sizing: border-box; }
.chips { display: flex; gap: 12rpx; flex-wrap: wrap; }
.chip { height: 58rpx; line-height: 58rpx; padding: 0 24rpx; border-radius: 16rpx; background: $paper; font-size: 24rpx; color: $ink-2; font-weight: 600; }
.chip.on { background: $green; color: #04140c; font-weight: 800; }
.submit { margin: 6rpx 24rpx 0; }
.safe-bottom { height: 60rpx; }
</style>
