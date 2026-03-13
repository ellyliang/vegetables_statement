<template>
  <div id="app">
    <div class="page-header">
      <h2>结算管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportSettlement">
          <i class="el-icon-download"></i> 导出结算单
        </el-button>
        <el-button @click="refreshData">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>结算筛选</h3>
        <div class="filter-form">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-right: 10px;"
          ></el-date-picker>
          <el-select v-model="selectedStallId" placeholder="选择商户" style="width: 180px; margin-right: 10px;">
            <el-option value="" label="全部"></el-option>
            <el-option
              v-for="stall in stalls"
              :key="stall.id"
              :label="stall.name"
              :value="stall.id"
            ></el-option>
          </el-select>
          <el-select v-model="selectedStatus" placeholder="订单状态" style="width: 120px; margin-right: 10px;">
            <el-option value="" label="全部"></el-option>
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="已结算" value="settled"></el-option>
            <el-option label="已完成" value="completed"></el-option>
          </el-select>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>结算明细</h3>
      </div>
      <el-table :data="filteredVegetables" style="width: 100%;" stripe>
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="stallName" label="商户名称" width="180"></el-table-column>
        <el-table-column prop="name" label="蔬菜名称"></el-table-column>
        <el-table-column prop="spec" label="规格型号" width="120"></el-table-column>
        <el-table-column prop="weight" label="数量（斤）" width="120"></el-table-column>
        <el-table-column prop="price" label="单价（元/斤）" width="120"></el-table-column>
        <el-table-column prop="amount" label="金额（元）" width="120">
          <template #default="{ row }">
            {{ (row.weight * row.price).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderDate" label="订单日期" width="150"></el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="settleOrder(row)">结算</el-button>
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
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredVegetables.length"
        ></el-pagination>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>结算汇总</h3>
      </div>
      <div class="summary-container">
        <div class="summary-card">
          <div class="summary-item">
            <span class="label">订单总数：</span>
            <span class="value">{{ filteredVegetables.length }} 单</span>
          </div>
          <div class="summary-item">
            <span class="label">总重量：</span>
            <span class="value">{{ totalWeight.toFixed(2) }} 斤</span>
          </div>
          <div class="summary-item">
            <span class="label">总金额：</span>
            <span class="value amount">{{ totalAmount.toFixed(2) }} 元</span>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-item">
            <span class="label">待处理：</span>
            <span class="value">{{ pendingCount }} 单</span>
          </div>
          <div class="summary-item">
            <span class="label">已结算：</span>
            <span class="value">{{ settledCount }} 单</span>
          </div>
          <div class="summary-item">
            <span class="label">已完成：</span>
            <span class="value">{{ completedCount }} 单</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stalls: [
        { id: 1, name: '张三大排档' },
        { id: 2, name: '李四大排档' },
        { id: 3, name: '王五大排档' }
      ],
      vegetables: [
        // 模拟数据，实际应该从主应用或本地存储获取
        { id: 1, stallId: 1, stallName: '张三大排档', name: '白菜', spec: '普通', weight: 5, price: 2, orderDate: '2024-01-01', status: 'pending' },
        { id: 2, stallId: 1, stallName: '张三大排档', name: '萝卜', spec: '普通', weight: 3, price: 1.5, orderDate: '2024-01-01', status: 'pending' },
        { id: 3, stallId: 2, stallName: '李四大排档', name: '西红柿', spec: '中等', weight: 4, price: 3, orderDate: '2024-01-01', status: 'settled' },
        { id: 4, stallId: 2, stallName: '李四大排档', name: '黄瓜', spec: '普通', weight: 2, price: 2.5, orderDate: '2024-01-02', status: 'completed' },
        { id: 5, stallId: 3, stallName: '王五大排档', name: '茄子', spec: '长茄子', weight: 3, price: 2.8, orderDate: '2024-01-02', status: 'pending' }
      ],
      selectedStallId: '',
      selectedStatus: '',
      dateRange: [],
      currentPage: 1,
      pageSize: 20
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
  methods: {
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
      this.$confirm('确定要结算这条订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        row.status = 'settled';
        this.$message.success('订单结算成功');
      }).catch(() => {
        // 取消结算
      });
    },
    exportSettlement() {
      // 导出结算单逻辑
      this.$message.success('结算单导出成功');
    },
    refreshData() {
      // 刷新数据逻辑
      this.$message.success('数据刷新成功');
    },
    search() {
      // 搜索逻辑
      this.currentPage = 1;
    },
    resetFilter() {
      this.selectedStallId = '';
      this.selectedStatus = '';
      this.dateRange = [];
      this.currentPage = 1;
    },
    handleSizeChange(val) {
      this.pageSize = val;
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
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  padding: 24px;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 10px;
}

.el-table {
  margin-bottom: 20px;
}

.el-table th {
  font-weight: 600;
  background-color: #fafafa;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.summary-container {
  display: flex;
  gap: 20px;
}

.summary-card {
  flex: 1;
  background-color: #f0f2f5;
  border-radius: 4px;
  padding: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .label {
  font-size: 14px;
  color: #666;
}

.summary-item .value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.summary-item .amount {
  color: #f56c6c;
  font-size: 18px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-form {
    flex-wrap: wrap;
    width: 100%;
  }
  
  .summary-container {
    flex-direction: column;
  }
  
  .summary-card {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .card {
    padding: 12px;
  }
  
  .page-header h2 {
    font-size: 18px;
  }
  
  .card-header h3 {
    font-size: 14px;
  }
  
  .summary-item .label {
    font-size: 13px;
  }
  
  .summary-item .value {
    font-size: 14px;
  }
  
  .summary-item .amount {
    font-size: 16px;
  }
}
</style>
