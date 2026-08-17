<template>
    <view class="ms">
        <view class="head" :style="{ paddingTop: (statusBar + 24) + 'px' }">
            <view class="stars"></view>
            <view class="nav"><view class="nbtn" @tap="back">‹</view></view>
            <text class="eye">FIND CLASSMATE · 找同学</text>
            <text class="ht">输入学号，找到 TA</text>

            <view class="sbox">
                <input class="si mono" type="number" maxlength="5" v-model="keyword"
                    placeholder="如 00025" placeholder-class="sph" confirm-type="search" @confirm="doSearch" />
                <text class="sbtn" @tap="doSearch">查找</text>
            </view>
        </view>

        <!-- 命中 -->
        <view v-if="member" class="card hit" @tap="openProfile">
            <view class="av" :style="{ backgroundImage: member.avatar ? ('url(' + member.avatar + ')') : '' }"></view>
            <view class="hx">
                <text class="hn">{{ spx(member.nickname) }}</text>
                <text class="hno mono">学号 {{ member.spinxNo }}</text>
            </view>
            <text class="harw">›</text>
        </view>

        <!-- 查无此号 -->
        <view v-else-if="searched" class="empty">
            <text class="ei">🔍</text>
            <text class="et">没有找到学号 {{ lastQuery }}</text>
            <text class="es">确认一下号码是否输错了，或者向 TA 本人再要一次</text>
        </view>

        <!-- 初始说明 -->
        <view v-else class="tips">
            <text class="tt">怎么拿到别人的学号？</text>
            <text class="tl">· 在活动、动态、榜单里点开 TA 的头像就能看到</text>
            <text class="tl">· 也可以直接问 TA 本人</text>
            <text class="tl">· 你自己的学号在「我的 → 我的学号」里</text>
        </view>

        <view class="safe-bottom"></view>
    </view>
</template>

<script>
import { searchMember } from '@/api/memberNumber.js'
import { statusBarHeight, spxName, goMemberProfile } from '@/common/util.js'

export default {
    data() { return { statusBar: 20, keyword: '', member: null, searched: false, lastQuery: '', loading: false } },
    onLoad() { this.statusBar = statusBarHeight() },
    methods: {
        spx(n) { return spxName(n) },
        back() { const p = getCurrentPages(); p.length > 1 ? uni.navigateBack() : uni.switchTab({ url: '/pages/home/home' }) },
        async doSearch() {
            const q = String(this.keyword || '').trim()
            if (!q) { uni.showToast({ title: '请输入学号', icon: 'none' }); return }
            // 学号固定 5 位且可能带前导零，用户只输 "25" 时自动补零，省得他们数位数
            const no = q.padStart(5, '0')
            this.loading = true
            try {
                const d = await searchMember(no)
                this.member = (d && d.found) ? d.member : null
                this.lastQuery = no
                this.searched = true
            } catch (e) { this.member = null; this.searched = true } finally { this.loading = false }
        },
        openProfile() { if (this.member) goMemberProfile(this.member.userId) }
    }
}
</script>

<style lang="scss" scoped>
.ms { min-height: 100vh; background: $paper; }
.head { padding: 0 34rpx 46rpx; color: #fff; position: relative; overflow: hidden;
    background: linear-gradient(155deg, $night-1, $night-2 60%, $night-3); }
.stars { position: absolute; inset: 0; opacity: .5;
    background: radial-gradient(2rpx 2rpx at 20% 30%, #fff, transparent), radial-gradient(2rpx 2rpx at 72% 22%, #cdefff, transparent), radial-gradient(3rpx 3rpx at 54% 14%, #fff, transparent); }
.nav { position: relative; height: 64rpx; }
.nbtn { width: 64rpx; height: 64rpx; border-radius: 50%; background: rgba(255,255,255,.14);
    display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #fff; }
.eye { position: relative; display: block; font-size: 19rpx; letter-spacing: 2rpx; opacity: .85; margin-top: 8rpx; }
.ht { position: relative; display: block; font-size: 40rpx; font-weight: 800; margin-top: 14rpx; }
.sbox { position: relative; display: flex; align-items: center; gap: 16rpx; margin-top: 26rpx;
    background: rgba(255,255,255,.14); border-radius: 22rpx; padding: 8rpx 8rpx 8rpx 26rpx; }
.si { flex: 1; height: 76rpx; font-size: 34rpx; color: #fff; letter-spacing: 6rpx; }
.sph { color: rgba(255,255,255,.45); letter-spacing: 4rpx; }
.sbtn { flex: none; height: 76rpx; line-height: 76rpx; padding: 0 32rpx; border-radius: 18rpx;
    background: $green; color: #04140c; font-size: 26rpx; font-weight: 800; }

.card { margin: -22rpx 24rpx 0; background: $card; border-radius: 26rpx; padding: 26rpx; position: relative; z-index: 2;
    box-shadow: 0 14rpx 34rpx -20rpx rgba(9,20,15,.4), inset 0 0 0 1rpx $hair; }
.hit { display: flex; align-items: center; gap: 22rpx; }
.av { width: 96rpx; height: 96rpx; border-radius: 50%; flex: none; background-size: cover; background-position: center;
    background-color: $paper; box-shadow: inset 0 0 0 1rpx $hair; }
.hx { flex: 1; min-width: 0; }
.hn { display: block; font-size: 30rpx; font-weight: 800; }
.hno { display: block; font-size: 22rpx; color: $green-deep; font-weight: 700; margin-top: 8rpx; letter-spacing: 2rpx; }
.harw { flex: none; color: $faint; font-size: 34rpx; }

.empty { margin-top: 60rpx; display: flex; flex-direction: column; align-items: center; gap: 14rpx; padding: 0 60rpx; }
.ei { font-size: 70rpx; }
.et { font-size: 27rpx; font-weight: 700; }
.es { font-size: 22rpx; color: $muted; text-align: center; line-height: 1.6; }

.tips { margin: 40rpx 34rpx 0; }
.tt { display: block; font-size: 25rpx; font-weight: 800; }
.tl { display: block; font-size: 22rpx; color: $muted; line-height: 2; margin-top: 6rpx; }
.safe-bottom { height: 60rpx; }
</style>
