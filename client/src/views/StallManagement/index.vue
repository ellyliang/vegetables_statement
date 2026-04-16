<script setup lang="ts">
import { ref, onMounted ,computed} from 'vue';
import merchantApi from '@/api/merchantApi';
import type { Merchant } from '@/types';

// 商户数据
const merchants = ref<Merchant[]>([]);
const merchantsCount = computed<number>(() => {
  return merchants.value.length;
});

// const merchantsCount = () => merchants.value.length;

// 编辑状态
const isEditing = ref<boolean>(false);
const currentMerchant = ref<Partial<Merchant> & { id: number | string }>({ id: '', name: '', address: '', contact: '' });

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

// 打开编辑对话框
const openEditDialog = (merchant: Merchant): void => {
  currentMerchant.value = { ...merchant };
  isEditing.value = true;
};

// 关闭编辑对话框
const closeEditDialog = (): void => {
  isEditing.value = false;
  currentMerchant.value = { id: '', name: '', address: '', contact: '' };
};

// 保存商户信息
const saveMerchant = async (): Promise<void> => {
  try {
    if (currentMerchant.value.id) {
      // 编辑现有商户
      const response = await merchantApi.updateMerchant(currentMerchant.value.id, currentMerchant.value);
      if (response.success) {
        await loadMerchants();
      }
    } else {
      // 添加新商户
      const response = await merchantApi.createMerchant(currentMerchant.value);
      if (response.success) {
        await loadMerchants();
      }
    }
    closeEditDialog();
  } catch (error) {
    console.error('保存商户信息失败:', error);
  }
};

// 删除商户
const deleteMerchant = async (id: number | string): Promise<void> => {
  try {
    const response = await merchantApi.deleteMerchant(id);
    if (response.success) {
      await loadMerchants();
    }
  } catch (error) {
    console.error('删除商户失败:', error);
  }
};

// 打开添加对话框
const openAddDialog = (): void => {
  currentMerchant.value = { id: '', name: '', address: '', contact: '' };
  isEditing.value = true;
};

// 导出商户数据
const exportMerchants = (): void => {
  const csvContent = "data:text/csv;charset=utf-8," +
    "ID,名称,地址,联系方式\n" +
    merchants.value.map(m => `${m.id},${m.name},${m.address},${m.contact}`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "merchants.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 生命周期钩子
onMounted(() => {
  loadMerchants();
});
</script>

<template>
  <div>
    <h3>大排档管理 (共 {{ merchantsCount }} 家)</h3>
    <div style="margin-bottom: 16px;">
      <button
        class="btn btn-primary"
        @click="openAddDialog"
      >
        添加大排档
      </button>
      <button
        class="btn btn-default"
        @click="exportMerchants"
      >
        导出数据
      </button>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名称</th>
          <th>地址</th>
          <th>联系方式</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="merchant in merchants"
          :key="merchant.id"
          class="merchant-item"
        >
          <td>{{ merchant.id }}</td>
          <td>{{ merchant.name }}</td>
          <td>{{ merchant.address }}</td>
          <td>{{ merchant.contact }}</td>
          <td>
            <button
              class="btn btn-primary"
              @click="openEditDialog(merchant)"
            >
              编辑
            </button>
            <button
              class="btn btn-default"
              @click="deleteMerchant(merchant.id)"
            >
              删除
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 编辑对话框 -->
    <div
      v-if="isEditing"
      style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;"
    >
      <div style="background: white; padding: 24px; border-radius: 4px; width: 400px;">
        <h4>{{ currentMerchant.id ? '编辑大排档' : '添加大排档' }}</h4>
        <div class="form-item">
          <label class="form-label">名称：</label>
          <input
            v-model="currentMerchant.name"
            type="text"
            class="form-control"
          >
        </div>
        <div class="form-item">
          <label class="form-label">地址：</label>
          <input
            v-model="currentMerchant.address"
            type="text"
            class="form-control"
          >
        </div>
        <div class="form-item">
          <label class="form-label">联系方式：</label>
          <input
            v-model="currentMerchant.contact"
            type="text"
            class="form-control"
          >
        </div>
        <div style="margin-top: 16px; text-align: right;">
          <button
            class="btn btn-default"
            @click="closeEditDialog"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            @click="saveMerchant"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
