<template>
  <div class="d-flex align-center caption" style="opacity: 0.8">
    <span :style="{ color: har.taskStatuses[occurrence.status].color }">{{
      har.taskStatuses[occurrence.status].name
    }}</span>
    <span class="mr-1 ml-1"> • </span>
    <span class="mr-0">
      <v-icon v-if="!dense" small>mdi-calendar</v-icon>
      <span v-if="dense">{{ occurrence.due_date | fechaDiaMesAnio }}</span>
      <span v-else>{{ occurrence.due_date | fechaText }}</span>
    </span>
    <span class="mr-1 ml-1"> • </span>
    <span>
      {{
        occurrence.repet_action.facility_id
          ? occurrence.repet_action.facility.name
          : "Todos los establecimientos"
      }}</span
    >
    <span v-if="showIndicators" class="ml-1 mr-1"> • </span>
    <v-tooltip v-for="(indicator, index) in indicators" :key="index" bottom>
      <template v-slot:activator="{ on }">
        <v-icon
          v-show="indicator.show"
          small
          v-on="on"
          :color="indicator.color"
          class="mr-1"
          @click="indicator.action"
          :style="{ cursor: indicator.cursor }"
          >{{ indicator.icon }}
        </v-icon>
      </template>
      {{ indicator.tooltipMsg }}
    </v-tooltip>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { TASK_STATUSES, TIERS } from "@/mixins/globals";
import { fechaDiaMesAnio } from "@/Filters";

export default {
  name: "OccurrenceTableTaskIndicators",

  props: {
    occurrence: {
      type: Object,
      required: true,
    },
    dense: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    ...mapState(["har"]),

    taskPending() {
      return TASK_STATUSES.PENDING;
    },

    indicators() {
      return [
        {
          icon: this.isInternalRequirement
            ? "mdi-factory"
            : "mdi-scale-balance",
          color: "#153240",
          show: this.occurrence.repet_action.tier,
          tooltipMsg: this.tierIndicatorMsg,
          action: this.isMobile ? "" : this.openRegulationResume,
          cursor: "pointer",
        },
        {
          icon: "mdi-repeat",
          color: "#153240",
          show: this.occurrence.repet_action.frequency_key !== "NO",
          tooltipMsg: `Cada ${this.occurrence.repet_action.frequency_number} ${
            this.har.frequencies[this.occurrence.repet_action.frequency_key]
              .both
          }`,
          action: () => {},
          cursor: "default",
        },
        {
          icon: "mdi-bell-ring-outline",
          color: "#153240",
          show:
            this.occurrence.repet_action.extra.is_pre_warning_time &&
            this.occurrence.status === "20PEND",
          tooltipMsg: `Vence en ${this.occurrence.repet_action.extra.days_to_overdue} día/s`,
          action: () => {},
          cursor: "default",
        },
        {
          icon: "mdi-circle-slice-5",
          color: "blue",
          show: this.occurrence.in_progress,
          tooltipMsg: "Tarea en proceso",
          action: () => {},
          cursor: "default",
        },
        {
          icon: "mdi-toggle-switch-off-outline",
          color: "error",
          show: !this.occurrence.repet_action.active,
          tooltipMsg: "Tarea desactivada",
          action: () => {},
          cursor: "default",
        },
        // {
        //   icon: "mdi-hoop-house",
        //   color: "#153240",
        //   show: true,
        //   tooltipMsg:
        //     this.occurrence.repet_action.facility_id !== -1
        //       ? this.occurrence.repet_action.facility.name
        //       : "Todos los establecimientos",
        // },
      ];
    },

    showIndicators() {
      return this.indicators.some((i) => i.show);
    },

    isInternalRequirement() {
      return this.occurrence.repet_action.tier === TIERS.INTERNAL;
    },

    tierIndicatorMsg() {
      const tier = this.isInternalRequirement ? "interno" : "legal";
      const regId = this.occurrence.repet_action.regulation_id;
      return `Pertenece a un requerimiento ${tier} [R${regId}]`;
    },
  },

  methods: {
    fechaDiaMesAnio,
    openRegulationResume() {
      const regId = this.occurrence.repet_action.regulation_id;
      this.$router.push({
        name: `regulation-resume-tasks`,
        query: { id: regId },
      });
    },
  },
};
</script>
