<template>
	<view class="profile-page">
		<u-navbar
			title="个人详情"
			:is-back="true"
			back-icon-name="nav-back"
			back-icon-color="#fff"
			:background="{ backgroundImage: 'linear-gradient(135deg, #FF8C70 0%, #FF6B6B 50%, #FF7F50 100%)' }"
			title-color="#fff"
			:border-bottom="false"
		></u-navbar>
		
		<view class="profile-content">
			<view class="avatar-section">
				<view class="avatar-wrapper">
					<image class="avatar" :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
				</view>
				<text class="change-avatar-text">点击更换头像</text>
			</view>
			
			<view class="info-section">
				<view class="section-title">
					<text>基本信息</text>
				</view>
				
				<view class="info-list">
					<view class="info-item" @click="editNickname">
						<view class="item-label">
							<text>昵称</text>
						</view>
						<view class="item-value">
							<text class="value-text">{{ userInfo.nickname || userInfo.name || '未设置' }}</text>
							<u-icon name="arrow-right" color="#ccc" size="24"></u-icon>
						</view>
					</view>
					
					<view class="info-item" @click="editPhone">
						<view class="item-label">
							<text>手机号</text>
						</view>
						<view class="item-value">
							<text class="value-text">{{ formattedPhone }}</text>
							<u-icon name="arrow-right" color="#ccc" size="24"></u-icon>
						</view>
					</view>
					
					<view class="info-item" @click="goToAddress">
						<view class="item-label">
							<text>收货地址</text>
						</view>
						<view class="item-value">
							<text class="value-text placeholder" v-if="!defaultAddress">请添加收货地址</text>
							<text class="value-text" v-else>{{ defaultAddress }}</text>
							<u-icon name="arrow-right" color="#ccc" size="24"></u-icon>
						</view>
					</view>
				</view>
			</view>
			
			<view class="address-section" v-if="addressList.length > 0">
				<view class="section-header">
					<view class="section-title">
						<text>收货地址列表</text>
					</view>
					<view class="add-btn" @click="goToAddress">
						<u-icon name="plus" color="#FF6B35" size="24"></u-icon>
						<text>新增</text>
					</view>
				</view>
				
				<view class="address-list">
					<view class="address-item" v-for="(item, index) in addressList" :key="index">
						<view class="address-header">
							<view class="contact-info">
								<text class="name">{{ item.name }}</text>
								<text class="phone">{{ item.phone }}</text>
							</view>
							<view class="default-tag" v-if="item.isDefault">
								<text>默认</text>
							</view>
						</view>
						<view class="address-detail">
							<text>{{ item.detail }}</text>
						</view>
						<view class="address-actions">
							<view class="action-item" @click="editAddress(item)">
								<u-icon name="edit" color="#666" size="24"></u-icon>
								<text>编辑</text>
							</view>
							<view class="action-item" @click="setDefault(item, index)">
								<u-icon :name="item.isDefault ? 'checkbox-mark-circle-fill' : 'checkbox-mark-circle'" :color="item.isDefault ? '#FF6B35' : '#ccc'" size="24"></u-icon>
								<text>设为默认</text>
							</view>
							<view class="action-item" @click="deleteAddress(item, index)">
								<u-icon name="trash" color="#999" size="24"></u-icon>
								<text>删除</text>
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="empty-address" v-else>
				<u-empty mode="list" :icon="'/static/image/phs.png'" text="暂无收货地址" margin-top="60"></u-empty>
				<view class="add-address-btn" @click="goToAddress">
					<u-button type="primary" shape="circle">添加收货地址</u-button>
				</view>
			</view>
		</view>
		
		<u-popup v-model="showEditPopup" mode="bottom" :closeable="true" :round="24">
			<view class="edit-popup">
				<view class="popup-title">
					<text>{{ currentEditField === 'nickname' ? '修改昵称' : '修改手机号' }}</text>
				</view>
				<view class="popup-input">
					<u-input
						v-model="editValue"
						:placeholder="currentEditField === 'nickname' ? '请输入昵称' : '请输入手机号'"
						:type="currentEditField === 'nickname' ? 'text' : 'number'"
						:maxlength="currentEditField === 'nickname' ? 20 : 11"
					></u-input>
				</view>
				<view class="popup-actions">
					<view class="cancel-btn" @click="showEditPopup = false">
						<text>取消</text>
					</view>
					<view class="confirm-btn" @click="saveEdit">
						<text>确定</text>
					</view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			showEditPopup: false,
			currentEditField: '',
			editValue: '',
			addressList: [
				{
					id: 1,
					name: '张三',
					phone: '13800138000',
					detail: '北京市朝阳区建国路88号SOHO现代城A座1201室',
					isDefault: true
				},
				{
					id: 2,
					name: '李四',
					phone: '13900139000',
					detail: '上海市浦东新区陆家嘴金融中心B座2005室',
					isDefault: false
				}
			]
		};
	},
	computed: {
		userInfo() {
			return this.$store.state.userInfo || {};
		},
		formattedPhone() {
			const phone = this.userInfo.phone || '13800138000';
			if (phone.length === 11) {
				return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
			}
			return phone;
		},
		defaultAddress() {
			const defaultAddr = this.addressList.find(item => item.isDefault);
			if (defaultAddr) {
				return defaultAddr.detail;
			}
			if (this.addressList.length > 0) {
				return this.addressList[0].detail;
			}
			return '';
		}
	},
	methods: {
		editNickname() {
			this.currentEditField = 'nickname';
			this.editValue = this.userInfo.nickname || this.userInfo.name || '';
			this.showEditPopup = true;
		},
		editPhone() {
			this.currentEditField = 'phone';
			this.editValue = this.userInfo.phone || '';
			this.showEditPopup = true;
		},
		saveEdit() {
			if (!this.editValue.trim()) {
				this.$utils.toast('请输入内容');
				return;
			}
			
			if (this.currentEditField === 'phone') {
				const phoneReg = /^1[3-9]\d{9}$/;
				if (!phoneReg.test(this.editValue)) {
					this.$utils.toast('请输入正确的手机号');
					return;
				}
			}
			
			uni.showLoading({ title: '保存中...' });
			setTimeout(() => {
				uni.hideLoading();
				const userInfo = { ...this.userInfo };
				if (this.currentEditField === 'nickname') {
					userInfo.nickname = this.editValue;
				} else if (this.currentEditField === 'phone') {
					userInfo.phone = this.editValue;
				}
				this.$store.commit('setUserInfo', userInfo);
				uni.setStorageSync('userInfo', userInfo);
				this.$utils.toast('保存成功');
				this.showEditPopup = false;
			}, 500);
		},
		goToAddress() {
			uni.navigateTo({
				url: '/pages/user/address'
			});
		},
		editAddress(item) {
			uni.navigateTo({
				url: `/pages/user/address?id=${item.id}`
			});
		},
		setDefault(item, index) {
			this.addressList.forEach((addr, i) => {
				addr.isDefault = i === index;
			});
			this.$utils.toast('已设为默认地址');
		},
		deleteAddress(item, index) {
			uni.showModal({
				title: '提示',
				content: '确定要删除这个地址吗？',
				success: (res) => {
					if (res.confirm) {
						this.addressList.splice(index, 1);
						this.$utils.toast('已删除');
					}
				}
			});
		}
	},
	onLoad() {
		console.log('个人详情页面加载');
	},
	onShow() {
		this.$store.dispatch('getUserInfo');
	}
};
</script>

