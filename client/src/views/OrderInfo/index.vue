<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import orderApi from '@/api/orderApi';
import merchantApi from '@/api/merchantApi';
import type { Merchant, Order } from '@/types';

// 商户数据
const merchants = ref<Merchant[]>([]);

// 订单数据
const orders = ref<Order[]>([]);

// 表单数据
const formData = ref<{ stallId: string; date: string }>({
  stallId: '',
  date: new Date().toISOString().split('T')[0]
});

// 生成的订单信息
const orderInfo = ref<string>('');

// 加载商户数据
const loadMerchants = async (): Promise<void> => {
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
const loadOrders = async (): Promise<void> => {
  try {
    const response = await orderApi.getAllOrders();
    if (response.success) {
      orders.value = response.data;
    }
  } catch (error) {
    console.error('加载订单数据失败:', error);
  }
};

// 计算选中商户的订单
const stallOrders = computed<Order[]>(() => {
  if (!formData.value.stallId) return [];
  return orders.value.filter(o => o.stallId == formData.value.stallId);
});

// 计算订单总金额
const totalAmount = computed<number>(() => {
  return stallOrders.value.reduce((sum, order) => sum + (Number(order.price) * Number(order.weight)), 0);
});

// 生成订单信息
const generateOrderInfo = (): void => {
  if (!formData.value.stallId) {
    alert('请选择大排档');
    return;
  }

  const merchant = merchants.value.find(m => m.id == formData.value.stallId);
  if (!merchant) return;

  let info = `订单信息\n`;
  info += `================================\n`;
  info += `大排档：${merchant.name}\n`;
  info += `地址：${merchant.address}\n`;
  info += `联系方式：${merchant.contact}\n`;
  info += `日期：${formData.value.date}\n`;
  info += `================================\n`;
  info += `蔬菜清单：\n`;

  stallOrders.value.forEach(order => {
    info += `${order.vegetable}：${order.weight}斤 × ${order.price}元/斤 = ${Number(order.price) * Number(order.weight)}元\n`;
  });

  info += `================================\n`;
  info += `总金额：${totalAmount.value}元\n`;
  info += `================================\n`;

  orderInfo.value = info;
};

// 复制订单信息
const copyOrderInfo = (): void => {
  if (!orderInfo.value) return;
  navigator.clipboard.writeText(orderInfo.value).then(() => {
    alert('订单信息已复制到剪贴板');
  });
};

// 导出订单信息
const exportOrderInfo = (): void => {
  if (!orderInfo.value) return;
  const blob = new Blob([orderInfo.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `订单信息_${formData.value.date}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 生命周期钩子
onMounted(async () => {
  await loadMerchants();
  await loadOrders();
});
</script>

<template>
  <div>
    <h3>订单信息</h3>
    <div class="card">
      <div class="card-header">
        <h4>订单详情</h4>
      </div>
      <div class="form-item">
        <label class="form-label">大排档：</label>
        <select
          v-model="formData.stallId"
          class="form-control"
        >
          <option value="">
            请选择
          </option>
          <option
            v-for="merchant in merchants"
            :key="merchant.id"
            :value="merchant.id"
          >
            {{ merchant.name }}
          </option>
        </select>
      </div>
      <div class="form-item">
        <label class="form-label">日期：</label>
        <input
          v-model="formData.date"
          type="date"
          class="form-control"
        >
      </div>
      <button
        class="btn btn-primary"
        @click="generateOrderInfo"
      >
        生成订单信息
      </button>
    </div>
    
    <div
      v-if="orderInfo"
      class="card"
      style="margin-top: 16px;"
    >
      <div class="card-header">
        <h4>生成的订单信息</h4>
        <div style="float: right;">
          <button
            class="btn btn-default"
            @click="copyOrderInfo"
          >
            复制
          </button>
          <button
            class="btn btn-default"
            @click="exportOrderInfo"
          >
            导出
          </button>
        </div>
      </div>
      <pre style="white-space: pre-wrap; font-family: monospace;">{{ orderInfo }}</pre>
    </div>
  </div>
</template>
