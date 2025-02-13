<template>
  <v-form :value="validPostpone" v-on:input="$emit('input', $event)">
    <v-row class="ma-0">
      <v-col cols="12" md="6" class="py-0" align-self="center">
        <div class="body-2 my-2">Fecha de postergación</div>
        <v-menu
          v-model="amenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="action_newDueDate"
              prepend-inner-icon="mdi-calendar-outline"
              solo
              flat
              outlined
              dense
              readonly
              autcomplete="off"
              v-on="on"
              :rules="dateRules"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="adate"
            @input="changeNewDueDate"
            no-title
            :allowed-dates="allowedDueDates"
          ></v-date-picker>
        </v-menu>
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col cols="12" md="12" class="py-0">
        <h4 class="body-2 my-2">Razón por la cual se posterga</h4>
        <v-textarea
          :key="1"
          class="text-body-2"
          v-model="action_postReason"
          rows="1"
          name="descripcion"
          solo
          flat
          outlined
          dense
          no-resize
          auto-grow
          :rules="reasonRules"
          @input="$emit('form-update')"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { ACTION_STATUSES as AS, INPUTS_LENGTH } from "@/mixins/globals";

export default {
  name: "ActionResumePostForm",
  props: ["validPostpone"],
  data() {
    return {
      amenu: "",
      adate: "",
      dateRules: [(v) => !!v || "La fecha de vencimiento requerida"],
      reasonRules: [
        (v) => !!v || "La razón debe ser completada",
        (v) =>
          (!!v && v.length <= INPUTS_LENGTH.REASON_POSTPONE && v.length > 0) ||
          `Max. ${INPUTS_LENGTH.REASON_POSTPONE} caracteres`,
      ],
      allowedDueDates: (v) =>
        this.fca.temp_action.status === AS.OVERDUE
          ? v > new Date().toISOString().substr(0, 10)
          : v > this.fca.temp_action.due_date,
    };
  },
  created() {
    this.edate = "";
    this.adate = "";
    this.setAction_postpone_reason("");
    this.setAction_result("");
    this.setAction_eff_validation_method("");
    this.setAction_effectiveness_date("");
  },
  computed: {
    ...mapState(["fca"]),

    adatePicker() {
      if (!this.adate) return null;
      const [year, month, day] = this.adate.split("-");
      return `${day}-${month}-${year}`;
    },

    action_newDueDate: {
      get() {
        return this.adatePicker;
      },
      set(newDueDate) {
        this.setAction_due_date(newDueDate);
      },
    },

    action_postReason: {
      get() {
        return this.fca.temp_action.postpone_reason;
      },
      set(postReason) {
        this.setAction_postpone_reason(postReason);
      },
    },
  },
  methods: {
    ...mapMutations("fca", [
      "setAction_due_date",
      "setAction_postpone_reason",
      "setAction_due_date",
      "setAction_result",
      "setAction_eff_validation_method",
      "setAction_effectiveness_date",
    ]),
    changeNewDueDate() {
      this.amenu = false;
      this.setAction_due_date(this.action_newDueDate);
    },
  },
};
</script>

<style scoped></style>
