<template>
  <view class="create">
    <view class="group">
      <view class="frow col noline">
        <text class="fk">活动宣传图 <text class="req">*</text></text>
        <text class="hint"
          >不是路书 /
          路线截图，是给这场活动配的展示图，会显示在活动列表和详情页封面，至少上传一张才能发布</text
        >
        <view class="imgs">
          <view v-for="(im, i) in f.routeImages" :key="i" class="im">
            <image class="pic" :src="im" mode="aspectFill"></image>
            <text class="del" :data-i="i" @tap="removeImg">✕</text>
          </view>
          <view v-if="f.routeImages.length < 9" class="add" @tap="chooseImgs"
            ><text class="addi">＋</text
            ><text class="addt">添加图片</text></view
          >
        </view>
      </view>
    </view>

    <view class="group">
      <view class="frow"
        ><text class="fk">活动名称</text
        ><input
          class="fi"
          v-model="f.title"
          placeholder="如 夜游浣花溪"
          placeholder-class="ph"
      /></view>
      <view class="frow col">
        <text class="fk">活动介绍</text>
        <textarea
          class="ta"
          v-model="f.description"
          placeholder="路线亮点、强度、注意事项…"
          placeholder-class="ph"
          maxlength="500"
        />
      </view>
    </view>

    <view class="group">
      <view class="frow"
        ><text class="fk">出发日期</text
        ><picker
          class="pk"
          mode="date"
          :value="f.startDate"
          data-key="startDate"
          @change="onPick"
          ><text :class="['fv', f.startDate ? '' : 'phc']">{{
            f.startDate || "选择日期"
          }}</text></picker
        ></view
      >
      <view class="frow"
        ><text class="fk">出发时间</text
        ><picker
          class="pk"
          mode="time"
          :value="f.startTime"
          data-key="startTime"
          @change="onPick"
          ><text :class="['fv', f.startTime ? '' : 'phc']">{{
            f.startTime || "选择时间"
          }}</text></picker
        ></view
      >
      <view class="frow noline"
        ><text class="fk">结束时间</text
        ><picker
          class="pk"
          mode="time"
          :value="f.endTime"
          data-key="endTime"
          @change="onPick"
          ><text :class="['fv', f.endTime ? '' : 'phc']">{{
            f.endTime || "选择时间"
          }}</text></picker
        ></view
      >
      <text class="hint"
        >报名截止时间默认为出发当天的出发时刻，无需单独设置</text
      >
    </view>

    <view class="group">
      <view class="frow"
        ><text class="fk">集合地点</text>
        <text :class="['fv', f.meetingPoint ? '' : 'phc']">{{
          f.meetingPoint || "未选择"
        }}</text>
        <text class="pickbtn" data-kind="meeting" @tap="pickLocation"
          >📍 地图选点</text
        >
      </view>
      <view class="frow"
        ><text class="fk">目的地</text>
        <text :class="['fv', f.disbandPoint ? '' : 'phc']">{{
          f.disbandPoint || "未选择"
        }}</text>
        <text class="pickbtn" data-kind="disband" @tap="pickLocation"
          >📍 地图选点</text
        >
      </view>
      <text class="hint"
        >终点决定这场活动会点亮「城市记忆」地图上的哪个地方，建议填写</text
      >
      <view class="frow"
        ><text class="fk">骑行里程</text
        ><input
          class="fi"
          type="number"
          v-model="f.distance"
          placeholder="km"
          placeholder-class="ph"
      /></view>
      <view class="frow"
        ><text class="fk">路线爬升</text
        ><input
          class="fi"
          type="number"
          v-model="f.elevation"
          placeholder="m，选填"
          placeholder-class="ph"
      /></view>
      <view class="frow"
        ><text class="fk">难度星级</text
        ><picker
          class="pk"
          :range="difficulties"
          :value="f.difficulty - 1"
          @change="onDifficulty"
          ><text class="fv">{{ starText }}</text></picker
        ></view
      >
      <view class="frow noline"
        ><text class="fk">人数上限</text
        ><input
          class="fi"
          type="number"
          v-model="f.maxParticipants"
          placeholder="如 25"
          placeholder-class="ph"
      /></view>
    </view>

    <view class="group">
      <view class="frow col noline">
        <text class="fk">路书码表</text>
        <view class="linklist" v-if="f.routeLinks.length">
          <view v-for="(l, i) in f.routeLinks" :key="i" class="linkrow">
            <text class="lb">{{ l.brand }}</text>
            <text class="lv ellipsis flex1">{{
              l.externalId || "未填 ID"
            }}</text>
            <text class="ldel" :data-i="i" @tap="removeRouteLink">✕</text>
          </view>
        </view>
        <text class="addlink" @tap="addRouteLink">＋ 添加平台</text>
        <text class="hint"
          >可同时绑定多个平台（如迈金 +
          Strava）；没有也没关系，发起后随时可以在「报名管理」里补录</text
        >
      </view>
    </view>

    <view class="group">
      <view class="frow col noline">
        <text class="fk">群二维码</text>
        <view class="imgs">
          <view v-if="f.groupQrcode" class="im">
            <image class="pic" :src="f.groupQrcode" mode="aspectFill"></image>
            <text class="del" @tap="removeGroupQr">✕</text>
          </view>
          <view v-else class="add" @tap="chooseGroupQr"
            ><text class="addi">＋</text
            ><text class="addt">上传二维码</text></view
          >
        </view>
        <text class="hint"
          >报名成功的会员会在活动详情页看到「加群二维码」，扫码进群</text
        >
      </view>
    </view>

    <view class="group">
      <view class="frow col">
        <text class="fk">活动类型 <text class="req">*</text></text>
        <view class="chips">
          <text
            v-for="t in tagOpts"
            :key="t"
            :class="['chip', f.tags.includes(t) ? 'on' : '']"
            @tap="toggleTag(t)"
            >{{ t }}</text
          >
        </view>
      </view>
      <view class="frow noline"
        ><text class="fk">线下费用</text
        ><input
          class="fi"
          type="number"
          v-model="f.fee"
          placeholder="0 为免费"
          placeholder-class="ph"
      /></view>
    </view>

    <view class="group">
      <view class="frow noline"
        ><text class="fk flex1">自动通过报名</text
        ><switch
          :checked="f.approvalMode === 'auto'"
          color="#12d07a"
          @change="onApproval"
      /></view>
    </view>

    <view class="g-btn submit" @tap="submit">发布活动</view>
    <view class="safe-bottom"></view>
  </view>
