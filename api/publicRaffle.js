import { request } from '@/common/request.js'

/** 当前进行中的公共抽奖（首页悬浮入口用；无则返回 null）。后端未实现时静默降级。 */
export function activePublicRaffle() {
    return request({ url: '/public-raffles/active', silent: true })
}

/** 公共抽奖列表（管理用）。 */
export function listPublicRaffles() {
    return request({ url: '/public-raffles' })
}

/** 公共抽奖详情 + 我的参与/中奖状态。 */
export function getPublicRaffle(id) {
    return request({ url: `/public-raffles/${id}` })
}

/** 参与公共抽奖。 */
export function joinPublicRaffle(id) {
    return request({ url: `/public-raffles/${id}/join`, method: 'POST' })
}

/** 发布公共抽奖（超级管理员）。 */
export function createPublicRaffle(payload) {
    return request({ url: '/public-raffles', method: 'POST', data: payload, loading: true })
}

/** 编辑公共抽奖（超级管理员）。 */
export function updatePublicRaffle(id, payload) {
    return request({ url: `/public-raffles/${id}`, method: 'PUT', data: payload, loading: true })
}
