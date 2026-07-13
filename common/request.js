import { BASE_URL, API_PREFIX } from './config.js'

let refreshing = false
let lastToastAt = 0

/** 失败提示节流：2 秒内只弹一次，避免首屏并发失败连弹一串 toast。 */
function toastOnce(title) {
    const now = Date.now()
    if (now - lastToastAt < 2000) return
    lastToastAt = now
    uni.showToast({ title, icon: 'none' })
}

/**
 * 统一请求封装。
 * - 自动带 Authorization: Bearer <accessToken>
 * - 清除值为 undefined/null 的参数，避免 GET query 出现 key=undefined 干扰后端筛选
 * - 后端统一响应 { code, message, data }：code=0 resolve(data)，否则 reject
 * - code=1001（未登录/过期）：尝试用 refreshToken 续期后重试一次，仍失败跳登录
 * - options.silent=true：失败不弹 toast（用于冷启动、首屏静默拉取）
 */
export function request(options) {
    return doRequest(options, true)
}

function doRequest(options, allowRetry) {
    const { url, method = 'GET', data = {}, header = {}, loading = false, raw = false, silent = false } = options

    if (loading) uni.showLoading({ title: '加载中', mask: true })

    const cleanData = {}
    Object.keys(data || {}).forEach(k => {
        if (data[k] !== undefined && data[k] !== null) cleanData[k] = data[k]
    })

    const token = uni.getStorageSync('accessToken')
    const fullUrl = /^https?:\/\//.test(url) ? url : BASE_URL + API_PREFIX + url

    return new Promise((resolve, reject) => {
        uni.request({
            url: fullUrl,
            method,
            data: cleanData,
            header: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: 'Bearer ' + token } : {}),
                ...header
            },
            success: async (res) => {
                if (loading) uni.hideLoading()
                const body = res.data || {}

                // 二进制/非标准响应（如导出）直接透传
                if (raw) return resolve(res)

                if (body.code === 0) {
                    return resolve(body.data)
                }

                // 未登录 / token 过期 → 续期重试
                if (body.code === 1001 && allowRetry) {
                    let ok = await tryRefresh()
                    // 游客态无 refreshToken：重新申请游客令牌续期，避免游客隔天打开卡在登录页
                    if (!ok && !uni.getStorageSync('refreshToken')) ok = await tryGuest()
                    if (ok) return doRequest(options, false).then(resolve).catch(reject)
                    redirectLogin()
                    return reject(body)
                }

                // 未签署合规协议：交由调用方处理跳转签约，这里不弹默认 toast
                if (body.code === 2003) {
                    return reject(body)
                }

                if (!silent) toastOnce(body.message || '请求失败')
                reject(body)
            },
            fail: (err) => {
                if (loading) uni.hideLoading()
                if (!silent) toastOnce('网络异常，请稍后重试')
                reject(err)
            }
        })
    })
}

async function tryRefresh() {
    if (refreshing) return false
    const refreshToken = uni.getStorageSync('refreshToken')
    if (!refreshToken) return false
    refreshing = true
    try {
        const res = await uni.request({
            url: BASE_URL + API_PREFIX + '/auth/refresh',
            method: 'POST',
            data: { refreshToken },
            header: { 'Content-Type': 'application/json' }
        })
        const body = res.data || {}
        if (body.code === 0 && body.data) {
            uni.setStorageSync('accessToken', body.data.accessToken)
            if (body.data.refreshToken) uni.setStorageSync('refreshToken', body.data.refreshToken)
            return true
        }
        return false
    } catch (e) {
        return false
    } finally {
        refreshing = false
    }
}

async function tryGuest() {
    try {
        const res = await uni.request({
            url: BASE_URL + API_PREFIX + '/auth/guest-token',
            method: 'POST',
            header: { 'Content-Type': 'application/json' }
        })
        const body = res.data || {}
        if (body.code === 0 && body.data && body.data.accessToken) {
            uni.setStorageSync('accessToken', body.data.accessToken)
            uni.setStorageSync('isGuest', true)
            return true
        }
    } catch (e) {}
    return false
}

function redirectLogin() {
    const pages = getCurrentPages()
    const cur = pages.length ? pages[pages.length - 1].route : ''
    if (cur && cur.indexOf('login') === -1) {
        uni.navigateTo({ url: '/pages/login/login' })
    }
}
