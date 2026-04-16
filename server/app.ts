import Koa from 'koa';
import Router from 'koa-router';
import cors from './middleware/cors.js';
import merchantRoutes from './routes/merchantRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settlementRoutes from './routes/settlementRoutes.js';

const app = new Koa();
const router = new Router();

// 中间件
app.use(cors);
app.use(router.routes());
app.use(router.allowedMethods());

// 路由
router.use('/api/merchants', merchantRoutes.routes(), merchantRoutes.allowedMethods());
router.use('/api/orders', orderRoutes.routes(), orderRoutes.allowedMethods());
router.use('/api/settlements', settlementRoutes.routes(), settlementRoutes.allowedMethods());

// 启动服务器
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
