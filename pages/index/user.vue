<template>
	<view class="page-user">
		<template v-if="!userInfo.name">
			<cp-login></cp-login>
		</template>
		<template v-else>
			<u-navbar
				title="个人中心"
				:is-back="false"
				:background="{ backgroundImage: 'linear-gradient(135deg, #FF8C70 0%, #FF6B6B 50%, #FF7F50 100%)' }"
				title-color="#fff"
				:border-bottom="false"
			></u-navbar>
			<view class="user-header">
				<view class="user-info" @click="goToProfile">
					<view class="avatar-wrapper">
						<image class="avatar" :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
						<view class="online-status"></view>
					</view>
					<view class="user-detail">
						<view class="user-name">{{userInfo.nickname || userInfo.name}}</view>
						<view class="user-tags">
							<view class="tag verified">
								<u-icon name="checkbox-mark" color="#fff" size="20"></u-icon>
								<text>已认证</text>
							</view>
							<view class="tag rating">
								<u-icon name="star-fill" color="#FFD700" size="20"></u-icon>
								<text>{{userInfo.rating || '4.9'}}分</text>
							</view>
						</view>
					</view>
					<u-icon name="arrow-right" color="#fff" size="32"></u-icon>
				</view>
				<view class="rating-section">
					<view class="rating-score">{{userInfo.rating || '4.9'}}</view>
					<view class="rating-stars">
						<u-rate :count="5" :value="Math.floor(userInfo.rating || 4.9)" inactive-color="#fff" active-color="#FFD700" size="24"></u-rate>
					</view>
					<view class="rating-count">{{userInfo.reviewCount || '186'}}条好评</view>
				</view>
			</view>
			
			<view class="stats-section">
				<view class="stats-item" v-for="(item, index) in stats" :key="index">
					<view class="stats-number">{{item.value}}</view>
					<view class="stats-label">{{item.label}}</view>
				</view>
			</view>
			
			<view class="cards-section">
				<view class="card-item" @click="goToCollection">
					<view class="card-icon-wrapper">
						<u-icon name="heart-fill" color="#FF6B6B" size="60"></u-icon>
						<view class="card-badge">{{collectionCount}}</view>
					</view>
					<view class="card-title">我的收藏</view>
					<view class="card-desc">{{collectionCount}}个宝贝等你来</view>
				</view>
				<view class="card-item" @click="goToFootprint">
					<view class="card-icon-wrapper">
						<u-icon name="thumb-up-fill" color="#9B7BFF" size="60"></u-icon>
						<view class="card-badge">{{footprintCount}}</view>
					</view>
					<view class="card-title">浏览足迹</view>
					<view class="card-desc">最近7天看过</view>
				</view>
			</view>
			
			<view class="publication-section">
				<view class="section-header">
					<view class="section-title">
						<u-icon name="folder-fill" color="#FF6B35" size="28"></u-icon>
						<text>我的发布</text>
					</view>
					<view class="section-action" @click="goToManage">
						<text>管理</text>
						<u-icon name="arrow-right" color="#999" size="24"></u-icon>
					</view>
				</view>
				<view class="publication-list">
					<view class="publication-item" v-for="(item, index) in publications" :key="index" @click="goToEdit(item)">
						<view class="item-image-wrapper" :style="{background: item.bgColor}">
							<image class="item-image" :src="item.image" mode="aspectFit"></image>
							<view class="item-status" v-if="item.status">{{item.status}}</view>
						</view>
						<view class="item-info">
							<view class="item-title">{{item.title}}</view>
							<view class="item-price">¥{{item.price}}</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="menu-section">
				<view class="menu-item" @click="goToAccount">
					<view class="menu-icon-wrapper" style="background: #FFE4D6;">
						<u-icon name="lock-fill" color="#E67E22" size="28"></u-icon>
					</view>
					<view class="menu-title">账号与安全</view>
					<u-icon name="arrow-right" color="#ccc" size="24"></u-icon>
				</view>
				<view class="menu-item" @click="goToAbout">
					<view class="menu-icon-wrapper" style="background: #F0E0FF;">
						<u-icon name="info-circle-fill" color="#9B59B6" size="28"></u-icon>
					</view>
					<view class="menu-title">关于闲置宝</view>
					<u-icon name="arrow-right" color="#ccc" size="24"></u-icon>
				</view>
			</view>
			
			<view class="logout-section">
				<view class="logout-btn" @click="handleLogout">
					退出登录
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				stats: [
					{ value: '23', label: '在售' },
					{ value: '86', label: '已售' },
					{ value: '156', label: '收藏' },
					{ value: '1.2k', label: '粉丝' }
				],
				collectionCount: 156,
				footprintCount: 89,
				publications: [
					{
						id: 1,
						title: 'iPhone 14 Pro',
						price: '5,200',
						image: '/static/logo.png',
						status: '在售',
						bgColor: '#C9D8FF'
					},
					{
						id: 2,
						title: '机械键盘 K2',
						price: '320',
						image: '/static/logo.png',
						status: '在售',
						bgColor: '#FFF280'
					},
					{
						id: 3,
						title: 'AirPods Pro 2',
						price: '1,100',
						image: '/static/logo.png',
						status: '在售',
						bgColor: '#C9F0E0'
					}
				]
			};
		},
		computed: {
			userInfo: function() {
				return this.$store.state.userInfo || {}
			}
		},
		methods: {
			goToCollection() {
				uni.navigateTo({
					url: '/package/pages/user/collection'
				})
			},
			goToFootprint() {
				uni.navigateTo({
					url: '/pages/user/footprint'
				})
			},
			goToManage() {
				uni.navigateTo({
					url: '/pages/user/manage'
				})
			},
			goToEdit(item) {
				uni.navigateTo({
					url: `/package/pages/index/release?id=${item.id}&edit=true`
				})
			},
			goToDetail(item) {
				uni.navigateTo({
					url: `/package/pages/index/detail?id=${item.id}`
				})
			},
			goToProfile() {
				uni.navigateTo({
					url: '/package/pages/user/profile'
				})
			},
			goToAccount() {
				uni.navigateTo({
					url: '/pages/user/account'
				})
			},
			goToArticle() {
				uni.navigateTo({
					url: '/package/pages/user/article'
				})
			},
			goToAbout() {
				uni.navigateTo({
					url: '/package/pages/user/article-detail?id=about'
				})
			},
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							this.$store.commit('setUserInfo', {})
							this.$store.commit('setAccessToken', '')
							uni.removeStorageSync('userInfo')
							uni.removeStorageSync('accessToken')
							uni.reLaunch({
								url: '/pages/index/index'
							})
						}
					}
				})
			}
		},
		onShow() {
			this.$store.dispatch('getUserInfo')
		}
	};
