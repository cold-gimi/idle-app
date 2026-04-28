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
			<view class="edit-bar" v-if="isEditMode && itemList.length > 0">
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
						@click="prepareBatchDelete"
					>
						<text>删除({{ selectedIds.length }})</text>
					</view>
				</view>
			</view>
			
			<view class="collection-list" v-if="itemList.length > 0">
				<cp-goods-item
					v-for="(item, index) in itemList" 
					:key="item.id"
					:item="item"
					:show-checkbox="isEditMode"
					:is-selected="isSelected(item)"
					:show-actions="!isEditMode"
					@select="(selected, item) => toggleSelect(item)"
					@click="goToDetail"
					@delete="prepareSingleDelete"
				/>
			</view>
			
			<u-loadmore 
				v-if="itemList.length > 0" 
				:status="loadStatus"
				:icon-type="1"
				load-text="加载中"
				loadmore-text="加载更多"
				nomore-text="没有更多了"
			/>
			
			<view class="empty-collection" v-else-if="!isLoading">
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
import selectionMixin from '@/utils/mixins/selection.js';
import paginationMixin from '@/utils/mixins/pagination.js';

export default {
	mixins: [selectionMixin, paginationMixin],
	data() {
		return {
			itemList: []
		};
	},
	computed: {
		loadStatus() {
			if (this.isLoading) {
				return 'loading';
			}
			return this.hasMore ? 'loadmore' : 'nomore';
		}
	},
	methods: {
		async fetchList() {
			await new Promise(resolve => setTimeout(resolve, 500));
			
			const mockData = [
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
			];
			
			if (this.page === 1) {
				this.itemList = mockData;
			}
			
			this.total = mockData.length;
			this.hasMore = false;
		},
		goToDetail(item) {
			if (item.status === 'sold') {
				return;
			}
			uni.navigateTo({
				url: `/package/pages/index/detail?id=${item.id}`
			});
		},
		async confirmDelete() {
			await new Promise(resolve => setTimeout(resolve, 300));
			
			this.pendingDeleteItems.forEach(index => {
				this.itemList.splice(index, 1);
			});
			
			this.clearSelection();
			this.$utils.toast('删除成功');
			this.showDeleteModal = false;
		},
		goToHome() {
			uni.switchTab({
				url: '/pages/index/home'
			});
		}
	},
	onLoad() {
		console.log('我的收藏页面加载');
		this.fetchList();
	},
	onShow() {
		console.log('我的收藏页面显示');
	},
	onPullDownRefresh() {
		this.refreshList();
	},
	onReachBottom() {
		this.loadMoreList();
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

.empty-collection {
	padding-bottom: 60rpx;
}

.browse-btn {
	padding: 0 100rpx;
	margin-top: 40rpx;
}
</style>
