<template>
	<view class="chat-page">
		<u-navbar 
			title=" " 
			:is-back="true" 
			back-icon-name="nav-back"
			back-icon-color="#fff"
			:background="{ backgroundImage: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)' }"
			:border-bottom="false"
		>
			<view class="navbar-center" slot="default">
				<view class="user-info">
					<view class="avatar" :style="{ background: shopAvatarBg || '#FF6B9D' }">
						<text class="avatar-text">{{ shopName ? shopName.charAt(0) : '?' }}</text>
					</view>
					<view class="user-detail">
						<text class="nickname">{{ shopName || '商家' }}</text>
						<view class="status">
							<view class="status-dot online"></view>
							<text class="status-text">在线</text>
						</view>
					</view>
				</view>
			</view>
		</u-navbar>
		
		<view class="goods-card" v-if="showGoodsCard" @click="viewGoodsDetail">
			<image class="goods-image" :src="goodsInfo.image || '/static/image/phone.png'" mode="aspectFill"></image>
			<view class="goods-info">
				<text class="goods-title">{{ goodsInfo.title || '商品标题' }}</text>
				<view class="goods-price">
					<text class="current-price">¥{{ goodsInfo.price || '0' }}</text>
					<text class="original-price" v-if="goodsInfo.originalPrice">¥{{ goodsInfo.originalPrice }}</text>
				</view>
			</view>
			<u-icon name="arrow-right" color="#999" size="32"></u-icon>
		</view>
		
		<scroll-view 
			scroll-y 
			class="message-list" 
			:scroll-into-view="scrollToView"
			:scroll-with-animation="true"
		>
			<view class="messages">
				<view 
					v-for="(message, index) in messages" 
					:key="message.id || index"
					:id="`msg-${index}`"
					class="message-item"
					:class="{ 'message-right': message.isSelf }"
					@longpress="showMessageMenu(message, index)"
				>
					<view class="avatar-wrapper">
						<view class="avatar" :style="{ background: message.avatarBg || (message.isSelf ? '#FF6B35' : '#FF6B9D') }">
							<text class="avatar-text">{{ message.nickname ? message.nickname.charAt(0) : '?' }}</text>
						</view>
						<view class="nickname-tag" v-if="message.isSelf">
							<text>{{ message.nickname || '我' }}</text>
						</view>
					</view>
					
					<view class="message-content">
						<view class="message-time" v-if="showTime(index)">
							<text>{{ formatTime(message.time) }}</text>
						</view>
						
						<view class="message-bubble" :class="message.type">
							<template v-if="message.type === 'text'">
								<text class="message-text">{{ message.content }}</text>
							</template>
							
							<template v-else-if="message.type === 'image'">
								<image 
									class="message-image" 
									:src="message.content" 
									mode="aspectFit"
									@click="previewImage(message.content)"
								></image>
							</template>
							
							<template v-else-if="message.type === 'video'">
								<view class="message-video" @click="playVideo(message.content)">
									<image 
										class="video-thumbnail" 
										:src="message.thumbnail || '/static/image/phs.png'" 
										mode="aspectFill"
									></image>
									<view class="play-icon">
										<u-icon name="play-right" color="#fff" size="40"></u-icon>
									</view>
									<view class="video-duration">{{ message.duration || '00:00' }}</view>
								</view>
								<text class="video-label" v-if="message.label">{{ message.label }}</text>
							</template>
							
							<template v-else-if="message.type === 'voice'">
								<view class="message-voice" @click="toggleVoicePlay(message)">
									<view class="voice-wave" :class="{ 'playing': message.isPlaying }">
										<view class="wave-item" v-for="i in 3" :key="i"></view>
									</view>
									<text class="voice-duration">{{ message.duration || '0"' }}</text>
								</view>
							</template>
							
							<template v-else-if="message.type === 'recall'">
								<view class="message-recall">
									<text class="recall-text">{{ message.content }}</text>
								</view>
							</template>
						</view>
						
						<view class="message-status" v-if="message.isSelf">
							<text class="status-text" v-if="message.status === 'sending'">发送中...</text>
							<u-icon v-else-if="message.status === 'failed'" name="info-circle" color="#ff4d4f" size="24"></u-icon>
							<u-icon v-else-if="message.status === 'sent'" name="checkmark" color="#52c41a" size="24"></u-icon>
						</view>
					</view>
				</view>
			</view>
			
			<view class="typing-indicator" v-if="isTyping">
				<text>商家正在输入...</text>
			</view>
			<view style="height: 20rpx;"></view>
		</scroll-view>
		
		<!-- 底部占位 -->
		<view :style="{ height: (keyboardHeight + (keyboardHeight > 0 ? inputAreaHeight - safeAreaHeight : inputAreaHeight)) + 'px' }"></view>
		
		<view class="input-area" id="input-area" :class="{ 'expanded': showMoreTools || showEmoji }" :style="{ bottom: keyboardHeight + 'px', paddingBottom: keyboardHeight > 0 ? '16rpx' : '' }">
			<view class="input-toolbar">
				<view class="tool-btn" @click="toggleVoiceInput">
					<u-icon name="mic" color="#666" size="48"></u-icon>
				</view>
				
				<view class="input-wrapper">
					<textarea v-model="inputText" placeholder="发消息..." class="textarea" :auto-height="true" :show-confirm-bar="false" confirm-type="send" :disable-default-padding="true" :fixed="true" :adjust-position="false" @focus="onInputFocus" @blur="onInputBlur" @keyboardheightchange="onKeyboardHeightChange" @confirm="sendTextMessage"></textarea>
				</view>
				
				<view class="tool-btn" @click="toggleEmoji">
					😀
				</view>
				
				<view class="tool-btn" v-if="!inputText" @click="toggleMoreTools">
					<u-icon :name="showMoreTools ? 'close' : 'plus'" color="#666" size="48"></u-icon>
				</view>
				
				<view class="send-btn" v-if="inputText" @click="sendTextMessage">
					<view class="send-icon">
						<u-icon name="arrow-right" color="#fff" size="32"></u-icon>
					</view>
				</view>
			</view>
			
			<view class="emoji-panel" v-if="showEmoji">
				<scroll-view scroll-x class="emoji-scroll">
					<view class="emoji-list">
						<view 
							v-for="(emoji, index) in emojiList" 
							:key="index"
							class="emoji-item"
							@click="insertEmoji(emoji)"
						>
							<text class="emoji-text">{{ emoji }}</text>
						</view>
					</view>
				</scroll-view>
			</view>
			
			<view class="more-tools-panel" v-if="showMoreTools">
				<view class="tools-grid">
					<view class="tool-item" @click="chooseImage">
						<view class="tool-icon">
							<u-icon name="photo" color="#FF6B35" size="48"></u-icon>
						</view>
						<text class="tool-label">图片</text>
					</view>
					
					<view class="tool-item" @click="takePhoto">
						<view class="tool-icon">
							<u-icon name="camera" color="#1890FF" size="48"></u-icon>
						</view>
						<text class="tool-label">拍摄</text>
					</view>
					
					<view class="tool-item" @click="chooseVideo">
						<view class="tool-icon">
							<u-icon name="play-right" color="#52c41a" size="48"></u-icon>
						</view>
						<text class="tool-label">视频</text>
					</view>
					
					<view class="tool-item" @click="chooseLocation">
						<view class="tool-icon">
							<u-icon name="map" color="#722ED1" size="48"></u-icon>
						</view>
						<text class="tool-label">位置</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="recording-tip" v-if="isRecording" :class="{ 'cancel-mode': isInCancelArea }">
			<view class="recording-icon" :class="{ 'cancel': isInCancelArea }">
				<u-icon :name="isInCancelArea ? 'minus-circle' : 'mic'" color="#fff" size="60"></u-icon>
			</view>
			<text class="recording-text">{{ isInCancelArea ? '松开手指取消' : `正在录音... ${recordingTime}s` }}</text>
			<text class="recording-hint">{{ isInCancelArea ? '向下滑动继续录音' : '上滑取消录音' }}</text>
		</view>
		
		<view class="message-menu-mask" v-if="showMessageMenu" @click="hideMessageMenu"></view>
		<view class="message-menu" v-if="showMessageMenu">
			<view class="menu-item" v-if="canRecall(selectedMessage)" @click="recallMessage">
				<u-icon name="info-circle" color="#333" size="40"></u-icon>
				<text class="menu-text">撤回</text>
			</view>
			<view class="menu-item" v-if="selectedMessage.type === 'text'" @click="copyMessage">
				<u-icon name="copy" color="#333" size="40"></u-icon>
				<text class="menu-text">复制</text>
			</view>
			<view class="menu-item" @click="deleteMessage">
				<u-icon name="trash" color="#ff4d4f" size="40"></u-icon>
				<text class="menu-text" style="color: #ff4d4f;">删除</text>
			</view>
		</view>
		
		<!-- 隐私协议弹窗 -->
		<privacy-popup></privacy-popup>
	</view>
