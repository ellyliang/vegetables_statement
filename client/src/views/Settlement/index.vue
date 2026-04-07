<script setup>
import { ref, computed, onMounted } from 'vue';
import settlementApi from '@/api/settlementApi';
import orderApi from '@/api/orderApi';
import merchantApi from '@/api/merchantApi';

// 商户数据
const merchants = ref([]);

// 订单数据
const orders = ref([]);

// 结算数据
const settlements = ref([]);

// 筛选条件
const selectedStall = ref('');
const dateRange = ref(['', '']);

// 加载商户数据
const loadMerchants = async () => {
  try {
    const response = await merchantApi.getAllMerchants();
    if (response.success) {
      merchants.value = response.data;
    }
  } catch (error) {
    console.error('加载商户数据失败:', error);
  }
};

// 加载订单数据
const loadOrders = async () => {
  try {
    const response = await orderApi.getAllOrders();
    if (response.success) {
      orders.value = response.data;
    }
  } catch (error) {
    console.error('加载订单数据失败:', error);
  }
};

// 加载结算数据
const loadSettlements = async () => {
  try {
    const response = await settlementApi.getAllSettlements();
    if (response.success) {
      settlements.value = response.data;
    }
  } catch (error) {
    console.error('加载结算数据失败:', error);
  }
};

// 计算过滤后的订单
const filteredOrders = computed(() => {
  let result = orders.value;
  if (selectedStall.value) {
    result = result.filter(o => o.stallId == selectedStall.value);
  }
  return result;
});

// 计算总金额
const totalAmount = computed(() => {
  return filteredOrders.value.reduce((sum, order) => sum + (order.price * order.weight), 0);
});

// 批量结算
const batchSettlement = async () => {
  if (filteredOrders.value.length === 0) return;
  
  try {
    // 创建结算
    const newSettlement = {
      stallId: selectedStall.value || filteredOrders.value[0].stallId,
      amount: totalAmount.value,
      date: new Date().toISOString().split('T')[0]
    };
    
    const response = await settlementApi.createSettlement(newSettlement);
    if (response.success) {
      // 标记订单为已完成
      for (const order of filteredOrders.value) {
        await orderApi.toggleCompleted(order.id);
      }
      
      // 重新加载数据
      await loadSettlements();
      await loadOrders();
    }
  } catch (error) {
    console.error('批量结算失败:', error);
  }
};

// 查看结算详情
const viewSettlementDetail = (settlement) => {
  alert(`结算详情：\n大排档：${merchants.find(m => m.id === settlement.stallId)?.name}\n金额：${settlement.amount} 元\n日期：${settlement.date}`);
};

// 生命周期钩子
onMounted(async () => {
  await loadMerchants();
  await loadOrders();
  await loadSettlements();
});
</script>

<template>
  <div>
    <h3>结算</h3>
    <div style="margin-bottom: 16px; padding: 16px; background: #f5f5f5; border-radius: 4px;">
      <div class="form-item">
        <label class="form-label">大排档：</label>
        <select v-model="selectedStall" class="form-control">
          <option value="">全部</option>
          <option v-for="merchant in merchants" :key="merchant.id" :value="merchant.id">{{ merchant.name }}</option>
        </select>
      </div>
      <div class="form-item">
        <label class="form-label">日期范围：</label>
        <input type="date" v-model="dateRange[0]" class="form-control" style="margin-right: 8px;">
        <input type="date" v-model="dateRange[1]" class="form-control">
      </div>
      <div class="form-item">
        <label class="form-label">总金额：</label>
        <span style="font-weight: bold; color: #1890ff;">{{ totalAmount }} 元</span>
      </div>
      <button class="btn btn-primary" @click="batchSettlement" :disabled="filteredOrders.length === 0">批量结算</button>
    </div>
    
    <h4>结算记录</h4>
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>大排档</th>
          <th>金额（元）</th>
          <th>日期</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="settlement in settlements" :key="settlement.id">
          <td>{{ settlement.id }}</td>
          <td>{{ merchants.find(m => m.id === settlement.stallId)?.name }}</td>
          <td>{{ settlement.amount }}</td>
          <td>{{ settlement.date }}</td>
          <td>
            <button class="btn btn-primary" @click="viewSettlementDetail(settlement)">查看详情</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
