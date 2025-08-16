<template>
  <div class="container">
    <Calc></Calc>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import Calc from "@/components/Calc.vue";
// @ts-ignore
const dyurl =
  ref(`9.28 08/16 bNW:/ t@r.EH 【抖音商城】https://v.douyin.com/92ATSTRwUEY/ 无痕强力挂钩强力粘胶免打孔免钉粘钩浴室厨房收纳粘钩卫生间
长按复制此条消息，打开抖音搜索，查看商品详情，有机会获得大额券！`);
/* formaturl案例：
https://v.douyin.com/92ATSTRwUEY/
*/
const formaturl = ref("https://v.douyin.com/92ATSTRwUEY/");
/* D:\Picture\测试 */
const directoryPath = ref(`D:/Picture/测试`);
const fullscreenLoading = ref(false);

const openDirectoryDialog = async () => {
  try {
    // @ts-ignore
    const path = await window.electronAPI.invokeAction("open-directory-dialog");

    // 路径处理逻辑
    directoryPath.value =
      path.length > 50 ? `${path.slice(0, 25)}...${path.slice(-20)}` : path;
  } catch (err) {
    console.error("目录选择失败:", err);
    ElMessage.error("目录选择失败，请检查系统权限");
  }
};

const handleDYUrl = (e) => {
  // 匹配标准抖音短链模式（包含路径参数）
  const regex = /https:\/\/v\.douyin\.com\/[\w\/\-]+/g;

  // 执行正则匹配并提取结果
  const match = e.match(regex);
  const res = match ? match[0].trim() : "";
  formaturl.value = res;
};

const download = async () => {
  try {
    fullscreenLoading.value = true;
    // @ts-ignore
    let result = await window.electronAPI.invokeAction("download-img", {
      url: formaturl.value,
      target: directoryPath.value,
    });
    setTimeout(() => {
      fullscreenLoading.value = false;
      if (result.success) {
        ElMessage.success(`图片已保存至：${result.path}`);
      } else {
        ElMessage.error(`下载失败：${result.error}`);
      }
    }, 1500);
  } catch (err) {
    ElMessage.error(`通信错误：${err.message}`);
  }
};
</script>

<style scoped>
.container {
  overflow-x: hidden;
  overflow-y: scroll;
  height: 90vh;
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
