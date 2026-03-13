import { createApp } from 'vue';
import App from './App.vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

let instance = null;

function render(props = {}) {
  const { container } = props;
  instance = createApp(App);
  instance.use(ElementPlus);
  instance.mount(container ? container.querySelector('#app') : '#app');
}

if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log('order-info bootstraped');
}

export async function mount(props) {
  console.log('order-info mounted', props);
  render(props);
}

export async function unmount() {
  console.log('order-info unmounted');
  instance.unmount();
  instance = null;
}
