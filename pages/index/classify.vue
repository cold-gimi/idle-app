<template>
	<view class="classify-page">
		<!-- 左侧分类导航 -->
		<scroll-view class="sidebar" scroll-y>
			<view
				class="sidebar-item"
				v-for="(item, index) in categories"
				:key="index"
				:class="{ active: currentCategory === index }"
				@click="switchCategory(index)"
			>
				<u-icon :name="item.icon" :color="currentCategory === index ? '#FF6B35' : '#999'" size="28"></u-icon>
				<text class="sidebar-text">{{ item.name }}</text>
			</view>
		</scroll-view>

		<!-- 右侧内容区 -->
		<view class="main-content">
			<!-- 二级分类 -->
			<scroll-view class="sub-category-wrap" scroll-x v-if="subCategories.length">
				<view class="sub-category-list">
					<view
						class="sub-category-item"
						v-for="(item, index) in subCategories"
						:key="index"
						:class="{ active: currentSubCategory === index }"
						@click="switchSubCategory(index)"
					>
						{{ item.name }}
					</view>
				</view>
			</scroll-view>

			<!-- 排序栏 -->
			<view class="sort-bar">
				<view
					class="sort-item"
					v-for="(item, index) in sortOptions"
					:key="index"
					:class="{ active: currentSort === index }"
					@click="switchSort(index)"
				>
					<text>{{ item.name }}</text>
					<u-icon
						v-if="item.icon"
						:name="item.icon"
						:size="20"
						:color="currentSort === index ? '#FF6B35' : '#999'"
					></u-icon>
				</view>
				<view class="view-toggle">
					<u-icon
						:name="viewMode === 'list' ? 'list' : 'grid'"
						color="#999"
						size="36"
						@click="toggleViewMode"
					></u-icon>
				</view>
			</view>

			<!-- 商品列表 -->
			<scroll-view class="goods-scroll" scroll-y @scrolltolower="loadMore">
				<view class="goods-list" :class="viewMode">
					<view
						class="goods-item"
						v-for="item in goodsList"
						:key="item.id"
						@click="goDetail(item)"
					>
						<view class="goods-image-wrap" :style="{ backgroundColor: item.bgColor, height: item.imgHeight + 'rpx' }">
							<u-icon :name="item.icon" :color="item.iconColor" :size="item.iconSize"></u-icon>
							<text class="distance-tag">{{ item.distance }}</text>
						</view>
						<view class="goods-info">
							<text class="goods-title u-line-2">{{ item.title }}</text>
							<u-tag
								v-if="item.condition"
								:text="item.condition"
								size="mini"
								:type="conditionType(item.condition)"
								class="condition-tag"
							></u-tag>
							<view class="goods-bottom">
								<text class="goods-price">¥{{ item.price }}</text>
								<view class="goods-meta">
									<text class="goods-time">{{ item.time }}</text>
									<view class="avatar" :style="{ backgroundColor: item.avatarColor }"></view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<u-loadmore :status="loadStatus" @loadmore="loadMore" margin-top="30" margin-bottom="30"></u-loadmore>
			</scroll-view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentCategory: 0,
			currentSubCategory: 0,
			currentSort: 0,
			viewMode: 'list',
			categories: [
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
				{ name: '宠物用品', icon: 'heart-fill' }
			],
			subCategoriesMap: {
				0: [
					{ name: '全部' }, { name: '手机' }, { name: '电脑/笔记本' }, { name: '平板' },
					{ name: '相机' }, { name: '耳机' }, { name: '智能穿戴' }, { name: '配件' }
				],
				1: [{ name: '全部' }, { name: '家具' }, { name: '家纺' }, { name: '厨具' }, { name: '灯具' }],
				2: [{ name: '全部' }, { name: '奶粉' }, { name: '纸尿裤' }, { name: '玩具' }, { name: '童装' }],
				3: [{ name: '全部' }, { name: '女装' }, { name: '男装' }, { name: '鞋靴' }, { name: '箱包' }],
				4: [{ name: '全部' }, { name: '教材' }, { name: '考试' }, { name: '文学' }, { name: '童书' }],
				5: [{ name: '全部' }, { name: '健身器材' }, { name: '户外装备' }, { name: '球类' }],
				6: [{ name: '全部' }, { name: '护肤' }, { name: '彩妆' }, { name: '香水' }],
				7: [{ name: '全部' }, { name: '主机' }, { name: '手柄' }, { name: '桌游' }],
				8: [{ name: '全部' }, { name: '吉他' }, { name: '钢琴' }, { name: '音响' }],
				9: [{ name: '全部' }, { name: '行车记录仪' }, { name: '车载电器' }],
				10: [{ name: '全部' }, { name: '电动工具' }, { name: '手动工具' }],
				11: [{ name: '全部' }, { name: '狗粮' }, { name: '猫砂' }, { name: '玩具' }]
			},
			sortOptions: [
				{ name: '价格'},
				{ name: '最新发布' },
				{ name: '离我最近' }
			],
			goodsList: [
				{ id: 1, bgColor: '#E8EAF6', icon: 'photo', iconColor: '#5C6BC0', iconSize: 80, imgHeight: 260, distance: '120m', title: 'iPhone 14 Pro 256G 暗夜紫 国行在保 成色好', condition: '几乎全新', price: '5,200', time: '10分钟前', avatarColor: '#7468D7' },
				{ id: 2, bgColor: '#ECEFF1', icon: 'grid-fill', iconColor: '#78909C', iconSize: 70, imgHeight: 320, distance: '350m', title: 'MacBook Air M2 16+256 深空灰 配件齐全', condition: '轻微使用', price: '7,800', time: '30分钟前', avatarColor: '#ff6b9d' },
				{ id: 3, bgColor: '#E0F2F1', icon: 'heart-fill', iconColor: '#26A69A', iconSize: 75, imgHeight: 240, distance: '80m', title: 'AirPods Pro 2代 降噪效果很好 带原装盒', condition: '几乎全新', price: '1,100', time: '1小时前', avatarColor: '#54a0ff' }
			],
			loadStatus: 'loadmore',
			page: 1,
			pageSize: 10
		}
	},
	computed: {
		subCategories() {
			return this.subCategoriesMap[this.currentCategory] || []
		}
	},
	methods: {
		switchCategory(index) {
			this.currentCategory = index
			this.currentSubCategory = 0
			this.page = 1
			this.loadGoods(true)
		},
		switchSubCategory(index) {
			this.currentSubCategory = index
			this.page = 1
			this.loadGoods(true)
		},
		switchSort(index) {
			this.currentSort = index
			this.page = 1
			this.loadGoods(true)
		},
		toggleViewMode() {
			this.viewMode = this.viewMode === 'list' ? 'grid' : 'list'
		},
		conditionType(condition) {
			const map = {
				'几乎全新': 'warning',
				'轻微使用': 'primary',
				'全新': 'success',
				'明显使用': 'info'
			}
			return map[condition] || 'warning'
		},
		goDetail(item) {
			this.$utils.route('/package/pages/index/detail', { id: item.id })
		},
		loadMore() {
			if (this.loadStatus === 'nomore') return
			this.loadStatus = 'loading'
			setTimeout(() => {
				this.loadStatus = 'nomore'
			}, 1000)
		},
		loadGoods(reset = false) {
			this.$utils.showLoading()
			setTimeout(() => {
				this.$utils.hideLoading()
				if (reset) {
					this.goodsList = [
						{ id: Date.now(), image: '/static/image/phone.png', distance: '120m', title: 'iPhone 14 Pro 256G 暗夜紫 国行在保 成色好', condition: '几乎全新', price: '5,200', time: '10分钟前', avatarColor: '#7468D7' }
					]
				}
			}, 500)
		}
	}
}
</script>

