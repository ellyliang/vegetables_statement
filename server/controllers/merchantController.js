import merchantModel from '../models/merchantModel.js';

// 商户控制器
const merchantController = {
  // 获取所有商户
  async getAllMerchants(ctx) {
    try {
      const merchants = await merchantModel.getAllMerchants();
      ctx.body = {
        success: true,
        data: merchants
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取商户列表失败'
      };
    }
  },

  // 根据 ID 获取商户
  async getMerchantById(ctx) {
    try {
      const id = ctx.params.id;
      const merchant = await merchantModel.getMerchantById(id);
      if (merchant) {
        ctx.body = {
          success: true,
          data: merchant
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '商户不存在'
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取商户失败'
      };
    }
  },

  // 创建商户
  async createMerchant(ctx) {
    try {
      const merchant = ctx.request.body;
      const newMerchant = await merchantModel.createMerchant(merchant);
      ctx.status = 201;
      ctx.body = {
        success: true,
        data: newMerchant
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '创建商户失败'
      };
    }
  },

  // 更新商户
  async updateMerchant(ctx) {
    try {
      const id = ctx.params.id;
      const merchant = ctx.request.body;
      const updatedMerchant = await merchantModel.updateMerchant(id, merchant);
      if (updatedMerchant) {
        ctx.body = {
          success: true,
          data: updatedMerchant
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '商户不存在'
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '更新商户失败'
      };
    }
  },

  // 删除商户
  async deleteMerchant(ctx) {
    try {
      const id = ctx.params.id;
      const result = await merchantModel.deleteMerchant(id);
      if (result) {
        ctx.body = {
          success: true,
          message: '删除商户成功'
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '商户不存在'
        };
      }
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '删除商户失败'
      };
    }
  }
};

export default merchantController;
