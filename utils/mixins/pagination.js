export default {
	data() {
		return {
			page: 1,
			pageSize: 10,
			total: 0,
			hasMore: true,
			isLoading: false,
			isRefreshing: false
		};
	},
	computed: {
		canLoadMore() {
			return this.hasMore && !this.isLoading;
		}
	},
	methods: {
		resetPagination() {
			this.page = 1;
			this.total = 0;
			this.hasMore = true;
			this.isLoading = false;
		},
		setPaginationResult(data) {
			const { list, total, page, pageSize } = data;
			if (page === 1) {
				this.itemList = list || [];
			} else {
				this.itemList = [...this.itemList, ...(list || [])];
			}
			this.total = total || 0;
			this.page = page;
			this.hasMore = this.itemList.length < this.total;
		},
		async refreshList() {
			if (this.isRefreshing || this.isLoading) {
				return;
			}
			this.isRefreshing = true;
			this.resetPagination();
			try {
				await this.fetchList();
			} finally {
				this.isRefreshing = false;
				uni.stopPullDownRefresh();
			}
		},
		async loadMoreList() {
			if (!this.hasMore || this.isLoading || this.isRefreshing) {
				return;
			}
			this.isLoading = true;
			this.page++;
			try {
				await this.fetchList();
			} catch (error) {
				this.page--;
				throw error;
			} finally {
				this.isLoading = false;
			}
		}
	}
};
