import axios from './axios';

// 结算 API
const settlementApi = {
  // 获取所有结算
  getAllSettlements() {
    return axios.get('/settlements');
  },

  // 根据 ID 获取结算
  getSettlementById(id) {
    return axios.get(`/settlements/${id}`);
  },

  // 创建结算
  createSettlement(settlement) {
    return axios.post('/settlements', settlement);
  },

  // 删除结算
  deleteSettlement(id) {
    return axios.delete(`/settlements/${id}`);
  }
};

export default settlementApi;
