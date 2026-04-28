import Vue from 'vue'
import Vuex from 'vuex'
import utils from './utils'
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    userInfo: {},
    accessTokenTimes: 0,
    accessToken: uni.getStorageSync('accessToken'),
    appName: '闫万鹏',
    openid: '',
    auctionList: [],
    currentAuction: {},
    bidHistory: [],
    auctionMessages: [],
    countdownTimers: {},
    myBids: [],
    auctionStatus: {
      isActive: false,
      remainingTime: 0,
      currentPrice: 0,
      startPrice: 0,
      increment: 1,
      bidCount: 0,
      highestBidder: null
    }
  },
  getters: {
    position: (state) => state.position,
    location: (state) => state.location,
    userInfo: (state) => state.userInfo,
    accessToken: (state) => state.accessToken,
    auctionList: (state) => state.auctionList,
    currentAuction: (state) => state.currentAuction,
    bidHistory: (state) => state.bidHistory,
    auctionMessages: (state) => state.auctionMessages,
    auctionStatus: (state) => state.auctionStatus,
    myBids: (state) => state.myBids
  },
  mutations: {
    setUserInfo: function(state, userInfo) {
      uni.setStorageSync('userInfo', userInfo)
      state.userInfo = userInfo
    },
    setAccessToken: function(state, accessToken) {
      uni.setStorageSync('accessToken', accessToken)
      state.accessToken = accessToken
      state.accessTokenTimes = (new Date()).getTime()
    },
    setOpenId: function(state, openid) {
      state.openid = openid
    },
    setAuctionList: function(state, auctionList) {
      state.auctionList = auctionList
    },
    setCurrentAuction: function(state, auction) {
      state.currentAuction = auction
    },
    updateAuctionStatus: function(state, status) {
      state.auctionStatus = { ...state.auctionStatus, ...status }
    },
    addBidHistory: function(state, bid) {
      state.bidHistory.unshift(bid)
    },
    setBidHistory: function(state, history) {
      state.bidHistory = history
    },
    addAuctionMessage: function(state, message) {
      state.auctionMessages.unshift(message)
    },
    setAuctionMessages: function(state, messages) {
      state.auctionMessages = messages
    },
    addMyBid: function(state, bid) {
      state.myBids.unshift(bid)
    },
    setCountdownTimer: function(state, { auctionId, timerId }) {
      state.countdownTimers[auctionId] = timerId
    },
    clearCountdownTimer: function(state, auctionId) {
      if (state.countdownTimers[auctionId]) {
        clearInterval(state.countdownTimers[auctionId])
        delete state.countdownTimers[auctionId]
      }
    }
  },
  actions: {
		getUserInfo({ commit }) {
			commit('setUserInfo', uni.getStorageSync('userInfo'))
			return new Promise((resolve, reject)=> {
        utils.request({
          method: 'get',
          url: 'QUERYCURRENTUSERINFO'
        }).then(res=> {
          console.log('getUserInfo_then')
					commit('setUserInfo', res.data)
					resolve(res)
				}).catch(err=> {
          console.log('getUserInfo_catch')
					reject(err)
				})
			})
		},
    login({ state }) {
      return new Promise((resolve, reject) => {
        if (state.accessToken) {
          resolve()
          return
        }
        uni.navigateTo({
          url: '/package/pages/login/login',
          events: {
            onSuccess: () => {
              resolve()
            },
            onError: () => {
              reject()
            }
          }
        })
      })
    },
    getAuctionList({ commit, state }) {
      return new Promise((resolve, reject) => {
        utils.request({
          method: 'get',
          url: 'GET_AUCTION_LIST'
        }).then(res => {
          commit('setAuctionList', res.data)
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    getAuctionDetail({ commit, state }, auctionId) {
      return new Promise((resolve, reject) => {
        utils.showLoading('加载中...')
        utils.request({
          method: 'get',
          url: 'GET_AUCTION_DETAIL',
          data: { id: auctionId }
        }).then(res => {
          commit('setCurrentAuction', res.data)
          commit('updateAuctionStatus', {
            isActive: res.data.status === 'active',
            remainingTime: res.data.remainingTime,
            currentPrice: res.data.currentPrice,
            startPrice: res.data.startPrice,
            increment: res.data.increment || 1,
            bidCount: res.data.bidCount || 0,
            highestBidder: res.data.highestBidder
          })
          utils.hideLoading()
          resolve(res)
        }).catch(err => {
          utils.hideLoading()
          reject(err)
        })
      })
    },
    placeBid({ commit, state }, { auctionId, price, message }) {
      return new Promise((resolve, reject) => {
        if (!state.userInfo || !state.userInfo.id) {
          utils.toast('请先登录')
          reject(new Error('请先登录'))
          return
        }
        if (!utils.validateBidPrice(price, state.auctionStatus.currentPrice, state.auctionStatus.increment)) {
          utils.toast(`出价必须高于当前价格，且每次加价至少${state.auctionStatus.increment}元`)
          reject(new Error('出价无效'))
          return
        }
        utils.showLoading('出价中...')
        utils.request({
          method: 'post',
          url: 'PLACE_BID',
          data: {
            auctionId,
            price: Number(price),
            message
          }
        }).then(res => {
          const bid = {
            id: Date.now(),
            auctionId,
            price: Number(price),
            message,
            userId: state.userInfo.id,
            username: state.userInfo.nickname || state.userInfo.name,
            avatar: state.userInfo.avatar,
            createTime: new Date().getTime(),
            status: 'success'
          }
          commit('addBidHistory', bid)
          commit('addMyBid', bid)
          commit('updateAuctionStatus', {
            currentPrice: Number(price),
            bidCount: state.auctionStatus.bidCount + 1,
            highestBidder: {
              id: state.userInfo.id,
              name: state.userInfo.nickname || state.userInfo.name,
              avatar: state.userInfo.avatar
            }
          })
          const auctionMessage = {
            id: Date.now(),
            type: 'bid',
            title: '出价成功',
            content: `您已成功出价 ${price} 元`,
            auctionId,
            price: Number(price),
            createTime: new Date().getTime(),
            read: false
          }
          commit('addAuctionMessage', auctionMessage)
          utils.hideLoading()
          utils.toast('出价成功')
          resolve(res)
        }).catch(err => {
          utils.hideLoading()
          const failBid = {
            id: Date.now(),
            auctionId,
            price: Number(price),
            message,
            userId: state.userInfo.id,
            username: state.userInfo.nickname || state.userInfo.name,
            createTime: new Date().getTime(),
            status: 'fail',
            errorMsg: err.message
          }
          commit('addBidHistory', failBid)
          reject(err)
        })
      })
    },
    getBidHistory({ commit, state }, auctionId) {
      return new Promise((resolve, reject) => {
        utils.request({
          method: 'get',
          url: 'GET_BID_HISTORY',
          data: { auctionId }
        }).then(res => {
          commit('setBidHistory', res.data)
          resolve(res)
        }).catch(err => {
          reject(err)
        })
      })
    },
    startCountdown({ commit, state }, { auctionId, remainingTime }) {
      return new Promise((resolve) => {
        if (state.countdownTimers[auctionId]) {
          clearInterval(state.countdownTimers[auctionId])
        }
        let timeLeft = remainingTime
        const timerId = setInterval(() => {
          timeLeft--
          commit('updateAuctionStatus', {
            remainingTime: timeLeft
          })
          if (timeLeft <= 0) {
            clearInterval(timerId)
            commit('updateAuctionStatus', {
              isActive: false,
              remainingTime: 0
            })
            const endMessage = {
              id: Date.now(),
              type: 'auction_end',
              title: '拍卖结束',
              content: `商品「${state.currentAuction.title}」拍卖已结束`,
              auctionId,
              createTime: new Date().getTime(),
              read: false
            }
            commit('addAuctionMessage', endMessage)
            delete state.countdownTimers[auctionId]
            resolve({ ended: true })
          }
        }, 1000)
        commit('setCountdownTimer', { auctionId, timerId })
        resolve({ started: true, timerId })
      })
    },
    stopCountdown({ commit, state }, auctionId) {
      commit('clearCountdownTimer', auctionId)
    }
  }
})

export default store