</template>

<script>
import websocketManager from '@/utils/websocket.js';
import privacyPopup from '@/components/privacy-popup/privacy-popup.vue';

export default {
	components: {
		privacyPopup
	},
	data() {
		return {
			sessionId: '',
			shopId: '',
			shopName: '',
			shopAvatarBg: '#FF6B9D',
			userId: '',
			userName: '',
			avatarBg: '#FF6B35',
			
			showGoodsCard: true,
			goodsInfo: {
				image: '/static/image/phone.png',
				title: 'iPhone 14 Pro 256G 深空黑',
				price: '3,800',
				originalPrice: '5,999'
			},
			
			messages: [],
			
			inputText: '',
			showEmoji: false,
			showMoreTools: false,
			
			isRecording: false,
			recordingTime: 0,
			recordingTimer: null,
			voiceFilePath: '',
			
			isTyping: false,
			scrollToView: '',
			
			emojiList: ['😀', '😂', '😊', '🥰', '😎', '🤔', '😘', '👍', '👎', '👏', '🙏', '💪', '❤️', '🔥', '🎉', '👍', '😍', '🤣', '😊', '🙂', '😉', '😇', '🥳', '😎', '🤩', '😋', '🤗', '🤔', '🤐', '🤫', '🤭', '🤫', '😏', '😒', '🙄', '😮', '😯', '😲', '😳', '🥺', '😢', '😭', '😤', '😡', '🤬', '😈', '👿', '💀', '☠️', '👻', '👽', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💅', '🤝', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸', '💓', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳', '💣', '💬', '🗨', '🗯', '💭', '💤'],
			
			showMessageMenu: false,
			selectedMessage: null,
			selectedMessageIndex: -1,
			
			recallTimeLimit: 120000,
			
			isInCancelArea: false,
			voiceStartY: 0,
			
			keyboardHeight: 0,
			inputAreaHeight: 0,
			safeAreaHeight: 0
		};
	},
	onLoad(options) {
		const systemInfo = uni.getSystemInfoSync();
		this.safeAreaHeight = systemInfo.screenHeight - systemInfo.safeArea.bottom;
		
		if (options.sessionId) {
			this.sessionId = options.sessionId;
		}
		if (options.shopId) {
			this.shopId = options.shopId;
		}
		if (options.shopName) {
			this.shopName = decodeURIComponent(options.shopName);
		}
		if (options.goodsId) {
			this.goodsId = options.goodsId;
		}
		
		this.initWebSocket();
		this.loadHistoryMessages();
		this.listenMessages();
	},
	onReady() {
		this.updateInputAreaHeight();
	},
	onUnload() {
		this.cleanup();
	},
	methods: {
		initWebSocket() {
			const wsUrl = 'ws://localhost:8080/ws';
			const token = uni.getStorageSync('token') || 'demo_token';
			
			websocketManager.init(wsUrl, token);
			
			websocketManager.onConnection((event) => {
				console.log('WebSocket连接状态:', event);
				if (event.type === 'connected') {
					this.joinSession();
				}
			});
		},
		
		joinSession() {
			const joinMessage = {
				type: 'join',
				sessionId: this.sessionId,
				userId: this.userId || 'demo_user',
				shopId: this.shopId
			};
			websocketManager.send(joinMessage);
		},
		
		loadHistoryMessages() {
			this.messages = [
				{
					id: 1,
					type: 'text',
					content: '你好，这个iPhone还在吗？成色怎么样？',
					time: Date.now() - 3600000,
					isSelf: false,
					nickname: '小',
					avatarBg: '#FF6B9D',
					status: 'sent'
				},
				{
					id: 2,
					type: 'text',
					content: '在的！9成新，用了一年，换新机所以出掉。屏幕无划痕、背板完好 🙌',
					time: Date.now() - 3500000,
					isSelf: true,
					nickname: '我',
					avatarBg: '#FF6B35',
					status: 'sent'
				},
				{
					id: 3,
					type: 'image',
					content: '/static/image/phone.png',
					time: Date.now() - 3400000,
					isSelf: false,
					nickname: '小',
					avatarBg: '#FF6B9D',
					status: 'sent'
				},
				{
					id: 4,
					type: 'video',
					content: '/static/video/demo.mp4',
					thumbnail: '/static/image/phs.png',
					duration: '0:23',
					label: '实拍视频',
					time: Date.now() - 3300000,
					isSelf: false,
					nickname: '小',
					avatarBg: '#FF6B9D',
					status: 'sent'
				},
				{
					id: 5,
					type: 'video',
					content: '/static/video/demo2.mp4',
					thumbnail: '/static/image/phs.png',
					duration: '1:05',
					label: '开机验机视频',
					time: Date.now() - 3200000,
					isSelf: true,
					nickname: '我',
					avatarBg: '#FF6B35',
					status: 'sent'
				},
				{
					id: 6,
					type: 'text',
					content: '可以约个地方当面验机，我在朝阳区 😊',
					time: Date.now() - 3100000,
					isSelf: true,
					nickname: '我',
					avatarBg: '#FF6B35',
					status: 'sending'
				}
			];
			
			this.scrollToBottom();
		},
		
		listenMessages() {
			websocketManager.onMessage((message) => {
				console.log('收到消息:', message);
				this.handleReceivedMessage(message);
			});
		},
		
		handleReceivedMessage(message) {
			switch (message.type) {
				case 'text':
				case 'image':
				case 'video':
				case 'voice':
					this.messages.push({
						...message,
						isSelf: false,
						time: Date.now(),
						status: 'sent'
					});
					this.scrollToBottom();
					break;
				case 'typing':
					this.isTyping = true;
					setTimeout(() => {
						this.isTyping = false;
					}, 3000);
					break;
			}
		},
		
		sendTextMessage() {
			if (!this.inputText.trim()) return;
			
			const message = {
				id: Date.now(),
				type: 'text',
				content: this.inputText.trim(),
				time: Date.now(),
				isSelf: true,
				nickname: '我',
				avatarBg: this.avatarBg,
				status: 'sending'
			};
			
			this.messages.push(message);
			this.inputText = '';
			this.scrollToBottom();
			
			const sendMessage = {
				type: 'text',
				sessionId: this.sessionId,
				content: message.content,
				timestamp: message.time
			};
			
			if (websocketManager.isConnected) {
				websocketManager.send(sendMessage);
				this.updateMessageStatus(message.id, 'sent');
			} else {
				this.updateMessageStatus(message.id, 'failed');
				this.$utils.toast('消息发送失败，请检查网络连接');
			}
		},
		
		updateMessageStatus(messageId, status) {
			const message = this.messages.find(m => m.id === messageId);
			if (message) {
				message.status = status;
			}
		},
		
		chooseImage() {
			this._doChooseImage();
		},
		
		_doChooseImage() {
			uni.chooseImage({
				count: 9,
				sizeType: ['original', 'compressed'],
				sourceType: ['album'],
				success: (res) => {
					const tempFilePaths = res.tempFilePaths;
					tempFilePaths.forEach((filePath, index) => {
						this.sendImageMessage(filePath, index);
					});
				},
				fail: (err) => {
					console.error('选择图片失败:', err);
					if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize:fail'))) {
						uni.showModal({
							title: '提示',
							content: '需要您的相册许可才能选择图片，请前往设置开启',
							confirmText: '去设置',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting();
								}
							}
						});
					} else if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						this.$utils.toast('选择图片失败');
					}
				}
			});
		},
		
		takePhoto() {
			this._doTakePhoto();
		},
		
		_doTakePhoto() {
			uni.chooseImage({
				count: 1,
				sizeType: ['original', 'compressed'],
				sourceType: ['camera'],
				success: (res) => {
					const tempFilePaths = res.tempFilePaths;
					tempFilePaths.forEach((filePath, index) => {
						this.sendImageMessage(filePath, index);
					});
				},
				fail: (err) => {
					console.error('拍照失败:', err);
					if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize:fail'))) {
						uni.showModal({
							title: '提示',
							content: '需要您的相机许可才能拍摄，请前往设置开启',
							confirmText: '去设置',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting();
								}
							}
						});
					} else if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						this.$utils.toast('拍照失败');
					}
				}
			});
		},
		
		async sendImageMessage(filePath, index) {
			const message = {
				id: Date.now() + index,
				type: 'image',
				content: filePath,
				time: Date.now(),
				isSelf: true,
				nickname: '我',
				avatarBg: this.avatarBg,
				status: 'sending'
			};
			
			this.messages.push(message);
			this.scrollToBottom();
			
			try {
				const res = await this.$utils.upload({
					url: 'UPLOAD',
					filePath: filePath,
					name: 'file'
				});
				
				if (res && res.success) {
					const imageUrl = res.data.url;
					// 更新本地消息内容为服务器返回的URL
					message.content = imageUrl;
					
					// 发送WebSocket消息
					const sendMessage = {
						type: 'image',
						sessionId: this.sessionId,
						content: imageUrl,
						timestamp: message.time
					};
					
					if (websocketManager.isConnected) {
						websocketManager.send(sendMessage);
						this.updateMessageStatus(message.id, 'sent');
					} else {
						this.updateMessageStatus(message.id, 'failed');
						this.$utils.toast('网络连接已断开，发送失败');
					}
				} else {
					throw new Error(res.message || '上传失败');
				}
			} catch (error) {
				console.error('图片上传失败:', error);
				this.updateMessageStatus(message.id, 'failed');
				this.$utils.toast('图片上传失败');
			}
		},
		
		previewImage(currentUrl) {
			const urls = this.messages
				.filter(m => m.type === 'image')
				.map(m => m.content);
			
			uni.previewImage({
				current: currentUrl,
				urls: urls
			});
		},
		
		chooseVideo() {
			uni.chooseVideo({
				sourceType: ['album', 'camera'],
				maxDuration: 60,
				camera: 'back',
				success: (res) => {
					this.sendVideoMessage(res);
				},
				fail: (err) => {
					console.error('选择视频失败:', err);
					if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize:fail'))) {
						uni.showModal({
							title: '提示',
							content: '需要您的相机或相册许可才能选择视频，请前往设置开启',
							confirmText: '去设置',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting();
								}
							}
						});
					} else if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						this.$utils.toast('选择视频失败');
					}
				}
			});
		},
		
		sendVideoMessage(videoInfo) {
			const message = {
				id: Date.now(),
				type: 'video',
				content: videoInfo.tempFilePath,
				thumbnail: videoInfo.thumbTempFilePath,
				duration: this.formatDuration(videoInfo.duration),
				time: Date.now(),
				isSelf: true,
				nickname: '我',
				avatarBg: this.avatarBg,
				status: 'sending'
			};
			
			this.messages.push(message);
			this.scrollToBottom();
			
			setTimeout(() => {
				this.updateMessageStatus(message.id, 'sent');
			}, 2000);
		},
		
		playVideo(videoPath) {
			uni.previewVideo({
				url: videoPath,
				fail: (error) => {
					console.error('视频预览失败:', error);
					uni.showModal({
						title: '提示',
						content: '视频预览失败，是否使用系统播放器打开？',
						success: (res) => {
							if (res.confirm) {
								uni.openVideo({
									url: videoPath,
									fail: (err) => {
										console.error('打开视频失败:', err);
										this.$utils.toast('无法打开视频');
									}
								});
							}
						}
					});
				}
			});
		},
		
		onVoiceTouchStart(e) {
			this.voiceStartY = e.touches[0].clientY;
			this.isInCancelArea = false;
			this.startRecording();
		},
		
		onVoiceTouchMove(e) {
			if (!this.isRecording) return;
			
			const currentY = e.touches[0].clientY;
			const moveDistance = this.voiceStartY - currentY;
			
			this.isInCancelArea = moveDistance > 100;
		},
		
		onVoiceTouchEnd() {
			if (!this.isRecording) return;
			
			if (this.isInCancelArea) {
				this.cancelRecording();
			} else {
				this.stopRecording();
			}
			
			this.isInCancelArea = false;
		},
		
		startRecording() {
			this.isRecording = true;
			this.recordingTime = 0;
			
			this.recordingTimer = setInterval(() => {
				this.recordingTime++;
				if (this.recordingTime >= 60) {
					this.stopRecording();
				}
			}, 1000);
			
			uni.startRecord({
				success: (res) => {
					this.voiceFilePath = res.tempFilePath;
				},
				fail: (err) => {
					console.error('录音失败:', err);
					this.isRecording = false;
					if (this.recordingTimer) {
						clearInterval(this.recordingTimer);
					}
					
					if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize:fail'))) {
						uni.showModal({
							title: '提示',
							content: '需要您的麦克风许可才能录音，请前往设置开启',
							confirmText: '去设置',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting();
								}
							}
						});
					} else {
						this.$utils.toast('录音失败，请检查权限');
					}
				}
			});
		},
		
		stopRecording() {
			this.isRecording = false;
			
			if (this.recordingTimer) {
				clearInterval(this.recordingTimer);
				this.recordingTimer = null;
			}
			
			uni.stopRecord();
			
			if (this.recordingTime < 1) {
				this.$utils.toast('录音时间太短');
				return;
			}
			
			this.sendVoiceMessage();
		},
		
		cancelRecording() {
			this.isRecording = false;
			
			if (this.recordingTimer) {
				clearInterval(this.recordingTimer);
				this.recordingTimer = null;
			}
			
			uni.stopRecord();
			this.$utils.toast('已取消录音');
		},
		
		sendVoiceMessage() {
			const message = {
				id: Date.now(),
				type: 'voice',
				content: this.voiceFilePath,
				duration: `${this.recordingTime}"`,
				durationSeconds: this.recordingTime,
				time: Date.now(),
				isSelf: true,
				nickname: '我',
				avatarBg: this.avatarBg,
				status: 'sending',
				isPlaying: false
			};
			
			this.messages.push(message);
			this.scrollToBottom();
			
			setTimeout(() => {
				this.updateMessageStatus(message.id, 'sent');
			}, 500);
		},
		
		toggleVoicePlay(message) {
			this.messages.forEach(m => {
				if (m.id !== message.id) {
					m.isPlaying = false;
				}
			});
			
			if (message.isPlaying) {
				uni.stopVoice();
				message.isPlaying = false;
			} else {
				message.isPlaying = true;
				uni.playVoice({
					filePath: message.content,
					complete: () => {
						message.isPlaying = false;
					}
				});
				
				setTimeout(() => {
					if (message.isPlaying) {
						uni.stopVoice();
						message.isPlaying = false;
					}
				}, message.durationSeconds * 1000 + 500);
			}
		},
		
		chooseLocation() {
			uni.chooseLocation({
				success: (res) => {
					console.log('选择位置:', res);
					this.$utils.toast('位置选择功能开发中');
				},
				fail: (err) => {
					console.error('选择位置失败:', err);
					if (err.errMsg && (err.errMsg.includes('auth deny') || err.errMsg.includes('authorize:fail'))) {
						uni.showModal({
							title: '提示',
							content: '需要您的位置信息许可才能选择位置，请前往设置开启',
							confirmText: '去设置',
							success: (res) => {
								if (res.confirm) {
									uni.openSetting();
								}
							}
						});
					} else if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
						this.$utils.toast('选择位置失败');
					}
				}
			});
		},
		
		showMoreMenu() {
			uni.showActionSheet({
				itemList: ['查看资料', '清空聊天记录'],
				success: (res) => {
					if (res.tapIndex === 0) {
						this.$utils.toast('查看资料功能开发中');
					} else if (res.tapIndex === 1) {
						uni.showModal({
							title: '提示',
							content: '确定要清空聊天记录吗？',
							success: (modalRes) => {
								if (modalRes.confirm) {
									this.messages = [];
									this.$utils.toast('已清空聊天记录');
								}
							}
						});
					}
				}
			});
		},
		
		onVoiceClick() {
			this.$utils.toast('语音功能开发中');
		},
		
		onShareClick() {
			this.$utils.toast('分享功能开发中');
		},
		
		viewGoodsDetail() {
			this.$utils.toast('查看商品详情');
		},
		
		toggleVoiceInput() {
			this.$utils.toast('语音输入功能开发中');
		},
		
		toggleEmoji() {
			this.showEmoji = !this.showEmoji;
		this.showMoreTools = false;
		this.updateInputAreaHeight();
	},
	
	toggleMoreTools() {
		this.showMoreTools = !this.showMoreTools;
		this.showEmoji = false;
		this.updateInputAreaHeight();
	},
		
		insertEmoji(emoji) {
			this.inputText += emoji;
		},
		
		onInputFocus(e) {
			this.showEmoji = false;
			this.showMoreTools = false;
			// 这里的 e.detail.height 可能不准，依赖 keyboardheightchange
			setTimeout(() => {
				this.scrollToBottom();
			}, 300);
		},
		
		onInputBlur() {
			this.keyboardHeight = 0;
		},
		
		onKeyboardHeightChange(e) {
			const { height } = e.detail;
			this.keyboardHeight = height;
			if (height > 0) {
				this.scrollToBottom();
			}
			this.updateInputAreaHeight();
		},
		
		updateInputAreaHeight() {
			this.$nextTick(() => {
				setTimeout(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('#input-area').boundingClientRect(data => {
						if (data) {
							this.inputAreaHeight = data.height;
							this.scrollToBottom();
						}
					}).exec();
				}, 50);
			});
		},
		
		scrollToBottom() {
			this.$nextTick(() => {
				if (this.messages.length > 0) {
					this.scrollToView = `msg-${this.messages.length - 1}`;
				}
			});
		},
		
		formatTime(timestamp) {
			const date = new Date(timestamp);
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			return `${hours}:${minutes}`;
		},
		
		formatDuration(seconds) {
			const mins = Math.floor(seconds / 60);
			const secs = Math.floor(seconds % 60);
			return `${mins}:${secs.toString().padStart(2, '0')}`;
		},
		
		showTime(index) {
			if (index === 0) return true;
			const currentTime = this.messages[index].time;
			const prevTime = this.messages[index - 1].time;
			return currentTime - prevTime > 300000;
		},
		
		cleanup() {
			if (this.recordingTimer) {
				clearInterval(this.recordingTimer);
			}
			uni.stopRecord();
			uni.stopVoice();
		},
		
		showMessageMenu(message, index) {
			this.selectedMessage = message;
			this.selectedMessageIndex = index;
			this.showMessageMenu = true;
		},
		
		hideMessageMenu() {
			this.showMessageMenu = false;
			this.selectedMessage = null;
			this.selectedMessageIndex = -1;
		},
		
		canRecall(message) {
			if (!message || !message.isSelf || message.type === 'recall') {
				return false;
			}
			const now = Date.now();
			const messageTime = message.time;
			return (now - messageTime) <= this.recallTimeLimit;
		},
		
		recallMessage() {
			if (!this.selectedMessage || !this.canRecall(this.selectedMessage)) {
				return;
			}
			
			uni.showModal({
				title: '提示',
				content: '确定要撤回这条消息吗？',
				success: (res) => {
					if (res.confirm) {
						const index = this.selectedMessageIndex;
						if (index >= 0 && index < this.messages.length) {
							const recalledMessage = {
								id: Date.now(),
								type: 'recall',
								content: this.selectedMessage.isSelf ? '你撤回了一条消息' : '对方撤回了一条消息',
								time: Date.now(),
								isSelf: true,
								nickname: '系统',
								avatarBg: '#999',
								status: 'sent'
							};
							
							this.messages.splice(index, 1, recalledMessage);
							this.$utils.toast('消息已撤回');
						}
						this.hideMessageMenu();
					}
				}
			});
		},
		
		copyMessage() {
			if (!this.selectedMessage || this.selectedMessage.type !== 'text') {
				return;
			}
			
			uni.setClipboardData({
				data: this.selectedMessage.content,
				success: () => {
					this.$utils.toast('已复制到剪贴板');
					this.hideMessageMenu();
				}
			});
		},
		
		deleteMessage() {
			if (!this.selectedMessage) {
				return;
			}
			
			uni.showModal({
				title: '提示',
				content: '确定要删除这条消息吗？',
				success: (res) => {
					if (res.confirm) {
						const index = this.selectedMessageIndex;
						if (index >= 0 && index < this.messages.length) {
							this.messages.splice(index, 1);
							this.$utils.toast('消息已删除');
						}
						this.hideMessageMenu();
					}
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.chat-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f8f8;
	position: relative;
}

.navbar-center {
	display: flex;
	align-items: center;
	width: 100%;
}

.user-info {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.user-info .avatar {
	width: 56rpx;
	height: 56rpx;
	margin: 0;
	border-radius: 12rpx;
	box-shadow: none;
	overflow: hidden;
}

.user-info .avatar .avatar-text {
	font-size: 24rpx;
	color: #fff;
}

.user-detail {
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.nickname {
	font-size: 32rpx;
	font-weight: 600;
	color: #fff;
	line-height: 1.2;
}

.status {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-top: 4rpx;
}

.status-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	
	&.online {
		background-color: #52c41a;
		position: relative;
		border: 2rpx solid rgba(255, 255, 255, 0.8);
		
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			background-color: #52c41a;
			animation: breathe 2s infinite;
		}
	}
}

@keyframes breathe {
	0% {
		transform: scale(1);
		opacity: 0.8;
	}
	100% {
		transform: scale(3);
		opacity: 0;
	}
}

.status-text {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.9);
	line-height: 1.2;
}

.navbar-right {
	padding-right: 16rpx;
	display: flex;
	align-items: center;
}

.nav-icons {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.nav-icon {
	padding: 8rpx;
}

.goods-card {
	display: flex;
	align-items: center;
	padding: 16rpx 20rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #f0f0f0;
	gap: 16rpx;
}

.goods-image {
	width: 120rpx;
	height: 120rpx;
	border-radius: 12rpx;
	background-color: #f5f5f5;
}

.goods-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.goods-title {
	font-size: 28rpx;
	color: #333;
	line-height: 1.4;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}

.goods-price {
	display: flex;
	align-items: baseline;
	gap: 12rpx;
}

.current-price {
	font-size: 32rpx;
	font-weight: 600;
	color: #FF6B35;
}

.original-price {
	font-size: 24rpx;
	color: #999;
	text-decoration: line-through;
}

.message-list {
		flex: 1;
		width: 100%;
		height: 0; /* 关键：确保 flex: 1 能正确压缩/拉伸 */
		background-color: #f5f5f5;
		overflow: hidden;
		
		.messages {
			padding: 30rpx 20rpx;
		}
	}

.message-item {
	display: flex;
	margin-bottom: 24rpx;
	
	&.message-right {
		flex-direction: row-reverse;
	}
}

.avatar-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin: 0 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.avatar-text {
	color: #fff;
	font-size: 32rpx;
	font-weight: 500;
}

.nickname-tag {
	background-color: #FF6B35;
	padding: 4rpx 12rpx;
	border-radius: 8rpx;
	
	text {
		font-size: 22rpx;
		color: #fff;
	}
}

.message-content {
	display: flex;
	flex-direction: column;
	max-width: 70%;
}

.message-time {
	text-align: center;
	margin-bottom: 16rpx;
	
	text {
		font-size: 22rpx;
		color: #999;
		background-color: rgba(0, 0, 0, 0.05);
		padding: 4rpx 16rpx;
		border-radius: 8rpx;
	}
}

.message-bubble {
	padding: 16rpx 24rpx;
	border-radius: 20rpx;
	position: relative;
	word-break: break-all;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	
	&.text {
		background-color: #fff;
		color: #333;
	}
	
	&.image {
		background-color: transparent;
		padding: 0;
	}
	
	&.video {
		background-color: transparent;
		padding: 0;
	}
	
	&.voice {
		background-color: #fff;
		min-width: 100rpx;
	}
}

.message-right .message-bubble {
	&.text {
		background-color: #FF6B35;
		color: #fff;
	}
}

.message-text {
	font-size: 30rpx;
	line-height: 1.6;
}

.message-image {
	max-width: 400rpx;
	max-height: 400rpx;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.message-video {
	position: relative;
	max-width: 400rpx;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.video-thumbnail {
	width: 100%;
	height: 100%;
	aspect-ratio: 16/9;
}

.play-icon {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 80rpx;
	height: 80rpx;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.video-duration {
	position: absolute;
	bottom: 8rpx;
	right: 8rpx;
	background-color: rgba(0, 0, 0, 0.6);
	color: #fff;
	font-size: 20rpx;
	padding: 2rpx 8rpx;
	border-radius: 4rpx;
}

.video-label {
	font-size: 24rpx;
	color: #666;
	margin-top: 8rpx;
	display: block;
}

.message-voice {
	display: flex;
	align-items: center;
	gap: 12rpx;
	min-width: 120rpx;
	padding: 16rpx 24rpx;
	border-radius: 20rpx;
}

.voice-wave {
	display: flex;
	align-items: flex-end;
	gap: 4rpx;
	
	.wave-item {
		width: 6rpx;
		height: 20rpx;
		background-color: #999;
		border-radius: 3rpx;
	}
	
	&.playing {
		.wave-item {
			background-color: #FF6B35;
			animation: wave 0.5s infinite ease-in-out;
			
			&:nth-child(1) {
				animation-delay: 0s;
			}
			
			&:nth-child(2) {
				animation-delay: 0.2s;
			}
			
			&:nth-child(3) {
				animation-delay: 0.4s;
			}
		}
	}
}

@keyframes wave {
	0%, 100% {
		height: 20rpx;
	}
	50% {
		height: 32rpx;
	}
}

.voice-duration {
	font-size: 24rpx;
	color: #666;
}

.message-right .message-voice {
	.voice-wave {
		.wave-item {
			background-color: rgba(255, 255, 255, 0.8);
		}
		
		&.playing {
			.wave-item {
				background-color: #fff;
			}
		}
	}
	
	.voice-duration {
		color: rgba(255, 255, 255, 0.8);
	}
}

.message-status {
	margin-top: 8rpx;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 8rpx;
}

.status-text {
	font-size: 22rpx;
	color: #999;
}

.typing-indicator {
	padding: 16rpx 24rpx;
	text {
		font-size: 24rpx;
		color: #999;
		font-style: italic;
	}
}

.input-area {
		background-color: #f8f8f8;
		border-top: 1rpx solid #eee;
		padding: 16rpx 20rpx;
		padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
		padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
		transition: bottom 0.2s, padding-bottom 0.2s;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;

		&.expanded {
			padding-bottom: 30rpx !important;
		}

	.input-toolbar {
		display: flex;
		align-items: flex-end;
		min-height: 88rpx;

		.tool-btn {
			width: 80rpx;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}

		.input-wrapper {
			flex: 1;
			background-color: #fff;
			border-radius: 40rpx;
			margin: 0 10rpx;
			padding: 18rpx 30rpx;
			min-height: 80rpx;
			display: flex;
			align-items: center;
			box-sizing: border-box;

			.textarea {
				width: 100%;
				font-size: 30rpx;
				line-height: 1.4;
				color: #333;
				max-height: 200rpx;
				/* 兼容性处理 */
				padding: 0;
				margin: 0;
			}
		}

		.send-btn {
			width: 80rpx;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;

			.send-icon {
				width: 64rpx;
				height: 64rpx;
				background-color: #FF6B35;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}
}

.emoji-panel {
	padding: 20rpx;
	border-top: 1rpx solid #f0f0f0;
	max-height: 300rpx;
}

.emoji-scroll {
	width: 100%;
}

.emoji-list {
	display: flex;
	flex-wrap: wrap;
}

.emoji-item {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	
	&:active {
		transform: scale(0.9);
	}
}

.emoji-text {
	font-size: 40rpx;
}

.more-tools-panel {
	padding: 20rpx;
	border-top: 1rpx solid #f0f0f0;
}

.tools-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 30rpx;
}

.tool-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 120rpx;
}

.tool-icon {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	background-color: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.95);
	}
}

.tool-label {
	font-size: 24rpx;
	color: #666;
}

.recording-tip {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: rgba(0, 0, 0, 0.8);
	border-radius: 24rpx;
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20rpx;
	z-index: 999;
}

.recording-icon {
	width: 120rpx;
	height: 120rpx;
	background-color: #ff4d4f;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: pulse 1s infinite;
}

.recording-text {
	font-size: 28rpx;
	color: #fff;
}

.recording-hint {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
}

@keyframes pulse {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
	100% {
		transform: scale(1);
	}
}

.recording-tip.cancel-mode {
	background-color: rgba(255, 77, 79, 0.9);
}

.recording-icon.cancel {
	background-color: #ff4d4f;
	animation: none;
}

.message-menu-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 998;
}

.message-menu {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding: 20rpx;
	z-index: 999;
	animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.menu-item {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 28rpx 24rpx;
	border-bottom: 1rpx solid #f0f0f0;
	
	&:last-child {
		border-bottom: none;
	}
}

.menu-text {
	font-size: 30rpx;
	color: #333;
}

.message-recall {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 12rpx 24rpx;
}

.recall-text {
	font-size: 24rpx;
	color: #999;
	background-color: rgba(0, 0, 0, 0.05);
	padding: 8rpx 20rpx;
	border-radius: 8rpx;
}
</style>
