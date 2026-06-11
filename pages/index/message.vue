<template>
	<view class="page-message">
		<scroll-view scroll-y="true" scroll-with-animation="true" style="height: 100%;">
			<view v-if="auctionMessages.length > 0" class="auction-message-section">
				<view class="section-header">
					<u-icon name="gift" color="#ff4d4f" size="32"></u-icon>
					<text class="section-title">拍卖消息</text>
					<view v-if="unreadAuctionCount > 0" class="section-badge">
						<text class="badge-text">{{ unreadAuctionCount > 99 ? '99+' : unreadAuctionCount }}</text>
					</view>
				</view>
				<view v-for="(msg, index) in sortedAuctionMessages" :key="msg.id" class="message-item auction-item" :class="{ unread: !msg.read }" @click="handleAuctionMessageClick(msg)">
					<view class="avatar-wrap">
						<view class="avatar" :style="{ background: getAuctionMessageAvatarBg(msg.type) }">
							<text class="avatar-text">{{ getAuctionMessageIcon(msg.type) }}</text>
						</view>
						<view v-if="!msg.read" class="unread-dot"></view>
					</view>
					<view class="content-box">
						<view class="content-inner">
							<view class="u-flex u-row-between u-m-b-8">
								<text class="nickname">{{ msg.title }}</text>
								<text class="time">{{ getTimeAgo(msg.createTime) }}</text>
							</view>
							<view class="u-flex u-row-between">
								<view class="summary-wrap">
									<text class="tag" v-if="msg.type === 'bid'">出价</text>
									<text class="tag" v-else-if="msg.type === 'auction_end'">结束</text>
									<text class="tag" v-else-if="msg.type === 'outbid'">出价</text>
									<text class="tag" v-else-if="msg.type === 'won'">成交</text>
									<text class="summary">{{ msg.content }}</text>
								</view>
								<view v-if="msg.price" class="price-badge">
									<text class="price-text">¥{{ formattedPrice(msg.price) }}</text>
								</view>
							</view>
						</view>
						<u-line color="#ebedf0" v-if="index < sortedAuctionMessages.length - 1"></u-line>
					</view>
				</view>
			</view>

			<view class="normal-message-section" v-if="normalMessageList.length > 0">
				<view class="section-header">
					<u-icon name="chat-fill" color="#667eea" size="32"></u-icon>
					<text class="section-title">聊天消息</text>
				</view>
				<view v-for="(item, index) in normalMessageList" :key="index" class="message-item" @click="handleMessageClick(item)">
					<view class="avatar-wrap">
						<view class="avatar" :style="{ background: item.avatarBg }">
							<text class="avatar-text">{{ item.avatarText }}</text>
						</view>
						<view v-if="item.online" class="online-dot"></view>
						<view v-if="item.pinned" class="pinned-icon">
							<text class="iconfont icon-pushpin"></text>
						</view>
					</view>
					<view class="content-box">
						<view class="content-inner">
							<view class="u-flex u-row-between u-m-b-8">
								<text class="nickname">{{ item.nickname }}</text>
								<text class="time">{{ item.time }}</text>
							</view>
							<view class="u-flex u-row-between">
								<view class="summary-wrap">
									<text v-if="item.tag" class="tag">{{ item.tag }}</text>
									<text class="summary">{{ item.summary }}</text>
								</view>
								<view v-if="item.unread" class="unread-badge">
									<text class="unread-text">{{ item.unread > 99 ? '99+' : item.unread }}</text>
								</view>
							</view>
						</view>
						<u-line color="#ebedf0" v-if="index < normalMessageList.length - 1"></u-line>
					</view>
				</view>
			</view>

			<view v-if="auctionMessages.length === 0 && normalMessageList.length === 0" class="empty-message">
				<u-empty text="暂无消息" mode="message"></u-empty>
			</view>

			<view style="height: 30rpx;"></view>
		</scroll-view>
	</view>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
	data() {
		return {
			normalMessageList: [
				{
					nickname: '小雨同学',
					avatarText: '小',
					avatarBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
					time: '10:32',
					summary: '你好，这个还在吗？能便宜点吗？',
					tag: 'iPhone',
					unread: 3,
					online: true,
					pinned: false
				},
				{
					nickname: '阿杰数码',
					avatarText: '阿',
					avatarBg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
					time: '昨天',
					summary: '好的，那我们约周末在小区门口见',
					tag: '键盘',
					unread: 0,
					online: true,
					pinned: false
				},
				{
					nickname: '美美妈咪',
					avatarText: '美',
					avatarBg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
					time: '昨天',
					summary: '[图片] 这张照片可以吗？',
					tag: '推车',
					unread: 1,
					online: false,
					pinned: false
				},
				{
					nickname: 'Lucy穿搭',
					avatarText: 'L',
					avatarBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
					time: '周一',
					summary: '谢谢亲！好评已回~ 😊',
					tag: '',
					unread: 0,
					online: false,
					pinned: false
				},
				{
					nickname: '书虫小明',
					avatarText: '书',
					avatarBg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
					time: '03/15',
					summary: '收到啦，考研资料很有用！',
					tag: '',
					unread: 0,
					online: false,
					pinned: false
				}
			]
		}
	},
	computed: {
		...mapState(['auctionMessages']),
		sortedAuctionMessages() {
			return [...this.auctionMessages].sort((a, b) => {
				return b.createTime - a.createTime
			})
		},
		unreadAuctionCount() {
			return this.auctionMessages.filter(msg => !msg.read).length
		}
	},
	onShow() {
		this.markAllAuctionMessagesRead()
	},
	methods: {
		...mapActions([]),
		formattedPrice(price) {
			return this.$utils.formatPriceWithComma(price)
		},
		getTimeAgo(timestamp) {
			return this.$utils.getTimeAgo(timestamp)
		},
		getAuctionMessageAvatarBg(type) {
			const bgMap = {
				'bid': 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
				'auction_end': 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
				'outbid': 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
				'won': 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
			}
			return bgMap[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
		},
		getAuctionMessageIcon(type) {
			const iconMap = {
				'bid': '💰',
				'auction_end': '🏁',
				'outbid': '⚠️',
				'won': '🎉'
			}
			return iconMap[type] || '📢'
		},
		markAllAuctionMessagesRead() {
			this.$store.commit('setAuctionMessages', this.auctionMessages.map(msg => ({
				...msg,
				read: true
			})))
		},
		handleAuctionMessageClick(msg) {
			if (!msg.read) {
				const updatedMessages = this.auctionMessages.map(m => {
					if (m.id === msg.id) {
						return { ...m, read: true }
					}
					return m
				})
				this.$store.commit('setAuctionMessages', updatedMessages)
			}
			if (msg.auctionId) {
				this.$utils.route('/package/pages/index/detail', { id: msg.auctionId })
			}
		},
		handleMessageClick(item) {
			this.$utils.toast('打开聊天: ' + item.nickname)
		}
	}
}
</script>

