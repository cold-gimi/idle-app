<template>
	<view class="home-page">
		<!-- 顶部定位栏 -->
		<view class="header">
			<cp-navbar
				:background-color="'#ff7a45'"
				location-text="阳光花园小区"
				switch-text="切换"
				@locationClick="changeLocation"
			></cp-navbar>
			<!-- 搜索框 -->
		</view>
		<view style="background-color: #ff7a45;padding: 30rpx;">
			<u-search
			placeholder="搜索你想要的闲置好物..."
			v-model="keyword"
			shape="round"
			:bg-color="'#fff'"
			:input-align="'center'"
			:show-action="false"
			@search="onSearch"
			@click="goSearchPage"
		></u-search>
		</view>

		<!-- 分类图标 -->
		<scroll-view class="category-wrap" scroll-x>
			<view class="category-list">
				<view
					class="category-item"
					v-for="(item, index) in categories"
					:key="index"
					@click="goCategory(item)"
				>
					<view class="category-icon" :style="{ backgroundColor: item.color }">
						<u-icon :name="item.icon" color="#fff" size="40"></u-icon>
					</view>
					<text class="category-name">{{ item.name }}</text>
				</view>
				<view class="category-item" @click="goAllCategory">
					<view class="category-icon all-category">
						<text>全部分类</text>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 筛选抽屉 -->
		<u-popup v-model="filterVisible" mode="right" width="600rpx" :mask-close-able="true">
			<view class="filter-drawer">
				<!-- 标题 -->
				<view class="filter-header">
					<text class="filter-title">分类与筛选</text>
					<u-icon name="close" size="32" color="#999" @click="filterVisible = false"></u-icon>
				</view>

				<scroll-view class="filter-body" scroll-y>
					<view class="filter-content">
						<!-- 左侧分类 -->
						<view class="filter-sidebar">
							<view
								class="filter-cat-item"
								v-for="(item, index) in filterCategories"
								:key="index"
								:class="{ active: filterCurrentCat === index }"
								@click="filterCurrentCat = index"
							>
								<u-icon :name="item.icon" :color="filterCurrentCat === index ? '#FF6B35' : '#999'" size="24"></u-icon>
								<text class="cat-text">{{ item.name }}</text>
							</view>
						</view>

						<!-- 右侧筛选项 -->
						<view class="filter-main">
							<view class="filter-section">
								<text class="section-label">排序方式</text>
								<view class="tag-group">
									<view
										class="tag-item"
										v-for="(item, index) in sortList"
										:key="index"
										:class="{ active: filterSort === index }"
										@click="filterSort = index"
									>
										{{ item }}
									</view>
								</view>
							</view>

							<view class="filter-section">
								<text class="section-label">价格区间</text>
								<view class="price-input-row">
									<u-input v-model="minPrice" type="number" placeholder="最低" height="60" input-align="center" border />
									<text class="price-sep">—</text>
									<u-input v-model="maxPrice" type="number" placeholder="最高" height="60" input-align="center" border />
								</view>
								<view class="tag-group">
									<view
										class="tag-item"
										v-for="(item, index) in priceRanges"
										:key="index"
										:class="{ active: filterPrice === index }"
										@click="filterPrice = index"
									>
										{{ item }}
									</view>
								</view>
							</view>

							<view class="filter-section">
								<text class="section-label">商品成色</text>
								<view class="tag-group">
									<view
										class="tag-item"
										v-for="(item, index) in conditionList"
										:key="index"
										:class="{ active: filterCondition === index }"
										@click="filterCondition = index"
									>
										{{ item }}
									</view>
								</view>
							</view>

							<view class="filter-section">
								<text class="section-label">距离范围</text>
								<view class="tag-group">
									<view
										class="tag-item"
										v-for="(item, index) in distanceList"
										:key="index"
										:class="{ active: filterDistance === index }"
										@click="filterDistance = index"
									>
										{{ item }}
									</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>

				<view class="filter-footer">
					<u-button type="default" shape="circle" class="reset-btn" @click="resetFilter">重置</u-button>
					<u-button type="warning" shape="circle" class="confirm-btn" @click="confirmFilter">确认筛选</u-button>
				</view>
			</view>
		</u-popup>

		<!-- 商品瀑布流 -->
		<scroll-view
			class="goods-scroll"
			scroll-y
			@scrolltolower="loadMore"
		>
		<u-waterfall v-model="goodsList" class="waterfall-wrap">
			<template v-slot:left="{ leftList }">
				<view
					class="goods-item"
					v-for="item in leftList"
					:key="item.id"
					@click="goDetail(item)"
				>
					<view class="goods-image-wrap" :style="{ backgroundColor: item.bgColor, height: item.imgHeight + 'rpx' }">
						<u-icon :name="item.icon" :color="item.iconColor" :size="item.iconSize"></u-icon>
						<u-tag
							v-if="item.tag"
							:text="item.tag"
							mode="dark"
							type="warning"
							class="goods-tag"
						></u-tag>
						<text class="distance-tag">{{ item.distance }}</text>
					</view>
					<view class="goods-info">
						<text class="goods-title u-line-2">{{ item.title }}</text>
						<view class="goods-bottom">
							<text class="goods-price">¥{{ item.price }}</text>
							<view class="goods-meta">
								<text class="goods-time">{{ item.time }}</text>
								<view class="avatar" :style="{ backgroundColor: item.avatarColor }"></view>
							</view>
						</view>
					</view>
				</view>
			</template>
			<template v-slot:right="{ rightList }">
				<view
					class="goods-item"
					style="margin-right: 20rpx;"
					v-for="item in rightList"
					:key="item.id"
					@click="goDetail(item)"
				>
					<view class="goods-image-wrap" :style="{ backgroundColor: item.bgColor, height: item.imgHeight + 'rpx' }">
						<u-icon :name="item.icon" :color="item.iconColor" :size="item.iconSize"></u-icon>
						<u-tag
							v-if="item.tag"
							:text="item.tag"
							mode="dark"
							type="warning"
							class="goods-tag"
						></u-tag>
						<text class="distance-tag">{{ item.distance }}</text>
					</view>
					<view class="goods-info">
						<text class="goods-title u-line-2">{{ item.title }}</text>
						<view class="goods-bottom">
							<text class="goods-price">¥{{ item.price }}</text>
							<view class="goods-meta">
								<text class="goods-time">{{ item.time }}</text>
								<view class="avatar" :style="{ backgroundColor: item.avatarColor }"></view>
							</view>
						</view>
					</view>
				</view>
			</template>
		</u-waterfall>
		</scroll-view>

		<!-- 加载更多 -->
		<u-loadmore :status="loadStatus" @loadmore="loadMore" margin-top="30" margin-bottom="30"></u-loadmore>

		<!-- 可拖拽发布按钮 -->
		<view
			class="float-release-btn"
			:style="{ left: btnLeft + 'px', top: btnTop + 'px' }"
			@touchstart="touchStart"
			@touchmove="touchMove"
			@touchend="touchEnd"
			@click="goRelease"
		>
			<u-icon name="plus" color="#fff" size="48"></u-icon>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			keyword: '',
			categories: [
				{ name: '数码家电', icon: 'grid-fill', color: '#ff6b6b' },
				{ name: '家具', icon: 'home-fill', color: '#4ecdc4' },
				{ name: '美妆', icon: 'heart-fill', color: '#ff9ff3' },
				{ name: '服饰', icon: 'woman', color: '#54a0ff' },
			],
			filters: ['数码家电 > 手机', '¥0 ~ ¥2000', '几乎全新'],
			filterVisible: false,
			filterCategories: [
				{ name: '数码家电', icon: 'grid-fill' },
				{ name: '家居用品', icon: 'home-fill' },
				{ name: '母婴用品', icon: 'heart-fill' },
				{ name: '服装鞋包', icon: 'woman' },
				{ name: '图书教材', icon: 'file-text-fill' },
				{ name: '运动户外', icon: 'play-circle-fill' },
				{ name: '美妆护肤', icon: 'color' },
				{ name: '游戏玩具', icon: 'game' },
				{ name: '音乐器材', icon: 'music-fill' },
				{ name: '汽车用品', icon: 'car-fill' },
				{ name: '工具五金', icon: 'setting-fill' },
				{ name: '宠物用品', icon: 'heart-fill' },
				{ name: '其他闲置', icon: 'gift-fill' }
			],
			filterCurrentCat: 0,
			sortList: ['综合排序', '价格 ↑↓', '最新发布'],
			filterSort: 0,
			minPrice: '',
			maxPrice: '',
			priceRanges: ['¥100内', '¥100~500', '¥500~2000', '¥2000+'],
			filterPrice: -1,
			conditionList: ['不限', '几乎全新', '轻微使用', '明显使用'],
			filterCondition: 0,
			distanceList: ['不限', '500米内', '1公里内', '3公里内', '5公里内'],
			filterDistance: 0,
			goodsList: [
				{ id: 1, bgColor: '#E8EAF6', icon: 'photo', iconColor: '#5C6BC0', iconSize: 80, imgHeight: 300, tag: '急出', distance: '120m', title: 'iPhone 14 Pro 256G 暗夜紫 国行在保 原装配件齐全', price: '5,200', time: '10分钟前', avatarColor: '#7468D7' },
				{ id: 2, bgColor: '#F3E5F5', icon: 'home-fill', iconColor: '#AB47BC', iconSize: 70, imgHeight: 380, tag: '', distance: '350m', title: '宜家单人布艺沙发 几乎全新 搬家急出可小刀', price: '380', time: '25分钟前', avatarColor: '#ff6b9d' },
				{ id: 3, bgColor: '#E0F2F1', icon: 'file-text-fill', iconColor: '#26A69A', iconSize: 75, imgHeight: 260, tag: '送赠品', distance: '80m', title: '考研英语全套资料 真题+词汇书+手写笔记打包送', price: '0', time: '30分钟前', avatarColor: '#54a0ff' },
				{ id: 4, bgColor: '#FFF3E0', icon: 'photo', iconColor: '#FF7043', iconSize: 80, imgHeight: 340, tag: '全新', distance: '500m', title: 'MacBook Air M2 星光色 8+256G 未拆封', price: '8,200', time: '1小时前', avatarColor: '#ff6b9d' },
				{ id: 5, bgColor: '#ECEFF1', icon: 'setting-fill', iconColor: '#78909C', iconSize: 70, imgHeight: 280, tag: '急出', distance: '200m', title: '九阳破壁机 家用多功能 用了两次', price: '199', time: '2小时前', avatarColor: '#7468D7' },
				{ id: 6, bgColor: '#FBE9E7', icon: 'grid-fill', iconColor: '#FF8A65', iconSize: 75, imgHeight: 320, tag: '', distance: '1.2km', title: '乐高积木 哈利波特系列 完整盒装', price: '450', time: '3小时前', avatarColor: '#54a0ff' }
			],
			loadStatus: 'loadmore',
			page: 1,
			pageSize: 10,
			btnLeft: 0,
			btnTop: 0,
			btnSize: 100,
			btnRightMargin: 30,
			btnBottomMargin: 100,
			startX: 0,
			startY: 0,
			isDragging: false
		}
	},
	onLoad() {
		const sysInfo = uni.getSystemInfoSync()
		const btnSizePx = uni.upx2px(this.btnSize)
		const rightMarginPx = uni.upx2px(this.btnRightMargin)
		const bottomMarginPx = uni.upx2px(this.btnBottomMargin)
		this.btnLeft = sysInfo.windowWidth - btnSizePx - rightMarginPx
		this.btnTop = sysInfo.windowHeight - btnSizePx - bottomMarginPx
	},
	methods: {
		onSearch(val) {
			if (val && val.trim()) {
				this.$utils.route('/package/pages/search/search', { keyword: val })
			} else {
				this.goSearchPage()
			}
		},
		goSearchPage() {
			this.$utils.route('/package/pages/search/search')
		},
		changeLocation() {
			this.$utils.toast('切换位置')
		},
		goCategory(item) {
			this.$utils.toast(item.name)
		},
		goAllCategory() {
			this.filterVisible = true
		},
		resetFilter() {
			this.filterCurrentCat = 0
			this.filterSort = 0
			this.minPrice = ''
			this.maxPrice = ''
			this.filterPrice = -1
			this.filterCondition = 0
			this.filterDistance = 0
		},
		confirmFilter() {
			this.filterVisible = false
			this.$utils.toast('筛选已应用')
			this.page = 1
			this.loadGoods()
		},
		loadGoods() {
			this.$utils.showLoading()
			setTimeout(() => {
				this.$utils.hideLoading()
			}, 500)
		},
		removeFilter(index) {
			this.filters.splice(index, 1)
		},
		clearFilters() {
			this.filters = []
		},
		goDetail(item) {
			this.$utils.route('/package/pages/index/detail', { id: item.id })
		},
		loadMore() {
			this.loadStatus = 'loading'
			setTimeout(() => {
				this.loadStatus = 'nomore'
			}, 1000)
		},
		touchStart(e) {
			this.startX = e.touches[0].clientX - this.btnLeft
			this.startY = e.touches[0].clientY - this.btnTop
			this.isDragging = false
		},
		touchMove(e) {
			e.preventDefault()
			e.stopPropagation()
			this.isDragging = true
			const sysInfo = uni.getSystemInfoSync()
			let left = e.touches[0].clientX - this.startX
			let top = e.touches[0].clientY - this.startY
			left = Math.max(0, Math.min(left, sysInfo.windowWidth - 50))
			top = Math.max(0, Math.min(top, sysInfo.windowHeight - 50))
			this.btnLeft = left
			this.btnTop = top
		},
		touchEnd() {
			const sysInfo = uni.getSystemInfoSync()
			const btnSizePx = uni.upx2px(this.btnSize)
			const rightMarginPx = uni.upx2px(this.btnRightMargin)
			const bottomMarginPx = uni.upx2px(this.btnBottomMargin)
			const half = sysInfo.windowWidth / 2
			if (this.btnLeft < half) {
				this.btnLeft = rightMarginPx
			} else {
				this.btnLeft = sysInfo.windowWidth - btnSizePx - rightMarginPx
			}
			this.btnTop = sysInfo.windowHeight - btnSizePx - bottomMarginPx
		},
		goRelease() {
			if (this.isDragging) return
			this.$utils.route('/package/pages/index/release')
		}
	}
}
</script>

