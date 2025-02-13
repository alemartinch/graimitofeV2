<template>
  <v-card :disabled="causeLoading" max-width="700">
    <v-card-title>
      {{ editCause ? "Editar Causa" : "Nueva Causa" }}
    </v-card-title>
    <v-card-subtitle v-if="fca.parent.data" class="mt-4">
      <v-row>
        <v-col
          cols="auto"
          class="pb-0 ml-2"
          style="border-left: 3px solid #4caf50"
        >
          <span class="mt-2 subtitle-2"
            >HALLAZGO {{ fca.parent.data.id }}<br
          /></span>
          <ExtendTooltip
            :text="fca.parent.data.description"
            :trunc-length="150"
          />
        </v-col>
      </v-row>
    </v-card-subtitle>
    <v-card-text style="overflow: auto; height: 460px">
      <v-form v-model="valid" ref="causeForm">
        <v-row>
          <v-col>
            <div class="body-2 my-2">Descripción de la causa</div>
            <v-textarea
              auto-grow
              v-model="cause_des"
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
        <v-row>
          <v-col>
            <div class="body-2 my-2">Tipo de causa</div>
            <v-select
              v-model="causeType"
              :items="fca.cause_types"
              return-object
              item-text="name"
              item-value="name"
              solo
              flat
              outlined
              dense
              :rules="typeRules"
            >
              <template v-slot:selection="{ item }">
                <span class="body-2 font-weight-medium">{{ item.name }}</span>
              </template>
            </v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="body-2 my-2">Subcausa</div>
            <v-select
              v-model="subcause"
              :items="getSubtypes"
              no-data-text="Seleccione un tipo de causa"
              return-object
              item-text="name"
              item-value="name"
              solo
              flat
              outlined
              dense
            >
              <template v-slot:selection="{ item }">
                <span class="body-2 font-weight-medium">{{ item.name }}</span>
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <div class="flex-grow-1"></div>
      <t-btn-secondary @click="cancelCause" :disabled="causeLoading">
        Cerrar
      </t-btn-secondary>
      <t-btn-primary
        @click="saveCause"
        :disabled="!valid"
        :loading="causeLoading"
      >
        Guardar
      </t-btn-primary>
      <t-btn-primary
        v-if="!editCause"
        outlined
        @click="saveCauseAndCreateOther"
        :loading="causeLoading"
        :disabled="!valid"
        >Guardar y generar otra
      </t-btn-primary>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapState, mapMutations } from "vuex";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "CausesLoader",
  components: { TBtnPrimary, TBtnSecondary, ExtendTooltip },

  props: {
    editCause: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      valid: false,
      causeLoading: false,
      createOtherCause: false,
      desRules: [
        (v) => !!v || "Debe completar con una descripción",
        (v) => v.length <= 1000 || "Máx. 1000 caracteres",
      ],
      typeRules: [(v) => !!v || "El tipo es requerido"],
    };
  },

  computed: {
    ...mapState(["event", "fca"]),

    getSubtypes() {
      return this.fca.temp_cause?.cause_type?.sub_causes;
    },

    cause_des: {
      get() {
        return this.fca.temp_cause?.description;
      },
      set(des) {
        this.set_causeDes(des);
      },
    },

    causeType: {
      get() {
        return this.fca.temp_cause?.cause_type;
      },
      set(causeType) {
        this.set_causeType(causeType);
      },
    },

    subcause: {
      get() {
        return this.fca.temp_cause?.sub_cause
          ? this.fca.temp_cause?.sub_cause
          : null;
      },
      set(subcause) {
        this.set_subcause(subcause);
      },
    },
  },

  methods: {
    ...mapMutations("fca", [
      "set_causeDes",
      "set_causeType",
      "reset_cause",
      "set_subcause",
    ]),

    ...mapActions(["set_alert"]),

    ...mapActions("fca", ["add_cause", "update_cause"]),

    saveCause() {
      this.causeLoading = true;
      if (!this.editCause) {
        this.addCause();
      } else {
        this.updateCause();
      }
    },

    saveCauseAndCreateOther() {
      this.createOtherCause = true;
      this.causeLoading = true;
      this.addCause();
    },

    addCause() {
      this.add_cause()
        .then((response) => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Causa creada (ID:${response.id})`,
          });
          if (this.createOtherCause) {
            this.resetCause();
          } else {
            this.cancelCause();
            this.$emit("evt-add-action", response);
          }
          this.causeLoading = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al crear la causa",
          });
          this.cancelCause();
          this.causeLoading = false;
        });
    },

    updateCause() {
      this.update_cause()
        .then((response) => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Causa editada (ID:${response.id})`,
          });
          this.cancelCause();
          this.causeLoading = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al editar la causa",
          });
          this.cancelCause();
          this.causeLoading = false;
        });
    },

    resetCause() {
      this.date = "";
      this.reset_cause();
      this.$refs.causeForm.resetValidation();
      this.createOtherCause = false;
    },

    cancelCause() {
      this.$emit("evt-close-dialog");
      this.resetCause();
    },
  },
};
</script>

<style scoped></style>
