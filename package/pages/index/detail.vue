<template>
	<view class="detail-page">
		<!-- 商品图片轮播 -->
		<view class="image-section">
			<swiper class="swiper" :indicator-dots="false" :autoplay="true" :interval="3000" :duration="500">
				<swiper-item v-for="(img, index) in auctionDetail.images" :key="index">
					<image class="swiper-image" :src="img" mode="aspectFit"></image>
				</swiper-item>
			</swiper>
			<view class="page-indicator">
				<text>{{ currentImageIndex + 1 }} / {{ auctionDetail.images.length }}</text>
			</view>
		</view>

		<!-- 价格信息 -->
		<view class="price-card">
			<view class="price-header">
				<view class="price-row">
					<view class="current-price-wrap">
						<text class="price-symbol">¥</text>
						<text class="current-price">{{ formattedCurrentPrice }}</text>
					</view>
					<view class="original-price-wrap">
						<text class="original-price">原价 ¥{{ formattedOriginalPrice }}</text>
					</view>
				</view>
				<view class="condition-tag">
					<text>{{ auctionDetail.condition }}</text>
				</view>
			</view>
			<text class="goods-title">{{ auctionDetail.title }}</text>
			<view class="meta-row">
				<view class="meta-item">
					<u-icon name="map-fill" color="#999" size="24"></u-icon>
					<text>距你 {{ auctionDetail.distance }}</text>
				</view>
				<view class="meta-item">
					<u-icon name="clock-fill" color="#999" size="24"></u-icon>
					<text>{{ auctionDetail.time }}</text>
				</view>
				<view class="meta-item">
					<u-icon name="eye-fill" color="#999" size="24"></u-icon>
					<text>{{ auctionDetail.views }}次浏览</text>
				</view>
			</view>

			<!-- 统计信息 -->
			<view class="stats-row">
				<view class="stat-item" @click="goToWantList">
					<text class="stat-num">{{ auctionDetail.wantCount || 0 }}</text>
					<text class="stat-label">想买</text>
				</view>
				<view class="stat-item" @click="goToCollectList">
					<text class="stat-num">{{ auctionDetail.collectCount || 0 }}</text>
					<text class="stat-label">收藏</text>
				</view>
			</view>
		</view>

		<!-- 商品描述 -->
		<view class="desc-card">
			<view class="section-title">
				<text>商品描述</text>
			</view>
			<text class="desc-content">{{ auctionDetail.description }}</text>
			
			<!-- 商品属性列表 -->
			<view class="attr-list">
				<view class="attr-item">
					<text class="attr-label">成色</text>
					<view class="attr-value">
						<view class="value-badge">
							<text>{{ auctionDetail.condition }}</text>
						</view>
					</view>
				</view>
				<view class="attr-item">
					<text class="attr-label">购入时间</text>
					<text class="attr-text">{{ auctionDetail.purchaseTime }}</text>
				</view>
				<view class="attr-item">
					<text class="attr-label">交易方式</text>
					<text class="attr-text">{{ auctionDetail.tradeMethod }}</text>
				</view>
				<view class="attr-item">
					<text class="attr-label">是否议价</text>
					<view class="attr-value">
						<view class="value-badge green">
							<text>{{ auctionDetail.canNegotiate }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 卖家详情 -->
		<view class="seller-card">
			<view class="seller-header">
				<view class="seller-info" @click="goToSellerHome">
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
					</view>
				</view>
				<view class="follow-btn" :class="{ followed: isFollowed }" @click="toggleFollow">
					<text>{{ isFollowed ? '已关注' : '+ 关注' }}</text>
				</view>
			</view>
			
			<!-- 卖家统计 -->
			<view class="seller-stats">
				<view class="stat-item" @click="goToSellerOnSale">
					<text class="stat-num">{{ sellerStats.onSale }}</text>
					<text class="stat-label">在售</text>
				</view>
				<view class="stat-item" @click="goToSellerSold">
					<text class="stat-num">{{ sellerStats.sold }}</text>
					<text class="stat-label">已售</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ sellerStats.goodRate }}%</text>
					<text class="stat-label">好评率</text>
				</view>
				<view class="stat-item" @click="goToSellerFans">
					<text class="stat-num">{{ sellerStats.fans }}</text>
					<text class="stat-label">粉丝</text>
				</view>
			</view>
			
			<!-- 买家评价 -->
			<view class="reviews-section" v-if="sellerReviews.length > 0">
				<view class="section-header">
					<text class="section-title">买家评价</text>
					<view class="view-all" @click="goToAllReviews">
						<text>全部 {{ sellerReviews.length }} 条</text>
						<u-icon name="arrow-right" color="#999" size="20"></u-icon>
					</view>
				</view>
				<view class="reviews-list">
					<view class="review-item" v-for="(review, index) in displayedReviews" :key="index">
						<view class="reviewer-info">
							<text class="reviewer-name">{{ review.userName }}</text>
							<view class="stars">
								<u-icon v-for="n in 5" :key="n" :name="n <= review.rating ? 'star-fill' : 'star'" color="#FFD700" size="24"></u-icon>
							</view>
						</view>
						<text class="review-content">{{ review.content }}</text>
					</view>
				</view>
			</view>
			
			<!-- 更多宝贝 -->
			<view class="more-goods" @click="goToSellerAllGoods">
				<text class="more-text">查看商家全部 {{ sellerStats.onSale }} 件在售宝贝</text>
				<u-icon name="arrow-right" color="#999" size="24"></u-icon>
			</view>
		</view>

		<!-- 卖家留言区域 -->
		<view class="comment-section">
			<view class="section-title">
				<text>卖家留言</text>
				<text class="comment-count">({{ commentList.length }})</text>
			</view>
			
			<!-- 留言列表 -->
			<view class="comment-list">
				<view v-for="comment in commentList" :key="comment.id" class="comment-item">
					<view class="user-avatar" :style="{ background: comment.avatarBg || '#eee' }">
						<text>{{ comment.username ? comment.username.charAt(0) : '?' }}</text>
					</view>
					<view class="comment-body">
						<view class="comment-header">
							<text class="username">{{ comment.username || '用户' }}</text>
							<text class="time">{{ getTimeAgo(comment.createTime) }}</text>
						</view>
						<text class="content">{{ comment.content }}</text>
						<view class="comment-actions" v-if="comment.likes !== undefined">
							<view class="action-item" @click="likeComment(comment)">
								<u-icon :name="comment.isLiked ? 'heart-fill' : 'heart'" :color="comment.isLiked ? '#ff4d4f' : '#999'" size="24"></u-icon>
								<text>{{ comment.likes || 0 }}</text>
							</view>
							<view class="action-item" @click="replyComment(comment)">
								<text>回复</text>
							</view>
						</view>
					</view>
				</view>
				<view v-if="commentList.length === 0" class="empty-comment">
					<text>暂无留言，快来抢沙发吧~</text>
				</view>
			</view>
		</view>

		<!-- 底部占位 -->
		<view class="safe-bottom-placeholder"></view>

		<!-- 底部操作栏 -->
		<view class="footer-bar">
			<view class="footer-left">
				<view class="footer-action" @click="toggleCollect">
					<u-icon :name="isCollected ? 'heart-fill' : 'heart'" :color="isCollected ? '#ff4d4f' : '#333'" size="44"></u-icon>
					<text :class="{ active: isCollected }">收藏</text>
				</view>
			</view>
			<view class="footer-right">
				<u-button 
					type="error" 
					shape="circle" 
					class="contact-btn"
					@click="contactSeller"
				>
					联系卖家
				</u-button>
			</view>
		</view>
		
		<!-- 留言输入框 (悬浮) -->
		<view class="input-bar">
			<view class="input-wrapper" @click="focusCommentInput">
				<view class="avatar-small">
					<text>😊</text>
				</view>
				<text class="input-placeholder">说点什么...</text>
			</view>
			<view class="send-btn" @click="showCommentPopup">
				<u-icon name="paperplane-fill" color="#fff" size="32"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
