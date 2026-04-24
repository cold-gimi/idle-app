<template>
  <view class="page_search">
    <u-search placeholder="搜素" class="search" :focus="true" v-model.trim="search" @change="change(search)" :animation="true" height="70"></u-search>
    <scroll-view scroll-y>
      <template v-if="list.length">
        <view v-for="(item, index) in list" :key="index">
          <view>{{ item.title }}</view>
          <view class="u-flex u-row-between">
            <text @click="tel(item.tel)">{{ item.tel }}</text>
            <text @click="goPach(item)">去导航</text>
          </view>
        </view>
      </template>
      <template v-else>
        <cp-nodata mode="search" text=" "></cp-nodata>
      </template>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      search: '',
      list: []
    };
  },
  methods: {
    change(search) {
      if (!search) {
        this.list = [];
        return;
      }
      let list = [
        {
          id: 123123,
          title: '水上酒吧', // 标题
          width: 22,
          height: 22,
          latitude: 39.08364502015212,
          longitude: 117.18403787398074,
          tel: '17695474209'
        },
        {
          id: 123434,
          title: '天堂酒吧', // 标题
          width: 22,
          height: 22,
          latitude: 39.08364502015212,
          longitude: 117.18403787398074,
          tel: '17695474209'
        },
        {
          id: 12434,
          title: '梦龙酒吧', // 标题
          width: 22,
          height: 22,
          latitude: 39.08298062942978,
          longitude: 117.18189326456763,
          tel: '17695474209'
        }
      ];
      this.list =
        list.filter(e => {
          return e.title.indexOf(search) != -1;
        }) || [];
    },
    tel(phone) {
      uni.makePhoneCall({
        phoneNumber: phone
      });
    },
    goPach(opt) {
      this.$utils.openLocation({
        latitude: opt.latitude,
        longitude: opt.longitude,
        name: opt.title || ''
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page_search {
  padding: 30rpx;
  position: relative;
  padding-top: 130rpx;
  height: 100vh;
  background-color: #fff;
  u-search {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    padding: 30rpx;
    background-color: #fff;
    z-index: 9999;
  }
}
</style>