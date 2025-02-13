<template>
  <v-card class="mt-3" @click="resolveAction()">
    <v-card-title class="text-button" style="color: #449cc9">
      ACCIÓN {{ action.id }}
      <v-spacer />
      <v-icon :class="getActionStatusColor(action.status).color"
        >mdi-circle
      </v-icon>
      <v-icon
        v-if="
          action.effectiveness &&
          action.status !== '20PEND' &&
          action.status !== '10ODUE'
        "
        small
        :class="getActionStatusColor(action.status).color"
        >mdi-alpha-e-circle-outline
      </v-icon>
    </v-card-title>
    <v-card-text>
      <div>
        <span class="font-weight-bold">Responsable: </span
        >{{ action.owner | fullName }}
      </div>
      <div>
        <span class="font-weight-bold">Vencimiento: </span
        >{{ action.due_date | fechaDiaMesAnio }}
        <v-icon v-if="action.original_due_date" x-small class="blue--text"
          >mdi-calendar-arrow-right</v-icon
        >
      </div>
      <div>
        <span class="font-weight-bold">Evento: </span
        >{{ action.parent_event.id }}
        {{ event.eventOrigins[action.parent_event.event_origin].abbr }}
      </div>
      <div>
        <span class="font-weight-bold">Descripción: </span
        >{{ action.description }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { ACTION_STATUSES as AS } from "@/mixins/globals";

export default {
  name: "ActionMbItem",
  props: {
    action: {
      type: Object,
      require: true,
    },
  },
  computed: {
    ...mapState(["event"]),
  },

  methods: {
    ...mapMutations("fca", ["set_action"]),

    getActionStatusColor(status) {
      switch (status) {
        case AS.PENDING:
          return { color: "orange--text", name: "Pendiente" };
        case AS.OVERDUE:
          return { color: "red--text", name: "Vencida" };
        case AS.COMPLETED:
          return { color: "green--text", name: "Completada" };
        case AS.EF_COMPLETED:
          return { color: "green--text", name: "Eff. Completada" };
        case AS.EF_PENDING:
          return { color: "orange--text", name: "Eff. Pendiente" };
        case AS.EF_OVERDUE:
          return { color: "red--text", name: "Eff. Vencida" };
        default:
          return { color: "grey--text", name: "Sin definir" };
      }
    },

    resolveAction() {
      this.set_action(this.action);
      this.$emit("show-action-resume");
    },
  },
};
</script>

<style scoped></style>
