<template>
	<view class="article-page">
		<u-navbar
			title="文章列表"
			:is-back="true"
			back-icon-name="nav-back"
			back-icon-color="#fff"
			:background="{ backgroundImage: 'linear-gradient(135deg, #FF8C70 0%, #FF6B6B 50%, #FF7F50 100%)' }"
			title-color="#fff"
			:border-bottom="false"
		></u-navbar>
		
		<scroll-view 
			scroll-y 
			class="article-scroll"
			:refresher-enabled="true"
			:refresher-triggered="isRefreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="loadMore"
		>
			<view class="article-list">
				<view class="article-item" v-for="(item, index) in articleList" :key="item.id" @click="goToDetail(item)">
					<view class="article-content">
						<view class="article-title">
							<text>{{ item.title }}</text>
						</view>
						<view class="article-desc">
							<text>{{ item.description }}</text>
						</view>
						<view class="article-meta">
							<view class="meta-item">
								<u-icon name="clock" color="#999" size="20"></u-icon>
								<text>{{ item.createTime }}</text>
							</view>
							<view class="meta-item">
								<u-icon name="eye" color="#999" size="20"></u-icon>
								<text>{{ item.views }} 阅读</text>
							</view>
							<view class="meta-item">
								<u-icon name="heart" color="#999" size="20"></u-icon>
								<text>{{ item.likes }} 点赞</text>
							</view>
						</view>
					</view>
					<view class="article-image" v-if="item.cover">
						<image :src="item.cover" mode="aspectFill"></image>
					</view>
				</view>
			</view>
			
			<view class="empty-article" v-if="articleList.length === 0 && !isLoading">
				<u-empty mode="list" text="暂无文章" margin-top="100"></u-empty>
			</view>
			
			<view class="loading-more" v-if="isLoading">
				<u-loading-icon size="28"></u-loading-icon>
				<text class="loading-text">加载中...</text>
			</view>
			
			<view class="no-more" v-if="!hasMore && articleList.length > 0">
				<text>没有更多了</text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			articleList: [],
			isLoading: false,
			isRefreshing: false,
			hasMore: true,
			page: 1,
			pageSize: 10
		};
	},
	methods: {
		loadArticleList() {
			this.isLoading = true;
			
			setTimeout(() => {
				const mockArticles = [
					{
						id: 1,
						title: '闲置宝是什么？一文带你了解闲置交易平台',
						description: '闲置宝是一个专注于闲置物品交易的平台，帮助用户快速出售闲置物品，同时也能以优惠价格购买到心仪的二手商品...',
						cover: '/static/image/phs.png',
						createTime: '2024-01-15',
						views: 1256,
						likes: 89
					},
					{
						id: 2,
						title: '如何快速卖出闲置物品？这些技巧你一定要知道',
						description: '想要快速卖出闲置物品？掌握这些小技巧，让你的闲置物品更快被人发现，提高成交率...',
						cover: '/static/image/pzs.png',
						createTime: '2024-01-12',
						views: 892,
						likes: 56
					},
					{
						id: 3,
						title: '闲置交易注意事项：避免这些常见陷阱',
						description: '在进行闲置交易时，有哪些需要注意的地方？本文为你详细介绍闲置交易中的常见问题及解决方案...',
						cover: '',
						createTime: '2024-01-10',
						views: 678,
						likes: 34
					},
					{
						id: 4,
						title: '数码产品回收指南：旧手机如何处理更划算',
						description: '更换新手机后，旧手机该如何处理？本文为你介绍几种常见的旧手机处理方式，帮你做出最优选择...',
						cover: '/static/image/phone.png',
						createTime: '2024-01-08',
						views: 1023,
						likes: 67
					},
					{
						id: 5,
						title: '关于闲置宝',
						description: '闲置宝是一个专注于闲置物品交易的社交电商平台，致力于为用户提供安全、便捷、高效的闲置物品交易服务...',
						cover: '/static/logo.png',
						createTime: '2024-01-01',
						views: 9999,
						likes: 999
					}
				];
				
				if (this.page === 1) {
					this.articleList = mockArticles;
				} else {
					this.articleList = this.articleList.concat(mockArticles);
				}
				
				this.isLoading = false;
				this.isRefreshing = false;
				this.hasMore = this.page < 3;
			}, 800);
		},
		onRefresh() {
			this.page = 1;
			this.hasMore = true;
			this.loadArticleList();
		},
		loadMore() {
			if (this.hasMore && !this.isLoading) {
				this.page++;
				this.loadArticleList();
			}
		},
		goToDetail(item) {
			uni.navigateTo({
				url: `/package/pages/user/article-detail?id=${item.id}`
			});
		}
	},
	onLoad() {
		this.loadArticleList();
	}
};
</script>

<style lang="scss" scoped>
.article-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.article-scroll {
	height: calc(100vh - var(--status-bar-height) - 44px);
}

.article-list {
	padding: 20rpx;
}

.article-item {
	display: flex;
	gap: 24rpx;
	padding: 24rpx;
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.article-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.article-title {
	margin-bottom: 12rpx;
	
	text {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
}

.article-desc {
	margin-bottom: 16rpx;
	flex: 1;
	
	text {
		font-size: 24rpx;
		color: #999;
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
}

.article-meta {
	display: flex;
	gap: 20rpx;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
	
	text {
		font-size: 22rpx;
		color: #999;
	}
}

.article-image {
	width: 200rpx;
	height: 140rpx;
	flex-shrink: 0;
	border-radius: 12rpx;
	overflow: hidden;
	
	image {
		width: 100%;
		height: 100%;
	}
}

.empty-article {
	padding-top: 100rpx;
}

.loading-more {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 30rpx 0;
	
	.loading-text {
		font-size: 24rpx;
		color: #999;
	}
}

.no-more {
	text-align: center;
	padding: 30rpx 0;
	
	text {
		font-size: 24rpx;
		color: #ccc;
	}
}
</style>
