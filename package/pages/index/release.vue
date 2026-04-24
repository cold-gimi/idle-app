<template>
	<view class="page-updown">
		<template v-if="!userInfo.name">
			<cp-login></cp-login>
		</template>
		<template v-else>
			<view class="publish-form">
				<!-- 图片上传 -->
				<view class="form-section">
					<view class="section-header-row">
						<view class="section-title">
							<view class="section-icon">📷</view>
							商品图片
						</view>
						<view class="section-hint">最多9张 · 长按排序</view>
					</view>
					<view class="img-upload-area">
						<view v-for="(img, index) in images" :key="index" class="upload-item">
							<image :src="img" class="uploaded-img" mode="aspectFill"></image>
							<view class="del-badge" @click="delImage(index)">
								<u-icon name="close" color="#fff" size="10"></u-icon>
							</view>
						</view>
						<view v-if="images.length < 9" class="upload-item add-upload-btn" @click="chooseImage">
							<text class="add-icon">＋</text>
							<text class="add-text">添加</text>
						</view>
					</view>
					<view class="img-tip">第一张为封面图 · 建议拍摄清晰实物图 · 单张不超过5MB</view>
				</view>

				<!-- 基本信息 -->
				<view class="form-section">
					<view class="section-header-row">
						<view class="section-title">
							<view class="section-icon">✏️</view>
							基本信息
						</view>
					</view>

					<view class="form-row">
						<text class="row-label">标题</text>
						<view class="row-content">
							<input class="row-input" v-model="form.title" placeholder="请输入商品标题（限30字）" maxlength="30" />
							<text class="row-count">{{form.title.length}}/30</text>
						</view>
					</view>

					<view class="form-row desc-row">
						<text class="row-label">描述</text>
						<textarea class="desc-textarea" v-model="form.desc" placeholder="详细描述商品情况、购买时间、使用感受等..." maxlength="500" />
						<text class="desc-count">{{form.desc.length}} / 500</text>
					</view>

					<view class="form-row arrow-row" @click="showCategoryPicker = true">
						<text class="row-label">分类</text>
						<view class="row-content">
							<text :class="form.category ? 'row-value' : 'row-placeholder'">{{form.category || '请选择分类'}}</text>
							<u-icon name="arrow-right" color="#ccc" size="14"></u-icon>
						</view>
					</view>
				</view>

				<!-- 价格与成色 -->
				<view class="form-section">
					<view class="section-header-row">
						<view class="section-title">
							<view class="section-icon">💰</view>
							价格与成色
						</view>
					</view>

					<view class="form-row">
						<text class="row-label">价格</text>
						<view class="row-content price-content">
							<text class="price-symbol">¥</text>
							<input class="price-input" v-model="form.price" type="digit" placeholder="0.00" />
							<view class="price-type-toggle" :class="{'active': form.negotiable}" @click="toggleNegotiable">
								{{form.negotiable ? '可议价' : '一口价'}}
								<u-icon :name="form.negotiable ? 'arrow-down-fill' : 'arrow-right'" size="8" style="margin-left: 4rpx;"></u-icon>
							</view>
						</view>
					</view>

					<view class="form-row condition-row">
						<text class="row-label">成色</text>
						<view class="condition-options">
							<text v-for="(item, index) in conditionList" :key="index" class="cond-option"
								:class="{'active': form.condition === item}" @click="form.condition = item">
								{{item}}
							</text>
						</view>
					</view>
				</view>

				<!-- 交易设置 -->
				<view class="form-section">
					<view class="section-header-row">
						<view class="section-title">
							<view class="section-icon">⚙️</view>
							交易设置
						</view>
					</view>

					<view class="form-row trade-row">
						<text class="row-label">交易方式</text>
						<view class="trade-options">
							<view v-for="(item, index) in tradeList" :key="index" class="trade-option"
								:class="{'active': form.tradeType === item.value}" @click="form.tradeType = item.value">
								<text class="trade-radio"></text>
								{{item.label}}
							</view>
						</view>
					</view>

					<view class="form-row arrow-row" @click="chooseLocation">
						<text class="row-label">位置</text>
						<view class="row-content">
							<u-icon name="map-fill" color="#FF6B35" size="14" style="margin-right: 6rpx;"></u-icon>
							<text :class="form.location ? 'row-value' : 'row-placeholder'">{{form.location || '请选择位置'}}</text>
							<u-icon name="arrow-right" color="#ccc" size="14"></u-icon>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部操作 -->
			<view class="bottom-actions">
				<button class="btn-draft" @click="saveDraft">存草稿</button>
				<button class="btn-publish" @click="publish">立即发布</button>
			</view>

			<!-- 分类选择弹窗 -->
			<u-popup v-model="showCategoryPicker" mode="bottom" height="600rpx">
				<view style="padding: 30rpx;">
					<view style="text-align: center; font-size: 32rpx; font-weight: 700; margin-bottom: 30rpx;">选择分类</view>
					<u-cell-group>
						<u-cell-item v-for="(item, index) in categoryList" :key="index" :title="item" @click="selectCategory(item)" />
					</u-cell-group>
				</view>
			</u-popup>
		</template>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				images: [],
				form: {
					title: '',
					desc: '',
					category: '',
					price: '',
					negotiable: true,
					condition: '几乎全新',
					tradeType: 'self',
					location: ''
				},
				conditionList: ['全新', '几乎全新', '轻微使用', '明显使用'],
				tradeList: [
					{label: '自提', value: 'self'},
				],
				categoryList: ['数码家电', '服饰鞋包', '美妆护肤', '母婴用品', '图书文具', '运动户外', '家居生活', '其他闲置'],
				showCategoryPicker: false
			};
		},
		computed: {
			userInfo: function() {
				return this.$store.state.userInfo || {}
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			goDraft() {
				uni.showToast({title: '草稿箱', icon: 'none'});
			},
			chooseImage() {
				const remain = 9 - this.images.length;
				uni.chooseImage({
					count: remain,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.images = this.images.concat(res.tempFilePaths);
					}
				});
			},
			delImage(index) {
				this.images.splice(index, 1);
			},
			toggleNegotiable() {
				this.form.negotiable = !this.form.negotiable;
			},
			selectCategory(item) {
				this.form.category = item;
				this.showCategoryPicker = false;
			},
			chooseLocation() {
				uni.getSetting({
					success: (res) => {
						const authSetting = res.authSetting;
						if (authSetting['scope.userLocation'] === false) {
							uni.showModal({
								title: '提示',
								content: '需要获取您的位置信息，请前往设置开启权限',
								confirmText: '去设置',
								success: (modalRes) => {
									if (modalRes.confirm) {
										uni.openSetting();
									}
								}
							});
						} else {
							uni.chooseLocation({
								success: (locationRes) => {
									this.form.location = locationRes.name;
								},
								fail: (err) => {
									if (err.errMsg && err.errMsg.includes('cancel')) return;
									// 授权被拒或接口未开通
									if (err.errMsg && (err.errMsg.includes('auth') || err.errMsg.includes('not declared'))) {
										uni.showModal({
											title: '提示',
											content: '需要获取您的位置信息，请前往设置开启权限',
											confirmText: '去设置',
											success: (modalRes) => {
												if (modalRes.confirm) {
													uni.openSetting();
												}
											}
										});
									} else {
										uni.showToast({ title: '选择位置失败', icon: 'none' });
									}
								}
							});
						}
					},
					fail: () => {
						uni.showToast({ title: '获取权限设置失败', icon: 'none' });
					}
				});
			},
			validate() {
				if (!this.images.length) {
					uni.showToast({title: '请至少上传一张图片', icon: 'none'});
					return false;
				}
				if (!this.form.title.trim()) {
					uni.showToast({title: '请输入商品标题', icon: 'none'});
					return false;
				}
				if (!this.form.price) {
					uni.showToast({title: '请输入价格', icon: 'none'});
					return false;
				}
				return true;
			},
			saveDraft() {
				uni.showToast({title: '已保存到草稿箱', icon: 'success'});
			},
			publish() {
				if (!this.validate()) return;
				uni.showLoading({title: '发布中...'});
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({title: '发布成功', icon: 'success'});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}, 1500);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.page-updown {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
	}

	.publish-form {
		flex: 1;
		padding: 30rpx;
		overflow-y: auto;
	}

	.form-section {
		background: #fff;
		border-radius: 32rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
	}

	.section-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}
	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #1a1a1a;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}
	.section-icon {
		font-size: 28rpx;
	}
	.section-hint {
		font-size: 22rpx;
		color: #999;
	}

	.img-upload-area {
		display: flex;
		gap: 16rpx;
		flex-wrap: wrap;
	}
	.upload-item {
		width: calc((100% - 48rpx) / 4);
		height: 160rpx;
		border-radius: 24rpx;
		overflow: hidden;
		position: relative;
		background: #f5f5f5;
		flex-shrink: 0;
	}
	.uploaded-img {
		width: 100%;
		height: 100%;
	}
	.del-badge {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 36rpx;
		height: 36rpx;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.add-upload-btn {
		border: 2rpx dashed #ddd;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background: #fafafa;
		border-radius: 24rpx;
	}
	.add-icon {
		font-size: 40rpx;
		color: #ccc;
		font-weight: 300;
		line-height: 1;
	}
	.add-text {
		font-size: 20rpx;
		color: #bbb;
		margin-top: 4rpx;
	}
	.img-tip {
		font-size: 22rpx;
		color: #ccc;
		margin-top: 16rpx;
		line-height: 1.4;
	}

	.form-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f2f2f2;
	}
	.form-row:last-child {
		border-bottom: none;
	}
	.desc-row {
		flex-direction: column;
		align-items: flex-start;
		padding-bottom: 16rpx;
	}
	.condition-row {
		flex-direction: column;
		align-items: flex-start;
		padding-top: 16rpx;
	}
	.trade-row {
		flex-direction: column;
		align-items: flex-start;
		padding-top: 16rpx;
	}
	.row-label {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		flex-shrink: 0;
	}
	.row-content {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex: 1;
		gap: 8rpx;
	}
	.row-input {
		font-size: 28rpx;
		color: #333;
		text-align: right;
		width: 400rpx;
	}
	.row-input::placeholder {
		color: #ccc;
	}
	.row-count {
		font-size: 22rpx;
		color: #FF6B35;
		font-weight: 500;
		white-space: nowrap;
	}
	.row-value {
		font-size: 28rpx;
		color: #333;
	}
	.row-placeholder {
		font-size: 28rpx;
		color: #bbb;
	}
	.arrow-row {
		padding-right: 0;
	}

	.desc-textarea {
		width: 100%;
		height: 160rpx;
		background: #f8f8f8;
		border-radius: 24rpx;
		padding: 20rpx;
		font-size: 28rpx;
		color: #333;
		margin-top: 16rpx;
		box-sizing: border-box;
	}
	.desc-textarea::placeholder {
		color: #ccc;
	}
	.desc-count {
		font-size: 22rpx;
		color: #ccc;
		margin-top: 8rpx;
		align-self: flex-end;
	}

	.price-content {
		gap: 12rpx;
	}
	.price-symbol {
		color: #FF4D4F;
		font-weight: 700;
		font-size: 40rpx;
	}
	.price-input {
		font-size: 48rpx;
		font-weight: 700;
		color: #FF4D4F;
		width: 200rpx;
		text-align: left;
	}
	.price-input::placeholder {
		color: #ffccc7;
	}
	.price-type-toggle {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 24rpx;
		background: #f5f5f5;
		color: #999;
		font-weight: 500;
		display: flex;
		align-items: center;
	}
	.price-type-toggle.active {
		background: #FFF6F2;
		color: #FF6B35;
	}

	.condition-options {
		display: flex;
		gap: 16rpx;
		margin-top: 16rpx;
		width: 100%;
	}
	.cond-option {
		font-size: 26rpx;
		padding: 12rpx 28rpx;
		border-radius: 32rpx;
		border: 2rpx solid #eee;
		color: #666;
		font-weight: 400;
		background: #fff;
	}
	.cond-option.active {
		border-color: #FF6B35;
		background: #FFF6F2;
		color: #FF6B35;
		font-weight: 500;
	}

	.trade-options {
		display: flex;
		gap: 32rpx;
		margin-top: 16rpx;
		width: 100%;
	}
	.trade-option {
		font-size: 28rpx;
		color: #666;
		display: flex;
		align-items: center;
		gap: 10rpx;
		font-weight: 400;
	}
	.trade-option.active {
		color: #FF6B35;
		font-weight: 500;
	}
	.trade-radio {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		border: 2rpx solid #ddd;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		position: relative;
		transition: all 0.2s;
		flex-shrink: 0;
	}
	.trade-option.active .trade-radio {
		border-color: #FF6B35;
		background: #FF6B35;
	}
	.trade-option.active .trade-radio::after {
		content: '';
		width: 14rpx;
		height: 8rpx;
		border-left: 3rpx solid #fff;
		border-bottom: 3rpx solid #fff;
		transform: rotate(-45deg);
		margin-top: -4rpx;
	}

	.bottom-actions {
		padding: 24rpx 30rpx calc(24rpx + env(safe-area-inset-bottom));
		background: #fff;
		border-top: 1rpx solid #f0f0f0;
		display: flex;
		gap: 24rpx;
	}
	.btn-draft {
		flex: 1;
		height: 84rpx;
		line-height: 84rpx;
		border: 2rpx solid #eee;
		border-radius: 42rpx;
		text-align: center;
		font-size: 28rpx;
		color: #666;
		background: #fff;
		font-weight: 500;
		padding: 0;
	}
	.btn-publish {
		flex: 2;
		height: 84rpx;
		line-height: 84rpx;
		border: none;
		border-radius: 42rpx;
		text-align: center;
		font-size: 28rpx;
		color: #fff;
		font-weight: 600;
		background: linear-gradient(135deg, #FF6B35, #FF8A50);
		box-shadow: 0 8rpx 20rpx rgba(255, 107, 53, 0.25);
		padding: 0;
	}
	.btn-publish::after {
		border: none;
	}
</style>
