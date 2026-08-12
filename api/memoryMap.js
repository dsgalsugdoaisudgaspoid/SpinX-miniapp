import { request } from '@/common/request.js'

/**
 * 城市记忆地图：以终点聚合的地点列表（同一地点的多条路线合并为一个高亮点）。
 * 传 cityCode 只看该城市的记忆；不传则不限城市。后端未实现时静默降级。
 */
export function getMemoryMap(params = {}) {
    return request({ url: '/memory-map', data: params, silent: true })
}
