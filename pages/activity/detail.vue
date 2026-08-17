<template>
    <view class="detail" v-if="act">
        <!-- 自定义导航 -->
        <view class="nav" :style="{ paddingTop: statusBar + 'px' }">
            <view class="nbtn" @tap="back">‹</view>
            <text class="ntitle ellipsis">{{ act.title }}</text>
        </view>

        <scroll-view scroll-y class="scroll">
            <!-- 夜色封面：有宣传图时轮播裁切填满（不完整展示原图），没有则用渐变兜底 -->
            <view class="cover" :style="{ paddingTop: (statusBar + 44) + 'px' }">
                <swiper v-if="promoImages.length" class="coverswiper" :autoplay="promoImages.length > 1"
                    :circular="promoImages.length > 1" interval="4000" duration="400" @change="onCoverSwiper">
                    <swiper-item v-for="(im, i) in promoImages" :key="i">
                        <image class="coverimg" :src="im" mode="aspectFill" :data-i="i" :data-src="im" @tap="previewPromo" @error="onPromoError"></image>
                    </swiper-item>
                </swiper>
                <view v-else class="grain"></view>
                <view v-if="promoImages.length" class="coverscrim"></view>
                <brand-mark class="pmark" :style="{ top: (statusBar + 56) + 'px' }" width="90rpx"></brand-mark>
                <view class="cmeta">
                    <text class="cvol ellipsis">{{ act.title }}</text>
                    <text class="cline ellipsis">{{ range }}<text v-if="subtitle"> · {{ subtitle }}</text></text>
                </view>
                <text v-if="!promoImages.length" class="cbike">🚴</text>
                <view v-if="promoImages.length > 1" class="dots">
                    <view v-for="(im, i) in promoImages" :key="i" :class="['dot', coverIndex === i ? 'on' : '']"></view>
                </view>
                <view v-else-if="!promoImages.length" class="dots"><view class="dot on"></view><view class="dot"></view><view class="dot"></view></view>
            </view>

            <view class="sheet">
                <!-- 名称/时间/类型已经在封面图上展示过，这里不再重复披露 -->
                <view class="infocard">
                    <view class="irow" v-if="act.distance || act.elevation">
                        <text class="iic">🚵</text>
                        <view><text class="ik">路线信息</text><text class="iv">{{ routeStatsText }}</text></view>
                    </view>
                    <view class="irow bt">
                        <text class="iic">📍</text>
                        <view class="flex1">
                            <text class="ik">集合地点 · {{ act.meetingPoint ? '' : '' }}距你 3.2km</text>
                            <text class="iv">{{ act.meetingPoint }}</text>
                            <safe-map v-if="hasGeo" class="mapbox" :latitude="lat" :longitude="lng" :markers="markers" :scale="15"
                                height="180rpx" radius="20rpx" expandable @tap="openMapFull"></safe-map>
                        </view>
                    </view>
                    <view class="irow bt">
                        <text class="iic">👥</text>
                        <view class="flex1">
                            <text class="ik">{{ act.maxParticipants }} 人一起 · {{ act.currentParticipants }}/{{ act.maxParticipants }} 已报名<text v-if="act.waitlistCount > 0"> · 候补 {{ act.waitlistCount }} 人</text></text>
                            <view class="people">
                                <view v-for="i in avatarCount" :key="i" class="pav" :style="{ background: gradAt(i-1), marginLeft: i>1 ? '-18rpx' : 0, zIndex: 9-i }"></view>
                                <text class="pcnt">{{ leftText }}</text>
                            </view>
                        </view>
                    </view>
                    <!-- 路书码表：可同时绑定多个平台，领队在报名管理里随时补录/修改，未绑定时不展示 -->
                    <view v-for="(l, i) in (act.routeLinks || [])" :key="i" class="irow bt" :data-ext="l.externalId" @tap="copyRouteId">
                        <text class="iic">📊</text>
                        <view class="flex1">
                            <text class="ik">路书 · {{ l.brand }}</text>
                            <text class="iv ellipsis">{{ l.externalId || '未填 ID' }}</text>
                        </view>
                        <text v-if="l.externalId" class="routecopy">复制</text>
                    </view>
                </view>

                <!-- 积分提示 -->
                <view class="ptip" v-if="act.userPoints">
                    <text>🎯 全程参与可得</text>
                    <text class="pv mono">+{{ (act.userPoints.basePoints||0) + (act.userPoints.fullAttendanceBonus||0) }}</text>
                    <text>积分（基础 {{ act.userPoints.basePoints }} + 全勤 {{ act.userPoints.fullAttendanceBonus }}）</text>
                </view>

                <!-- 收获标签（3.9，替代五星评价） -->
                <view class="feelbox" v-if="showFeeling">
                    <text class="feelt">这次骑行，你的收获是？</text>
                    <view class="feelchips">
                        <text v-for="f in feelingOptions" :key="f" :class="['fchip', selectedFeelings.includes(f) ? 'on' : '']" :data-f="f" @tap="toggleFeeling">{{ f }}</text>
                    </view>
                    <view class="feelgo" @tap="submitFeelingTags">记下这次收获</view>
                </view>
                <view class="feeldone" v-else-if="feelingDone">已记录这次骑行的收获，感谢分享 · 已写入骑行日记</view>

                <!-- 完赛抽奖（复用公共抽奖组件） -->
                <view class="rfwrap" v-if="act.raffle && act.raffle.enabled">
                    <raffle-board :raffle="act.raffle" title="🎁 完赛抽奖" :status-text="raffleStatus" :note="raffleNote"></raffle-board>
                </view>

                <!-- 本场怎么玩 -->
                <text class="sec">本场怎么玩 · 领队阵容</text>
                <view class="howto" v-if="act.leader">
                    <view class="role">
                        <text class="rk">主领队</text>
                        <text class="who" :data-uid="act.leader.userId" @tap="goMember">@{{ spx(act.leader.nickname) }}</text>
                        <text class="rchip lead">领队</text>
                    </view>
                    <view class="role" v-for="c in (act.coLeaders||[])" :key="c.userId">
                        <text class="rk">副领队</text>
                        <text class="who" :data-uid="c.userId" @tap="goMember">@{{ spx(c.nickname) }}</text>
                        <text class="rchip">签到 · 名单</text>
                    </view>
                </view>

                <!-- 本场的城市小小宣传官（全局角色，参加哪场就在哪场展示；带真实头像） -->
                <view class="amb" v-if="(act.ambassadors||[]).length">
                    <text class="ambt">📣 本场城市小小宣传官</text>
                    <view class="amblist">
                        <view v-for="p in act.ambassadors" :key="p.userId" class="ambitem" :data-uid="p.userId" @tap="goMember">
                            <view class="ambav" :style="{ backgroundImage: p.avatar ? ('url(' + p.avatar + ')') : '' }"></view>
                            <text class="ambn ellipsis">{{ spx(p.nickname) }}</text>
                        </view>
                    </view>
                </view>
                <text class="desc" v-if="act.description">{{ act.description }}</text>

                <view class="risk" v-if="act.riskNotice">
                    <text class="ri">⚠️</text><text class="rt">{{ act.riskNotice }}</text>
                </view>

                <!-- 保险提示：俱乐部不统一投保，固定提示，不受单场活动配置影响 -->
                <view class="insnotice">
                    <text class="ri">🛡️</text><text class="rt">本活动不含商业保险，请自行购买骑行意外险 / 人身意外险后再参与</text>
                </view>

                <!-- 取消报名：已签到/活动已结束不再展示；距开始不足 24 小时禁用并说明原因 -->
                <view v-if="canCancelEntry" :class="['cancelentry', cancelWindowOpen ? '' : 'off']" @tap="onCancelRegistration">
                    <text class="le-i">✕</text>
                    <view class="le-t">
                        <text class="le-t1">{{ act.paymentPending ? '放弃本次报名' : '取消报名' }}</text>
                        <text class="le-t2">{{ act.paymentPending ? '取消这笔待支付订单，不再占用名额' : (cancelWindowOpen ? '取消后名额释放' : '距活动开始不足 24 小时，暂不支持取消') }}</text>
                    </view>
                    <text v-if="cancelWindowOpen" class="le-arw">›</text>
                </view>

                <view v-if="isLeader" class="leadentry" @tap="goManage">
                    <text class="le-i">👥</text>
                    <view class="le-t"><text class="le-t1">报名管理</text><text class="le-t2">审核 · 签到 · 一键发分</text></view>
                    <text class="le-arw">›</text>
                </view>

                <!-- 往期活动：领队可一键复用这条路线的基本参数，快速发起同款活动 -->
                <view v-if="isLeader && act.status === 'completed'" class="reuse" @tap="reuseRoute">
                    <text class="le-i">♻️</text>
                    <view class="le-t"><text class="le-t1">复用这条路线</text><text class="le-t2">把集合/终点、里程、标签等带到发布页，只需改时间</text></view>
                    <text class="le-arw">›</text>
                </view>

                <view class="safe-bottom" :style="{ height: (110 + safeBottom) + 'px' }"></view>
            </view>
        </scroll-view>

        <!-- 底部 CTA -->
        <view class="cta" :style="{ paddingBottom: 'calc(24rpx + ' + safeBottom + 'px)' }">
            <button class="qa" open-type="share"><text class="qi">↗</text><text>分享</text></button>
            <!-- 已报名：签到 + 加群二维码 -->
            <block v-if="act.isRegistered">
                <!-- 已签到：状态展示 -->
                <view v-if="act.isCheckedIn" class="go2 done"><text class="gt">已签到 ✓</text></view>
                <!-- 积分已发放/活动已结束：关闭签到 -->
                <view v-else-if="activityEnded" class="go2 off"><text class="gt">活动已结束</text></view>
                <!-- 仅活动开始起 1 小时内可签到，不在窗内则禁用并说明 -->
                <view v-else :class="['go2', checkinWindowOpen ? '' : 'off']" @tap="onCheckin"><text class="gt">{{ checkinBtnText }}</text></view>
                <!-- 加群二维码：活动结束后不可再加群 -->
                <view v-if="act.groupQrcode && !activityEnded" class="go2 group" @tap="showGroupQr">
                    <text class="gi2">👥</text><text class="gt">加群二维码</text>
                </view>
            </block>
            <!-- 未报名：报名 -->
            <view v-else :class="['go', ctaDisabled ? 'off' : '']" @tap="onCta">
                <text class="gt">{{ ctaText }}</text>
                <text v-if="!ctaDisabled && !act.isAgreementSigned" class="gs">需签署《骑行安全知情同意书》</text>
            </view>
        </view>

        <!-- 一键 SOS（已报名且活动未结束时出现） -->
        <view v-if="showSos" class="sosfab" :style="{ bottom: (safeBottom + 76) + 'px' }" @tap="onSos">
            <text class="sosi">🆘</text><text class="sost">求助</text>
        </view>

        <!-- 加群二维码弹层 -->
        <view class="qrmask" v-if="qrShow" @tap="closeQr">
            <view class="qrbox" @tap.stop>
                <text class="qrt">加入本场骑行群</text>
                <text class="qrsub">报名成功 · 扫码进群，领队会在群里同步集合与发车信息</text>
                <image class="qrimg" :src="act.groupQrcode" mode="aspectFit" show-menu-by-longpress></image>
                <text class="qrh">长按二维码保存 / 识别进群</text>
                <view class="qrclose" @tap="closeQr">关闭</view>
            </view>
        </view>

        <!-- SOS 求助结果：当前地点 + 领队电话，供第一时间联系 -->
        <view class="sosmask" v-if="sosResult" @tap="closeSos">
            <view class="sosbox" @tap.stop>
                <text class="sosttl">🆘 求助已发出</text>
                <text class="sostip">领队与俱乐部值班人员已收到你的求助{{ sosResult.hasLoc ? '与实时位置' : '' }}。情况危急请立即拨打 120。</text>
                <view class="sosrow" :class="{ tap: sosResult.lat != null }" @tap="viewSosLocation">
                    <text class="sosk">你的当前位置</text>
                    <text class="sosv">{{ sosResult.locName }}<text v-if="sosResult.lat != null" class="sosmap"> 🗺 查看地图</text></text>
                </view>
                <view class="sosrow">
                    <text class="sosk">本场领队</text>
                    <text class="sosv">@{{ sosResult.leaderName }} · {{ sosResult.leaderPhone }}</text>
                </view>
                <view class="soscall lead" :data-phone="sosResult.leaderPhone" @tap="callPhone">📞 拨打领队电话</view>
                <view class="soscall danger" data-phone="120" @tap="callPhone">🚑 拨打 120 急救</view>
                <text class="sosclose" @tap="closeSos">关闭</text>
            </view>
        </view>
    </view>
