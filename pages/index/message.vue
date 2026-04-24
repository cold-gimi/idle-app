<template>
	<view class="page-message">
		<scroll-view scroll-y="true" scroll-with-animation="true" style="height: 100%;">
			<view v-for="(item, index) in messageList" :key="index" class="message-item">
				<!-- 头像区域 -->
				<view class="avatar-wrap">
					<view class="avatar" :style="{ background: item.avatarBg }">
						<text class="avatar-text">{{ item.avatarText }}</text>
					</view>
					<!-- 在线状态 -->
					<view v-if="item.online" class="online-dot"></view>
					<!-- 置顶标识 -->
					<view v-if="item.pinned" class="pinned-icon">
						<text class="iconfont icon-pushpin"></text>
					</view>
				</view>

				<!-- 内容区域 -->
				<view class="content-box">
					<view class="content-inner">
						<!-- 第一行：昵称 + 时间 -->
						<view class="u-flex u-row-between u-m-b-8">
							<text class="nickname">{{ item.nickname }}</text>
							<text class="time">{{ item.time }}</text>
						</view>
						<!-- 第二行：标签 + 摘要 -->
						<view class="u-flex u-row-between">
							<view class="summary-wrap">
								<text v-if="item.tag" class="tag">{{ item.tag }}</text>
								<text class="summary">{{ item.summary }}</text>
							</view>
							<!-- 未读角标 -->
							<view v-if="item.unread" class="unread-badge">
								<text class="unread-text">{{ item.unread > 99 ? '99+' : item.unread }}</text>
							</view>
						</view>
					</view>
					<!-- 分割线 -->
					<u-line color="#ebedf0" v-if="index < messageList.length - 1"></u-line>
				</view>
			</view>
			<view style="height: 30rpx;"></view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				messageList: [
					{
						nickname: '闲置小助手',
						avatarText: '\uD83D\uDCE2',
						avatarBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						time: '刚刚',
						summary: '您的商品「iPhone 14 Pro」已有5人咨询',
						tag: '',
						unread: 99,
						online: false,
						pinned: true
					},
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
			};
		}
	};
</script>

<style lang="scss" scoped>
	.page-message {
		height: 100vh;
		background-color: #fff;
	}

	.message-item {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx;
		background-color: #fff;
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
</style>
