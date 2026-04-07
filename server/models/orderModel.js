// 订单模型（内存存储）
let orders = [
  { id: 1, vegetable: '西红柿', weight: 5, price: 10, stallId: 1, completed: false },
  { id: 2, vegetable: '黄瓜', weight: 3, price: 6, stallId: 1, completed: true },
  { id: 3, vegetable: '土豆', weight: 10, price: 15, stallId: 2, completed: false }
];

// 订单模型
const orderModel = {
  // 获取所有订单
  getAllOrders() {
    return Promise.resolve(orders);
  },

  // 根据 ID 获取订单
  getOrderById(id) {
    const order = orders.find(o => o.id == id);
    return Promise.resolve(order);
  },

  // 创建订单
  createOrder(order) {
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const newOrder = {
      id: newId,
      ...order
    };
    orders.push(newOrder);
    return Promise.resolve(newOrder);
  },

  // 更新订单
  updateOrder(id, order) {
    const index = orders.findIndex(o => o.id == id);
    if (index !== -1) {
      orders[index] = {
        ...orders[index],
        ...order
      };
      return Promise.resolve(orders[index]);
    }
    return Promise.resolve(null);
  },

  // 删除订单
  deleteOrder(id) {
    const index = orders.findIndex(o => o.id == id);
    if (index !== -1) {
      orders.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  // 切换订单完成状态
  toggleCompleted(id) {
    const index = orders.findIndex(o => o.id == id);
    if (index !== -1) {
      orders[index].completed = !orders[index].completed;
      return Promise.resolve(orders[index]);
    }
    return Promise.resolve(null);
  }
};

export default orderModel;