</template>

<script>
import { getActivity, registerActivity, shareActivity, checkin, cancelRegistration } from '@/api/activity.js'
import { sendSOS } from '@/api/safety.js'
import { payOrder } from '@/api/order.js'
import { submitFeeling } from '@/api/journal.js'
import { requestSubscribe } from '@/common/subscribe.js'
import { statusBarHeight, fmtRange, fmtFee, distanceMeters, fmtTime, isDevtools, reverseGeocode, spxName, goMemberProfile } from '@/common/util.js'
import { isLoggedIn, hasRole, currentUser } from '@/store/user.js'
import RaffleBoard from '@/components/raffle-board/raffle-board.vue'
import BrandMark from '@/components/brand-mark/brand-mark.vue'
import SafeMap from '@/components/safe-map/safe-map.vue'
import { FEELING_OPTIONS } from '@/common/config.js'

export default {
    components: { RaffleBoard, SafeMap, BrandMark },
    data() {
        return {
            statusBar: 20, safeBottom: 0, id: null, act: null, registering: false, qrShow: false, checkingIn: false,
            feelingOptions: FEELING_OPTIONS, selectedFeelings: [], feelingSubmitting: false, feelingJustSubmitted: false,
            sosResult: null, sosing: false, autoCheckin: false, checkinPrompted: false, promoBroken: [], coverIndex: 0
        }
    },
    computed: {
        range() { return this.act ? fmtRange(this.act.startTime, this.act.endTime) : '' },
        feeStr() { return this.act ? fmtFee(this.act.fee) : '' },
        subtitle() { return this.act && this.act.tags ? this.act.tags.join(' · ') : '骑行' },
        routeStatsText() {
            const parts = []
            if (this.act.distance) parts.push(this.act.distance + 'km')
            if (this.act.elevation) parts.push('爬升 ' + this.act.elevation + 'm')
            return parts.join(' · ') || '—'
        },
        // 过滤掉空字符串/非字符串脏数据，以及加载失败（URL 不可达，如上传残留的临时路径）的图。
        // 不然数组"非空但没有可显示的图"时，画廊会占位渲染出一片空白——@error 回填 promoBroken 后这里自动剔除，画廊随之收起。
        promoImages() {
            return ((this.act && this.act.routeImages) || [])
                .filter(u => typeof u === 'string' && u.trim() && this.promoBroken.indexOf(u) === -1)
        },
        hasGeo() { return this.act && this.act.meetingLatitude && this.act.meetingLongitude },
        lat() { return Number(this.act.meetingLatitude) },
        lng() { return Number(this.act.meetingLongitude) },
        markers() {
            if (!this.hasGeo) return []
            return [{ id: 1, latitude: this.lat, longitude: this.lng, width: 30, height: 30, callout: { content: '集合地点', display: 'ALWAYS', padding: 6, borderRadius: 6 } }]
        },
        isLeader() { return hasRole('leader') || hasRole('admin') },
        // 本场活动的主领队本人——不是"有没有领队角色"，是"是不是这一场的领队"。主领队不能取消报名
        // （后端也会拦），退出活动只能走转让主领队资格
        isMainLeader() {
            const me = currentUser()
            return !!(this.act && this.act.leader && me && this.act.leader.userId === me.userId)
        },
        avatarCount() { return Math.min(5, this.act ? (this.act.currentParticipants || 0) : 0) || 1 },
        leftText() {
            if (!this.act) return ''
            const left = (this.act.maxParticipants || 0) - (this.act.currentParticipants || 0)
            return left > 0 ? `还差 ${left} 位` : '已满员'
        },
        ctaDisabled() {
            if (!this.act) return true
            const s = this.act.status
            return s === 'completed' || s === 'cancelled' || s === 'withdrawn'
        },
        // 积分已发放（或状态已完成/取消/下架）即视为活动结束：关闭签到、加群、SOS
        activityEnded() {
            if (!this.act) return false
            const s = this.act.status
            return !!(this.act.pointsSettled || s === 'completed' || s === 'cancelled' || s === 'withdrawn')
        },
        // 活动开始时间的时间戳（兼容 iOS：把 "2026-08-13T10:47:00" 归一成 "2026/08/13 10:47:00"）
        startTs() {
            if (!this.act || !this.act.startTime) return NaN
            return new Date(String(this.act.startTime).replace(/-/g, '/').replace('T', ' ')).getTime()
        },
        // 签到时间窗：仅活动开始起 1 小时内
        checkinWindowOpen() {
            if (isNaN(this.startTs)) return false
            const now = Date.now()
            return now >= this.startTs && now <= this.startTs + 3600 * 1000
        },
        checkinBtnText() {
            if (this.checkinWindowOpen) return '签到'
            if (isNaN(this.startTs)) return '签到'
            return Date.now() < this.startTs ? '未到签到时间' : '签到已截止'
        },
        // 已签到/活动已结束不再展示取消报名入口——那两种情况取消也没有意义
        // 待支付也可以取消（放弃这次下单）——不受 24 小时限制，见下面 cancelWindowOpen
        canCancelEntry() {
            return !!(this.act && !this.isMainLeader && (this.act.isRegistered || this.act.paymentPending) && !this.act.isCheckedIn && !this.activityEnded)
        },
        // 取消报名需距活动开始 24 小时以上，与后端 ActivityService.cancelRegistration 的硬性拦截保持一致；
        // 待支付的还没真正生效，不受此限制，随时可以取消
        cancelWindowOpen() {
            if (this.act && this.act.paymentPending) return true
            if (isNaN(this.startTs)) return true
            return Date.now() < this.startTs - 24 * 3600 * 1000
        },
        showSos() {
            return !!(this.act && this.act.isRegistered && !this.activityEnded)
        },
        showFeeling() {
            return !!(this.act && this.act.isCheckedIn && this.act.status === 'completed' && !this.act.feelingGiven && !this.feelingJustSubmitted)
        },
        feelingDone() {
            return !!(this.act && (this.act.feelingGiven || this.feelingJustSubmitted))
        },
        raffleStatus() {
            const r = this.act && this.act.raffle
            if (!r) return ''
            return r.drawn ? '已开奖' : (r.myEntered ? '已参与' : '待参与')
        },
        raffleNote() {
            const r = this.act && this.act.raffle
            if (!r) return ''
            const t = fmtTime(r.drawAt)
            const at = t.md ? (t.md + ' ' + t.time) : ''
            if (!r.drawn) {
                const base = `签到后自动参与 · ${at} 开奖（活动开始 2 小时后）`
                return r.myEntered ? ('✓ 你已参与本场抽奖 · ' + base) : ('报名并签到即可参与 · ' + base)
            }
            const base = `已于 ${at} 开奖 · 共 ${r.entrantCount} 人参与`
            return (!r.myPrize && r.myEntered) ? (base + ' · 很遗憾未中奖，下次继续') : base
        },
        ctaText() {
            if (!this.act) return ''
            const s = this.act.status
            if (s === 'completed') return '活动已结束'
            if (s === 'cancelled' || s === 'withdrawn') return '活动已取消'
            if (this.act.isWaitlisted) return `候补中 · 第 ${this.act.waitlistPosition} 位（点此退出）`
            if (this.act.paymentPending) return `待支付 · ¥${this.act.fee}（点此继续支付）`
            if (this.act.isRegistered) return '已报名 · 查看我的活动'
            if (this.act.isFull) return '报名候补 · 当前满员'
            return this.act.fee > 0 ? `点击报名 · ¥${this.act.fee}` : '点击报名'
        }
    },
    onLoad(q) {
        this.statusBar = statusBarHeight()
        try { this.safeBottom = uni.getSystemInfoSync().safeAreaInsets ? uni.getSystemInfoSync().safeAreaInsets.bottom : 0 } catch (e) {}
        this.id = q.id
        this.autoCheckin = q.checkin === '1' // 来自打卡页的直达签到
    },
    // 用 onShow 而非 onLoad：报名→签约→返回、或登录返回后自动刷新报名状态/人数
    onShow() {
        if (this.id) this.load()
    },
    methods: {
        spx(n) { return spxName(n) },
        goMember(e) { goMemberProfile(e.currentTarget.dataset.uid) },
        gradAt(i) {
            const g = ['linear-gradient(135deg,#ffd36e,#ff8f6e)', 'linear-gradient(135deg,#8fd3ff,#5e8bff)', 'linear-gradient(135deg,#b6f0c9,#5ecb8f)', 'linear-gradient(135deg,#c9b6ff,#8f6eff)', 'linear-gradient(135deg,#ffb6d1,#ff6f97)']
            return g[i % g.length]
        },
        async load() {
            try { this.act = await getActivity(this.id) } catch (e) {}
            this.maybePromptCheckin()
        },
        // 详情页地图只有 180rpx 高，点开后调微信内置地图查看大图：自带缩放/拖拽，
        // 还能一键切到用户装的导航 App，比自建一个全屏地图页更省心也更符合用户习惯。
        openMapFull() {
            if (!this.hasGeo) return
            uni.openLocation({
                latitude: this.lat,
                longitude: this.lng,
                name: this.act.meetingPoint || this.act.title || '集合地点',
                address: this.act.meetingPoint || '',
                scale: 16
            })
        },
        // 从打卡页直达时：已报名且未签到 → 直接提示定位签到，减少操作链路（只提示一次）
        maybePromptCheckin() {
            if (!this.autoCheckin || this.checkinPrompted || !this.act) return
            if (!this.act.isRegistered || this.act.isCheckedIn) return
            // 活动已结束或不在签到时间窗内：不弹签到提示（后端也会拒绝）
            if (this.activityEnded || !this.checkinWindowOpen) return
            this.checkinPrompted = true
            uni.showModal({
                title: '现在定位签到？', content: `你今天报名了「${this.act.title}」。到达集合点后点「定位签到」即可完成签到。`,
                confirmText: '定位签到', cancelText: '稍后',
                success: (m) => { if (m.confirm) this.onCheckin() }
            })
        },
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/home/home' }) },
        goManage() { uni.navigateTo({ url: '/pages/leader/manage?activityId=' + this.id }) },
        // 复用路线：把本场基本参数（不含日期/时间）暂存，发布页读取后预填
        reuseRoute() {
            const a = this.act
            const tpl = {
                title: a.title,
                description: a.description || '',
                meetingPoint: a.meetingPoint || '', meetingLatitude: a.meetingLatitude, meetingLongitude: a.meetingLongitude,
                disbandPoint: a.disbandPoint || '', disbandLatitude: a.disbandLatitude, disbandLongitude: a.disbandLongitude,
                distance: a.distance, elevation: a.elevation, difficulty: a.difficulty, maxParticipants: a.maxParticipants,
                tags: (a.tags || []).slice(), fee: a.fee
                // 群二维码故意不带——那是绑定这一场具体群聊的，带过去会把新报名的人导向旧群
            }
            uni.setStorageSync('reuseRouteTpl', tpl)
            uni.navigateTo({ url: '/pages/leader/create?reuse=1' })
        },
        async onCta() {
            if (this.ctaDisabled) return
            if (this.act.isWaitlisted) { this.leaveWaitlist(); return }
            // 待支付：继续支付已有订单，不要再走一遍报名（会撞上"请勿重复报名"）
            if (this.act.paymentPending) { this.handlePay({ orderId: this.act.pendingOrderId, amount: this.act.fee, payParams: this.act.pendingPayParams }); return }
            if (this.act.isRegistered) { uni.navigateTo({ url: '/pages/activity/mine' }); return }
            if (!isLoggedIn()) { uni.navigateTo({ url: '/pages/login/login' }); return }
            // 报名前二次确认：本活动不含保险，需骑友自行购买
            const insured = await this.confirmInsurance()
            if (!insured) return
            if (this.registering) return
            this.registering = true
            try {
                const r = await registerActivity(this.id, { hasExperience: true })
                if (r && r.waitlisted) {
                    uni.showModal({ title: '已加入候补', content: `当前活动已满员，你在候补队列第 ${r.position} 位。有名额释放时将按顺序优先递补并通知你。`, showCancel: false, confirmText: '知道了' })
                    this.load()
                    return
                }
                if (r && r.creditBlocked) {
                    uni.showModal({
                        title: '暂不能报名热门活动',
                        content: `你当前信誉分 ${r.score}，低于 ${r.threshold} 分。准时参加活动可逐步恢复信誉。`,
                        confirmText: '查看信誉分', cancelText: '知道了',
                        success: (m) => { if (m.confirm) uni.navigateTo({ url: '/pages/credit/credit' }) }
                    })
                    return
                }
                if (r && r.needSafetyProfile) {
                    uni.showModal({
                        title: '请先完善安全档案',
                        content: '报名前需填写紧急联系人信息，以便活动中发生意外时能第一时间联系与处置。',
                        confirmText: '去填写', cancelText: '暂不',
                        success: (m) => { if (m.confirm) uni.navigateTo({ url: '/pages/safety/profile' }) }
                    })
                    return
                }
                // B2：付费活动 → 先下单支付
                if (r && r.needPay) { this.handlePay(r); return }
                this.afterRegistered(r)
            } catch (e) {} finally { this.registering = false }
        },
        // 俱乐部不统一投保，报名前必须让用户明确知晓并确认已自行购买保险，而不是默默假设大家都知道
        confirmInsurance() {
            return new Promise((resolve) => {
                uni.showModal({
                    title: '骑行安全提示',
                    content: '本活动不含商业保险，请确认已自行购买骑行意外险 / 人身意外险后再报名。骑行有风险，安全保障需自行准备。',
                    confirmText: '已购买，继续报名',
                    cancelText: '再想想',
                    confirmColor: '#0ba968',
                    success: (m) => resolve(!!m.confirm),
                    fail: () => resolve(false)
                })
            })
        },
        onCancelRegistration() {
            if (!this.cancelWindowOpen) { uni.showToast({ title: '距活动开始不足 24 小时，暂不支持取消', icon: 'none' }); return }
            uni.showModal({
                title: '取消报名', content: '确定要取消本场活动的报名吗？取消后需要重新报名才能参加。',
                confirmText: '确定取消', confirmColor: '#e0533d',
                success: async (m) => {
                    if (!m.confirm) return
                    try {
                        await cancelRegistration(this.id, '用户取消')
                        uni.showToast({ title: '已取消报名', icon: 'none' })
                        this.load()
                    } catch (e) {}
                }
            })
        },
        // B2：处理支付（开发者工具模拟支付，真机走微信支付）
        handlePay(r) {
            const pay = async () => {
                try { const pr = await payOrder(r.orderId); this.afterRegistered(pr) } catch (e) {}
            }
            if (isDevtools()) {
                uni.showModal({ title: '模拟支付', content: `应付 ¥${r.amount}（开发者工具模拟，真机走微信支付）`, confirmText: '模拟已支付', cancelText: '取消', success: (m) => { if (m.confirm) pay() } })
            } else {
                uni.requestPayment(Object.assign({}, r.payParams, { success: pay, fail: () => uni.showToast({ title: '支付未完成，报名未生效', icon: 'none' }) }))
            }
        },
        afterRegistered(r) {
            // B1：报名成功 → 引导订阅（报名/审核/提醒/变更/积分）
            requestSubscribe(['register', 'review', 'remind', 'change', 'points'])
            // C：新人的第一次仪式——用更完整的欢迎文案代替普通 toast
            if (r && r.isFirstRide) { this.showFirstRideWelcome(r); return }
            if (r && r.needSignAgreement && r.agreementId) {
                uni.showToast({ title: '报名成功，请签署协议', icon: 'none' })
                setTimeout(() => { uni.navigateTo({ url: `/pages/agreement/sign?agreementId=${r.agreementId}&activityId=${this.id}` }) }, 600)
            } else {
                uni.showToast({ title: r && r.paid ? '支付成功 · 报名生效' : '报名成功', icon: 'success' })
                this.load()
            }
        },
        showFirstRideWelcome(r) {
            const leaderName = spxName((this.act && this.act.leader && this.act.leader.nickname) || '') || '领队'
            const others = (r.newbieCount || 1) - 1
            const newbieLine = others > 0 ? `同场还有 ${others} 位新人，你不是一个人～` : '你是本场第一位新人，领队会格外照顾～'
            const content = `这是你在 SpinX 的第一次骑行 🎉\n\n· 提前 15 分钟到集合点\n· 不要跟高速集团，保持自己的节奏\n· 今天的领队是 @${leaderName}\n· ${newbieLine}`
            uni.showModal({
                title: '欢迎加入 SpinX', content, showCancel: false, confirmText: (r.needSignAgreement && r.agreementId) ? '去签署协议' : '知道了',
                success: () => {
                    if (r.needSignAgreement && r.agreementId) uni.navigateTo({ url: `/pages/agreement/sign?agreementId=${r.agreementId}&activityId=${this.id}` })
                    else this.load()
                }
            })
        },
        onCheckin() {
            if (this.act.isCheckedIn) { uni.showToast({ title: '你已签到', icon: 'none' }); return }
            if (this.activityEnded) { uni.showToast({ title: '活动已结束，签到已关闭', icon: 'none' }); return }
            if (!this.checkinWindowOpen) {
                uni.showToast({ title: isNaN(this.startTs) || Date.now() < this.startTs ? '未到签到时间，活动开始后 1 小时内可签到' : '签到已截止（活动开始 1 小时内可签到）', icon: 'none' })
                return
            }
            if (this.checkingIn) return
            if (!this.hasGeo) { uni.showModal({ title: '无法定位签到', content: '本场活动未设置集合点坐标，请联系领队现场签到', showCancel: false, confirmText: '知道了' }); return }
            this.checkingIn = true
            uni.showLoading({ title: '定位中…', mask: true })
            let done = false
            const guard = setTimeout(() => { if (done) return; done = true; uni.hideLoading(); this.checkingIn = false; uni.showModal({ title: '定位超时', content: '未能获取定位，请确认已开启定位（模拟器需先设置位置）后重试', showCancel: false, confirmText: '知道了' }) }, 8000)
            uni.getLocation({
                type: 'gcj02',
                success: async (loc) => {
                    if (done) return; done = true; clearTimeout(guard)
                    const dist = distanceMeters(loc.latitude, loc.longitude, this.lat, this.lng)
                    if (dist > 1000) {
                        uni.hideLoading()
                        this.checkingIn = false
                        uni.showModal({
                            title: '离集合点还有点远',
                            content: `你距集合点约 ${(dist / 1000).toFixed(1)}km，需到达 1km 范围内才能签到。请抵达「${this.act.meetingPoint}」附近再试。`,
                            showCancel: false, confirmText: '知道了'
                        })
                        return
                    }
                    try {
                        await checkin(this.id, { latitude: loc.latitude, longitude: loc.longitude })
                        uni.hideLoading()
                        uni.showToast({ title: '签到成功', icon: 'success' })
                        this.load()
                    } catch (e) { uni.hideLoading() } finally { this.checkingIn = false }
                },
                fail: () => {
                    if (done) return; done = true; clearTimeout(guard)
                    uni.hideLoading()
                    this.checkingIn = false
                    uni.showModal({ title: '需要定位权限', content: '签到需获取你的位置，以核验是否已到达集合点附近。请在小程序设置中开启「位置信息」后重试。', showCancel: false, confirmText: '知道了' })
                }
            })
        },
        showGroupQr() { this.qrShow = true },
        closeQr() { this.qrShow = false },
        copyRouteId(e) {
            const ext = e.currentTarget.dataset.ext
            if (!ext) return
            uni.setClipboardData({
                data: ext,
                success: () => uni.showToast({ title: '路线 ID 已复制', icon: 'none' })
            })
        },
        onCoverSwiper(e) { this.coverIndex = (e && e.detail && e.detail.current) || 0 },
        previewPromo(e) {
            const urls = this.promoImages
            uni.previewImage({ urls, current: urls[+e.currentTarget.dataset.i] })
        },
        // 宣传图加载失败（URL 不可达，如上传残留的临时路径）→ 从展示集合剔除，避免留下一片空白占位
        onPromoError(e) {
            const src = e.currentTarget.dataset.src
            if (src && this.promoBroken.indexOf(src) === -1) this.promoBroken.push(src)
        },
        toggleFeeling(e) {
            const f = e.currentTarget.dataset.f
            const i = this.selectedFeelings.indexOf(f)
            if (i >= 0) this.selectedFeelings.splice(i, 1); else this.selectedFeelings.push(f)
        },
        async submitFeelingTags() {
            if (this.selectedFeelings.length === 0) { uni.showToast({ title: '选一两个标签吧', icon: 'none' }); return }
            if (this.feelingSubmitting) return
            this.feelingSubmitting = true
            try {
                await submitFeeling(this.id, this.selectedFeelings)
                this.feelingJustSubmitted = true
                uni.showToast({ title: '已记下这次收获', icon: 'success' })
            } catch (e) {} finally { this.feelingSubmitting = false }
        },
        leaveWaitlist() {
            uni.showModal({
                title: '退出候补', content: `你在候补第 ${this.act.waitlistPosition} 位，确定退出候补队列？`,
                confirmText: '退出候补', confirmColor: '#e0533d',
                success: async (m) => { if (!m.confirm) return; try { await cancelRegistration(this.id, '退出候补'); uni.showToast({ title: '已退出候补', icon: 'none' }); this.load() } catch (e) {} }
            })
        },
        onSos() {
            uni.showModal({
                title: '发送紧急求助？',
                content: '将把你的当前位置和信息推送给领队与俱乐部值班人员。若情况危急，请同时拨打 120 / 122。',
                confirmText: '发送求助', confirmColor: '#e0533d', cancelText: '取消',
                success: (m) => { if (m.confirm) this.doSos() }
            })
        },
        doSos() {
            if (this.sosing) return
            this.sosing = true
            uni.showLoading({ title: '定位并求助…', mask: true })
            let done = false
            const finish = (loc) => { if (done) return; done = true; this.sendSosWithLoc(loc) }
            const guard = setTimeout(() => finish(null), 8000) // 定位超时也照发（不带位置）
            uni.getLocation({
                type: 'gcj02',
                success: (loc) => { clearTimeout(guard); finish(loc) },
                fail: () => { clearTimeout(guard); finish(null) }
            })
        },
        async sendSosWithLoc(loc) {
            try {
                // 逆地址解析成「市区街道 + 附近地标」；无 Key/解析失败时不展示裸坐标（用户读不懂也没法口述），
                // 改用「在地图中查看」让人一眼定位，经纬度仍随请求原样上报给后端/领队，救援信息不丢失。
                let locName = loc ? null : '未获取到位置，请电话口述位置'
                if (loc) {
                    try { locName = await reverseGeocode(loc.latitude, loc.longitude) } catch (e) {}
                }
                await sendSOS({ activityId: this.id, latitude: loc ? loc.latitude : null, longitude: loc ? loc.longitude : null, locationName: loc ? locName : null })
                uni.hideLoading()
                this.sosResult = {
                    hasLoc: !!loc,
                    locName: loc ? (locName || '地址解析失败，请点击查看地图定位') : locName,
                    lat: loc ? loc.latitude : null,
                    lng: loc ? loc.longitude : null,
                    leaderName: spxName((this.act && this.act.leader && this.act.leader.nickname) || '') || '领队',
                    leaderPhone: (this.act && this.act.leader && this.act.leader.phone) || ''
                }
            } catch (e) { uni.hideLoading() } finally { this.sosing = false }
        },
        viewSosLocation() {
            if (!this.sosResult || this.sosResult.lat == null) return
            uni.openLocation({ latitude: this.sosResult.lat, longitude: this.sosResult.lng, name: this.sosResult.locName || '我的位置', scale: 16 })
        },
        callPhone(e) {
            const phone = e.currentTarget.dataset.phone
            if (phone) uni.makePhoneCall({ phoneNumber: String(phone) })
            else uni.showToast({ title: '暂无领队电话，请用其他方式联系', icon: 'none' })
        },
        closeSos() { this.sosResult = null },
        // 转发面板真正打开时才算一次分享意图，在这里领积分（而不是点击按钮就领，那时用户还没选是否真的转发）
        async grantSharePoints() {
            try { const r = await shareActivity(this.id, 'session'); if (r && r.pointsGranted) uni.showToast({ title: `分享 +${r.points} 积分`, icon: 'none' }) } catch (e) {}
        }
    },
    // 转发（微信原生分享，按钮需 open-type="share" 才会触发系统转发面板）
    onShareAppMessage() {
        this.grantSharePoints()
        return { title: this.act ? this.act.title : '环星骑行', path: '/pages/activity/detail?id=' + this.id }
    }
}
</script>

