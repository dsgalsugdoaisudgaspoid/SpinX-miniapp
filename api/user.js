import { request } from '@/common/request.js'

/** 个人信息（接口 3.1）。 */
export function getProfile() {
    return request({ url: '/user/profile' })
}

/** 更新资料（接口 3.2）。 */
export function updateProfile(payload) {
    return request({ url: '/user/profile', method: 'PUT', data: payload })
}

/** 设置隐私开关（接口 3.3）。 */
export function updatePrivacy(payload) {
    return request({ url: '/user/privacy', method: 'PUT', data: payload })
}

/** 设置消息通知开关（接口 3.4）。 */
export function updateNotificationSettings(payload) {
    return request({ url: '/user/notification-settings', method: 'PUT', data: payload })
}

/** 修改绑定手机号（接口 3.10）。 */
export function updatePhone(payload) {
    return request({ url: '/user/phone', method: 'PUT', data: payload })
}

/** 信誉分（含记录）。 */
export function getCredit() {
    return request({ url: '/user/credit' })
}

/** 安全档案（紧急联系人 / 健康信息 / 保单号）。 */
export function getSafetyProfile() {
    return request({ url: '/user/safety-profile' })
}
export function updateSafetyProfile(payload) {
    return request({ url: '/user/safety-profile', method: 'PUT', data: payload, loading: true })
}

/** 我的动态（接口 3.8）。 */
export function myPosts(params = {}) {
    return request({ url: '/user/posts', data: params })
}

/** 我的活动（接口 3.5）。 */
export function myActivities(params = {}) {
    return request({ url: '/user/activities', data: params })
}

/** 骑行档案（接口 3.6）。 */
export function ridingArchive() {
    return request({ url: '/user/riding-archive' })
}

/** 我的兑换记录（接口 3.7）。 */
export function myExchangeRecords(params = {}) {
    return request({ url: '/user/exchange-records', data: params })
}

/** 我的协议存档（接口 3.9）。 */
export function myAgreements() {
    return request({ url: '/user/agreements' })
}

/** 未读消息数（接口 8.4）。 */
export function unreadCount() {
    return request({ url: '/notifications/unread-count' })
}

/** 消息列表（接口 8.1）。 */
export function notifications(params = {}) {
    return request({ url: '/notifications', data: params })
}
