import { request } from '@/common/request.js'

/* ---------- 相册（接口 7.1 / 7.2 / 7.8 / 7.9） ---------- */

/** 相册列表（接口 7.1）。 */
export function listAlbums(params = {}) {
    return request({ url: '/albums', data: params })
}

/** 相册详情与照片列表（接口 7.2）。 */
export function getAlbum(albumId, sortBy = 'time') {
    return request({ url: `/albums/${albumId}`, data: { sortBy } })
}

/** 点赞 / 取消点赞相册（接口 7.8）。 */
export function likeAlbum(albumId) {
    return request({ url: `/albums/${albumId}/like`, method: 'POST' })
}

/** 相册评论（接口 7.9）。 */
export function commentAlbum(albumId, content) {
    return request({ url: `/albums/${albumId}/comment`, method: 'POST', data: { content } })
}

/** 摄影师批量为相册添加照片（D2）。urls 为上传后的图片地址。 */
export function addAlbumPhotos(albumId, urls) {
    return request({ url: `/albums/${albumId}/photos`, method: 'POST', data: { urls } })
}

/**
 * 设 / 取消精选（D2）。
 * 后端用 @RequestParam 取值，而 uni.request 的 PUT 会把 data 放进请求体、不会拼到 query 上，
 * 所以这里必须自己拼 query——否则 false 传不过去，后端一律走 defaultValue=true（取消精选会失效）。
 */
export function setPhotoHighlight(albumId, mediaId, highlight) {
    return request({ url: `/albums/${albumId}/photos/${mediaId}/highlight?highlight=${highlight ? 'true' : 'false'}`, method: 'PUT' })
}

/**
 * 给照片加 / 撤 SpinX 品牌水印。加水印会生成副本，原图由后端保留，可随时撤销。
 * 同 setPhotoHighlight，参数必须走 query 而不是请求体。
 */
export function setPhotoWatermark(albumId, mediaId, enabled = true) {
    return request({ url: `/albums/${albumId}/media/${mediaId}/watermark?enabled=${enabled ? 'true' : 'false'}`, method: 'PUT' })
}

/* ---------- 影像 AI 风格化 ---------- */

/** 风格预设列表，同时返回功能是否开启（未配服务商时 available=false）。 */
export function listAiStyles() {
    return request({ url: '/ai-image/styles' })
}

/** 提交风格化任务，立刻返回 taskId，需轮询 getAiTask 取结果。 */
export function submitAiStylize(albumId, mediaId, styleKey) {
    return request({ url: `/ai-image/albums/${albumId}/media/${mediaId}`, method: 'POST', data: { styleKey } })
}

/** 查询风格化任务状态：pending / running / succeeded / failed。 */
export function getAiTask(taskId) {
    return request({ url: `/ai-image/tasks/${taskId}` })
}

/* ---------- 图文内容（接口 7.12 / 10.3） ---------- */

/** 骑行攻略列表（接口 7.12）。 */
export function listGuides(params = {}) {
    return request({ url: '/content/guides', data: params })
}

/** 骑行科普专栏（接口 10.3）。 */
export function listColumns(params = {}) {
    return request({ url: '/content/columns', data: params })
}
