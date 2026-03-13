<template>
  <div id="app">
    <div class="page-header">
      <h2>订单信息管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportOrderInfo">
          <i class="el-icon-download"></i> 导出订单
        </el-button>
        <el-button @click="refreshData">
          <i class="el-icon-refresh"></i> 刷新
        </el-button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>订单查询</h3>
        <div class="filter-form">
          <el-select v-model="form.stallId" placeholder="选择商户" style="width: 200px; margin-right: 10px;">
            <el-option value="" label="全部"></el-option>
            <el-option
              v-for="stall in stalls"
              :key="stall.id"
              :label="stall.name"
              :value="stall.id"
            ></el-option>
          </el-select>
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="margin-right: 10px;"
          ></el-date-picker>
          <el-button type="primary" @click="searchOrder">查询</el-button>
        </div>
      </div>
      <el-form :model="form" label-width="120px">
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
            <el-form-item label="联系人">
              <el-input v-model="form.contactName" placeholder="请输入联系人" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="配送地址">
              <el-input v-model="form.address" placeholder="请输入配送地址" style="width: 100%;"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单日期范围">
              <el-date-picker
                v-model="form.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单状态">
              <el-select v-model="form.status" style="width: 100%;">
                <el-option label="待处理" value="pending"></el-option>
                <el-option label="已确认" value="confirmed"></el-option>
                <el-option label="已配送" value="delivered"></el-option>
                <el-option label="已完成" value="completed"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>商品明细</h3>
      </div>
      <el-table :data="filteredVegetables" style="width: 100%;" stripe>
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="name" label="商品名称"></el-table-column>
        <el-table-column prop="spec" label="规格型号" width="120"></el-table-column>
        <el-table-column prop="weight" label="数量（斤）" width="120"></el-table-column>
        <el-table-column prop="price" label="单价（元/斤）" width="120"></el-table-column>
        <el-table-column label="金额（元）" width="120">
          <template #default="{ row }">
            {{ (row.weight * row.price).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>订单汇总</h3>
      </div>
      <div class="summary-container">
        <div class="summary-item">
          <span class="label">商品种类：</span>
          <span class="value">{{ filteredVegetables.length }} 种</span>
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
    </div>

    <div class="card">
      <div class="card-header">
        <h3>订单操作</h3>
      </div>
      <div class="action-buttons">
        <el-button type="primary" @click="generateOrderInfo" class="btn-primary">
          <i class="el-icon-document"></i> 生成接单信息
        </el-button>
        <el-button type="success" @click="confirmOrder" class="btn-success">
          <i class="el-icon-check"></i> 确认订单
        </el-button>
        <el-button type="warning" @click="markAsDelivered" class="btn-warning">
          <i class="el-icon-truck"></i> 标记配送
        </el-button>
        <el-button type="info" @click="printOrder" class="btn-info">
          <i class="el-icon-printer"></i> 打印订单
        </el-button>
      </div>
      
      <el-divider></el-divider>
      
      <div v-if="orderInfo" class="order-info-text">
        <el-card shadow="hover" class="order-info-card">
          <template #header>
            <div class="card-header">
              <span>接单信息文本</span>
              <el-button type="text" @click="copyOrderInfo">
                <i class="el-icon-document-copy"></i> 复制
              </el-button>
            </div>
          </template>
          <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">{{ orderInfo }}</pre>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stalls: [
        { id: 1, name: '张三大排档', contactName: '张三', contactPhone: '13800138001', address: '北京市朝阳区建国路88号' },
        { id: 2, name: '李四大排档', contactName: '李四', contactPhone: '13900139002', address: '北京市海淀区中关村大街1号' },
        { id: 3, name: '王五大排档', contactName: '王五', contactPhone: '13700137003', address: '北京市西城区西单大街120号' }
      ],
      form: {
        stallId: '',
        contactName: '',
        contactPhone: '',
        address: '',
        dateRange: [],
        status: 'pending'
      },
      vegetables: [
        // 模拟数据，实际应该从主应用或本地存储获取
        { stallId: 1, name: '白菜', spec: '普通', weight: 5, price: 2 },
        { stallId: 1, name: '萝卜', spec: '普通', weight: 3, price: 1.5 },
        { stallId: 2, name: '西红柿', spec: '中等', weight: 4, price: 3 },
        { stallId: 2, name: '黄瓜', spec: '普通', weight: 2, price: 2.5 },
        { stallId: 3, name: '茄子', spec: '长茄子', weight: 3, price: 2.8 }
      ],
      orderInfo: ''
    };
  },
  computed: {
    filteredVegetables() {
      if (!this.form.stallId) {
        return [];
      }
      return this.vegetables.filter(vegetable => vegetable.stallId === this.form.stallId);
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
    }
  },
  watch: {
    'form.stallId': function() {
      if (this.form.stallId) {
        const stall = this.stalls.find(s => s.id === this.form.stallId);
        if (stall) {
          this.form.contactName = stall.contactName;
          this.form.contactPhone = stall.contactPhone;
          this.form.address = stall.address;
        }
      }
    }
  },
  methods: {
    generateOrderInfo() {
      if (!this.form.stallId) {
        this.$message.error('请选择商户');
        return;
      }
      const stall = this.stalls.find(s => s.id === this.form.stallId);
      let info = `订单信息\n`;
      info += `==================================\n`;
      info += `商户名称：${stall.name}\n`;
      info += `联系人：${this.form.contactName}\n`;
      info += `联系电话：${this.form.contactPhone}\n`;
      info += `配送地址：${this.form.address}\n`;
      info += `订单日期范围：${this.form.dateRange ? this.form.dateRange[0].toLocaleDateString() + ' 至 ' + this.form.dateRange[1].toLocaleDateString() : new Date().toLocaleDateString()}\n`;
      info += `订单状态：${this.getStatusText(this.form.status)}\n`;
      info += `==================================\n`;
      info += `商品明细：\n`;
      this.filteredVegetables.forEach((vegetable, index) => {
        info += `${index + 1}. ${vegetable.name}（${vegetable.spec}） ${vegetable.weight}斤 × ${vegetable.price}元/斤 = ${(vegetable.weight * vegetable.price).toFixed(2)}元\n`;
      });
      info += `==================================\n`;
      info += `总计：${this.totalAmount.toFixed(2)}元\n`;
      info += `==================================\n`;
      info += `备注：请确认订单信息，如有问题请及时联系。`;
      this.orderInfo = info;
      this.$message.success('接单信息生成成功');
    },
    copyOrderInfo() {
      const textArea = document.createElement('textarea');
      textArea.value = this.orderInfo;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.$message.success('接单信息已复制到剪贴板');
    },
    confirmOrder() {
      this.$confirm('确定要确认此订单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.form.status = 'confirmed';
        this.$message.success('订单已确认');
      }).catch(() => {
        // 取消确认
      });
    },
    markAsDelivered() {
      this.$confirm('确定要标记此订单为已配送吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.form.status = 'delivered';
        this.$message.success('订单已标记为配送');
      }).catch(() => {
        // 取消标记
      });
    },
    printOrder() {
      this.$message.success('订单打印功能已触发');
    },
    exportOrderInfo() {
      // 导出订单信息逻辑
      this.$message.success('订单信息导出成功');
    },
    refreshData() {
      // 刷新数据逻辑
      this.$message.success('数据刷新成功');
    },
    searchOrder() {
      // 搜索订单逻辑
      this.$message.success('订单查询成功');
    },
    getStatusText(status) {
      switch(status) {
        case 'pending': return '待处理';
        case 'confirmed': return '已确认';
        case 'delivered': return '已配送';
        case 'completed': return '已完成';
        default: return '';
      }
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

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.summary-container {
  display: flex;
  gap: 40px;
  padding: 20px;
  background-color: #f0f2f5;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
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

.order-info-text {
  margin-top: 20px;
}

.order-info-card {
  border: 1px solid #e8e8e8;
}

.order-info-card pre {
  margin: 0;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
}

.el-table {
  margin-bottom: 20px;
}

.el-table th {
  font-weight: 600;
  background-color: #fafafa;
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
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .summary-container {
    flex-direction: column;
    gap: 15px;
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
