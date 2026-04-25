<template>
	<view class="chat-page">
		<!-- 聊天消息列表 -->
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
					<!-- 头像 -->
					<view class="avatar" :style="{ background: message.avatarBg || '#FF6B35' }">
						<text class="avatar-text">{{ message.nickname ? message.nickname.charAt(0) : '?' }}</text>
					</view>
					
					<!-- 消息内容 -->
					<view class="message-content">
						<view class="message-time" v-if="showTime(index)">
							<text>{{ formatTime(message.time) }}</text>
						</view>
						
						<view class="message-bubble" :class="message.type">
							<!-- 文本消息 -->
							<template v-if="message.type === 'text'">
								<text class="message-text">{{ message.content }}</text>
							</template>
							
							<!-- 图片消息 -->
							<template v-else-if="message.type === 'image'">
								<image 
									class="message-image" 
									:src="message.content" 
									mode="aspectFit"
									@click="previewImage(message.content)"
								></image>
							</template>
							
							<!-- 视频消息 -->
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
							</template>
							
							<!-- 语音消息 -->
							<template v-else-if="message.type === 'voice'">
								<view class="message-voice" @click="toggleVoicePlay(message)">
									<view class="voice-wave" :class="{ 'playing': message.isPlaying }">
										<view class="wave-item" v-for="i in 3" :key="i"></view>
									</view>
									<text class="voice-duration">{{ message.duration || '0"' }}</text>
								</view>
							</template>
							
							<!-- 撤回消息 -->
							<template v-else-if="message.type === 'recall'">
								<view class="message-recall">
									<text class="recall-text">{{ message.content }}</text>
								</view>
							</template>
						</view>
						
						<!-- 消息状态 -->
						<view class="message-status" v-if="message.isSelf">
							<u-icon v-if="message.status === 'sending'" name="loading" color="#999" size="24"></u-icon>
							<u-icon v-else-if="message.status === 'failed'" name="info-circle" color="#ff4d4f" size="24"></u-icon>
							<u-icon v-else-if="message.status === 'sent'" name="checkmark" color="#52c41a" size="24"></u-icon>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 正在输入提示 -->
			<view class="typing-indicator" v-if="isTyping">
				<text>商家正在输入...</text>
			</view>
		</scroll-view>
		
		<!-- 底部输入区域 -->
		<view class="input-area" :class="{ 'expanded': showMoreTools }">
			<!-- 表情和更多按钮 -->
			<view class="input-toolbar">
				<view class="tool-btn" @click="toggleEmoji">
					<u-icon :name="showEmoji ? 'keyboard' : 'face'" color="#666" size="48"></u-icon>
				</view>
				
				<view class="input-wrapper">
					<textarea 
						v-model="inputText"
						class="chat-input"
						placeholder="输入消息..."
						:maxlength="500"
						:adjust-position="false"
						@focus="onInputFocus"
						@blur="onInputBlur"
					></textarea>
				</view>
				
				<view class="tool-btn" v-if="!inputText" @click="toggleMoreTools">
					<u-icon :name="showMoreTools ? 'keyboard' : 'plus'" color="#666" size="48"></u-icon>
				</view>
				
				<view class="send-btn" v-if="inputText" @click="sendTextMessage">
					<u-button type="primary" size="mini">发送</u-button>
				</view>
			</view>
			
			<!-- 表情面板 -->
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
			
			<!-- 更多工具面板 -->
			<view class="more-tools-panel" v-if="showMoreTools">
				<view class="tools-grid">
					<view class="tool-item" @click="chooseImage">
						<view class="tool-icon">
							<u-icon name="photo" color="#FF6B35" size="48"></u-icon>
						</view>
						<text class="tool-label">图片</text>
					</view>
					
					<view class="tool-item" @click="chooseVideo">
						<view class="tool-icon">
							<u-icon name="video" color="#1890FF" size="48"></u-icon>
						</view>
						<text class="tool-label">视频</text>
					</view>
					
					<view class="tool-item">
						<view 
							class="tool-icon voice-btn" 
							:class="{ 'recording': isRecording, 'cancel-area': isInCancelArea }"
							@touchstart="onVoiceTouchStart"
							@touchmove="onVoiceTouchMove"
							@touchend="onVoiceTouchEnd"
							@touchcancel="onVoiceTouchEnd"
						>
							<u-icon name="mic" :color="isRecording ? '#ff4d4f' : '#52c41a'" size="48"></u-icon>
						</view>
						<text class="tool-label">{{ isRecording ? '松开结束' : '按住录音' }}</text>
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
		
		<!-- 录音提示 -->
		<view class="recording-tip" v-if="isRecording" :class="{ 'cancel-mode': isInCancelArea }">
			<view class="recording-icon" :class="{ 'cancel': isInCancelArea }">
				<u-icon :name="isInCancelArea ? 'minus-circle' : 'mic'" color="#fff" size="60"></u-icon>
			</view>
			<text class="recording-text">{{ isInCancelArea ? '松开手指取消' : `正在录音... ${recordingTime}s` }}</text>
			<text class="recording-hint">{{ isInCancelArea ? '向下滑动继续录音' : '上滑取消录音' }}</text>
		</view>
		
		<!-- 消息操作菜单 -->
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
	</view>
