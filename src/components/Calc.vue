<template>
  <div class="calculator-container">
    <div class="two-row-container">
      <!-- 第一行：基础参数和价格参数 -->
      <div class="first-row">
        <!-- 基础参数设置 -->
        <div class="section-block basic-params">
          <h3 class="block-title reduced-margin">基础参数设置</h3>

          <div class="content-row">
            <div class="param-card">
              <label>本金值 (USDT)</label>
              <el-input
                v-model="form.principal"
                size="default"
                placeholder="请输入本金值"
                @blur="handleNumberBlur('principal', 2)"
              ></el-input>
            </div>
          </div>

          <div class="content-row">
            <div class="param-card">
              <label>杠杆倍数</label>
              <div class="input-with-buttons">
                <el-input
                  v-model="form.leverage"
                  size="default"
                  placeholder="请输入杠杆倍数"
                  @blur="handleNumberBlur('leverage', 0)"
                ></el-input>
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
          </div>

          <div class="content-row">
            <div class="param-card">
              <label>单笔亏损占本金比例 (%)</label>
              <div class="input-with-buttons">
                <el-input
                  v-model="form.riskPercentage"
                  size="default"
                  placeholder="请输入比例"
                  @blur="handleNumberBlur('riskPercentage', 2)"
                ></el-input>
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
                <!-- 单笔最大亏损显示，添加公式标注 -->
                <div class="max-loss-display" v-if="maxLoss !== '等待计算'">
                  单笔最大亏损:
                  <span class="loss">{{ maxLoss }}</span> USDT
                  <el-tooltip
                    content="= 本金值 × 单笔亏损占本金比例"
                    placement="top"
                  >
                    <el-icon class="formula-icon"><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 价格参数设置 -->
        <div class="section-block price-params">
          <div class="title-with-direction">
            <h3 class="block-title">价格参数设置</h3>
            <div class="direction-indicator">
              交易方向：<span :class="directionClass">{{ directionText }}</span>
            </div>
          </div>

          <div class="content-row">
            <div class="param-card">
              <label>入场价</label>
              <el-input
                v-model="form.entryPrice"
                size="default"
                placeholder="请输入入场价"
                @blur="handlePriceBlur('entryPrice')"
              ></el-input>
            </div>
          </div>

          <div class="content-row">
            <div class="param-card sl-style">
              <label>SL止损价格</label>
              <el-input
                v-model="form.stopLossPrice"
                size="default"
                placeholder="请输入止损价格"
                @blur="handlePriceBlur('stopLossPrice')"
              ></el-input>
            </div>
          </div>

          <div class="content-row">
            <div class="param-card tp-style">
              <div class="label-with-warning">
                <label>TP止盈价格</label>
                <span v-if="showProfitWarning" class="warning-text">{{
                  profitWarningText
                }}</span>
              </div>
              <el-input
                v-model="form.takeProfitPrice"
                size="default"
                placeholder="请输入止盈价格"
                @blur="handlePriceBlur('takeProfitPrice')"
              ></el-input>
            </div>
          </div>

          <div class="content-row">
            <div class="result-card margin-style">
              <div class="label-with-icon">
                <label>下单保证金 (USDT)</label>
                <el-tooltip
                  content="= 本金值 * (单笔亏损占本金比例/100) / 风险敞口"
                  placement="top"
                >
                  <el-icon class="formula-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="result-value selectable-text">
                {{ margin }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：计算结果 -->
      <div class="section-block results-block">
        <h3 class="block-title">计算结果</h3>

        <!-- 第一行：预计止损亏损、预计止盈盈利 -->
        <div class="content-row">
          <div class="result-card">
            <div class="label-with-icon">
              <label>预计止损亏损 (USDT)</label>
              <el-tooltip
                content="= 止损距离 / 入场价 * 保证金 * 杠杆 + 手续费"
                placement="top"
              >
                <el-icon class="formula-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="result-value loss selectable-text">
              {{ lossAmount }}
            </div>
          </div>
          <div class="result-card">
            <div class="label-with-icon">
              <label>预计止盈盈利 (USDT)</label>
              <el-tooltip
                content="= 止盈距离 / 入场价 * 保证金 * 杠杆 - 手续费"
                placement="top"
              >
                <el-icon class="formula-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="result-value profit selectable-text">
              {{ profitAmount }}
            </div>
          </div>
        </div>

        <!-- 第二行：盈亏比、手续费 -->
        <div class="content-row">
          <div class="result-card">
            <div class="label-with-icon">
              <label>盈亏比</label>
              <el-tooltip
                content="= 预计止盈盈利 / 预计止损亏损"
                placement="top"
              >
                <el-icon class="formula-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="result-value ratio selectable-text">
              {{ profitLossRatio }}
            </div>
          </div>
          <div class="result-card fee-card">
            <div class="label-with-icon spec-rete">
              <div>
                <label>手续费 (USDT)</label>
                <el-tooltip
                  content="= 下单保证金 * 杠杆倍数 * 费率% * 2"
                  placement="top"
                >
                  <el-icon class="formula-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="fee-rate-input">
                <label>费率 (%)</label>
                <el-input
                  v-model="form.feeRate"
                  size="mini"
                  :precision="4"
                  @blur="handleNumberBlur('feeRate', 4)"
                ></el-input>
              </div>
            </div>
            <div class="fee-content">
              <div class="result-value selectable-text">
                {{ feeCost }}
              </div>
            </div>
          </div>
        </div>

        <!-- 第三行：止损距离、止盈距离、风险敞口 -->
        <div class="content-row three-columns">
          <div class="result-card">
            <div class="label-with-icon">
              <label>止损距离</label>
              <el-tooltip content="= |入场价 - 止损价|" placement="top">
                <el-icon class="formula-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="result-value selectable-text">
              {{ stopLossDistance }}
            </div>
          </div>
          <div class="result-card">
            <div class="label-with-icon">
              <label>止盈距离</label>
              <el-tooltip content="= |止盈价 - 入场价|" placement="top">
                <el-icon class="formula-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="result-value selectable-text">
              {{ stopProfitDistance }}
            </div>
          </div>
          <div class="result-card">
            <div class="label-with-icon">
              <label>风险敞口</label>
              <el-tooltip
                content="每1U保证金承担的亏损风险 = (止损距离 * 杠杆 / 入场价) + (0.1% * 杠杆)"
                placement="top"
              >
                <el-icon class="formula-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="result-value selectable-text">
              {{ riskExposure }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ElInput, ElButton, ElTooltip, ElIcon, ElMessage } from "element-plus";
import { InfoFilled } from "@element-plus/icons-vue";
import Decimal from "decimal.js";

// 配置Decimal全局精度和舍入模式
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// 保存配置
const saveConfigData = async () => {
  try {
    await window.electronAPI.saveConfigData({
      principal: form.value.principal,
      leverage: form.value.leverage,
      riskPercentage: form.value.riskPercentage,
      entryPrice: form.value.entryPrice,
      stopLossPrice: form.value.stopLossPrice,
      takeProfitPrice: form.value.takeProfitPrice,
      feeRate: form.value.feeRate,
    });
    ElMessage.success("配置已保存");
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

// 工具函数：安全地将值转换为Decimal，处理空值和无效值
const toDecimal = (value) => {
  if (value === null || value === undefined || value === "" || isNaN(value)) {
    return null;
  }
  if (value instanceof Decimal) {
    return value;
  }
  try {
    return new Decimal(value.toString());
  } catch (e) {
    console.error("Invalid value for Decimal conversion:", value);
    return null;
  }
};

// 工具函数：格式化显示值，最多保留6位小数，自动去除末尾零
const formatDisplay = (value, minDecimals = 1) => {
  if (!value || value === "0") return "0";

  // 最多保留6位小数
  const formatted = value.toFixed(6);
  // 去除末尾零和可能的小数点
  const trimmed = formatted.replace(/0+$/, "").replace(/\.$/, "");

  // 确保至少保留minDecimals位小数
  if (trimmed.indexOf(".") === -1 && minDecimals > 0) {
    return trimmed + "." + "0".repeat(minDecimals);
  }

  return trimmed || "0";
};

// 定义输入表单数据，新增手续费率字段
const form = ref({
  entryPrice: "", // 入场价
  stopLossPrice: "", // SL止损价格
  leverage: 10, // 杠杆倍数
  riskPercentage: 2, // 单笔亏损占本金比例(%)
  principal: "10000", // 本金值(USDT)
  takeProfitPrice: "", // TP止盈价格
  feeRate: 0.05, // 手续费率(%)，默认0.05%
});

// 加载配置
const loadConfig = async () => {
  const config = await window.electronAPI.getConfigData();
  form.value = { ...form.value, ...config };
};
onMounted(() => {
  loadConfig();
  // 直接监听document键盘事件（更可靠）
  const handleKeyDown = (e) => {
    // 同时支持Windows(Ctrl)和Mac(Command)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault(); // 阻止浏览器默认保存
      saveConfigData(); // 调用你的保存函数
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  window.electronAPI.onWindowClose(saveConfigData);
  // 组件卸载时移除监听，避免内存泄漏
  onBeforeUnmount(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });
});

// 交易方向判断
const direction = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const sl = toDecimal(form.value.stopLossPrice);

  if (!entry || !sl) return null;
  return entry.gt(sl) ? "long" : "short";
});

// 交易方向文本
const directionText = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const sl = toDecimal(form.value.stopLossPrice);

  if (!entry || !sl) return "待定";
  return direction.value === "long" ? "做多" : "做空";
});

