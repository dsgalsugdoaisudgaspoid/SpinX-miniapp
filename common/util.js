import { MAP_KEY, BRAND } from '@/common/config.js'

/** 状态栏高度（px），用于自定义导航栏顶部占位。 */
export function statusBarHeight() {
    try { return uni.getSystemInfoSync().statusBarHeight || 20 } catch (e) { return 20 }
}

/**
 * 是否运行在微信开发者工具模拟器中。
 * 用于规避模拟器渲染原生 <map> 组件时的卡死/白屏（工具已知问题，真机正常）。
 */
export function isDevtools() {
    try { return uni.getSystemInfoSync().platform === 'devtools' } catch (e) { return false }
}

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** ISO 时间 → { date:'7/11', md:'07.11', weekday:'周六', time:'19:00', full:'07.11 周六 19:00' } */
export function fmtTime(iso) {
    if (!iso) return {}
    const d = new Date(iso.replace ? iso.replace(/-/g, '/').replace('T', ' ').replace('Z', '') : iso)
    if (isNaN(d.getTime())) return {}
    const m = d.getMonth() + 1
    const day = d.getDate()
    const pad = n => (n < 10 ? '0' + n : '' + n)
    const hh = pad(d.getHours())
    const mm = pad(d.getMinutes())
    return {
        date: `${m}/${day}`,
        md: `${pad(m)}.${pad(day)}`,
        weekday: WEEK[d.getDay()],
        time: `${hh}:${mm}`,
        full: `${pad(m)}.${pad(day)} ${WEEK[d.getDay()]} ${hh}:${mm}`
    }
}

/** 时间段：'07.11 周六 19:00 – 20:30' */
export function fmtRange(startIso, endIso) {
    const s = fmtTime(startIso), e = fmtTime(endIso)
    if (!s.full) return ''
    return e.time ? `${s.md} ${s.weekday} ${s.time} – ${e.time}` : s.full
}

