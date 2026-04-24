<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "@/uni_modules/uview-ui/index.scss";
	page {
		background-color: #F8F8F8;
		color: #666;
	}
	
	/* 隐藏scoll-view的滚动条 */
	::-webkit-scrollbar {
	 display: none;
	}
	[type="search"]::-webkit-search-decoration {  
	  display: none;  
	}
	.ellipsis {
	  overflow: hidden;
	  white-space: nowrap;
	  text-overflow: ellipsis;
	}
</style>