// 交易方向样式
const directionClass = computed(() => {
  if (directionText.value === "做多") return "direction-long";
  if (directionText.value === "做空") return "direction-short";
  return "direction-pending";
});

// 是否显示止盈价格警告
const showProfitWarning = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const tp = toDecimal(form.value.takeProfitPrice);

  // 需要入场价和止盈价都已输入
  if (!entry || !tp) return false;

  // 根据交易方向和价格关系判断
  if (direction.value === "long" && tp.lt(entry)) {
    return true; // 做多，但止盈价 < 入场价
  } else if (direction.value === "short" && tp.gt(entry)) {
    return true; // 做空，但止盈价 > 入场价
  }

  return false;
});

// 止盈价格警告文本
const profitWarningText = computed(() => {
  if (!showProfitWarning.value) return "";

  return direction.value === "long"
    ? "做多，但止盈价格小于入场价"
    : "做空，但止盈价格大于入场价";
});

// 处理数字输入框失焦，确保费率显示正确
const handleNumberBlur = (field, precision) => {
  if (form.value[field] === "") return;

  const num = toDecimal(form.value[field]);
  if (num) {
    // 格式化数字，去除多余的零
    const formatted = num
      .toFixed(precision)
      .replace(/0+$/, "")
      .replace(/\.$/, "");
    form.value[field] = formatted || "0";
  }
};

