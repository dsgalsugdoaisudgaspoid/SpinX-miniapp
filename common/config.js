/**
 * 环境配置。
 * - 微信开发者工具模拟器联调：BASE_URL 用 http://localhost:8081 即可，并在工具里勾选
 *   「不校验合法域名」；
 * - 真机预览 / 真机调试：代码真的跑在手机上，"localhost" 指手机自己而非电脑，必须换成
 *   电脑的局域网 IP（如 http://192.168.x.x:8081），且手机与电脑要在同一 WiFi 下。
 *   预览/真机调试属于"开发版"，微信客户端不校验域名合法性，http 明文也能直接请求，
 *   仅这一步不用管 https/备案；上线前再切换到已备案 https 域名。
 * - 上线：改为已备案的 https 域名，并在小程序后台配置 request 合法域名。
 */
export const BASE_URL = 'http://192.168.3.62:8081'

export const API_PREFIX = '/api/v1'

/**
 * 功能开关。第一版先隐藏付费类功能入口（如陪练），代码保留，置 true 即可上线。
 */
export const FEATURES = {
    coach: false // 陪练（找陪练/成为陪练/陪练订单）——第一版隐藏
}

/**
 * 成员分类（星星 / 月亮 / 太阳）。
 * 弱化原「积分会员等级」，改以成员分类作为身份标识。
 * 默认新成员为「星星」；通过「考核活动」在规定时间内完成，可升级到对应等级。
 */
export const MEMBER_TIERS = [
    { key: 'star', name: '星星', icon: '⭐', en: 'STAR', desc: '每位环星骑友的起点' },
    { key: 'moon', name: '月亮', icon: '🌙', en: 'MOON', desc: '通过「月亮考核」· 进阶骑行者' },
    { key: 'sun', name: '太阳', icon: '☀️', en: 'SUN', desc: '通过「太阳考核」· 环星核心骑手' }
]
export function tierOf(key) { return MEMBER_TIERS.find(t => t.key === key) || MEMBER_TIERS[0] }

/**
 * 骑行收获标签（Module B，替代五星评价）。活动结束后用它记录「这次骑行你收获了什么」，写入骑行日记。
 * 活动详情页内联选择器与打开小程序时的骑行总结弹窗共用这一份。
 */
export const FEELING_OPTIONS = ['突破自己', '认识了新朋友', '风景很好', '学到了技巧', '完成挑战']

/**
 * 腾讯位置服务 Key（逆地址解析用，SOS 显示道路级地名）。
 * ⚠️ 留空时 SOS 降级显示经纬度坐标；上线前在腾讯位置服务申请 Key 填入，
 * 并在小程序后台把 https://apis.map.qq.com 加入 request 合法域名。
 */
export const MAP_KEY = ''

/**
 * 微信一次性订阅消息模板（B1）。
 * ⚠️ id 为占位空串；上线前在【小程序后台 → 订阅消息 → 一次性订阅】申请模板并回填 id。
 * 未配置 id 时，requestSubscribe 会优雅跳过（不弹授权、不报错），便于开发期联调。
 */
export const SUBSCRIBE_TEMPLATES = {
    register: { id: '', name: '报名成功通知' },
    review: { id: '', name: '报名审核结果' },
    remind: { id: '', name: '活动开始提醒' },
    change: { id: '', name: '活动变更 / 取消通知' },
    lottery: { id: '', name: '抽奖开奖通知' },
    points: { id: '', name: '积分到账通知' }
}

/**
 * 品牌中枢（Single Source of Truth）。
 * 全站的俱乐部名称、口号、故事、数据、文化、logo 统一从这里取，保证品牌记忆一致。
 *
 * 品牌名：SpinX（主名，英文）。「环星」是后来的中文谐音昵称（次名），不是主名。
 * 品牌起源：Spin your bike wheel to discover X —— 转动车轮，去发现未知的 X。
 *
 * Logo 资源（放在 static/brand/，不同场景选不同版本）：
 *   wordmarkBlack —— 黑色横排字标，用于浅色背景（首页头、落款）
 *   wordmarkWhite —— 白色横排字标，用于深色/夜蓝背景（Hero）
 *   markBlack / markWhite —— 带底纹的方形标，用于水印 / 装饰
 */
