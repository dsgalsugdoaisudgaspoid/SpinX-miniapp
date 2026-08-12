<template>
    <view class="apply">
        <view class="hero">
            <view class="stars"></view>
            <text class="ht">成为环星陪练</text>
            <text class="hs">平台考核认证 · 等级挂钩时薪 · 接单赚收入</text>
        </view>

        <!-- 等级说明 -->
        <view class="levels">
            <view v-for="l in levels" :key="l.level" class="lvitem" :style="lvBg(l.level)">
                <text class="ln" :style="lvFg(l.level)">{{ l.label }}</text>
                <text class="lp mono">¥{{ l.suggestMin }}-{{ l.suggestMax }}/时</text>
                <text class="lr">参考均速 ≥{{ l.refMinAvgSpeed }}km/h</text>
            </view>
        </view>

        <!-- 状态 / 申请表单 -->
        <view v-if="statusView === 'active'" class="statebox ok">
            <text class="si">✅</text><text class="st">你已是「{{ profile.levelLabel }}」认证陪练</text>
            <view class="g-btn g-btn--plain gp" @tap="goProfile">查看我的陪练资料</view>
        </view>
        <view v-else-if="statusView === 'pending'" class="statebox wait">
            <text class="si">⏳</text><text class="st">申请审核中，平台考核后通知你</text>
        </view>
        <view v-else class="form">
            <view class="fld">
                <text class="lb">自我介绍</text>
                <textarea class="ta" v-model="f.intro" placeholder="骑龄、擅长、带练经验…" placeholder-class="ph" maxlength="200" />
            </view>
            <view class="grp">
                <view class="frow"><text class="fk">所在城市</text><input class="fi" v-model="f.city" :placeholder="'如 ' + cityName" placeholder-class="ph" /></view>
                <view class="frow"><text class="fk">平均时速</text><input class="fi" type="digit" v-model="f.avgSpeedKmh" placeholder="km/h" placeholder-class="ph" /></view>
                <view class="frow"><text class="fk">最长距离</text><input class="fi" type="number" v-model="f.maxDistanceKm" placeholder="km" placeholder-class="ph" /></view>
                <view class="frow noline"><text class="fk">骑龄</text><input class="fi" type="number" v-model="f.ridingYears" placeholder="年" placeholder-class="ph" /></view>
            </view>
            <view class="fld">
                <text class="lb">擅长标签</text>
                <view class="chips">
                    <text v-for="t in tagOpts" :key="t" :class="['chip', f.tags.includes(t) ? 'on' : '']" :data-t="t" @tap="toggleTag">{{ t }}</text>
                </view>
            </view>
            <view class="fld">
                <text class="lb">申请备注</text>
                <input class="fi2" v-model="f.applyRemark" placeholder="想申请的档位/其他说明（可选）" placeholder-class="ph" />
            </view>
            <view class="tipbox">💚 等级与时薪由平台综合考核核定（以骑行能力为主），认证通过后即可在「找陪练」中展示接单。</view>
            <view class="g-btn submit" @tap="submit">提交申请</view>
        </view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getCoachLevels, applyCoach, myCoachProfile } from '@/api/coach.js'
import { LEVEL_META } from '@/common/coachLevel.js'
import { displayCityName } from '@/store/city.js'

export default {
    data() {
        return {
            levels: [],
            profile: null,
            statusView: 'new', // new / pending / active
            cityName: displayCityName(),
            tagOpts: ['爬坡', '长距离', '配速', '新手教学', '夜骑', '公路车', '山地车'],
            // 城市默认填当前所在城市，用户可改——陪练通常就在自己所在城市接单
            f: { intro: '', city: displayCityName(), avgSpeedKmh: '', maxDistanceKm: '', ridingYears: '', tags: [], applyRemark: '' }
        }
    },
    onShow() { this.load() },
    methods: {
        lvBg(level) { const m = LEVEL_META[level]; return m ? `background:${m.bg}` : '' },
        lvFg(level) { const m = LEVEL_META[level]; return m ? `color:${m.fg}` : '' },
        async load() {
            try { const d = await getCoachLevels(); this.levels = (d && d.levels) || [] } catch (e) {}
            try {
                const p = await myCoachProfile()
                this.profile = p
                if (p && p.status === 'active') this.statusView = 'active'
                else if (p && p.status === 'pending') this.statusView = 'pending'
                else this.statusView = 'new'
            } catch (e) { this.statusView = 'new' }
        },
        toggleTag(e) {
            const t = e.currentTarget.dataset.t
            const i = this.f.tags.indexOf(t)
            i > -1 ? this.f.tags.splice(i, 1) : this.f.tags.push(t)
        },
        async submit() {
            const payload = {
                intro: this.f.intro, city: this.f.city,
                avgSpeedKmh: this.f.avgSpeedKmh ? Number(this.f.avgSpeedKmh) : undefined,
                maxDistanceKm: this.f.maxDistanceKm ? Number(this.f.maxDistanceKm) : undefined,
                ridingYears: this.f.ridingYears ? Number(this.f.ridingYears) : undefined,
                tags: this.f.tags, applyRemark: this.f.applyRemark
            }
            try {
                await applyCoach(payload)
                uni.showToast({ title: '申请已提交', icon: 'success' })
                setTimeout(() => this.load(), 600)
            } catch (e) {}
        },
        goProfile() { uni.navigateTo({ url: '/pages/coach/profile' }) }
    }
}
</script>

