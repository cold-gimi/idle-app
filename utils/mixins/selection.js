export default {
	data() {
		return {
			isEditMode: false,
			selectedIds: [],
			showDeleteModal: false,
			deleteModalContent: '',
			pendingDeleteItems: []
		};
	},
	computed: {
		isAllSelected() {
			return this.selectedIds.length === this.itemList.length && this.itemList.length > 0;
		},
		selectedCount() {
			return this.selectedIds.length;
		}
	},
	methods: {
		toggleEditMode() {
			this.isEditMode = !this.isEditMode;
			if (!this.isEditMode) {
				this.selectedIds = [];
			}
		},
		toggleSelectAll() {
			if (this.isAllSelected) {
				this.selectedIds = [];
			} else {
				this.selectedIds = this.itemList.map(item => item.id);
			}
		},
		toggleSelect(item) {
			const index = this.selectedIds.indexOf(item.id);
			if (index > -1) {
				this.selectedIds.splice(index, 1);
			} else {
				this.selectedIds.push(item.id);
			}
		},
		isSelected(item) {
			return this.selectedIds.includes(item.id);
		},
		prepareBatchDelete() {
			if (this.selectedIds.length === 0) {
				this.$utils.toast('请先选择要删除的商品');
				return;
			}
			const indices = [];
			this.selectedIds.forEach(id => {
				const index = this.itemList.findIndex(item => item.id === id);
				if (index > -1) {
					indices.push(index);
				}
			});
			this.pendingDeleteItems = indices.sort((a, b) => b - a);
			this.deleteModalContent = `确定要删除选中的 ${this.selectedIds.length} 件商品吗？`;
			this.showDeleteModal = true;
		},
		prepareSingleDelete(item) {
			const index = this.itemList.findIndex(i => i.id === item.id);
			if (index > -1) {
				this.pendingDeleteItems = [index];
				this.deleteModalContent = `确定要删除"${item.title}"吗？`;
				this.showDeleteModal = true;
			}
		},
		clearSelection() {
			this.selectedIds = [];
			if (this.itemList.length === 0) {
				this.isEditMode = false;
			}
		}
	}
};
