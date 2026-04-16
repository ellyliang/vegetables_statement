import type { Context } from 'koa';
import orderModel from '../models/orderModel.js';

type RouterContext = Context & { params: Record<string, string> };

// 订单控制器
const orderController = {
  // 获取所有订单
  async getAllOrders(ctx: RouterContext): Promise<void> {
    try {
      const orders = await orderModel.getAllOrders();
      ctx.body = {
        success: true,
        data: orders
      };
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取订单列表失败'
      };
    }
  },

  // 根据 ID 获取订单
  async getOrderById(ctx: RouterContext): Promise<void> {
    try {
      const id = ctx.params.id;
      const order = await orderModel.getOrderById(id);
      if (order) {
        ctx.body = {
          success: true,
          data: order
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '订单不存在'
        };
      }
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '获取订单失败'
      };
    }
  },

  // 创建订单
  async createOrder(ctx: RouterContext): Promise<void> {
    try {
      const order = (ctx.request as unknown as { body: Record<string, unknown> }).body;
      const newOrder = await orderModel.createOrder(order as Parameters<typeof orderModel.createOrder>[0]);
      ctx.status = 201;
      ctx.body = {
        success: true,
        data: newOrder
      };
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '创建订单失败'
      };
    }
  },

  // 更新订单
  async updateOrder(ctx: RouterContext): Promise<void> {
    try {
      const id = ctx.params.id;
      const order = (ctx.request as unknown as { body: Record<string, unknown> }).body;
      const updatedOrder = await orderModel.updateOrder(id, order);
      if (updatedOrder) {
        ctx.body = {
          success: true,
          data: updatedOrder
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '订单不存在'
        };
      }
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '更新订单失败'
      };
    }
  },

  // 删除订单
  async deleteOrder(ctx: RouterContext): Promise<void> {
    try {
      const id = ctx.params.id;
      const result = await orderModel.deleteOrder(id);
      if (result) {
        ctx.body = {
          success: true,
          message: '删除订单成功'
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '订单不存在'
        };
      }
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '删除订单失败'
      };
    }
  },

  // 切换订单完成状态
  async toggleCompleted(ctx: RouterContext): Promise<void> {
    try {
      const id = ctx.params.id;
      const updatedOrder = await orderModel.toggleCompleted(id);
      if (updatedOrder) {
        ctx.body = {
          success: true,
          data: updatedOrder
        };
      } else {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: '订单不存在'
        };
      }
    } catch {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: '更新订单状态失败'
      };
    }
  }
};

export default orderController;
