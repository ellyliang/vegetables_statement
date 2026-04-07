import { mount } from '@vue/test-utils';
import StallManagement from '@/views/StallManagement/index.vue';
import merchantApi from '@/api/merchantApi';
import { vi, describe, test, beforeEach, expect } from 'vitest';

// 模拟 merchantApi
vi.mock('@/api/merchantApi', () => ({
  default: {
    getAllMerchants: vi.fn(),
    createMerchant: vi.fn(),
    updateMerchant: vi.fn(),
    deleteMerchant: vi.fn()
  }
}));

describe('StallManagement Component', () => {
  let wrapper;

  beforeEach(() => {
    // 重置模拟函数
    vi.clearAllMocks();

    // 模拟 getAllMerchants 方法返回数据
    merchantApi.getAllMerchants.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: '张三大排档', address: '北京市朝阳区', contact: '13800138001' },
        { id: 2, name: '李四餐厅', address: '北京市海淀区', contact: '13900139001' }
      ]
    });

    wrapper = mount(StallManagement);
  });

  test('组件渲染正常', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('大排档管理');
  });

  test('加载商户数据', async () => {
    await wrapper.vm.$nextTick();
    expect(merchantApi.getAllMerchants).toHaveBeenCalled();
    expect(wrapper.vm.merchants.length).toBe(2);
  });

  test('打开添加对话框', () => {
    wrapper.find('button').trigger('click');
    expect(wrapper.vm.isEditing).toBe(true);
    expect(wrapper.vm.currentMerchant.id).toBe('');
  });

  test('关闭对话框', () => {
    wrapper.vm.isEditing = true;
    wrapper.vm.closeEditDialog();
    expect(wrapper.vm.isEditing).toBe(false);
  });

  test('保存商户信息', async () => {
    // 模拟 createMerchant 方法
    merchantApi.createMerchant.mockResolvedValue({
      success: true,
      data: { id: 3, name: '新大排档', address: '北京市西城区', contact: '13700137001' }
    });

    // 打开添加对话框
    wrapper.find('button').trigger('click');
    
    // 填写表单
    wrapper.vm.currentMerchant = {
      id: '',
      name: '新大排档',
      address: '北京市西城区',
      contact: '13700137001'
    };

    // 保存
    await wrapper.vm.saveMerchant();
    
    expect(merchantApi.createMerchant).toHaveBeenCalledWith({
      id: '',
      name: '新大排档',
      address: '北京市西城区',
      contact: '13700137001'
    });
  });

  test('删除商户', async () => {
    // 模拟 deleteMerchant 方法
    merchantApi.deleteMerchant.mockResolvedValue({
      success: true
    });

    await wrapper.vm.$nextTick();
    
    // 点击删除按钮
    const deleteButton = wrapper.findAll('.btn-default').at(1);
    await deleteButton.trigger('click');
    
    expect(merchantApi.deleteMerchant).toHaveBeenCalledWith(1);
  });
});
