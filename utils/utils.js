import store from "./store";
import NAMEPATH from "./namepath"
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
          if (result && result.data) {
            const res = result.data
            if (res.success === false) {
              if (res.data === -400) {
                // token过期
                utils.login({
                  success: async () => {
                    let res = await utils.request(options)
                    console.log('success_again')
                    resolve(res.data, res.header, res)
                  },
                })
                return
              }
              uni.showToast({
                title: res.message,
                mask: true,
                icon: "none",
                position: "bottom",
              })
              reject(new Error(res.message))
              return
            }
          }
          var successCallback = options.success || null;
          if (typeof successCallback === "function") {
            successCallback(result.data, result.header, result)
          }
          resolve(result.data, result.header, result)
        },
        error: (error) => {
          console.error(error)
          uni.showToast({
            title: "请求超时，请稍后再试",
            mask: true,
            icon: "none",
            position: "bottom",
          })
          var errorCallback = options.fail || null;
          if (typeof errorCallback === "function") {
            errorCallback(error)
          }
          reject(error)
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
};

export default utils;
