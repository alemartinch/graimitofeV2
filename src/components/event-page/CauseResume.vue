<template>
  <v-dialog
    v-model="dialog"
    width="800"
    persistent
    scrollable
    :fullscreen="$vuetify.breakpoint.smAndDown"
    transition="isMobile ? 'dialog-bottom-transition' : ''"
  >
    <template v-slot:activator="{ on }">
      <t-btn-icon v-on="on">mdi-eye-outline</t-btn-icon>
    </template>
    <v-card>
      <v-card-title class="text-body-1">
        CAUSA {{ tCause.id }} <v-spacer />
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          width="2"
          size="20"
      /></v-card-title>
      <v-card-subtitle class="mt-4">
        <div
          v-if="tCause.parent.type === 'finding'"
          class="pa-3 green lighten-5 rounded d-flex"
        >
          <span class="mdi mdi-family-tree mdi-rotate-180 mr-2"></span>
          <div>
            <span class="subtitle-2">HALLAZGO {{ tCause.parent.id }}</span>
            <br />
            <ExtendTooltip
              :text="tCause.parent.description"
              trunc-length="200"
            />
          </div>
        </div>
        <div
          v-if="cause.actions.length"
          class="mt-3 pa-3 blue lighten-5 rounded"
        >
          <v-row class="px-3 py-2"
            ><v-icon small>mdi-family-tree</v-icon>
            <v-spacer />
            <t-btn-primary plain :ripple="false" @click="addChild"
              >agregar acción</t-btn-primary
            >
          </v-row>
          <div class="pa-3">
            <p
              v-for="action in cause.actions"
              :key="action.id"
              class="mb-0 text-caption"
              style="border-left: 2px orange solid"
            >
              <span class="pl-2"
                >A{{ action.id }} • {{ action.owner | fullName }} •
                {{ action.description | reduceText(50) }}
              </span>
            </p>
          </div>
        </div>
      </v-card-subtitle>
      <v-alert v-if="!cause.actions.length" dense type="error" class="mx-6">
        <v-row align="center">
          <v-col class="grow"> La causa no tiene acciones. </v-col>
          <v-col class="shrink">
            <t-btn-primary plain :ripple="false" @click="addChild"
              >agregar acción</t-btn-primary
            >
          </v-col>
        </v-row>
      </v-alert>
      <v-card-text class="overflow-container mt-4">
        <DataTextFieldToggle
          text-area
          :key="tCause.id"
          label="Descripción"
          :data="tCause.description"
          v-on:value-changed="updateDescription"
          class="mb-10"
          :rules="desRules"
        />
        <DataTextFieldToggle
          autocomplete
          :key="tCause.id + 'a'"
          label="Tipo"
          :data="tCause.cause_type"
          :items="fca.cause_types"
          v-on:value-changed="getSubtypes"
          class="mb-10"
        />
        <DataTextFieldToggle
          autocomplete
          :key="tCause.id + 'b'"
          label="Subtipo"
          :data="tCause.sub_cause"
          :items="sub_types"
          v-on:value-changed="updateTypes"
          :disabled="subTypeDisabled"
          class="mb-10"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-menu offset-y top open-on-hover max-width="250">
          <template v-slot:activator="{ on }">
            <t-btn-delete
              v-on="on"
              @click="deleteCause"
              :loading="deleteLoading"
              >ELIMINAR CAUSA
            </t-btn-delete>
          </template>
          <v-card flat class="pa-3 d-flex">
            <v-icon small color="warning">mdi-alert</v-icon>
            <span class="ml-3 text-caption"
              >Se eliminará la CAUSA junto con todas las acciones asociadas a la
              misma.</span
            ></v-card
          >
        </v-menu>
        <t-btn-secondary @click="closeCauseResume"> cerrar </t-btn-secondary>
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
  </v-dialog>
</template>

<script>
import DataTextFieldToggle from "@/components/reusable/DataTextFieldToggle.vue";
import { mapActions, mapMutations, mapState } from "vuex";
import { eatApi } from "@/apis";
import ActionsLoader from "@/components/newevent-page/EventLoader/FcaLoader/ActionsLoader.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
export default {
  name: "CauseResume",
  components: {
    TBtnIcon,
    TBtnSecondary,
    TBtnDelete,
    TBtnPrimary,
    ExtendTooltip,
    ActionsLoader,
    DataTextFieldToggle,
  },
  props: {
    cause: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      actionLoaderDialog: false,
      loading: false,
      deleteLoading: false,
      tCause: JSON.parse(JSON.stringify(this.cause)),
      sub_types: [],
      subTypeDisabled: true,
      desRules: [
        (v) => !!v || "Debe completar con una descripción",
        (v) => v.length <= 1000 || "Máx. 1000 caracteres",
      ],
    };
  },

  // watch: {
  //   dialog(newVal, oldVal) {
  //     if (newVal !== oldVal) {
  //       if (newVal) {
  //         this.tCause = JSON.parse(JSON.stringify(this.cause));
  //       } else {
  //         this.subTypeDisabled = true;
  //         this.$emit("close-causes-list");
  //       }
  //     }
  //   },
  // },
  computed: {
    ...mapState(["event", "fca"]),
  },
  methods: {
    ...mapMutations("fca", ["set_causeDes", "set_parent"]),
    ...mapMutations("event", ["set_event"]),
    ...mapActions("fca", ["update_cause", "delete_cause"]),
    ...mapActions(["set_alert"]),

    getEvent() {
      this.actionLoaderDialog = false;
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

    addChild() {
      this.set_parent({
        type: "cause",
        id: this.cause.id,
        data: this.cause,
      });
      this.actionLoaderDialog = true;
    },

    closeCauseResume() {
      this.dialog = false;
      // this.tCause = JSON.parse(JSON.stringify(this.cause));
      this.$emit("close-causes-list");
    },

    updateDescription(description) {
      this.loading = true;
      eatApi
        .getFetcher()
        .put(`/causes/${this.tCause.id}`, { description })
        .then(() => {
          this.tCause.description = description;
          this.loading = false;
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `La causa fue editada`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No pudo editarse la causa`,
          });
          this.loading = false;
        });
    },

    getSubtypes(causeType) {
      this.loading = true;
      eatApi
        .getFetcher()
        .get(`/cause-types/${causeType.id}`)
        .then((res) => {
          this.tCause.cause_type = JSON.parse(JSON.stringify(causeType));
          this.sub_types = res.data.results.sub_causes.slice();
          this.loading = false;
          this.subTypeDisabled = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No pudieron obtenerse los subtipos`,
          });
          this.loading = false;
          this.subTypeDisabled = false;
        });
    },

    updateTypes(sub_cause) {
      this.loading = true;
      eatApi
        .getFetcher()
        .put(`/causes/${this.tCause.id}`, {
          cause_type: this.tCause.cause_type.id,
          sub_cause: sub_cause.id,
        })
        .then(() => {
          this.tCause.sub_cause = JSON.parse(JSON.stringify(sub_cause));
          this.loading = false;
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `La causa ha sido editada`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No pudo editarse la causa`,
          });
        });
    },

    deleteCause() {
      this.deleteLoading = true;
      this.delete_cause(this.tCause.id)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Causa eliminada`,
          });
          this.closeCauseResume();
          this.deleteLoading = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `La causa no pudo eliminarse`,
          });
          this.closeCauseResume();
          this.deleteLoading = false;
        });
    },
  },
};
</script>

<style scoped>
.overflow-container {
  height: 300px;
  overflow: auto;
}
</style>
