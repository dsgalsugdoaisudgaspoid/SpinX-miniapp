import { request } from '@/common/request.js'

/** 保存登录态到本地。 */
export function saveSession(data) {
    if (!data) return
    if (data.accessToken) uni.setStorageSync('accessToken', data.accessToken)
    if (data.refreshToken) uni.setStorageSync('refreshToken', data.refreshToken)
    if (data.userInfo) uni.setStorageSync('userInfo', data.userInfo)
    if (data.isGuest) uni.setStorageSync('isGuest', true)
    else uni.removeStorageSync('isGuest')
}

export function clearSession() {
    uni.removeStorageSync('accessToken')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('isGuest')
}

/** 微信登录 / 体验账号登录（接口 2.1）。code 为 wx.login 的 code 或体验账号约定 code。 */
export async function wxLogin({ code, encryptedData, iv }) {
    const data = await request({ url: '/auth/wx-login', method: 'POST', data: { code, encryptedData, iv }, loading: true })
    saveSession(data)
    return data
}

/** 游客令牌（接口 2.4）。冷启动静默调用，失败不打扰用户。 */
export async function guestToken() {
    const data = await request({ url: '/auth/guest-token', method: 'POST', silent: true })
    saveSession(data)
    return data
}

/** 注销（接口 2.3）。 */
export async function logout(reason) {
    try { await request({ url: '/auth/logout', method: 'POST', data: { reason } }) } catch (e) {}
    clearSession()
}

/** 游客转正注册（接口 3.11）。 */
export function register(payload) {
    return request({ url: '/user/register', method: 'POST', data: payload, loading: true })
        .then(d => { saveSession(d); return d })
}

export function isGuest() {
    return !!uni.getStorageSync('isGuest') || !uni.getStorageSync('accessToken')
}
