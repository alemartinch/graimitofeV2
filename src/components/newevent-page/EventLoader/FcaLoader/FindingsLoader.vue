<template>
  <v-card :disabled="findingLoading">
    <v-card-title>
      <span class="headline">{{
        editFinding ? "Editar Hallazgo" : "Nuevo Hallazgo"
      }}</span>
    </v-card-title>
    <v-card-text>
      <v-form v-model="valid" ref="findingForm">
        <v-row>
          <v-col cols="12">
            <div class="body-2 my-2">Descripción del Hallazgo</div>
            <v-textarea
              v-model="finding_des"
              name="descripcion"
              solo
              flat
              outlined
              dense
              no-resize
              autofocus
              :rules="desRules"
            />
          </v-col>
        </v-row>
        <v-row v-if="event.temp_event.event_origin !== 'OBSV'">
          <v-col>
            <div class="body-2 my-2">Tipo de Hallazgo</div>
            <v-radio-group
              :disabled="editFinding"
              v-model="finding_dev"
              :rules="[(v) => !!v || 'El tipo de hallazgo es requerido']"
            >
              <v-radio :key="1" label="Oportunidad de Mejora" value="OM" />
              <v-radio :key="2" label="No Conformidad" value="NC" />
              <v-radio :key="3" label="No Conformidad Mayor" value="NCM" />
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col>
            <v-checkbox
              v-model="finding_behavioral"
              label="Hallazgo relacionado a una observación de conducta"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <div class="flex-grow-1"></div>
      <t-btn-secondary @click="cancelFinding" :disabled="findingLoading"
        >Cerrar
      </t-btn-secondary>
      <t-btn-primary
        @click="saveFinding"
        :disabled="!valid"
        :loading="findingLoading"
        >{{ editFinding ? "Aceptar" : "Guardar" }}
      </t-btn-primary>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { EVENT_ORIGINS } from "@/mixins/globals";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "FindingsLoader",
  components: { TBtnPrimary, TBtnSecondary },

  props: {
    editFinding: {
      type: Boolean,
      default: false,
      required: true,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      dialog: false,
      valid: false,
      findingLoading: false,
      desRules: [
        (v) => !!v || "Debe completar con una descripción",
        (v) => v.length <= 1000 || "Máx. 1000 caracteres",
      ],
    };
  },

  computed: {
    ...mapState(["event", "fca"]),

    finding_des: {
      get() {
        return this.fca.temp_finding.description;
      },
      set(des) {
        this.setFinding_des(des);
      },
    },

    finding_dev: {
      get() {
        return (
          this.fca.temp_finding.deviation.key || this.fca.temp_finding.deviation
        );
      },
      set(dev) {
        this.setFinding_dev(dev);
      },
    },

    finding_behavioral: {
      get() {
        return this.fca.temp_finding.behavioral;
      },
      set(behavioral) {
        this.setFinding_behavioral(behavioral);
      },
    },

    isAudit() {
      return (
        this.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD
      );
    },
  },

  methods: {
    ...mapMutations("fca", [
      "setFinding_des",
      "setFinding_dev",
      "setFinding_behavioral",
      "reset_finding",
      "set_parent",
    ]),

    ...mapActions(["set_alert"]),

    ...mapActions("fca", ["add_finding", "update_finding"]),

    setParent() {
      this.set_parent({ type: "event", id: this.event.temp_event.id });
    },

    saveFinding() {
      if (!this.editFinding) {
        this.addFinding();
      } else {
        this.updateFinding();
      }
    },

    addFinding() {
      this.findingLoading = true;
      this.add_finding()
        .then((finding) => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Hallazgo creado (ID:${finding.id})`,
          });
          this.findingLoading = false;
          if (
            this.event.availableFields.actions ||
            (this.isAudit && this.fca.temp_finding.deviation === "OM")
          ) {
            this.$emit("evt-add-action", finding);
          } else {
            this.$emit("evt-add-cause", finding);
          }
          this.cancelFinding();
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al crear el hallazgo",
          });
          this.cancelFinding();
          this.findingLoading = false;
        });
    },

    updateFinding() {
      this.findingLoading = true;
      this.update_finding()
        .then((response) => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Hallazgo editado (ID:${response.id})`,
          });
          this.cancelFinding();
          this.findingLoading = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al editar el hallazgo",
          });
          this.cancelFinding();
          this.findingLoading = false;
        });
    },

    cancelFinding() {
      this.$emit("evt-close-dialog");
      this.dialog = false;
      this.editFindingFlag = false;
      this.reset_finding();
      this.$refs.findingForm.resetValidation();
    },
  },
};
</script>

<style scoped>
v-expansion-panel-header {
  min-height: 64px;
}
</style>
