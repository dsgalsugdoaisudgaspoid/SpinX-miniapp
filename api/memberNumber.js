import { request } from '@/common/request.js'

/** 我的 SpinX 会员号 / 申请状态。status: none | pending | approved | rejected。 */
export function myMemberNumber() {
    return request({ url: '/member-number' })
}

/** 提交 SpinX 会员号申请。 */
export function applyMemberNumber() {
    return request({ url: '/member-number/apply', method: 'POST', loading: true })
}

/** 按会员号找会员，返回 { found, member }。 */
export function searchMember(spinxNo) {
    return request({ url: '/members/search', data: { spinxNo } })
}

/** 会员公开资料（自己/他人同一套结构）。 */
export function getMemberProfile(userId) {
    return request({ url: `/members/${userId}/profile` })
}
