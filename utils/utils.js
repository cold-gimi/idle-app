import store from "./store";
import NAMEPATH from "./namepath"
const baseUrlTarget = 'http://localhost:3000'
const utils = {
  longLogin() {
    return new Promise((resolve, reject) => {
        wx.login({
          success: async res => {
            let { code } = res
            try {
              let loginRes = await utils.request({
                url: 'LOGIN',
                method: 'post',
                data: {
                  code,
                }
              })
              if (loginRes && loginRes.data) {
                store.commit('setUserInfo', loginRes.data)
                store.commit('setAccessToken', loginRes.data.sessionCacheKey)
                resolve(loginRes.data)
              } else {
                reject(new Error)
              }
            } catch (error) {
              reject(error)
            }
          }
        })
    })
  },
  loginPromise: null,
  loginFlage: true,
  login() {
    // 防止重复触发
    if (utils.loginFlage === false) {
      return utils.loginPromise
    }
    utils.loginFlage = false
    utils.loginPromise = new Promise(async (resolve, reject) => {
      utils.loginFlage = true
      try {
        let res = await utils.longLogin()
        resolve(res)
      } catch (error) {
        reject(error)
      }
    })
    return utils.loginPromise
  },
  navigate: function (options) {
    uni.navigateTo({
      url: options.url,
    });
  },
  navigateBack: function () {
    uni.navigateBack({
      fail: e=>{
        uni.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },
  toast(title = "未知错误信息") {
    title = title || "";
    if (title.length <= 20) {
      uni.showToast({
        title,
        icon: "none",
        mask: true,
      });
    } else {
      uni.showModal({
        content: title,
        showCancel: false,
      });
    }
  },
  showLoading(title = "数据加载中") {
    uni.showLoading({
      title,
      mask: true,
    })
  },
  hideLoading() {
    uni.hideLoading();
  },
  formatDate: function (time, step, format) {
    // time 时间戳
    time = time || new Date().getTime();
    step = step || 0;
    format = format || "yyyy-MM-dd";
    time = time + step * 24 * 60 * 60 * 1000;
    var date = new Date(time);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    if (format === "yyyy-MM-dd hh:mm:ss") {
      var hour = date.getHours();
      var minute = date.getMinutes();
      var second = date.getSeconds();
      hour = hour < 10 ? "0" + hour : hour;
      minute = minute < 10 ? "0" + minute : minute;
      second = second < 10 ? "0" + second : second;
      return (
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second
      );
    } else {
      return year + "-" + month + "-" + day;
    }
  },
  route(url, params, type = "navigateTo") {
    console.log(params);
    if (params) {
      const obj = [];
      for (let key in params) {
        if (typeof params[key] === "object") {
          params[key] = encodeURIComponent(JSON.stringify(params[key]));
        }
        // 如果包含http链接进行编码操作
        if (typeof params[key] === "string" && params[key].includes("http")) {
          params[key] = encodeURIComponent(params[key])
        }
        obj.push(key + '=' + params[key])
      }
      if (obj.length) {
        url += ('?' + obj.join('&'))
      }
      uni[type]({ url });
    } else {
      uni[type]({ url });
    }
  },
  setTitle(title) {
    uni.setNavigationBarTitle({
      title,
    });
  },
  upload: function (options) {
    // Mock 实现：直接返回本地路径作为上传后的 URL
    return new Promise((resolve) => {
      console.log('Mock 上传中...', options.filePath);
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            url: options.filePath // Mock 返回本地路径
          }
        });
      }, 1000);
    });
  },
  request: function (options) {
    var headers = {}
    for (var i in options.headers || {}) {
      headers[i] = options.headers[i]
    }
    if (!options.noToken) {
      // headers.Authorization = "Bearer " + store.state.accessToken
      headers.SessionCacheKey = store.state.accessToken
    }
    // 开始发送请求
    var method = options.method || options.type || "GET"
    var data = options.data || null
    var url = NAMEPATH[options.url] || options.url
    
    // 自动显示loading（除非明确指定不显示）
    const showLoading = options.showLoading !== false
    if (showLoading) {
      utils.showLoading(options.loadingText || "数据加载中")
    }
    
    return new Promise((resolve, reject) => {
      // 返回Promise, 支持async await写法
      // 同样支持链式调用
      uni.request({
        method,
        url: baseUrlTarget + url,
        header: headers,
        data,
        success: (result) => {
          console.log('result', result)
          if (showLoading) {
            utils.hideLoading()
          }
          
          // 网络请求成功，但需要检查业务状态
          if (result && result.data) {
            const res = result.data
            // 业务错误处理
            if (res.success === false || (res.code !== undefined && res.code !== 0 && res.code !== 200)) {
              // token过期处理
              if (res.data === -400 || res.code === 401) {
                utils.login({
                  success: async () => {
                    let res = await utils.request(options)
                    console.log('success_again')
                    resolve(res.data, res.header, res)
                  },
                })
                return
              }
              
              // 其他业务错误
              const errorMsg = res.message || res.msg || "请求失败，请稍后重试"
              uni.showToast({
                title: errorMsg,
                mask: true,
                icon: "none",
                position: "bottom",
              })
              reject(new Error(errorMsg))
              return
            }
          }
          
          // 检查HTTP状态码
          if (result.statusCode && result.statusCode !== 200 && result.statusCode !== 201) {
            const errorMsg = `请求失败，状态码：${result.statusCode}`
            uni.showToast({
              title: errorMsg,
              mask: true,
              icon: "none",
              position: "bottom",
            })
            reject(new Error(errorMsg))
            return
          }
          
          var successCallback = options.success || null;
          if (typeof successCallback === "function") {
            successCallback(result.data, result.header, result)
          }
          resolve(result.data, result.header, result)
        },
        fail: (error) => {
          console.error('请求失败:', error)
          if (showLoading) {
            utils.hideLoading()
          }
          
          // 网络错误处理
          let errorMsg = "网络请求失败，请检查网络连接"
          if (error.errMsg) {
            if (error.errMsg.includes('timeout')) {
              errorMsg = "请求超时，请稍后再试"
            } else if (error.errMsg.includes('fail')) {
              errorMsg = "网络连接失败，请检查网络"
            }
          }
          
          uni.showToast({
            title: errorMsg,
            mask: true,
            icon: "none",
            position: "bottom",
          })
          
          var errorCallback = options.fail || null;
          if (typeof errorCallback === "function") {
            errorCallback(error)
          }
          reject(new Error(errorMsg))
        },
      })
    })
  },
  showModal(option = {}) {
    const {
      title = "title",
      content = "content",
      showCancel = true,
      cancelText = "取消",
      confirmText = "确定",
    } = option;
    return new Promise((resolve, reject) => {
      // uni的showModal 默认形式为：title 和 content 为空字符串，同时展示取消和确定按钮
      uni.showModal({
        title,
        content,
        showCancel,
        cancelText,
        confirmText,
        confirmColor: "#7468D7",

        success: (res) => {
          if (res.confirm) {
            resolve();
          } else {
            reject();
          }
        },
      });
    });
  },
  //返回本地时间
  getTime: function (date) {
      let t;
      let s;
      if (date && Number(date)) {
          date = Number(date);
      }
      if (date) {
          t = new Date(date);
          let getMonth = t.getMonth() + 1;
          let getDate = t.getDate();
          let getHours = t.getHours();
          let getMinutes = t.getMinutes();
          let getSeconds = t.getSeconds();
          s = t.getFullYear() + '-' + (getMonth > 9 ? getMonth : '0' + getMonth) + '-' + (getDate > 9 ? getDate : '0' + getDate) + ' ' + (getHours > 9 ? getHours : '0' + getHours) + ':' + (getMinutes > 9 ? getMinutes : '0' + getMinutes) + ':' + (getSeconds > 9 ? getSeconds : '0' + getSeconds);
          return s;
      } else {
          return '';
      }
  },
  //返回本地日期
  getDate: function (date) {
      let t;
      let s;
      if (date && Number(date)) {
          date = Number(date);
      }
      if (date) {
          t = new Date(date);
          let getMonth = t.getMonth() + 1;
          let getDate = t.getDate();
          s = t.getFullYear() + '-' + (getMonth > 9 ? getMonth : '0' + getMonth) + '-' + (getDate > 9 ? getDate : '0' + getDate);
          return s;
      } else {
          return '';
      }
  },
  validateBidPrice: function(price, currentPrice, increment = 1) {
    if (!price || isNaN(price)) {
      return false
    }
    const bidPrice = Number(price)
    const currPrice = Number(currentPrice)
    const inc = Number(increment)
    if (bidPrice <= currPrice) {
      return false
    }
    const minBid = currPrice + inc
    if (bidPrice < minBid) {
      return false
    }
    if (bidPrice > 99999999) {
      return false
    }
    return true
  },
  calculateMinBid: function(currentPrice, increment = 1) {
    return Number(currentPrice) + Number(increment)
  },
  formatCountdown: function(seconds) {
    if (!seconds || seconds <= 0) {
      return '00:00:00'
    }
    const sec = parseInt(seconds)
    const hours = Math.floor(sec / 3600)
    const minutes = Math.floor((sec % 3600) / 60)
    const secs = sec % 60
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':')
  },
  formatCountdownDetail: function(seconds) {
    if (!seconds || seconds <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      }
    }
    const sec = parseInt(seconds)
    const days = Math.floor(sec / 86400)
    const hours = Math.floor((sec % 86400) / 3600)
    const minutes = Math.floor((sec % 3600) / 60)
    const secs = sec % 60
    return {
      days,
      hours,
      minutes,
      seconds: secs
    }
  },
  getAuctionStatusText: function(status, remainingTime) {
    if (status === 'ended' || remainingTime <= 0) {
      return '已结束'
    }
    if (status === 'active') {
      return '拍卖中'
    }
    if (status === 'pending') {
      return '即将开始'
    }
    return '未知状态'
  },
  getAuctionStatusType: function(status, remainingTime) {
    if (status === 'ended' || remainingTime <= 0) {
      return 'info'
    }
    if (status === 'active') {
      return 'error'
    }
    if (status === 'pending') {
      return 'warning'
    }
    return 'info'
  },
  formatPrice: function(price) {
    if (price === null || price === undefined) {
      return '0.00'
    }
    const num = Number(price)
    return num.toFixed(2)
  },
  formatPriceWithComma: function(price) {
    if (price === null || price === undefined) {
      return '0.00'
    }
    const num = Number(price)
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  },
  validateAuctionEndTime: function(endTime, currentTime = Date.now()) {
    const end = Number(endTime)
    const curr = Number(currentTime)
    return end > curr
  },
  getRemainingTime: function(endTime, currentTime = Date.now()) {
    const end = Number(endTime)
    const curr = Number(currentTime)
    const remaining = Math.floor((end - curr) / 1000)
    return remaining > 0 ? remaining : 0
  },
  sortBidHistory: function(bidHistory, order = 'desc') {
    const history = [...bidHistory]
    return history.sort((a, b) => {
      const timeA = Number(a.createTime) || 0
      const timeB = Number(b.createTime) || 0
      if (order === 'desc') {
        return timeB - timeA
      }
      return timeA - timeB
    })
  },
  filterMyBids: function(bidHistory, userId) {
    return bidHistory.filter(bid => bid.userId === userId)
  },
  getHighestBid: function(bidHistory) {
    if (!bidHistory || bidHistory.length === 0) {
      return null
    }
    const successBids = bidHistory.filter(bid => bid.status === 'success')
    if (successBids.length === 0) {
      return null
    }
    return successBids.reduce((max, bid) => {
      return Number(bid.price) > Number(max.price) ? bid : max
    })
  },
  isUserHighestBidder: function(bidHistory, userId) {
    const highestBid = this.getHighestBid(bidHistory)
    if (!highestBid) {
      return false
    }
    return highestBid.userId === userId
  },
  formatBidMessage: function(bid, isSelf = false) {
    if (isSelf) {
      return `您出价了 ${this.formatPriceWithComma(bid.price)} 元`
    }
    return `${bid.username || '用户'} 出价了 ${this.formatPriceWithComma(bid.price)} 元`
  },
  getTimeAgo: function(timestamp) {
    const now = Date.now()
    const time = Number(timestamp)
    const diff = now - time
    if (diff < 0) {
      return '刚刚'
    }
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) {
      return '刚刚'
    }
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}分钟前`
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours}小时前`
    }
    const days = Math.floor(hours / 24)
    if (days < 30) {
      return `${days}天前`
    }
    const months = Math.floor(days / 30)
    if (months < 12) {
      return `${months}个月前`
    }
    const years = Math.floor(months / 12)
    return `${years}年前`
  },
  
  // 商品数据配置常量
  GOODS_CONFIG: {
    colors: ['#E8EAF6', '#F3E5F5', '#E0F2F1', '#FFF3E0', '#ECEFF1', '#FBE9E7'],
    iconColors: ['#5C6BC0', '#AB47BC', '#26A69A', '#FF7043', '#78909C', '#FF8A65'],
    avatarColors: ['#7468D7', '#ff6b9d', '#54a0ff', '#FF6B35'],
    icons: ['photo', 'home-fill', 'file-text-fill', 'grid-fill', 'setting-fill', 'heart-fill'],
    distances: ['50m', '120m', '200m', '350m', '500m', '800m', '1.2km', '2km']
  },
  
  // 格式化单个商品数据
  formatGoodsItem: function(item) {
    const config = this.GOODS_CONFIG
    const randomIndex = (item.id || 0) % 6
    const randomAvatarIndex = (item.id || 0) % 4
    
    return {
      id: item.id,
      title: item.title || item.name || '商品',
      price: item.price !== undefined ? this.formatPriceWithComma(item.price) : '0',
      bgColor: config.colors[randomIndex],
      icon: config.icons[randomIndex],
      iconColor: config.iconColors[randomIndex],
      iconSize: 80,
      imgHeight: 300 + Math.random() * 80,
      tag: item.status === 'urgent' ? '急出' : (item.isNew ? '全新' : ''),
      distance: item.distance || config.distances[Math.floor(Math.random() * config.distances.length)],
      time: this.getTimeAgo(item.createTime || Date.now()),
      avatarColor: config.avatarColors[randomAvatarIndex],
      image: item.image || item.coverImage || '',
      category: item.category || '',
      location: item.location || ''
    }
  },
  
  // 格式化商品列表数据（统一封装处理）
  formatGoodsList: function(response) {
    if (!response) {
      return {
        list: [],
        total: 0,
        hasMore: false
      }
    }
    
    const data = response.data || response
    const rawList = data.list || data || []
    const total = data.total || rawList.length
    
    const formattedList = rawList.map(item => this.formatGoodsItem(item))
    
    return {
      list: formattedList,
      total: total,
      hasMore: formattedList.length < total
    }
  },
  
  // 获取分页请求参数（统一封装）
  getPaginationParams: function(page = 1, pageSize = 10, extraParams = {}) {
    return {
      page: page,
      pageSize: pageSize,
      ...extraParams
    }
  }
};

export default utils;