</template>

<script>
import websocketManager from '@/utils/websocket.js';

export default {
	data() {
		return {
			// 聊天信息
			sessionId: '',
			shopId: '',
			shopName: '',
			userId: '',
			userName: '',
			avatarBg: '#FF6B35',
			
			// 消息列表
			messages: [],
			
			// 输入相关
			inputText: '',
			showEmoji: false,
			showMoreTools: false,
			
			// 录音相关
			isRecording: false,
			recordingTime: 0,
			recordingTimer: null,
			voiceFilePath: '',
			
			// 状态
			isTyping: false,
			scrollToView: '',
			
			// 表情列表
			emojiList: ['😀', '😂', '😊', '🥰', '😎', '🤔', '😘', '👍', '👎', '👏', '🙏', '💪', '❤️', '🔥', '🎉', '👍', '😍', '🤣', '😊', '🙂', '😉', '😇', '🥳', '😎', '🤩', '😋', '🤗', '🤔', '🤐', '🤫', '🤭', '🤫', '😏', '😒', '🙄', '😮', '😯', '😲', '😳', '🥺', '😢', '😭', '😤', '😡', '🤬', '😈', '👿', '💀', '☠️', '👻', '👽', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💅', '🤝', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸', '💓', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳', '💣', '💬', '🗨', '🗯', '💭', '💤', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '💅', '🤝', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸', '💓', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💯', '💢', '💥', '💫', '💦', '💨', '🕳', '💣', '💬', '🗨', '🗯', '💭', '💤'],
			
			// 消息菜单
			showMessageMenu: false,
			selectedMessage: null,
			selectedMessageIndex: -1,
			
			// 撤回时间限制（2分钟）
			recallTimeLimit: 120000,
			
			// 语音录制相关
			isInCancelArea: false,
			voiceStartY: 0
		};
	},
	onLoad(options) {
		// 从参数中获取会话信息
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
		
		// 设置页面标题
		uni.setNavigationBarTitle({
			title: this.shopName || '商家'
		});
		
		// 初始化WebSocket连接
		this.initWebSocket();
		
		// 加载历史消息
		this.loadHistoryMessages();
		
		// 监听消息
		this.listenMessages();
	},
	onUnload() {
		// 页面卸载时清理
		this.cleanup();
	},
	methods: {
		// 初始化WebSocket连接
		initWebSocket() {
			// 这里需要替换为实际的WebSocket服务器地址和用户token
			const wsUrl = 'ws://localhost:8080/ws'; // 示例地址
			const token = uni.getStorageSync('token') || 'demo_token';
			
			// 连接WebSocket
			websocketManager.init(wsUrl, token);
			
			// 监听连接状态
			websocketManager.onConnection((event) => {
				console.log('WebSocket连接状态:', event);
				if (event.type === 'connected') {
					// 连接成功后加入会话
					this.joinSession();
				}
			});
		},
		
		// 加入会话
		joinSession() {
			const joinMessage = {
				type: 'join',
				sessionId: this.sessionId,
				userId: this.userId || 'demo_user',
				shopId: this.shopId
			};
			websocketManager.send(joinMessage);
		},
		
		// 加载历史消息
		loadHistoryMessages() {
			// 模拟历史消息
			this.messages = [
				{
					id: 1,
					type: 'text',
					content: '您好，欢迎咨询！请问有什么可以帮您的？',
					time: Date.now() - 3600000,
					isSelf: false,
					nickname: '商家',
					avatarBg: '#1890FF',
					status: 'sent'
				},
				{
					id: 2,
					type: 'text',
					content: '你好，我想了解一下这个商品的详情',
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
					nickname: '商家',
					avatarBg: '#1890FF',
					status: 'sent'
				},
				{
					id: 4,
					type: 'text',
					content: '这是商品的实物图，您可以参考一下',
					time: Date.now() - 3300000,
					isSelf: false,
					nickname: '商家',
					avatarBg: '#1890FF',
					status: 'sent'
				}
			];
			
			// 滚动到底部
			this.scrollToBottom();
		},
		
		// 监听消息
		listenMessages() {
			websocketManager.onMessage((message) => {
				console.log('收到消息:', message);
				this.handleReceivedMessage(message);
			});
		},
		
		// 处理收到的消息
		handleReceivedMessage(message) {
			// 根据消息类型处理
			switch (message.type) {
				case 'text':
				case 'image':
				case 'video':
				case 'voice':
					// 添加到消息列表
					this.messages.push({
						...message,
						isSelf: false,
						time: Date.now(),
						status: 'sent'
					});
					this.scrollToBottom();
					break;
				case 'typing':
					// 正在输入提示
					this.isTyping = true;
					setTimeout(() => {
						this.isTyping = false;
					}, 3000);
					break;
				// 其他消息类型...
			}
		},
		
		// 发送文本消息
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
			
			// 添加到消息列表
			this.messages.push(message);
			this.inputText = '';
			this.scrollToBottom();
			
			// 通过WebSocket发送消息
			const sendMessage = {
				type: 'text',
				sessionId: this.sessionId,
				content: message.content,
				timestamp: message.time
			};
			
			if (websocketManager.isConnected) {
				websocketManager.send(sendMessage);
				// 更新消息状态
				this.updateMessageStatus(message.id, 'sent');
			} else {
				// 连接失败，更新状态为失败
				this.updateMessageStatus(message.id, 'failed');
				this.$utils.toast('消息发送失败，请检查网络连接');
			}
		},
		
		// 更新消息状态
		updateMessageStatus(messageId, status) {
			const message = this.messages.find(m => m.id === messageId);
			if (message) {
				message.status = status;
			}
		},
		
		// 选择图片
		chooseImage() {
			uni.chooseImage({
				count: 9,
				sizeType: ['original', 'compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePaths = res.tempFilePaths;
					tempFilePaths.forEach((filePath, index) => {
						this.sendImageMessage(filePath, index);
					});
				}
			});
		},
		
		// 发送图片消息
		sendImageMessage(filePath, index) {
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
			
			// 模拟上传和发送成功
			setTimeout(() => {
				this.updateMessageStatus(message.id, 'sent');
			}, 1000);
		},
		
		// 预览图片
		previewImage(currentUrl) {
			const urls = this.messages
				.filter(m => m.type === 'image')
				.map(m => m.content);
			
			uni.previewImage({
				current: currentUrl,
				urls: urls
			});
		},
		
		// 选择视频
		chooseVideo() {
			uni.chooseVideo({
				sourceType: ['album', 'camera'],
				maxDuration: 60,
				camera: 'back',
				success: (res) => {
					this.sendVideoMessage(res);
				}
			});
		},
		
		// 发送视频消息
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
			
			// 模拟上传和发送成功
			setTimeout(() => {
				this.updateMessageStatus(message.id, 'sent');
			}, 2000);
		},
		
		// 播放视频
		playVideo(videoPath) {
			uni.previewVideo({
				url: videoPath,
				fail: (error) => {
					console.error('视频预览失败:', error);
					// 如果previewVideo失败，尝试使用其他方式
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
		
		// 语音触摸开始
		onVoiceTouchStart(e) {
			this.voiceStartY = e.touches[0].clientY;
			this.isInCancelArea = false;
			this.startRecording();
		},
		
		// 语音触摸移动
		onVoiceTouchMove(e) {
			if (!this.isRecording) return;
			
			const currentY = e.touches[0].clientY;
			const moveDistance = this.voiceStartY - currentY;
			
			// 上滑超过100px进入取消区域
			this.isInCancelArea = moveDistance > 100;
		},
		
		// 语音触摸结束
		onVoiceTouchEnd() {
			if (!this.isRecording) return;
			
			if (this.isInCancelArea) {
				// 取消录音
				this.cancelRecording();
			} else {
				// 完成录音
				this.stopRecording();
			}
			
			this.isInCancelArea = false;
		},
		
		// 开始录音
		startRecording() {
			this.isRecording = true;
			this.recordingTime = 0;
			
			// 开始计时
			this.recordingTimer = setInterval(() => {
				this.recordingTime++;
				if (this.recordingTime >= 60) {
					this.stopRecording();
				}
			}, 1000);
			
			// 开始录音
			uni.startRecord({
				success: (res) => {
					this.voiceFilePath = res.tempFilePath;
				},
				fail: (error) => {
					console.error('录音失败:', error);
					this.isRecording = false;
					if (this.recordingTimer) {
						clearInterval(this.recordingTimer);
					}
					this.$utils.toast('录音失败，请检查权限');
				}
			});
		},
		
		// 停止录音
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
			
			// 发送语音消息
			this.sendVoiceMessage();
		},
		
		// 取消录音
		cancelRecording() {
			this.isRecording = false;
			
			if (this.recordingTimer) {
				clearInterval(this.recordingTimer);
				this.recordingTimer = null;
			}
			
			uni.stopRecord();
			this.$utils.toast('已取消录音');
		},
		
		// 发送语音消息
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
			
			// 模拟发送成功
			setTimeout(() => {
				this.updateMessageStatus(message.id, 'sent');
			}, 500);
		},
		
		// 切换语音播放
		toggleVoicePlay(message) {
			// 停止所有其他播放
			this.messages.forEach(m => {
				if (m.id !== message.id) {
					m.isPlaying = false;
				}
			});
			
			if (message.isPlaying) {
				// 停止播放
				uni.stopVoice();
				message.isPlaying = false;
			} else {
				// 开始播放
				message.isPlaying = true;
				uni.playVoice({
					filePath: message.content,
					complete: () => {
						message.isPlaying = false;
					}
				});
				
				// 自动停止
				setTimeout(() => {
					if (message.isPlaying) {
						uni.stopVoice();
						message.isPlaying = false;
					}
				}, message.durationSeconds * 1000 + 500);
			}
		},
		
		// 选择位置
		chooseLocation() {
			uni.chooseLocation({
				success: (res) => {
					console.log('选择位置:', res);
					// 这里可以实现发送位置消息的功能
					this.$utils.toast('位置选择功能开发中');
				}
			});
		},
		
		// 切换表情面板
		toggleEmoji() {
			this.showEmoji = !this.showEmoji;
			this.showMoreTools = false;
		},
		
		// 切换更多工具面板
		toggleMoreTools() {
			this.showMoreTools = !this.showMoreTools;
			this.showEmoji = false;
		},
		
		// 插入表情
		insertEmoji(emoji) {
			this.inputText += emoji;
		},
		
		// 输入框获得焦点
		onInputFocus() {
			this.showEmoji = false;
			this.showMoreTools = false;
			setTimeout(() => {
				this.scrollToBottom();
			}, 300);
		},
		
		// 输入框失去焦点
		onInputBlur() {
			// 可以在这里处理失去焦点的逻辑
		},
		
		// 滚动到底部
		scrollToBottom() {
			this.$nextTick(() => {
				if (this.messages.length > 0) {
					this.scrollToView = `msg-${this.messages.length - 1}`;
				}
			});
		},
		
		// 格式化时间
		formatTime(timestamp) {
			const date = new Date(timestamp);
			const hours = date.getHours().toString().padStart(2, '0');
			const minutes = date.getMinutes().toString().padStart(2, '0');
			return `${hours}:${minutes}`;
		},
		
		// 格式化时长
		formatDuration(seconds) {
			const mins = Math.floor(seconds / 60);
			const secs = Math.floor(seconds % 60);
			return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		},
		
		// 是否显示时间
		showTime(index) {
			if (index === 0) return true;
			const currentTime = this.messages[index].time;
			const prevTime = this.messages[index - 1].time;
			// 间隔超过5分钟显示时间
			return currentTime - prevTime > 300000;
		},
		
		// 清理资源
		cleanup() {
			if (this.recordingTimer) {
				clearInterval(this.recordingTimer);
			}
			uni.stopRecord();
			uni.stopVoice();
			// 可以选择是否关闭WebSocket连接
			// websocketManager.close();
		},
		
		// 显示消息菜单
		showMessageMenu(message, index) {
			this.selectedMessage = message;
			this.selectedMessageIndex = index;
			this.showMessageMenu = true;
		},
		
		// 隐藏消息菜单
		hideMessageMenu() {
			this.showMessageMenu = false;
			this.selectedMessage = null;
			this.selectedMessageIndex = -1;
		},
		
		// 检查是否可以撤回
		canRecall(message) {
			if (!message || !message.isSelf || message.type === 'recall') {
				return false;
			}
			const now = Date.now();
			const messageTime = message.time;
			return (now - messageTime) <= this.recallTimeLimit;
		},
		
		// 撤回消息
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
		
		// 复制消息
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
		
		// 删除消息
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
	background-color: #f5f5f5;
}

.message-list {
	flex: 1;
	overflow: hidden;
}

.messages {
	padding: 20rpx;
}

.message-item {
	display: flex;
	margin-bottom: 30rpx;
	
	&.message-right {
		flex-direction: row-reverse;
	}
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin: 0 16rpx;
}

.avatar-text {
	color: #fff;
	font-size: 32rpx;
	font-weight: 500;
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
	border-radius: 16rpx;
	position: relative;
	word-break: break-all;
	
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
	border-radius: 16rpx;
}

.message-video {
	position: relative;
	max-width: 400rpx;
	border-radius: 16rpx;
	overflow: hidden;
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

.message-voice {
	display: flex;
	align-items: center;
	gap: 12rpx;
	min-width: 120rpx;
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
}

.typing-indicator {
	padding: 16rpx 24rpx;
	text {
		font-size: 24rpx;
		color: #999;
	}
}

.input-area {
	background-color: #fff;
	border-top: 1rpx solid #f0f0f0;
	padding: 16rpx;
	
	&.expanded {
		padding-bottom: env(safe-area-inset-bottom);
	}
}

.input-toolbar {
	display: flex;
	align-items: flex-end;
	gap: 12rpx;
}

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
	background-color: #f5f5f5;
	border-radius: 40rpx;
	padding: 16rpx 24rpx;
	min-height: 80rpx;
	max-height: 200rpx;
}

.chat-input {
	width: 100%;
	min-height: 48rpx;
	max-height: 160rpx;
	font-size: 30rpx;
	line-height: 1.6;
	color: #333;
}

.send-btn {
	flex-shrink: 0;
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
	
	&.recording {
		background-color: #fff1f0;
		animation: pulse 1s infinite;
	}
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

// 取消模式样式
.recording-tip.cancel-mode {
	background-color: rgba(255, 77, 79, 0.9);
}

.recording-icon.cancel {
	background-color: #ff4d4f;
	animation: none;
}

// 消息菜单样式
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

// 撤回消息样式
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

// 美化整体UI
.chat-page {
	background-color: #f8f9fa;
}

.message-item {
	margin-bottom: 24rpx;
}

.avatar {
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.message-bubble {
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	
	&.text {
		background-color: #fff;
		border-radius: 20rpx;
	}
}

.message-right .message-bubble {
	&.text {
		background-color: #FF6B35;
		border-radius: 20rpx;
	}
}

.input-area {
	background-color: #fff;
	border-top: 1rpx solid #e8e8e8;
	box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.03);
}

.input-wrapper {
	background-color: #f5f7fa;
	border-radius: 30rpx;
}

.tool-icon {
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.95);
	}
}

// 语音按钮样式
.voice-btn {
	&.recording {
		background-color: #fff1f0;
		animation: pulse 1s infinite;
	}
	
	&.cancel-area {
		background-color: #ff4d4f;
		
		.u-icon {
			color: #fff !important;
		}
	}
}

.emoji-item {
	transition: all 0.2s ease;
	
	&:active {
		transform: scale(0.9);
	}
}

.message-image, .message-video {
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	border-radius: 20rpx;
	overflow: hidden;
}

.play-icon {
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

.message-voice {
	padding: 16rpx 24rpx;
	border-radius: 20rpx;
}

.typing-indicator {
	text {
		color: #999;
		font-style: italic;
	}
}

// 添加撤回状态指示
.can-recall {
	position: relative;
	
	&::after {
		content: '';
		position: absolute;
		top: -8rpx;
		right: -8rpx;
		width: 16rpx;
		height: 16rpx;
		background-color: #FF6B35;
		border-radius: 50%;
	}
}
</style>
