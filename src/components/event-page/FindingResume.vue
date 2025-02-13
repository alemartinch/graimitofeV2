<template>
  <v-dialog
    v-model="dialog"
    width="700"
    persistent
    :fullscreen="$vuetify.breakpoint.smAndDown"
    transition="isMobile ? 'dialog-bottom-transition' : ''"
  >
    <template v-slot:activator="{ on }">
      <t-btn-icon v-on="on"> mdi-eye-outline </t-btn-icon>
    </template>
    <v-card>
      <v-card-title>
        HALLAZGO {{ tFinding.id }}
        <v-spacer />
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          width="2"
          size="20"
      /></v-card-title>
      <v-alert
        v-if="!(finding.actions.length || finding.causes.length)"
        dense
        type="error"
        class="mx-6"
      >
        <v-row align="center">
          <v-col class="grow">
            {{ resolveChild().alertMsg }}
          </v-col>
          <v-col class="shrink">
            <v-btn v-if="canAddAction()" small text light @click="addAction"
              >agregar</v-btn
            >
            <v-btn v-if="canAddCause()" small text light @click="addCause"
              >agregar</v-btn
            >
          </v-col>
        </v-row>
      </v-alert>
      <v-card-subtitle
        class="my-4 mx-3 pa-3 green lighten-5 rounded"
        v-if="finding.actions.length || finding.causes.length"
      >
        <v-row class="px-3 py-2">
          <v-icon small>mdi-family-tree</v-icon><v-spacer />
          <v-btn v-if="canAddAction()" text small plain @click="addAction"
            >agregar acción</v-btn
          >
          <t-btn-secondary
            v-if="canAddCause()"
            plain
            :ripple="false"
            @click="addCause"
            >agregar causa
          </t-btn-secondary>
        </v-row>
        <div v-if="finding.actions.length" class="pa-3">
          <p
            v-for="action in finding.actions"
            :key="action.id"
            class="mb-0 text-caption"
            style="border-left: 2px orange solid"
          >
            <span class="pl-2"
              >ACCIÓN {{ action.id }} • {{ action.description | reduceText }} •
              {{ action.owner.last_name }}</span
            >
          </p>
        </div>
        <div v-else-if="finding.causes.length" class="pa-3">
          <div
            v-for="cause in finding.causes"
            :key="cause.id"
            style="border-left: 2px lightblue solid"
          >
            <span class="pl-2"
              >CAUSA {{ cause.id }} • {{ cause.cause_type.name }} •
              {{ cause.description | reduceText(40) }}
            </span>
            <p
              v-for="action in cause.actions"
              :key="action.id"
              class="ml-5 mb-0 text-caption"
              style="border-left: 2px orange solid"
            >
              <span class="pl-2"
                >ACCIÓN {{ action.id }} •
                {{ action.description | reduceText(50) }} •
                {{ action.owner.last_name }}</span
              >
            </p>
          </div>
        </div>
      </v-card-subtitle>
      <v-card-text class="mt-4">
        <DataTextFieldToggle
          :disabled="!canPostEditFinding()"
          text-area
          :key="tFinding.id"
          label="Descripción"
          :data="tFinding.description"
          v-on:value-changed="updateDescription"
          class="mb-10"
          :rules="desRules"
        />
        <DataTextFieldToggle
          v-if="event.temp_event.event_origin !== 'OBSV'"
          autocomplete
          disabled
          :key="tFinding.id + 'b'"
          label="Tipo"
          :data="resolverDevName(tFinding.deviation)"
          :items="deviations"
          v-on:value-changed="updateDev"
          class="mb-10"
        />
        <v-row v-if="finding.behavioral">
          <v-col>
            <v-checkbox
              :disabled="!canPostEditFinding()"
              v-model="behavioral"
              :value="finding.behavioral"
              dense
              label="Hallazgo relacionado a una observación de conducta"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-menu
          v-if="canPostDeleteFinding(event.temp_event, tFinding)"
          offset-y
          top
          open-on-hover
          max-width="250"
        >
          <template v-slot:activator="{ on }">
            <t-btn-delete
              v-on="on"
              @click="deleteFinding"
              :loading="deleteLoading"
              >ELIMINAR HALLAZGO</t-btn-delete
            >
          </template>
          <v-card flat class="pa-3 d-flex">
            <v-icon small color="warning">mdi-alert</v-icon>
            <span class="ml-3 text-caption"
              >Se eliminará el HALLAZGO junto con todas las causas y/o acciones
              asociadas al mismo.</span
            ></v-card
          >
        </v-menu>
        <t-btn-secondary @click="closeFindingResume"> cerrar </t-btn-secondary>
      </v-card-actions>
    </v-card>
    <v-dialog
      v-model="actionLoaderDialog"
      persistent
      max-width="600px"
      scrollable
    >
      <ActionsLoader @evt-close-dialog="getEvent" />
    </v-dialog>
    <v-dialog
      v-model="causeLoaderDialog"
      persistent
      max-width="600px"
      scrollable
    >
      <CausesLoader @evt-close-dialog="getEvent" />
    </v-dialog>
  </v-dialog>
