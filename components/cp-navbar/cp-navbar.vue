<template>
	<view class="cp-navbar">
		<u-navbar :title="title" :is-back="false" :background="{backgroundColor: backgroundColor}" title-color="#fff"
			:border-bottom="false">
			<template v-if="!hide">
				<view class="info" aria-role="button" @click="onLocationClick">
					<u-icon name="map-fill" color="#fff" size="28"></u-icon>
					<text aria-hidden class="name u-line-1 u-m-l-5 u-m-r-10">{{ locationText }}</text>
					<view v-if="switchText" class="switch-btn">
						<text>{{ switchText }}</text>
					</view>
					<u-icon v-else name="arrow-down-fill" color="#fff" size="24"></u-icon>
				</view>
			</template>
		</u-navbar>
	</view>
</template>

<script>
	export default {
		computed: {
			userInfo: function() {
				return this.$store.state.userInfo
			},
			isCare: function() {
				return this.$store.state.isCare;
			},
			font_size: function() {
				return this.$store.state.font_size;
			}
		},
		props: {
			title: {
				type: String,
				default: ''
			},
			hide: {
				type: Boolean,
				default: false
			},
			backgroundColor: {
				type: String,
				default: '#FF6B35'
			},
			locationText: {
				type: String,
				default: '天津市'
			},
			switchText: {
				type: String,
				default: ''
			}
		},
		methods: {
			onLocationClick() {
				this.$emit('location-click')
			},
			changePatient: function() {
				uni.navigateTo({
					url: '/package/pages/patient/change'
				})
			},

		}
	}
</script>

<style lang="scss">
	.cp-navbar {
		.info {
			display: flex;
			flex-direction: row;
			padding: 0 20rpx;
			padding-top: 5rpx;
			&:active {
				opacity: .6;
			}

			.name {
				font-size: 26rpx;
				line-height: 50rpx;
				color: #fff;
				max-width: 300rpx;
			}

			.switch-btn {
				padding: 2rpx 14rpx;
				background-color: rgba(255, 255, 255, 0.25);
				border-radius: 20rpx;

				text {
					font-size: 22rpx;
					color: #fff;
				}
			}
		}
	}
</style>