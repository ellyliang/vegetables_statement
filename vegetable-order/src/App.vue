<template>
  <div id="app">
    <div class="page-header">
      <h2>蔬菜订单管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportOrder">
          <i class="el-icon-download"></i> 导出订单
        </el-button>
        <el-button @click="refreshData">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>添加蔬菜订单</h3>
      </div>
      <el-form :model="form" class="add-vegetable-form" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="商户名称">
              <el-select v-model="form.stallId" placeholder="请选择商户" style="width: 100%;">
                <el-option
                  v-for="stall in stalls"
                  :key="stall.id"
                  :label="stall.name"
                  :value="stall.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="蔬菜名称">
              <el-select v-model="form.vegetable.name" placeholder="请选择蔬菜" style="width: 100%;">
                <el-option
                  v-for="vegetable in vegetableOptions"
                  :key="vegetable.value"
                  :label="vegetable.label"
                  :value="vegetable.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="规格型号">
              <el-input v-model="form.vegetable.spec" placeholder="请输入规格" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="采购数量（斤）">
              <el-input-number v-model="form.vegetable.weight" :min="0" placeholder="请输入数量" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单价（元/斤）">
              <el-input-number v-model="form.vegetable.price" :min="0" :step="0.1" placeholder="请输入单价" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="金额（元）">
              <el-input v-model="form.vegetable.amount" disabled style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单日期">
              <el-date-picker
                v-model="form.orderDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单状态">
              <el-select v-model="form.status" style="width: 100%;">
                <el-option label="待处理" value="pending"></el-option>
                <el-option label="处理中" value="processing"></el-option>
                <el-option label="已完成" value="completed"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="备注">
              <el-input v-model="form.remark" placeholder="请输入备注" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" @click="addVegetable" class="btn-primary">添加订单</el-button>
          <el-button @click="resetForm" class="btn-default">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>订单列表</h3>
        <div class="card-header-actions">
          <el-select v-model="selectedStallId" placeholder="筛选商户" style="margin-right: 10px;">
            <el-option value="" label="全部"></el-option>
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
            style="width: 200px; margin-right: 10px;"
            clearable
          ></el-input>
          <el-button @click="search">搜索</el-button>
        </div>
      </div>
      <el-table :data="filteredVegetables" style="width: 100%;" stripe>
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="stallName" label="商户名称" width="180"></el-table-column>
        <el-table-column prop="name" label="蔬菜名称"></el-table-column>
        <el-table-column prop="spec" label="规格型号" width="120"></el-table-column>
        <el-table-column prop="weight" label="数量（斤）" width="120"></el-table-column>
        <el-table-column prop="price" label="单价（元/斤）" width="120"></el-table-column>
        <el-table-column prop="amount" label="金额（元）" width="120"></el-table-column>
        <el-table-column prop="orderDate" label="订单日期" width="150">
          <template #default="{ row }">
            {{ row.orderDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="completed" label="完成状态" width="100">
          <template #default="{ row }">
            <el-checkbox v-model="row.completed" @change="updateCompleted(row)"></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row, $index }">
            <el-button type="primary" size="small" @click="editVegetable(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="removeVegetable($index)">删除</el-button>
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
        { value: '菠菜', label: '菠菜' }
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
      editingIndex: -1
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
  methods: {
    calculateAmount(vegetable) {
      vegetable.amount = (vegetable.weight * vegetable.price).toFixed(2);
    },
    addVegetable() {
      if (this.form.stallId && this.form.vegetable.name) {
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
        } else {
          this.vegetables.push(newOrder);
        }
        
        this.resetForm();
        this.$message.success('订单添加成功');
      } else {
        this.$message.error('请填写必填字段');
      }
    },
    removeVegetable(index) {
      this.$confirm('确定要删除这条订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.vegetables.splice(index, 1);
        this.$message.success('订单删除成功');
      }).catch(() => {
        // 取消删除
      });
    },
    editVegetable(row) {
      this.editingIndex = this.vegetables.indexOf(row);
      this.form.stallId = row.stallId;
      this.form.vegetable = { ...row };
      this.form.orderDate = row.orderDate ? new Date(row.orderDate) : new Date();
      this.form.status = row.status;
      this.form.remark = row.remark;
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
    updateAmount(row) {
      this.calculateAmount(row);
    },
    updateCompleted(row) {
      // 可以在这里添加完成状态变更的逻辑
      console.log('Completed status changed:', row.completed);
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
      // 导出订单逻辑
      this.$message.success('订单导出成功');
    },
    refreshData() {
      // 刷新数据逻辑
      this.$message.success('数据刷新成功');
    },
    search() {
      // 搜索逻辑
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

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-vegetable-form {
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 16px;
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
  
  .card-header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .el-row {
    flex-direction: column;
  }
  
  .el-col {
    width: 100% !important;
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
  
  .el-form-item label {
    font-size: 13px;
  }
}
</style>
