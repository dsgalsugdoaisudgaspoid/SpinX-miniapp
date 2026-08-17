<template>
    <view class="mp">
        <!-- ① 学生证：照片 + 姓名 + 年级 + 学号 + 入学时间 -->
        <view class="head" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>

            <view class="idcard">
                <view class="av" :style="{ backgroundImage: p.avatar ? ('url(' + p.avatar + ')') : '' }"></view>
                <view class="who">
                    <text class="nick">{{ p.nickname ? spx(p.nickname) : '骑友' }}</text>
                    <view class="badges">
                        <text class="bd tier">{{ tierIcon }} {{ p.memberTierName || '星星' }}</text>
                        <text v-for="r in roleLabels" :key="r" class="bd role">{{ r }}</text>
                    </view>
                    <text v-if="p.spinxNo" class="no mono">学号 {{ p.spinxNo }}</text>
                    <text v-else-if="isSelf" class="noapply" @tap="goApply">还没有学号，去申请 ›</text>
                </view>
            </view>

            <view class="metaline">
                <text v-if="p.joinedText" class="mi">🎒 入学 {{ p.joinedText }}</text>
                <text v-if="p.city" class="mi">📍 {{ p.city }}</text>
                <text v-if="p.ridingYears" class="mi">🚲 骑龄 {{ p.ridingYears }} 年</text>
            </view>

            <view v-if="(p.cyclingTags || []).length" class="tags">
                <text v-for="t in p.cyclingTags" :key="t.titleId" class="tag">{{ t.icon }} {{ t.name }}</text>
            </view>
        </view>

        <!-- ② SpinX 履历 -->
        <view class="card">
            <text class="ct">SpinX 履历</text>
            <text class="csub" v-if="p.joinDate">{{ joinMonthText }} 入学 SpinX</text>
            <view class="stats">
                <view class="stat">
                    <text class="sn mono">{{ stats.activityCount || 0 }}</text>
                    <text class="sl">参加活动</text>
                </view>
                <view class="stat">
                    <text class="sn mono">{{ stats.coRiderCount || 0 }}</text>
                    <text class="sl">同行伙伴</text>
                </view>
                <view class="stat">
                    <text class="sn mono">{{ stats.routeCount || 0 }}</text>
                    <text class="sl">完成路线</text>
                </view>
            </view>
        </view>

        <!-- ③ 骑行伙伴 -->
        <view class="card">
            <text class="ct">🤝 骑行伙伴</text>
            <text class="csub">一起骑过车的人，才是真的同过窗</text>
            <view v-if="(p.coRiders || []).length" class="mates">
                <view v-for="m in p.coRiders" :key="m.userId" class="mate" :data-id="m.userId" @tap="goMember">
                    <view class="mav" :style="{ backgroundImage: m.avatar ? ('url(' + m.avatar + ')') : '' }"></view>
                    <text class="mn ellipsis">{{ spx(m.nickname) }}</text>
                    <text class="mc mono">同行 {{ m.rideCount }} 次</text>
                </view>
            </view>
            <text v-else class="empty">还没有一起骑过车的同学，参加一场活动就有了</text>
        </view>

        <!-- ④ 社区成就 -->
        <view class="card">
            <view class="crow">
                <text class="ct">🏆 社区成就</text>
                <text class="cnum">{{ (p.achievements || []).length }} 项</text>
            </view>
            <view v-if="(p.achievements || []).length" class="acs">
                <view v-for="a in p.achievements" :key="a.achievementId" :class="['ac', a.tier]">
                    <text class="aci">{{ a.icon }}</text>
                    <view class="acx">
                        <text class="acn">{{ a.name }}</text>
                        <text class="acd ellipsis">{{ a.description }}</text>
                    </view>
                </view>
            </view>
            <text v-else class="empty">还没有解锁成就</text>
        </view>

        <!-- ⑤ 骑行记忆 -->
        <view class="card">
            <text class="ct">📔 骑行记忆</text>
            <text class="csub">在 SpinX 走过的路</text>
            <view v-if="(p.memories || []).length" class="mems">
                <view v-for="m in p.memories" :key="m.activityId" class="mem" :data-id="m.activityId" @tap="goActivity">
                    <view class="mposter" :style="{ backgroundImage: m.poster ? ('url(' + m.poster + ')') : '' }">
                        <text v-if="!m.poster" class="mpi">🚴</text>
                    </view>
                    <view class="mtx">
                        <text class="mt ellipsis-2">{{ m.title }}</text>
                        <text class="md mono">{{ fmt(m.startTime).full }}</text>
                    </view>
                    <text class="marw">›</text>
                </view>
            </view>
            <text v-else class="empty">还没有参加过活动</text>
        </view>

        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { getMemberProfile } from '@/api/memberNumber.js'
