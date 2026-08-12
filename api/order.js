import { request } from '@/common/request.js'

/** 支付订单（支付成功 → 正式报名）。 */
export function payOrder(orderId) {
    return request({ url: `/orders/${orderId}/pay`, method: 'POST', loading: true })
}

/** 我的订单 / 收据。 */
export function myOrders() {
    return request({ url: '/orders' })
}
