<template>
  <view class="nodata" :style="{'padding-top': top}">
    <u-empty :text="text" :mode="mode"></u-empty>
  </view>
</template>

<script>
export default {
  name: "cp-nodata",
  props: {
    text: {
      type: String,
      default: '数据为空'
    },
    mode: {
      type: String,
      default: 'data'
    },
		top: {
			type: [String, Number],
			default: '50%'
		}
  }
}
</script>

<style lang="scss" scoped>
.nodata {
  margin: auto;
}
</style>
