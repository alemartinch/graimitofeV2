<template>
  <div class="d-flex justify-end">
    <v-menu v-if="menu" bottom>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" icon plain small color="primary" :ripple="false">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-card class="pa-2 d-flex flex-column align-start">
        <v-btn
          v-for="taskAction in statusTaskActions"
          :key="taskAction.key"
          @click="setTaskStatus(taskAction.key)"
          :disabled="taskAction.disabled"
          block
          text
          small
          color="primary"
        >
          {{ taskAction.tooltip }}
        </v-btn>
        <v-btn block text small color="primary" @click="openTaskPanel"
          >Ver panel</v-btn
        >
      </v-card>
    </v-menu>
    <t-btn-icon
      v-else
      v-for="taskAction in statusTaskActions"
      :key="taskAction.key"
      :tooltip="taskAction.tooltip"
      @click="setTaskStatus(taskAction.key)"
      :disabled="taskAction.disabled"
    >
      {{ taskAction.icon }}
    </t-btn-icon>
    <v-dialog v-if="openDialog" :value="true" width="500px" persistent>
      <OccurrenceActionDialog
        :new-record-type="newRecordType"
        v-on:close="openDialog = false"
        v-on:entry-saved="updateOccurrences"
      />
    </v-dialog>
    <v-badge v-if="!menu" dot overlap :value="currentOccurrence.entries.length">
      <t-btn-icon @click="openTaskPanel">mdi-eye</t-btn-icon>
    </v-badge>
  </div>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
import { taskStatusAndRecordHandler } from "@/components/har-page/taskStatusAndRecordHandler";
import TBtnIcon from "@/components/TBtnIcon.vue";
import OccurrenceActionDialog from "@/components/har-page/OccurrenceActionDialog.vue";
import { TASK_STATUSES } from "@/mixins/globals";

export default {
  name: "OccurrenceStatusSetting",
  components: {
    OccurrenceActionDialog,
    TBtnIcon,
  },
  mixins: [taskStatusAndRecordHandler],
  props: {
    occurrence: {
      type: Object,
      required: true,
    },
    menu: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formValid: true,
      openDialog: false,
      newRecordType: "",
    };
  },

  computed: {
    currentOccurrence() {
      return this.occurrence;
    },

    currentTask() {
      return this.occurrence.repet_action;
    },

    statusTaskActions() {
      return [
        {
          key: "IN_PROGRESS",
          tooltip: "Poner tarea en progreso",
          disabled:
            !this.canModifyTaskStatus(this.currentOccurrence) ||
            this.currentOccurrence.status === TASK_STATUSES.COMPLETED ||
            this.currentOccurrence.in_progress,
          icon: "mdi-circle-slice-5",
        },
        {
          key: "COMPLETE",
          tooltip: "Completar tarea",
          disabled:
            !this.canModifyTaskStatus(this.currentOccurrence) ||
            this.currentOccurrence.status === TASK_STATUSES.COMPLETED,
          icon: "mdi-check-circle-outline",
        },
      ];
    },
  },

  methods: {
    ...mapMutations("har", ["set_occurrence", "set_task"]),
    ...mapActions("har", ["fetchOccurrences"]),

    getOccurrences() {
      this.fetchOccurrences();
    },

    setTaskStatus(key) {
      this.set_occurrence(this.currentOccurrence);
      this.set_task(this.currentOccurrence.repet_action);
      this.newRecordType = key;
      this.openDialog = true;
    },

    updateOccurrences() {
      this.fetchOccurrences();
    },

    openTaskPanel() {
      this.$router.push({
        name: `${this.$route.name}-task-occurrence-panel`,
        query: {
          taskID: this.currentOccurrence.repet_action_id,
          occurrenceID: this.currentOccurrence.id,
        },
      });
    },
  },
};
</script>
