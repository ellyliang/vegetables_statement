import axios from './axios';
import type { Settlement, ApiResponse } from '../types';

// 结算 API
const settlementApi = {
  // 获取所有结算
  getAllSettlements(): Promise<ApiResponse<Settlement[]>> {
    return axios.get('/settlements');
  },

  // 根据 ID 获取结算
  getSettlementById(id: number | string): Promise<ApiResponse<Settlement>> {
    return axios.get(`/settlements/${id}`);
  },

  // 创建结算
  createSettlement(settlement: Partial<Settlement>): Promise<ApiResponse<Settlement>> {
    return axios.post('/settlements', settlement);
  },

  // 删除结算
  deleteSettlement(id: number | string): Promise<ApiResponse<void>> {
    return axios.delete(`/settlements/${id}`);
  }
};

export default settlementApi;
