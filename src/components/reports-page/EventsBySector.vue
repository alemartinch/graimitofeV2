<template>
  <ChartCardBase title="Eventos por sector">
    <template v-slot:list>
      <div class="px-lg-15 pt-5">
        <v-row
          v-for="(item, i) in sortData"
          :key="i"
          class="justify-space-between"
          :class="i === 0 ? 'text-h4' : ''"
        >
          <v-col>{{ item.sector }}</v-col>
          <v-col class="text-right align-self-center">{{ item.events }}</v-col>
        </v-row>
      </div>
    </template>
    <template v-slot:bars-chart>
      <v-chart
        :option="barChartOptions"
        :update-options="{ notMerge: true }"
        ref="bar"
      />
    </template>
    <template v-slot:pie-chart>
      <v-chart
        :option="pieChartOptions"
        :update-options="{ notMerge: true }"
        ref="pie"
      />
    </template>
  </ChartCardBase>
</template>

<script>
import ChartCardBase from "@/components/reports-page/ChartCardBase.vue";
import VChart, { THEME_KEY } from "vue-echarts";
import * as echarts from 'echarts';

export default {
  name: "EventsBySector",
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
  data() {
    return {
      mockData: [
        {
          facility: "Rosario",
          statics: [
            {
              sector: "Nave 1",
              events: 3,
            },
            {
              sector: "Nave 2",
              events: 6,
            },
            {
              sector: "Nave 4",
              events: 4,
            },
          ],
        },
        {
          facility: "Alvear",
          statics: [
            {
              sector: "Playa de Iso-Tanques",
              events: 8,
            },
          ],
        },
      ],
      selected: 0,
    };
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
          "#ee6666",
          "#fac858",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        grid: {
          containLabel: true,
          top: "5%",
          right: "5%",
          bottom: "5%",
          left: "5%",
        },
        dataset: {
          source: this.data,
        },
        xAxis: [
          {
            type: "category",
            axisLabel: {
              show: true,
              interval: 0,
              formatter: (value) => {
                return value.length > 8 ? value.substring(0, 8) + "..." : value;
              },
            },
          },
        ],
        yAxis: [{ name: "Eventos" }],
        series: [
          {
            type: "bar",
            showBackground: true,
            barWidth: 35,
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
        legend: {
          show: true,
          orient: this.$vuetify.breakpoint.smAndDown
            ? "horizontal"
            : "vertical",
          top: this.$vuetify.breakpoint.smAndDown ? "0%" : "30%",
          left: this.$vuetify.breakpoint.smAndDown ? "" : "left",
          formatter: (value) => {
            return value.length > 8 ? value.substring(0, 8) + "..." : value;
          },
        },
        dataset: {
          source: this.data,
        },
        series: [
          {
            type: "pie",
            left: this.$vuetify.breakpoint.smAndDown ? "0%" : "25%",
            top: this.$vuetify.breakpoint.smAndDown ? "25%" : "0%",
            label: {
              formatter: "{b}\n{d}% ({@events})",
            },
            radius: "70%",
          },
        ],
      };
    },
  },
  methods: {
    foo(params) {
      this.$refs.pie.dispatchAction({
        type: "legendUnSelect",
        // legend name
        name: params.value.sector,
      });
      this.$refs.pie.dispatchAction({
        type: "legendInverseSelect",
      });
    },
  },
};
</script>

<style scoped></style>
