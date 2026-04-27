<template>
  <view class="search-page">
    <view class="search-header">
      <u-search
        placeholder="搜索你想要的闲置好物..."
        v-model="keyword"
        shape="round"
        :bg-color="'#f5f5f5'"
        :input-align="'left'"
        :show-action="true"
        action-text="取消"
        @search="onSearch"
        @custom="onCancel"
        :focus="true"
      ></u-search>
    </view>

    <scroll-view scroll-y class="search-content" v-if="!showResult">
      <view class="history-section" v-if="historyList.length > 0">
        <view class="section-header">
          <text class="section-title">最近搜索</text>
          <u-icon name="trash" size="32" color="#999" @click="clearHistory"></u-icon>
        </view>
        <view class="history-tags">
          <view
            class="history-tag"
            v-for="(item, index) in historyList"
            :key="index"
            @click="searchKeyword(item)"
          >
            <text>{{ item }}</text>
          </view>
        </view>
      </view>

      <view class="hot-section">
        <view class="section-header">
          <text class="section-title">热门搜索</text>
        </view>
        <view class="hot-cards">
          <view
            class="hot-card"
            v-for="(item, index) in hotList"
            :key="index"
            @click="searchKeyword(item.keyword)"
          >
            <view class="card-image" :style="{ backgroundColor: item.bgColor }">
              <u-icon :name="item.icon" :color="item.iconColor" size="48"></u-icon>
            </view>
            <view class="card-info">
              <text class="card-title">{{ item.keyword }}</text>
              <text class="card-desc">{{ item.desc }}</text>
            </view>
            <view class="card-hot" v-if="item.isHot">
              <u-tag text="热门" type="warning" size="mini" mode="dark"></u-tag>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <scroll-view scroll-y class="search-result" v-else>
      <view class="result-header">
        <text class="result-text">找到 {{ resultList.length }} 个结果</text>
      </view>
      <view class="result-list">
        <view
          class="result-item"
          v-for="(item, index) in resultList"
          :key="index"
          @click="goDetail(item)"
        >
          <view class="result-image" :style="{ backgroundColor: item.bgColor }">
            <u-icon :name="item.icon" :color="item.iconColor" size="60"></u-icon>
          </view>
          <view class="result-info">
            <text class="result-title">{{ item.title }}</text>
            <text class="result-price">¥{{ item.price }}</text>
            <view class="result-meta">
              <text class="result-distance">{{ item.distance }}</text>
              <text class="result-time">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>
      <cp-nodata v-if="resultList.length === 0" mode="search" text="暂无相关商品"></cp-nodata>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      historyList: [],
      hotList: [
        { keyword: 'iPhone', desc: '超多数码好物', icon: 'phone-fill', bgColor: '#E3F2FD', iconColor: '#2196F3', isHot: true },
        { keyword: '沙发', desc: '家具类热销', icon: 'home-fill', bgColor: '#FFF3E0', iconColor: '#FF9800', isHot: true },
        { keyword: '书籍', desc: '二手教材资料', icon: 'file-text-fill', bgColor: '#E8F5E9', iconColor: '#4CAF50', isHot: false },
        { keyword: '自行车', desc: '出行代步首选', icon: 'car-fill', bgColor: '#FCE4EC', iconColor: '#E91E63', isHot: false },
        { keyword: '相机', desc: '摄影器材精选', icon: 'photo', bgColor: '#F3E5F5', iconColor: '#9C27B0', isHot: true },
        { keyword: '健身器材', desc: '运动健身必备', icon: 'play-circle-fill', bgColor: '#E0F7FA', iconColor: '#00BCD4', isHot: false }
      ],
      showResult: false,
      resultList: []
    }
  },
  onLoad(options) {
    this.loadHistory()
    if (options && options.keyword) {
      this.keyword = options.keyword
      this.saveHistory(options.keyword)
      this.searchGoods(options.keyword)
    }
  },
  methods: {
    loadHistory() {
      try {
        const history = uni.getStorageSync('searchHistory')
        if (history) {
          this.historyList = history
        }
      } catch (e) {
        console.log('读取搜索历史失败:', e)
      }
    },
    saveHistory(keyword) {
      if (!keyword || keyword.trim() === '') return
      
      const keywordTrim = keyword.trim()
      
      let history = this.historyList.filter(item => item !== keywordTrim)
      
      history.unshift(keywordTrim)
      
      if (history.length > 5) {
        history = history.slice(0, 5)
      }
      
      this.historyList = history
      
      try {
        uni.setStorageSync('searchHistory', history)
      } catch (e) {
        console.log('保存搜索历史失败:', e)
      }
    },
    clearHistory() {
      uni.showModal({
        title: '提示',
        content: '确定要清空搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            this.historyList = []
            try {
              uni.removeStorageSync('searchHistory')
            } catch (e) {
              console.log('清空搜索历史失败:', e)
            }
          }
        }
      })
    },
    onSearch(val) {
      if (!val || val.trim() === '') {
        this.$utils.toast('请输入搜索内容')
        return
      }
      
      this.saveHistory(val)
      this.searchGoods(val)
    },
    searchKeyword(keyword) {
      this.keyword = keyword
      this.saveHistory(keyword)
      this.searchGoods(keyword)
    },
    searchGoods(keyword) {
      this.showResult = true
      
      const allGoods = [
        { id: 1, bgColor: '#E8EAF6', icon: 'photo', iconColor: '#5C6BC0', title: 'iPhone 14 Pro 256G 暗夜紫 国行在保', price: '5,200', distance: '120m', time: '10分钟前' },
        { id: 2, bgColor: '#F3E5F5', icon: 'home-fill', iconColor: '#AB47BC', title: '宜家单人布艺沙发 几乎全新', price: '380', distance: '350m', time: '25分钟前' },
        { id: 3, bgColor: '#E0F2F1', icon: 'file-text-fill', iconColor: '#26A69A', title: '考研英语全套资料 真题+词汇书', price: '0', distance: '80m', time: '30分钟前' },
        { id: 4, bgColor: '#FFF3E0', icon: 'photo', iconColor: '#FF7043', title: 'MacBook Air M2 星光色', price: '8,200', distance: '500m', time: '1小时前' },
        { id: 5, bgColor: '#ECEFF1', icon: 'setting-fill', iconColor: '#78909C', title: '九阳破壁机 家用多功能', price: '199', distance: '200m', time: '2小时前' },
        { id: 6, bgColor: '#FBE9E7', icon: 'grid-fill', iconColor: '#FF8A65', title: '乐高积木 哈利波特系列', price: '450', distance: '1.2km', time: '3小时前' }
      ]
      
      this.resultList = allGoods.filter(item => 
        item.title.toLowerCase().includes(keyword.toLowerCase())
      )
    },
    onCancel() {
      uni.navigateBack()
    },
    goDetail(item) {
      this.$utils.route('/package/pages/index/detail', { id: item.id })
    }
  }
}
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.search-header {
  background-color: #fff;
  padding: 30rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.search-content {
  height: calc(100vh - 120rpx);
  padding: 20rpx;
}

.history-section,
.hot-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.history-tag {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  
  &:active {
    background-color: #e8e8e8;
  }
}

.hot-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.hot-card {
  width: calc(50% - 10rpx);
  background-color: #fafafa;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  position: relative;
  
  &:active {
    background-color: #f0f0f0;
  }
}

.card-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.card-desc {
  font-size: 22rpx;
  color: #999;
}

.card-hot {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
}

.search-result {
  height: calc(100vh - 120rpx);
  padding: 20rpx;
}

.result-header {
  padding: 16rpx 0;
}

.result-text {
  font-size: 24rpx;
  color: #999;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.result-item {
  display: flex;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  
  &:active {
    background-color: #fafafa;
  }
}

.result-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.result-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4d4f;
}

.result-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-distance,
.result-time {
  font-size: 22rpx;
  color: #999;
}
</style>