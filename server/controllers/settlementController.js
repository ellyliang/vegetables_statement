import settlementModel from '../models/settlementModel.js';

// 结算控制器
const settlementController = {
  // 获取所有结算
  async getAllSettlements(ctx) {
    try {
      const settlements = await settlementModel.getAllSettlements();
      ctx.body = {
        success: true,
        data: settlements
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取结算列表失败'
      };
    }
  },

  // 根据 ID 获取结算
  async getSettlementById(ctx) {
    try {
      const id = ctx.params.id;
      const settlement = await settlementModel.getSettlementById(id);
      if (settlement) {
        ctx.body = {
          success: true,
          data: settlement
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '结算不存在'
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取结算失败'
      };
    }
  },

  // 创建结算
  async createSettlement(ctx) {
    try {
      const settlement = ctx.request.body;
      const newSettlement = await settlementModel.createSettlement(settlement);
      ctx.status = 201;
      ctx.body = {
        success: true,
        data: newSettlement
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '创建结算失败'
      };
    }
  },

  // 删除结算
  async deleteSettlement(ctx) {
    try {
      const id = ctx.params.id;
      const result = await settlementModel.deleteSettlement(id);
      if (result) {
        ctx.body = {
          success: true,
          message: '删除结算成功'
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '结算不存在'
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '删除结算失败'
      };
    }
  }
};

export default settlementController;
