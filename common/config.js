/**
 * 环境配置。
 * - 微信开发者工具本地联调：BASE_URL 用 http://localhost:8080，并在工具里勾选
 *   「不校验合法域名」；
 * - 真机 / 上线：改为已备案的 https 域名，并在小程序后台配置 request 合法域名。
 */
export const BASE_URL = 'http://localhost:8080'

export const API_PREFIX = '/api/v1'

// 后端 dev 环境 mock 登录约定：openid = 'mock_openid_' + code。
// 体验账号（免真实微信授权）：
export const DEMO_ACCOUNTS = [
    { code: 'member001', label: '普通会员', desc: '骑行侠 · 常驻会员' },
    { code: 'leader001', label: '活动领队', desc: '强哥 · 可发起活动' },
    { code: 'photo001', label: '俱乐部摄影师', desc: '小明 · 可传相册' },
    { code: 'admin001', label: '超级管理员', desc: '全局管理' }
]