</script>

<style lang="scss" scoped>
	.page-user {
		min-height: 100vh;
		background-color: #F5F7FA;
		padding-bottom: 40rpx;
	}
	
	.user-header {
		background: linear-gradient(135deg, #FF8C70 0%, #FF6B6B 50%, #FF7F50 100%);
		padding: 40rpx 30rpx 60rpx;
		border-radius: 0 0 40rpx 40rpx;
		position: relative;
		overflow: hidden;
		
		&::before {
			content: '';
			position: absolute;
			top: -100rpx;
			right: -100rpx;
			width: 400rpx;
			height: 400rpx;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 50%;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: -150rpx;
			left: -150rpx;
			width: 500rpx;
			height: 500rpx;
			background: rgba(255, 255, 255, 0.08);
			border-radius: 50%;
		}
	}
	
	.user-info {
		display: flex;
		align-items: center;
		position: relative;
		z-index: 1;
	}
	
	.avatar-wrapper {
		position: relative;
		margin-right: 24rpx;
		
		.avatar {
			width: 100rpx;
			height: 100rpx;
			border-radius: 50%;
			border: 4rpx solid rgba(255, 255, 255, 0.3);
		}
		
		.online-status {
			position: absolute;
			bottom: 4rpx;
			right: 4rpx;
			width: 24rpx;
			height: 24rpx;
			background-color: #52C41A;
			border-radius: 50%;
			border: 3rpx solid #fff;
		}
	}
	
	.user-detail {
		flex: 1;
		color: #fff;
	}
	
	.user-name {
		font-size: 36rpx;
		font-weight: 600;
		margin-bottom: 12rpx;
	}
	
	.user-tags {
		display: flex;
		gap: 16rpx;
	}
	
	.tag {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
		
		&.verified {
			background-color: rgba(255, 255, 255, 0.2);
			color: #fff;
		}
		
		&.rating {
			background-color: rgba(255, 255, 255, 0.2);
			color: #fff;
		}
	}
	
	.rating-section {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20rpx;
		margin-top: 40rpx;
		position: relative;
		z-index: 1;
	}
	
	.rating-score {
		font-size: 48rpx;
		font-weight: 700;
		color: #fff;
	}
	
	.rating-count {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}
	
	.stats-section {
		display: flex;
		background-color: #fff;
		margin: -30rpx 30rpx 30rpx;
		border-radius: 24rpx;
		padding: 30rpx 0;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}
	
	.stats-item {
		flex: 1;
		text-align: center;
		
		.stats-number {
			font-size: 40rpx;
			font-weight: 700;
			color: #FF6B35;
			margin-bottom: 8rpx;
		}
		
		.stats-label {
			font-size: 26rpx;
			color: #666;
		}
	}
	
	.cards-section {
		display: flex;
		padding: 0 30rpx;
		gap: 24rpx;
		margin-bottom: 30rpx;
	}
	
	.card-item {
		flex: 1;
		background-color: #fff;
		border-radius: 32rpx;
		padding: 40rpx 24rpx;
		text-align: center;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}
	
	.card-icon-wrapper {
		position: relative;
		display: inline-block;
		margin-bottom: 20rpx;
	}
	
	.card-badge {
		position: absolute;
		top: -10rpx;
		right: -20rpx;
		background-color: #FF6B6B;
		color: #fff;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
		min-width: 40rpx;
		text-align: center;
	}
	
	.card-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 8rpx;
	}
	
	.card-desc {
		font-size: 24rpx;
		color: #FF6B6B;
	}
	
	.publication-section {
		background-color: #fff;
		margin: 0 30rpx 30rpx;
		border-radius: 24rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}
	
	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}
	
	.section-title {
		display: flex;
		align-items: center;
		gap: 10rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
	
	.section-action {
		display: flex;
		align-items: center;
		gap: 6rpx;
		font-size: 26rpx;
		color: #999;
	}
	
	.publication-list {
		display: flex;
		gap: 24rpx;
		overflow-x: auto;
		padding-bottom: 10rpx;
	}
	
	.publication-item {
		flex-shrink: 0;
		width: 220rpx;
	}
	
	.item-image-wrapper {
		position: relative;
		width: 220rpx;
		height: 220rpx;
		border-radius: 24rpx;
		margin-bottom: 16rpx;
		overflow: hidden;
	}
	
	.item-image {
		width: 100%;
		height: 100%;
	}
	
	.item-status {
		position: absolute;
		top: 16rpx;
		right: 16rpx;
		background-color: rgba(255, 107, 53, 0.9);
		color: #fff;
		font-size: 20rpx;
		padding: 4rpx 12rpx;
		border-radius: 12rpx;
	}
	
	.item-info {
		padding: 0 8rpx;
	}
	
	.item-title {
		font-size: 26rpx;
		color: #333;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.item-price {
		font-size: 28rpx;
		font-weight: 600;
		color: #FF6B35;
	}
	
	.menu-section {
		background-color: #fff;
		margin: 0 30rpx 30rpx;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	}
	
	.menu-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #F0F0F0;
		
		&:last-child {
			border-bottom: none;
		}
	}
	
	.menu-icon-wrapper {
		width: 64rpx;
		height: 64rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}
	
	.menu-title {
		flex: 1;
		font-size: 30rpx;
		color: #333;
	}
	
	.logout-section {
		padding: 0 30rpx;
		margin-top: 20rpx;
	}
	
	.logout-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 88rpx;
		background-color: #FFF5F5;
		border: 2rpx solid #FFCCCC;
		border-radius: 44rpx;
		font-size: 30rpx;
		color: #FF4D4F;
		font-weight: 500;
	}
</style>
