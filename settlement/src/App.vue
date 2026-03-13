<template>
  <div id="app">
    <div class="page-header">
      <h2>结算管理</h2>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="exportSettlement">
          <el-icon><Download /></el-icon> 导出结算单
        </el-button>
        <el-button size="large" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <!-- 结算汇总卡片 - 放在最上方，一目了然 -->
    <div class="summary-section">
      <div class="summary-card total-card">
        <div class="summary-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">结算总金额</div>
          <div class="summary-value amount">¥ {{ totalAmount.toFixed(2) }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon blue">
          <el-icon><Document /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">订单总数</div>
          <div class="summary-value">{{ filteredVegetables.length }} 单</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon green">
          <el-icon><Scale /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">总重量</div>
          <div class="summary-value">{{ totalWeight.toFixed(2) }} 斤</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="summary-icon orange">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">待处理</div>
          <div class="summary-value">{{ pendingCount }} 单</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>结算筛选</h3>
      </div>
      <div class="filter-form">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                class="large-date-picker"
                size="large"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="选择商户">
              <el-select 
                v-model="selectedStallId" 
                placeholder="选择商户" 
                class="large-select"
                size="large"
                clearable
                style="width: 100%;"
              >
                <el-option value="" label="全部商户"></el-option>
                <el-option
                  v-for="stall in stalls"
                  :key="stall.id"
                  :label="stall.name"
                  :value="stall.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="订单状态">
              <el-select 
                v-model="selectedStatus" 
                placeholder="订单状态" 
                class="large-select"
                size="large"
                clearable
                style="width: 100%;"
              >
                <el-option value="" label="全部状态"></el-option>
                <el-option label="待处理" value="pending"></el-option>
                <el-option label="已结算" value="settled"></el-option>
                <el-option label="已完成" value="completed"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="24" :lg="6">
            <el-form-item label="操作" class="filter-actions">
              <el-button type="primary" size="large" @click="search" class="btn-search">
                <el-icon><Search /></el-icon> 查询
              </el-button>
              <el-button size="large" @click="resetFilter" class="btn-reset">
                <el-icon><RefreshRight /></el-icon> 重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>结算明细</h3>
        <div class="header-actions">
          <el-button 
            type="success" 
            size="large" 
            @click="batchSettle" 
            :disabled="selectedOrders.length === 0"
          >
            <el-icon><Check /></el-icon> 批量结算 ({{ selectedOrders.length }})
          </el-button>
        </div>
      </div>
      
      <!-- 移动端卡片视图 -->
      <div class="mobile-card-list" v-if="isMobile">
        <div 
          v-for="item in paginatedVegetables" 
          :key="item.id"
          class="mobile-settlement-card"
          :class="item.status"
        >
          <div class="mobile-card-header">
            <el-checkbox v-model="item.selected" @change="handleSelectionChange" size="large"></el-checkbox>
            <span class="stall-name">{{ item.stallName }}</span>
            <el-tag :type="getStatusType(item.status)" size="small">{{ getStatusText(item.status) }}</el-tag>
          </div>
          <div class="mobile-card-body">
            <div class="info-row">
              <span class="label">蔬菜：</span>
              <span class="value vegetable-name">{{ item.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">规格：</span>
              <span class="value">{{ item.spec || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">数量：</span>
              <span class="value">{{ item.weight }} 斤 × {{ item.price }} 元/斤</span>
            </div>
            <div class="info-row">
              <span class="label">金额：</span>
              <span class="value amount">¥ {{ (item.weight * item.price).toFixed(2) }}</span>
            </div>
            <div class="info-row" v-if="item.orderDate">
              <span class="label">日期：</span>
              <span class="value">{{ item.orderDate }}</span>
            </div>
          </div>
          <div class="mobile-card-footer">
            <el-button 
              v-if="item.status !== 'completed'"
              type="primary" 
              size="small" 
              @click="settleOrder(item)"
            >
              <el-icon><Check /></el-icon> 结算
            </el-button>
            <el-tag v-else type="success" size="small">已完成</el-tag>
          </div>
        </div>
      </div>

      <!-- 桌面端表格视图 -->
      <el-table 
        :data="paginatedVegetables" 
        style="width: 100%;" 
        stripe
        class="desktop-table"
        v-else
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="stallName" label="商户名称" min-width="150"></el-table-column>
        <el-table-column prop="name" label="蔬菜名称" min-width="120"></el-table-column>
        <el-table-column prop="spec" label="规格型号" min-width="120"></el-table-column>
        <el-table-column prop="weight" label="数量（斤）" width="120" align="right"></el-table-column>
        <el-table-column prop="price" label="单价（元/斤）" width="130" align="right"></el-table-column>
        <el-table-column label="金额（元）" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">{{ (row.weight * row.price).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderDate" label="订单日期" width="130"></el-table-column>
        <el-table-column prop="status" label="订单状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status !== 'completed'"
              type="primary" 
              size="small" 
              @click="settleOrder(row)"
            >
              <el-icon><Check /></el-icon> 结算
            </el-button>
            <el-tag v-else type="success" size="small">已完成</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="filteredVegetables.length > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next"
          :total="filteredVegetables.length"
          size="large"
        ></el-pagination>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="filteredVegetables.length === 0" 
        description="暂无结算数据"
        :image-size="120"
      >
        <el-button type="primary" size="large" @click="resetFilter">查看全部</el-button>
      </el-empty>
    </div>

    <!-- 结算确认对话框 -->
    <el-dialog
      v-model="settleDialogVisible"
      title="订单结算"
      width="500px"
      class="settle-dialog"
    >
      <div class="settle-confirm-content">
        <div class="confirm-item">
          <span class="label">商户名称：</span>
          <span class="value">{{ currentSettleOrder.stallName }}</span>
        </div>
        <div class="confirm-item">
          <span class="label">蔬菜名称：</span>
          <span class="value">{{ currentSettleOrder.name }}</span>
        </div>
        <div class="confirm-item">
          <span class="label">数量：</span>
          <span class="value">{{ currentSettleOrder.weight }} 斤</span>
        </div>
        <div class="confirm-item">
          <span class="label">单价：</span>
          <span class="value">{{ currentSettleOrder.price }} 元/斤</span>
        </div>
        <div class="confirm-item total">
          <span class="label">结算金额：</span>
          <span class="value amount">¥ {{ currentSettleOrder.amount }}</span>
        </div>
      </div>
      <template #footer>
        <el-button size="large" @click="settleDialogVisible = false">取消</el-button>
        <el-button type="primary" size="large" @click="confirmSettle">确认结算</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Download, Refresh, Search, RefreshRight, Check, Money, Document, Scale, Timer } from '@element-plus/icons-vue'

export default {
  components: {
    Download,
    Refresh,
    Search,
    RefreshRight,
    Check,
    Money,
    Document,
    Scale,
    Timer
  },
  data() {
    return {
      stalls: [
        { id: 1, name: '张三大排档' },
        { id: 2, name: '李四大排档' },
        { id: 3, name: '王五大排档' }
      ],
      vegetables: [
        { id: 1, stallId: 1, stallName: '张三大排档', name: '白菜', spec: '普通', weight: 5, price: 2, orderDate: '2024-01-01', status: 'pending', selected: false },
        { id: 2, stallId: 1, stallName: '张三大排档', name: '萝卜', spec: '普通', weight: 3, price: 1.5, orderDate: '2024-01-01', status: 'pending', selected: false },
        { id: 3, stallId: 2, stallName: '李四大排档', name: '西红柿', spec: '中等', weight: 4, price: 3, orderDate: '2024-01-01', status: 'settled', selected: false },
        { id: 4, stallId: 2, stallName: '李四大排档', name: '黄瓜', spec: '普通', weight: 2, price: 2.5, orderDate: '2024-01-02', status: 'completed', selected: false },
        { id: 5, stallId: 3, stallName: '王五大排档', name: '茄子', spec: '长茄子', weight: 3, price: 2.8, orderDate: '2024-01-02', status: 'pending', selected: false }
      ],
      selectedStallId: '',
      selectedStatus: '',
      dateRange: [],
      currentPage: 1,
      pageSize: 20,
      isMobile: false,
      selectedOrders: [],
      settleDialogVisible: false,
      currentSettleOrder: {}
    };
  },
  computed: {
    filteredVegetables() {
      let result = this.vegetables;
      
      if (this.selectedStallId) {
        result = result.filter(vegetable => vegetable.stallId === this.selectedStallId);
      }
      
      if (this.selectedStatus) {
        result = result.filter(vegetable => vegetable.status === this.selectedStatus);
      }
      
      if (this.dateRange && this.dateRange.length === 2) {
        const startDate = this.dateRange[0];
        const endDate = this.dateRange[1];
        result = result.filter(vegetable => {
          const orderDate = new Date(vegetable.orderDate);
          return orderDate >= startDate && orderDate <= endDate;
        });
      }
      
      return result;
    },
    paginatedVegetables() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredVegetables.slice(start, end);
    },
    totalAmount() {
      return this.filteredVegetables.reduce((total, vegetable) => {
        return total + vegetable.weight * vegetable.price;
      }, 0);
    },
    totalWeight() {
      return this.filteredVegetables.reduce((total, vegetable) => {
        return total + vegetable.weight;
      }, 0);
    },
    pendingCount() {
      return this.filteredVegetables.filter(vegetable => vegetable.status === 'pending').length;
    },
    settledCount() {
      return this.filteredVegetables.filter(vegetable => vegetable.status === 'settled').length;
    },
    completedCount() {
      return this.filteredVegetables.filter(vegetable => vegetable.status === 'completed').length;
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
    getStatusType(status) {
      switch(status) {
        case 'pending': return 'info';
        case 'settled': return 'warning';
        case 'completed': return 'success';
        default: return '';
      }
    },
    getStatusText(status) {
      switch(status) {
        case 'pending': return '待处理';
        case 'settled': return '已结算';
        case 'completed': return '已完成';
        default: return '';
      }
    },
    settleOrder(row) {
      this.currentSettleOrder = {
        ...row,
        amount: (row.weight * row.price).toFixed(2)
      };
      this.settleDialogVisible = true;
    },
    confirmSettle() {
      const order = this.vegetables.find(v => v.id === this.currentSettleOrder.id);
      if (order) {
        order.status = 'completed';
        this.$message.success('订单结算成功');
      }
      this.settleDialogVisible = false;
    },
    batchSettle() {
      this.$confirm(`确定要结算选中的 ${this.selectedOrders.length} 条订单吗？`, '批量结算', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.selectedOrders.forEach(order => {
          const target = this.vegetables.find(v => v.id === order.id);
          if (target) {
            target.status = 'completed';
          }
        });
        this.$message.success(`成功结算 ${this.selectedOrders.length} 条订单`);
        this.selectedOrders = [];
      }).catch(() => {
        // 取消结算
      });
    },
    handleSelectionChange(selection) {
      this.selectedOrders = selection;
    },
    exportSettlement() {
      if (this.filteredVegetables.length === 0) {
        this.$message.warning('没有可导出的结算数据');
        return;
      }
      
      // CSV 导出
      let csv = '序号,商户名称,蔬菜名称,规格型号,数量(斤),单价(元/斤),金额(元),订单日期,订单状态\n';
      this.filteredVegetables.forEach((item, index) => {
        const amount = (item.weight * item.price).toFixed(2);
        csv += `${index + 1},${item.stallName},${item.name},${item.spec || '-'},${item.weight},${item.price},${amount},${item.orderDate},${this.getStatusText(item.status)}\n`;
      });
      
      // 添加汇总信息
      csv += `\n汇总信息,,,,,,,,\n`;
      csv += `订单总数,${this.filteredVegetables.length} 单,,,,,,,\n`;
      csv += `总重量,${this.totalWeight.toFixed(2)} 斤,,,,,,,\n`;
      csv += `总金额,${this.totalAmount.toFixed(2)} 元,,,,,,,\n`;
      
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `结算单_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      this.$message.success('结算单导出成功');
    },
    refreshData() {
      this.$message.success('数据刷新成功');
    },
    search() {
      this.currentPage = 1;
      this.$message.success(`找到 ${this.filteredVegetables.length} 条记录`);
    },
    resetFilter() {
      this.selectedStallId = '';
      this.selectedStatus = '';
      this.dateRange = [];
      this.currentPage = 1;
      this.$message.success('筛选条件已重置');
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

/* 汇总卡片区域 */
.summary-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.summary-card.total-card {
  background: linear-gradient(135deg, #0369A1 0%, #0284C7 100%);
  color: #fff;
}

.summary-card.total-card .summary-label,
.summary-card.total-card .summary-value {
  color: #fff;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: #EFF6FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #0369A1;
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

.summary-card.total-card .summary-icon {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
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

.summary-value.amount {
  color: #fff;
  font-size: 24px;
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

.filter-form {
  margin-top: 20px;
}

.filter-actions {
  margin-top: 29px;
}

.btn-search,
.btn-reset {
  min-width: 100px;
}

/* 大号表单元素 */
.large-select,
.large-date-picker {
  width: 100%;
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

.amount-text {
  font-weight: 600;
  color: #0369A1;
  font-size: 15px;
}

/* 移动端卡片列表 */
.mobile-card-list {
  display: none;
}

.mobile-settlement-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  margin-bottom: 16px;
  padding: 16px;
  transition: all 0.2s;
}

.mobile-settlement-card.completed {
  background-color: #F0FDF4;
  border-color: #86EFAC;
}

.mobile-settlement-card.settled {
  background-color: #FFFBEB;
  border-color: #FCD34D;
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E8F0;
  gap: 8px;
}

.stall-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  flex: 1;
}

.mobile-card-body {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F1F5F9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 14px;
  color: #64748B;
}

.info-row .value {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.info-row .vegetable-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.info-row .amount {
  color: #0369A1;
  font-weight: 700;
  font-size: 16px;
}

.mobile-card-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

/* 结算确认对话框 */
.settle-dialog :deep(.el-dialog__body) {
  padding: 20px 24px;
}

.settle-confirm-content {
  background-color: #F8FAFC;
  border-radius: 8px;
  padding: 20px;
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #E2E8F0;
}

.confirm-item:last-child {
  border-bottom: none;
}

.confirm-item.total {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 2px solid #E2E8F0;
}

.confirm-item .label {
  font-size: 15px;
  color: #64748B;
}

.confirm-item .value {
  font-size: 15px;
  color: #334155;
  font-weight: 500;
}

.confirm-item .value.amount {
  font-size: 24px;
  font-weight: 700;
  color: #0369A1;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .summary-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

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
  
  .summary-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .summary-value {
    font-size: 18px;
  }
  
  .summary-value.amount {
    font-size: 20px;
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
  
  .filter-actions {
    margin-top: 0;
  }
  
  .btn-search,
  .btn-reset {
    width: 100%;
    margin-bottom: 8px;
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
  
  .mobile-settlement-card {
    padding: 12px;
  }
  
  .info-row {
    padding: 6px 0;
  }
  
  .info-row .label,
  .info-row .value {
    font-size: 13px;
  }
  
  .info-row .vegetable-name {
    font-size: 15px;
  }
  
  .confirm-item .value.amount {
    font-size: 20px;
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