export default {
	data() {
		return {
			isCollected: false,
			isFollowed: false,
			auctionId: '',
			currentImageIndex: 0,
			bidMessage: '',
			isSubmitting: false,
			auctionDetail: {
				images: ['/static/image/phone.png', '/static/image/phone.png', '/static/image/phone.png', '/static/image/phone.png'],
				title: 'Apple iPhone 14 Pro 256GB 暗紫色 国行正品 原装配件',
				originalPrice: 7999,
				currentPrice: 5200,
				distance: '320m',
				time: '1小时前',
				views: 328,
				wantCount: 128,
				collectCount: 56,
				condition: '几乎全新',
				purchaseTime: '2024年3月',
				tradeMethod: '自提 / 同城配送',
				canNegotiate: '可小刀',
				description: '买了一年多，使用完好，无磕碰，屏幕无划痕。电池健康度 94%。原装充电器、数据线均在，随机盒子也有。因换新机处理，价格已让，非诚勿扰。'
			},
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
			sellerReviews: [
				{
					userName: '小李子',
					rating: 5,
					content: '卖家超级好！东西和描述一样，发货也快，强烈推荐！'
				},
				{
					userName: '蓝天白云',
					rating: 5,
					content: '成色真的很新，很满意！价格公道！'
				}
			],
			commentList: [
				{
					id: 1,
					username: '小李子',
					avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					createTime: Date.now() - 180000,
					content: '请问还在吗？可以小刀一下吗？5000可以的话明天来取。',
					likes: 3,
					isLiked: false
				},
				{
					id: 2,
					username: '蓝天白云',
					avatarBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
					createTime: Date.now() - 86400000,
					content: '电池健康度还有多少啊？用了多久了',
					likes: 1,
					isLiked: false
				},
				{
					id: 3,
					username: '向日葵007',
					avatarBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
					createTime: Date.now() - 172800000,
					content: '支持花呗分期吗？还有原装数据线吗',
					likes: 0,
					isLiked: false
				}
			]
		}
	},
	computed: {
		...mapState(['auctionStatus', 'bidHistory', 'currentAuction']),
		formattedCurrentPrice() {
			return this.$utils.formatPriceWithComma(this.auctionDetail.currentPrice)
		},
		formattedOriginalPrice() {
			return this.$utils.formatPriceWithComma(this.auctionDetail.originalPrice)
		},
		displayedReviews() {
			return this.sellerReviews.slice(0, 2)
		}
	},
	onLoad(options) {
		if (options.id) {
			this.auctionId = options.id
			this.loadAuctionDetail(options.id)
		} else {
			this.loadMockData()
		}
	},
	onUnload() {
		if (this.auctionId) {
			this.$store.dispatch('stopCountdown', this.auctionId)
		}
	},
	onHide() {
		if (this.auctionId) {
			this.$store.dispatch('stopCountdown', this.auctionId)
		}
	},
	onShow() {
		if (this.auctionId && this.auctionStatus.remainingTime > 0) {
			this.$store.dispatch('startCountdown', {
				auctionId: this.auctionId,
				remainingTime: this.auctionStatus.remainingTime
			})
		}
	},
	methods: {
		...mapActions(['getAuctionDetail', 'getBidHistory', 'placeBid', 'startCountdown', 'stopCountdown']),
		getTimeAgo(timestamp) {
			return this.$utils.getTimeAgo(timestamp)
		},
		loadMockData() {
			const mockAuction = {
				id: 'mock_1',
				title: 'Apple iPhone 14 Pro 256GB 暗紫色 国行正品 原装配件',
				images: ['/static/image/phone.png', '/static/image/phone.png', '/static/image/phone.png', '/static/image/phone.png'],
				status: 'active',
				remainingTime: 3600,
				currentPrice: 5200,
				originalPrice: 7999,
				startPrice: 5000,
				increment: 100,
				bidCount: 12,
				highestBidder: {
					id: 'user_1',
					name: '数码爱好者',
					avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
				},
				distance: '320m',
				time: '1小时前',
				views: 328,
				wantCount: 128,
				collectCount: 56,
				condition: '几乎全新',
				purchaseTime: '2024年3月',
				tradeMethod: '自提 / 同城配送',
				canNegotiate: '可小刀',
				description: '买了一年多，使用完好，无磕碰，屏幕无划痕。电池健康度 94%。原装充电器、数据线均在，随机盒子也有。因换新机处理，价格已让，非诚勿扰。'
			}
			this.$store.commit('setCurrentAuction', mockAuction)
			this.$store.commit('updateAuctionStatus', {
				isActive: mockAuction.status === 'active',
				remainingTime: mockAuction.remainingTime,
				currentPrice: mockAuction.currentPrice,
				startPrice: mockAuction.startPrice,
				increment: mockAuction.increment,
				bidCount: mockAuction.bidCount,
				highestBidder: mockAuction.highestBidder
			})
		},
		async loadAuctionDetail(id) {
			try {
				await this.$store.dispatch('getAuctionDetail', id)
				await this.$store.dispatch('getBidHistory', id)
				if (this.auctionStatus.remainingTime > 0 && this.auctionStatus.isActive) {
					this.$store.dispatch('startCountdown', {
						auctionId: id,
						remainingTime: this.auctionStatus.remainingTime
					})
				}
			} catch (error) {
				console.error('加载拍卖详情失败:', error)
				this.$utils.toast('加载失败，请重试')
			}
		},
		toggleCollect() {
			this.isCollected = !this.isCollected
			this.$utils.toast(this.isCollected ? '收藏成功' : '取消收藏')
		},
		toggleFollow() {
			this.isFollowed = !this.isFollowed
			this.$utils.toast(this.isFollowed ? '关注成功' : '取消关注')
		},
		contactSeller() {
			uni.navigateTo({
				url: `/package/pages/chat/chat?shopId=shop_${this.auctionDetail.userId || 'demo_shop'}&shopName=${encodeURIComponent(this.sellerInfo.name)}&goodsId=${this.auctionId || 'mock_1'}`
			})
		},
		likeComment(comment) {
			comment.isLiked = !comment.isLiked
			comment.likes = comment.isLiked ? comment.likes + 1 : comment.likes - 1
		},
		replyComment(comment) {
			this.$utils.toast('回复功能开发中')
		},
		focusCommentInput() {
			this.showCommentPopup()
		},
		showCommentPopup() {
			uni.showModal({
				title: '留言',
				editable: true,
				placeholderText: '说点什么...',
				success: (res) => {
					if (res.confirm && res.content.trim()) {
						this.submitComment(res.content)
					}
				}
			})
		},
		async submitComment(content) {
			if (!content.trim()) {
				return
			}
			this.isSubmitting = true
			try {
				const newComment = {
					id: Date.now(),
					username: '我',
					avatarBg: '#FF6B35',
					createTime: Date.now(),
					content: content,
					likes: 0,
					isLiked: false
				}
				this.commentList.unshift(newComment)
				this.$utils.toast('留言成功')
			} catch (error) {
				this.$utils.toast('发布失败')
			} finally {
				this.isSubmitting = false
			}
		},
		goToSellerHome() {
			this.$utils.toast('卖家主页开发中')
		},
		goToWantList() {
			this.$utils.toast('想买列表开发中')
		},
		goToCollectList() {
			this.$utils.toast('收藏列表开发中')
		},
		goToSellerOnSale() {
			this.$utils.toast('在售商品开发中')
		},
		goToSellerSold() {
			this.$utils.toast('已售商品开发中')
		},
		goToSellerFans() {
			this.$utils.toast('粉丝列表开发中')
		},
		goToAllReviews() {
			this.$utils.toast('全部评价开发中')
		},
		goToSellerAllGoods() {
			this.$utils.toast('全部宝贝开发中')
		}
	}
}
</script>

