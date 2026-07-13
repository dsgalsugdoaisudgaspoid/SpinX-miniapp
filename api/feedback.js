import { request } from '@/common/request.js'

/** 提交反馈投诉（接口 9.1）。 */
export function submitFeedback(payload) {
    return request({ url: '/feedback', method: 'POST', data: payload, loading: true })
}

/** 我的反馈列表（接口 9.2）。 */
export function myFeedback(params = {}) {
    return request({ url: '/feedback', data: params })
}

/** 反馈详情（接口 9.3）。 */
export function feedbackDetail(feedbackId) {
    return request({ url: `/feedback/${feedbackId}` })
}
