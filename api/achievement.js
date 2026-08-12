import { request } from '@/common/request.js'

/** 我的成就：全量目录 + 进度 + 解锁状态（打开即结算一次解锁）。 */
export function getMyAchievements() {
    return request({ url: '/achievements' })
}

/** 主动结算成就解锁，返回本次新解锁项。后端未实现时静默降级。 */
export function checkAchievements() {
    return request({ url: '/achievements/check', method: 'POST', silent: true })
}
