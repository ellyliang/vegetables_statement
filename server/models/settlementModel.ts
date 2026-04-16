import type { Settlement } from '../types.js';

// 结算模型（内存存储）
const settlements: Settlement[] = [
  { id: 1, stallId: 1, amount: 16, date: '2024-01-01' },
  { id: 2, stallId: 2, amount: 20, date: '2024-01-01' }
];

// 结算模型
const settlementModel = {
  // 获取所有结算
  getAllSettlements(): Promise<Settlement[]> {
    return Promise.resolve(settlements);
  },

  // 根据 ID 获取结算
  getSettlementById(id: number | string): Promise<Settlement | undefined> {
    const settlement = settlements.find(s => s.id == (id as number));
    return Promise.resolve(settlement);
  },

  // 创建结算
  createSettlement(settlement: Omit<Settlement, 'id'>): Promise<Settlement> {
    const newId = settlements.length > 0 ? Math.max(...settlements.map(s => s.id)) + 1 : 1;
    const newSettlement: Settlement = { id: newId, ...settlement };
    settlements.push(newSettlement);
    return Promise.resolve(newSettlement);
  },

  // 删除结算
  deleteSettlement(id: number | string): Promise<boolean> {
    const index = settlements.findIndex(s => s.id == (id as number));
    if (index !== -1) {
      settlements.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
};

export default settlementModel;