/** 数字千分位（积分等）。 */
export function thousands(n) {
    if (n == null) return '0'
    return (n + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** 难度星级：2 → '★★' */
export function stars(level) {
    const n = Math.max(0, Math.min(5, level || 0))
    return '★'.repeat(n) + '☆'.repeat(5 - n)
}

/** 展示层昵称前缀：给昵称统一带上品牌前缀（如 "SPX-张三"），只用于展示，不改数据本身。
 *  可编辑的昵称输入框（如设置页改昵称）不要套用——那里要显示用户能编辑的原始值。 */
export function spxName(nickname) {
    if (!nickname) return nickname
    return nickname.startsWith(BRAND.namePrefix) ? nickname : (BRAND.namePrefix + nickname)
}

/** 费用展示：0 → '免费'，否则 '¥30' */
export function fmtFee(fee) {
    return (!fee || Number(fee) === 0) ? '免费' : '¥' + Number(fee)
}

/**
 * 逆地址解析（底层）：返回 { name, adcode, city } —— name 格式为「市 + 区 + 街道（+ 附近 POI 名）」，
 * 比如「成都市武侯区人民南路四段（附近：果壳里的城）」，比坐标或单纯路口名更利于求助场景快速定位。
 * adcode/city 来自腾讯返回的 ad_info，用于判定用户当前所在城市。
 * 依赖腾讯位置服务 Key（config.MAP_KEY）+ 小程序后台把 apis.map.qq.com 加入合法域名。
 * 未配置 Key 或请求失败时 resolve(null)，由调用方降级——不抛错、不打扰用户。
 */
export function reverseGeocodeDetail(lat, lng) {
    return new Promise((resolve) => {
        const key = MAP_KEY
        if (!key || lat == null || lng == null) { resolve(null); return }
        uni.request({
            url: 'https://apis.map.qq.com/ws/geocoder/v1/',
            // get_poi=1 才会带上附近 POI 列表，用于拼出「街道 + 附近建筑/商店名」
            data: { location: lat + ',' + lng, key, get_poi: 1 },
            timeout: 6000,
            success: (res) => {
                const r = res && res.data && res.data.result
                if (!r) { resolve(null); return }
                const ad = r.ad_info || {}
                // 市 + 区 + 街道：行政区划到街道级，缺哪级就跳过哪级，不留空占位
                const district = [ad.city, ad.district, ad.street].filter(Boolean).join('')
                const nearestPoi = r.pois && r.pois[0] && r.pois[0].title
                let name = district || r.address || null
                if (name && nearestPoi) name += `（附近：${nearestPoi}）`
                if (!name) name = r.address || (r.formatted_addresses && r.formatted_addresses.recommend) || null
                resolve({ name, adcode: ad.adcode ? String(ad.adcode) : null, city: ad.city || null })
            },
            fail: () => resolve(null)
        })
    })
}

/**
 * 逆地址解析：把经纬度（gcj02）转成道路级地名字符串。SOS 等场景用。
 * 未配置 Key 或失败时 resolve(null)，由调用方降级显示坐标。
 */
export function reverseGeocode(lat, lng) {
    return reverseGeocodeDetail(lat, lng).then(d => (d && d.name) || null)
}

/**
 * 取一次定位（gcj02）。统一封装此前在签到/SOS/赛段打卡/事故上报四处复制的
 * 「超时守卫 + done 幂等」写法：拿不到定位不抛错，resolve(null) 由调用方降级。
 */
export function getLocationOnce(timeout = 8000) {
    return new Promise((resolve) => {
        let done = false
        const finish = (v) => { if (done) return; done = true; resolve(v) }
        const guard = setTimeout(() => finish(null), timeout)
        uni.getLocation({
            type: 'gcj02',
            success: (loc) => { clearTimeout(guard); finish({ latitude: loc.latitude, longitude: loc.longitude }) },
            fail: () => { clearTimeout(guard); finish(null) }
        })
    })
}

/**
 * 判定用户当前所处的运营城市。两层降级，**不依赖地图 Key 也能工作**：
 *   1) 配了 MAP_KEY → 逆地址解析取 adcode 精确匹配（最准）
 *   2) 没配 MAP_KEY → 用球面距离找最近的城市，且必须落在该城 serviceRadiusKm 之内
 * 都不匹配返回 city=null，表示「SpinX 暂未进驻此地」。
 *
 * @param cities GET /cities 返回的城市列表
 * @returns { city, coords } —— coords 即使没匹配到城市也会带上（入驻心愿要用）
 */
export async function detectCity(cities) {
    const coords = await getLocationOnce()
    if (!coords || !Array.isArray(cities) || cities.length === 0) {
        return { city: null, coords }
    }
    if (MAP_KEY) {
        const d = await reverseGeocodeDetail(coords.latitude, coords.longitude)
        if (d && d.adcode) {
            const hit = cities.find(c => c.code === d.adcode)
            if (hit) return { city: hit, coords }
        }
    }
    let best = null
    let bestDistance = Infinity
    cities.forEach((c) => {
        if (c.centerLatitude == null || c.centerLongitude == null) return
        const d = distanceMeters(coords.latitude, coords.longitude, Number(c.centerLatitude), Number(c.centerLongitude))
        const radiusM = (Number(c.serviceRadiusKm) || 150) * 1000
        if (d <= radiusM && d < bestDistance) { best = c; bestDistance = d }
    })
    return { city: best, coords }
}

/** 距用户最近的运营城市（不限服务半径）——「暂未进驻」时用来推荐可切换的城市。 */
export function nearestCity(cities, coords) {
    if (!coords || !Array.isArray(cities) || cities.length === 0) return null
    let best = null
    let bestDistance = Infinity
    cities.forEach((c) => {
        if (c.centerLatitude == null || c.centerLongitude == null) return
        const d = distanceMeters(coords.latitude, coords.longitude, Number(c.centerLatitude), Number(c.centerLongitude))
        if (d < bestDistance) { best = c; bestDistance = d }
    })
    return best
}

/** 两坐标间球面距离（米），Haversine。用于签到地理围栏校验。 */
export function distanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000
    const toRad = d => d * Math.PI / 180
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)))
}

/** 会员主页跳转前的页面栈安全深度：微信上限 10，留出余量。 */
const MEMBER_STACK_LIMIT = 8

/**
 * 打开会员主页。全站头像/昵称的点击都走这里，保证行为一致，
 * 也避免每个页面各写一份跳转 + 栈深判断。
 *
 * 会员之间可以顺着「骑行伙伴」一路点下去，栈接近上限时改用 redirect 覆盖当前页，
 * 否则连续跳转会触发页面栈溢出，之后所有 navigateTo 都会失效。
 */
export function goMemberProfile(userId) {
    if (userId === null || userId === undefined || userId === '') return
    const url = '/pages/member/profile?userId=' + userId
    if (getCurrentPages().length >= MEMBER_STACK_LIMIT) uni.redirectTo({ url })
    else uni.navigateTo({ url })
}
