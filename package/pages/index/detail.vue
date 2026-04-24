<template>
	<view class="detail-page">
		<!-- 商品图片轮播 -->
		<view class="image-section">
			<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" indicator-color="rgba(255,255,255,0.6)" indicator-active-color="#FF6B35">
				<swiper-item v-for="(img, index) in detail.images" :key="index">
					<image class="swiper-image" :src="img" mode="aspectFit"></image>
				</swiper-item>
			</swiper>
		</view>

		<!-- 价格信息 -->
		<view class="price-card">
			<view class="price-row">
				<text class="current-price">¥{{ detail.price }}</text>
				<text class="original-price">原价¥{{ detail.originalPrice }}</text>
				<u-tag :text="detail.condition" size="mini" :type="conditionType(detail.condition)" class="condition-tag"></u-tag>
			</view>
			<text class="goods-title">{{ detail.title }}</text>
			<view class="meta-row">
				<view class="meta-item">
					<u-icon name="map-fill" color="#999" size="24"></u-icon>
					<text>距离 {{ detail.distance }}</text>
				</view>
				<view class="meta-item">
					<u-icon name="clock-fill" color="#999" size="24"></u-icon>
					<text>{{ detail.time }}</text>
				</view>
				<view class="meta-item">
					<u-icon name="eye-fill" color="#999" size="24"></u-icon>
					<text>浏览 {{ detail.views }}次</text>
				</view>
			</view>

			<!-- 统计信息 -->
			<view class="stats-row">
				<view class="stat-item">
					<text class="stat-num">{{ detail.wantCount }}</text>
					<text class="stat-label">想买</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ detail.collectCount }}</text>
					<text class="stat-label">收藏</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ detail.score }}</text>
					<text class="stat-label">评分</text>
				</view>
			</view>
		</view>

		<!-- 商品描述 -->
		<view class="desc-card">
			<view class="desc-title">
				<u-icon name="file-text-fill" color="#333" size="28"></u-icon>
				<text>商品描述</text>
			</view>
			<text class="desc-content">{{ detail.description }}</text>
		</view>

		<!-- 底部占位 -->
		<view class="bottom-placeholder"></view>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="action-item" @click="toggleCollect">
				<u-icon :name="isCollected ? 'heart-fill' : 'heart'" :color="isCollected ? '#ff4d4f' : '#999'" size="40"></u-icon>
				<text :class="{ collected: isCollected }">收藏</text>
			</view>
			<u-button type="warning" shape="circle" class="contact-btn" @click="contactSeller">
				<u-icon name="chat-fill" color="#fff" size="28"></u-icon>
				<text>联系卖家</text>
			</u-button>
			<u-button type="error" shape="circle" class="buy-btn" @click="buyNow">立即购买</u-button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isCollected: false,
			detail: {
				images: ['/static/image/phone.png', '/static/image/phone.png', '/static/image/phone.png'],
				price: '6,888',
				originalPrice: '9,999',
				condition: '几乎全新',
				title: 'iPhone 15 Pro Max 256GB 原色钛金属',
				distance: '120m',
				time: '10分钟前',
				views: 328,
				wantCount: 128,
				collectCount: 56,
				score: 4.9,
				description: 'iPhone 15 Pro Max 256GB 原色钛金属，几乎全新。购买不到半年因个人原因转手。所有原装配件齐全包装盒也在。'
			}
		}
	},
	onLoad(options) {
		if (options.id) {
			this.loadDetail(options.id)
		}
	},
	methods: {
		conditionType(condition) {
			const map = {
				'几乎全新': 'warning',
				'轻微使用': 'primary',
				'全新': 'success',
				'明显使用': 'info'
			}
			return map[condition] || 'warning'
		},
		toggleCollect() {
			this.isCollected = !this.isCollected
			this.$utils.toast(this.isCollected ? '收藏成功' : '取消收藏')
		},
		contactSeller() {
			this.$utils.toast('联系卖家')
		},
		buyNow() {
			this.$utils.toast('立即购买')
		},
		loadDetail(id) {
			this.$utils.showLoading()
			setTimeout(() => {
				this.$utils.hideLoading()
			}, 500)
		}
	}
}
</script>

<style lang="scss" scoped>
.detail-page {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 120rpx;
}

.image-section {
	height: 500rpx;
	background: linear-gradient(180deg, #FFD8C0 0%, #FFF0E8 100%);

	.swiper {
		width: 100%;
		height: 100%;

		.swiper-image {
			width: 100%;
			height: 100%;
		}
	}
}

.price-card {
	margin: -40rpx 20rpx 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 20rpx;
	position: relative;
	z-index: 1;

	.price-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 16rpx;

		.current-price {
			font-size: 48rpx;
			color: #ff4d4f;
			font-weight: 700;
		}

		.original-price {
			font-size: 26rpx;
			color: #999;
			text-decoration: line-through;
		}
	}

	.goods-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 600;
		line-height: 1.5;
		margin-bottom: 20rpx;
	}

	.meta-row {
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding-bottom: 24rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.meta-item {
			display: flex;
			align-items: center;
			gap: 6rpx;
			font-size: 24rpx;
			color: #999;
		}
	}

	.stats-row {
		display: flex;
		justify-content: space-around;
		padding-top: 24rpx;

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8rpx;

			.stat-num {
				font-size: 36rpx;
				color: #333;
				font-weight: 600;
			}

			.stat-label {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}

.desc-card {
	margin: 0 20rpx 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 20rpx;

	.desc-title {
		display: flex;
		align-items: center;
		gap: 10rpx;
		font-size: 30rpx;
		color: #333;
		font-weight: 600;
		margin-bottom: 20rpx;
	}

	.desc-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}
}

.bottom-placeholder {
	height: 120rpx;
}

.bottom-bar {
	position: fixed;
	left: 0;
	bottom: 0;
	width: 100%;
	height: 110rpx;
	background-color: #fff;
	border-top: 1rpx solid #f0f0f0;
	display: flex;
	align-items: center;
	padding: 0 20rpx;
	box-sizing: border-box;
	gap: 16rpx;

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 100rpx;
		gap: 4rpx;

		text {
			font-size: 22rpx;
			color: #999;

			&.collected {
				color: #ff4d4f;
			}
		}
	}

	.contact-btn {
		flex: 1;
		height: 76rpx;
		font-size: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}

	.buy-btn {
		flex: 1;
		height: 76rpx;
		font-size: 28rpx;
	}
}
</style>
