<template>
  <ChartCardBase title="Eventos por origen y área" no-pie no-list>
    <template v-slot:bars-chart>
      <v-chart :option="barChartOptions" :update-options="{ notMerge: true }" />
    </template>
  </ChartCardBase>
</template>

<script>
import { EVENT_ORIGINS } from "@/mixins/globals";
import ChartCardBase from "@/components/reports-page/ChartCardBase.vue";
import VChart, { THEME_KEY } from "vue-echarts";
import * as echarts from 'echarts';

export default {
  name: "EventsByOriginAndPA",
  components: { ChartCardBase, VChart },
  provide: {
    [THEME_KEY]: "light",
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      mockData: [
        { origin: "GC", SySO: 12, operation: 5, quality: 7, others: 9 },
        { origin: "EC", SySO: 24, operation: 9, quality: 15 },
        { origin: "AI", SySO: 12, operation: 5, quality: 7 },
        { origin: "AE", SySO: 24, operation: 9, quality: 15 },
      ],
    };
  },

  computed: {
    dataForList() {
      return [
        {
          origin: EVENT_ORIGINS.CHANGE,
          total: 4,
          pa: [
            {
              name: "Area de gestión",
              events: 4,
            },
          ],
        },
      ];
    },
    sortData() {
      let sortData = this.data.slice();
      return sortData.sort(function (a, b) {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        // a must be equal to b
        return 0;
      });
    },
    barChartOptions() {
      return {
        legend: {},
        tooltip: {},
        grid: {
          containLabel: true,
          top: "25%",
          right: "5%",
          bottom: "5%",
          left: "5%",
        },
        dataset: {
          dimensions: [
            "Origen",
            { name: "Calidad", displayName: "Calidad" },
            { name: "Medio Ambiente", displayName: "Medio Ambiente" },
            { name: "Operacion", displayName: "Operación" },
            {
              name: "Sistema Comun de Gestion",
              displayName: "Sistema Comun de Gestion",
            },
            { name: "SySO", displayName: "SySO" },
            { name: "Otros", displayName: "Otros" },
          ],
          source: this.data,
        },
        xAxis: { type: "category" },
        yAxis: {},
        // Declare several bar series, each will be mapped
        // to a column of dataset.source by default.
        series: [
          { type: "bar" },
          { type: "bar" },
          { type: "bar" },
          { type: "bar" },
          { type: "bar" },
          { type: "bar" },
        ],
      };
    },
  },
};
</script>

<style scoped></style>
