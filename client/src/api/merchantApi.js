import axios from './axios';

// 商户 API
const merchantApi = {
  // 获取所有商户
  getAllMerchants() {
    return axios.get('/merchants');
  },

  // 根据 ID 获取商户
  getMerchantById(id) {
    return axios.get(`/merchants/${id}`);
  },

  // 创建商户
  createMerchant(merchant) {
    return axios.post('/merchants', merchant);
  },

  // 更新商户
  updateMerchant(id, merchant) {
    return axios.put(`/merchants/${id}`, merchant);
  },

  // 删除商户
  deleteMerchant(id) {
    return axios.delete(`/merchants/${id}`);
  }
};

export default merchantApi;
