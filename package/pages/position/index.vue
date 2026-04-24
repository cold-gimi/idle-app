<template>
  <view>
    <view class="location">
      <view class="title">当前定位</view>
      <view class="body">
        <view class="left">
          <text style="min-width: 100rpx">已选:</text>
          <text style="color: #7468D7; margin-left: 12rpx">
            {{ position && position.city ? position.city : '请选择城市' }}
          </text>
        </view>
        <view @click="getLocation" class="right">切换城市</view>
      </view>
    </view>
    <view class="hot">
      <view class="title">热门城市</view>
      <view class="body">
        <view class="tag" v-for="(item, index) in hotList" :key="index">{{ item }}</view>
      </view>
    </view>
    <view class="com_btn">
      <u-button type="warning">查看地图</u-button>
    </view>
  </view>
</template>
<script>
import { mapState } from 'vuex';
const citySelector = requirePlugin('citySelector');
export default {
  data() {
    return {
      hotList: ['北京', '上海', '天津', '广州', '广州市', '深圳'],
      citySelector: null
    };
  },
  computed: {
    ...mapState(['position'])
  },
  onLoad() {
    // this.position && this.$utils.chooseLocation();
  },
  onShow() {
    const selectedCity = citySelector.getCity(); // 选择城市后返回城市信息对象，若未选择返回null
    selectedCity && this.$store.commit('setPosition', selectedCity);
  },
  methods: {
    getLocation: function () {
      wx.navigateTo({
        url: `plugin://citySelector/index?key=${ this.$store.state.mapKey }&referer=${ this.$store.state.appName }&hotCitys=${ this.hotList.join() }`
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.selected {
  .title {
    font-size: 30rpx;
    color: $u-main-color;
    margin: 30rpx 20rpx;
    font-weight: 600;
    margin-left: 30rpx;
  }
}
.location {
  background: #ffffff;
  border-radius: 18rpx;
  padding: 3rpx 0;
  margin: 20rpx;
  .body {
    margin: 30rpx 20rpx;
    display: flex;
    justify-content: space-between;
    .left {
      font-size: 32rpx;
      font-weight: 800;
      display: flex;
      justify-content: center;
      align-items: center;
      .img {
        width: 35rpx;
        margin-right: 12rpx;
      }
    }
    .right {
      color: #7468D7;
      font-weight: 600;
      margin-right: 10rpx;
      min-width: 115rpx;
    }
  }
}
.title {
  font-size: 30rpx;
  color: $u-main-color;
  margin: 30rpx 20rpx;
  font-weight: 600;
}
.hot {
  margin: 20rpx;
  .body {
    background: #ffffff;
    padding-bottom: 15rpx;
    border-radius: 18rpx;
    .tag {
      display: inline-block;
      width: 137rpx;
      height: 75rpx;
      line-height: 75rpx;
      font-size: 26rpx;
      color: $u-content-color;
      margin: 20rpx 20rpx 5rpx 20rpx;
      padding: 5rpx 10rpx;
      text-align: center;
      background-color: $u-bg-color;
      border-radius: 12rpx;
    }
  }
}
.com_btn {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 40rpx;
}
</style>
