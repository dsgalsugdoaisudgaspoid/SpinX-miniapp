import { request } from '@/common/request.js'

/** 活动列表（接口 5.1）。 */
export function listActivities(params = {}) {
    return request({ url: '/activities', data: params })
}

/** 活动详情（接口 5.2）。 */
export function getActivity(activityId) {
    return request({ url: `/activities/${activityId}` })
}

/** 报名活动（接口 5.3）。返回 { registrationId, status, needSignAgreement, agreementId }。 */
export function registerActivity(activityId, payload = {}) {
    return request({ url: `/activities/${activityId}/register`, method: 'POST', data: payload })
}

/** 取消报名（接口 5.4）。 */
export function cancelRegistration(activityId, reason) {
    return request({ url: `/activities/${activityId}/cancel-registration`, method: 'POST', data: { reason } })
}

/** 报名列表（领队/管理员，接口 5.5）。 */
export function getRegistrations(activityId, params = {}) {
    return request({ url: `/activities/${activityId}/registrations`, data: params })
}

/** 活动签到（会员本人定位自助签到，接口 5.7）。payload: { latitude, longitude }。 */
export function checkin(activityId, payload) {
    return request({ url: `/activities/${activityId}/checkin`, method: 'POST', data: payload })
}

/** 审核报名（领队/管理员，接口 5.6）。action: approve/reject。 */
export function reviewRegistration(activityId, registrationId, payload) {
    return request({ url: `/activities/${activityId}/registrations/${registrationId}/review`, method: 'PUT', data: payload })
}

/** 批量发放活动积分并回填骑行数据（领队，接口 5.16）。同一活动只能成功调用一次。
 *  payload: { members, distance, duration, elevation }。 */
export function distributePoints(activityId, payload) {
    return request({ url: `/activities/${activityId}/distribute-points`, method: 'POST', data: payload, loading: true })
}

/** 创建活动（领队，接口 5.13）。 */
export function createActivity(payload) {
    return request({ url: '/activities', method: 'POST', data: payload, loading: true })
}

/** 编辑活动（领队，接口 5.14）。仅传需要变更的字段——用于发起活动后补录路书等信息。 */
export function updateActivity(activityId, payload) {
    return request({ url: `/activities/${activityId}`, method: 'PUT', data: payload, loading: true })
}

/** 活动改期（领队，B4）→ 群发通知。 */
export function rescheduleActivity(activityId, payload) {
    return request({ url: `/activities/${activityId}/reschedule`, method: 'POST', data: payload, loading: true })
}

/** 取消活动（领队，B4）→ 群发通知 + 自动退款。 */
export function withdrawActivity(activityId, reason) {
    return request({ url: `/activities/${activityId}/withdraw`, method: 'POST', data: { reason }, loading: true })
}

/** 分享活动获取积分（接口 4.5）。 */
export function shareActivity(activityId, shareTo = 'session') {
    return request({ url: '/points/share', method: 'POST', data: { activityId, shareTo } })
}
