<template>
	<view class="article-detail-page">
		<u-navbar
			:title="articleInfo.title || '文章详情'"
			:is-back="true"
			back-icon-name="nav-back"
			back-icon-color="#fff"
			:background="{ backgroundImage: 'linear-gradient(135deg, #FF8C70 0%, #FF6B6B 50%, #FF7F50 100%)' }"
			title-color="#fff"
			:border-bottom="false"
		></u-navbar>
		
		<scroll-view scroll-y class="detail-scroll">
			<view class="article-container" v-if="!isLoading">
				<view class="article-header">
					<view class="article-title">
						<text>{{ articleInfo.title }}</text>
					</view>
					<view class="article-meta">
						<view class="meta-item">
							<u-icon name="person-fill" color="#999" size="24"></u-icon>
							<text>{{ articleInfo.author || '闲置宝官方' }}</text>
						</view>
						<view class="meta-item">
							<u-icon name="clock" color="#999" size="24"></u-icon>
							<text>{{ articleInfo.createTime }}</text>
						</view>
						<view class="meta-item">
							<u-icon name="eye" color="#999" size="24"></u-icon>
							<text>{{ articleInfo.views }} 阅读</text>
						</view>
					</view>
				</view>
				
				<view class="article-cover" v-if="articleInfo.cover">
					<image :src="articleInfo.cover" mode="aspectFill"></image>
				</view>
				
				<view class="article-content">
					<u-parse :content="articleInfo.content" :tag-style="tagStyle"></u-parse>
				</view>
				
				<view class="article-actions">
					<view class="action-item" @click="toggleLike">
						<u-icon :name="isLiked ? 'heart-fill' : 'heart'" :color="isLiked ? '#FF4D4F' : '#666'" size="32"></u-icon>
						<text :class="{ active: isLiked }">{{ articleInfo.likes }}</text>
					</view>
					<view class="action-item" @click="toggleCollect">
						<u-icon :name="isCollected ? 'star-fill' : 'star'" :color="isCollected ? '#FAAD14' : '#666'" size="32"></u-icon>
						<text :class="{ active: isCollected }">收藏</text>
					</view>
					<view class="action-item" @click="shareArticle">
						<u-icon name="share" color="#666" size="32"></u-icon>
						<text>分享</text>
					</view>
				</view>
			</view>
			
			<view class="loading-container" v-if="isLoading">
				<u-loading-page loading-text="加载中..." color="#FF6B35"></u-loading-page>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			articleId: '',
			articleInfo: {},
			isLoading: true,
			isLiked: false,
			isCollected: false,
			tagStyle: {
				h1: 'font-size: 36rpx; font-weight: 600; color: #333; margin: 30rpx 0 20rpx; line-height: 1.5;',
				h2: 'font-size: 32rpx; font-weight: 600; color: #333; margin: 24rpx 0 16rpx; line-height: 1.5;',
				h3: 'font-size: 30rpx; font-weight: 600; color: #333; margin: 20rpx 0 12rpx; line-height: 1.5;',
				p: 'font-size: 28rpx; color: #333; line-height: 1.8; margin-bottom: 20rpx; text-indent: 2em;',
				img: 'max-width: 100%; border-radius: 12rpx; margin: 16rpx 0;',
				ul: 'font-size: 28rpx; color: #333; line-height: 1.8; padding-left: 40rpx; margin-bottom: 20rpx;',
				li: 'margin-bottom: 12rpx; list-style-type: disc;',
				strong: 'font-weight: 600; color: #333;',
				em: 'font-style: italic;',
				blockquote: 'border-left: 6rpx solid #FF6B35; padding-left: 24rpx; margin: 20rpx 0; font-size: 26rpx; color: #666; line-height: 1.6; background-color: #FFF6F2; padding: 20rpx; border-radius: 8rpx;'
			}
		};
	},
	methods: {
		loadArticleDetail() {
			this.isLoading = true;
			
			setTimeout(() => {
				const articles = {
					'about': {
						id: 'about',
						title: '关于闲置宝',
						author: '闲置宝官方',
						createTime: '2024-01-01',
						views: 9999,
						likes: 999,
						cover: '/static/logo.png',
						content: `<h2>欢迎来到闲置宝</h2>
<p>闲置宝是一个专注于闲置物品交易的社交电商平台，致力于为用户提供安全、便捷、高效的闲置物品交易服务。</p>
<h3>我们的使命</h3>
<p>让每一件闲置物品都能找到新的主人，实现资源的循环利用，为环保事业贡献一份力量。我们相信，<strong>"闲置不浪费，让物品焕发新生"</strong>。</p>
<h3>主要功能</h3>
<ul>
<li><strong>发布闲置</strong>：轻松上传您的闲置物品，设置价格和描述，一键发布</li>
<li><strong>智能搜索</strong>：快速找到您需要的物品，支持关键词、分类、价格区间等多种筛选条件</li>
<li><strong>即时聊天</strong>：与卖家/买家实时沟通，了解商品详情，协商交易细节</li>
<li><strong>安全交易</strong>：提供多种交易方式，保障买卖双方权益</li>
<li><strong>收藏关注</strong>：收藏心仪的物品，关注感兴趣的卖家，不错过任何好货</li>
</ul>
<h3>使用技巧</h3>
<blockquote>
<p>💡 小提示：发布商品时，上传清晰的实物照片和详细的描述，能让您的物品更快被卖出哦！</p>
</blockquote>
<p>1. <strong>照片要清晰</strong>：最好在自然光线下拍摄，展示商品的真实状态</p>
<p>2. <strong>描述要详细</strong>：包括购买时间、使用情况、是否有瑕疵等信息</p>
<p>3. <strong>定价要合理</strong>：参考同类商品的价格，设置一个有吸引力的价格</p>
<p>4. <strong>沟通要及时</strong>：及时回复买家的咨询，提高成交率</p>
<h3>联系我们</h3>
<p>如果您在使用过程中有任何问题或建议，欢迎通过以下方式联系我们：</p>
<ul>
<li>客服热线：400-888-8888</li>
<li>客服邮箱：service@xianzhibao.com</li>
<li>工作时间：周一至周日 9:00-21:00</li>
</ul>
<p>感谢您选择闲置宝，祝您交易愉快！🎉</p>`
					},
					'1': {
						id: 1,
						title: '闲置宝是什么？一文带你了解闲置交易平台',
						author: '闲置宝官方',
						createTime: '2024-01-15',
						views: 1256,
						likes: 89,
						cover: '/static/image/phs.png',
						content: `<h2>什么是闲置宝？</h2>
<p>闲置宝是一个专注于闲置物品交易的平台，帮助用户快速出售闲置物品，同时也能以优惠价格购买到心仪的二手商品。</p>
<h3>为什么选择闲置宝？</h3>
<p>在当今社会，人们的生活节奏越来越快，消费升级也在不断加速。很多家庭都有大量的闲置物品，这些物品占据空间，却很少被使用。闲置宝正是为了解决这个问题而诞生的。</p>
<ul>
<li><strong>免费发布</strong>：无需任何费用，轻松发布您的闲置物品</li>
<li><strong>安全可靠</strong>：多重身份验证，保障交易安全</li>
<li><strong>快速成交</strong>：智能推荐算法，让您的商品更快被找到</li>
<li><strong>本地交易</strong>：支持自提、当面交易，更加便捷</li>
</ul>
<h3>如何开始使用？</h3>
<p>1. 下载并注册闲置宝APP</p>
<p>2. 完善个人资料，进行实名认证</p>
<p>3. 点击"发布"按钮，上传物品照片和描述</p>
<p>4. 设置合理的价格，等待买家咨询</p>
<blockquote>
<p>温馨提示：首次发布商品时，建议先看看同类商品的价格，以便设置一个合理的售价。</p>
</blockquote>
<p>闲置宝，让闲置物品流动起来，让环保成为一种生活方式！</p>`
					},
					'2': {
						id: 2,
						title: '如何快速卖出闲置物品？这些技巧你一定要知道',
						author: '闲置宝运营',
						createTime: '2024-01-12',
						views: 892,
						likes: 56,
						cover: '/static/image/pzs.png',
						content: `<h2>快速卖出闲置的秘诀</h2>
<p>想要快速卖出闲置物品？掌握这些小技巧，让你的闲置物品更快被人发现，提高成交率。</p>
<h3>1. 照片是关键</h3>
<p>一张好的照片能让你的商品脱颖而出。以下是一些拍照技巧：</p>
<ul>
<li><strong>光线充足</strong>：最好在自然光下拍摄，避免使用闪光灯</li>
<li><strong>背景简洁</strong>：使用纯色背景，突出商品主体</li>
<li><strong>多角度拍摄</strong>：正面、侧面、细节都要拍到</li>
<li><strong>实拍细节</strong>：如果有瑕疵，一定要拍出来，诚实是最好的策略</li>
</ul>
<h3>2. 标题要吸引人</h3>
<p>好的标题应该包含以下要素：</p>
<p><strong>品牌 + 型号 + 关键特征 + 价格优势</strong></p>
<p>例如："iPhone 14 Pro 256G 95新 原装配件齐全"</p>
<h3>3. 描述要详细</h3>
<p>详细的描述能让买家更了解商品，减少沟通成本。建议包含：</p>
<ul>
<li>购买时间和渠道</li>
<li>使用情况（新旧程度）</li>
<li>是否有配件、包装盒</li>
<li>是否有瑕疵或维修历史</li>
<li>出售原因</li>
</ul>
<h3>4. 定价要合理</h3>
<p>定价建议：</p>
<p>• 参考同类商品的价格</p>
<p>• 考虑商品的新旧程度</p>
<p>• 可以设置一个略高于心理预期的价格，留出议价空间</p>
<blockquote>
<p>记住：价格是影响成交的最重要因素之一。合理的定价能让你的商品更快卖出。</p>
</blockquote>
<h3>5. 及时回复</h3>
<p>买家的咨询往往意味着购买意向，及时回复能大大提高成交率。建议：</p>
<ul>
<li>开启消息通知</li>
<li>设置自动回复，告知常见问题</li>
<li>保持礼貌和耐心</li>
</ul>
<p>掌握这些技巧，相信你的闲置物品一定能很快找到新主人！祝你好运！🍀</p>`
					}
				};
				
				this.articleInfo = articles[this.articleId] || articles['about'];
				this.isLoading = false;
			}, 600);
		},
		toggleLike() {
			this.isLiked = !this.isLiked;
			if (this.isLiked) {
				this.articleInfo.likes++;
				this.$utils.toast('点赞成功');
			} else {
				this.articleInfo.likes--;
				this.$utils.toast('已取消点赞');
			}
		},
		toggleCollect() {
			this.isCollected = !this.isCollected;
			this.$utils.toast(this.isCollected ? '收藏成功' : '已取消收藏');
		},
		shareArticle() {
			uni.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
			this.$utils.toast('分享功能开发中');
		}
	},
	onLoad(options) {
		if (options.id) {
			this.articleId = options.id;
		}
		this.loadArticleDetail();
	}
};
</script>

<style lang="scss" scoped>
.article-detail-page {
	min-height: 100vh;
	background-color: #fff;
}

.detail-scroll {
	height: calc(100vh - var(--status-bar-height) - 44px);
}

.loading-container {
	padding-top: 200rpx;
}

.article-container {
	padding-bottom: 40rpx;
}

.article-header {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.article-title {
	margin-bottom: 20rpx;
	
	text {
		font-size: 36rpx;
		font-weight: 600;
		color: #333;
		line-height: 1.5;
	}
}

.article-meta {
	display: flex;
	gap: 24rpx;
	flex-wrap: wrap;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	
	text {
		font-size: 24rpx;
		color: #999;
	}
}

.article-cover {
	padding: 20rpx 30rpx;
	
	image {
		width: 100%;
		border-radius: 16rpx;
	}
}

.article-content {
	padding: 20rpx 30rpx;
}

.article-actions {
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 30rpx 0;
	margin: 40rpx 30rpx 0;
	border-top: 1rpx solid #f0f0f0;
}

.action-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	
	text {
		font-size: 24rpx;
		color: #666;
		
		&.active {
			color: #FF6B35;
		}
	}
}
</style>
