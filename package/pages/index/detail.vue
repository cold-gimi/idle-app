<template>
	<view class="detail-page">
		<!-- 商品图片轮播 -->
		<view class="image-section">
			<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" indicator-color="rgba(255,255,255,0.6)" indicator-active-color="#FF6B35">
				<swiper-item v-for="(img, index) in auctionDetail.images" :key="index">
					<image class="swiper-image" :src="img" mode="aspectFit"></image>
				</swiper-item>
			</swiper>
		</view>

		<!-- 价格信息 -->
		<view class="price-card">
			<view class="price-row">
				<view class="current-price-wrap">
					<text class="price-symbol">¥</text>
					<text class="current-price">{{ formattedCurrentPrice }}</text>
				</view>
			</view>
			<text class="goods-title">{{ auctionDetail.title }}</text>
			<view class="meta-row">
				<view class="meta-item">
					<u-icon name="map-fill" color="#999" size="24"></u-icon>
					<text>距离 {{ auctionDetail.distance }}</text>
				</view>
				<view class="meta-item">
					<u-icon name="clock-fill" color="#999" size="24"></u-icon>
					<text>{{ auctionDetail.time }}</text>
				</view>
				<view class="meta-item">
					<u-icon name="eye-fill" color="#999" size="24"></u-icon>
					<text>浏览 {{ auctionDetail.views }}次</text>
				</view>
			</view>

			<!-- 统计信息 -->
			<view class="stats-row">
				<view class="stat-item">
					<text class="stat-num">{{ auctionDetail.wantCount || 0 }}</text>
					<text class="stat-label">想买</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ auctionDetail.collectCount || 0 }}</text>
					<text class="stat-label">收藏</text>
				</view>
			</view>
		</view>

		<!-- 商品描述 -->
		<view class="desc-card">
			<view class="section-title">
				<text>商品详情</text>
			</view>
			<text class="desc-content">{{ auctionDetail.description }}</text>
		</view>

		<!-- 留言区域 -->
		<view class="comment-section">
			<view class="section-title">
				<text>留言</text>
				<text class="comment-count">({{ bidHistory.length }})</text>
			</view>
			
			<!-- 快速留言输入框 -->
			<view class="comment-input-bar">
				<view class="input-wrapper">
					<input 
						type="text" 
						v-model="bidMessage" 
						placeholder="看对眼了,留言问问~" 
						confirm-type="send"
						@confirm="submitBid"
					/>
				</view>
				<view class="add-btn" @click="submitBid">
					<u-icon name="plus" color="#fff" size="32"></u-icon>
				</view>
			</view>

			<!-- 留言列表 -->
			<view class="comment-list">
				<view v-for="bid in sortedBidHistory" :key="bid.id" class="comment-item">
					<view class="user-avatar" :style="{ background: bid.avatarBg || '#eee' }">
						<text>{{ bid.username ? bid.username.charAt(0) : '?' }}</text>
					</view>
					<view class="comment-body">
						<view class="comment-header">
							<text class="username">{{ bid.username || '用户' }}</text>
							<text class="time">{{ getTimeAgo(bid.createTime) }}</text>
						</view>
						<text class="content">{{ bid.message }}</text>
					</view>
				</view>
				<view v-if="bidHistory.length === 0" class="empty-comment">
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
					联系商家
				</u-button>
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
			auctionId: '',
			showBidKeyboard: false,
			bidPrice: '',
			bidMessage: '',
			bidError: '',
			isSubmitting: false,
			quickAddAmounts: [1, 5, 10, 50, 100],
			auctionDetail: {
				images: ['/static/image/phone.png', '/static/image/phone.png', '/static/image/phone.png'],
				title: 'iPhone 15 Pro Max 256GB 原色钛金属',
				distance: '120m',
				time: '10分钟前',
				views: 328,
				wantCount: 128,
				collectCount: 56,
				description: 'iPhone 15 Pro Max 256GB 原色钛金属，几乎全新。购买不到半年因个人原因转手。所有原装配件齐全包装盒也在。'
			}
		}
	},
	computed: {
		...mapState(['auctionStatus', 'bidHistory', 'currentAuction']),
		formattedCurrentPrice() {
			return this.$utils.formatPriceWithComma(this.auctionStatus.currentPrice)
		},
		formattedStartPrice() {
			return this.$utils.formatPriceWithComma(this.auctionStatus.startPrice)
		},
		formattedMinBid() {
			const minBid = this.$utils.calculateMinBid(this.auctionStatus.currentPrice, this.auctionStatus.increment)
			return this.$utils.formatPriceWithComma(minBid)
		},
		auctionStatusText() {
			return this.$utils.getAuctionStatusText(
				this.auctionStatus.isActive ? 'active' : (this.auctionStatus.remainingTime > 0 ? 'pending' : 'ended'),
				this.auctionStatus.remainingTime
			)
		},
		auctionStatusType() {
			return this.$utils.getAuctionStatusType(
				this.auctionStatus.isActive ? 'active' : (this.auctionStatus.remainingTime > 0 ? 'pending' : 'ended'),
				this.auctionStatus.remainingTime
			)
		},
		countdownDetail() {
			return this.$utils.formatCountdownDetail(this.auctionStatus.remainingTime)
		},
		sortedBidHistory() {
			return this.$utils.sortBidHistory(this.bidHistory, 'desc')
		},
		canBid() {
			return this.auctionStatus.isActive && this.auctionStatus.remainingTime > 0
		},
		canSubmitBid() {
			if (this.isSubmitting) return false
			if (!this.bidPrice) return false
			if (this.bidError) return false
			const price = Number(this.bidPrice)
			return this.$utils.validateBidPrice(price, this.auctionStatus.currentPrice, this.auctionStatus.increment)
		}
	},
	watch: {
		bidPrice(newVal) {
			this.validateBidPrice(newVal)
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
		formattedPrice(price) {
			return this.$utils.formatPriceWithComma(price)
		},
		getTimeAgo(timestamp) {
			return this.$utils.getTimeAgo(timestamp)
		},
		loadMockData() {
			const mockAuction = {
				id: 'mock_1',
				title: 'iPhone 15 Pro Max 256GB 原色钛金属',
				images: ['/static/image/phone.png', '/static/image/phone.png', '/static/image/phone.png'],
				status: 'active',
				remainingTime: 3600,
				currentPrice: 6888,
				startPrice: 5000,
				increment: 100,
				bidCount: 12,
				highestBidder: {
					id: 'user_1',
					name: '数码爱好者',
					avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
				},
				distance: '120m',
				time: '10分钟前',
				views: 328,
				wantCount: 128,
				collectCount: 56,
				description: 'iPhone 15 Pro Max 256GB 原色钛金属，几乎全新。购买不到半年因个人原因转手。所有原装配件齐全包装盒也在。'
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
			const mockHistory = [
				{
					id: 1,
					auctionId: 'mock_1',
					price: 6888,
					userId: 'user_1',
					username: '数码爱好者',
					avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					createTime: Date.now() - 60000,
					status: 'success',
					message: '诚心要，能自提'
				},
				{
					id: 2,
					auctionId: 'mock_1',
					price: 6700,
					userId: 'user_2',
					username: '手机收藏家',
					avatarBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
					createTime: Date.now() - 300000,
					status: 'success'
				},
				{
					id: 3,
					auctionId: 'mock_1',
					price: 6500,
					userId: 'user_3',
					username: '阿杰数码',
					avatarBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
					createTime: Date.now() - 600000,
					status: 'success'
				}
			]
			this.$store.commit('setBidHistory', mockHistory)
			this.$store.dispatch('startCountdown', {
				auctionId: 'mock_1',
				remainingTime: mockAuction.remainingTime
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
		contactSeller() {
			// 跳转到聊天页面
			uni.navigateTo({
				url: `/package/pages/chat/chat?shopId=shop_${this.auctionDetail.userId || 'demo_shop'}&shopName=${encodeURIComponent('商家客服')}&goodsId=${this.auctionId || 'mock_1'}`
			})
		},
		openBidKeyboard() {
			if (!this.canBid) {
				this.$utils.toast('当前无法出价')
				return
			}
			this.bidPrice = ''
			this.bidMessage = ''
			this.bidError = ''
			this.showBidKeyboard = true
		},
		closeBidKeyboard() {
			this.showBidKeyboard = false
			this.bidPrice = ''
			this.bidMessage = ''
			this.bidError = ''
		},
		validateBidPrice(price) {
			if (!price || price === '') {
				this.bidError = ''
				return true
			}
			const numPrice = Number(price)
			if (isNaN(numPrice)) {
				this.bidError = '请输入有效的数字'
				return false
			}
			const minBid = this.$utils.calculateMinBid(this.auctionStatus.currentPrice, this.auctionStatus.increment)
			if (numPrice < minBid) {
				this.bidError = `最低出价为 ¥${this.$utils.formatPrice(minBid)}`
				return false
			}
			if (numPrice > 99999999) {
				this.bidError = '出价金额过大'
				return false
			}
			this.bidError = ''
			return true
		},
		quickAddBid(amount) {
			const currentPrice = Number(this.bidPrice) || this.auctionStatus.currentPrice
			const minBid = this.$utils.calculateMinBid(this.auctionStatus.currentPrice, this.auctionStatus.increment)
			let newPrice
			if (Number(this.bidPrice) > this.auctionStatus.currentPrice) {
				newPrice = Number(this.bidPrice) + Number(amount)
			} else {
				newPrice = Math.max(minBid, this.auctionStatus.currentPrice + Number(amount))
			}
			this.bidPrice = newPrice.toString()
		},
		async submitBid() {
			if (!this.bidMessage.trim()) {
				return
			}
			this.isSubmitting = true
			try {
				const newComment = {
					id: Date.now(),
					username: '我',
					avatarBg: '#FF6B35',
					createTime: Date.now(),
					message: this.bidMessage
				}
				this.$store.commit('setBidHistory', [newComment, ...this.bidHistory])
				this.bidMessage = '' // 清空输入框
				this.$utils.toast('留言成功')
			} catch (error) {
				this.$utils.toast('发布失败')
			} finally {
				this.isSubmitting = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.detail-page {
	padding-bottom: 0;
	background-color: #f8f8f8;
	min-height: 100vh;
}

.section-title {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	
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

.desc-card {
	margin: 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 24rpx;

	.desc-content {
		font-size: 28rpx;
		color: #444;
		line-height: 1.6;
		display: block;
	}
}

.comment-section {
	margin: 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 24rpx;

	.comment-input-bar {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 40rpx;

		.input-wrapper {
			flex: 1;
			height: 80rpx;
			background-color: #f5f7fa;
			border-radius: 40rpx;
			padding: 0 30rpx;
			display: flex;
			align-items: center;

			input {
				width: 100%;
				font-size: 28rpx;
				color: #333;
			}
		}

		.add-btn {
			width: 80rpx;
			height: 80rpx;
			background-color: #ff4d4f;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);

			&:active {
				opacity: 0.8;
				transform: scale(0.95);
			}
		}
	}

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
		}
	}
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

.countdown-card {
	margin: -40rpx 20rpx 20rpx;
	padding: 24rpx;
	background-color: #fff;
	border-radius: 20rpx;
	position: relative;
	z-index: 1;

	.countdown-header {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 20rpx;

		.countdown-title {
			font-size: 26rpx;
			color: #666;
		}
	}

	.countdown-timer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;

		.time-box {
			display: flex;
			flex-direction: column;
			align-items: center;
			background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
			border-radius: 8rpx;
			padding: 8rpx 12rpx;
			min-width: 60rpx;

			.time-num {
				font-size: 32rpx;
				color: #fff;
				font-weight: 700;
			}

			.time-label {
				font-size: 20rpx;
				color: rgba(255, 255, 255, 0.8);
			}
		}

		.time-colon {
			font-size: 32rpx;
			color: #ff4d4f;
			font-weight: 700;
		}
	}
}

.price-card {
	margin: 0 20rpx 20rpx;
	padding: 30rpx;
	background-color: #fff;
	border-radius: 20rpx;
	position: relative;
	z-index: 1;

	.price-row {
		display: flex;
		align-items: flex-end;
		gap: 16rpx;
		margin-bottom: 16rpx;

		.current-price-wrap {
			display: flex;
			align-items: baseline;

			.price-symbol {
				font-size: 28rpx;
				color: #ff4d4f;
				font-weight: 600;
			}

			.current-price {
				font-size: 48rpx;
				color: #ff4d4f;
				font-weight: 700;
			}
		}

		.price-info {
			display: flex;
			flex-direction: column;
			gap: 4rpx;

			.original-price {
				font-size: 24rpx;
				color: #999;
				text-decoration: line-through;
			}

			.increment-price {
				font-size: 22rpx;
				color: #999;
			}
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
		padding-bottom: 24rpx;
		border-bottom: 1rpx solid #f0f0f0;

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

	.highest-bidder {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding-top: 20rpx;

		.bidder-avatar {
			width: 72rpx;
			height: 72rpx;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;

			.bidder-avatar-text {
				color: #fff;
				font-size: 28rpx;
				font-weight: 500;
			}
		}

		.bidder-info {
			display: flex;
			flex-direction: column;
			gap: 4rpx;
			flex: 1;

			.bidder-name {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
			}

			.bidder-status {
				font-size: 22rpx;
				color: #52c41a;
			}
		}
	}
}

.message-board-card {
	margin: 0 20rpx 20rpx;
	padding: 24rpx;
	background-color: #fff;
	border-radius: 20rpx;

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;

		.history-title {
			font-size: 30rpx;
			color: #333;
			font-weight: 600;
		}

		.history-count {
			font-size: 24rpx;
			color: #999;
		}
	}

	.history-list {
		.history-item {
			display: flex;
			gap: 16rpx;
			padding-bottom: 24rpx;
			margin-bottom: 24rpx;
			border-bottom: 1rpx solid #f0f0f0;

			&:last-child {
				padding-bottom: 0;
				margin-bottom: 0;
				border-bottom: none;
			}

			.history-avatar {
				width: 64rpx;
				height: 64rpx;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;

				.history-avatar-text {
					color: #fff;
					font-size: 24rpx;
				}
			}

			.history-content {
				flex: 1;

				.history-row {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 8rpx;

					.history-name {
						font-size: 26rpx;
						color: #666;
					}

					.history-time {
						font-size: 22rpx;
						color: #999;
					}
				}

				.history-message {
					font-size: 28rpx;
					color: #333;
					line-height: 1.5;
				}
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

.bid-keyboard-popup {
	padding: 30rpx;
	background-color: #fff;

	.keyboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;

		.keyboard-title {
			font-size: 32rpx;
			color: #333;
			font-weight: 600;
		}
	}

	.keyboard-content {
		.message-section {
			margin-bottom: 40rpx;

			.message-input-wrap {
				background-color: #f5f7fa;
				border-radius: 12rpx;
				padding: 20rpx;
				position: relative;

				.message-textarea {
					width: 100%;
					height: 200rpx;
					font-size: 28rpx;
					color: #333;
				}

				.word-count {
					position: absolute;
					bottom: 10rpx;
					right: 20rpx;
					font-size: 22rpx;
					color: #999;
				}
			}
		}

		.submit-bid-btn {
			width: 100%;
			height: 88rpx;
		}
	}
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	height: 110rpx;
	background-color: #fff;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	padding-bottom: env(safe-area-inset-bottom);
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 100;

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 40rpx;
		gap: 4rpx;

		text {
			font-size: 20rpx;
			color: #666;

			&.collected {
				color: #ff4d4f;
			}
		}
	}

	.buy-btn {
		flex: 1;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;

		text {
			font-size: 30rpx;
			font-weight: 600;
		}
	}
}
</style>
