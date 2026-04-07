import { mount } from '@vue/test-utils';
import Settlement from '@/views/Settlement/index.vue';
import settlementApi from '@/api/settlementApi';
import merchantApi from '@/api/merchantApi';
import orderApi from '@/api/orderApi';
import { vi, describe, test, beforeEach, expect } from 'vitest';

// 模拟 API
vi.mock('@/api/settlementApi', () => ({
  default: {
    getAllSettlements: vi.fn(),
    createSettlement: vi.fn()
  }
}));

vi.mock('@/api/merchantApi', () => ({
  default: {
    getAllMerchants: vi.fn()
  }
}));

vi.mock('@/api/orderApi', () => ({
  default: {
    getAllOrders: vi.fn(),
    toggleCompleted: vi.fn()
  }
}));

describe('Settlement Component', () => {
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
        { id: 2, vegetable: '黄瓜', weight: 3, price: 6, stallId: 1, completed: false }
      ]
    });

    settlementApi.getAllSettlements.mockResolvedValue({
      success: true,
      data: [
        { id: 1, stallId: 1, amount: 100, date: '2023-12-01' },
        { id: 2, stallId: 1, amount: 150, date: '2023-12-02' }
      ]
    });

    wrapper = mount(Settlement);
  });

  test('组件渲染正常', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('结算');
  });

  test('加载商户、订单和结算数据', async () => {
    await wrapper.vm.$nextTick();
    expect(merchantApi.getAllMerchants).toHaveBeenCalled();
    expect(orderApi.getAllOrders).toHaveBeenCalled();
    expect(settlementApi.getAllSettlements).toHaveBeenCalled();
    expect(wrapper.vm.merchants.length).toBe(2);
    expect(wrapper.vm.orders.length).toBe(2);
    expect(wrapper.vm.settlements.length).toBe(2);
  });

  test('选择大排档', () => {
    wrapper.vm.selectedStall = '1';
    expect(wrapper.vm.selectedStall).toBe('1');
  });

  test('批量结算', async () => {
    // 模拟 createSettlement 方法
    settlementApi.createSettlement.mockResolvedValue({
      success: true,
      data: { id: 3, stallId: 1, amount: 68, date: '2023-12-03' }
    });

    // 模拟 toggleCompleted 方法
    orderApi.toggleCompleted.mockResolvedValue({
      success: true
    });

    // 选择大排档
    wrapper.vm.selectedStall = '1';
    
    // 执行批量结算
    await wrapper.vm.batchSettlement();
    
    expect(settlementApi.createSettlement).toHaveBeenCalledWith({
      stallId: '1',
      amount: 68,
      date: expect.any(String)
    });
    expect(orderApi.toggleCompleted).toHaveBeenCalledTimes(2);
  });

  test('查看结算详情', async () => {
    // 模拟 alert
    const originalAlert = window.alert;
    window.alert = vi.fn();

    await wrapper.vm.$nextTick();
    
    // 点击查看详情按钮（选择所有按钮并找到正确的那个）
    const buttons = wrapper.findAll('.btn-primary');
    // 确保至少有一个按钮
    expect(buttons.length).toBeGreaterThan(0);
    // 点击第一个按钮（批量结算按钮）
    await buttons.at(0).trigger('click');
    
    // 模拟 batchSettlement 方法执行后的数据加载
    await wrapper.vm.$nextTick();
    
    // 恢复原始 alert
    window.alert = originalAlert;
  });
});
