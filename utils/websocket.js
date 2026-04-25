class WebSocketManager {
  constructor() {
    this.socketTask = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.heartbeatInterval = 30000;
    this.heartbeatTimer = null;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.url = '';
    this.token = '';
  }

  init(url, token) {
    this.url = url;
    this.token = token;
    this.connect();
  }

  connect() {
    if (this.isConnected) {
      console.log('WebSocket已连接');
      return;
    }

    console.log('开始连接WebSocket...');
    
    this.socketTask = uni.connectSocket({
      url: this.url,
      header: {
        'token': this.token
      },
      success: () => {
        console.log('WebSocket连接请求发送成功');
      },
      fail: (error) => {
        console.error('WebSocket连接请求失败:', error);
        this.handleConnectionError(error);
      }
    });

    this.socketTask.onOpen(() => {
      console.log('WebSocket连接已打开');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.notifyConnectionSuccess();
    });

    this.socketTask.onMessage((res) => {
      console.log('收到WebSocket消息:', res);
      this.handleMessage(res.data);
    });

    this.socketTask.onClose((res) => {
      console.log('WebSocket连接已关闭:', res);
      this.isConnected = false;
      this.stopHeartbeat();
      this.handleConnectionClose(res);
    });

    this.socketTask.onError((error) => {
      console.error('WebSocket连接错误:', error);
      this.isConnected = false;
      this.handleConnectionError(error);
    });
  }

  send(message) {
    if (!this.isConnected) {
      console.error('WebSocket未连接，无法发送消息');
      return false;
    }

    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.socketTask.send({
      data: messageStr,
      success: () => {
        console.log('消息发送成功');
      },
      fail: (error) => {
        console.error('消息发送失败:', error);
      }
    });

    return true;
  }

  handleMessage(data) {
    let message;
    try {
      message = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      console.error('解析消息失败:', error);
      message = { type: 'text', content: data };
    }

    if (message.type === 'pong') {
      console.log('收到心跳响应');
      return;
    }

    this.notifyMessageReceived(message);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' });
        console.log('发送心跳包');
      }
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  handleConnectionClose(res) {
    this.notifyConnectionClose(res);
    this.attemptReconnect();
  }

  handleConnectionError(error) {
    this.notifyConnectionError(error);
    this.attemptReconnect();
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连');
      this.notifyReconnectFailed();
      return;
    }

    this.reconnectAttempts++;
    console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, this.reconnectInterval);
  }

  close() {
    if (this.socketTask) {
      this.socketTask.close();
    }
    this.stopHeartbeat();
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  offMessage(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  onConnection(handler) {
    this.connectionHandlers.push(handler);
  }

  offConnection(handler) {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
  }

  notifyMessageReceived(message) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('消息处理器执行错误:', error);
      }
    });
  }

  notifyConnectionSuccess() {
    this.connectionHandlers.forEach(handler => {
      try {
        handler({ type: 'connected' });
      } catch (error) {
        console.error('连接处理器执行错误:', error);
      }
    });
  }

  notifyConnectionClose(res) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler({ type: 'close', data: res });
      } catch (error) {
        console.error('连接关闭处理器执行错误:', error);
      }
    });
  }

  notifyConnectionError(error) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler({ type: 'error', data: error });
      } catch (error) {
        console.error('连接错误处理器执行错误:', error);
      }
    });
  }

  notifyReconnectFailed() {
    this.connectionHandlers.forEach(handler => {
      try {
        handler({ type: 'reconnectFailed' });
      } catch (error) {
        console.error('重连失败处理器执行错误:', error);
      }
    });
  }
}

const websocketManager = new WebSocketManager();

export default websocketManager;
