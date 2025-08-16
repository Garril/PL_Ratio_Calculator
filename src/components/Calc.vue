<template>
  <div class="calculator-container">
    <!-- 整体两行布局容器 -->
    <div class="two-row-container">
      <!-- 第一行：分为左右两列，基础参数在左，价格参数在右 -->
      <div class="first-row equal-height">
        <!-- 左侧：基础参数设置（3行内容） -->
        <div class="section-block basic-params">
          <h3 class="block-title">基础参数设置</h3>

          <div class="basic-content equal-height-content">
            <!-- 本金值 -->
            <div class="content-row equal-row">
              <div class="param-card full-width">
                <label>本金值 (USDT)</label>
                <el-input
                  v-model.number="form.principal"
                  size="default"
                ></el-input>
              </div>
            </div>

            <!-- 杠杆倍数 -->
            <div class="content-row equal-row">
              <div class="param-card full-width with-buttons new-layout">
                <div class="label-input-row">
                  <label>杠杆倍数</label>
                  <el-input
                    v-model.number="form.leverage"
                    size="default"
                  ></el-input>
                </div>
                <div class="button-group">
                  <el-button size="small" @click="setLeverage(3)">x3</el-button>
                  <el-button size="small" @click="setLeverage(5)">x5</el-button>
                  <el-button size="small" @click="setLeverage(10)"
                    >x10</el-button
                  >
                  <el-button size="small" @click="setLeverage(20)"
                    >x20</el-button
                  >
                  <el-button size="small" @click="setLeverage(50)"
                    >x50</el-button
                  >
                  <el-button size="small" @click="setLeverage(100)"
                    >x100</el-button
                  >
                </div>
              </div>
            </div>

            <!-- 单笔亏损比例 -->
            <div class="content-row equal-row">
              <div class="param-card full-width with-buttons new-layout">
                <div class="label-input-row">
                  <label>单笔亏损本金比例 (%)</label>
                  <el-input
                    v-model.number="form.riskPercentage"
                    size="default"
                  ></el-input>
                </div>
                <div class="button-group">
                  <el-button size="small" @click="setRiskPercentage(2)"
                    >2%</el-button
                  >
                  <el-button size="small" @click="setRiskPercentage(3)"
                    >3%</el-button
                  >
                  <el-button size="small" @click="setRiskPercentage(5)"
                    >5%</el-button
                  >
                  <el-button size="small" @click="setRiskPercentage(8)"
                    >8%</el-button
                  >
                  <el-button size="small" @click="setRiskPercentage(10)"
                    >10%</el-button
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：价格参数设置（4行内容） -->
        <div class="section-block price-params new-layout">
          <h3 class="block-title">价格参数设置</h3>

          <div class="price-content equal-height-content">
            <!-- 入场价 -->
            <div class="content-row single-item equal-row">
              <div class="param-card full-width">
                <label>入场价</label>
                <el-input
                  v-model.number="form.entryPrice"
                  size="default"
                ></el-input>
              </div>
            </div>

            <!-- SL止损价格 -->
            <div class="content-row single-item equal-row">
              <div class="param-card full-width sl-style">
                <label>SL止损价格</label>
                <el-input
                  v-model.number="form.stopLossPrice"
                  size="default"
                ></el-input>
              </div>
            </div>

            <!-- TP止盈价格 -->
            <div class="content-row single-item equal-row">
              <div class="param-card full-width tp-style">
                <label>TP止盈价格</label>
                <el-input
                  v-model.number="form.takeProfitPrice"
                  size="default"
                ></el-input>
              </div>
            </div>

            <!-- 下单保证金 -->
            <div class="content-row single-item equal-row">
              <div class="result-card full-width margin-style">
                <label>下单保证金 (USDT)</label>
                <div class="result-value">{{ margin.toFixed(6) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：计算结果 -->
      <div class="section-block results-block">
        <h3 class="block-title">计算结果</h3>

        <div class="content-row">
          <div class="result-card">
            <label>预计盈利 (USDT)</label>
            <div class="result-value profit">{{ profitAmount.toFixed(6) }}</div>
          </div>
          <div class="result-card">
            <label>预计亏损 (USDT)</label>
            <div class="result-value loss">{{ lossAmount.toFixed(6) }}</div>
          </div>
        </div>

        <div class="content-row">
          <div class="result-card">
            <label>手续费磨损 (USDT)</label>
            <div class="result-value">{{ feeCost.toFixed(6) }}</div>
          </div>
          <div class="result-card">
            <label>盈亏比</label>
            <div class="result-value ratio">
              {{ profitLossRatio.toFixed(6) }}
            </div>
          </div>
        </div>

        <div class="content-row">
          <div class="result-card">
            <label>止损距离</label>
            <div class="result-value">{{ stopLossDistance.toFixed(6) }}</div>
          </div>
          <div class="result-card">
            <label>风险敞口</label>
            <div class="result-value">{{ riskExposure.toFixed(6) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElInput, ElButton } from "element-plus";

// 定义输入表单数据
const form = ref({
  entryPrice: 1.0039, // 入场价
  stopLossPrice: 0.9966, // SL止损价格
  leverage: 10, // 杠杆倍数
  riskPercentage: 3, // 单笔预计亏损本金比例(%)
  principal: 7000, // 本金值(USDT)
  takeProfitPrice: 1.0139, // TP止盈价格
});

// 设置杠杆倍数
const setLeverage = (value) => {
  form.value.leverage = value;
};

// 设置风险比例
const setRiskPercentage = (value) => {
  form.value.riskPercentage = value;
};

// 计算属性 - 止损距离
const stopLossDistance = computed(() => {
  return Math.abs(form.value.entryPrice - form.value.stopLossPrice);
});

// 计算属性 - 风险敞口
const riskExposure = computed(() => {
  const percentage = 0.1 / 100; // 0.1%转换为小数
  return (
    (stopLossDistance.value * form.value.leverage) / form.value.entryPrice +
    percentage * form.value.leverage
  );
});

// 计算属性 - 下单保证金
const margin = computed(() => {
  return (
    (form.value.principal * (form.value.riskPercentage / 100)) /
    riskExposure.value
  );
});

// 计算属性 - 手续费磨损
const feeCost = computed(() => {
  const feeRate = 0.05 / 100; // 0.05%转换为小数
  return margin.value * form.value.leverage * feeRate * 2;
});

// 计算属性 - 预计盈利金额
const profitAmount = computed(() => {
  return (
    ((form.value.takeProfitPrice - form.value.entryPrice) /
      form.value.entryPrice) *
      margin.value *
      form.value.leverage -
    feeCost.value
  );
});

// 计算属性 - 预计亏损金额
const lossAmount = computed(() => {
  return (
    form.value.principal * (form.value.riskPercentage / 100) + feeCost.value
  );
});

// 计算属性 - 盈亏比
const profitLossRatio = computed(() => {
  return lossAmount.value === 0 ? 0 : profitAmount.value / lossAmount.value;
});
</script>

<style scoped>
.calculator-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-size: 15px;
}

/* 两行布局容器 */
.two-row-container {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 20px;
}

/* 第一行 - 分为左右两列，确保等高 */
.first-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 确保左右区块等高 */
.equal-height {
  align-items: stretch;
}

.equal-height-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 价格参数4行内容均分高度，基础参数3行内容均分高度 */
.equal-row {
  flex: 1;
  display: flex;
}

/* 区块通用样式 */
.section-block {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

/* 价格参数内容容器 */
.price-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
}

/* 基础参数内容容器 */
.basic-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
}

.block-title {
  font-size: 18px;
  margin-bottom: 15px;
  color: #409eff;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

/* 内容行样式 */
.content-row {
  display: flex;
  gap: 15px;
  margin-bottom: 0;
}

/* 单列布局样式 */
.single-item {
  flex-direction: column;
}

/* 参数卡片和结果卡片样式 */
.param-card,
.result-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.full-width {
  flex: 1 0 100%;
}

/* 确保所有文本可以被选中 */
* {
  user-select: text;
}

.param-card label,
.result-card label {
  font-size: 15px;
  color: #606266;
  margin-bottom: 8px;
}

.result-value {
  font-size: 17px;
  font-weight: 500;
  color: #303133;
}

/* 颜色编码 */
.profit,
.tp-style label,
.tp-style .el-input__inner {
  color: #67c23a;
}

.loss,
.sl-style label,
.sl-style .el-input__inner {
  color: #f56c6c;
}

.ratio {
  color: #e6a23c;
}

/* 下单保证金加粗 */
.margin-style .result-value {
  font-weight: bold;
  font-size: 19px;
}

/* 新布局样式 */
.new-layout {
  gap: 10px;
}

.label-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.label-input-row label {
  min-width: 90px;
  font-size: 15px;
}

.label-input-row .el-input {
  flex: 1;
}

.el-input__inner {
  font-size: 15px;
  padding: 8px 12px;
}

/* 按钮组样式 - 左对齐 */
.button-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.el-button--small {
  padding: 6px 12px;
  font-size: 13px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .first-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-row {
    flex-direction: column;
  }

  .label-input-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .label-input-row .el-input {
    width: 100%;
  }
}
</style>