// 处理价格输入框失焦
const handlePriceBlur = (field) => {
  if (form.value[field] === "") return;

  const num = toDecimal(form.value[field]);
  if (num) {
    // 保留原始输入精度，不做舍入
    form.value[field] = num.toString();
  }
};

// 设置杠杆倍数
const setLeverage = (value) => {
  form.value.leverage = value;
};

// 设置风险比例
const setRiskPercentage = (value) => {
  form.value.riskPercentage = value;
};

// 计算属性 - 止损距离（绝对值）
const stopLossDistance = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const sl = toDecimal(form.value.stopLossPrice);

  // 检查必要参数
  if (!entry || !sl) return "价格未输入";

  try {
    // 止损距离 = |入场价 - 止损价|
    const distance = entry.minus(sl).abs();

    // 仅在显示时格式化
    return formatDisplay(distance);
  } catch (e) {
    console.error("Error calculating stop loss distance:", e);
    return "计算错误";
  }
});

// 计算属性 - 止盈距离（绝对值）
const stopProfitDistance = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const tp = toDecimal(form.value.takeProfitPrice);

  // 检查必要参数
  if (!entry || !tp) return "价格未输入";

  try {
    // 止盈距离 = |止盈价 - 入场价|
    const distance = tp.minus(entry).abs();

    // 仅在显示时格式化
    return formatDisplay(distance);
  } catch (e) {
    console.error("Error calculating stop profit distance:", e);
    return "计算错误";
  }
});

// 计算属性 - 风险敞口
const riskExposure = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const sl = toDecimal(form.value.stopLossPrice);
  const leverage = toDecimal(form.value.leverage);

  // 检查必要参数
  if (!entry || !sl || !leverage) return "参数不完整";

  try {
    // 止损距离 = |入场价 - 止损价|
    const stopLoss = entry.minus(sl).abs();

    const percentage = new Decimal("0.1").div("100"); // 0.1%转换为小数
    const exposure = stopLoss
      .mul(leverage)
      .div(entry)
      .plus(percentage.mul(leverage));

    // 仅在显示时格式化
    return formatDisplay(exposure);
  } catch (e) {
    console.error("Error calculating risk exposure:", e);
    return "计算错误";
  }
});

