import axios from './axios';
import type { Order, ApiResponse } from '../types';

// 订单 API
const orderApi = {
  // 获取所有订单
  getAllOrders(): Promise<ApiResponse<Order[]>> {
    return axios.get('/orders');
  },

  // 根据 ID 获取订单
  getOrderById(id: number | string): Promise<ApiResponse<Order>> {
    return axios.get(`/orders/${id}`);
  },

  // 创建订单
  createOrder(order: Partial<Order>): Promise<ApiResponse<Order>> {
    return axios.post('/orders', order);
  },

  // 更新订单
  updateOrder(id: number | string, order: Partial<Order>): Promise<ApiResponse<Order>> {
    return axios.put(`/orders/${id}`, order);
  },

  // 删除订单
  deleteOrder(id: number | string): Promise<ApiResponse<void>> {
    return axios.delete(`/orders/${id}`);
  },

  // 切换订单完成状态
  toggleCompleted(id: number | string): Promise<ApiResponse<Order>> {
    return axios.put(`/orders/${id}/completed`);
  }
};

export default orderApi;
