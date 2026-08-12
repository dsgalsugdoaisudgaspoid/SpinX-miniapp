import { request } from '@/common/request.js'

/** 抽奖信息：奖池、消耗、我的积分/可抽次数、近期中奖。 */
export function lotteryInfo() {
    return request({ url: '/lottery' })
}

/** 抽一次（消耗积分）。返回中奖奖品 + 剩余积分/次数。 */
export function lotteryDraw() {
    return request({ url: '/lottery/draw', method: 'POST' })
}
