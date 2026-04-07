import Router from 'koa-router';
import merchantController from '../controllers/merchantController.js';

const router = new Router();

// 商户路由
router.get('/', merchantController.getAllMerchants);
router.get('/:id', merchantController.getMerchantById);
router.post('/', merchantController.createMerchant);
router.put('/:id', merchantController.updateMerchant);
router.delete('/:id', merchantController.deleteMerchant);

export default router;
