<template>
  <div class="container">
    <el-input
      v-model="dyurl"
      style="width: 580px"
      :rows="2"
      type="textarea"
      placeholder="输入抖音链接"
      @change="handleDYUrl"
    />

    <el-input
      v-model="formaturl"
      style="width: 580px"
      disabled
      placeholder="解析后的抖音链接"
    />

    <el-form-item label="保存路径" class="path-selector">
      <el-input
        v-model="directoryPath"
        placeholder="请选择本地目录"
        readonly
        class="path-input"
      >
        <template #append>
          <el-button
            type="primary"
            icon="FolderOpened"
            @click="openDirectoryDialog"
          >
            选择目录
          </el-button>
        </template>
      </el-input>
    </el-form-item>

    <el-button
      type="primary"
      @click="download"
      v-loading.fullscreen.lock="fullscreenLoading"
      >下载</el-button
    >
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
// @ts-ignore
/* dyurl案例：
9.28 08/16 bNW:/ t@r.EH 【抖音商城】https://v.douyin.com/92ATSTRwUEY/ 无痕强力挂钩强力粘胶免打孔免钉粘钩浴室厨房收纳粘钩卫生间
长按复制此条消息，打开抖音搜索，查看商品详情，有机会获得大额券！
*/
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
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  flex-direction: column;
  min-height: 200px;
}

.path-input {
  width: 500px;

  :deep(.el-input-group__append) {
    padding: 0 12px;
  }
}
</style>