</template>

<script>
import { eatApi } from "@/apis";
import { mapActions, mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import { EVENT_ORIGINS } from "@/mixins/globals";
import DataTextFieldToggle from "@/components/reusable/DataTextFieldToggle.vue";
import ActionsLoader from "@/components/newevent-page/EventLoader/FcaLoader/ActionsLoader.vue";
import CausesLoader from "@/components/newevent-page/EventLoader/FcaLoader/CausesLoader.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";

export default {
  name: "FindingResume",
  components: {
    TBtnDelete,
    TBtnSecondary,
    TBtnIcon,
    CausesLoader,
    ActionsLoader,
    DataTextFieldToggle,
  },
  props: {
    finding: {
      type: Object,
      required: true,
    },
  },
  mixins: [permissions],
  data() {
    return {
      tFinding: JSON.parse(JSON.stringify(this.finding)),
      dialog: false,
      actionLoaderDialog: false,
      causeLoaderDialog: false,
      loading: false,
      deleteLoading: false,
      deviations: [
        { key: "NC", name: "No conformidad" },
        { key: "NCM", name: "No conformidad mayor" },
        { key: "OM", name: "Oportunidad de mejora" },
      ],
      behavioral: false,
      desRules: [
        (v) => !!v || "Debe completar con una descripción",
        (v) => v.length <= 1000 || "Máx. 1000 caracteres",
      ],
    };
  },

  watch: {
    behavioral(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.setFinding_behavioral(newVal);
        this.updateBehavioral();
      }
    },
  },

  computed: {
    ...mapState(["event", "fca"]),
  },
  methods: {
    ...mapMutations("fca", [
      "setFinding_des",
      "set_parent",
      "setFinding_behavioral",
    ]),
    ...mapMutations("event", ["set_event"]),
    ...mapActions("fca", ["update_finding", "delete_finding"]),
    ...mapActions(["set_alert"]),

    resolveChild() {
      if (
        this.tFinding.deviation === "OM" ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION
      ) {
        return { child: "acción", alertMsg: "El hallazgo no tiene acciones" };
      } else {
        return { child: "causa", alertMsg: "El hallazgo no tiene causas" };
      }
    },

    getEvent() {
      this.actionLoaderDialog = false;
      this.causeLoaderDialog = false;
      this.loading = true;
      eatApi
        .getFetcher()
        .get(`events/full/${this.event.temp_event.id}`)
        .then((response) => {
          this.set_event(response.data.results);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    closeFindingResume() {
      this.dialog = false;
      // this.tFinding = JSON.parse(JSON.stringify(this.finding));
      this.$emit("close-findings-list");
    },

    updateDescription(description) {
      this.loading = true;
      eatApi
        .getFetcher()
        .put(`/findings/${this.tFinding.id}`, { description })
        .then(() => {
          this.tFinding.description = description;
          this.loading = false;
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El hallazgo fue editado`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No pudo editarse el hallazgo`,
          });
          this.loading = false;
        });
    },

    updateDev(deviation) {
      eatApi
        .getFetcher()
        .put(`/findings/${this.tFinding.id}`, { deviation: deviation.key })
        .then(() => {
          this.tFinding.deviation = deviation;
          this.loading = false;
          this.closeFindingResume();
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El hallazgo fue editado`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No pudo editarse el hallazgo`,
          });
          this.closeFindingResume();
          this.loading = false;
        });
    },

    updateBehavioral(behavioral) {
      this.loading = true;
      eatApi
        .getFetcher()
        .put(`/findings/${this.tFinding.id}`, { behavioral })
        .then(() => {
          this.tFinding.behavioral = behavioral;
          this.loading = false;
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El hallazgo fue editado`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No pudo editarse el hallazgo`,
          });
          this.loading = false;
        });
    },

    deleteFinding() {
      this.deleteLoading = true;
      this.delete_finding(this.tFinding.id)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Hallazgo eliminado`,
          });
          this.closeFindingResume();
          this.deleteLoading = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `El hallazgo no pudo eliminarse`,
          });
          this.closeFindingResume();
          this.deleteLoading = false;
        });
    },

    canAddAction() {
      return (
        (this.tFinding.deviation === "OM" ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION) &&
        this.canPostAddAction()
      );
    },

    canAddCause() {
      return (
        this.event.temp_event.event_origin !== EVENT_ORIGINS.OBSERVATION &&
        (this.tFinding.deviation === "NC" ||
          this.tFinding.deviation === "NCM") &&
        this.canPostAddCause()
      );
    },

    addCause() {
      this.set_parent({
        type: "finding",
        id: this.finding.id,
        data: this.finding,
      });

      this.causeLoaderDialog = true;
    },

    addAction() {
      this.set_parent({
        type: "finding",
        id: this.finding.id,
        data: this.finding,
      });
      this.actionLoaderDialog = true;
    },

    resolverDevName(deviation) {
      switch (deviation) {
        case "NC":
          return { name: "No conformidad" };
        case "NCM":
          return { name: "No conformidad mayor" };
        case "OM":
          return { name: "Oportunidad de mejora" };
      }
    },
  },
};
</script>
