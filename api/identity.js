import { request } from '@/common/request.js'

/** 我的称号：已获得（含手动颁发）+ 未解锁目录 + 当前主称号。后端未实现时静默降级。 */
export function getMyTitles() {
    return request({ url: '/user/titles', silent: true })
}

/** 设置身份卡展示的主称号。 */
export function setPrimaryTitle(titleId) {
    return request({ url: '/user/titles/primary', method: 'POST', data: { titleId } })
}

/** 领队/管理员为某位报名者手动颁发称号（保留人情味，不是纯算法）。 */
export function awardTitle(activityId, payload) {
    return request({ url: `/activities/${activityId}/award-title`, method: 'POST', data: payload })
}

/** 共同经历网络：和谁一起骑得最多。后端未实现时静默降级。 */
export function getCoRiders() {
    return request({ url: '/user/co-riders', silent: true })
}