export const BRAND = {
    nameCn: '环星',            // 中文谐音昵称（次名）
    nameEn: 'SpinX',           // 主名
    wordmarkEn: 'SPIN X',      // 字标展示写法
    short: 'SpinX',
    // 展示层昵称前缀：全站展示用户昵称的地方统一带上，强化俱乐部归属感。
    // 仅渲染时拼接（见 common/util.js 的 spxName），不落库、不改用户原始昵称，可编辑输入框不套用。
    namePrefix: 'SPX-',
    city: '成都',              // 目前唯一城市
    // 兜底行政区划代码（对应 db/data.sql 的城市种子）：/cities 接口也请求失败时的最后一道兜底，
    // 保证 cityCode 参数永远不为空——不然会被 common/request.js 当空值剔除，等于不按城市过滤。
    cityCode: '510100',
    // logo 资源路径
    logo: {
        wordmarkBlack: '/static/brand/spinx-wordmark.png',
        wordmarkWhite: '/static/brand/spinx-wordmark-white.png',
        markBlack: '/static/brand/spinx-mark.png',
        markWhite: '/static/brand/spinx-mark-white.png'
    },
    // 品牌起源（英文原文，直接展示，不翻译）
    taglineEn: 'Spin your bike wheel to discover X.',
    // 中文宣传语（与「环星」相关，非英文翻译）
    slogan: '转一圈车轮，环一片星空',
    // 发车仪式（贯穿全站的固定记忆）
    ritual: '每周三 · 五 日落发车',
    // 品牌故事（关于页主文案）
    story: 'SpinX 脱胎于一句话——Spin your bike wheel to discover X：转动你的车轮，去发现那个未知的 X。X 可以是一条没骑过的路、一片没见过的夜色、一群还没相遇的伙伴。中文谐音「环星」，取环城骑行、追逐星夜之意。我们扎根成都，日落发车，用车轮把这座城踩成一个又一个圈。',
    // 俱乐部数据（关于页 / 首页可复用）—— ⚠️ 占位数据，替换成真实数字
    stats: [
        { n: '2,600+', l: 'SpinX 骑友' },
        { n: '480', l: '累计场次' },
        { n: '12.8万', l: '骑行 km' },
        { n: '成都', l: '主理城市' }
    ],
    // 骑行文化 / 价值主张（一行两个卡片）
    values: [
        { icon: '🌙', t: '夜骑文化', d: '日落发车，灯火为伴，把城市踩成一个圈' },
        { icon: '🧭', t: '发现未知', d: '每次路线都藏着一个 X，等你去解锁' },
        { icon: '🎒', t: '班级文化', d: '像在一个班级里，每月都有不固定的考核；我们想护住那个不愿长大的自己' },
        { icon: '🏝', t: '小小乌托邦', d: '待在一起就无忧无虑——骑车、聚餐、一切在这发生的事，这里是大家的避风港' }
    ],
    // 俱乐部大事记时间线 —— ⚠️ 占位事件，请替换成真实日期与事件
    timeline: [
        { date: '2021.06', title: 'SpinX 成立', desc: '几位骑友在成都发起第一次日落夜骑，SpinX 正式起步。' },
        { date: '2022.05', title: '「环星」中文名启用', desc: '取 SpinX 谐音，环城骑行、追逐星夜的调性正式定名。' },
        { date: '2023.09', title: '首次跨城远征', desc: '组织首场跨城骑行，车轮第一次骑出成都。' },
        { date: '2024.04', title: '会员成长体系上线', desc: '积分 + 等级 + 荣誉墙，让每一次出发都被记录。' },
        { date: '2025.11', title: 'SpinX 小程序上线', desc: '活动报名、电子签约、积分商城全部搬到线上。' }
    ],
    // 会员等级（凭积分成长，永不降级）
    memberLevels: [
        { name: '入门骑行者', p: '0+' },
        { name: '常驻会员', p: '1000+' },
        { name: '核心会员', p: '3000+' },
        { name: '荣誉会员', p: '8000+' }
    ],
    // 俱乐部理念（我们为什么骑）+ 主理人愿景（我们想成为什么）
    philosophy: {
        kicker: 'OUR PHILOSOPHY',
        // 理念：核心一句（大标题，多行）
        ethosHeadline: '骑上车，和小伙伴们一起，\n去发现世界更多\n未知的美好与感动',
        // 理念阐释
        ethos: 'Spin your bike wheel to discover X —— 这也是 SpinX 名字的由来。转动车轮，那个未知的 X，可能是一段没走过的路、一片没见过的夜色，也可能是一份猝不及防的感动。而这一切，都要和一群同频的小伙伴一起，才更有意思。',
        // 主理人愿景
        visionTitle: '主理人愿景',
        vision: '希望 SpinX 成为一个小小的乌托邦——至少大家待在一起的时候，是无忧无虑、开心快乐的。无论是骑车、聚餐，还是其他在 SpinX 发生的事情，这里就是大家的避风港。',
        tenets: [
            { icon: '🎒', t: '像一个班级', d: '俱乐部的氛围更像在一个班级里，每个月有不固定的考核；我们想护住那个内心深处、不愿意长大的自己。' },
            { icon: '🏝', t: '一个小小的乌托邦', d: '不必最快、不必最强，待在一起就好。把日常的疲惫留在门外，只留下风、灯火与笑声。' },
            { icon: '⛺', t: '大家的避风港', d: '骑车、聚餐、深夜的闲聊……在 SpinX 发生的一切，都是可以随时停靠的港湾。' }
        ],
        signoff: 'SpinX · 主理人'
    }
}

// 后端 dev 环境 mock 登录约定：openid = 'mock_openid_' + code。
// 体验账号（免真实微信授权）：
export const DEMO_ACCOUNTS = [
    { code: 'member001', label: '普通会员', desc: '骑行侠 · 常驻会员' },
    { code: 'leader001', label: '活动领队', desc: '强哥 · 可发起活动' },
    { code: 'photo001', label: '俱乐部摄影师', desc: '小明 · 可传相册' },
    { code: 'admin001', label: '超级管理员', desc: '全局管理' }
]
