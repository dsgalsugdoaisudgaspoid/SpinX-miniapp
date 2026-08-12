import { request } from '@/common/request.js'

/** 记录用户已授权的订阅模板（供后端在事件发生时下发一次性消息）。 */
export function recordSubscribe(keys) {
    return request({ url: '/subscribe', method: 'POST', data: { keys }, silent: true })
}

/** 查询我的订阅状态。 */
export function getSubscribe() {
    return request({ url: '/subscribe' })
}
