import { defineConfig, loadEnv } from 'vite'; // 导入 loadEnv
import vue from '@vitejs/plugin-vue';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()); // 使用 loadEnv 加载环境变量

  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()], // 自动导入 Element Plus 相关 API
      }),
      Components({
        resolvers: [ElementPlusResolver()], // 自动导入 Element Plus 组件
      }),
    ],
    build: {
      commonjsOptions: {
        include: /node_modules|src/, // 允许解析 CommonJS 模块
      },
      outDir: 'dist', // 打包输出目录
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 路径别名
      },
    },
    base: './', // 生产环境使用相对路径
    server: {
      port: 5173, // 开发服务器端口
      // open: true
    }
  };
});