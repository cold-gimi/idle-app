<template>
	<view class="goods-item" :class="{ 'item-sold': isSold, 'item-selected': isSelected }">
		<view 
			v-if="showCheckbox" 
			class="item-checkbox" 
			@click.stop="handleCheckboxClick"
		>
			<u-icon 
				:name="isSelected ? 'checkbox-mark-circle-fill' : 'checkbox-mark-circle'" 
				:color="isSelected ? '#FF6B35' : '#ccc'" 
				size="40"
			></u-icon>
		</view>
		
		<view 
			class="item-content" 
			@click="handleContentClick"
			:class="{ 'pointer-none': isSold }"
		>
			<view class="item-image-wrapper" :style="{ background: item.bgColor || '#f5f5f5' }">
				<image class="item-image" :src="item.image || '/static/logo.png'" mode="aspectFit"></image>
				<view class="item-status-tag" v-if="isSold">
					<text>{{ soldText }}</text>
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
		
		<view class="item-actions" v-if="showActions">
			<view class="action-btn delete-btn" @click.stop="handleDelete">
				<u-icon name="trash" color="#FF4D4F" size="36"></u-icon>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'CpGoodsItem',
	props: {
		item: {
			type: Object,
			default: () => ({})
		},
		showCheckbox: {
			type: Boolean,
			default: false
		},
		isSelected: {
			type: Boolean,
			default: false
		},
		showActions: {
			type: Boolean,
			default: true
		},
		statusField: {
			type: String,
			default: 'status'
		},
		soldValue: {
			type: String,
			default: 'sold'
		},
		soldText: {
			type: String,
			default: '已售'
		}
	},
	computed: {
		isSold() {
			return this.item[this.statusField] === this.soldValue;
		}
	},
	methods: {
		handleCheckboxClick() {
			this.$emit('select', !this.isSelected, this.item);
		},
		handleContentClick() {
			if (this.isSold) {
				return;
			}
			if (this.showCheckbox) {
				this.$emit('select', !this.isSelected, this.item);
			} else {
				this.$emit('click', this.item);
			}
		},
		handleDelete() {
			this.$emit('delete', this.item);
		}
	}
};
</script>

<style lang="scss" scoped>
.goods-item {
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
	
	&.item-selected {
		background-color: #FFF9F5;
		border: 2rpx solid #FF6B35;
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
</style>