<style lang="scss" scoped>
.detail-page {
	padding-bottom: 0;
	background-color: #f8f8f8;
	min-height: 100vh;
	padding-bottom: 200rpx;
}

.section-title {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
	
	text {
		font-size: 32rpx;
		color: #333;
		font-weight: 600;
	}
	
	.comment-count {
		font-size: 26rpx;
		color: #999;
		margin-left: 8rpx;
		font-weight: normal;
	}
}

/* 图片轮播区域 */
.image-section {
	height: 500rpx;
	background: linear-gradient(180deg, #B8E6C8 0%, #FFF8F0 100%);
	position: relative;

	.swiper {
		width: 100%;
		height: 100%;

		.swiper-image {
			width: 100%;
			height: 100%;
		}
	}
	
	.page-indicator {
		position: absolute;
		right: 24rpx;
		bottom: 24rpx;
		background: rgba(0, 0, 0, 0.4);
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		
		text {
			font-size: 22rpx;
			color: #fff;
		}
	}
}

/* 价格卡片 */
.price-card {
	margin: -40rpx 20rpx 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 24rpx;
	position: relative;
	z-index: 1;

	.price-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 16rpx;
	}

	.price-row {
		display: flex;
		flex-direction: column;
		gap: 8rpx;

		.current-price-wrap {
			display: flex;
			align-items: baseline;

			.price-symbol {
				font-size: 32rpx;
				color: #ff4d4f;
				font-weight: 600;
			}

			.current-price {
				font-size: 56rpx;
				color: #ff4d4f;
				font-weight: 700;
			}
		}
		
		.original-price-wrap {
			.original-price {
				font-size: 24rpx;
				color: #999;
				text-decoration: line-through;
			}
		}
	}

	.condition-tag {
		background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		
		text {
			font-size: 22rpx;
			color: #fff;
			font-weight: 500;
		}
	}

	.goods-title {
		font-size: 30rpx;
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

/* 商品描述卡片 */
.desc-card {
	margin: 0 20rpx 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 24rpx;

	.desc-content {
		font-size: 28rpx;
		color: #444;
		line-height: 1.8;
		display: block;
		margin-bottom: 24rpx;
	}
	
	.attr-list {
		background-color: #fafafa;
		border-radius: 16rpx;
		padding: 8rpx 20rpx;
		
		.attr-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #f0f0f0;
			
			&:last-child {
				border-bottom: none;
			}
			
			.attr-label {
				font-size: 26rpx;
				color: #999;
			}
			
			.attr-text {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
			}
			
			.attr-value {
				display: flex;
				align-items: center;
				
				.value-badge {
					background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
					padding: 6rpx 20rpx;
					border-radius: 16rpx;
					
					text {
						font-size: 22rpx;
						color: #fff;
						font-weight: 500;
					}
					
					&.green {
						background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
					}
				}
			}
		}
	}
}

/* 卖家详情卡片 */
.seller-card {
	margin: 0 20rpx 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 24rpx;

	.seller-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.seller-info {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.seller-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		overflow: hidden;
		background: linear-gradient(135deg, #FF8C70 0%, #FF6B6B 100%);
		
		image {
			width: 100%;
			height: 100%;
		}
	}

	.seller-detail {
		.seller-name-row {
			display: flex;
			align-items: center;
			gap: 12rpx;
			margin-bottom: 4rpx;
			
			.seller-name {
				font-size: 30rpx;
				color: #333;
				font-weight: 600;
			}
			
			.verify-tags {
				display: flex;
				gap: 8rpx;
				
				.verify-tag {
					display: flex;
					align-items: center;
					gap: 4rpx;
					background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
					padding: 4rpx 12rpx;
					border-radius: 8rpx;
					
					text {
						font-size: 18rpx;
						color: #fff;
					}
					
					&.credit {
						background: linear-gradient(135deg, #FAAD14 0%, #FFC53D 100%);
					}
				}
			}
		}
	}

	.follow-btn {
		background: linear-gradient(135deg, #FF8C70 0%, #FF6B6B 100%);
		padding: 12rpx 32rpx;
		border-radius: 24rpx;
		
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

	.seller-stats {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 0;
		border-top: 1rpx solid #f0f0f0;
		border-bottom: 1rpx solid #f0f0f0;
		margin-bottom: 24rpx;

		.stat-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 4rpx;

			.stat-num {
				font-size: 32rpx;
				color: #333;
				font-weight: 600;
			}

			.stat-label {
				font-size: 22rpx;
				color: #999;
			}
		}
	}

	.reviews-section {
		margin-bottom: 24rpx;

		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			.section-title {
				margin-bottom: 0;
				font-size: 28rpx;
				color: #333;
				font-weight: 600;
			}
			
			.view-all {
				display: flex;
				align-items: center;
				gap: 4rpx;
				
				text {
					font-size: 24rpx;
					color: #999;
				}
			}
		}

		.reviews-list {
			.review-item {
				margin-bottom: 20rpx;
				padding-bottom: 20rpx;
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
					margin-bottom: 12rpx;
					
					.reviewer-name {
						font-size: 26rpx;
						color: #666;
						font-weight: 500;
					}
					
					.stars {
						display: flex;
						gap: 2rpx;
					}
				}

				.review-content {
					font-size: 26rpx;
					color: #666;
					line-height: 1.6;
				}
			}
		}
	}

	.more-goods {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
		background-color: #fafafa;
		border-radius: 16rpx;

		.more-text {
			font-size: 26rpx;
			color: #666;
		}
	}
}

/* 留言区域 */
.comment-section {
	margin: 0 20rpx 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 24rpx;

	.comment-list {
		.comment-item {
			display: flex;
			gap: 20rpx;
			margin-bottom: 30rpx;

			&:last-child {
				margin-bottom: 0;
			}

			.user-avatar {
				width: 72rpx;
				height: 72rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				
				text {
					color: #fff;
					font-size: 28rpx;
					font-weight: 500;
				}
			}

			.comment-body {
				flex: 1;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid #f0f0f0;

				.comment-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 8rpx;

					.username {
						font-size: 26rpx;
						color: #666;
						font-weight: 500;
					}

					.time {
						font-size: 22rpx;
						color: #999;
					}
				}

				.content {
					font-size: 28rpx;
					color: #333;
					line-height: 1.5;
					margin-bottom: 12rpx;
				}
				
				.comment-actions {
					display: flex;
					gap: 24rpx;
					
					.action-item {
						display: flex;
						align-items: center;
						gap: 6rpx;
						
						text {
							font-size: 24rpx;
							color: #999;
						}
					}
				}
			}
			
			&:last-child .comment-body {
				border-bottom: none;
			}
		}

		.empty-comment {
			padding: 60rpx 0;
			text-align: center;
			
			text {
				font-size: 26rpx;
				color: #999;
			}
		}
	}
}

/* 底部操作栏 */
.safe-bottom-placeholder {
	height: calc(120rpx + env(safe-area-inset-bottom));
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
				color: #666;
				margin-top: 4rpx;
				
				&.active {
					color: #ff4d4f;
				}
			}
		}
	}

	.footer-right {
		flex: 1;
		margin-left: 40rpx;
		
		.contact-btn {
			width: 100%;
			height: 80rpx;
			font-weight: 600;
			background: linear-gradient(135deg, #FF6B6B 0%, #FF8C70 100%);
			border: none;
		}
	}
}

/* 悬浮输入框 */
.input-bar {
	position: fixed;
	bottom: 120rpx;
	left: 20rpx;
	right: 20rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
	z-index: 99;
	padding-bottom: env(safe-area-inset-bottom);

	.input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12rpx;
		background-color: #fff;
		border-radius: 40rpx;
		padding: 16rpx 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);

		.avatar-small {
			width: 56rpx;
			height: 56rpx;
			border-radius: 50%;
			background-color: #f5f5f5;
			display: flex;
			align-items: center;
			justify-content: center;
			
			text {
				font-size: 32rpx;
			}
		}

		.input-placeholder {
			font-size: 26rpx;
			color: #bbb;
		}
	}

	.send-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #FF6B6B 0%, #FF8C70 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
	}
}
</style>
