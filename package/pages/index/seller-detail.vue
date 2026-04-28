<template>
	<view class="seller-detail-page">
		<!-- 顶部商家信息区域 -->
		<view class="seller-header">
			<view class="header-bg">
				<view class="seller-info">
					<view class="seller-avatar">
						<image :src="sellerInfo.avatar" mode="aspectFill"></image>
					</view>
					<view class="seller-detail">
						<view class="seller-name-row">
							<text class="seller-name">{{ sellerInfo.name }}</text>
							<view class="verify-tags">
								<view class="verify-tag" v-if="sellerInfo.isVerified">
									<u-icon name="shield-checkmark" color="#fff" size="20"></u-icon>
									<text>实名认证</text>
								</view>
								<view class="verify-tag credit" v-if="sellerInfo.hasCredit">
									<u-icon name="star" color="#fff" size="20"></u-icon>
									<text>信用优秀</text>
								</view>
							</view>
						</view>
						<view class="seller-desc">
							<text>8年老店 · 天津</text>
						</view>
						<view class="seller-rating">
							<text class="rating-num">{{ sellerStats.goodRate }}</text>
							<view class="stars">
								<u-icon v-for="n in 5" :key="n" name="star-fill" color="#FFD700" size="24"></u-icon>
							</view>
							<text class="rating-desc">★★★★★ · 超赞商家</text>
						</view>
					</view>
				</view>
				<view class="follow-btn" :class="{ followed: isFollowed }" @click="toggleFollow">
					<u-icon v-if="!isFollowed" name="plus" color="#fff" size="28"></u-icon>
					<u-icon v-else name="checkmark" color="#999" size="28"></u-icon>
					<text v-if="!isFollowed">关注</text>
					<text v-else>已关注</text>
				</view>
			</view>
		</view>

		<!-- 统计区域 -->
		<view class="stats-section">
			<view class="stat-item" @click="switchTab('sale')">
				<text class="stat-num">{{ sellerStats.onSale }}</text>
				<text class="stat-label">在售</text>
			</view>
			<view class="stat-item" @click="switchTab('sold')">
				<text class="stat-num">{{ sellerStats.sold }}</text>
				<text class="stat-label">已售</text>
			</view>
			<view class="stat-item">
				<text class="stat-num">{{ sellerStats.goodRate }}%</text>
				<text class="stat-label">好评率</text>
			</view>
			<view class="stat-item" @click="switchTab('fans')">
				<text class="stat-num">{{ sellerStats.fans }}</text>
				<text class="stat-label">粉丝</text>
			</view>
		</view>

		<!-- Tab 切换区域 -->
		<view class="tabs-section">
			<view class="tabs-header">
				<view 
					class="tab-item" 
					:class="{ active: currentTab === 'review' }" 
					@click="switchTab('review')"
				>
					<text>买家评价</text>
					<text class="tab-count">106</text>
				</view>
				<view 
					class="tab-item" 
					:class="{ active: currentTab === 'sale' }" 
					@click="switchTab('sale')"
				>
					<text>在售宝贝</text>
					<text class="tab-count">8</text>
				</view>
			</view>

			<!-- 评价内容 -->
			<view class="tab-content" v-if="currentTab === 'review'">
				<view class="review-filters">
					<view class="filter-item active" @click="selectFilter('all')">
						<text>好评 98%</text>
					</view>
					<view class="filter-item" @click="selectFilter('medium')">
						<text>中评</text>
					</view>
					<view class="filter-item" @click="selectFilter('bad')">
						<text>差评</text>
					</view>
					<view class="filter-item" @click="selectFilter('image')">
						<text>有图</text>
					</view>
				</view>

				<view class="reviews-list">
					<view class="review-item" v-for="(review, index) in reviewList" :key="index">
						<view class="reviewer-info">
							<view class="reviewer-avatar" :style="{ background: review.avatarBg }">
								<text>{{ review.userName.charAt(0) }}</text>
							</view>
							<view class="reviewer-detail">
								<text class="reviewer-name">{{ review.userName }}</text>
								<view class="stars">
									<u-icon v-for="n in 5" :key="n" :name="n <= review.rating ? 'star-fill' : 'star'" color="#FFD700" size="20"></u-icon>
								</view>
							</view>
							<text class="review-time">{{ review.time }}</text>
						</view>
						<text class="review-content">{{ review.content }}</text>
						<view class="review-goods" v-if="review.goodsName">
							<view class="goods-info" @click="viewGoodsDetail(review)">
								<view class="goods-thumb">
									<image :src="review.goodsImage" mode="aspectFill"></image>
								</view>
								<view class="goods-detail">
									<text class="goods-name">{{ review.goodsName }}</text>
									<view class="goods-price">
										<text class="price-symbol">¥</text>
										<text class="price-num">{{ review.goodsPrice }}</text>
									</view>
								</view>
								<u-icon name="arrow-right" color="#ccc" size="24"></u-icon>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 在售宝贝内容 -->
			<view class="tab-content" v-if="currentTab === 'sale'">
				<view class="goods-grid">
					<view class="goods-item" v-for="(goods, index) in saleGoodsList" :key="index" @click="viewGoodsDetail(goods)">
						<view class="goods-image" :style="{ background: goods.bgColor }">
							<image :src="goods.image" mode="aspectFit"></image>
							<view class="goods-tag" v-if="goods.isNew">
								<text>全新</text>
							</view>
						</view>
						<view class="goods-info">
							<text class="goods-name">{{ goods.name }}</text>
							<view class="goods-price">
								<text class="price-symbol">¥</text>
								<text class="price-num">{{ goods.price }}</text>
							</view>
							<view class="goods-want" v-if="goods.wantCount">
								<text>{{ goods.wantCount }}人想要</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部占位 -->
		<view class="safe-bottom-placeholder"></view>

		<!-- 底部操作栏 -->
		<view class="footer-bar">
			<view class="footer-left">
				<view class="footer-action" @click="goToHome">
					<u-icon name="home" color="#999" size="44"></u-icon>
					<text>首页</text>
				</view>
			</view>
			<view class="footer-right">
				<view class="action-btn message-btn" @click="contactSeller">
					<u-icon name="chatbox" color="#FF6B6B" size="40"></u-icon>
					<text>私信</text>
				</view>
				<view class="action-btn follow-btn" :class="{ followed: isFollowed }" @click="toggleFollow">
					<u-icon v-if="!isFollowed" name="plus" color="#fff" size="40"></u-icon>
					<text v-if="!isFollowed">+ 关注</text>
					<u-icon v-else name="checkmark" color="#999" size="40"></u-icon>
					<text v-else>已关注</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isFollowed: false,
			currentTab: 'review',
			sellerId: '',
			sellerInfo: {
				name: '阳光小区·小王',
				avatar: '/static/logo.png',
				isVerified: true,
				hasCredit: true
			},
			sellerStats: {
				onSale: 23,
				sold: 86,
				goodRate: 98,
				fans: '1.2k'
			},
			// 评价列表
			reviewList: [
				{
					id: 1,
					userName: '小李子',
					avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					rating: 5,
					time: '3天前',
					content: '卖家超级好！东西和描述完全一样，发货也快，强烈推荐！注意了注意事项！',
					goodsName: 'Apple iPhone 14 Pro 256GB',
					goodsImage: '/static/image/phone.png',
					goodsPrice: '5,200'
				},
				{
					id: 2,
					userName: '蓝天白云',
					avatarBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
					rating: 5,
					time: '5天前',
					content: '成色真的很新，很满意！价格公道，下次还来！',
					goodsName: 'Apple iPhone 14 Pro 256GB',
					goodsImage: '/static/image/phone.png',
					goodsPrice: '5,200'
				}
			],
			// 在售商品列表
			saleGoodsList: [
				{ id: 1, name: 'iPhone 14 Pro 256GB', price: '5,200', image: '/static/image/phone.png', bgColor: 'linear-gradient(135deg, #FFE5E5 0%, #FFF0E5 100%)', isNew: true, wantCount: 23 },
				{ id: 2, name: '机械键盘 HHKB 2', price: '320', image: '/static/logo.png', bgColor: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 100%)', isNew: false, wantCount: 8 },
				{ id: 3, name: 'AirPods Pro 2代', price: '1,100', image: '/static/logo.png', bgColor: 'linear-gradient(135deg, #E8F5E9 0%, #E0F2F1 100%)', isNew: true, wantCount: 45 },
				{ id: 4, name: 'Sony A6400 套机', price: '4,200', image: '/static/logo.png', bgColor: 'linear-gradient(135deg, #FFF3E0 0%, #FFECB3 100%)', isNew: false, wantCount: 12 },
				{ id: 5, name: '罗技 MX Master 3', price: '188', image: '/static/logo.png', bgColor: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)', isNew: false, wantCount: 6 },
				{ id: 6, name: 'MacBook Air M2', price: '7,800', image: '/static/logo.png', bgColor: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', isNew: true, wantCount: 56 },
				{ id: 7, name: 'Apple Watch S8', price: '1,600', image: '/static/logo.png', bgColor: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)', isNew: false, wantCount: 18 },
				{ id: 8, name: 'Nintendo Switch OLED', price: '1,450', image: '/static/logo.png', bgColor: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD9 100%)', isNew: true, wantCount: 32 }
			]
		}
	},
	onLoad(options) {
		if (options.id) {
			this.sellerId = options.id
			this.loadSellerDetail(options.id)
		}
		if (options.tab) {
			this.currentTab = options.tab
		}
	},
	methods: {
		loadSellerDetail(id) {
			// TODO: 加载商家详情
		},
		toggleFollow() {
			this.isFollowed = !this.isFollowed
			this.$utils.toast(this.isFollowed ? '关注成功' : '取消关注')
		},
		switchTab(tab) {
			this.currentTab = tab
		},
		selectFilter(filter) {
			this.$utils.toast(`筛选: ${filter}`)
		},
		contactSeller() {
			uni.navigateTo({
				url: `/package/pages/chat/chat?shopId=shop_${this.sellerId || 'demo_shop'}&shopName=${encodeURIComponent(this.sellerInfo.name)}`
			})
		},
		viewGoodsDetail(goods) {
			uni.navigateTo({
				url: `/package/pages/index/detail?id=${goods.id || 'mock_1'}`
			})
		},
		goToHome() {
			uni.switchTab({
				url: '/pages/index/home'
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.seller-detail-page {
	padding-bottom: 0;
	background-color: #f8f8f8;
	min-height: 100vh;
	padding-bottom: 120rpx;
}

/* 顶部商家信息 */
.seller-header {
	background: linear-gradient(180deg, #FF8C70 0%, #FFF8F0 100%);
	
	.header-bg {
		background: linear-gradient(135deg, #FF8C70 0%, #FF6B6B 100%);
		padding: 40rpx 30rpx;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.seller-info {
		display: flex;
		align-items: flex-start;
		gap: 24rpx;
		flex: 1;
	}

	.seller-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		overflow: hidden;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		flex-shrink: 0;
		
		image {
			width: 100%;
			height: 100%;
		}
	}

	.seller-detail {
		flex: 1;
		
		.seller-name-row {
			display: flex;
			align-items: center;
			gap: 12rpx;
			margin-bottom: 8rpx;
			flex-wrap: wrap;
			
			.seller-name {
				font-size: 36rpx;
				color: #fff;
				font-weight: 700;
			}
			
			.verify-tags {
				display: flex;
				gap: 8rpx;
				
				.verify-tag {
					display: flex;
					align-items: center;
					gap: 4rpx;
					background: rgba(255, 255, 255, 0.2);
					padding: 4rpx 12rpx;
					border-radius: 8rpx;
					
					text {
						font-size: 20rpx;
						color: #fff;
					}
					
					&.credit {
						background: rgba(255, 215, 0, 0.3);
					}
				}
			}
		}
		
		.seller-desc {
			margin-bottom: 12rpx;
			
			text {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.85);
			}
		}
		
		.seller-rating {
			display: flex;
			align-items: center;
			gap: 12rpx;
			
			.rating-num {
				font-size: 44rpx;
				color: #fff;
				font-weight: 700;
			}
			
			.stars {
				display: flex;
				gap: 2rpx;
			}
			
			.rating-desc {
				font-size: 24rpx;
				color: rgba(255, 255, 255, 0.9);
			}
		}
	}

	.follow-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 12rpx 24rpx;
		border-radius: 40rpx;
		
		text {
			font-size: 26rpx;
			color: #fff;
			font-weight: 500;
		}
		
		&.followed {
			background: #f5f5f5;
			
			text {
				color: #999;
			}
		}
	}
}

/* 统计区域 */
.stats-section {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 24rpx 0;
	margin: 0 20rpx;
	background-color: #fff;
	border-radius: 0 0 24rpx 24rpx;
	margin-top: -20rpx;
	position: relative;
	z-index: 1;

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;

		.stat-num {
			font-size: 36rpx;
			color: #333;
			font-weight: 700;
		}

		.stat-label {
			font-size: 24rpx;
			color: #999;
		}
	}
}

/* Tab 切换区域 */
.tabs-section {
	margin: 20rpx;
	background-color: #fff;
	border-radius: 24rpx;
	overflow: hidden;

	.tabs-header {
		display: flex;
		border-bottom: 1rpx solid #f0f0f0;

		.tab-item {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8rpx;
			padding: 24rpx 0;
			position: relative;
			
			text {
				font-size: 28rpx;
				color: #666;
				font-weight: 500;
			}
			
			.tab-count {
				font-size: 22rpx;
				color: #999;
				font-weight: normal;
			}
			
			&.active {
				text {
					color: #FF6B6B;
					font-weight: 600;
				}
				
				&::after {
					content: '';
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					width: 60rpx;
					height: 4rpx;
					background: linear-gradient(135deg, #FF8C70 0%, #FF6B6B 100%);
					border-radius: 4rpx;
				}
			}
		}
	}

	.tab-content {
		padding: 20rpx;
	}

	/* 评价筛选 */
	.review-filters {
		display: flex;
		gap: 16rpx;
		margin-bottom: 20rpx;
		overflow-x: auto;
		padding-bottom: 8rpx;

		.filter-item {
			flex-shrink: 0;
			padding: 8rpx 20rpx;
			background-color: #f5f5f5;
			border-radius: 20rpx;
			
			text {
				font-size: 24rpx;
				color: #666;
			}
			
			&.active {
				background-color: #FFF5F2;
				
				text {
					color: #FF6B6B;
				}
			}
		}
	}

	/* 评价列表 */
	.reviews-list {
		.review-item {
			margin-bottom: 24rpx;
			padding-bottom: 24rpx;
			border-bottom: 1rpx solid #f0f0f0;
			
			&:last-child {
				border-bottom: none;
				margin-bottom: 0;
				padding-bottom: 0;
			}

			.reviewer-info {
				display: flex;
				align-items: center;
				gap: 12rpx;
				margin-bottom: 16rpx;
				
				.reviewer-avatar {
					width: 64rpx;
					height: 64rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					
					text {
						color: #fff;
						font-size: 26rpx;
						font-weight: 500;
					}
				}
				
				.reviewer-detail {
					flex: 1;
					display: flex;
					flex-direction: column;
					gap: 4rpx;
					
					.reviewer-name {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}
					
					.stars {
						display: flex;
						gap: 2rpx;
					}
				}
				
				.review-time {
					font-size: 22rpx;
					color: #999;
				}
			}

			.review-content {
				font-size: 28rpx;
				color: #333;
				line-height: 1.6;
				margin-bottom: 16rpx;
			}

			.review-goods {
				.goods-info {
					display: flex;
					align-items: center;
					padding: 16rpx;
					background-color: #fafafa;
					border-radius: 12rpx;
					
					.goods-thumb {
						width: 80rpx;
						height: 80rpx;
						border-radius: 8rpx;
						overflow: hidden;
						flex-shrink: 0;
						
						image {
							width: 100%;
							height: 100%;
						}
					}
					
					.goods-detail {
						flex: 1;
						margin-left: 16rpx;
						display: flex;
						flex-direction: column;
						gap: 4rpx;
						
						.goods-name {
							font-size: 26rpx;
							color: #333;
							display: -webkit-box;
							-webkit-line-clamp: 1;
							-webkit-box-orient: vertical;
							overflow: hidden;
						}
						
						.goods-price {
							display: flex;
							align-items: baseline;
							
							.price-symbol {
								font-size: 22rpx;
								color: #ff4d4f;
								font-weight: 600;
							}
							
							.price-num {
								font-size: 28rpx;
								color: #ff4d4f;
								font-weight: 700;
							}
						}
					}
				}
			}
		}
	}

	/* 在售商品网格 */
	.goods-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;

		.goods-item {
			width: calc(50% - 8rpx);
			background-color: #fff;
			border-radius: 16rpx;
			overflow: hidden;
			border: 1rpx solid #f0f0f0;

			.goods-image {
				position: relative;
				width: 100%;
				height: 240rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				
				image {
					width: 160rpx;
					height: 160rpx;
				}
				
				.goods-tag {
					position: absolute;
					top: 12rpx;
					left: 12rpx;
					background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
					padding: 4rpx 12rpx;
					border-radius: 8rpx;
					
					text {
						font-size: 20rpx;
						color: #fff;
						font-weight: 500;
					}
				}
			}

			.goods-info {
				padding: 16rpx;
				
				.goods-name {
					font-size: 26rpx;
					color: #333;
					font-weight: 500;
					display: -webkit-box;
					-webkit-line-clamp: 1;
					-webkit-box-orient: vertical;
					overflow: hidden;
					margin-bottom: 8rpx;
				}
				
				.goods-price {
					display: flex;
					align-items: baseline;
					margin-bottom: 4rpx;
					
					.price-symbol {
						font-size: 22rpx;
						color: #ff4d4f;
						font-weight: 600;
					}
					
					.price-num {
						font-size: 32rpx;
						color: #ff4d4f;
						font-weight: 700;
					}
				}
				
				.goods-want {
					text {
						font-size: 22rpx;
						color: #999;
					}
				}
			}
		}
	}
}

/* 底部操作栏 */
.safe-bottom-placeholder {
	height: calc(100rpx + env(safe-area-inset-bottom));
}

.footer-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100rpx;
	background-color: #fff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30rpx;
	padding-bottom: env(safe-area-inset-bottom);
	box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.04);
	z-index: 100;

	.footer-left {
		display: flex;
		align-items: center;
		
		.footer-action {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 0 20rpx;
			
			text {
				font-size: 20rpx;
				color: #999;
				margin-top: 4rpx;
			}
		}
	}

	.footer-right {
		display: flex;
		align-items: center;
		gap: 20rpx;

		.action-btn {
			display: flex;
			align-items: center;
			gap: 8rpx;
			padding: 16rpx 32rpx;
			border-radius: 40rpx;
			
			text {
				font-size: 26rpx;
				font-weight: 500;
			}
			
			&.message-btn {
				background-color: #FFF5F2;
				
				text {
					color: #FF6B6B;
				}
			}
			
			&.follow-btn {
				background: linear-gradient(135deg, #FF6B6B 0%, #FF8C70 100%);
				
				text {
					color: #fff;
				}
				
				&.followed {
					background: #f5f5f5;
					
					text {
						color: #999;
					}
				}
			}
		}
	}
}
</style>
