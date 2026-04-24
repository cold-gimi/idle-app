<template>
  <view class="page-webview">
    <web-view ref="webview" class="web-view" :src="url"></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: ''
    };
  },
  methods: {},
  onLoad: function (query) {
    if (query && query.url) {
      this.url = decodeURIComponent(query.url);
    }
  }
};
</script>

<style lang="scss">
.page-webview {
  height: 100vh;

  .web-view {
    height: 100%;
  }
}
</style>
