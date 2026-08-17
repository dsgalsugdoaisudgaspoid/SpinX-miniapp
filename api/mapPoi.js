import { request } from '@/common/request.js'

/**
 * 地图兴趣点列表（城市记忆地图生态：合作车店等）。传 cityCode 只看该城市，
 * 传 category 只看该分类——以后接入餐饮/异业新分类时，这个接口不用改，
 * 只是 category 多一个可选值。
 */
export function getMapPois(params = {}) {
    return request({ url: '/map-pois', data: params, silent: true })
}
