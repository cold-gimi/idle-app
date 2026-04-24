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
  },
  getters: {
    position: (state) => state.position,
    location: (state) => state.location,
    userInfo: (state) => state.userInfo,
    accessToken: (state) => state.accessToken
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
  },
  actions: {
		// 获取用户信息
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
    }
  }
})

export default store
