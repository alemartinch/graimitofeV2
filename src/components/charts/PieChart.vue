<template>
  <div :id="id" style="width: 100%; height: 100%"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: "PieChart",
  props: {
    id: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      default: () => {},
      require: true,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.chart = echarts.init(document.getElementById(this.id));

    this.chart.setOption(this.options);
  },
};
</script>

<style scoped></style>
