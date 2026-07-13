import { request } from '@/common/request.js'

/** 积分总览（接口 4.1）。 */
export function getSummary() {
    return request({ url: '/points/summary' })
}

/** 积分明细（接口 4.2）。 */
export function getRecords(params = {}) {
    return request({ url: '/points/records', data: params })
}

/** 等级权益（接口 4.3）。 */
export function getLevels() {
    return request({ url: '/points/levels' })
}

/** 当前月度任务（接口 4.4）。 */
export function getMonthlyMissions() {
    return request({ url: '/points/monthly-missions' })
}

/** 兑换商品列表（接口 13.1 / 4.6）。 */
export function getExchangeItems(category) {
    return request({ url: '/exchange/items', data: category ? { category } : {} })
}

/** 兑换商品详情（接口 13.2）。 */
export function getExchangeItem(itemId) {
    return request({ url: `/exchange/items/${itemId}` })
}

/** 积分兑换（接口 4.7）。 */
export function exchange(payload) {
    return request({ url: '/points/exchange', method: 'POST', data: payload, loading: true })
}
