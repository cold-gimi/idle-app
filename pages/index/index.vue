<template>
  <view id="full-screen">
    <view class="first-loading-wrp">
      <view class="loading-wrp">
        <text class="dot dot-spin"><text></text><text></text><text></text><text></text></text>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  methods: {
    checkLogin() {
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/home'
        });
      }, 1000);
    }
  },
  onLoad: function () {
    this.checkLogin();
  },
};
</script>
<style>
#full-screen {
  height: 100vh;
}
.first-loading-wrp {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  min-height: 420px;
  height: 100%;
  background-color: #fff;
}

.first-loading-wrp>h1 {
  font-size: 128px
}

.first-loading-wrp .loading-wrp {
  padding: 98px;
  display: flex;
  justify-content: center;
  align-items: center
}

.dot {
  animation: antRotate 1.2s infinite linear;
  transform: rotate(45deg);
  position: relative;
  display: inline-block;
  font-size: 32px;
  width: 32px;
  height: 32px;
  box-sizing: border-box
}

.dot text {
  width: 14px;
  height: 14px;
  position: absolute;
  display: block;
  background-color: #FF6B35;
  border-radius: 100%;
  transform: scale(.75);
  transform-origin: 50% 50%;
  opacity: .3;
  animation: antSpinMove 1s infinite linear alternate
}

.dot text:nth-child(1) {
  top: 0;
  left: 0
}

.dot text:nth-child(2) {
  top: 0;
  right: 0;
  -webkit-animation-delay: .4s;
  animation-delay: .4s
}

.dot text:nth-child(3) {
  right: 0;
  bottom: 0;
  -webkit-animation-delay: .8s;
  animation-delay: .8s
}

.dot text:nth-child(4) {
  bottom: 0;
  left: 0;
  -webkit-animation-delay: 1.2s;
  animation-delay: 1.2s
}

@keyframes antRotate {
  to {
    -webkit-transform: rotate(405deg);
    transform: rotate(405deg)
  }
}

@-webkit-keyframes antRotate {
  to {
    -webkit-transform: rotate(405deg);
    transform: rotate(405deg)
  }
}

@keyframes antSpinMove {
  to {
    opacity: 1
  }
}

@-webkit-keyframes antSpinMove {
  to {
    opacity: 1
  }
}

</style>