<style lang="scss" scoped>
.page-message {
	height: 100vh;
	background-color: #f5f5f5;
}

.auction-message-section,
.normal-message-section {
	background-color: #fff;
	margin-bottom: 20rpx;

	.section-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 24rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		position: relative;

		.section-title {
			font-size: 28rpx;
			color: #333;
			font-weight: 600;
		}

		.section-badge {
			position: absolute;
			right: 30rpx;
			background-color: #ff4d4f;
			border-radius: 20rpx;
			padding: 4rpx 12rpx;
			min-width: 36rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.badge-text {
				font-size: 20rpx;
				color: #fff;
				font-weight: 500;
			}
		}
	}
}

.message-item {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #fff;

	&.auction-item {
		&.unread {
			background-color: #fff7f7;
		}
	}
}

.avatar-wrap {
	position: relative;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.avatar {
	width: 96rpx;
	height: 96rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-text {
	color: #fff;
	font-size: 40rpx;
	font-weight: 500;
}

.unread-dot {
	position: absolute;
	top: 0;
	right: -4rpx;
	width: 20rpx;
	height: 20rpx;
	background-color: #ff4d4f;
	border: 4rpx solid #fff;
	border-radius: 50%;
}

.online-dot {
	position: absolute;
	bottom: 4rpx;
	right: -4rpx;
	width: 20rpx;
	height: 20rpx;
	background-color: #52c41a;
	border: 4rpx solid #fff;
	border-radius: 50%;
}

.pinned-icon {
	position: absolute;
	top: -8rpx;
	left: -8rpx;
	width: 28rpx;
	height: 28rpx;
	background-color: #ff4d4f;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.content-box {
	flex: 1;
	min-width: 0;
}

.content-inner {
	padding-bottom: 20rpx;
}

.nickname {
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}

.time {
	font-size: 24rpx;
	color: #999;
	flex-shrink: 0;
}

.summary-wrap {
	display: flex;
	align-items: center;
	flex: 1;
	min-width: 0;
	overflow: hidden;
}

.tag {
	font-size: 24rpx;
	color: #ff6b35;
	background-color: #fff2e8;
	padding: 2rpx 12rpx;
	border-radius: 8rpx;
	margin-right: 12rpx;
	flex-shrink: 0;
}

.summary {
	font-size: 28rpx;
	color: #999;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex: 1;
}

.unread-badge {
	min-width: 36rpx;
	height: 36rpx;
	background-color: #ff4d4f;
	border-radius: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 10rpx;
	margin-left: 16rpx;
	flex-shrink: 0;
}

.unread-text {
	color: #fff;
	font-size: 22rpx;
	font-weight: 500;
}

.price-badge {
	background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
	border-radius: 12rpx;
	padding: 4rpx 12rpx;
	margin-left: 16rpx;
	flex-shrink: 0;

	.price-text {
		font-size: 22rpx;
		color: #fff;
		font-weight: 600;
	}
}

.empty-message {
	padding-top: 200rpx;
}
</style>