<style lang="scss" scoped>
.profile-page {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.profile-content {
	padding-bottom: 40rpx;
}

.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 60rpx 0;
	background-color: #fff;
	margin-bottom: 20rpx;
}

.avatar-wrapper {
	position: relative;
	margin-bottom: 20rpx;
}

.avatar {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 107, 53, 0.2);
}

.change-avatar-text {
	font-size: 24rpx;
	color: #999;
}

.info-section {
	background-color: #fff;
	margin-bottom: 20rpx;
}

.section-title {
	padding: 30rpx;
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	border-bottom: 1rpx solid #f0f0f0;
}

.info-list {
	padding: 0 30rpx;
}

.info-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	
	&:last-child {
		border-bottom: none;
	}
}

.item-label {
	font-size: 30rpx;
	color: #333;
	font-weight: 500;
}

.item-value {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.value-text {
	font-size: 28rpx;
	color: #666;
	max-width: 400rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	
	&.placeholder {
		color: #bbb;
	}
}

.address-section {
	background-color: #fff;
	margin-bottom: 20rpx;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.add-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	
	text {
		font-size: 26rpx;
		color: #FF6B35;
	}
}

.address-list {
	padding: 0 30rpx;
}

.address-item {
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	
	&:last-child {
		border-bottom: none;
	}
}

.address-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.contact-info {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.name {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.phone {
	font-size: 28rpx;
	color: #666;
}

.default-tag {
	background-color: #FFF6F2;
	padding: 4rpx 16rpx;
	border-radius: 8rpx;
	
	text {
		font-size: 22rpx;
		color: #FF6B35;
	}
}

.address-detail {
	margin-bottom: 20rpx;
	
	text {
		font-size: 26rpx;
		color: #666;
		line-height: 1.6;
	}
}

.address-actions {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 40rpx;
	padding-top: 16rpx;
	border-top: 1rpx solid #f5f5f5;
}

.action-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
	
	text {
		font-size: 24rpx;
		color: #666;
	}
}

.empty-address {
	background-color: #fff;
	padding-bottom: 60rpx;
}

.add-address-btn {
	padding: 0 60rpx;
	margin-top: 40rpx;
}

.edit-popup {
	padding: 30rpx;
}

.popup-title {
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 40rpx;
}

.popup-input {
	margin-bottom: 40rpx;
}

.popup-actions {
	display: flex;
	gap: 24rpx;
}

.cancel-btn,
.confirm-btn {
	flex: 1;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 44rpx;
	font-size: 30rpx;
	
	text {
		font-weight: 500;
	}
}

.cancel-btn {
	background-color: #f5f5f5;
	
	text {
		color: #666;
	}
}

.confirm-btn {
	background: linear-gradient(135deg, #FF6B35, #FF8A50);
	
	text {
		color: #fff;
	}
}
</style>
