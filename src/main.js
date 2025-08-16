// import './style.css'
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import './styles.css';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from "./router";
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App);

app.use(router);
app.use(ElementPlus, {
  locale: zhCn // 配置中文语言
});
app.mount('#app');