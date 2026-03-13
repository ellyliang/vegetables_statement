<template>
  <div id="app">
    <div class="page-header">
      <h2>蔬菜订单管理</h2>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="exportOrder">
          <el-icon><Download /></el-icon> 导出订单
        </el-button>
        <el-button size="large" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>添加蔬菜订单</h3>
      </div>
      <el-form :model="form" class="add-vegetable-form" label-width="140px" label-position="top">
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="选择商户">
              <el-select 
                v-model="form.stallId" 
                placeholder="请选择商户" 
                class="large-select"
                size="large"
              >
                <el-option
                  v-for="stall in stalls"
                  :key="stall.id"
                  :label="stall.name"
                  :value="stall.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="蔬菜名称">
              <el-select 
                v-model="form.vegetable.name" 
                placeholder="请选择蔬菜" 
                class="large-select"
                size="large"
                filterable
              >
                <el-option
                  v-for="vegetable in vegetableOptions"
                  :key="vegetable.value"
                  :label="vegetable.label"
                  :value="vegetable.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="规格型号">
              <el-input 
                v-model="form.vegetable.spec" 
                placeholder="如：新鲜、有机" 
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="采购数量（斤）">
              <el-input-number 
                v-model="form.vegetable.weight" 
                :min="0" 
                placeholder="请输入数量" 
                class="large-input-number"
                size="large"
                :controls="true"
                :precision="1"
                :step="0.5"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="单价（元/斤）">
              <el-input-number 
                v-model="form.vegetable.price" 
                :min="0" 
                :step="0.1" 
                placeholder="请输入单价" 
                class="large-input-number"
                size="large"
                :controls="true"
                :precision="2"
              ></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="金额（元）">
              <el-input 
                v-model="form.vegetable.amount" 
                disabled 
                class="large-input amount-display"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="订单日期">
              <el-date-picker
                v-model="form.orderDate"
                type="date"
                placeholder="选择日期"
                class="large-date-picker"
                size="large"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="订单状态">
              <el-select v-model="form.status" class="large-select" size="large">
                <el-option label="待处理" value="pending"></el-option>
                <el-option label="处理中" value="processing"></el-option>
                <el-option label="已完成" value="completed"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="备注">
              <el-input 
                v-model="form.remark" 
                placeholder="请输入备注" 
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item class="form-actions">
          <el-button type="primary" size="large" @click="addVegetable" class="btn-primary">
            <el-icon><Plus /></el-icon> 添加订单
          </el-button>
          <el-button size="large" @click="resetForm" class="btn-default">
            <el-icon><RefreshRight /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>订单列表</h3>
        <div class="card-header-actions">
          <el-select 
            v-model="selectedStallId" 
            placeholder="筛选商户" 
            class="filter-select"
            size="large"
            clearable
          >
            <el-option value="" label="全部商户"></el-option>
            <el-option
              v-for="stall in stalls"
              :key="stall.id"
              :label="stall.name"
              :value="stall.id"
            ></el-option>
          </el-select>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索蔬菜名称"
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
          v-for="(item, index) in paginatedVegetables" 
          :key="item.id"
          class="mobile-order-card"
          :class="{ 'completed': item.completed }"
        >
          <div class="mobile-card-header">
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
              <span class="value highlight">{{ item.weight }} 斤</span>
            </div>
            <div class="info-row">
              <span class="label">单价：</span>
              <span class="value">{{ item.price }} 元/斤</span>
            </div>
            <div class="info-row">
              <span class="label">金额：</span>
              <span class="value amount">{{ item.amount }} 元</span>
            </div>
            <div class="info-row" v-if="item.orderDate">
              <span class="label">日期：</span>
              <span class="value">{{ item.orderDate }}</span>
            </div>
          </div>
          <div class="mobile-card-footer">
            <el-checkbox 
              v-model="item.completed" 
              @change="updateCompleted(item)"
              size="large"
            >
              已完成
            </el-checkbox>
            <div class="actions">
              <el-button type="primary" size="small" @click="editVegetable(item)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="danger" size="small" @click="removeVegetable(index)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
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
      >
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="stallName" label="商户名称" min-width="150"></el-table-column>
        <el-table-column prop="name" label="蔬菜名称" min-width="120"></el-table-column>
        <el-table-column prop="spec" label="规格型号" min-width="120"></el-table-column>
        <el-table-column prop="weight" label="数量（斤）" width="120" align="right"></el-table-column>
        <el-table-column prop="price" label="单价（元/斤）" width="130" align="right"></el-table-column>
        <el-table-column prop="amount" label="金额（元）" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderDate" label="订单日期" width="130">
          <template #default="{ row }">
            {{ row.orderDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="completed" label="完成状态" width="100" align="center">
          <template #default="{ row }">
            <el-checkbox 
              v-model="row.completed" 
              @change="updateCompleted(row)"
              size="large"
            ></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button type="primary" size="small" @click="editVegetable(row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button type="danger" size="small" @click="removeVegetable($index)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
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
        description="暂无订单数据"
        :image-size="120"
      >
        <el-button type="primary" size="large" @click="resetForm">添加第一个订单</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { Download, Refresh, Plus, RefreshRight, Search, Edit, Delete } from '@element-plus/icons-vue'

export default {
  components: {
    Download,
    Refresh,
    Plus,
    RefreshRight,
    Search,
    Edit,
    Delete
  },
  data() {
    return {
      stalls: [
        { id: 1, name: '张三大排档' },
        { id: 2, name: '李四大排档' },
        { id: 3, name: '王五大排档' }
      ],
      vegetables: [],
      vegetableOptions: [
        { value: '白菜', label: '白菜' },
        { value: '萝卜', label: '萝卜' },
        { value: '西红柿', label: '西红柿' },
        { value: '黄瓜', label: '黄瓜' },
        { value: '茄子', label: '茄子' },
        { value: '青椒', label: '青椒' },
        { value: '土豆', label: '土豆' },
        { value: '洋葱', label: '洋葱' },
        { value: '胡萝卜', label: '胡萝卜' },
        { value: '菠菜', label: '菠菜' },
        { value: '芹菜', label: '芹菜' },
        { value: '生菜', label: '生菜' },
        { value: '西兰花', label: '西兰花' },
        { value: '花菜', label: '花菜' },
        { value: '豆角', label: '豆角' }
      ],
      form: {
        stallId: '',
        vegetable: {
          name: '',
          spec: '',
          weight: 0,
          price: 0,
          amount: 0,
          completed: false
        },
        orderDate: new Date(),
        status: 'pending',
        remark: ''
      },
      selectedStallId: '',
      searchKeyword: '',
      currentPage: 1,
      pageSize: 20,
      editingIndex: -1,
      isMobile: false
    };
  },
  computed: {
    filteredVegetables() {
      let result = this.vegetables;
      
      if (this.selectedStallId) {
        result = result.filter(vegetable => vegetable.stallId === this.selectedStallId);
      }
      
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase();
        result = result.filter(vegetable => 
          vegetable.name.toLowerCase().includes(keyword)
        );
      }
      
      return result;
    },
    paginatedVegetables() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredVegetables.slice(start, end);
    }
  },
  watch: {
    'form.vegetable.weight': function() {
      this.calculateAmount(this.form.vegetable);
    },
    'form.vegetable.price': function() {
      this.calculateAmount(this.form.vegetable);
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
    calculateAmount(vegetable) {
      vegetable.amount = (vegetable.weight * vegetable.price).toFixed(2);
    },
    addVegetable() {
      if (!this.form.stallId) {
        this.$message.error('请选择商户');
        return;
      }
      if (!this.form.vegetable.name) {
        this.$message.error('请选择蔬菜名称');
        return;
      }
      if (this.form.vegetable.weight <= 0) {
        this.$message.error('请输入采购数量');
        return;
      }
      if (this.form.vegetable.price <= 0) {
        this.$message.error('请输入单价');
        return;
      }
      
      const stall = this.stalls.find(s => s.id === this.form.stallId);
      this.calculateAmount(this.form.vegetable);
      
      const newOrder = {
        id: Date.now(),
        stallId: this.form.stallId,
        stallName: stall.name,
        ...this.form.vegetable,
        orderDate: this.form.orderDate ? this.form.orderDate.toISOString().split('T')[0] : '',
        status: this.form.status,
        remark: this.form.remark
      };
      
      if (this.editingIndex >= 0) {
        this.vegetables[this.editingIndex] = newOrder;
        this.editingIndex = -1;
        this.$message.success('订单修改成功');
      } else {
        this.vegetables.unshift(newOrder);
        this.$message.success('订单添加成功');
      }
      
      this.resetForm();
    },
    removeVegetable(index) {
      const realIndex = (this.currentPage - 1) * this.pageSize + index;
      this.$confirm('确定要删除这条订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.vegetables.splice(realIndex, 1);
        this.$message.success('订单删除成功');
      }).catch(() => {
        // 取消删除
      });
    },
    editVegetable(row) {
      this.editingIndex = this.vegetables.findIndex(v => v.id === row.id);
      this.form.stallId = row.stallId;
      this.form.vegetable = { 
        name: row.name,
        spec: row.spec,
        weight: row.weight,
        price: row.price,
        amount: row.amount,
        completed: row.completed
      };
      this.form.orderDate = row.orderDate ? new Date(row.orderDate) : new Date();
      this.form.status = row.status;
      this.form.remark = row.remark;
      
      // 滚动到表单顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    resetForm() {
      this.form = {
        stallId: '',
        vegetable: {
          name: '',
          spec: '',
          weight: 0,
          price: 0,
          amount: 0,
          completed: false
        },
        orderDate: new Date(),
        status: 'pending',
        remark: ''
      };
      this.editingIndex = -1;
    },
    updateCompleted(row) {
      const message = row.completed ? '订单已标记为完成' : '订单已标记为未完成';
      this.$message.success(message);
    },
    getStatusType(status) {
      switch(status) {
        case 'pending': return 'info';
        case 'processing': return 'warning';
        case 'completed': return 'success';
        default: return '';
      }
    },
    getStatusText(status) {
      switch(status) {
        case 'pending': return '待处理';
        case 'processing': return '处理中';
        case 'completed': return '已完成';
        default: return '';
      }
    },
    exportOrder() {
      if (this.vegetables.length === 0) {
        this.$message.warning('没有可导出的订单');
        return;
      }
      
      // 简单的 CSV 导出
      let csv = '序号,商户名称,蔬菜名称,规格型号,数量(斤),单价(元/斤),金额(元),订单日期,订单状态,完成状态\n';
      this.vegetables.forEach((item, index) => {
        csv += `${index + 1},${item.stallName},${item.name},${item.spec || '-'},${item.weight},${item.price},${item.amount},${item.orderDate || '-'},${this.getStatusText(item.status)},${item.completed ? '已完成' : '未完成'}\n`;
      });
      
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `蔬菜订单_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      this.$message.success('订单导出成功');
    },
    refreshData() {
      this.$message.success('数据刷新成功');
    },
    search() {
      this.currentPage = 1;
      this.$message.success(`找到 ${this.filteredVegetables.length} 条记录`);
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
  flex-wrap: wrap;
}

.add-vegetable-form {
  margin-top: 20px;
}

.form-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

/* 大号表单元素 */
.large-select,
.large-input,
.large-date-picker {
  width: 100%;
}

.large-input-number {
  width: 100%;
}

.large-input-number :deep(.el-input__wrapper) {
  padding: 0 11px;
}

.amount-display :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  color: #0369A1;
}

.filter-select {
  width: 180px;
}

.search-input {
  width: 220px;
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

.mobile-order-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  margin-bottom: 16px;
  padding: 16px;
  transition: all 0.2s;
}

.mobile-order-card.completed {
  background-color: #F0FDF4;
  border-color: #86EFAC;
}

.mobile-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E8F0;
}

.stall-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
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

.info-row .highlight {
  color: #0369A1;
  font-weight: 600;
}

.info-row .amount {
  color: #0369A1;
  font-weight: 700;
  font-size: 16px;
}

.mobile-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
}

.mobile-card-footer .actions {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

/* 按钮样式 */
.btn-primary {
  min-width: 120px;
}

.btn-default {
  min-width: 100px;
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
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select,
  .search-input {
    width: 100%;
  }
  
  .desktop-table {
    display: none;
  }
  
  .mobile-card-list {
    display: block;
  }
  
  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .form-actions .el-button {
    width: 100%;
    margin: 0;
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
  
  .mobile-order-card {
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
  
  .mobile-card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .mobile-card-footer .actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .mobile-card-footer .actions .el-button {
    flex: 1;
  }
}

/* 针对老年人的优化 */
@media (prefers-contrast: high) {
  .card {
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