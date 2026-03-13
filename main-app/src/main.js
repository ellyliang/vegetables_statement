const { registerMicroApps, start } = window.qiankun;

// 注册微应用
registerMicroApps([
  {
    name: 'stall-management',
    entry: '//localhost:8084',
    container: '#micro-container',
    activeRule: '/stall-management',
  },
  {
    name: 'vegetable-order',
    entry: '//localhost:8081',
    container: '#micro-container',
    activeRule: '/vegetable-order',
  },
  {
    name: 'settlement',
    entry: '//localhost:8082',
    container: '#micro-container',
    activeRule: '/settlement',
  },
  {
    name: 'order-info',
    entry: '//localhost:8083',
    container: '#micro-container',
    activeRule: '/order-info',
  },
]);

// 启动 qiankun
start();
