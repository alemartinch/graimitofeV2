<template>
  <v-card class="rounded-lg" flat outlined :loading="appLoading">
    <v-card-title
      >{{ title }}
      <v-spacer />
      <t-btn-icon
        v-if="!noList"
        small
        :color="chart === 'list' ? '#42a5f5' : ''"
        @click="chart = 'list'"
      >
        mdi-format-list-bulleted
      </t-btn-icon>
      <t-btn-icon
        v-if="!noBars"
        small
        :color="chart === 'bars' ? '#42a5f5' : ''"
        @click="chart = 'bars'"
      >
        mdi-chart-bar
      </t-btn-icon>
      <t-btn-icon
        v-if="!noPie"
        small
        :color="chart === 'pie' ? '#42a5f5' : ''"
        @click="chart = 'pie'"
      >
        mdi-chart-pie
      </t-btn-icon>
    </v-card-title>
    <v-card-text v-if="!appLoading" style="overflow: auto; height: 300px">
      <template>
        <slot></slot>
      </template>
      <template>
        <slot name="header"></slot>
      </template>
      <template v-if="chart === 'list' && !noList">
        <slot name="list"></slot>
      </template>
      <template v-if="chart === 'bars' && !noBars">
        <slot name="bars-chart"></slot>
      </template>
      <template v-if="chart === 'pie' && !noPie">
        <slot name="pie-chart"></slot>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "ChartCardBase",
  components: { TBtnIcon },
  props: {
    title: {
      type: String,
      default: "",
      required: false,
    },
    noList: {
      type: Boolean,
      default: false,
    },
    noBars: {
      type: Boolean,
      default: false,
    },
    noPie: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      chart: "bars",
    };
  },
  created() {
    if (this.noList) {
      this.chart = "bars";
    } else if (this.noBars) {
      this.chart = "pie";
    }
  },

  computed: {
    ...mapState(["appLoading"]),
  },
};
</script>

<style scoped></style>
