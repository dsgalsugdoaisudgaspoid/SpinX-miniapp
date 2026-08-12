import { request } from '@/common/request.js'

/** 一键 SOS 求助：把当前位置与信息推送给领队与俱乐部。 */
export function sendSOS(payload) {
    return request({ url: '/sos', method: 'POST', data: payload })
}

/** 事故报告补录存档。 */
export function fileIncident(payload) {
    return request({ url: '/incident-reports', method: 'POST', data: payload, loading: true })
}
