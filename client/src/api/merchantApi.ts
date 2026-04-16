import axios from './axios';
import type { Merchant, ApiResponse } from '../types';

// 商户 API
const merchantApi = {
  // 获取所有商户
  getAllMerchants(): Promise<ApiResponse<Merchant[]>> {
    return axios.get('/merchants');
  },

  // 根据 ID 获取商户
  getMerchantById(id: number | string): Promise<ApiResponse<Merchant>> {
    return axios.get(`/merchants/${id}`);
  },

  // 创建商户
  createMerchant(merchant: Partial<Merchant>): Promise<ApiResponse<Merchant>> {
    return axios.post('/merchants', merchant);
  },

  // 更新商户
  updateMerchant(id: number | string, merchant: Partial<Merchant>): Promise<ApiResponse<Merchant>> {
    return axios.put(`/merchants/${id}`, merchant);
  },

  // 删除商户
  deleteMerchant(id: number | string): Promise<ApiResponse<void>> {
    return axios.delete(`/merchants/${id}`);
  }
};

export default merchantApi;
