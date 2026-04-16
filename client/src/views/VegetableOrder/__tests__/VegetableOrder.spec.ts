import { mount } from '@vue/test-utils';
import VegetableOrder from '@/views/VegetableOrder/index.vue';
import orderApi from '@/api/orderApi';
import merchantApi from '@/api/merchantApi';
// 模拟 API
vi.mock('@/api/orderApi', () => ({
  default: {
    createOrder: vi.fn(),
    getAllOrders: vi.fn(),
    updateOrder: vi.fn(),
    deleteOrder: vi.fn(),
    toggleCompleted: vi.fn()
  }
}));

vi.mock('@/api/merchantApi', () => ({
  default: {
    getAllMerchants: vi.fn()
  }
}));

describe('VegetableOrder Component', () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    // 重置模拟函数
    vi.clearAllMocks();

    // 模拟 API 返回数据
    (merchantApi.getAllMerchants as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: '张三大排档' },
        { id: 2, name: '李四餐厅' }
      ]
    });

    (orderApi.getAllOrders as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [
        { id: 1, vegetable: '西红柿', weight: 5, price: 10, stallId: 1, completed: false },
        { id: 2, vegetable: '黄瓜', weight: 3, price: 6, stallId: 1, completed: true }
      ]
    });

    // 挂载组件
    wrapper = mount(VegetableOrder);
  });

  test('组件渲染正常', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('h3').text()).toBe('蔬菜订单');
  });

  test('加载商户和订单数据', async () => {
    await wrapper.vm.$nextTick();
    expect(merchantApi.getAllMerchants).toHaveBeenCalled();
    expect(orderApi.getAllOrders).toHaveBeenCalled();
    expect((wrapper.vm as unknown as { merchants: unknown[] }).merchants.length).toBe(2);
    expect((wrapper.vm as unknown as { orders: unknown[] }).orders.length).toBe(2);
  });

  test('打开添加对话框', () => {
    wrapper.find('button').trigger('click');
    expect((wrapper.vm as unknown as { isEditing: boolean }).isEditing).toBe(true);
    expect((wrapper.vm as unknown as { currentOrder: { id: string } }).currentOrder.id).toBe('');
  });

  test('关闭对话框', () => {
    (wrapper.vm as unknown as { isEditing: boolean }).isEditing = true;
    (wrapper.vm as unknown as { closeEditDialog: () => void }).closeEditDialog();
    expect((wrapper.vm as unknown as { isEditing: boolean }).isEditing).toBe(false);
  });

  test('保存订单信息', async () => {
    // 模拟 createOrder 方法
    (orderApi.createOrder as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 3, vegetable: '土豆', weight: 10, price: 15, stallId: 1, completed: false }
    });

    // 打开添加对话框
    wrapper.find('button').trigger('click');

    // 填写表单
    (wrapper.vm as unknown as { currentOrder: Record<string, unknown> }).currentOrder = {
      id: '',
      vegetable: '土豆',
      weight: 10,
      price: 15,
      stallId: 1,
      completed: false
    };

    // 保存
    await (wrapper.vm as unknown as { saveOrder: () => Promise<void> }).saveOrder();

    expect(orderApi.createOrder).toHaveBeenCalledWith({
      id: '',
      vegetable: '土豆',
      weight: 10,
      price: 15,
      stallId: 1,
      completed: false
    });
  });

  test('删除订单', async () => {
    // 模拟 deleteOrder 方法
    (orderApi.deleteOrder as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true
    });

    await wrapper.vm.$nextTick();

    // 点击删除按钮
    const deleteButton = wrapper.findAll('.btn-default').at(0);
    await deleteButton!.trigger('click');

    expect(orderApi.deleteOrder).toHaveBeenCalledWith(1);
  });

  test('切换订单完成状态', async () => {
    // 模拟 toggleCompleted 方法
    (orderApi.toggleCompleted as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: { id: 1, completed: true }
    });

    await wrapper.vm.$nextTick();

    // 点击复选框
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.trigger('change');

    expect(orderApi.toggleCompleted).toHaveBeenCalledWith(1);
  });

  test('选择蔬菜分类', () => {
    (wrapper.vm as unknown as { selectedCategory: string }).selectedCategory = '叶菜类';
    expect((wrapper.vm as unknown as { selectedCategory: string }).selectedCategory).toBe('叶菜类');
  });

  test('选择蔬菜', () => {
    (wrapper.vm as unknown as { selectVegetable: (v: string) => void }).selectVegetable('小白菜');
    expect((wrapper.vm as unknown as { currentOrder: { vegetable: string } }).currentOrder.vegetable).toBe('小白菜');
  });
});
