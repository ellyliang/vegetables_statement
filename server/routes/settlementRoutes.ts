import Router from 'koa-router';
import settlementController from '../controllers/settlementController.js';

const router = new Router();

// 结算路由
router.get('/', settlementController.getAllSettlements);
router.get('/:id', settlementController.getSettlementById);
router.post('/', settlementController.createSettlement);
router.delete('/:id', settlementController.deleteSettlement);

export default router;
