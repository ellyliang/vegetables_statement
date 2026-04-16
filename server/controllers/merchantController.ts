import type { Context } from 'koa';
import merchantModel from '../models/merchantModel.js';

type RouterContext = Context & { params: Record<string, string> };

// 商户控制器
const merchantController = {
  // 获取所有商户
  async getAllMerchants(ctx: RouterContext): Promise<void> {
    try {
      const merchants = await merchantModel.getAllMerchants();
      ctx.body = {
        success: true,
        data: merchants
      };
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取商户列表失败'
      };
    }
  },

  // 根据 ID 获取商户
  async getMerchantById(ctx: RouterContext): Promise<void> {
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
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取商户失败'
      };
    }
  },

  // 创建商户
  async createMerchant(ctx: RouterContext): Promise<void> {
    try {
      const merchant = (ctx.request as unknown as { body: Record<string, string> }).body;
      const newMerchant = await merchantModel.createMerchant(merchant);
      ctx.status = 201;
      ctx.body = {
        success: true,
        data: newMerchant
      };
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '创建商户失败'
      };
    }
  },

  // 更新商户
  async updateMerchant(ctx: RouterContext): Promise<void> {
    try {
      const id = ctx.params.id;
      const merchant = (ctx.request as unknown as { body: Record<string, string> }).body;
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
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '更新商户失败'
      };
    }
  },

  // 删除商户
  async deleteMerchant(ctx: RouterContext): Promise<void> {
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
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '删除商户失败'
      };
    }
  }
};

export default merchantController;