<style lang="scss" scoped>
.home-page {
	min-height: 100vh;
	background-color: #f8f8f8;
	padding-bottom: 30rpx;
}

.header {
	padding: 0;
	background: linear-gradient(135deg, #ff7a45 0%, #ff9f7a 100%);
}

.category-wrap {
	background-color: #fff;
	padding: 20rpx 0;

	.category-list {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
	}

	.category-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 30rpx;
		min-width: 100rpx;
	}

	.category-icon {
		width: 90rpx;
		height: 90rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 10rpx;
	}

	.all-category {
		background-color: #f5f5f5;
		font-size: 22rpx;
		color: #666;
	}

	.category-name {
		font-size: 24rpx;
		color: #666;
	}

	.arrow-icon {
		margin-top: 6rpx;
	}
}

.filter-bar {
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: #fff;

	.filter-tags {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.clear-btn {
		font-size: 26rpx;
		color: #999;
		margin-left: 20rpx;
		white-space: nowrap;
	}
}

.waterfall-wrap {
	padding: 0;
}

.goods-item {
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	margin: 20rpx 0 20rpx 20rpx;

	.goods-image-wrap {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;

		.goods-tag {
			position: absolute;
			left: 10rpx;
			top: 10rpx;
		}

		.distance-tag {
			position: absolute;
			right: 10rpx;
			top: 10rpx;
			padding: 4rpx 12rpx;
			background-color: rgba(0, 0, 0, 0.4);
			color: #fff;
			font-size: 22rpx;
			border-radius: 20rpx;
		}
	}

	.goods-info {
		padding: 16rpx;

		.goods-title {
			font-size: 26rpx;
			color: #333;
			line-height: 1.4;
			min-height: 72rpx;
		}

		.goods-bottom {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-top: 12rpx;

			.goods-price {
				font-size: 32rpx;
				color: #ff4d4f;
				font-weight: 600;
			}

			.goods-meta {
				display: flex;
				align-items: center;
				gap: 10rpx;

				.goods-time {
					font-size: 22rpx;
					color: #999;
				}

				.avatar {
					width: 32rpx;
					height: 32rpx;
					border-radius: 50%;
				}
			}
		}
	}
}

.filter-drawer {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #fff;

	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.filter-title {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
		}
	}

	.filter-body {
		flex: 1;
		height: 0;
		overflow: hidden;
	}

	.filter-content {
		display: flex;
		height: 100%;
	}

	.filter-sidebar {
		width: 180rpx;
		background-color: #f8f8f8;
		padding-top: 10rpx;

		.filter-cat-item {
			display: flex;
			align-items: center;
			padding: 24rpx 16rpx;
			font-size: 24rpx;
			color: #666;
			position: relative;

			&.active {
				background-color: #fff;
				color: #FF6B35;
				font-weight: 500;

				&::before {
					content: '';
					position: absolute;
					left: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 6rpx;
					height: 28rpx;
					background-color: #FF6B35;
					border-radius: 0 4rpx 4rpx 0;
				}
			}

			.cat-text {
				margin-left: 8rpx;
			}
		}
	}

	.filter-main {
		flex: 1;
		padding: 20rpx;
		overflow-y: auto;
	}

	.filter-section {
		margin-bottom: 30rpx;

		.section-label {
			font-size: 26rpx;
			color: #999;
			margin-bottom: 16rpx;
			display: block;
		}
	}

	.tag-group {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;

		.tag-item {
			padding: 10rpx 20rpx;
			font-size: 24rpx;
			color: #666;
			border: 1rpx solid #e0e0e0;
			border-radius: 30rpx;
			background-color: #fff;

			&.active {
				color: #FF6B35;
				border-color: #FF6B35;
				background-color: #FFF5F0;
			}
		}
	}

	.price-input-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 20rpx;

		.price-sep {
			font-size: 24rpx;
			color: #999;
		}
	}

	.filter-footer {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 20rpx 30rpx;
		border-top: 1rpx solid #f0f0f0;

		.reset-btn {
			flex: 1;
			height: 76rpx;
			font-size: 28rpx;
		}

		.confirm-btn {
			flex: 2;
			height: 76rpx;
			font-size: 28rpx;
		}
	}
}

.float-release-btn {
	position: fixed;
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #ff7a45 0%, #ff9f7a 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(255, 122, 69, 0.4);
	z-index: 999;
}
</style>
