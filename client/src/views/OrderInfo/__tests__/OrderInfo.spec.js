import { mount } from '@vue/test-utils';
import OrderInfo from '@/views/OrderInfo/index.vue';
import orderApi from '@/api/orderApi';
import merchantApi from '@/api/merchantApi';
import { vi, describe, test, beforeEach, expect } from 'vitest';

// 模拟 API
vi.mock('@/api/orderApi', () => ({
  default: {
    getAllOrders: vi.fn()
  }
}));

vi.mock('@/api/merchantApi', () => ({
  default: {
    getAllMerchants: vi.fn()
  }
}));

describe('OrderInfo Component', () => {
  let wrapper;

  beforeEach(() => {
    // 重置模拟函数
    vi.clearAllMocks();

    // 模拟 API 返回数据
    merchantApi.getAllMerchants.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: '张三大排档' },
        { id: 2, name: '李四餐厅' }
      ]
    });

    orderApi.getAllOrders.mockResolvedValue({
      success: true,
      data: [
        { id: 1, vegetable: '西红柿', weight: 5, price: 10, stallId: 1, completed: false },
        { id: 2, vegetable: '黄瓜', weight: 3, price: 6, stallId: 1, completed: true }
      ]
    });

    wrapper = mount(OrderInfo);
  });

  test('组件渲染正常', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('订单信息');
  });

  test('加载商户和订单数据', async () => {
    await wrapper.vm.$nextTick();
    expect(merchantApi.getAllMerchants).toHaveBeenCalled();
    expect(orderApi.getAllOrders).toHaveBeenCalled();
    expect(wrapper.vm.merchants.length).toBe(2);
    expect(wrapper.vm.orders.length).toBe(2);
  });

  test('选择商户', () => {
    wrapper.vm.formData.stallId = '1';
    expect(wrapper.vm.formData.stallId).toBe('1');
  });

  test('生成订单信息', async () => {
    // 模拟 alert
    const originalAlert = window.alert;
    window.alert = vi.fn();

    // 确保商户数据包含完整字段
    merchantApi.getAllMerchants.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: '张三大排档', address: '北京市朝阳区', contact: '13800138001' },
        { id: 2, name: '李四餐厅', address: '北京市海淀区', contact: '13900139001' }
      ]
    });

    // 确保订单数据与商户ID匹配
    orderApi.getAllOrders.mockResolvedValue({
      success: true,
      data: [
        { id: 1, vegetable: '西红柿', weight: 5, price: 10, stallId: 1, completed: false },
        { id: 2, vegetable: '黄瓜', weight: 3, price: 6, stallId: 1, completed: true }
      ]
    });
    
    // 重新挂载组件以加载新数据
    wrapper = mount(OrderInfo);
    await wrapper.vm.$nextTick();
    
    // 选择商户并生成订单信息
    wrapper.vm.formData.stallId = '1';
    await wrapper.vm.generateOrderInfo();
    
    expect(wrapper.vm.orderInfo).toBeTruthy();
    expect(typeof wrapper.vm.orderInfo).toBe('string');

    // 恢复原始 alert
    window.alert = originalAlert;
  });

  test('复制订单信息', async () => {
    // 模拟 alert
    const originalAlert = window.alert;
    window.alert = vi.fn();

    // 模拟 clipboard API
    if (!navigator.clipboard) {
      navigator.clipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
      };
    }
    
    // 确保商户数据包含完整字段
    merchantApi.getAllMerchants.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: '张三大排档', address: '北京市朝阳区', contact: '13800138001' },
        { id: 2, name: '李四餐厅', address: '北京市海淀区', contact: '13900139001' }
      ]
    });

    // 确保订单数据与商户ID匹配
    orderApi.getAllOrders.mockResolvedValue({
      success: true,
      data: [
        { id: 1, vegetable: '西红柿', weight: 5, price: 10, stallId: 1, completed: false },
        { id: 2, vegetable: '黄瓜', weight: 3, price: 6, stallId: 1, completed: true }
      ]
    });
    
    // 重新挂载组件以加载新数据
    wrapper = mount(OrderInfo);
    await wrapper.vm.$nextTick();
    
    // 生成订单信息
    wrapper.vm.formData.stallId = '1';
    await wrapper.vm.generateOrderInfo();
    
    // 复制订单信息
    await wrapper.vm.copyOrderInfo();
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(wrapper.vm.orderInfo);

    // 恢复原始 alert
    window.alert = originalAlert;
  });
});
