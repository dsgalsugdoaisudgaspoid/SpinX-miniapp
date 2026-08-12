import { request } from '@/common/request.js'

/* ---------- 陪练（会员端 / 陪练端） ---------- */

/** 陪练等级与建议时薪。 */
export function getCoachLevels() {
    return request({ url: '/coaches/levels' })
}

/** 陪练列表（找陪练）。params: level/city/sort/page/pageSize。 */
export function listCoaches(params = {}) {
    return request({ url: '/coaches', data: params })
}

/** 陪练详情。 */
export function getCoach(coachId) {
    return request({ url: `/coaches/${coachId}` })
}

/** 我的陪练资料（陪练端）。 */
export function myCoachProfile() {
    return request({ url: '/coaches/my-profile' })
}

/** 申请陪练资格。 */
export function applyCoach(payload) {
    return request({ url: '/coaches/apply', method: 'POST', data: payload, loading: true })
}

/* ---------- 陪练订单 ---------- */

/** 预约下单（返回订单 + 支付参数）。 */
export function bookCoach(payload) {
    return request({ url: '/coach-orders', method: 'POST', data: payload, loading: true })
}

/** 模拟支付成功（本地/开发环境）。 */
export function mockPayOrder(orderId) {
    return request({ url: `/coach-orders/${orderId}/mock-pay`, method: 'POST' })
}

/** 我的陪练订单（会员）。 */
export function myCoachOrders(params = {}) {
    return request({ url: '/coach-orders/my', data: params })
}

/** 收到的订单（陪练）。 */
export function receivedCoachOrders(params = {}) {
    return request({ url: '/coach-orders/received', data: params })
}

/** 陪练处理订单：accept/reject/complete。 */
export function handleCoachOrder(orderId, payload) {
    return request({ url: `/coach-orders/${orderId}/handle`, method: 'PUT', data: payload })
}

/** 会员取消订单。 */
export function cancelCoachOrder(orderId, reason) {
    return request({ url: `/coach-orders/${orderId}/cancel`, method: 'PUT', data: { reason } })
}

/** 会员评价陪练。 */
export function rateCoach(orderId, payload) {
    return request({ url: `/coach-orders/${orderId}/rate`, method: 'POST', data: payload })
}
