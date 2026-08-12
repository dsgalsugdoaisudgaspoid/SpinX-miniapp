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

/** 设 / 取消精选（D2）。 */
export function setPhotoHighlight(albumId, mediaId, highlight) {
    return request({ url: `/albums/${albumId}/photos/${mediaId}/highlight`, method: 'PUT', data: { highlight } })
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
