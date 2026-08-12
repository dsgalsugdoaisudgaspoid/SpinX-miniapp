import { request } from '@/common/request.js'

/** 协议与政策总览（协议中心）。 */
export function allAgreements() {
    return request({ url: '/agreements' })
}

/** 待签署协议（接口 6.1）。 */
export function pendingAgreements() {
    return request({ url: '/agreements/pending' })
}

/** 协议详情（接口 6.2）。 */
export function getAgreement(agreementId) {
    return request({ url: `/agreements/${agreementId}` })
}

/** 签署协议（接口 6.3）。readDuration 需 >= requiredReadingSeconds，否则 code 2004。 */
export function signAgreement(agreementId, payload) {
    return request({ url: `/agreements/${agreementId}/sign`, method: 'POST', data: payload, loading: true })
}

/** 已签署存档（接口 6.4）。 */
export function signedAgreements() {
    return request({ url: '/agreements/signed' })
}
