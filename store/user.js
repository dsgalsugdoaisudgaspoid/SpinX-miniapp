/** 极简登录态读取（无需引入 vuex/pinia，直接读本地存储）。 */

export function currentUser() {
    return uni.getStorageSync('userInfo') || null
}

export function isLoggedIn() {
    return !!uni.getStorageSync('accessToken') && !uni.getStorageSync('isGuest')
}

export function hasRole(role) {
    const u = currentUser()
    return !!(u && u.roles && u.roles.indexOf(role) !== -1)
}

/** 未登录（或游客）时引导去登录，返回 true 表示已拦截。 */
export function ensureMember() {
    if (isLoggedIn()) return false
    uni.navigateTo({ url: '/pages/login/login' })
    return true
}
