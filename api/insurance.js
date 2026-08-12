import { request } from '@/common/request.js'

/** 我的保单列表。 */
export function myPolicies() {
    return request({ url: '/insurance/policies' })
}

/** 保单详情。 */
export function getPolicy(policyId) {
    return request({ url: `/insurance/policies/${policyId}` })
}
