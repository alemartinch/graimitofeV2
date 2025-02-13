<template>
  <v-timeline dense class="pt-0">
    <v-timeline-item
      color="white"
      fill-dot
      small
      icon="mdi-calendar-alert"
      icon-color="secondary"
      class="pb-4"
      v-if="currentAction.original_due_date"
    >
      <div class="d-flex flex-column">
        <span class="caption text--secondary">Vencimiento original</span>
        <span class="text-md-body-2 font-weight-bold">
          {{ currentAction.original_due_date | fechaText }}
        </span>
      </div>
    </v-timeline-item>
    <v-timeline-item small color="white" v-if="currentAction.original_due_date">
      <template v-slot:icon>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-icon small color="#449CC9" v-on="on"
              >mdi-calendar-arrow-right
            </v-icon>
          </template>
          La acción se pospuso al menos una vez
        </v-tooltip>
      </template>
      <span class="caption">
        <ExtendTooltip
          :text="currentAction.postpone_reason"
          :trunc-length="40"
        />
      </span>
    </v-timeline-item>
    <v-timeline-item
      color="white"
      fill-dot
      icon="mdi-calendar-alert"
      :icon-color="actionStatus"
      :small="!!currentAction.completed_date || enableEvaluationDot"
      class="pb-4"
    >
      <!--        <template v-slot:icon>-->
      <!--          <InfographicIcon icon="mdi-calendar-alert" color="orange" />-->
      <!--        </template>-->
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex flex-column">
          <span class="caption text--secondary">Vencimiento</span>
          <span class="text-md-body-2 font-weight-bold">
            {{ currentAction.due_date | fechaText }}
          </span>
        </div>
        <DatePickerMenu
          v-if="event.postEdit && canPostEditAction()"
          nudge-left="200"
          offset-y
          v-on:change-date="updateActionDueDate"
        >
          <template v-slot:default="{ activator }">
            <v-btn
              v-on="activator"
              icon
              plain
              small
              color="primary"
              :ripple="false"
              :loading="loading.updateDueDate"
            >
              <v-icon>mdi-18px mdi-calendar-edit</v-icon>
            </v-btn>
          </template>
        </DatePickerMenu>
      </div>
    </v-timeline-item>
    <v-timeline-item
      v-if="currentAction.completed_date"
      color="white"
      fill-dot
      icon="mdi-calendar-check-outline"
      icon-color="success"
      :small="currentAction.effectiveness && !!currentAction.effectiveness_date"
      :class="currentAction.effectiveness ? 'pb-4' : 'pb-0'"
    >
      <!--        <template v-slot:icon>-->
      <!--          <InfographicIcon icon="mdi-calendar-check-outline" color="success" />-->
      <!--        </template>-->
      <div class="d-flex flex-column">
        <span class="caption text--secondary">Completada el:</span>
        <span class="text-md-body-2 font-weight-bold">
          {{ currentAction.completed_date | fechaText }}
        </span>
      </div>
    </v-timeline-item>
    <v-timeline-item
      v-if="enableEvaluationDot"
      color="white"
      fill-dot
      icon="mdi-calendar-edit"
      :icon-color="effectivenessStatus"
      class="pb-0"
    >
      <div class="d-flex flex-column">
        <span class="caption text--secondary">Fecha de evaluación</span>
        <span class="text-md-body-2 font-weight-bold">
          {{ currentAction.effectiveness_date | fechaText }}
        </span>
      </div>
    </v-timeline-item>
  </v-timeline>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import { ACTION_STATUSES as AS } from "@/mixins/globals";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import DatePickerMenu from "@/components/reusable/DatePickerMenu.vue";

export default {
  name: "ActionTimeline",
  components: { DatePickerMenu, ExtendTooltip },
  mixins: [permissions],
  data() {
    return {
      loading: { updateDueDate: false },
    };
  },
  computed: {
    ...mapState(["event"]),

    currentAction() {
      return this.$store.getters["fca/getCurrentAction"];
    },

    enableEvaluationDot() {
      return [AS.EF_PENDING, AS.EF_OVERDUE, AS.EF_COMPLETED].includes(
        this.currentAction.status
      );
    },

    actionStatus() {
      switch (this.currentAction.status) {
        case AS.PENDING:
          return "orange";
        case AS.OVERDUE:
          return "error";
        case AS.COMPLETED:
          return "success";
        default:
          return "#153240";
      }
    },

    effectivenessStatus() {
      switch (this.currentAction.status) {
        case AS.EF_PENDING:
          return "orange";
        case AS.EF_OVERDUE:
          return "error";
        case AS.EF_COMPLETED:
          return "success";
        default:
          return "orange";
      }
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("fca", ["UPDATE_ACTION"]),
    ...mapActions("fca", ["update_action"]),
    updateActionDueDate(newDueDate) {
      this.loading.updateDueDate = true;
      this.update_action({ due_date: newDueDate })
        .then((resAction) => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "La acción ha sido actualizada con éxito",
          });
          this.UPDATE_ACTION(resAction);
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al actualizar la acción",
          });
        })
        .finally(() => (this.loading.updateDueDate = false));
    },
  },
};
</script>
