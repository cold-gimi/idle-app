<template>
	<view class="page-user u-text-f0">
		<template v-if="!userInfo.name">
			<cp-login></cp-login>
		</template>
		<template v-else>
			<view class="user-bj u-m-b-70">
				<view class="u-flex u-row-between u-p-l-20 u-p-r-20">
					<view class="u-flex u-m-t-30 ">
						<view class="u-m-r-20" style="width: 140rpx; height: 140rpx;border-radius: 50%;overflow: hidden;">
							<image src="../../static/logo.svg" style="width: 100%; height: 100%;"></image>
						</view>
						<view style="color: #fff;">
							<view class="u-font-36">
								闫万鹏
							</view>
							<view class="">
								17695474209
							</view>
						</view>
					</view>
					<view class="">
						<u-icon name="arrow-right" color="#fff" size="40"></u-icon>
					</view>
				</view>
				<view class="member">
					<view style="font-size: 42rpx;font-weight: 600;margin-bottom: 5rpx;">
						白金会员
					</view>
					<view class="">
						会员可享受满1000减5元
					</view>
				</view>
			</view>
			<view class="u-m-30 u-p-30" style="background-color: #fff;border-radius: 20rpx;">
				<view class="u-font-34 u-flex u-row-between">
					<view class="">
						我的订单
					</view>
					<view class="u-font-30" style="color: #FF6B35;">
						全部订单
						<u-icon name="arrow-right" color="#FF6B35" size="30"></u-icon>
					</view>
				</view>
				<view class="u-flex u-m-t-20 b-r-15" style="flex-wrap: wrap;text-align: center;">
					<view v-for="(item,index) in list" :key="index"
						style="min-width: 25%;">
						<image :src="`/static/icon/${index+1}.png`" style="width :80rpx;height: 80rpx" mode=""></image>
						<view>
							{{item.title}}
						</view>
					</view>
				</view>
			</view>
			<view class="u-m-30 u-p-30" style="background-color: #fff;">
				<view class="u-font-34 u-m-b-30">
					我的功能
				</view>
				<u-cell-group>
					<u-cell-item icon="map-fill" title="服务地址"></u-cell-item>
					<u-cell-item icon="account-fill" title="联系客服"></u-cell-item>
					<u-cell-item icon="setting-fill" title="检查版本" value="新版本"></u-cell-item>
				</u-cell-group>
			</view>
		</template>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [
					{
						title: '待付款'
					},
					{
						title: '服务中'
					},
					{
						title: '已完成'
					},
					{
						title: '退款售后'
					}
				]
			};
		},
		computed: {
			userInfo: function() {
				return this.$store.state.userInfo || {}
			}
		},
	};
</script>

<style lang="scss" scoped>
	.page-user {
		height: 100vh;
		overflow: auto;
		.user-bj {
			height: 300rpx;
			width: 100%;
			border-radius: 0 0 20rpx 20rpx;
			background-color: $u-type-primary;
			position: relative;
			.member {
				position: absolute;
				left: 60rpx;
				right: 60rpx;
				bottom: -45rpx;
				background-color: #FFD56A;
				padding: 30rpx;
				border-radius:20rpx;
				color: #222;
			}
		}
	}
	
	::v-deep {
		.u-cell {
			padding-left: 0 !important;
			padding-right: 0 !important;
		}
		.u-cell-item-box {
			u-cell-item {
				&:last-child {
					.u-border-bottom::after {
						display: none !important;
					}
				}
			}
		}
	}
</style>