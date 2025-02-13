<template>
  <ChartCardBase title="Eventos por planta">
    <template v-slot:list>
      <div class="px-15 pt-5">
        <v-row
          v-for="(item, i) in sortData"
          :key="i"
          class="justify-space-between"
          :class="i === 0 ? 'text-h5' : ''"
        >
          <v-col>{{ item.facility }}</v-col>
          <v-col class="text-right align-self-center">{{ item.Total }}</v-col>
        </v-row>
      </div>
    </template>
    <template v-slot:bars-chart>
      <v-chart :options="barChartOptions" />
    </template>
    <template v-slot:pie-chart>
      <v-chart :options="pieChartOptions" />
    </template>
  </ChartCardBase>
</template>

<script>
import ChartCardBase from "@/components/reports-page/ChartCardBase.vue";
import Echart from "vue-echarts";
import * as echarts from 'echarts';

export default {
  name: "EventsByFacility",
  components: { ChartCardBase, "v-chart": Echart },
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
        { facility: "Predio Rosario", Total: 12, Abiertos: 5, Cerrados: 7 },
        { facility: "Predio Alvear", Total: 24, Abiertos: 9, Cerrados: 15 },
      ],
      barChartOptions: {
        color: [
          "#306d96",
          "#fac858",
          "#91cc75",
          "#ee6666",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        tooltip: {},
        legend: {
          data: ["Total", "Abiertos", "Cerrados"],
        },
        grid: {
          left: "3%",
          right: "0%",
          bottom: "4%",
          containLabel: true,
        },
        dataset: {
          // Provide data.
          dimensions: ["facility", "Total", "Abiertos", "Cerrados"],
          source: [
            { facility: "Predio Rosario", Total: 12, Abiertos: 5, Cerrados: 7 },
            { facility: "Predio Alvear", Total: 24, Abiertos: 9, Cerrados: 15 },
          ], // this.data
        },
        xAxis: {
          type: "category",
        },
        yAxis: {},
        series: [
          {
            type: "bar",
            stack: "total",
            barGap: "5%",
            label: {
              show: true,
            },
            emphasis: {
              focus: "none",
            },
          },
          {
            type: "bar",
            stack: "parcial",
            barGap: "5%",
            barWidth: 30,
            label: {
              show: true,
            },
            emphasis: {
              focus: "none",
            },
          },
          {
            type: "bar",
            stack: "parcial",
            barGap: "5%",
            label: {
              show: true,
            },
            emphasis: {
              focus: "none",
            },
          },
        ],
      },
      pieChartOptions: {
        legend: {
          orient: "horizontal",
          left: "left",
        },
        tooltip: {
          trigger: "item",
        },
        dataset: {
          // Provide data.
          dimensions: ["facility", "Total"],
          source: [
            { facility: "Predio Rosario", Total: 12, Abiertos: 5, Cerrados: 7 },
            { facility: "Predio Alvear", Total: 24, Abiertos: 9, Cerrados: 15 },
          ],
        },
        series: [
          {
            type: "pie",
            tooltip: {
              backgroundColor: "rgba(100,100,100,0.7)",
            },
            encode: {
              itemName: "facility",
              value: "Total",
            },
            label: {
              show: true,
              formatter: "{b}\n{d}%",
            },
            labelLine: {
              show: true,
            },
            radius: "60%",
            emphasis: {
              scale: true,
              scaleSize: 1,
            },
            itemStyle: {
              shadowBlur: 5,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
            center: ["50%", "55%"],
          },
        ],
      },
    };
  },
  computed: {
    sortData() {
      let sortData = this.data.slice();
      return sortData.sort(function (a, b) {
        if (a.Total < b.Total) {
          return 1;
        }
        if (a.Total > b.Total) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    },
  },
};
</script>

<style scoped>
.echarts {
  width: 90%;
  height: 100%;
}
</style>