<style lang="scss" scoped>
.classify-page {
	display: flex;
	height: 100vh;
	background-color: #fff;
}

.sidebar {
	width: 180rpx;
	height: 100%;
	background-color: #f8f8f8;

	.sidebar-item {
		display: flex;
		align-items: center;
		padding: 30rpx 16rpx;
		font-size: 26rpx;
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
				height: 32rpx;
				background-color: #FF6B35;
				border-radius: 0 4rpx 4rpx 0;
			}
		}
	}

	.sidebar-text {
		margin-left: 10rpx;
	}
}

.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

.sub-category-wrap {
	flex-shrink: 0;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;

	.sub-category-list {
		display: flex;
		padding: 0 20rpx;
		white-space: nowrap;
	}

	.sub-category-item {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx 24rpx;
		margin-right: 16rpx;
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

.sort-bar {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	padding: 20rpx;
	border-bottom: 1rpx solid #f0f0f0;

	.sort-item {
		display: flex;
		align-items: center;
		margin-right: 30rpx;
		font-size: 26rpx;
		color: #999;

		&.active {
			color: #FF6B35;
			font-weight: 500;
		}
	}

	.view-toggle {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
}

.goods-scroll {
	flex: 1;
	height: 0;
	overflow: hidden;
}

.goods-list {
	padding: 20rpx;

	&.list {
		.goods-item {
			display: flex;
			margin-bottom: 20rpx;
			background-color: #fff;
			border-radius: 12rpx;

			.goods-image-wrap {
				position: relative;
				width: 220rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				border-radius: 12rpx;
				overflow: hidden;
				flex-shrink: 0;

				.distance-tag {
					position: absolute;
					top: 10rpx;
					left: 10rpx;
					padding: 4rpx 12rpx;
					background-color: rgba(0, 0, 0, 0.4);
					color: #fff;
					font-size: 22rpx;
					border-radius: 20rpx;
				}
			}

			.goods-info {
				flex: 1;
				padding: 16rpx 20rpx;
				display: flex;
				flex-direction: column;
				justify-content: space-between;

				.goods-title {
					font-size: 28rpx;
					color: #333;
					line-height: 1.4;
				}

				.condition-tag {
					align-self: flex-start;
					margin-top: 10rpx;
				}

				.goods-bottom {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-top: auto;
					padding-top: 16rpx;

					.goods-price {
						font-size: 36rpx;
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
	}

	&.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;

		.goods-item {
			width: calc(50% - 10rpx);
			background-color: #fff;
			border-radius: 12rpx;
			overflow: hidden;

			.goods-image-wrap {
				position: relative;
				width: 100%;
				display: flex;
				align-items: center;
				justify-content: center;
				overflow: hidden;

				.distance-tag {
					position: absolute;
					top: 10rpx;
					left: 10rpx;
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

				.condition-tag {
					margin-top: 10rpx;
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
	}
}
</style>
