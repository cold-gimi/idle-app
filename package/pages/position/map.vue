<template>
  <view class="map">
    <cp-navbar @search="search"></cp-navbar>
    <view v-if="location" class="location">
      <map style="width: 100%; height: 98%" :show-location="true" :latitude="location.latitude" id="nimimap" :longitude="location.longitude" :markers="markers" @tap="handleTap" @markertap="handleMap" :include-points="pointslist" @error="error"> </map>
     
      <view class="popup-card fade-in-animation" v-if="list && list.length">
        <swiper style="width: 100%;position: relative; height: 520rpx;" @change="change">
          <swiper-item class="u-swiper-item" v-for="(i, index) in list" :key="index">
            <view class="card u-text-f0" >
              <template v-if="i.fileMap && i.fileMap.searchshow && i.fileMap.searchshow.length">
                <view class="card-image">
                  <template v-for="(z, index) in i.fileMap.searchshow">
                    <image v-if="index < 3" :key="index" @click.stop="previewImage($utils.getImgUrl(z.objectid))" :src="$utils.getImgUrl(z.objectid)" mode="scaleToFill" />
                  </template>
                </view>
              </template>
              <view class="u-font-34 u-m-t-38 u-m-18 ellipsis"> {{ i.basename }} </view>
              <view class="u-font-30 u-p-20">
                <template v-if="i.shopScore">
                <u-rate active-color="#CEAF4D" :count="value" v-model="i.shopScore" :disabled="true" gutter="10"></u-rate>
                  <text class="u-m-l-20">{{ i.shopScore }}分</text>
                </template>
                <text class="u-m-l-20" v-else>暂无评分</text>
                <!-- <text class="u-m-r-46" style="color: #ffce4b">4.9分</text> -->
                <!-- <text style="color: #999999">89/人</text> -->
              </view>
              <view class="u-flex u-row-between u-m-t-40">
                <view class="share">
                  <!-- <button data-name="share_btn" open-type="share">
                    <image :src="$utils.getStaticUrl('/common/share.png')" mode="scaleToFill" />
                    <text class="u-font-30">分享</text>
                  </button> -->
                </view>
                <view class="dian_btn" @click.stop="toPath(i.objectid)">进店</view>
              </view>
            </view>
         </swiper-item>
        </swiper>
      </view>
    </view>
  </view>
</template>