</template>

<script>
import { createActivity } from "@/api/activity.js";
import { reverseGeocode } from "@/common/util.js";
import { BASE_URL, API_PREFIX } from "@/common/config.js";

export default {
  data() {
    return {
      difficulties: ["★", "★★", "★★★", "★★★★", "★★★★★"],
      tagOpts: ["休闲骑", "拉练", "公益骑", "亲子骑", "跨城骑", "新手友好"],
      // 路书码表品牌：可选，随时可在「报名管理」里补录，不预设死名单——选"其它"时改成自定义品牌名
      brandOpts: ["迈金 Magene", "佳明 Garmin", "IGPSport", "Strava", "其它"],
      f: {
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endTime: "",
        meetingPoint: "",
        meetingLatitude: null,
        meetingLongitude: null,
        disbandPoint: "",
        disbandLatitude: null,
        disbandLongitude: null,
        distance: "",
        elevation: "",
        difficulty: 2,
        maxParticipants: 25,
        tags: [],
        routeImages: [],
        groupQrcode: "",
        routeLinks: [],
        fee: 0,
        approvalMode: "auto",
      },
    };
  },
  computed: {
    starText() {
      return "★".repeat(this.f.difficulty);
    },
  },
  onLoad(q) {
    // 复用路线：从往期活动详情带来的模板预填（不含日期/时间，需领队重新选）
    if (q && q.reuse) {
      const tpl = uni.getStorageSync("reuseRouteTpl");
      uni.removeStorageSync("reuseRouteTpl");
      if (tpl) {
        Object.keys(tpl).forEach((k) => {
          if (tpl[k] !== undefined && tpl[k] !== null && k in this.f)
            this.f[k] = tpl[k];
        });
        uni.showToast({ title: "已复用路线，请设置时间", icon: "none" });
      }
    }
  },
  methods: {
    onPick(e) {
      this.f[e.currentTarget.dataset.key] = e.detail.value;
    },
    /**
     * 地图选点：回填名称与坐标。终点坐标决定这场活动点亮城市记忆地图上的哪个地方。
     *
     * 地点名三级取值：
     *   1) r.name    —— 选中 POI 时微信直接给的名称（最常见、最准）
     *   2) r.address —— 点的是地图空白处、没有 POI 时的详细地址
     *   3) 逆地址解析 —— 前两者都为空时用坐标反查（需配 MAP_KEY）
     * 三级都拿不到就明确提示手填，绝不静默留着上一次的旧值让人以为已经填好了。
     */
    async pickLocation(e) {
      const kind = e.currentTarget.dataset.kind;
      const picked = await new Promise((resolve) => {
        uni.chooseLocation({
          success: (r) => resolve(r),
          fail: (err) => {
            const msg = (err && err.errMsg) || "";
            if (msg.indexOf("cancel") === -1) {
              uni.showModal({
                title: "无法打开地图选点",
                content:
                  "请确认已授权位置权限。开发者工具下该能力可能受限，可改在真机预览中选点，或先手动填写地点名称。",
                showCancel: false,
                confirmText: "知道了",
              });
            }
            resolve(null);
          },
        });
      });
      if (!picked) return;

      let name = (picked.name || picked.address || "").trim();
      if (!name) {
        // 微信只给了坐标没给名称：用坐标反查（MAP_KEY 未配置时返回 null，走下面的手填提示）
        name = (await reverseGeocode(picked.latitude, picked.longitude)) || "";
      }
      if (kind === "meeting") {
        this.f.meetingLatitude = picked.latitude;
        this.f.meetingLongitude = picked.longitude;
        if (name) this.f.meetingPoint = name;
      } else {
        this.f.disbandLatitude = picked.latitude;
        this.f.disbandLongitude = picked.longitude;
        if (name) this.f.disbandPoint = name;
      }
      uni.showToast({
        title: name ? "已选择：" + name : "坐标已记录，请手动填写地点名称",
        icon: "none",
      });
    },
    uploadOne(filePath, endpoint) {
      return new Promise((resolve) => {
        uni.uploadFile({
          url: BASE_URL + API_PREFIX + (endpoint || "/upload"),
          filePath,
          name: "file",
          header: {
            Authorization:
              "Bearer " + (uni.getStorageSync("accessToken") || ""),
          },
          success: (r) => {
            try {
              const d = JSON.parse(r.data);
              resolve((d && d.data && d.data.url) || null);
            } catch (e) {
              resolve(null);
            }
          },
          fail: () => resolve(null),
        });
      });
    },
    chooseImgs() {
      uni.chooseImage({
        count: 9 - this.f.routeImages.length,
        sizeType: ["compressed"],
        success: async (res) => {
          const paths = res.tempFilePaths || [];
          uni.showLoading({ title: "上传中…", mask: true });
          for (const fp of paths) {
            const url = await this.uploadOne(fp);
            if (url) this.f.routeImages.push(url);
          }
          uni.hideLoading();
        },
      });
    },
    removeImg(e) {
      this.f.routeImages.splice(+e.currentTarget.dataset.i, 1);
    },
    chooseGroupQr() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        success: async (res) => {
          const fp = (res.tempFilePaths || [])[0];
          if (!fp) return;
          uni.showLoading({ title: "压缩上传中…", mask: true });
          const url = await this.uploadOne(fp, "/upload/qrcode");
          uni.hideLoading();
          if (url) this.f.groupQrcode = url;
          else uni.showToast({ title: "上传失败，请重试", icon: "none" });
        },
      });
    },
    removeGroupQr() {
      this.f.groupQrcode = "";
    },
    // 路书码表：可重复添加多个平台——先选品牌（或自定义），再填路线 ID/链接，逐条加入列表
    addRouteLink() {
      uni.showActionSheet({
        itemList: this.brandOpts,
        success: (r) => {
          const picked = this.brandOpts[r.tapIndex];
          if (picked === "其它") {
            uni.showModal({
              title: "自定义品牌名称",
              editable: true,
              placeholderText: "如 骑记 / 咕咚",
              success: (m) => {
                if (m.confirm && m.content && m.content.trim())
                  this.promptRouteId(m.content.trim());
              },
            });
            return;
          }
          this.promptRouteId(picked.split(" ")[0]); // 取品牌简称（如"迈金 Magene"→"迈金"）
        },
      });
    },
    promptRouteId(brand) {
      uni.showModal({
        title: `${brand} · 路线 ID / 链接`,
        editable: true,
        placeholderText: "如 12345678 或分享链接（可留空后补）",
        success: (m) => {
          if (m.confirm)
            this.f.routeLinks.push({
              brand,
              externalId: (m.content || "").trim(),
            });
        },
      });
    },
    removeRouteLink(e) {
      this.f.routeLinks.splice(+e.currentTarget.dataset.i, 1);
    },
    onDifficulty(e) {
      this.f.difficulty = Number(e.detail.value) + 1;
    },
    onApproval(e) {
      this.f.approvalMode = e.detail.value ? "auto" : "manual";
    },
    toggleTag(t) {
      const i = this.f.tags.indexOf(t);
      i > -1 ? this.f.tags.splice(i, 1) : this.f.tags.push(t);
    },
    iso(date, time) {
      return date ? `${date}T${time || "00:00"}:00` : undefined;
    },
    async submit() {
      if (!this.f.routeImages.length) {
        uni.showToast({ title: "请至少上传一张活动宣传图", icon: "none" });
        return;
      }
      if (!this.f.title || !this.f.startDate || !this.f.meetingPoint) {
        uni.showToast({ title: "请填写名称、日期与集合地点", icon: "none" });
        return;
      }
      if (!this.f.tags.length) {
        uni.showToast({ title: "请选择活动类型", icon: "none" });
        return;
      }
      const payload = {
        title: this.f.title,
        description: this.f.description,
        meetingPoint: this.f.meetingPoint,
        meetingLatitude: this.f.meetingLatitude,
        meetingLongitude: this.f.meetingLongitude,
        disbandPoint: this.f.disbandPoint,
        disbandLatitude: this.f.disbandLatitude,
        disbandLongitude: this.f.disbandLongitude,
        startTime: this.iso(this.f.startDate, this.f.startTime),
        endTime: this.iso(this.f.startDate, this.f.endTime),
        // 报名截止默认等于出发时刻，不再单独选——领队想改的话截止前都能在"报名管理"里调
        deadline: this.iso(this.f.startDate, this.f.startTime),
        distance: this.f.distance ? Number(this.f.distance) : undefined,
        elevation: this.f.elevation ? Number(this.f.elevation) : undefined,
        difficulty: this.f.difficulty,
        maxParticipants: this.f.maxParticipants
          ? Number(this.f.maxParticipants)
          : undefined,
        tags: this.f.tags,
        routeImages: this.f.routeImages,
        groupQrcode: this.f.groupQrcode || undefined,
        routeLinks: this.f.routeLinks.length ? this.f.routeLinks : undefined,
        fee: this.f.fee ? Number(this.f.fee) : 0,
        approvalMode: this.f.approvalMode,
      };
      try {
        await createActivity(payload);
        uni.showToast({ title: "发布成功", icon: "success" });
        setTimeout(() => uni.navigateBack(), 700);
      } catch (e) {}
    },
  },
};
</script>

