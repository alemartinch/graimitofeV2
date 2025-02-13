<template>
  <ChartCardBase title="Acciones completadas" no-list no-pie no-bars>
    <v-row class="ml-3">
      <v-col class="flex-grow-0">
        <ContainerChart :percent="percent" />
      </v-col>
      <v-col class="flex-grow-0">
        <div class="text-h6">
          <span class="text-h3">{{ percent }}</span
          ><span>%</span>
        </div>
        <div class="text-h5">
          [{{ data.totalActionsComplete }}/{{ data.totalActions }}]
        </div>
      </v-col>
      <v-col class="pb-0 ml-5">
        <span
          ><v-icon color="#ee6666">mdi-checkbox-blank</v-icon>Después de
          vencer</span
        >
        <span
          ><v-icon color="#306d96">mdi-checkbox-blank</v-icon>Antes de
          vencer</span
        >
        <v-chart
          :option="sunburstChartOptions"
          :update-options="{ notMerge: true }"
          @click="foo"
          class="mt-5"
        />
      </v-col>
    </v-row>
  </ChartCardBase>
</template>

<script>
import ContainerChart from "@/components/reusable/ContainerChart.vue";
import ChartCardBase from "@/components/reports-page/ChartCardBase.vue";
import VChart, { THEME_KEY } from "vue-echarts";
import * as echarts from 'echarts';

export default {
  name: "ActionsCompleted",
  components: { ContainerChart, ChartCardBase, VChart },
  provide: {
    [THEME_KEY]: "light",
  },
  props: {
    data: {
      type: Object,
      default: () => {},
      required: true,
    },
  },
  data() {
    return {
      mockData: [
        {
          name: "Antes de vencer",
          value: 70,
          children: [
            {
              name: "Pos",
              value: 23,
            },
            {
              name: "No Pos",
              value: 47,
            },
          ],
        },
        {
          name: "Despues de vencer",
          value: 17,
        },
      ],
    };
  },

  computed: {
    percent() {
      return Math.round(
        (this.data.totalActionsComplete / this.data.totalActions) * 100
      );
    },
    sunburstChartOptions() {
      return {
        color: [
          "#91cc75",
          "#306d96",
          "#ee6666",
          "#fac858",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        series: {
          type: "sunburst",
          // center: ['50%', '55%'],
          data: this.data.sunburstChart,
          sort: null,
          emphasis: {
            focus: "ancestor",
          },
          levels: [
            {},
            {
              r0: "20%",
              r: "70%",
              itemStyle: {
                borderWidth: 2,
              },
              label: {
                show: "true",
                position: "inside",
                formatter: "{c}",
                rotate: "radial",
              },
            },
            {
              r0: "70%",
              r: "95%",
              label: {
                formatter: "{b} {c}",
                position: "inside",
                rotate: "tangential",
              },
            },
          ],
        },
      };
    },
  },

  methods: {
    foo(params) {
      "v-chart".dispatchAction({
        type: "showTip",
      });
    },
  },
};
</script>

<style scoped>
.echarts {
  width: 90%;
  height: 80%;
}
</style>
