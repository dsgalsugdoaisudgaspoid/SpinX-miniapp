/** 陪练等级视觉映射（段位配色）。 */
export const LEVEL_META = {
    bronze: { label: '青铜', color: '#cd7f32', bg: '#f6e6d4', fg: '#7a4a15' },
    gold: { label: '黄金', color: '#f0a017', bg: '#fdf1dd', fg: '#8a5a00' },
    diamond: { label: '钻石', color: '#4fc3f7', bg: '#e3f4fd', fg: '#0a5c86' },
    king: { label: '王者', color: '#a855f7', bg: '#f3ebfd', fg: '#6b21a8' }
}

/** 返回等级徽章的内联样式字符串。 */
export function levelStyle(level) {
    const m = LEVEL_META[level]
    if (!m) return 'background:#eef2f0;color:#7a8a83'
    return `background:${m.bg};color:${m.fg}`
}

export function levelLabel(level) {
    return (LEVEL_META[level] || {}).label || level || '待认证'
}