<style lang="scss" scoped>
.apply { min-height: 100vh; background: $paper; }
.hero { padding: 44rpx 30rpx 34rpx; text-align: center; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(160deg, #0e1b24, #123a2a 60%, #0ba968); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 22% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cfeee0, transparent); }
.ht { position: relative; font-size: 42rpx; font-weight: 800; }
.hs { position: relative; display: block; font-size: 22rpx; opacity: .85; margin-top: 12rpx; }
.levels { display: flex; gap: 12rpx; margin: -24rpx 24rpx 0; position: relative; z-index: 2; }
.lvitem { flex: 1; border-radius: 20rpx; padding: 20rpx 8rpx; text-align: center; box-shadow: 0 12rpx 26rpx -14rpx rgba(9,20,15,.4); }
.ln { display: block; font-size: 23rpx; font-weight: 800; }
.lp { display: block; font-size: 19rpx; font-weight: 800; margin-top: 8rpx; color: #33433c; }
.lr { display: block; font-size: 16rpx; color: #7a8a83; margin-top: 4rpx; }

.statebox { margin: 30rpx 24rpx; background: $card; border-radius: 26rpx; padding: 50rpx 30rpx; text-align: center; box-shadow: inset 0 0 0 1rpx $hair; }
.statebox .si { font-size: 60rpx; }
.statebox .st { display: block; font-size: 28rpx; font-weight: 700; margin-top: 16rpx; }
.gp { display: inline-flex; margin-top: 24rpx; padding: 0 40rpx; height: 78rpx; }

.form { padding: 28rpx 24rpx 0; }
.fld { margin-bottom: 24rpx; }
.lb { display: block; font-size: 25rpx; font-weight: 800; margin-bottom: 14rpx; }
.ta { width: 100%; min-height: 160rpx; background: $card; border-radius: 22rpx; padding: 22rpx; font-size: 26rpx; box-shadow: inset 0 0 0 1rpx $line; box-sizing: border-box; }
.grp { background: $card; border-radius: 24rpx; padding: 0 24rpx; box-shadow: inset 0 0 0 1rpx $hair; margin-bottom: 24rpx; }
.frow { display: flex; align-items: center; padding: 24rpx 0; border-bottom: 1rpx solid $hair; }
.frow.noline { border-bottom: 0; }
.fk { font-size: 26rpx; font-weight: 600; }
.fi { flex: 1; text-align: right; font-size: 26rpx; }
.fi2 { width: 100%; background: $card; border-radius: 20rpx; padding: 22rpx; font-size: 26rpx; box-shadow: inset 0 0 0 1rpx $line; box-sizing: border-box; }
.ph { color: $faint; }
.chips { display: flex; gap: 14rpx; flex-wrap: wrap; }
.chip { height: 58rpx; line-height: 58rpx; padding: 0 24rpx; border-radius: 16rpx; background: $card; box-shadow: inset 0 0 0 1rpx $line; font-size: 24rpx; color: $ink-2; font-weight: 600; }
.chip.on { background: $green; color: #04140c; font-weight: 800; box-shadow: none; }
.tipbox { background: $green-soft; color: $green-deep; font-size: 22rpx; padding: 18rpx 22rpx; border-radius: 18rpx; line-height: 1.6; margin-bottom: 24rpx; }
.submit { margin-bottom: 20rpx; }
.safe-bottom { height: 40rpx; }
</style>
