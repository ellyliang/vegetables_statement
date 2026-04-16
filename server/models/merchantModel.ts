import type { Merchant } from '../types.js';

// 商户模型（内存存储）
const merchants: Merchant[] = [
  { id: 1, name: '张三大排档', address: '北京市朝阳区', contact: '13800138001' },
  { id: 2, name: '李四餐厅', address: '北京市海淀区', contact: '13900139001' }
];

// 商户模型
const merchantModel = {
  // 获取所有商户
  getAllMerchants(): Promise<Merchant[]> {
    return Promise.resolve(merchants);
  },

  // 根据 ID 获取商户
  getMerchantById(id: number | string): Promise<Merchant | undefined> {
    const merchant = merchants.find(m => m.id == (id as number));
    return Promise.resolve(merchant);
  },

  // 创建商户
  createMerchant(merchant: Omit<Merchant, 'id'>): Promise<Merchant> {
    const newId = merchants.length > 0 ? Math.max(...merchants.map(m => m.id)) + 1 : 1;
    const newMerchant: Merchant = { id: newId, ...merchant };
    merchants.push(newMerchant);
    return Promise.resolve(newMerchant);
  },

  // 更新商户
  updateMerchant(id: number | string, merchant: Partial<Merchant>): Promise<Merchant | null> {
    const index = merchants.findIndex(m => m.id == (id as number));
    if (index !== -1) {
      merchants[index] = { ...merchants[index], ...merchant };
      return Promise.resolve(merchants[index]);
    }
    return Promise.resolve(null);
  },

  // 删除商户
  deleteMerchant(id: number | string): Promise<boolean> {
    const index = merchants.findIndex(m => m.id == (id as number));
    if (index !== -1) {
      merchants.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
};

export default merchantModel;
