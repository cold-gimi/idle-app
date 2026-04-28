<template>
	<view class="collection-page">
		<u-navbar
			title="我的收藏"
			:is-back="true"
			back-icon-name="nav-back"
			back-icon-color="#fff"
			:background="{ backgroundImage: 'linear-gradient(135deg, #FF8C70 0%, #FF6B6B 50%, #FF7F50 100%)' }"
			title-color="#fff"
			:border-bottom="false"
		>
			<view slot="right" class="navbar-right" @click="toggleEditMode">
				<text class="edit-text">{{ isEditMode ? '完成' : '管理' }}</text>
			</view>
		</u-navbar>
		
		<view class="collection-content">
			<view class="edit-bar" v-if="isEditMode && collectionList.length > 0">
				<view class="select-all" @click="toggleSelectAll">
					<u-icon 
						:name="isAllSelected ? 'checkbox-mark-circle-fill' : 'checkbox-mark-circle'" 
						:color="isAllSelected ? '#FF6B35' : '#ccc'" 
						size="40"
					></u-icon>
					<text class="select-all-text">全选</text>
				</view>
				<view class="batch-actions">
					<view 
						class="batch-delete-btn" 
						:class="{ disabled: selectedIds.length === 0 }"
						@click="batchDelete"
					>
						<text>删除({{ selectedIds.length }})</text>
					</view>
				</view>
			</view>
			
			<view class="collection-list" v-if="collectionList.length > 0">
				<view 
					v-for="(item, index) in collectionList" 
					:key="item.id" 
					class="collection-item"
					:class="{ 'item-sold': item.status === 'sold' }"
				>
					<view class="item-checkbox" v-if="isEditMode" @click.stop="toggleSelect(item)">
						<u-icon 
							:name="selectedIds.includes(item.id) ? 'checkbox-mark-circle-fill' : 'checkbox-mark-circle'" 
							:color="selectedIds.includes(item.id) ? '#FF6B35' : '#ccc'" 
							size="40"
						></u-icon>
					</view>
					
					<view 
						class="item-content" 
						@click="goToDetail(item)"
						:class="{ 'pointer-none': item.status === 'sold' }"
					>
						<view class="item-image-wrapper" :style="{ background: item.bgColor || '#f5f5f5' }">
							<image class="item-image" :src="item.image || '/static/logo.png'" mode="aspectFit"></image>
							<view class="item-status-tag" v-if="item.status === 'sold'">
								<text>已售</text>
							</view>
						</view>
						<view class="item-info">
							<view class="item-title">{{ item.title }}</view>
							<view class="item-price">
								<text class="price-symbol">¥</text>
								<text class="price-num">{{ item.price }}</text>
							</view>
							<view class="item-meta">
								<text class="meta-text">{{ item.location || '北京' }}</text>
								<text class="meta-text">{{ item.time || '3天前' }}</text>
							</view>
						</view>
					</view>
					
					<view class="item-actions">
						<view class="action-btn delete-btn" @click.stop="deleteItem(item, index)">
							<u-icon name="trash" color="#FF4D4F" size="36"></u-icon>
						</view>
					</view>
				</view>
			</view>
			
			<view class="empty-collection" v-else>
				<u-empty mode="list" :icon="'/static/image/phs.png'" text="暂无收藏商品" margin-top="100"></u-empty>
				<view class="browse-btn" @click="goToHome">
					<u-button type="primary" shape="circle">去逛逛</u-button>
				</view>
			</view>
		</view>
		
		<u-modal
			v-model="showDeleteModal"
			title="提示"
			:content="deleteModalContent"
			:show-cancel-button="true"
			confirm-text="删除"
			cancel-text="取消"
			confirm-color="#FF4D4F"
			@confirm="confirmDelete"
		></u-modal>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isEditMode: false,
			selectedIds: [],
			showDeleteModal: false,
			deleteModalContent: '',
			pendingDeleteItems: [],
			collectionList: [
				{
					id: 1,
					title: 'iPhone 14 Pro Max 256GB 暗紫色',
					price: '6,888',
					image: '/static/logo.png',
					status: 'active',
					location: '北京市朝阳区',
					time: '2小时前',
					bgColor: '#C9D8FF'
				},
				{
					id: 2,
					title: 'MacBook Pro 14寸 M2 Pro 芯片',
					price: '12,500',
					image: '/static/logo.png',
					status: 'sold',
					location: '上海市浦东新区',
					time: '1天前',
					bgColor: '#E8F5E9'
				},
				{
					id: 3,
					title: 'AirPods Pro 2 代 全新未拆封',
					price: '1,500',
					image: '/static/logo.png',
					status: 'active',
					location: '深圳市南山区',
					time: '3天前',
					bgColor: '#FFF3E0'
				},
				{
					id: 4,
					title: 'Sony WH-1000XM5 头戴式降噪耳机',
					price: '1,800',
					image: '/static/logo.png',
					status: 'sold',
					location: '广州市天河区',
					time: '5天前',
					bgColor: '#F3E5F5'
				},
				{
					id: 5,
					title: 'iPad Air 5 256GB WiFi版',
					price: '4,200',
					image: '/static/logo.png',
					status: 'active',
					location: '杭州市西湖区',
					time: '1周前',
					bgColor: '#E0F7FA'
				}
			]
		};
	},
	computed: {
		isAllSelected() {
			return this.selectedIds.length === this.collectionList.length && this.collectionList.length > 0;
		}
	},
	methods: {
		toggleEditMode() {
			this.isEditMode = !this.isEditMode;
			if (!this.isEditMode) {
				this.selectedIds = [];
			}
		},
		toggleSelectAll() {
			if (this.isAllSelected) {
				this.selectedIds = [];
			} else {
				this.selectedIds = this.collectionList.map(item => item.id);
			}
		},
		toggleSelect(item) {
			const index = this.selectedIds.indexOf(item.id);
			if (index > -1) {
				this.selectedIds.splice(index, 1);
			} else {
				this.selectedIds.push(item.id);
			}
		},
		goToDetail(item) {
			if (item.status === 'sold') {
				return;
			}
			uni.navigateTo({
				url: `/package/pages/index/detail?id=${item.id}`
			});
		},
		deleteItem(item, index) {
			this.pendingDeleteItems = [index];
			this.deleteModalContent = `确定要删除"${item.title}"吗？`;
			this.showDeleteModal = true;
		},
		batchDelete() {
			if (this.selectedIds.length === 0) {
				this.$utils.toast('请先选择要删除的商品');
				return;
			}
			const indices = [];
			this.selectedIds.forEach(id => {
				const index = this.collectionList.findIndex(item => item.id === id);
				if (index > -1) {
					indices.push(index);
				}
			});
			this.pendingDeleteItems = indices.sort((a, b) => b - a);
			this.deleteModalContent = `确定要删除选中的 ${this.selectedIds.length} 件商品吗？`;
			this.showDeleteModal = true;
		},
		confirmDelete() {
			this.pendingDeleteItems.forEach(index => {
				this.collectionList.splice(index, 1);
			});
			this.selectedIds = [];
			this.$utils.toast('删除成功');
			this.showDeleteModal = false;
			
			if (this.collectionList.length === 0) {
				this.isEditMode = false;
			}
		},
		goToHome() {
			uni.switchTab({
				url: '/pages/index/home'
			});
		}
	},
	onLoad() {
		console.log('我的收藏页面加载');
	},
	onShow() {
		console.log('我的收藏页面显示');
	}
};
</script>

