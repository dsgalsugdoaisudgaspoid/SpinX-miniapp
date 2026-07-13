<template>
    <view class="settings">
        <!-- 个人资料 -->
        <view class="group">
            <view class="gh">个人资料</view>
            <view class="frow">
                <text class="fk">头像</text>
                <view class="avatar" @tap="chooseAvatar"></view>
            </view>
            <view class="frow">
                <text class="fk">昵称</text>
                <input class="fi" v-model="form.nickname" placeholder="填写昵称" placeholder-class="ph" />
            </view>
            <view class="frow">
                <text class="fk">骑行年限</text>
                <input class="fi" type="number" v-model="form.ridingYears" placeholder="如 3" placeholder-class="ph" />
            </view>
            <view class="frow">
                <text class="fk">擅长路线</text>
                <input class="fi" v-model="routesText" placeholder="逗号分隔，如 东湖绿道,环湖线" placeholder-class="ph" />
            </view>
            <view class="frow noline">
                <text class="fk">车辆品牌</text>
                <input class="fi" v-model="form.bikeBrand" placeholder="如 Trek" placeholder-class="ph" />
            </view>
        </view>

        <!-- 隐私开关 -->
        <view class="group">
            <view class="gh">隐私 · 仅管理员可见完整资料</view>
            <view class="frow"><text class="fk flex1">展示骑行装备</text><switch :checked="privacy.showEquipment" color="#12d07a" @change="e => savePrivacy('showEquipment', e)" /></view>
            <view class="frow"><text class="fk flex1">展示骑行年限</text><switch :checked="privacy.showRidingYears" color="#12d07a" @change="e => savePrivacy('showRidingYears', e)" /></view>
            <view class="frow noline"><text class="fk flex1">展示联系方式</text><switch :checked="privacy.showContact" color="#12d07a" @change="e => savePrivacy('showContact', e)" /></view>
        </view>

        <!-- 通知开关 -->
        <view class="group">
            <view class="gh">消息通知</view>
            <view class="frow"><text class="fk flex1">活动提醒</text><switch :checked="notify.activityReminder" color="#12d07a" @change="e => saveNotify('activityReminder', e)" /></view>
            <view class="frow"><text class="fk flex1">积分变动</text><switch :checked="notify.pointChange" color="#12d07a" @change="e => saveNotify('pointChange', e)" /></view>
            <view class="frow"><text class="fk flex1">相册更新</text><switch :checked="notify.albumUpdate" color="#12d07a" @change="e => saveNotify('albumUpdate', e)" /></view>
            <view class="frow noline"><text class="fk flex1">官方公告</text><switch :checked="notify.officialAnnouncement" color="#12d07a" @change="e => saveNotify('officialAnnouncement', e)" /></view>
        </view>

        <!-- 账号 -->
        <view class="group">
            <view class="gh">账号安全</view>
            <view class="frow noline">
                <text class="fk flex1">绑定手机号</text>
                <text class="fv mono">{{ profile.phone || '未绑定' }}</text>
                <button class="phonebtn" open-type="getPhoneNumber" @getphonenumber="onPhone">更换</button>
            </view>
        </view>

        <view class="save" @tap="saveProfile">保存资料</view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getProfile, updateProfile, updatePrivacy, updateNotificationSettings, updatePhone } from '@/api/user.js'

export default {
    data() {
        return {
            profile: {},
            form: { nickname: '', ridingYears: '', bikeBrand: '' },
            routesText: '',
            privacy: { showEquipment: false, showRidingYears: true, showContact: false },
            notify: { activityReminder: true, pointChange: true, albumUpdate: true, officialAnnouncement: true }
        }
    },
    onShow() { this.load() },
    methods: {
        async load() {
            try {
                const p = await getProfile()
                this.profile = p
                this.form.nickname = p.nickname || ''
                this.form.ridingYears = p.ridingYears || ''
                this.form.bikeBrand = (p.equipment && p.equipment.bikeBrand) || ''
                this.routesText = (p.preferredRoutes || []).join(',')
                if (p.privacySettings) this.privacy = { ...this.privacy, ...p.privacySettings }
                if (p.notificationSettings) this.notify = { ...this.notify, ...p.notificationSettings }
            } catch (e) {}
        },
        chooseAvatar() {
            uni.chooseImage({ count: 1, success: () => uni.showToast({ title: '头像上传需接入 OSS', icon: 'none' }) })
        },
        async saveProfile() {
            const payload = {
                nickname: this.form.nickname,
                ridingYears: this.form.ridingYears ? Number(this.form.ridingYears) : undefined,
                preferredRoutes: this.routesText ? this.routesText.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [],
                equipment: { bikeBrand: this.form.bikeBrand }
            }
            try { await updateProfile(payload); uni.showToast({ title: '已保存', icon: 'success' }) } catch (e) {}
        },
        async savePrivacy(key, e) {
            this.privacy[key] = e.detail.value
            try { await updatePrivacy({ [key]: e.detail.value }) } catch (err) {}
        },
        async saveNotify(key, e) {
            this.notify[key] = e.detail.value
            try { await updateNotificationSettings({ [key]: e.detail.value }) } catch (err) {}
        },
        onPhone(e) {
            const d = e.detail
            if (!d || d.errMsg.indexOf('ok') === -1) return
            // 微信手机号快速验证：拿 encryptedData/iv（新版也可能是 code），交后端解密
            updatePhone({ code: d.code, encryptedData: d.encryptedData, iv: d.iv })
                .then(() => { uni.showToast({ title: '手机号已更新', icon: 'success' }); this.load() })
                .catch(() => {})
        }
    }
}
</script>

<style lang="scss" scoped>
.settings { min-height: 100vh; background: $paper; padding-top: 20rpx; }
.group { margin: 0 24rpx 24rpx; background: $card; border-radius: 26rpx; padding: 0 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.gh { font-size: 22rpx; color: $muted; font-weight: 700; padding: 24rpx 0 8rpx; }
.frow { display: flex; align-items: center; gap: 20rpx; padding: 26rpx 0; border-bottom: 1rpx solid $hair; min-height: 40rpx; }
.frow.noline { border-bottom: 0; }
.fk { font-size: 27rpx; font-weight: 600; color: $ink; }
.fi { flex: 1; text-align: right; font-size: 27rpx; color: $ink; }
.ph { color: $faint; }
.fv { font-size: 25rpx; color: $muted; margin-right: 12rpx; }
.avatar { width: 76rpx; height: 76rpx; border-radius: 22rpx; margin-left: auto; background: linear-gradient(140deg, #5ecb8f, #0ba968); }
.phonebtn { font-size: 22rpx; color: $green-deep; background: $green-soft; padding: 0 22rpx; height: 56rpx; line-height: 56rpx; border-radius: 16rpx; margin: 0; }
.phonebtn::after { border: none; }
.save { margin: 6rpx 24rpx 0; height: 96rpx; border-radius: 30rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 30rpx; display: flex; align-items: center; justify-content: center; }
.safe-bottom { height: 60rpx; }
</style>
