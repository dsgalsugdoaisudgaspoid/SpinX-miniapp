# SpinX 环星骑行 · UniApp 小程序

Spin X 环星骑行俱乐部的微信小程序前端，基于 **UniApp（Vue 3）**，视觉沿用「夜骑·环星」设计（Spin 绿 `#12d07a` + 夜墨蓝 `#0e1b24`），并对接 [SpinXAPI](../SpinXAPI) 后端真实接口。

## 运行

需要 **HBuilderX**（推荐）或 UniApp CLI + 微信开发者工具。

```
1. HBuilderX 打开本目录 → 运行 → 运行到小程序模拟器 → 微信开发者工具
2. 先启动后端 SpinXAPI（默认 http://localhost:8080，dev Profile 带 mock 登录与种子数据）
3. 微信开发者工具「详情 → 本地设置」勾选「不校验合法域名…」（本地联调 http 必需）
```

后端地址在 `common/config.js` 的 `BASE_URL` 配置。真机/上线需换成已备案 https 域名并在小程序后台配置 request 合法域名。

## 登录（贴合后端 mock 约定）

后端 dev 环境 `openid = "mock_openid_" + code`，登录页提供 4 个**体验账号**免授权直登：

| 账号 code | 角色 |
|-----------|------|
| `member001` | 普通会员（骑行侠） |
| `leader001` | 活动领队 |
| `photo001` | 俱乐部摄影师 |
| `admin001` | 超级管理员 |

也支持「微信一键登录」（`uni.login` 取 code 交后端 code2session）。冷启动无登录态时自动申请游客令牌，可浏览首页与活动。

## 页面 ↔ 后端接口

| 页面 | 文件 | 主要接口 |
|------|------|---------|
| 首页 · 发现 | `pages/home/home.vue` | `GET /home`、`GET /activities` |
| 活动列表 | `pages/activity/list.vue` | `GET /activities`、`GET /user/activities` |
| 活动详情 · 报名 | `pages/activity/detail.vue` | `GET /activities/{id}`、`POST …/register`、`POST /points/share` |
| 电子签约 | `pages/agreement/sign.vue` | `GET /agreements/{id}`、`POST …/sign`（阅读满 30s + 手写签名） |
| 积分成长 | `pages/points/points.vue` | `/points/summary·levels·monthly-missions`、`/exchange/items`、`/points/exchange` |
| 我的 · 骑行档案 | `pages/profile/profile.vue` | `/user/profile·riding-archive·agreements` |
| 消息 | `pages/message/message.vue` | `/notifications` |
| 打卡 | `pages/checkin/checkin.vue` | `/user/activities`、领队扫码签到 |
| 登录 | `pages/login/login.vue` | `/auth/wx-login·guest-token` |

### 补全的产品功能

| 页面 | 文件 | 主要接口 |
|------|------|---------|
| 设置（资料/隐私/通知/手机号） | `pages/settings/settings.vue` | `PUT /user/profile·privacy·notification-settings·phone` |
| 积分明细全量 | `pages/points/records.vue` | `GET /points/records`（分页 + 类型筛选） |
| 积分商城 / 商品详情 / 兑换记录 | `pages/exchange/mall·detail·records.vue` | `/exchange/items`、`/points/exchange`、`/user/exchange-records` |
| 我的协议（待签 + 已签存档） | `pages/agreement/my.vue` | `/agreements/pending·signed` |
| 活动影像（相册 + 看图点赞评论） | `pages/album/list·detail.vue` | `/albums`、`/albums/{id}`、`…/like`、`…/comment` |
| 骑行攻略 / 科普专栏 | `pages/content/list·detail.vue` | `/content/guides`、`/content/columns` |
| 反馈投诉 | `pages/feedback/feedback.vue` | `POST /feedback`、`GET /feedback` |
| 俱乐部介绍 | `pages/club/about.vue` | `/club/info` |
| 领队 · 发起活动 | `pages/leader/create.vue` | `POST /activities` |
| 领队 · 报名管理（审核/签到/发分） | `pages/leader/manage.vue` | `/activities/{id}/registrations·review·checkin·distribute-points` |

## 核心闭环

1. **浏览发现**（首页/活动列表）→ 2. **报名**（详情页，满员/截止/积分门槛由后端校验）→ 3. **合规签约**（报名返回 `needSignAgreement` 时跳签约页，阅读满 30 秒 + canvas 手写才可提交，命中 code 2004 拦截）→ 4. **积分成长**（等级阶梯/月度任务/兑换商城）→ 5. **骑行档案**（累计里程、多角色徽章、加密合规存档）。

## 目录

```
SpinX-miniapp/
├── manifest.json / pages.json      # 应用与路由/ tabBar 配置
├── main.js / App.vue / uni.scss    # 入口与全局样式
├── common/  config·request·util·theme   # 环境、请求封装(含 token 续期)、工具、设计 token
├── api/     auth·home·activity·points·user·agreement   # 接口封装
├── store/   user.js                # 登录态
└── pages/   home·activity·points·profile·agreement·login·message·checkin
```

## 说明

- 视觉全部用 CSS 渐变 + emoji 实现，未引入图片资源，`static/` 暂空；tabBar 为纯文字。
- 请求封装 `common/request.js` 统一处理后端 `{code,message,data}`：`1001` 自动用 refreshToken 续期重试，失败跳登录。
- 未在真机/微信开发者工具实际编译验证过（本机无 HBuilderX 环境）；如遇个别 API 差异按微信/UniApp 文档微调。
