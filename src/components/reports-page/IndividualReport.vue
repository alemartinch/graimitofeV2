<template>
  <v-container class="ma-0 pa-0" fluid>
    <NewIndReport />
    <v-row>
      <v-col cols="12" md="4" v-if="totalActions">
        <v-card flat>
          <v-card-title class="text-h4 d-block"
            >{{ totalActions }}
            <span class="text-overline">accion/es en total</span></v-card-title
          >
          <v-card-text style="height: 400px">
            <v-chart
              :option="pieTotalActions"
              :update-options="{ notMerge: true }"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4" v-if="completeActions">
        <v-card flat>
          <v-card-title class="text-h4 d-block"
            >{{ completeActions }}
            <span class="text-overline">accion/es completas</span></v-card-title
          >
          <v-card-text style="height: 400px">
            <v-chart
              :option="pieCompActions"
              :update-options="{ notMerge: true }"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4" v-if="effecActions">
        <v-card flat>
          <v-card-title class="text-h4 d-block"
            >{{ effecActions }}
            <span class="text-overline"
              >accion/es con efectividad</span
            ></v-card-title
          >
          <v-card-text style="height: 400px">
            <v-chart
              :option="pieEffecActions"
              :update-options="{ notMerge: true }"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" v-if="totalPenEvents">
        <v-card flat>
          <v-card-title class="text-h4 d-block"
            >{{ totalPenEvents }}
            <span class="text-overline">Eventos pendiente/s de </span>
            {{ totalEvents }}
            <span class="text-overline">eventos totales</span></v-card-title
          >
          <v-card-text style="height: 400px">
            <v-chart
              :option="piePendEvents"
              :update-options="{ notMerge: true }"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _ from "lodash";
import { mapGetters, mapState } from "vuex";
import NewIndReport from "@/components/reports-page/NewIndReport.vue";
import VChart, { THEME_KEY } from "vue-echarts";
import * as echarts from 'echarts';

export default {
  name: "IndividualReport",
  components: { NewIndReport, VChart },
  provide: {
    [THEME_KEY]: "light",
  },
  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["getIndReport"]),
    totalEvents() {
      return this.getIndReport.events;
    },
    totalPenEvents() {
      return _.sum(_.values(this.getIndReport.events_pending));
    },
    penEventsData() {
      return [
        {
          event: "Pendientes de completar",
          value: this.getIndReport.events_pending.pending_complete,
        },
        {
          event: "Pendientes de efectividad",
          value: this.getIndReport.events_pending.pending_effectiveness,
        },
        {
          event: "Pendientes de certificación",
          value: this.getIndReport.events_pending.pending_certify,
        },
      ];
    },
    totalActions() {
      return this.getIndReport.actions;
    },
    completeActions() {
      return (
        this.getIndReport.actions -
        (this.getIndReport.actions_pending +
          this.getIndReport.actions_pending_overdue)
      );
    },
    effecActions() {
      return _.sum(_.values(this.getIndReport.effectiveness_actions));
    },
    actionsData() {
      return [
        {
          actions: "Completas",
          total: this.completeActions,
        },
        {
          actions: "Pendientes",
          total: this.getIndReport.actions_pending,
        },
        {
          actions: "Vencidas",
          total: this.getIndReport.actions_pending_overdue,
        },
      ];
    },
    compActionsData() {
      return [
        {
          actions: "Después de vencida",
          total: this.getIndReport.actions_completed.after_due_date,
        },
        {
          actions: "Antes de vencida",
          total: this.getIndReport.actions_completed.before_due_date,
        },
        {
          actions: "Antes de vencimiento pospuesto",
          total: this.getIndReport.actions_completed.before_postponed_due_date,
        },
        {
          actions: "Después de vencimiento pospuesto",
          total: this.getIndReport.actions_completed.after_postponed_due_date,
        },
      ];
    },
    effecActionsData() {
      return [
        {
          actions: "Efectividad Completa",
          total:
            this.getIndReport.effectiveness_actions.effectiveness_completed,
        },
        {
          actions: "Efectividad Pendiente",
          total: this.getIndReport.effectiveness_actions.effectiveness_pending,
        },
        {
          actions: "Efectividad Vencida",
          total: this.getIndReport.effectiveness_actions.effectiveness_overdue,
        },
      ];
    },
    pieTotalActions() {
      return {
        color: [
          "#91cc75",
          "#fac858",
          "#ee6666",
          "#306d96",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        legend: {
          orient: "horizontal",
          left: "left",
        },
        tooltip: {
          trigger: "item",
        },
        dataset: {
          // Provide data.
          dimensions: ["actions", "total"],
          source: this.actionsData,
        },
        series: [
          {
            type: "pie",
            stillShowZeroSum: false,
            minShowLabelAngle: 0.001,
            tooltip: {
              backgroundColor: "rgba(100,100,100,0.7)",
            },
            encode: {
              itemName: "actions",
              value: "total",
            },
            label: {
              show: true,
              formatter: "{d}%",
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
      };
    },
    pieCompActions() {
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
        legend: {
          orient: "horizontal",
          left: "left",
        },
        tooltip: {
          trigger: "item",
        },
        dataset: {
          // Provide data.
          dimensions: ["actions", "total"],
          source: this.compActionsData,
        },
        series: [
          {
            type: "pie",
            stillShowZeroSum: false,
            minShowLabelAngle: 0.001,
            tooltip: {
              backgroundColor: "rgba(100,100,100,0.7)",
            },
            encode: {
              itemName: "actions",
              value: "total",
            },
            label: {
              show: true,
              formatter: "{d}%",
            },
            labelLine: {
              show: true,
            },
            radius: "50%",
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
      };
    },
    pieEffecActions() {
      return {
        color: [
          "#91cc75",
          "#fac858",
          "#ee6666",
          "#306d96",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        legend: {
          orient: "horizontal",
          left: "left",
        },
        tooltip: {
          trigger: "item",
        },
        dataset: {
          // Provide data.
          dimensions: ["actions", "total"],
          source: this.effecActionsData,
        },
        series: [
          {
            type: "pie",
            stillShowZeroSum: false,
            minShowLabelAngle: 0.001,
            tooltip: {
              backgroundColor: "rgba(100,100,100,0.7)",
            },
            encode: {
              itemName: "actions",
              value: "total",
            },
            label: {
              show: true,
              formatter: "{d}%",
            },
            labelLine: {
              show: true,
            },
            radius: "50%",
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
      };
    },
    piePendEvents() {
      return {
        color: [
          "#91cc75",
          "#fac858",
          "#ee6666",
          "#306d96",
          "#73c0de",
          "#3ba272",
          "#fc8452",
          "#9a60b4",
          "#ea7ccc",
        ],
        legend: {
          orient: "horizontal",
          left: "left",
        },
        tooltip: {
          trigger: "item",
        },
        dataset: {
          // Provide data.
          dimensions: ["event", "value"],
          source: this.penEventsData,
        },
        series: [
          {
            type: "pie",
            stillShowZeroSum: false,
            minShowLabelAngle: 0.001,
            tooltip: {
              backgroundColor: "rgba(100,100,100,0.7)",
            },
            encode: {
              itemName: "event",
              value: "value",
            },
            label: {
              show: true,
              formatter: "{d}%",
            },
            labelLine: {
              show: true,
            },
            radius: "50%",
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
      };
    },
  },
};
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
