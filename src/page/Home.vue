<template>
  <div class="container">
    <Calc></Calc>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Calc from "@/components/Calc.vue";
// @ts-ignore
</script>

<style scoped>
.container {
  overflow-x: hidden;
  overflow-y: scroll;
  height: 90vh;
  width: 96vw;
}
/* 为 Chrome、Safari 和 Opera 隐藏滚动条 */
.container::-webkit-scrollbar {
  display: none;
}

/* 为 IE、Edge 和 Firefox 隐藏滚动条 */
.container {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
