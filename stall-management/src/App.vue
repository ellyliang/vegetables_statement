<template>
  <div id="app">
    <div class="page-header">
      <h2>商户管理</h2>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="addDialogVisible = true">
          <el-icon><Plus /></el-icon> 添加商户
        </el-button>
        <el-button type="primary" size="large" @click="exportStalls">
          <el-icon><Download /></el-icon> 导出商户
        </el-button>
        <el-button size="large" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="summary-section">
      <div class="summary-card">
        <div class="summary-icon blue">
          <el-icon><Shop /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">商户总数</div>
          <div class="summary-value">{{ stalls.length }} 家</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon green">
          <el-icon><Star /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">VIP客户</div>
          <div class="summary-value">{{ vipCount }} 家</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon orange">
          <el-icon><User /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">本月新增</div>
          <div class="summary-value">{{ newCount }} 家</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>商户列表</h3>
        <div class="card-header-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商户名称或联系人"
            class="search-input"
            size="large"
            clearable
          ></el-input>
          <el-button size="large" @click="search" type="primary">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
        </div>
      </div>

      <!-- 移动端卡片视图 -->
      <div class="mobile-card-list" v-if="isMobile">
        <div
          v-for="stall in paginatedStalls"
          :key="stall.id"
          class="mobile-stall-card"
        >
          <div class="mobile-card-header">
            <div class="stall-info">
              <h4>{{ stall.name }}</h4>
              <el-tag v-if="stall.remark === 'VIP客户'" type="warning" size="small">VIP</el-tag>
              <el-tag v-else-if="stall.remark === '新客户'" type="success" size="small">新客户</el-tag>
            </div>
          </div>
          <div class="mobile-card-body">
            <div class="info-row">
              <span class="label">联系人：</span>
              <span class="value">{{ stall.contact }}</span>
            </div>
            <div class="info-row">
              <span class="label">电话：</span>
              <span class="value phone">{{ stall.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">地址：</span>
              <span class="value">{{ stall.address }}</span>
            </div>
            <div class="info-row" v-if="stall.remark">
              <span class="label">备注：</span>
              <span class="value">{{ stall.remark }}</span>
            </div>
          </div>
          <div class="mobile-card-footer">
            <el-button type="primary" size="small" @click="editStall(stall)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" size="small" @click="removeStall(stall)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 桌面端表格视图 -->
      <el-table
        :data="paginatedStalls"
        style="width: 100%;"
        stripe
        class="desktop-table"
        v-else
      >
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="商户名称" min-width="180">
          <template #default="{ row }">
            <div class="stall-name-cell">
              <span class="name">{{ row.name }}</span>
              <el-tag v-if="row.remark === 'VIP客户'" type="warning" size="small">VIP</el-tag>
              <el-tag v-else-if="row.remark === '新客户'" type="success" size="small">新客户</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150">
          <template #default="{ row }">
            <span class="phone-number">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="250"></el-table-column>
        <el-table-column prop="remark" label="备注" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.remark" size="small" type="info">{{ row.remark }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editStall(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" size="small" @click="removeStall(row)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="filteredStalls.length > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="filteredStalls.length"
          size="large"
        ></el-pagination>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="filteredStalls.length === 0"
        description="暂无商户数据"
        :image-size="120"
      >
        <el-button type="primary" size="large" @click="addDialogVisible = true">添加第一个商户</el-button>
      </el-empty>
    </div>

    <!-- 添加商户对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加商户"
      width="600px"
      class="stall-dialog"
    >
      <el-form :model="newStall" label-width="100px" label-position="top">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="商户名称" required>
              <el-input
                v-model="newStall.name"
                placeholder="请输入商户名称"
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系人" required>
              <el-input
                v-model="newStall.contact"
                placeholder="请输入联系人"
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系电话" required>
              <el-input
                v-model="newStall.phone"
                placeholder="请输入联系电话"
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="客户类型">
              <el-select v-model="newStall.remark" placeholder="请选择客户类型" class="large-select" size="large" style="width: 100%;">
                <el-option label="普通客户" value="普通客户"></el-option>
                <el-option label="新客户" value="新客户"></el-option>
                <el-option label="VIP客户" value="VIP客户"></el-option>
                <el-option label="长期合作" value="长期合作"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="地址" required>
              <el-input
                v-model="newStall.address"
                placeholder="请输入地址"
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="large" @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" @click="addStall">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑商户"
      width="600px"
      class="stall-dialog"
    >
      <el-form :model="editStallData" label-width="100px" label-position="top">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="商户名称" required>
              <el-input
                v-model="editStallData.name"
                placeholder="请输入商户名称"
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系人" required>
              <el-input
                v-model="editStallData.contact"
                placeholder="请输入联系人"
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="联系电话" required>
              <el-input
                v-model="editStallData.phone"
                placeholder="请输入联系电话"
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="客户类型">
              <el-select v-model="editStallData.remark" placeholder="请选择客户类型" class="large-select" size="large" style="width: 100%;">
                <el-option label="普通客户" value="普通客户"></el-option>
                <el-option label="新客户" value="新客户"></el-option>
                <el-option label="VIP客户" value="VIP客户"></el-option>
                <el-option label="长期合作" value="长期合作"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="地址" required>
              <el-input
                v-model="editStallData.address"
                placeholder="请输入地址"
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="large" @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" size="large" @click="updateStall">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Plus, Download, Refresh, Search, Edit, Delete, Shop, Star, User } from '@element-plus/icons-vue'

export default {
  components: {
    Plus,
    Download,
    Refresh,
    Search,
    Edit,
    Delete,
    Shop,
    Star,
    User
  },
  data() {
    return {
      stalls: [
        { id: 1, name: '张三大排档', contact: '张三', phone: '13800138001', address: '北京市朝阳区建国路88号', remark: '长期合作' },
        { id: 2, name: '李四大排档', contact: '李四', phone: '13900139002', address: '北京市朝阳区建国路99号', remark: '新客户' },
        { id: 3, name: '王五大排档', contact: '王五', phone: '13700137003', address: '北京市西城区西单大街120号', remark: 'VIP客户' }
      ],
      newStall: {
        name: '',
        contact: '',
        phone: '',
        address: '',
        remark: ''
      },
      editStallData: {
        id: '',
        name: '',
        contact: '',
        phone: '',
        address: '',
        remark: ''
      },
      addDialogVisible: false,
      editDialogVisible: false,
      searchKeyword: '',
      currentPage: 1,
      pageSize: 20,
      isMobile: false
    };
  },
  computed: {
    filteredStalls() {
      if (!this.searchKeyword) {
        return this.stalls;
      }
      const keyword = this.searchKeyword.toLowerCase();
      return this.stalls.filter(stall =>
        stall.name.toLowerCase().includes(keyword) ||
        stall.contact.toLowerCase().includes(keyword)
      );
    },
    paginatedStalls() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredStalls.slice(start, end);
    },
    vipCount() {
      return this.stalls.filter(stall => stall.remark === 'VIP客户').length;
    },
    newCount() {
      return this.stalls.filter(stall => stall.remark === '新客户').length;
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
    },
    addStall() {
      if (!this.newStall.name) {
        this.$message.error('请填写商户名称');
        return;
      }
      if (!this.newStall.contact) {
        this.$message.error('请填写联系人');
        return;
      }
      if (!this.newStall.phone) {
        this.$message.error('请填写联系电话');
        return;
      }
      if (!this.newStall.address) {
        this.$message.error('请填写地址');
        return;
      }

      const newId = this.stalls.length > 0 ? Math.max(...this.stalls.map(stall => stall.id)) + 1 : 1;
      this.stalls.push({
        id: newId,
        ...this.newStall
      });
      this.resetForm();
      this.addDialogVisible = false;
      this.$message.success('商户添加成功');
    },
    removeStall(row) {
      this.$confirm(`确定要删除商户 "${row.name}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.stalls.findIndex(stall => stall.id === row.id);
        if (index !== -1) {
          this.stalls.splice(index, 1);
          this.$message.success('商户删除成功');
        }
      }).catch(() => {
        // 取消删除
      });
    },
    editStall(row) {
      this.editStallData = { ...row };
      this.editDialogVisible = true;
    },
    updateStall() {
      if (!this.editStallData.name) {
        this.$message.error('请填写商户名称');
        return;
      }
      if (!this.editStallData.contact) {
        this.$message.error('请填写联系人');
        return;
      }
      if (!this.editStallData.phone) {
        this.$message.error('请填写联系电话');
        return;
      }
      if (!this.editStallData.address) {
        this.$message.error('请填写地址');
        return;
      }

      const index = this.stalls.findIndex(stall => stall.id === this.editStallData.id);
      if (index !== -1) {
        this.stalls[index] = { ...this.editStallData };
        this.editDialogVisible = false;
        this.$message.success('商户更新成功');
      }
    },
    resetForm() {
      this.newStall = {
        name: '',
        contact: '',
        phone: '',
        address: '',
        remark: ''
      };
    },
    exportStalls() {
      if (this.stalls.length === 0) {
        this.$message.warning('没有可导出的商户数据');
        return;
      }

      let csv = '序号,商户名称,联系人,联系电话,地址,备注\n';
      this.stalls.forEach((stall, index) => {
        csv += `${index + 1},${stall.name},${stall.contact},${stall.phone},${stall.address},${stall.remark || '-'}\n`;
      });

      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `商户列表_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      this.$message.success('商户列表导出成功');
    },
    refreshData() {
      this.$message.success('数据刷新成功');
    },
    search() {
      this.currentPage = 1;
      this.$message.success(`找到 ${this.filteredStalls.length} 条记录`);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.currentPage = 1;
    },
    handleCurrentChange(val) {
      this.currentPage = val;
    }
  }
};
</script>

<style scoped>
#app {
  padding: 0;
  background-color: #F8FAFC;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #0F172A;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片区域 */
.summary-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  margin-left: 24px;
  margin-right: 24px;
}

.summary-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.summary-icon.blue {
  background-color: #EFF6FF;
  color: #0369A1;
}

.summary-icon.green {
  background-color: #F0FDF4;
  color: #16A34A;
}

.summary-icon.orange {
  background-color: #FFFBEB;
  color: #D97706;
}

.summary-content {
  flex: 1;
}

.summary-label {
  font-size: 14px;
  color: #64748B;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  margin-left: 24px;
  margin-right: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #E2E8F0;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 280px;
}

/* 表格样式 */
.desktop-table {
  margin-bottom: 20px;
}

.desktop-table :deep(.el-table__header th) {
  font-weight: 600;
  background-color: #F1F5F9;
  color: #334155;
  font-size: 14px;
  padding: 16px 12px;
}

.desktop-table :deep(.el-table__row td) {
  padding: 16px 12px;
  font-size: 14px;
}

.stall-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stall-name-cell .name {
  font-weight: 500;
}

.phone-number {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

/* 移动端卡片列表 */
.mobile-card-list {
  display: none;
}

.mobile-stall-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  margin-bottom: 16px;
  padding: 16px;
}

.mobile-card-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E8F0;
}

