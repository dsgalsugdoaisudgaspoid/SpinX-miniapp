import { request } from '@/common/request.js'

/** 我的骑行日记（赛后自动生成，倒序）。 */
export function myJournal() {
    return request({ url: '/journal' })
}

/** 补充日记条目的个人文字/照片。 */
export function updateJournalEntry(entryId, payload) {
    return request({ url: `/journal/${entryId}`, method: 'PUT', data: payload })
}

/** 提交本场收获标签（替代五星评价）。 */
export function submitFeeling(activityId, tags) {
    return request({ url: `/activities/${activityId}/feeling`, method: 'POST', data: { tags } })
}

/** 待总结的骑行：最近一场参与过但还没写收获的活动（供打开小程序弹窗）。后端未实现时静默降级。 */
export function pendingReview() {
    return request({ url: '/pending-review', silent: true })
}
