import { request } from '@/common/request.js'

/** 首页配置（接口 10.1）。 */
export function getHome() {
    return request({ url: '/home' })
}

/** 俱乐部介绍（接口 10.2）。 */
export function getClubInfo() {
    return request({ url: '/club/info' })
}

/** 月度排行榜（接口 10.4）。 */
export function getRanking(month, topN = 20) {
    return request({ url: '/home/ranking', data: { month, topN } })
}
