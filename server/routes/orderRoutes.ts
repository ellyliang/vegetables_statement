import Router from 'koa-router';
import orderController from '../controllers/orderController.js';

const router = new Router();

// 订单路由
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);
router.put('/:id/completed', orderController.toggleCompleted);

export default router;
