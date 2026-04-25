<template>
	<view class="detail-page">
		<u-loading-page :loading="isLoading" loading-text="加载中..." v-if="isLoading"></u-loading-page>
		
		<view v-else>
			<!-- 商品图片轮播 -->
			<view class="image-section">
				<swiper class="swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" indicator-color="rgba(255,255,255,0.6)" indicator-active-color="#FF6B35">
					<swiper-item v-for="(img, index) in currentAuction.images" :key="index">
						<image class="swiper-image" :src="img" mode="aspectFit"></image>
					</swiper-item>
				</swiper>
			</view>

		<!-- 倒计时和拍卖状态 -->
		<view class="countdown-card">
			<view class="countdown-header">
				<u-tag :text="auctionStatusText" size="mini" :type="auctionStatusType"></u-tag>
				<text class="countdown-title" v-if="auctionStatus.isActive">距离结束还有</text>
				<text class="countdown-title" v-else-if="auctionStatus.remainingTime > 0">即将开始</text>
				<text class="countdown-title" v-else>拍卖已结束</text>
			</view>
			<view class="countdown-timer" v-if="auctionStatus.remainingTime > 0">
				<view class="time-box">
					<text class="time-num">{{ countdownDetail.days.toString().padStart(2, '0') }}</text>
					<text class="time-label">天</text>
				</view>
				<text class="time-colon">:</text>
				<view class="time-box">
					<text class="time-num">{{ countdownDetail.hours.toString().padStart(2, '0') }}</text>
					<text class="time-label">时</text>
				</view>
				<text class="time-colon">:</text>
				<view class="time-box">
					<text class="time-num">{{ countdownDetail.minutes.toString().padStart(2, '0') }}</text>
					<text class="time-label">分</text>
				</view>
				<text class="time-colon">:</text>
				<view class="time-box">
					<text class="time-num">{{ countdownDetail.seconds.toString().padStart(2, '0') }}</text>
					<text class="time-label">秒</text>
				</view>
			</view>
		</view>

		<!-- 价格信息 -->
		<view class="price-card">
			<view class="price-row">
				<view class="current-price-wrap">
					<text class="price-symbol">¥</text>
					<text class="current-price">{{ formattedCurrentPrice }}</text>
				</view>
				<view class="price-info">
					<text class="original-price">起拍价 ¥{{ formattedStartPrice }}</text>
					<text class="increment-price">加价幅度 ¥{{ auctionStatus.increment }}</text>
				</view>
			</view>
			<text class="goods-title">{{ currentAuction.title }}</text>
			<view class="meta-row">
				<view class="meta-item">
					<u-icon name="map-fill" color="#999" size="24"></u-icon>
					<text>距离 {{ currentAuction.distance }}</text>
				</view>
				<view class="meta-item">
					<u-icon name="clock-fill" color="#999" size="24"></u-icon>
					<text>{{ currentAuction.time }}</text>
				</view>
				<view class="meta-item">
					<u-icon name="eye-fill" color="#999" size="24"></u-icon>
					<text>浏览 {{ currentAuction.views }}次</text>
				</view>
			</view>

			<!-- 统计信息 -->
			<view class="stats-row">
				<view class="stat-item">
					<text class="stat-num">{{ auctionStatus.bidCount }}</text>
					<text class="stat-label">出价次数</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ currentAuction.wantCount || 0 }}</text>
					<text class="stat-label">想买</text>
				</view>
				<view class="stat-item">
					<text class="stat-num">{{ currentAuction.collectCount || 0 }}</text>
					<text class="stat-label">收藏</text>
				</view>
			</view>

			<!-- 最高出价者 -->
			<view class="highest-bidder" v-if="auctionStatus.highestBidder">
				<view class="bidder-avatar" :style="{ background: auctionStatus.highestBidder.avatarBg || '#667eea' }">
					<text class="bidder-avatar-text">{{ auctionStatus.highestBidder.name ? auctionStatus.highestBidder.name.charAt(0) : '?' }}</text>
				</view>
				<view class="bidder-info">
					<text class="bidder-name">{{ auctionStatus.highestBidder.name }}</text>
					<text class="bidder-status">当前最高出价者</text>
				</view>
				<u-tag text="领先" type="success" size="mini"></u-tag>
			</view>
		</view>

		<!-- 出价历史 -->
		<view class="history-card" v-if="bidHistory.length > 0">
			<view class="history-header">
				<text class="history-title">出价历史</text>
				<text class="history-count">共 {{ bidHistory.length }} 次</text>
			</view>
			<scroll-view scroll-y="true" class="history-list">
				<view v-for="(bid, index) in sortedBidHistory" :key="bid.id" class="history-item">
					<view class="history-avatar" :style="{ background: bid.avatarBg || '#667eea' }">
						<text class="history-avatar-text">{{ bid.username ? bid.username.charAt(0) : '?' }}</text>
					</view>
					<view class="history-content">
						<view class="history-row">
							<text class="history-name">{{ bid.username || '用户' }}</text>
							<text class="history-time">{{ getTimeAgo(bid.createTime) }}</text>
						</view>
						<view class="history-bid">
							<text class="history-price">¥{{ formattedPrice(bid.price) }}</text>
							<u-tag v-if="bid.status === 'success'" text="成功" type="success" size="mini"></u-tag>
							<u-tag v-else text="失败" type="error" size="mini"></u-tag>
						</view>
						<text v-if="bid.message" class="history-message">{{ bid.message }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 商品描述 -->
		<view class="desc-card">
			<view class="desc-title">
				<u-icon name="file-text-fill" color="#333" size="28"></u-icon>
				<text>商品描述</text>
			</view>
			<text class="desc-content">{{ currentAuction.description }}</text>
		</view>

		<!-- 底部占位 -->
		<view class="bottom-placeholder"></view>
		</view>

		<!-- 出价键盘弹窗 -->
		<u-popup :show="showBidKeyboard" mode="bottom" @close="closeBidKeyboard" :safe-area-inset-bottom="true">
			<view class="bid-keyboard-popup">
				<view class="keyboard-header">
					<text class="keyboard-title">出价</text>
					<u-icon name="close" size="40" color="#999" @click="closeBidKeyboard"></u-icon>
				</view>
				<view class="keyboard-content">
					<view class="current-price-info">
						<text class="label">当前价格</text>
						<text class="price">¥{{ formattedCurrentPrice }}</text>
					</view>
					<view class="min-bid-info">
						<text class="label">最低出价</text>
						<text class="min-price">¥{{ formattedMinBid }}</text>
					</view>
					<view class="bid-input-section">
						<view class="input-label">我的出价</view>
						<view class="input-wrap">
							<text class="input-symbol">¥</text>
							<input 
								class="bid-input" 
								type="digit" 
								v-model="bidPrice" 
								placeholder="请输入出价金额"
								:focus="true"
								:maxlength="10"
							/>
						</view>
						<text v-if="bidError" class="error-text">{{ bidError }}</text>
					</view>
					<view class="quick-bid-section">
						<view class="quick-bid-title">快捷加价</view>
						<view class="quick-bid-btns">
							<view 
								v-for="(add, index) in quickAddAmounts" 
								:key="index"
								class="quick-btn"
								@click="quickAddBid(add)"
							>
								<text>+{{ add }}</text>
							</view>
						</view>
					</view>
					<view class="message-section">
						<view class="input-label">留言（可选）</view>
						<view class="message-input-wrap">
							<input 
								class="message-input" 
								type="text" 
								v-model="bidMessage" 
								placeholder="可以给卖家留言..."
								:maxlength="50"
							/>
						</view>
					</view>
					<u-button 
						type="error" 
						shape="circle" 
						class="submit-bid-btn"
						:disabled="!canSubmitBid"
						:loading="isSubmitting"
						@click="submitBid"
					>
						{{ isSubmitting ? '出价中...' : '确认出价' }}
					</u-button>
				</view>
			</view>
		</u-popup>

		<!-- 底部操作栏 -->
		<view class="bottom-bar">
			<view class="action-item" @click="toggleCollect">
				<u-icon :name="isCollected ? 'heart-fill' : 'heart'" :color="isCollected ? '#ff4d4f' : '#999'" size="40"></u-icon>
				<text :class="{ collected: isCollected }">收藏</text>
			</view>
			<view class="action-item" @click="contactSeller">
				<u-icon name="chat" color="#999" size="40"></u-icon>
				<text>联系</text>
			</view>
			<u-button 
				type="warning" 
				shape="circle" 
				class="contact-btn" 
				@click="openBidKeyboard"
				:disabled="!canBid"
			>
				<u-icon name="gift" color="#fff" size="28"></u-icon>
				<text>我要出价</text>
			</u-button>
			<u-button 
				type="error" 
				shape="circle" 
				class="buy-btn" 
				v-if="!canBid"
				:disabled="true"
			>
				{{ auctionStatus.isActive ? '拍卖进行中' : '拍卖已结束' }}
			</u-button>
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
			isLoading: true,
			quickAddAmounts: [1, 5, 10, 50, 100]
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
		this.isLoading = true
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
			try {
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
			} finally {
				this.isLoading = false
			}
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
			} finally {
				this.isLoading = false
			}
		},
		toggleCollect() {
			this.isCollected = !this.isCollected
			this.$utils.toast(this.isCollected ? '收藏成功' : '取消收藏')
		},
		contactSeller() {
			this.$utils.toast('联系卖家')
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
			if (!this.canSubmitBid) {
				return
			}
			const price = Number(this.bidPrice)
			if (!this.$utils.validateBidPrice(price, this.auctionStatus.currentPrice, this.auctionStatus.increment)) {
				this.bidError = `出价必须高于当前价格，且每次加价至少${this.auctionStatus.increment}元`
				return
			}
			this.isSubmitting = true
			try {
				await this.$store.dispatch('placeBid', {
					auctionId: this.auctionId || 'mock_1',
					price: price,
					message: this.bidMessage
				})
				this.closeBidKeyboard()
				this.$utils.toast('出价成功')
			} catch (error) {
				console.error('出价失败:', error)
				this.$utils.toast(error.message || '出价失败')
			} finally {
				this.isSubmitting = false
			}
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

.history-card {
	margin: 0 20rpx 20rpx;
	padding: 24rpx;
	background-color: #fff;
	border-radius: 20rpx;

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		padding-bottom: 16rpx;
		border-bottom: 1rpx solid #f0f0f0;

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
		max-height: 400rpx;
	}

	.history-item {
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f5f5f5;

		&:last-child {
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
				font-size: 26rpx;
				font-weight: 500;
			}
		}

		.history-content {
			flex: 1;
			min-width: 0;

			.history-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 8rpx;

				.history-name {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
				}

				.history-time {
					font-size: 22rpx;
					color: #999;
				}
			}

			.history-bid {
				display: flex;
				align-items: center;
				gap: 12rpx;
				margin-bottom: 4rpx;

				.history-price {
					font-size: 30rpx;
					color: #ff4d4f;
					font-weight: 600;
				}
			}

			.history-message {
				font-size: 24rpx;
				color: #999;
				margin-top: 4rpx;
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
	background-color: #fff;
	border-radius: 32rpx 32rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);

	.keyboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.keyboard-title {
			font-size: 32rpx;
			color: #333;
			font-weight: 600;
		}
	}

	.keyboard-content {
		padding: 32rpx;

		.current-price-info,
		.min-bid-info {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16rpx;

			.label {
				font-size: 26rpx;
				color: #666;
			}

			.price {
				font-size: 36rpx;
				color: #ff4d4f;
				font-weight: 600;
			}

			.min-price {
				font-size: 28rpx;
				color: #ff4d4f;
			}
		}

		.bid-input-section {
			margin-top: 24rpx;
			margin-bottom: 24rpx;

			.input-label {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 12rpx;
			}

			.input-wrap {
				display: flex;
				align-items: center;
				background-color: #f5f5f5;
				border-radius: 16rpx;
				padding: 24rpx;

				.input-symbol {
					font-size: 32rpx;
					color: #333;
					font-weight: 600;
					margin-right: 8rpx;
				}

				.bid-input {
					flex: 1;
					font-size: 40rpx;
					color: #333;
					font-weight: 600;
				}
			}

			.error-text {
				font-size: 24rpx;
				color: #ff4d4f;
				margin-top: 8rpx;
			}
		}

		.quick-bid-section {
			margin-bottom: 24rpx;

			.quick-bid-title {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 16rpx;
			}

			.quick-bid-btns {
				display: flex;
				flex-wrap: wrap;
				gap: 16rpx;

				.quick-btn {
					flex: 1;
					min-width: 100rpx;
					padding: 16rpx;
					background-color: #f5f5f5;
					border-radius: 12rpx;
					text-align: center;

					text {
						font-size: 28rpx;
						color: #333;
						font-weight: 500;
					}

					&:active {
						background-color: #e8e8e8;
					}
				}
			}
		}

		.message-section {
			margin-bottom: 32rpx;

			.input-label {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 12rpx;
			}

			.message-input-wrap {
				background-color: #f5f5f5;
				border-radius: 16rpx;
				padding: 20rpx 24rpx;

				.message-input {
					font-size: 28rpx;
					color: #333;
				}
			}
		}

		.submit-bid-btn {
			height: 88rpx;
			font-size: 32rpx;
			font-weight: 600;
		}
	}
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
	padding-bottom: calc(10rpx + env(safe-area-inset-bottom));
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
