<script setup>
import { ref, onMounted } from 'vue';
import StallManagement from '@/views/StallManagement/index.vue';
import VegetableOrder from '@/views/VegetableOrder/index.vue';
import Settlement from '@/views/Settlement/index.vue';
import OrderInfo from '@/views/OrderInfo/index.vue';

// 状态管理
const activePage = ref('stall-management');
const pages = [
  { key: 'stall-management', title: '大排档管理', icon: 'store' },
  { key: 'vegetable-order', title: '蔬菜订单', icon: 'shopping-cart' },
  { key: 'settlement', title: '结算', icon: 'calculator' },
  { key: 'order-info', title: '订单信息', icon: 'file-invoice' }
];

// 处理导航切换
const handleNavClick = (page) => {
  activePage.value = page;
};

// 生命周期钩子
onMounted(() => {
  // 根据URL设置初始页面
  const path = window.location.pathname;
  if (path && path !== '/') {
    activePage.value = path.substring(1);
  }
});
</script>

<template>
  <div class="app-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>蔬菜结单系统</h2>
      </div>
      <div class="sidebar-nav">
        <a 
          v-for="page in pages" 
          :key="page.key"
          :href="'/' + page.key"
          :class="{ active: activePage === page.key }"
          @click.prevent="handleNavClick(page.key)"
        >
          <i :class="'fas fa-' + page.icon"></i>
          {{ page.title }}
        </a>
      </div>
    </div>
    <div class="main-content">
      <div class="main-header">
        <div class="header-left">
          <div class="breadcrumb">
            <a href="/" @click.prevent="handleNavClick('stall-management')">首页</a>
            <span>></span>
            <span>{{ pages.find(p => p.key === activePage)?.title }}</span>
          </div>
        </div>
        <div class="header-right">
          <div class="search-box">
            <input type="text" placeholder="搜索...">
          </div>
          <div class="user-info">
            <i class="fas fa-user"></i>
            <span>管理员</span>
          </div>
        </div>
      </div>
      <div class="content-area">
        <div class="page-content">
          <!-- 大排档管理页面 -->
          <StallManagement v-if="activePage === 'stall-management'" />
          
          <!-- 蔬菜订单页面 -->
          <VegetableOrder v-if="activePage === 'vegetable-order'" />
          
          <!-- 结算页面 -->
          <Settlement v-if="activePage === 'settlement'" />
          
          <!-- 订单信息页面 -->
          <OrderInfo v-if="activePage === 'order-info'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f0f2f5;
  height: 100vh;
  overflow: hidden;
  font-size: 14px;
}
.app-container {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 220px;
  background-color: #1890ff;
  color: #fff;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}
.sidebar-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}
.sidebar-nav {
  flex: 1;
  padding: 10px 0;
}
.sidebar-nav a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 14px;
  border-left: 3px solid transparent;
}
.sidebar-nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.sidebar-nav a.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-left: 3px solid #fff;
  color: #fff;
  font-weight: 500;
}
.sidebar-nav i {
  margin-right: 12px;
  font-size: 16px;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main-header {
  background-color: #fff;
  padding: 0 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}
.header-left {
  display: flex;
  align-items: center;
}
.breadcrumb {
  font-size: 14px;
  color: #666;
}
.breadcrumb a {
  color: #1890ff;
  text-decoration: none;
}
.breadcrumb span {
  margin: 0 8px;
  color: #999;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-box {
  position: relative;
  width: 240px;
}
.search-box input {
  width: 100%;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}
.search-box input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  border-radius: 4px;
  transition: all 0.3s ease;
}
.user-info:hover {
  background-color: #f0f2f5;
}
.user-info i {
  font-size: 16px;
  color: #666;
}
.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
.page-content {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  padding: 24px;
  min-height: 500px;
}

/* 按钮样式 */
.btn {
  display: inline-block;
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  margin-right: 8px;
  margin-bottom: 8px;
}
.btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}
.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}
.btn-default {
  background-color: #fff;
  color: #333;
}
.btn-default:hover {
  border-color: #1890ff;
  color: #1890ff;
}

/* 表格样式 */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}
.table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
}
.table tr:hover {
  background-color: #f5f5f5;
}

/* 表单样式 */
.form-item {
  margin-bottom: 16px;
}
.form-label {
  display: inline-block;
  width: 80px;
  font-weight: 500;
  margin-right: 12px;
  text-align: right;
}
.form-control {
  width: 200px;
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}
.form-control:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

/* 卡片样式 */
.card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  padding: 20px;
  margin-bottom: 16px;
}
.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}
.card-header h3,
.card-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 180px;
  }
  .sidebar-header h2 {
    font-size: 16px;
  }
  .sidebar-nav a {
    font-size: 13px;
    padding: 10px 16px;
  }
  .sidebar-nav i {
    font-size: 14px;
    margin-right: 8px;
  }
  .main-header {
    padding: 0 16px;
  }
  .breadcrumb {
    font-size: 13px;
  }
  .search-box {
    width: 180px;
  }
  .content-area {
    padding: 16px;
  }
  .page-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .app-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    overflow-x: auto;
    box-shadow: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .sidebar-header {
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 16px;
  }
  .sidebar-nav {
    display: flex;
    padding: 0;
  }
  .sidebar-nav a {
    white-space: nowrap;
    border-left: none;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
  .sidebar-nav a.active {
    border-left: none;
    border-bottom: 3px solid #fff;
  }
  .main-header {
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 8px;
    align-items: flex-start;
  }
  .header-left,
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  .search-box {
    width: 100%;
  }
}
</style>
