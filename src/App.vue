<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <Home></Home>
    </div>
  </el-config-provider>
</template>

<script setup>
import Home from "./page/Home.vue";
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
</script>

<style>
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
}
</style>