<script>
const citySelector = requirePlugin('citySelector')
export default {
  onShow() {
    const selectedCity = citySelector.getCity(); // 选择城市后返回城市信息对象，若未选择返回null
    if(selectedCity) {
      this.location = null
      let obj = {
        ...selectedCity,
        city: selectedCity.fullname,
        location: {
          ...selectedCity.location,
          lat: selectedCity.location.latitude,
          lng: selectedCity.location.longitude,
        }
      }
      selectedCity && this.$store.commit('setPosition', obj);
      console.log(obj, 'selectedCity')
    }
    setTimeout(() => {
      this.getList();
    }, 300);
  },
  data() {
    return {
      show: true,
      showMap: false,
      markers: [],
      list: [],
      pointslist: [],
      location: null,
      value: 5
    };
  },
  methods: {
    change(e) {
      this.pointslist = [this.list[e.detail.current]]
    },
    previewImage: function (url) {
      uni.previewImage({
        current: 0,
        urls: [url]
      });
    },
    toPath(objectid) {
      this.$utils.route('/package/pages/order/details', {
        data: {
          objectid
        }
      });
    },
    getList(search = '', size = 3) {
      this.showMap = false;
      this.list = []
      this.pointslist = []
      this.$utils.showLoading();
      const { city = null, latitude = this.$store.getters.location.latitude, longitude = this.$store.getters.location.longitude } = this.$store.getters.position || {}
      let _this = this;
      this.$utils.request({
        method: 'POST',
        url: 'QUERYNEARSHOP',
        data: {
          basename: search,
          isAllowBook: '',
          city: city,
          lat: latitude,
          lng: longitude,
          size: size
        },
        success: (res, header) => {
          this.$utils.hideLoading();
          if (res.data && res.data.length) {
            this.markers = res.data.map((e, i) => {
              return {
                ...e,
                id: Number(e.objectid.split('_')[1]),
                width: 40,
                height: 45,
                latitude: Number(e.lat),
                longitude: Number(e.lng),
                iconPath: _this.$utils.getStaticUrl('/dingwei.png')
              };
            })||[]
            _this.list = _this.markers
            _this.pointslist = _this.markers
          }
          this.showMap = true;
          this.location = this.$store.getters.location;
        }
      });
    },
    setIcon(val) {
      if (Number(val) < 10) {
        return 50;
      } else if (Number(val) < 20) {
        return 40;
      } else if (Number(val) < 30) {
        return 30;
      } else {
        return 20;
      }
    },
    async search(val) {
      this.list = [];
      this.pointslist = this.list
      if (val) {
        this.getList(val, 9999)
      }
    },
    handleTap(e) {
      this.list = []
      this.pointslist = []
    },
    handleMap(e) {
      let _this = this;
      this.showCard = false
      this.list = [];
      this.pointslist = []
      if (e.markerId) {
       setTimeout(()=>{
        _this.list = _this.markers.filter(ele => {
          return ele.id == e.markerId;
        });
        _this.pointslist = _this.list
       }, 300)
      }
    },
    error() {
      this.$utils.showModal({
        title: '提示',
        content: '地图创建失败，请稍后重试！',
        showCancel: false,
        success: res => {
          uni.navigateBack();
        }
      });
    }
  },
  onShareAppMessage: function (options) {
    var shareObj = {
      path: '/package/pages/position/map',
      imageUrl:this.$utils.getStaticUrl('/common/share.jpg'),
      success: function (res) {},
      fail: function () {}
    };
    if (options.from == 'button') {
      shareObj.path = '/package/pages/order/details?data=' + encodeURIComponent({objectid: 0});
    }
    return shareObj;
  }
};
</script>

<style lang="scss" scoped>
.location {
  height: 90vh;
  padding-bottom: constant(safe-area-inset-bottom); /*兼容 IOS<11.2*/
  padding-bottom: env(safe-area-inset-bottom);
  overflow: hidden;
}
.popup-card {
  position: fixed;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 20rpx;
  padding-bottom: 40rpx;
  overflow: auto;
  display: flex;
  z-index: 9999;
  .card {
    background: #1e1d2f;
    border-radius: 20rpx;
    padding: 20rpx;
    width: 100%;
    min-width: 100%;
    margin-right: 30rpx;
    padding-bottom: 33rpx;
    &:last-child {
      margin-right: unset;
    }
    .card-image {
      display: flex;
      image {
        vertical-align: middle;
        width: calc(100% / 3);
        height: 182rpx;
        margin-right: 20rpx;
        &:nth-child(3n) {
          margin-right: 0;
        }
      }
    }
    .share {
      position: relative;
      button {
        background-color: unset;
        padding: unset;
        width: 150rpx;
        color: #fff;
      }
      text {
        float: right;
        font-size: 30rpx;
      }
      image {
        position: absolute;
        width: 45rpx;
        height: 45rpx;
        left: 20rpx;
        top: 50%;
        transform: translateY(-50%);
      }
    }
    .dian_btn {
      width: 169rpx;
      height: 72rpx;
      background: linear-gradient(0deg, #4facfe 0%, #00f2fe 100%);
      border-radius: 36rpx;
      text-align: center;
      line-height: 72rpx;
      font-size: 34rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #1e1d2f;
      margin-right: 30rpx;
    }
  }
}
.fade-in-animation {
  animation: fadein 0.5s;
}
@keyframes fadein {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.u-swiper-item {
  display: flex;
  overflow: hidden;
  align-items: center;
  border-radius: 20rpx;
}
</style>