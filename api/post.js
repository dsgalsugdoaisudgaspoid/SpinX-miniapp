import { request } from '@/common/request.js'

/** 动态广场流。 */
export function listPosts(params = {}) {
    return request({ url: '/posts', data: params })
}

/** 动态详情（含评论）。 */
export function getPost(postId) {
    return request({ url: `/posts/${postId}` })
}

/** 发布动态（图文 + 可关联活动）。 */
export function createPost(payload) {
    return request({ url: '/posts', method: 'POST', data: payload, loading: true })
}

/** 点赞 / 取消点赞。 */
export function likePost(postId) {
    return request({ url: `/posts/${postId}/like`, method: 'POST' })
}

/** 评论。 */
export function commentPost(postId, content) {
    return request({ url: `/posts/${postId}/comment`, method: 'POST', data: { content } })
}

/** 我的动态。 */
export function myPosts(params = {}) {
    return request({ url: '/user/posts', data: params })
}
