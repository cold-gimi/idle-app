<template>
	<view class="no-login">
		<image src="/static/logo.svg" class="no-login-image"></image>
		<view class="no-login-text">您还没有登录，请登录后查看</view>

		<view style="padding: 30rpx 60rpx">
			<view style="height: 50rpx"></view>
			<u-button type="primary" @click="toPath" ripple shape="circle">立即登录
			</u-button>
		</view>
	</view>
</template>

<script>
	export default {
		methods: {
			toPath() {
				this.$utils.route('/package/pages/login/login')
			}
		}
	}
</script>

<style lang="scss">
	.no-login {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		will-change: transform;
		transform: translate3d(0, -50%, 0);
		text-align: center;

		.no-login-image {
			width: 200rpx;
			height: 200rpx;
			margin: auto;
		}

		.no-login-text {
			text-align: center;
			font-size: 32rpx;
			line-height: 100rpx;
		}
	}
</style>