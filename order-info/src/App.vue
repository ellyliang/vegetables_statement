<template>
  <div id="app">
    <div class="page-header">
      <h2>订单信息管理</h2>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="exportOrderInfo">
          <el-icon><Download /></el-icon> 导出订单
        </el-button>
        <el-button size="large" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <!-- 商户信息卡片 -->
    <div class="card merchant-card" v-if="selectedStall">
      <div class="merchant-header">
        <div class="merchant-icon">
          <el-icon><Shop /></el-icon>
        </div>
        <div class="merchant-info">
          <h3>{{ selectedStall.name }}</h3>
          <p class="merchant-detail">
            <span><el-icon><User /></el-icon> {{ selectedStall.contactName }}</span>
            <span><el-icon><Phone /></el-icon> {{ selectedStall.contactPhone }}</span>
          </p>
          <p class="merchant-address">
            <el-icon><Location /></el-icon> {{ selectedStall.address }}
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>订单查询</h3>
      </div>
      <div class="filter-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="选择商户">
              <el-select 
                v-model="form.stallId" 
                placeholder="请选择商户" 
                class="large-select"
                size="large"
                style="width: 100%;"
                @change="onStallChange"
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
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="订单日期范围">
              <el-date-picker
                v-model="form.dateRange"
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
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="订单状态">
              <el-select v-model="form.status" class="large-select" size="large" style="width: 100%;">
                <el-option label="待处理" value="pending"></el-option>
                <el-option label="已确认" value="confirmed"></el-option>
                <el-option label="已配送" value="delivered"></el-option>
                <el-option label="已完成" value="completed"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="selectedStall">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="联系人">
              <el-input 
                v-model="form.contactName" 
                placeholder="请输入联系人" 
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="联系电话">
              <el-input 
                v-model="form.contactPhone" 
                placeholder="请输入联系电话" 
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8">
            <el-form-item label="配送地址">
              <el-input 
                v-model="form.address" 
                placeholder="请输入配送地址" 
                class="large-input"
                size="large"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item class="form-actions">
          <el-button type="primary" size="large" @click="searchOrder" class="btn-primary">
            <el-icon><Search /></el-icon> 查询订单
          </el-button>
          <el-button size="large" @click="resetForm" class="btn-default">
            <el-icon><RefreshRight /></el-icon> 重置
          </el-button>
        </el-form-item>
      </div>
    </div>

    <!-- 订单汇总卡片 -->
    <div class="summary-section" v-if="filteredVegetables.length > 0">
      <div class="summary-card">
        <div class="summary-icon blue">
          <el-icon><Goods /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">商品种类</div>
          <div class="summary-value">{{ filteredVegetables.length }} 种</div>
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
      <div class="summary-card total-card">
        <div class="summary-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="summary-content">
          <div class="summary-label">总金额</div>
          <div class="summary-value amount">¥ {{ totalAmount.toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <div class="card" v-if="filteredVegetables.length > 0">
      <div class="card-header">
        <h3>商品明细</h3>
      </div>
      
      <!-- 移动端卡片视图 -->
      <div class="mobile-card-list" v-if="isMobile">
        <div 
          v-for="(item, index) in filteredVegetables" 
          :key="index"
          class="mobile-product-card"
        >
          <div class="mobile-card-header">
            <span class="product-index">{{ index + 1 }}</span>
            <span class="product-name">{{ item.name }}</span>
          </div>
          <div class="mobile-card-body">
            <div class="info-row">
              <span class="label">规格：</span>
              <span class="value">{{ item.spec || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="label">数量：</span>
              <span class="value">{{ item.weight }} 斤</span>
            </div>
            <div class="info-row">
              <span class="label">单价：</span>
              <span class="value">{{ item.price }} 元/斤</span>
            </div>
            <div class="info-row">
              <span class="label">金额：</span>
              <span class="value amount">¥ {{ (item.weight * item.price).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 桌面端表格视图 -->
      <el-table 
        :data="filteredVegetables" 
        style="width: 100%;" 
        stripe
        class="desktop-table"
        v-else
      >
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150"></el-table-column>
        <el-table-column prop="spec" label="规格型号" min-width="120"></el-table-column>
        <el-table-column prop="weight" label="数量（斤）" width="120" align="right"></el-table-column>
        <el-table-column prop="price" label="单价（元/斤）" width="130" align="right"></el-table-column>
        <el-table-column label="金额（元）" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">{{ (row.weight * row.price).toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="card action-card" v-if="filteredVegetables.length > 0">
      <div class="card-header">
        <h3>订单操作</h3>
      </div>
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="generateOrderInfo" class="btn-action">
          <el-icon><Document /></el-icon> 生成接单信息
        </el-button>
        <el-button type="success" size="large" @click="confirmOrder" class="btn-action">
          <el-icon><Check /></el-icon> 确认订单
        </el-button>
        <el-button type="warning" size="large" @click="markAsDelivered" class="btn-action">
          <el-icon><Van /></el-icon> 标记配送
        </el-button>
        <el-button type="info" size="large" @click="printOrder" class="btn-action">
          <el-icon><Printer /></el-icon> 打印订单
        </el-button>
      </div>
      
      <!-- 接单信息展示 -->
      <div v-if="orderInfo" class="order-info-section">
        <el-divider></el-divider>
        <div class="order-info-header">
          <h4>接单信息文本</h4>
          <el-button type="primary" size="small" @click="copyOrderInfo" class="btn-copy">
            <el-icon><DocumentCopy /></el-icon> 复制文本
          </el-button>
        </div>
        <div class="order-info-content">
          <pre>{{ orderInfo }}</pre>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty 
      v-if="!form.stallId" 
      description="请选择商户查看订单信息"
      :image-size="120"
    >
      <el-button type="primary" size="large" @click="focusStallSelect">选择商户</el-button>
    </el-empty>
  </div>
</template>

<script>
import { Download, Refresh, Search, RefreshRight, Document, Check, Van, Printer, DocumentCopy, Shop, User, Phone, Location, Goods, Scale, Money } from '@element-plus/icons-vue'

export default {
  components: {
    Download,
    Refresh,
    Search,
    RefreshRight,
    Document,
    Check,
    Van,
    Printer,
    DocumentCopy,
    Shop,
    User,
    Phone,
    Location,
    Goods,
    Scale,
    Money
  },
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
        { stallId: 1, name: '白菜', spec: '普通', weight: 5, price: 2 },
        { stallId: 1, name: '萝卜', spec: '普通', weight: 3, price: 1.5 },
        { stallId: 2, name: '西红柿', spec: '中等', weight: 4, price: 3 },
        { stallId: 2, name: '黄瓜', spec: '普通', weight: 2, price: 2.5 },
        { stallId: 3, name: '茄子', spec: '长茄子', weight: 3, price: 2.8 }
      ],
      orderInfo: '',
      isMobile: false
    };
  },
  computed: {
    selectedStall() {
      if (!this.form.stallId) return null;
      return this.stalls.find(s => s.id === this.form.stallId);
    },
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
    onStallChange() {
      if (this.form.stallId) {
        const stall = this.stalls.find(s => s.id === this.form.stallId);
        if (stall) {
          this.form.contactName = stall.contactName;
          this.form.contactPhone = stall.contactPhone;
          this.form.address = stall.address;
        }
      } else {
        this.form.contactName = '';
        this.form.contactPhone = '';
        this.form.address = '';
      }
      this.orderInfo = '';
    },
    generateOrderInfo() {
      if (!this.form.stallId) {
        this.$message.error('请选择商户');
        return;
      }
      const stall = this.stalls.find(s => s.id === this.form.stallId);
      const dateRange = this.form.dateRange && this.form.dateRange.length === 2 
        ? `${this.form.dateRange[0].toLocaleDateString()} 至 ${this.form.dateRange[1].toLocaleDateString()}`
        : new Date().toLocaleDateString();
      
      let info = `📋 蔬菜配送订单\n`;
      info += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      info += `🏪 商户名称：${stall.name}\n`;
      info += `👤 联系人：${this.form.contactName}\n`;
      info += `📞 联系电话：${this.form.contactPhone}\n`;
      info += `📍 配送地址：${this.form.address}\n`;
      info += `📅 订单日期：${dateRange}\n`;
      info += `📊 订单状态：${this.getStatusText(this.form.status)}\n`;
      info += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      info += `🥬 商品明细：\n\n`;
      
      this.filteredVegetables.forEach((vegetable, index) => {
        const amount = (vegetable.weight * vegetable.price).toFixed(2);
        info += `${index + 1}. ${vegetable.name}（${vegetable.spec || '普通'}）\n`;
        info += `   ${vegetable.weight}斤 × ${vegetable.price}元/斤 = ${amount}元\n\n`;
      });
      
      info += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      info += `💰 总计金额：${this.totalAmount.toFixed(2)}元\n`;
      info += `⚖️ 总重量：${this.totalWeight.toFixed(2)}斤\n`;
      info += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      info += `📝 备注：请确认订单信息，如有问题请及时联系。谢谢！`;
      
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
      this.$confirm('确定要确认此订单吗？', '确认订单', {
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
      this.$confirm('确定要标记此订单为已配送吗？', '标记配送', {
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
      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      const stall = this.selectedStall;
      
      let html = `
        <html>
        <head>
          <title>订单打印 - ${stall.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .info { margin-bottom: 20px; }
            .info p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { text-align: right; font-size: 18px; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>蔬菜配送订单</h1>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          <div class="info">
            <p><strong>商户名称：</strong>${stall.name}</p>
            <p><strong>联系人：</strong>${this.form.contactName}</p>
            <p><strong>联系电话：</strong>${this.form.contactPhone}</p>
            <p><strong>配送地址：</strong>${this.form.address}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>序号</th>
                <th>商品名称</th>
                <th>规格</th>
                <th>数量（斤）</th>
                <th>单价（元/斤）</th>
                <th>金额（元）</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      this.filteredVegetables.forEach((item, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.spec || '-'}</td>
            <td>${item.weight}</td>
            <td>${item.price}</td>
            <td>${(item.weight * item.price).toFixed(2)}</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
          <div class="total">
            <p>总重量：${this.totalWeight.toFixed(2)} 斤</p>
            <p>总金额：${this.totalAmount.toFixed(2)} 元</p>
          </div>
          <div class="footer">
            <p>谢谢惠顾！</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      
      this.$message.success('订单打印已准备就绪');
    },
    exportOrderInfo() {
      if (this.filteredVegetables.length === 0) {
        this.$message.warning('没有可导出的订单数据');
        return;
      }
      
      const stall = this.selectedStall;
      let csv = '蔬菜配送订单\n';
      csv += `商户名称,${stall.name}\n`;
      csv += `联系人,${this.form.contactName}\n`;
      csv += `联系电话,${this.form.contactPhone}\n`;
      csv += `配送地址,${this.form.address}\n`;
      csv += `订单日期,${new Date().toLocaleDateString()}\n\n`;
      csv += '序号,商品名称,规格型号,数量(斤),单价(元/斤),金额(元)\n';
      
      this.filteredVegetables.forEach((item, index) => {
        const amount = (item.weight * item.price).toFixed(2);
        csv += `${index + 1},${item.name},${item.spec || '-'},${item.weight},${item.price},${amount}\n`;
      });
      
      csv += `\n汇总,,,,,\n`;
      csv += `总重量,${this.totalWeight.toFixed(2)} 斤,,,,\n`;
      csv += `总金额,${this.totalAmount.toFixed(2)} 元,,,,\n`;
      
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `订单信息_${stall.name}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      this.$message.success('订单信息导出成功');
    },
    refreshData() {
      this.$message.success('数据刷新成功');
    },
    searchOrder() {
      if (!this.form.stallId) {
        this.$message.warning('请先选择商户');
        return;
      }
      this.$message.success('订单查询成功');
    },
    resetForm() {
      this.form.stallId = '';
      this.form.contactName = '';
      this.form.contactPhone = '';
      this.form.address = '';
      this.form.dateRange = [];
      this.form.status = 'pending';
      this.orderInfo = '';
      this.$message.success('表单已重置');
    },
    focusStallSelect() {
      // 聚焦到商户选择框
      this.$nextTick(() => {
        const select = document.querySelector('.large-select .el-input__inner');
        if (select) select.focus();
      });
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

/* 商户信息卡片 */
.merchant-card {
  background: linear-gradient(135deg, #0369A1 0%, #0284C7 100%);
  color: #fff;
  margin-left: 24px;
  margin-right: 24px;
}

.merchant-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.merchant-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.merchant-info {
  flex: 1;
}

.merchant-info h3 {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 600;
}

.merchant-detail {
  margin: 0 0 8px 0;
  display: flex;
  gap: 20px;
  font-size: 15px;
  opacity: 0.9;
}

.merchant-detail span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.merchant-address {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 卡片样式 */
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
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #E2E8F0;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0F172A;
}

/* 汇总区域 */
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

.summary-card.total-card {
  background: linear-gradient(135deg, #059669 0%, #10B981 100%);
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

/* 表单样式 */
.filter-form {
  margin-top: 20px;
}

.form-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #E2E8F0;
}

.large-select,
.large-input,
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

.mobile-product-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  margin-bottom: 12px;
  padding: 16px;
}

.mobile-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E2E8F0;
}

.product-index {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #EFF6FF;
  color: #0369A1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.mobile-card-body .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.mobile-card-body .label {
  font-size: 14px;
  color: #64748B;
}

.mobile-card-body .value {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.mobile-card-body .value.amount {
  color: #0369A1;
  font-weight: 700;
  font-size: 16px;
}

/* 操作按钮区域 */
.action-card {
  background-color: #fff;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.btn-action {
  width: 100%;
  min-height: 48px;
}

/* 接单信息区域 */
.order-info-section {
  margin-top: 24px;
}

.order-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-info-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.order-info-content {
  background-color: #F8FAFC;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  padding: 20px;
}

.order-info-content pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .action-buttons {
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
  
  .card {
    padding: 16px;
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 16px;
  }
  
  .merchant-card {
    margin-left: 12px;
    margin-right: 12px;
  }
  
  .merchant-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .merchant-detail {
    flex-direction: column;
    gap: 8px;
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
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
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
  
  .desktop-table {
    display: none;
  }
  
  .mobile-card-list {
    display: block;
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
  
  .merchant-card {
    margin-left: 8px;
    margin-right: 8px;
  }
  
  .merchant-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
  
  .merchant-info h3 {
    font-size: 18px;
  }
  
  .mobile-product-card {
    padding: 12px;
  }
  
  .order-info-content {
    padding: 12px;
  }
  
  .order-info-content pre {
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