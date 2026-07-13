/** 状态栏高度（px），用于自定义导航栏顶部占位。 */
export function statusBarHeight() {
    try { return uni.getSystemInfoSync().statusBarHeight || 20 } catch (e) { return 20 }
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

/** 费用展示：0 → '免费'，否则 '¥30' */
export function fmtFee(fee) {
    return (!fee || Number(fee) === 0) ? '免费' : '¥' + Number(fee)
}
