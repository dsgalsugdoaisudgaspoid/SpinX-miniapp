import { SUBSCRIBE_TEMPLATES } from '@/common/config.js'
import { recordSubscribe } from '@/api/subscribe.js'

/**
 * 请求微信一次性订阅消息授权。
 * @param {string[]} keys SUBSCRIBE_TEMPLATES 的键，如 ['register','remind']
 * 未配置真实模板 id 时优雅跳过（返回 {skipped:true}），不弹窗、不报错。
 */
export function requestSubscribe(keys) {
    const list = (keys || []).map(k => ({ key: k, id: (SUBSCRIBE_TEMPLATES[k] || {}).id })).filter(x => x.id)
    if (!list.length) return Promise.resolve({ skipped: true })
    const tmplIds = list.map(x => x.id)
    return new Promise((resolve) => {
        uni.requestSubscribeMessage({
            tmplIds,
            success: (res) => {
                // res[tmplId] === 'accept' 表示用户同意
                const accepted = list.filter(x => res[x.id] === 'accept').map(x => x.key)
                if (accepted.length) { try { recordSubscribe(accepted) } catch (e) {} }
                resolve({ accepted })
            },
            fail: () => resolve({ failed: true })
        })
    })
}