<style lang="scss" scoped>
.create {
  min-height: 100vh;
  background: $paper;
  padding-top: 20rpx;
}
.group {
  margin: 0 24rpx 24rpx;
  background: $card;
  border-radius: 26rpx;
  padding: 0 26rpx;
  box-shadow: inset 0 0 0 1rpx $hair;
}
.frow {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 26rpx 0;
  border-bottom: 1rpx solid $hair;
  min-height: 40rpx;
}
.frow.noline {
  border-bottom: 0;
}
.frow.col {
  flex-direction: column;
  align-items: stretch;
  gap: 16rpx;
}
.fk {
  font-size: 27rpx;
  font-weight: 600;
  color: $ink;
  white-space: nowrap;
}
.req {
  color: #d9442e;
}
.fi {
  flex: 1;
  text-align: right;
  font-size: 27rpx;
}
.pk {
  flex: 1;
}
.fv {
  flex: 1;
  text-align: right;
  font-size: 27rpx;
  color: $ink;
}
.fv.phc {
  color: $faint;
}
.arw {
  color: $faint;
}
.ph {
  color: $faint;
}
.pickbtn {
  flex: none;
  font-size: 22rpx;
  font-weight: 800;
  color: $green-deep;
  background: $green-soft;
  padding: 10rpx 20rpx;
  border-radius: 14rpx;
}
.hint {
  display: block;
  font-size: 20rpx;
  color: $muted;
  line-height: 1.6;
  padding: 0 0 20rpx;
}
.linklist {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.linkrow {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: $paper;
  border-radius: 14rpx;
  padding: 16rpx 18rpx;
}
.lb {
  flex: none;
  font-size: 23rpx;
  font-weight: 800;
  color: $green-deep;
  background: $green-soft;
  padding: 4rpx 14rpx;
  border-radius: 10rpx;
}
.lv {
  font-size: 24rpx;
  color: $ink-2;
}
.ldel {
  flex: none;
  font-size: 22rpx;
  color: $faint;
  padding: 0 4rpx;
}
.addlink {
  align-self: flex-start;
  font-size: 24rpx;
  font-weight: 800;
  color: $green-deep;
}
.ta {
  width: 100%;
  min-height: 180rpx;
  background: $paper;
  border-radius: 18rpx;
  padding: 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}
.imgs {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.im {
  position: relative;
  width: calc(33.33% - 8rpx);
  height: 210rpx;
}
.pic {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}
.del {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add {
  width: calc(33.33% - 8rpx);
  height: 210rpx;
  border-radius: 16rpx;
  background: $paper;
  box-shadow: inset 0 0 0 2rpx $line;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}
.addi {
  font-size: 50rpx;
  color: $faint;
  font-weight: 300;
  line-height: 1;
}
.addt {
  font-size: 20rpx;
  color: $muted;
}
.chips {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}
.chip {
  height: 58rpx;
  line-height: 58rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  background: $paper;
  font-size: 24rpx;
  color: $ink-2;
  font-weight: 600;
}
.chip.on {
  background: $green;
  color: #04140c;
  font-weight: 800;
}
.submit {
  margin: 6rpx 24rpx 0;
}
.safe-bottom {
  height: 60rpx;
}
</style>