// 计算属性 - 下单保证金
const margin = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const sl = toDecimal(form.value.stopLossPrice);
  const principal = toDecimal(form.value.principal);
  const riskPercentage = toDecimal(form.value.riskPercentage);
  const leverage = toDecimal(form.value.leverage);

  // 检查必要参数
  if (!entry || !sl || !principal || !riskPercentage || !leverage) {
    return "参数不完整";
  }

  try {
    // 止损距离 = |入场价 - 止损价|
    const stopLoss = entry.minus(sl).abs();
    const percentage = new Decimal("0.1").div("100");
    const exposure = stopLoss
      .mul(leverage)
      .div(entry)
      .plus(percentage.mul(leverage));
    const marginValue = principal.mul(riskPercentage.div("100")).div(exposure);

    // 下单保证金固定显示1位小数
    return marginValue.toFixed(1);
  } catch (e) {
    console.error("Error calculating margin:", e);
    return "计算错误";
  }
});

// 计算属性 - 手续费（使用用户输入的费率）
const feeCost = computed(() => {
  const leverage = toDecimal(form.value.leverage);
  const marginValue = toDecimal(margin.value);
  const feeRate = toDecimal(form.value.feeRate);

  // 检查必要参数
  if (!marginValue || !leverage || !feeRate || margin.value === "参数不完整") {
    return "保证金未计算";
  }

  try {
    // 手续费 = 下单保证金 * 杠杆倍数 * 费率% * 2
    const fee = marginValue.mul(leverage).mul(feeRate.div("100")).mul("2");

    // 仅在显示时格式化
    return formatDisplay(fee);
  } catch (e) {
    console.error("Error calculating fee cost:", e);
    return "计算错误";
  }
});

// 计算属性 - 预计止盈盈利
const profitAmount = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const tp = toDecimal(form.value.takeProfitPrice);
  const leverage = toDecimal(form.value.leverage);
  const marginValue = toDecimal(margin.value);
  const fee =
    feeCost.value !== "保证金未计算" ? toDecimal(feeCost.value) : null;

  // 检查必要参数
  if (
    !tp ||
    !entry ||
    !marginValue ||
    !leverage ||
    margin.value === "参数不完整"
  ) {
    return "参数不完整";
  }

  try {
    // 根据交易方向确定止盈距离的正负
    let stopProfit;
    if (direction.value === "long") {
      stopProfit = tp.minus(entry); // 做多：止盈价 - 入场价
    } else if (direction.value === "short") {
      stopProfit = entry.minus(tp); // 做空：入场价 - 止盈价
    } else {
      return "方向未确定";
    }

    // 预计盈利 = 止盈距离 / 入场价 * 保证金 * 杠杆 - 手续费
    let profit = stopProfit.div(entry).mul(marginValue).mul(leverage);

    // 减去手续费
    if (fee) {
      profit = profit.minus(fee);
    }

    return formatDisplay(profit);
  } catch (e) {
    console.error("Error calculating profit amount:", e);
    return "计算错误";
  }
});

// 计算属性 - 预计止损亏损
const lossAmount = computed(() => {
  const entry = toDecimal(form.value.entryPrice);
  const sl = toDecimal(form.value.stopLossPrice);
  const leverage = toDecimal(form.value.leverage);
  const marginValue = toDecimal(margin.value);
  const fee =
    feeCost.value !== "保证金未计算" ? toDecimal(feeCost.value) : null;

  // 检查必要参数
  if (
    !entry ||
    !sl ||
    !marginValue ||
    !leverage ||
    margin.value === "参数不完整"
  ) {
    return "参数不完整";
  }

  try {
    // 预计亏损 = 止损距离 / 入场价 * 保证金 * 杠杆 + 手续费
    const stopLoss = entry.minus(sl).abs();
    let loss = stopLoss.div(entry).mul(marginValue).mul(leverage);

    // 加上手续费
    if (fee) {
      loss = loss.plus(fee);
    }

    return formatDisplay(loss);
  } catch (e) {
    console.error("Error calculating loss amount:", e);
    return "计算错误";
  }
});

// 计算属性 - 盈亏比
const profitLossRatio = computed(() => {
  const profit = toDecimal(profitAmount.value);
  const loss = toDecimal(lossAmount.value);

  // 检查必要参数
  if (
    !profit ||
    !loss ||
    profitAmount.value === "参数不完整" ||
    lossAmount.value === "参数不完整"
  ) {
    return "等待计算";
  }

  try {
    if (loss.isZero()) {
      return "0";
    }

    const ratio = profit.div(loss);

    // 仅在显示时格式化
    return formatDisplay(ratio, 4);
  } catch (e) {
    console.error("Error calculating profit-loss ratio:", e);
    return "计算错误";
  }
});

