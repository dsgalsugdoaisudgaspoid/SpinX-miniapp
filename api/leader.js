import { request } from '@/common/request.js'

/** 领队列表（领队宇宙）。后端未实现时静默降级。 */
export function listLeaders(params = {}) {
    return request({ url: '/leaders', data: params, silent: true })
}

/** 领队详情 + 其近期活动。后端未实现时静默降级。 */
export function getLeader(userId) {
    return request({ url: `/leaders/${userId}`, silent: true })
}
