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
            <view class="frow"><text class="fk flex1">展示骑行装备</text><switch :checked="privacy.showEquipment" color="#12d07a" data-key="showEquipment" @change="savePrivacy" /></view>
            <view class="frow"><text class="fk flex1">展示骑行年限</text><switch :checked="privacy.showRidingYears" color="#12d07a" data-key="showRidingYears" @change="savePrivacy" /></view>
            <view class="frow noline"><text class="fk flex1">展示联系方式</text><switch :checked="privacy.showContact" color="#12d07a" data-key="showContact" @change="savePrivacy" /></view>
        </view>

        <!-- 通知开关 -->
        <view class="group">
            <view class="gh">消息通知</view>
            <view class="frow"><text class="fk flex1">活动提醒</text><switch :checked="notify.activityReminder" color="#12d07a" data-key="activityReminder" @change="saveNotify" /></view>
            <view class="frow"><text class="fk flex1">积分变动</text><switch :checked="notify.pointChange" color="#12d07a" data-key="pointChange" @change="saveNotify" /></view>
            <view class="frow"><text class="fk flex1">相册更新</text><switch :checked="notify.albumUpdate" color="#12d07a" data-key="albumUpdate" @change="saveNotify" /></view>
            <view class="frow"><text class="fk flex1">官方公告</text><switch :checked="notify.officialAnnouncement" color="#12d07a" data-key="officialAnnouncement" @change="saveNotify" /></view>
            <view class="frow noline" @tap="enableSubscribe"><text class="fk flex1">微信订阅提醒</text><text class="fv">报名·审核·提醒·开奖</text><text class="arw">›</text></view>
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

        <!-- 协议与账号 -->
        <view class="group">
            <view class="gh">协议与账号</view>
            <view class="frow" @tap="goPolicies"><text class="fk flex1">协议与政策</text><text class="fv">用户协议 · 隐私政策</text><text class="arw">›</text></view>
            <view class="frow noline" @tap="deactivate"><text class="fk flex1 danger">注销账号</text><text class="arw">›</text></view>
        </view>

        <view class="save" @tap="saveProfile">保存资料</view>
        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getProfile, updateProfile, updatePrivacy, updateNotificationSettings, updatePhone } from '@/api/user.js'
import { deactivateAccount } from '@/api/auth.js'
import { requestSubscribe } from '@/common/subscribe.js'
import { SUBSCRIBE_TEMPLATES } from '@/common/config.js'

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
        async savePrivacy(e) {
            const key = e.currentTarget.dataset.key
            const val = e.detail.value
            this.privacy[key] = val
            try { await updatePrivacy({ [key]: val }) } catch (err) {}
        },
        async saveNotify(e) {
            const key = e.currentTarget.dataset.key
            const val = e.detail.value
            this.notify[key] = val
            try { await updateNotificationSettings({ [key]: val }) } catch (err) {}
        },
        onPhone(e) {
            const d = e.detail
            if (!d || d.errMsg.indexOf('ok') === -1) return
            // 微信手机号快速验证：拿 encryptedData/iv（新版也可能是 code），交后端解密
            updatePhone({ code: d.code, encryptedData: d.encryptedData, iv: d.iv })
                .then(() => { uni.showToast({ title: '手机号已更新', icon: 'success' }); this.load() })
                .catch(() => {})
        },
        async enableSubscribe() {
            const r = await requestSubscribe(Object.keys(SUBSCRIBE_TEMPLATES))
            if (r && r.skipped) uni.showModal({ title: '订阅提醒', content: '订阅消息模板尚未在小程序后台配置，上线后可开启报名、开奖、活动提醒等一次性通知。', showCancel: false })
            else if (r && r.accepted && r.accepted.length) uni.showToast({ title: '已开启 ' + r.accepted.length + ' 项提醒', icon: 'none' })
            else uni.showToast({ title: '未开启提醒', icon: 'none' })
        },
        goPolicies() { uni.navigateTo({ url: '/pages/agreement/policies' }) },
        deactivate() {
            uni.showModal({
                title: '注销账号',
                content: '注销后账号内积分、成绩、协议存档等将被清除且不可恢复。建议先阅读《账号注销须知》。',
                confirmText: '继续注销', confirmColor: '#e0533d', cancelText: '查看须知',
                success: (r) => {
                    if (r.cancel) { uni.navigateTo({ url: '/pages/agreement/view?id=6' }); return }
                    if (r.confirm) this.confirmDeactivate()
                }
            })
        },
        confirmDeactivate() {
            uni.showModal({
                title: '再次确认', content: '确认注销当前账号？此操作不可恢复。',
                confirmText: '确认注销', confirmColor: '#e0533d',
                success: async (r) => {
                    if (!r.confirm) return
                    try {
                        const d = await deactivateAccount('用户主动注销')
                        uni.showToast({ title: (d && d.message) || '注销申请已受理', icon: 'none' })
                        setTimeout(() => uni.reLaunch({ url: '/pages/home/home' }), 1500)
                    } catch (e) {}
                }
            })
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
.arw { color: $faint; font-size: 32rpx; flex: none; }
.danger { color: #e0533d; }
.avatar { width: 76rpx; height: 76rpx; border-radius: 22rpx; margin-left: auto; background: linear-gradient(140deg, #5ecb8f, #0ba968); }
.phonebtn { font-size: 22rpx; color: $green-deep; background: $green-soft; padding: 0 22rpx; height: 56rpx; line-height: 56rpx; border-radius: 16rpx; margin: 0; }
.phonebtn::after { border: none; }
.save { margin: 6rpx 24rpx 0; height: 96rpx; border-radius: 30rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 30rpx; display: flex; align-items: center; justify-content: center; }
.safe-bottom { height: 60rpx; }
</style>
