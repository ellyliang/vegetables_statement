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
  console.log('stall-management bootstraped');
}

export async function mount(props) {
  console.log('stall-management mounted', props);
  render(props);
}

export async function unmount() {
  console.log('stall-management unmounted');
  instance.unmount();
  instance = null;
}
