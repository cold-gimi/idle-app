<template>
	<view class="page-login">
		<image class="logo" src="/static/logo.svg" mode="aspectFit"></image>
		<view style="padding: 30rpx 60rpx">
			<view class="u-m-t-50">
			<u-button type="primary" ripple open-type="getPhoneNumber"
				@getphonenumber="getPhoneNumber">
				一键登录
			</u-button>
			</view>
			<view class="u-m-t-30">
			<u-button ripple>
				手机号登陆
			</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				code: "",
			};
		},
		methods: {
			getPhoneNumber: function(event) {
				this.$store.commit('setUserInfo', {
					name: '闫万鹏',
					phone: 17695474209
				})
				this.$utils.navigateBack()
				return
				if (!event.detail.code) {
					this.$utils.toast("请授权获取您的手机号码");
					return;
				}
				this.$utils
					.request({
						method: "post",
						url: "",
						data: {
							code: event.detail.code,
						},
					})
					.then((res) => {

					});
			},
		},
		onShow: function() {},
		onUnload: function() {},
	};
</script>
<style lang="scss" scoped>
	.page-login {
		text-align: center;

		.logo {
			margin-top: 100rpx;
			width: 600rpx;
			height: 345rpx;
		}

		.login-divider {
			height: 50rpx;
		}
	}
</style>