<style lang="scss" scoped>
.detail { height: 100vh; display: flex; flex-direction: column; background: $card; }
.nav { position: fixed; top: 0; left: 0; right: 0; z-index: 10; display: flex; align-items: center; gap: 16rpx; padding: 0 24rpx 12rpx; }
.nbtn { width: 64rpx; height: 64rpx; border-radius: 50%; background: rgba(255,255,255,.85); backdrop-filter: blur(10rpx);
    display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: $ink; }
.ntitle { flex: 1; font-size: 28rpx; font-weight: 700; color: $ink; opacity: 0; }

.scroll { flex: 1; }
.cover { height: 480rpx; position: relative; overflow: hidden; color: #fff;
    background: linear-gradient(165deg, #0c1a24 0%, #123a57 52%, #0a5c86 100%); display: flex; flex-direction: column; align-items: center; }
.grain { position: absolute; inset: 0; opacity: .8;
    background: radial-gradient(2rpx 2rpx at 24% 34%, #fff, transparent), radial-gradient(2rpx 2rpx at 66% 22%, #bfe9ff, transparent), radial-gradient(2rpx 2rpx at 82% 52%, #fff, transparent), radial-gradient(2rpx 2rpx at 44% 66%, #fff, transparent); }
/* 高度写死跟 .cover 一致的 480rpx，不依赖 swiper/swiper-item 的百分比继承——
   百分比高度在真机上偶发不生效（模拟器里往往正常），写死数值才稳。 */
.coverswiper { position: absolute; inset: 0; width: 100%; height: 480rpx; }
.coverimg { display: block; width: 100%; height: 480rpx; }
/* 图上叠一层深色渐变，保证顶部/底部文字与指示点在真实照片背景下依然可读。
   这几个都是纯展示的覆盖层，不需要接收点击——不加 pointer-events:none 的话它们会
   挡在 swiper 图片上面，点封面图永远点不到图，只能点到这层空气。 */
.coverscrim { position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(180deg, rgba(6,14,20,.55) 0%, rgba(6,14,20,.1) 42%, rgba(6,14,20,.6) 100%); }
.cmeta { position: relative; z-index: 1; text-align: center; margin-top: 20rpx; pointer-events: none; padding: 0 30rpx; }
.cvol { display: block; font-size: 30rpx; font-weight: 700; }
.cline { display: block; font-size: 21rpx; opacity: .85; margin-top: 10rpx; }
.cbike { position: relative; z-index: 1; font-size: 150rpx; margin-top: 40rpx; filter: drop-shadow(0 0 30rpx rgba(111,208,255,.6)); pointer-events: none; }
.dots { position: absolute; bottom: 40rpx; display: flex; gap: 10rpx; pointer-events: none; }
.pmark { position: absolute; right: 24rpx; z-index: 2; pointer-events: none; }
.dot { width: 12rpx; height: 12rpx; border-radius: 50%; background: rgba(255,255,255,.45); }
.dot.on { width: 32rpx; border-radius: 6rpx; background: $green; }

.sheet { position: relative; margin-top: -40rpx; background: $card; border-radius: 40rpx 40rpx 0 0; padding: 36rpx 30rpx 0; }

.infocard { background: $paper; border-radius: 26rpx; padding: 26rpx; margin-top: 26rpx; }
.irow { display: flex; gap: 20rpx; align-items: flex-start; }
.irow.bt { margin-top: 24rpx; padding-top: 24rpx; border-top: 1rpx solid $line; }
/* "路线信息"行是 v-if 条件展示的，不显示时"集合地点"就变成第一行——不管谁排第一，
   第一行都不该带上面那条分隔线，不然会在卡片顶部凭空多一条线 */
.infocard .irow:first-child { margin-top: 0; padding-top: 0; border-top: 0; }
.iic { font-size: 30rpx; width: 36rpx; }
.ik { display: block; font-size: 21rpx; color: $muted; font-weight: 700; }
.iv { display: block; font-size: 27rpx; font-weight: 700; margin-top: 6rpx; }
.routecopy { flex: none; align-self: center; font-size: 21rpx; font-weight: 800; color: $green-deep; background: $green-soft; padding: 8rpx 18rpx; border-radius: 12rpx; }
.mapbox { margin-top: 20rpx; }
.people { display: flex; align-items: center; margin-top: 18rpx; }
.pav { width: 64rpx; height: 64rpx; border-radius: 50%; border: 3rpx solid #fff; }
.pcnt { margin-left: 22rpx; font-size: 25rpx; font-weight: 800; }

.sec { display: block; font-size: 30rpx; font-weight: 800; margin: 32rpx 0 18rpx; }
.safe3 { display: flex; gap: 14rpx; }
.safe { flex: 1; border-radius: 22rpx; padding: 22rpx 18rpx; }
.safe.s1 { background: #fbf1e4; } .safe.s2 { background: #e9f1fb; } .safe.s3 { background: $green-soft; }
.st { display: block; font-size: 23rpx; font-weight: 800; }
.safe.s1 .st { color: #b5750c; } .safe.s2 .st { color: #2b6bb5; } .safe.s3 .st { color: $green-deep; }
.sp { display: block; font-size: 20rpx; line-height: 1.5; color: $ink-2; margin-top: 14rpx; }

.ptip { margin-top: 24rpx; background: $green-soft; border-radius: 20rpx; padding: 20rpx 24rpx; font-size: 23rpx; color: $green-deep; display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; }
.ptip .pv { font-weight: 800; font-size: 30rpx; }

.rfwrap { margin-top: 24rpx; }
/* 一键 SOS 悬浮按钮 */
.sosfab { position: fixed; right: 26rpx; z-index: 28; width: 108rpx; height: 108rpx; border-radius: 50%;
    background: linear-gradient(135deg, #ff6a5a, #e0331f); box-shadow: 0 14rpx 30rpx -8rpx rgba(224,51,31,.7);
    display: flex; flex-direction: column; align-items: center; justify-content: center; }
.sosi { font-size: 40rpx; line-height: 1.1; }
.sost { font-size: 18rpx; font-weight: 800; color: #fff; margin-top: 2rpx; }

.feelbox { margin-top: 24rpx; background: $card; border-radius: 22rpx; padding: 24rpx 26rpx; box-shadow: inset 0 0 0 1rpx $hair; }
.feelt { display: block; font-size: 26rpx; font-weight: 800; }
.feelchips { display: flex; flex-wrap: wrap; gap: 12rpx; margin-top: 18rpx; }
.fchip { font-size: 22rpx; font-weight: 700; padding: 12rpx 22rpx; border-radius: 18rpx; background: $paper; color: $ink-2; }
.fchip.on { background: $green; color: #04140c; font-weight: 800; }
.feelgo { margin-top: 20rpx; height: 78rpx; border-radius: 20rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c; font-weight: 800; font-size: 25rpx; display: flex; align-items: center; justify-content: center; }
.feeldone { margin-top: 24rpx; font-size: 22rpx; color: $green-deep; font-weight: 700; background: $green-soft; border-radius: 18rpx; padding: 20rpx; text-align: center; }

.howto { display: flex; flex-direction: column; gap: 18rpx; }
.role { display: flex; align-items: center; gap: 16rpx; font-size: 25rpx; }
.rk { width: 110rpx; color: $muted; font-weight: 700; font-size: 22rpx; }
.who { font-weight: 700; flex: 1; }
.rchip { font-size: 19rpx; font-weight: 800; padding: 5rpx 14rpx; border-radius: 12rpx; background: $paper; color: $ink-2; }
.rchip.lead { background: $green-soft; color: $green-deep; }

/* 城市小小宣传官：这块要真实头像（领队阵容那几行是纯文字，没有头像元素可复用） */
.amb { margin-top: 24rpx; background: $paper; border-radius: 22rpx; padding: 22rpx 24rpx; }
.ambt { display: block; font-size: 23rpx; font-weight: 800; color: $ink-2; }
.amblist { display: flex; flex-wrap: wrap; gap: 24rpx; margin-top: 18rpx; }
.ambitem { display: flex; flex-direction: column; align-items: center; width: 110rpx; }
.ambav { width: 76rpx; height: 76rpx; border-radius: 50%; background-size: cover; background-position: center;
    background-image: linear-gradient(135deg, #ffd36e, #ff8f6e); box-shadow: 0 0 0 3rpx rgba(255,193,77,.35); }
.ambn { max-width: 110rpx; font-size: 20rpx; color: $ink-2; margin-top: 10rpx; text-align: center; }
.desc { display: block; margin-top: 18rpx; font-size: 24rpx; color: $ink-2; line-height: 1.7; }
.risk { margin-top: 24rpx; background: #fbf7e8; border-radius: 18rpx; padding: 20rpx; display: flex; gap: 12rpx; }
.ri { font-size: 26rpx; } .rt { flex: 1; font-size: 22rpx; color: #8a6d1a; line-height: 1.6; }
.insnotice { margin-top: 24rpx; background: #eef3fb; border-radius: 18rpx; padding: 20rpx; display: flex; gap: 12rpx; }
.insnotice .rt { color: #2b6bb5; }
.leadentry, .reuse, .cancelentry { display: flex; align-items: center; gap: 16rpx; margin-top: 24rpx; background: $night-1; border-radius: 22rpx; padding: 24rpx; }
.reuse { background: linear-gradient(120deg, $green-deep, #0a7d52); }
.cancelentry { background: rgba(224,83,61,.1); box-shadow: inset 0 0 0 1rpx rgba(224,83,61,.3); color: #e0533d; }
.cancelentry .le-t1, .cancelentry .le-arw { color: #e0533d; }
.cancelentry .le-t2 { color: rgba(224,83,61,.7); }
.cancelentry.off { opacity: .55; }
.le-i { font-size: 34rpx; }
.le-t { flex: 1; }
.le-t1 { display: block; color: #fff; font-size: 27rpx; font-weight: 800; }
.le-t2 { display: block; color: rgba(255,255,255,.6); font-size: 20rpx; margin-top: 4rpx; }
.le-arw { color: $green; font-size: 34rpx; font-weight: 800; }
.safe-bottom { height: 40rpx; }

.cta { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; display: flex; align-items: center; gap: 22rpx; padding: 18rpx 30rpx 0; border-top: 1rpx solid $hair; background: $card; box-shadow: 0 -8rpx 24rpx -10rpx rgba(9,20,15,.16); }
.qa { display: flex; flex-direction: column; align-items: center; gap: 4rpx; font-size: 19rpx; color: $muted; font-weight: 600;
    background: transparent; border: none; padding: 0; margin: 0; line-height: normal; }
.qa::after { border: none; }
.qa .qi { font-size: 34rpx; }
.go { flex: 1; height: 96rpx; border-radius: 30rpx; background: linear-gradient(120deg, $green, $green-deep); color: #04140c;
    display: flex; flex-direction: column; align-items: center; justify-content: center; }
.go.off { background: #d7ddda; color: #8a968f; }
.go .gt { font-weight: 800; font-size: 30rpx; }
.go .gs { font-size: 19rpx; opacity: .8; margin-top: 2rpx; }

/* 已报名：签到 + 加群二维码 双按钮 */
.go2 { flex: 1; height: 96rpx; border-radius: 30rpx; display: flex; align-items: center; justify-content: center; gap: 10rpx;
    background: linear-gradient(120deg, $green, $green-deep); color: #04140c; }
.go2 .gt { font-weight: 800; font-size: 29rpx; }
.go2 .gi2 { font-size: 30rpx; }
.go2.done { background: $green-soft; color: $green-deep; box-shadow: inset 0 0 0 2rpx rgba(11,169,104,.35); }
.go2.off { background: #d7ddda; color: #8a968f; }
.go2.group { background: $night-1; color: #fff; }

/* 加群二维码弹层 */
.qrmask { position: fixed; inset: 0; z-index: 50; background: rgba(9,20,15,.6); display: flex; align-items: center; justify-content: center; }
.qrbox { width: 560rpx; background: $card; border-radius: 34rpx; padding: 44rpx 40rpx 34rpx; text-align: center; }
.qrt { display: block; font-size: 30rpx; font-weight: 800; }
.qrsub { display: block; font-size: 21rpx; color: $muted; line-height: 1.6; margin-top: 14rpx; }
.qrimg { width: 380rpx; height: 380rpx; margin: 28rpx auto 0; border-radius: 20rpx; background: $paper; box-shadow: inset 0 0 0 1rpx $hair; }
.qrh { display: block; font-size: 22rpx; color: $ink-2; margin-top: 20rpx; }
.qrclose { margin-top: 30rpx; height: 84rpx; border-radius: 24rpx; background: $paper; color: $ink; font-size: 27rpx; font-weight: 800;
    display: flex; align-items: center; justify-content: center; }

.sosmask { position: fixed; inset: 0; z-index: 55; background: rgba(9,20,15,.62); display: flex; align-items: center; justify-content: center; }
.sosbox { width: 590rpx; background: $card; border-radius: 34rpx; padding: 40rpx 36rpx 32rpx; }
.sosttl { display: block; font-size: 32rpx; font-weight: 800; color: #d9442e; text-align: center; }
.sostip { display: block; font-size: 22rpx; color: $ink-2; line-height: 1.6; margin-top: 14rpx; text-align: center; }
.sosrow { display: flex; align-items: flex-start; gap: 16rpx; background: $paper; border-radius: 18rpx; padding: 20rpx 22rpx; margin-top: 16rpx; }
.sosrow.tap { box-shadow: inset 0 0 0 1rpx $line; }
.sosk { flex: none; width: 150rpx; font-size: 23rpx; color: $muted; font-weight: 700; }
.sosv { flex: 1; min-width: 0; font-size: 24rpx; font-weight: 800; color: $ink; line-height: 1.5; }
.sosmap { font-size: 20rpx; font-weight: 800; color: $green-deep; }
.soscall { height: 88rpx; border-radius: 22rpx; display: flex; align-items: center; justify-content: center; font-size: 28rpx; font-weight: 800; margin-top: 18rpx; }
.soscall.lead { background: linear-gradient(120deg, $green, $green-deep); color: #04140c; }
.soscall.danger { background: #fdecea; color: #d9442e; }
.sosclose { display: block; text-align: center; color: $muted; font-size: 24rpx; padding: 24rpx 0 6rpx; }
</style>