import { currentUser } from '@/store/user.js'
import { statusBarHeight, fmtTime, spxName, goMemberProfile } from '@/common/util.js'
import { tierOf } from '@/common/config.js'

export default {
    data() { return { statusBar: 20, userId: null, p: {}, loading: false } },
    computed: {
        isSelf() {
            const me = currentUser()
            return !!(me && String(me.userId) === String(this.userId))
        },
        stats() { return this.p.stats || {} },
        // 等级图标（⭐/🌙/☀️）与全站共用 config.js 的同一份定义
        tierIcon() { return tierOf(this.p.memberTier).icon },
        roleLabels() {
            const map = { leader: '领队', photographer: '摄影师', coach: '陪练', admin: '管理员' }
            return (this.p.roles || []).filter(r => r !== 'member').map(r => map[r]).filter(Boolean)
        },
        // joinDate 是 'YYYY-MM-DD'，直接取年月；不能用 fmtTime().md，那个是「月.日」
        joinMonthText() {
            const m = String(this.p.joinDate || '').match(/^(\d{4})-(\d{2})/)
            return m ? `${m[1]} 年 ${Number(m[2])} 月` : ''
        }
    },
    onLoad(q) {
        // 不带 userId 就是看自己，这样「我的学生证」和「别人的学生证」共用同一个页面
        const me = currentUser()
        this.userId = (q && q.userId) ? q.userId : (me && me.userId)
    },
    onShow() { this.statusBar = statusBarHeight(); this.load() },
    methods: {
        spx(n) { return spxName(n) },
        fmt(t) { return fmtTime(t) },
        back() { const s = getCurrentPages(); s.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/profile/profile' }) },
        async load() {
            if (!this.userId) { uni.showToast({ title: '请先登录', icon: 'none' }); return }
            this.loading = true
            try { this.p = await getMemberProfile(this.userId) || {} } catch (e) { this.p = {} } finally { this.loading = false }
        },
        goMember(e) {
            const id = e.currentTarget.dataset.id
            // 点自己不用再跳一层
            if (String(id) === String(this.userId)) return
            goMemberProfile(id)
        },
        goActivity(e) { uni.navigateTo({ url: '/pages/activity/detail?id=' + e.currentTarget.dataset.id }) },
        goApply() { uni.navigateTo({ url: '/pages/identity/member-number' }) }
    }
}
</script>

<style lang="scss" scoped>
.mp { min-height: 100vh; background: $paper; }

/* ① 身份卡 */
.head { padding: 0 34rpx 40rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, $night-1, $night-2 60%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 14%, #fff, transparent); }
.nav { position: relative; height: 64rpx; }
.nbtn { width: 64rpx; height: 64rpx; border-radius: 50%; background: rgba(255,255,255,.14);
    display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; }
.idcard { position: relative; display: flex; align-items: center; gap: 24rpx; margin-top: 12rpx; }
.av { width: 132rpx; height: 132rpx; border-radius: 50%; flex: none; background-size: cover; background-position: center;
    background-color: rgba(255,255,255,.16); box-shadow: 0 0 0 4rpx rgba(255,255,255,.2); }
.who { flex: 1; min-width: 0; }
.nick { display: block; font-size: 40rpx; font-weight: 800; }
.badges { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 12rpx; }
.bd { font-size: 19rpx; font-weight: 800; padding: 5rpx 14rpx; border-radius: 10rpx; }
.bd.tier { background: $green; color: #04140c; }
.bd.role { background: rgba(255,255,255,.18); color: #fff; }
.no { display: block; font-size: 23rpx; margin-top: 12rpx; opacity: .9; letter-spacing: 2rpx; }
.noapply { display: block; font-size: 22rpx; margin-top: 12rpx; color: $green; font-weight: 700; }
.metaline { position: relative; display: flex; flex-wrap: wrap; gap: 20rpx; margin-top: 24rpx; }
.mi { font-size: 21rpx; opacity: .85; }
.tags { position: relative; display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 18rpx; }
.tag { font-size: 20rpx; font-weight: 700; background: rgba(255,255,255,.16); padding: 7rpx 16rpx; border-radius: 12rpx; }

/* 卡片通用 */
.card { margin: 20rpx 24rpx 0; background: $card; border-radius: 26rpx; padding: 28rpx;
    box-shadow: inset 0 0 0 1rpx $hair; }
.card:first-of-type { margin-top: -20rpx; position: relative; z-index: 2;
    box-shadow: 0 14rpx 34rpx -20rpx rgba(9,20,15,.4), inset 0 0 0 1rpx $hair; }
.crow { display: flex; align-items: baseline; }
.ct { font-size: 28rpx; font-weight: 800; flex: 1; }
.cnum { font-size: 21rpx; color: $muted; font-weight: 700; }
.csub { display: block; font-size: 21rpx; color: $muted; margin-top: 8rpx; line-height: 1.5; }
.empty { display: block; font-size: 22rpx; color: $faint; padding: 30rpx 0 10rpx; text-align: center; }

/* ② 历程 */
.stats { display: flex; margin-top: 24rpx; }
.stat { flex: 1; text-align: center; }
.sn { display: block; font-size: 46rpx; font-weight: 800; color: $green-deep; letter-spacing: -1rpx; }
.sl { display: block; font-size: 21rpx; color: $muted; margin-top: 8rpx; }

/* ③ 骑行伙伴 */
.mates { display: flex; flex-wrap: wrap; gap: 20rpx; margin-top: 22rpx; }
.mate { width: calc(25% - 15rpx); text-align: center; }
.mav { width: 92rpx; height: 92rpx; border-radius: 50%; margin: 0 auto; background-size: cover; background-position: center;
    background-color: $paper; box-shadow: inset 0 0 0 1rpx $hair; }
.mn { display: block; font-size: 21rpx; font-weight: 700; margin-top: 10rpx; }
.mc { display: block; font-size: 18rpx; color: $muted; margin-top: 4rpx; }

/* ④ 成就 */
.acs { display: flex; flex-direction: column; gap: 14rpx; margin-top: 22rpx; }
.ac { display: flex; align-items: center; gap: 18rpx; background: $paper; border-radius: 18rpx; padding: 18rpx 20rpx; }
.ac.gold { background: #fdf6e3; }
.ac.silver { background: #f2f5f7; }
.aci { font-size: 38rpx; flex: none; }
.acx { flex: 1; min-width: 0; }
.acn { display: block; font-size: 25rpx; font-weight: 800; }
.acd { display: block; font-size: 20rpx; color: $muted; margin-top: 5rpx; }

/* ⑤ 记忆 */
.mems { margin-top: 22rpx; }
.mem { display: flex; align-items: center; gap: 20rpx; padding: 18rpx 0; border-top: 1rpx solid $hair; }
.mem:first-child { border-top: 0; padding-top: 4rpx; }
.mposter { width: 108rpx; height: 108rpx; border-radius: 18rpx; flex: none; background-size: cover; background-position: center;
    background-color: $night-2; display: flex; align-items: center; justify-content: center; }
.mpi { font-size: 44rpx; }
.mtx { flex: 1; min-width: 0; }
.mt { display: block; font-size: 26rpx; font-weight: 700; line-height: 1.4; }
.md { display: block; font-size: 20rpx; color: $muted; margin-top: 8rpx; }
.marw { flex: none; color: $faint; font-size: 30rpx; }
.safe-bottom { height: 60rpx; }
</style>
