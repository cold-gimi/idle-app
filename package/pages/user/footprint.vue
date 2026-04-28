<template>
	<view class="footprint-page">
		<u-navbar
			title="浏览记录"
			:is-back="true"
			back-icon-name="nav-back"
			back-icon-color="#fff"
			:background="{ backgroundImage: 'linear-gradient(135deg, #9B7BFF 0%, #7B5FFF 50%, #6B4FE8 100%)' }"
			title-color="#fff"
			:border-bottom="false"
		>
			<view slot="right" class="navbar-right" @click="toggleEditMode">
				<text class="edit-text">{{ isEditMode ? '完成' : '管理' }}</text>
			</view>
		</u-navbar>
		
		<view class="footprint-content">
			<view class="edit-bar" v-if="isEditMode && itemList.length > 0">
				<view class="select-all" @click="toggleSelectAll">
					<u-icon 
						:name="isAllSelected ? 'checkbox-mark-circle-fill' : 'checkbox-mark-circle'" 
						:color="isAllSelected ? '#9B7BFF' : '#ccc'" 
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
			
			<view class="footprint-list" v-if="itemList.length > 0">
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
			
			<view class="empty-footprint" v-else-if="!isLoading">
				<u-empty mode="list" :icon="'/static/image/pzs.png'" text="暂无浏览记录" margin-top="100"></u-empty>
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
					id: 101,
					title: '华为 Mate 60 Pro 512GB 雅丹黑',
					price: '6,999',
					image: '/static/logo.png',
					status: 'active',
					location: '北京市海淀区',
					time: '刚刚',
					bgColor: '#E8F5E9'
				},
				{
					id: 102,
					title: '小米 14 Ultra 摄影套装版',
					price: '5,999',
					image: '/static/logo.png',
					status: 'active',
					location: '上海市徐汇区',
					time: '30分钟前',
					bgColor: '#FFF3E0'
				},
				{
					id: 103,
					title: 'OPPO Find X7 Ultra 卫星通话版',
					price: '6,499',
					image: '/static/logo.png',
					status: 'sold',
					location: '广州市越秀区',
					time: '2小时前',
					bgColor: '#F3E5F5'
				},
				{
					id: 104,
					title: 'vivo X100 Pro 蔡司影像',
					price: '4,999',
					image: '/static/logo.png',
					status: 'active',
					location: '深圳市福田区',
					time: '5小时前',
					bgColor: '#E0F7FA'
				},
				{
					id: 105,
					title: '三星 Galaxy S24 Ultra AI手机',
					price: '8,999',
					image: '/static/logo.png',
					status: 'active',
					location: '杭州市余杭区',
					time: '1天前',
					bgColor: '#C9D8FF'
				},
				{
					id: 106,
					title: '一加 12 哈苏全焦段影像',
					price: '4,299',
					image: '/static/logo.png',
					status: 'sold',
					location: '南京市鼓楼区',
					time: '2天前',
					bgColor: '#FFECB3'
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
		console.log('浏览记录页面加载');
		this.fetchList();
	},
	onShow() {
		console.log('浏览记录页面显示');
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
.footprint-page {
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

.footprint-content {
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

.footprint-list {
	padding: 0 20rpx;
}

.empty-footprint {
	padding-bottom: 60rpx;
}

.browse-btn {
	padding: 0 100rpx;
	margin-top: 40rpx;
}
</style>
