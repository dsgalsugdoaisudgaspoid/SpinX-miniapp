import { request } from '@/common/request.js'

/** 运营城市列表。公开接口，冷启动定位判定与城市选择器都要用。后端未实现时静默降级。 */
export function listCities() {
    return request({ url: '/cities', silent: true })
}

/** 希望 SpinX 入驻我的城市（身处非运营城市时的需求登记）。 */
export function requestCity(payload) {
    return request({ url: '/city-requests', method: 'POST', data: payload })
}
