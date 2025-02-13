<template>
  <div :id="id" style="width: 100%; height: 100%"></div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: "BarChart",
  props: {
    id: {
      type: String,
      required: true,
    },
    options: {
      type: Object,
      default: () => {},
      required: true,
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
  watch: {
    options() {
      this.chart.setOption(this.options);
    },
  },
};
</script>

<style scoped></style>
