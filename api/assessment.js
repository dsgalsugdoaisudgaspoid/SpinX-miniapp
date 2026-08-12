import { request } from '@/common/request.js'

/** 考核赛段列表（东南西北四个方位）。传 cityCode 只看该城市的赛段（赛段含打卡围栏，跨城不可用）。 */
export function listAssessments(params = {}) {
    return request({ url: '/assessments', data: params })
}

/** 赛段详情 + 我的进行态。 */
export function getAssessment(segmentId) {
    return request({ url: `/assessments/${segmentId}` })
}

/** 起点打卡（需在起点 200m 内）。 */
export function checkinStart(segmentId, payload = {}) {
    return request({ url: `/assessments/${segmentId}/checkin-start`, method: 'POST', data: payload })
}

/** 终点打卡（需在终点 200m 内；限时内完成则升级成员分类）。 */
export function checkinEnd(segmentId, payload = {}) {
    return request({ url: `/assessments/${segmentId}/checkin-end`, method: 'POST', data: payload })
}

/** 赛段榜单（历史成绩，成员维度去重取最好）。 */
export function assessmentLeaderboard(segmentId) {
    return request({ url: `/assessments/${segmentId}/leaderboard` })
}
