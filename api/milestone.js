import { request } from '@/common/request.js'

/** 骑行纪念碑荣誉页（累计历程 + 已解锁纪念碑）。 */
export function getMonument() {
    return request({ url: '/milestone/monument' })
}

/** 查看某一年的年度回忆（后端不存在则实时生成）。 */
export function getAnnualReview(year) {
    return request({ url: `/milestone/annual/${year}` })
}

/** 生成 / 刷新某一年的年度回忆。 */
export function generateAnnualReview(year) {
    return request({ url: `/milestone/annual/${year}`, method: 'POST', loading: true })
}

/** 纪念碑详情（可分享卡片）。 */
export function getMilestone(id) {
    return request({ url: `/milestone/${id}` })
}
