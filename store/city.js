/**
 * 当前城市状态（照 store/user.js 的极简范式：直接读写本地存储，不引入 vuex/pinia）。
 *
 * 存储结构 { code, name, source }。source 是整个切城交互的关键：
 *   - 'auto'   由定位自动判定 → 之后定位变了可以静默更新
 *   - 'manual' 用户手动选的   → 之后定位不一致要先问用户，不擅自改他的选择
 */

import { BRAND } from '@/common/config.js'
import { listCities } from '@/api/city.js'

const CITY_KEY = 'spinx_city'
const CITY_LIST_KEY = 'spinx_city_list'
/** 本次会话已拒绝过的切城建议，避免反复弹窗骚扰（仅内存，重启即清）。 */
const declined = {}
/** ensureCityReady() 的单例 Promise：同一次冷启动内多个页面并发调用只发一次请求。 */
let readyPromise = null

export function currentCity() {
    return uni.getStorageSync(CITY_KEY) || null
}

export function currentCityCode() {
    const c = currentCity()
    return c && c.code ? c.code : undefined
}

export function currentCityName() {
    const c = currentCity()
    return c && c.name ? c.name : ''
}

/**
 * 用于界面文案的城市名：尚未确定城市时退回品牌默认城市，保证文案永远不出现空白。
 *
 * ⚠️ 只用于**上下文性**文案（"环星在{城市}留下的地方"、表单占位符等）。
 * 品牌起源类文案（俱乐部在成都成立、大事记）是历史事实，不随当前城市变化——
 * 给武汉用户显示"我们扎根武汉"是错的。
 */
export function displayCityName() {
    return currentCityName() || BRAND.city
}

/** source: 'auto' | 'manual'。 */
export function setCity(city, source) {
    if (!city || !city.code) return
    uni.setStorageSync(CITY_KEY, { code: city.code, name: city.name, source: source || 'auto' })
}

export function isManuallyChosen() {
    const c = currentCity()
    return !!(c && c.source === 'manual')
}

/** 缓存运营城市列表（选择器、就近判定、是否显示全国榜都要用）。 */
export function cachedCityList() {
    return uni.getStorageSync(CITY_LIST_KEY) || []
}

export function cacheCityList(list) {
    uni.setStorageSync(CITY_LIST_KEY, list || [])
}

/** 是否已进驻多城——单城时隐藏切换入口、隐藏全国榜。 */
export function isMultiCity() {
    return cachedCityList().length >= 2
}

/** 记住用户拒绝了切到某城的建议，本次启动内不再重复询问。 */
export function markSwitchDeclined(code) {
    if (code) declined[code] = true
}

export function isSwitchDeclined(code) {
    return !!declined[code]
}

/**
 * 保证调用完成后 currentCityCode() 一定有值——不这样任何按城市过滤的接口都会因为
 * cityCode 参数缺失（被 request 层当空值剔除）而退化成"不过滤"，跨城数据全部混在一起。
 *
 * 完全不调用 uni.getLocation：只请求公开的 /cities 接口取默认城市兜底，不触发定位权限弹窗
 * （定位判定与「切到最近城市」的完整交互留给 pages/home/home.vue 的 initCity() 处理，
 * 那边命中后会用更精确的结果覆盖这里的兜底值）。
 *
 * 三层兜底，对应"定位失败也要有默认城市"的产品要求：
 *   1) 已有城市（本次或之前设置过，含 initCity() 判定过的结果）→ 直接跳过
 *   2) /cities 接口可用 → 取列表首位（sortOrder 最小，即主运营城市）
 *   3) 接口也失败且没有缓存 → 用 BRAND.cityCode 硬编码兜底
 *
 * 任何要按城市过滤数据、又不确定 home.vue 是否已经跑过 initCity() 的页面，
 * 在发起请求前都应该先 `await ensureCityReady()`。
 */
export function ensureCityReady() {
    if (readyPromise) return readyPromise
    readyPromise = (async () => {
        if (currentCity()) return
        let cities = cachedCityList()
        if (!cities.length) {
            try {
                const d = await listCities()
                if (d && Array.isArray(d.list) && d.list.length) {
                    cities = d.list
                    cacheCityList(cities)
                }
            } catch (e) { /* 走硬编码兜底 */ }
        }
        if (currentCity()) return // 等待网络请求期间，别的调用方（如 home.vue）可能已经设置好了
        if (cities.length) {
            setCity(cities[0], 'auto')
        } else if (BRAND.cityCode) {
            setCity({ code: BRAND.cityCode, name: BRAND.city }, 'auto')
        }
    })()
    return readyPromise
}