<style lang="scss" scoped>
.collection-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.navbar-right {
	padding: 0 20rpx;
	
	.edit-text {
		font-size: 28rpx;
		color: #fff;
		font-weight: 500;
	}
}

.collection-content {
	padding-bottom: 40rpx;
}

.edit-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 24rpx 30rpx;
	background-color: #fff;
	margin-bottom: 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.select-all {
	display: flex;
	align-items: center;
	gap: 12rpx;
	
	.select-all-text {
		font-size: 28rpx;
		color: #333;
	}
}

.batch-actions {
	.batch-delete-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12rpx 32rpx;
		background-color: #FFF2F0;
		border-radius: 32rpx;
		
		text {
			font-size: 26rpx;
			color: #FF4D4F;
			font-weight: 500;
		}
		
		&.disabled {
			background-color: #f5f5f5;
			
			text {
				color: #ccc;
			}
		}
	}
}

.collection-list {
	padding: 0 20rpx;
}

.collection-item {
	display: flex;
	align-items: center;
	background-color: #fff;
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	padding: 24rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	
	&.item-sold {
		opacity: 0.6;
	}
}

.item-checkbox {
	padding: 20rpx;
	margin-right: 8rpx;
}

.item-content {
	flex: 1;
	display: flex;
	gap: 20rpx;
	
	&.pointer-none {
		pointer-events: none;
	}
}

.item-image-wrapper {
	position: relative;
	width: 180rpx;
	height: 180rpx;
	border-radius: 16rpx;
	overflow: hidden;
	flex-shrink: 0;
}

.item-image {
	width: 100%;
	height: 100%;
}

.item-status-tag {
	position: absolute;
	top: 12rpx;
	right: 12rpx;
	background-color: rgba(0, 0, 0, 0.6);
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	
	text {
		font-size: 20rpx;
		color: #fff;
	}
}

.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: 8rpx 0;
}

.item-title {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.item-price {
	display: flex;
	align-items: baseline;
	margin-top: 12rpx;
	
	.price-symbol {
		font-size: 24rpx;
		color: #FF4D4F;
		font-weight: 600;
	}
	
	.price-num {
		font-size: 36rpx;
		color: #FF4D4F;
		font-weight: 700;
	}
}

.item-meta {
	display: flex;
	gap: 20rpx;
	margin-top: 12rpx;
	
	.meta-text {
		font-size: 22rpx;
		color: #999;
	}
}

.item-actions {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-left: 20rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
}

.delete-btn {
	background-color: #FFF2F0;
}

.empty-collection {
	padding-bottom: 60rpx;
}

.browse-btn {
	padding: 0 100rpx;
	margin-top: 40rpx;
}
</style>