.mobile-card-header h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
}

.stall-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-card-body {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid #F1F5F9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 14px;
  color: #64748B;
  width: 70px;
  flex-shrink: 0;
}

.info-row .value {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
  flex: 1;
}

.info-row .value.phone {
  font-family: 'Courier New', monospace;
  color: #0369A1;
  font-weight: 600;
}

.mobile-card-footer {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
}

.mobile-card-footer .el-button {
  flex: 1;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

/* 对话框样式 */
.stall-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.large-input,
.large-select {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .summary-section {
    grid-template-columns: 1fr;
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 16px;
  }

  .summary-card {
    padding: 16px;
  }

  .card {
    padding: 16px;
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .card-header h3 {
    font-size: 16px;
  }

  .card-header-actions {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .desktop-table {
    display: none;
  }

  .mobile-card-list {
    display: block;
  }

  .pagination {
    justify-content: center;
  }

  .dialog-footer {
    flex-direction: column;
  }

  .dialog-footer .el-button {
    width: 100%;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .page-header h2 {
    font-size: 18px;
  }

  .card {
    padding: 12px;
    margin-left: 8px;
    margin-right: 8px;
  }

  .mobile-stall-card {
    padding: 12px;
  }

  .info-row {
    padding: 6px 0;
  }

  .info-row .label,
  .info-row .value {
    font-size: 13px;
  }
}

/* 针对老年人的优化 */
@media (prefers-contrast: high) {
  .card,
  .summary-card {
    border: 2px solid #334155;
  }

  .el-button {
    border-width: 2px;
  }
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>