// 计算属性 - 单笔最大亏损
const maxLoss = computed(() => {
  const principal = toDecimal(form.value.principal);
  const riskPercentage = toDecimal(form.value.riskPercentage);

  // 检查必要参数
  if (!principal || !riskPercentage) {
    return "等待计算";
  }

  try {
    // 单笔最大亏损 = 本金 × 单笔亏损占本金比例
    const loss = principal.mul(riskPercentage.div("100"));
    return formatDisplay(loss);
  } catch (e) {
    console.error("Error calculating max loss:", e);
    return "计算错误";
  }
});
</script>

<style scoped>
/* 标题与交易方向对齐 */
.title-with-direction {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.direction-indicator {
  font-size: 14px;
  color: #606266;
  margin-left: 10px;
  white-space: nowrap;
}

/* 交易方向样式 */
.direction-long {
  color: #52c41a;
  font-weight: 500;
}

.direction-short {
  color: #f5222d;
  font-weight: 500;
}

.direction-pending {
  color: #fa8c16;
}

/* 三列布局 */
.three-columns {
  gap: 10px;
}

.three-columns .result-card {
  width: 33.333%;
}

/* 单笔最大亏损显示 */
.max-loss-display {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
  padding-top: 8px;
  border-top: 1px dashed #e6e6e6;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 止盈价格警告文本样式优化 */
.label-with-warning {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.warning-text {
  color: #f5222d;
  font-size: 13px;
  font-weight: 500;
  background-color: #fff1f0;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #ffccc7;
  white-space: nowrap;
}

/* 手续费率输入框样式 */
.fee-card {
  display: flex;
  flex-direction: column;
}

.fee-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fee-rate-input {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 120px;
}

.fee-rate-input label {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.fee-rate-input .el-input {
  width: 70px;
}

.el-input--mini .el-input__inner {
  font-size: 12px;
  padding: 5px 10px;
}

/* 其他原有样式保持不变 */
.calculator-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
  font-size: 15px;
  overflow: hidden;
}

.two-row-container {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 15px;
}

.first-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.reduced-margin {
  margin-bottom: 8px !important;
}

.section-block {
  background: #f0f2f5;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.block-title {
  font-size: 17px;
  margin-bottom: 0;
  color: #409eff;
  padding-bottom: 8px;
  border-bottom: 1px solid #e6e6e6;
}

.content-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  width: 100%;
}

.content-row:last-child {
  margin-bottom: 0;
}

.param-card,
.result-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

.param-card label,
.result-card label {
  font-size: 14px;
  color: #606266;
}

.result-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.profit,
.tp-style label,
.tp-style .el-input__inner {
  color: #52c41a;
}

.loss,
.sl-style label,
.sl-style .el-input__inner {
  color: #f5222d;
}

.ratio {
  color: #fa8c16;
}

.margin-style .result-value {
  font-weight: bold;
  font-size: 18px;
}

.input-with-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.button-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.el-button--small {
  padding: 5px 10px;
  font-size: 12px;
}

.el-input__inner {
  font-size: 14px;
  padding: 7px 12px;
}

.label-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.spec-rete {
  justify-content: space-between;
}
.formula-icon {
  color: #909399;
  font-size: 16px;
  cursor: help;
  vertical-align: middle;
  margin-top: -2px;
}

.selectable-text {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.results-block {
  grid-column: 1 / -1;
}

.results-block .content-row {
  display: flex;
  gap: 15px;
}

.results-block .result-card {
  flex: 1;
  margin: 0;
}

@media (max-width: 992px) {
  .first-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .three-columns {
    flex-direction: column;
  }

  .three-columns .result-card {
    width: 100%;
  }

  .results-block .content-row {
    flex-direction: column;
  }

  .results-block .result-card {
    width: 100%;
    margin-bottom: 10px;
  }

  .results-block .result-card:last-child {
    margin-bottom: 0;
  }

  .title-with-direction {
    flex-direction: column;
    align-items: flex-start;
  }

  .direction-indicator {
    margin-top: 5px;
  }

  .fee-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .fee-rate-input {
    width: 100%;
  }

  .fee-rate-input .el-input {
    width: 100%;
  }
}
</style>
