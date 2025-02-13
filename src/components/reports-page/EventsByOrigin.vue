<template>
  <ChartCardBase title="Eventos por origen">
    <template v-slot:list>
      <div class="px-15 pt-5">
        <v-row
          v-for="(item, i) in sortData"
          :key="i"
          class="justify-space-between"
          :class="i === 0 ? 'text-h4' : ''"
        >
          <v-col>{{ item.origin }}</v-col>
          <v-col class="text-right align-self-center">{{ item.events }}</v-col>
        </v-row>
      </div>
    </template>
    <template v-slot:bars-chart>
      <v-chart :option="barChartOptions" :update-options="{ notMerge: true }" />
    </template>
    <template v-slot:pie-chart>
      <v-chart :option="pieChartOptions" :update-options="{ notMerge: true }" />
    </template>
  </ChartCardBase>
</template>

<script>
import ChartCardBase from "@/components/reports-page/ChartCardBase.vue";
import VChart, { THEME_KEY } from "vue-echarts";
import * as echarts from 'echarts';

export default {
  name: "EventsByOrigin",
  components: { ChartCardBase, VChart },
  provide: {
    [THEME_KEY]: "light",
  },
  props: {
    data: {
      type: Array,
      default: () => [],
      required: true,
    },
  },
  computed: {
    sortData() {
      let sortData = this.data.slice();
      return sortData.sort(function (a, b) {
        if (a.events < b.events) {
          return 1;
        }
        if (a.events > b.events) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    },
    barChartOptions() {
      return {
        color: [
          "#306d96",
          "#91cc75",
          "#fac858",
          "#ee6666",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        tooltip: {},
        grid: {
          left: "3%",
          right: "0%",
          bottom: "0%",
          containLabel: true,
        },
        dataset: {
          // Provide data.
          source: this.data,
        },
        xAxis: {
          type: "category",
          axisLabel: {
            show: true,
            interval: 0,
          },
        },
        yAxis: { name: "Eventos" },
        series: [
          {
            type: "bar",
            barWidth: 35,
            showBackground: true,
          },
        ],
      };
    },
    pieChartOptions() {
      return {
        color: [
          "#306d96",
          "#91cc75",
          "#ee6666",
          "#fac858",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        grid: {
          left: "3%",
          right: "0%",
          bottom: "0%",
          containLabel: false,
        },
        legend: {
          orient: this.$vuetify.breakpoint.smAndDown
            ? "horizontal"
            : "vertical",
          // top: this.$vuetify.breakpoint.smAndDown ? '0%' : '20%',
          left: this.$vuetify.breakpoint.smAndDown ? "" : "left",
          formatter: (value) => {
            return value.length > 8 ? value.substring(0, 8) + "..." : value;
          },
        },
        dataset: {
          // Provide data.
          source: this.data,
        },
        series: [
          {
            type: "pie",
            radius: "70%",
            left: this.$vuetify.breakpoint.smAndDown ? "0%" : "25%",
            top: this.$vuetify.breakpoint.smAndDown ? "25%" : "0%",
            tooltip: {
              backgroundColor: "rgba(100,100,100,0.7)",
            },
            label: {
              formatter: "{b}\n{d}% ({@events})",
            },
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.echarts {
  width: 95%;
  height: 95%;
}
</style>
