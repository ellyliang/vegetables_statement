import { mount } from '@vue/test-utils';
import StallManagement from '@/views/StallManagement/index.vue';
import merchantApi from '@/api/merchantApi';
import { vi } from 'vitest';
import { describe, beforeEach, test, expect } from 'vitest';
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
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    // 重置模拟函数
    vi.clearAllMocks();

    // 模拟 getAllMerchants 方法返回数据
    (merchantApi.getAllMerchants as ReturnType<typeof vi.fn>).mockResolvedValue({
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
    expect(wrapper.find('h3').text()).toBe('大排档管理 (共 2 家)');
  });

  test('加载商户数据', async () => {
    await wrapper.vm.$nextTick();
    expect(merchantApi.getAllMerchants).toHaveBeenCalled();
    expect((wrapper.vm as unknown as { merchants: unknown[] }).merchants.length).toBe(2);
  });

  test('打开添加对话框', () => {
    wrapper.find('button').trigger('click');
    expect((wrapper.vm as unknown as { isEditing: boolean }).isEditing).toBe(true);
    expect((wrapper.vm as unknown as { currentMerchant: { id: string } }).currentMerchant.id).toBe('');
  });

  test('关闭对话框', () => {
    (wrapper.vm as unknown as { isEditing: boolean }).isEditing = true;
    (wrapper.vm as unknown as { closeEditDialog: () => void }).closeEditDialog();
    expect((wrapper.vm as unknown as { isEditing: boolean }).isEditing).toBe(false);
  });

  test('保存商户信息', async () => {
    // 模拟 createMerchant 方法
    (merchantApi.createMerchant as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 3, name: '新大排档', address: '北京市西城区', contact: '13700137001' }
    });

    // 打开添加对话框
    wrapper.find('button').trigger('click');

    // 填写表单
    (wrapper.vm as unknown as { currentMerchant: Record<string, string> }).currentMerchant = {
      id: '',
      name: '新大排档',
      address: '北京市西城区',
      contact: '13700137001'
    };

    // 保存
    await (wrapper.vm as unknown as { saveMerchant: () => Promise<void> }).saveMerchant();

    expect(merchantApi.createMerchant).toHaveBeenCalledWith({
      id: '',
      name: '新大排档',
      address: '北京市西城区',
      contact: '13700137001'
    });
  });

  test('删除商户', async () => {
    // 模拟 deleteMerchant 方法
    (merchantApi.deleteMerchant as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true
    });

    await wrapper.vm.$nextTick();

    // 点击删除按钮
    const deleteButton = wrapper.findAll('.btn-default')[1];
    await deleteButton!.trigger('click');

    expect(merchantApi.deleteMerchant).toHaveBeenCalledWith(1);
  });

  test('页面标题包含“管理”两个字', () => {
    const title = wrapper.find('h3').text();
    expect(title).toContain('管理');
  })

  test('显示商户总数', async () => {
    await wrapper.vm.$nextTick();
    const vm = wrapper.vm as any;
    console.log('商户总数:', vm.merchantsCount);
    expect(vm.merchantsCount).toBe(2);  // beforeEach 里有 2 条假数据
  });

  test('渲染的行数与数据条数一致', async () => {
    await wrapper.vm.$nextTick();
    const rows = wrapper.findAll('.merchant-item');
    expect(rows.length).toBe(2);  // beforeEach 里有 2 条假数据
  })
});
