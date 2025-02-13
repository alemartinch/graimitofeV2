<template>
  <v-form :value="valid" v-on:input="$emit('input', $event)" ref="actionForm">
    <!-- COMPLETAR ACCION -->
    <v-row class="ma-0">
      <v-col cols="12" class="py-0">
        <h4 class="body-2 my-2">Acción tomada</h4>
        <v-textarea
          v-model="action_result"
          :key="2"
          :readonly="disabledActionResult"
          :rules="desRules"
          class="text-body-2"
          rows="1"
          name="descripcion"
          solo
          flat
          :outlined="!disabledActionResult"
          :background-color="disabledActionResult ? '#EEE' : ''"
          dense
          no-resize
          auto-grow
          @input="$emit('form-update')"
        />
      </v-col>
    </v-row>

    <!-- EFECTIVIDAD -->
    <v-row v-if="fca.temp_action.effectiveness" class="ma-0">
      <v-col cols="12" md="12" class="py-0">
        <h4 class="body-2 my-2">Método de evaluación de efectividad</h4>
        <v-textarea
          v-model="action_effValMethod"
          :key="3"
          :readonly="!canResolveAction() && !canPostModifyActionAndEffec()"
          :rules="desRules"
          class="text-body-2"
          rows="1"
          name="evaluacion"
          solo
          flat
          :outlined="canResolveAction() || canPostModifyActionAndEffec()"
          :background-color="
            !canResolveAction() && !canPostModifyActionAndEffec() ? '#EEE' : ''
          "
          dense
          no-resize
          auto-grow
          @input="$emit('form-update')"
        />
      </v-col>
      <v-col cols="12" md="6" class="py-0">
        <div class="body-2 my-2">Fecha de evaluación de efectividad</div>
        <v-menu
          v-model="emenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          :disabled="!canModifyEffectivenessDate()"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="edatePicker"
              :append-icon="
                canModifyEffectivenessDate() ? 'mdi-calendar-outline' : ''
              "
              solo
              flat
              :outlined="canModifyEffectivenessDate()"
              dense
              readonly
              v-on="on"
              autocomplete="off"
              :rules="dateRules"
              hide-details
              :background-color="!canModifyEffectivenessDate() ? '#EEE' : ''"
            ></v-text-field>
          </template>
          <v-date-picker
            v-model="edate"
            @input="changeEffDate"
            no-title
            :allowed-dates="allowedEffeDates"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="12" md="6" align-self="center" class="pb-0">
        <slot></slot>
      </v-col>
      <v-col
        v-if="showEffectivenessResult"
        cols="12"
        md="12"
        align-self="center"
        class="pb-0"
      >
        <div class="body-2 my-2">Resultado de la efectividad</div>
        <v-chip-group
          v-model="effectiveness_result"
          mandatory
          @change="resetAndEmitUpdate"
        >
          <v-chip
            small
            filter
            :value="true"
            :disabled="!canResolveEffectiveness() && !effectiveness_result"
            >Efectiva</v-chip
          >
          <v-chip
            small
            filter
            :value="false"
            :disabled="!canResolveEffectiveness() && effectiveness_result"
            >NO Efectiva</v-chip
          >
          <span
            v-if="!effectiveness_result"
            class="caption align-self-center orange--text"
            >Si la acción no fue efectiva, debe tratarla nuevamente</span
          >
        </v-chip-group>
        <v-textarea
          v-if="!effectiveness_result"
          v-model="effectiveness_comment"
          placeholder="Comentario"
          :key="4"
          :readonly="!canResolveEffectiveness()"
          :rules="effCommentRules"
          class="text-body-2"
          rows="1"
          solo
          flat
          outlined
          dense
          no-resize
          auto-grow
          hide-details
          @input="$emit('form-update')"
        />
      </v-col>
    </v-row>
  </v-form>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import { ACTION_STATUSES, INPUTS_LENGTH } from "@/mixins/globals";

export default {
  name: "ActionResumeForm",
  mixins: [permissions],
  props: {
    valid: {
      type: Boolean,
      default: false,
    },
    effCompleted: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      emenu: "",
      edate: "",
      effResult: null,
      desRules: [
        (v) => !!v || "Acción tomada debe completarse",
        (v) =>
          (!!v && v.length <= INPUTS_LENGTH.ACTION_RESULT && v.length > 0) ||
          `Max ${INPUTS_LENGTH.ACTION_RESULT} caracteres`,
      ],
      dateRules: [(v) => !!v || "La fecha de vencimiento requerida"],
      effCommentRules: [
        (v) =>
          v.length <= INPUTS_LENGTH.ACTION_RESULT ||
          `Max ${INPUTS_LENGTH.ACTION_RESULT} caracteres`,
      ],
      allowedEffeDates: (v) => v > new Date().toISOString().substr(0, 10),
    };
  },

  created() {
    this.edate = this.fca.temp_action.effectiveness_date;
  },

  computed: {
    ...mapState(["event", "fca"]),

    disabledActionResult() {
      return !this.canResolveAction() && !this.canPostModifyActionAndEffec();
    },

    showEffectivenessResult() {
      return (
        this.effCompleted ||
        this.fca.temp_action.status === ACTION_STATUSES.EF_COMPLETED
      );
    },

    action_result: {
      get() {
        return this.fca.temp_action.action_result;
      },
      set(actionResult) {
        this.setAction_result(actionResult);
      },
    },

    action_effValMethod: {
      get() {
        return this.fca.temp_action.effectiveness_validation_method;
      },
      set(effValMethod) {
        this.setAction_eff_validation_method(effValMethod);
      },
    },

    effectiveness_result: {
      get() {
        return this.fca.temp_action.effectiveness_ok;
      },
      set(eff_result) {
        this.set_effectiveness_result(eff_result);
      },
    },

    effectiveness_comment: {
      get() {
        return this.fca.temp_action.effectiveness_result;
      },
      set(eff_comment) {
        this.set_effectiveness_comment(eff_comment);
      },
    },

    edatePicker: function () {
      if (!this.edate) return null;
      const [year, month, day] = this.edate.substr(0, 10).split("-");
      return `${day}-${month}-${year}`;
    },

    // action_effDate: {
    //   get() {
    //     let shortDate = this.fca.temp_action.effectiveness_date.substr(0, 10);
    //     const [year, month, day] = shortDate.split("-");
    //     return `${day}-${month}-${year}`;
    //     // return this.edatePicker;
    //   },
    //   set(effDate) {
    //     this.setAction_effectiveness_date(effDate);
    //   },
    // },
  },

  methods: {
    ...mapMutations("fca", [
      "set_parent",
      "set_action",
      "reset_action",
      "setAction_result",
      "setAction_completed_date",
      "setAction_eff_validation_method",
      "setAction_effectiveness_date",
      "set_effectiveness_result",
      "set_effectiveness_comment",
    ]),

    resetAndEmitUpdate() {
      if (this.effectiveness_result) {
        this.set_effectiveness_comment(null);
      }
      this.$emit("form-update");
    },

    changeEffDate() {
      this.emenu = false;
      this.setAction_effectiveness_date(this.edate);
      this.$emit("form-update");
    },
  },
};
</script>
