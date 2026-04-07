import axios from './axios';

// 订单 API
const orderApi = {
  // 获取所有订单
  getAllOrders() {
    return axios.get('/orders');
  },

  // 根据 ID 获取订单
  getOrderById(id) {
    return axios.get(`/orders/${id}`);
  },

  // 创建订单
  createOrder(order) {
    return axios.post('/orders', order);
  },

  // 更新订单
  updateOrder(id, order) {
    return axios.put(`/orders/${id}`, order);
  },

  // 删除订单
  deleteOrder(id) {
    return axios.delete(`/orders/${id}`);
  },

  // 切换订单完成状态
  toggleCompleted(id) {
    return axios.put(`/orders/${id}/completed`);
  }
};

export default orderApi;
