<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-row class="align-center">
      <v-btn
        class="ma-2"
        :x-small="parent.type !== 'event'"
        tile
        text
        color="#567990"
        @click="
          newCauseDialog = true;
          setParent();
        "
        :outlined="parent.type === 'event'"
      >
        <v-icon :small="parent.type !== 'event'" left
          >mdi-plus-box-outline</v-icon
        >
        <span class="caption"> Agregar Causa </span>
      </v-btn>
      <template v-if="activeCauses.length">
        <v-divider vertical class="mx-3" />
        <t-btn-icon @click="switchPanel">{{ switchPanelIcon }}</t-btn-icon>
      </template>
    </v-row>
    <v-expansion-panels v-model="panel" multiple :flat="!panel.length">
      <v-expansion-panel
        v-for="(cause, index) in activeCauses"
        :key="cause.id"
        class="mt-4"
        :class="panel.length ? 'cause-panel' : ''"
      >
        <v-expansion-panel-header class="py-0 px-0" hide-actions>
          <v-row class="pl-5 pr-5" justify="start">
            <v-col cols="12" md="2" align-self="center">
              <span class="font-weight-bold" style="color: #567990"
                >CAUSA ID: {{ cause.id }}</span
              >
              <v-icon
                v-show="!searchActionsCause(cause.id).length"
                x-small
                color="error"
                class="mr-5 animated pulse infinite"
                >mdi-alert-circle-outline
              </v-icon>
            </v-col>
            <v-col cols="3">
              <span class="overline">Descripción<br /></span>
              <v-tooltip bottom max-width="500">
                <template v-slot:activator="{ on }">
                  <span v-on="on">{{
                    cause.description | reduceText(30)
                  }}</span>
                </template>
                <span>{{ cause.description }}</span>
              </v-tooltip>
            </v-col>
            <v-col cols="3">
              <span class="overline">Tipo<br /></span>
              <v-tooltip bottom max-width="500">
                <template v-slot:activator="{ on }">
                  <span v-on="on">{{
                    cause.cause_type.name | reduceText(30)
                  }}</span>
                </template>
                <span>{{ cause.cause_type.name }}</span>
              </v-tooltip>
            </v-col>
            <v-col cols="3" v-if="cause.sub_cause">
              <span class="overline">Subcausa<br /></span>
              <v-tooltip bottom max-width="500">
                <template v-slot:activator="{ on }">
                  <span v-on="on">{{
                    cause.sub_cause.name | reduceText(20)
                  }}</span>
                </template>
                <span>{{ cause.sub_cause.name }}</span>
              </v-tooltip>
            </v-col>
            <v-spacer />
            <v-col cols="1" class="py-0" align-self="center">
              <t-btn-icon
                small
                tooltip="Editar Causa"
                @click.stop="editCause(cause)"
              >
                mdi-pencil
              </t-btn-icon>
              <t-btn-icon
                small
                tooltip="Eliminar Causa"
                @click.stop="openDelCauseWarning(cause, index)"
              >
                mdi-delete-outline
              </t-btn-icon>
            </v-col>
          </v-row>
        </v-expansion-panel-header>
        <v-expansion-panel-content class="pr-0">
          <ActionLoaderTable
            :parent="{ type: 'cause', id: cause.id, data: cause }"
            :actions="searchActionsCause(cause.id)"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!--CARGA DE CAUSA-->
    <v-dialog v-model="newCauseDialog" persistent max-width="600px" scrollable>
      <CausesLoader
        :editCause="editCauseFlag"
        @evt-close-dialog="closeCauseDialog"
      />
    </v-dialog>

    <GlobalPrompt :active="promptDialog" prompt-type="alert">
      <template v-slot:message>
        Se eliminará la CAUSA {{ delCauseID }} junto con todas las acciones
        asociadas a la misma.
      </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="delCauseLoading"
          @click="promptDialog = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>

      <template v-slot:accept>
        <t-btn-delete :loading="delCauseLoading" @click="deleteCause">
          Eliminar Causa
        </t-btn-delete>
      </template>
    </GlobalPrompt>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import CausesLoader from "@/components/newevent-page/EventLoader/FcaLoader/CausesLoader.vue";
import ActionLoaderTable from "@/components/newevent-page/EventLoader/FcaLoader/ActionLoaderTable.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";

export default {
  name: "CauseLoaderTable",
  components: {
    TBtnSecondary,
    TBtnDelete,
    TBtnIcon,
    ActionLoaderTable,
    CausesLoader,
    GlobalPrompt,
  },

  props: {
    parent: {
      type: Object,
    },
    causes: {
      type: Array,
    },
  },

  data() {
    return {
      panel: [],
      delPanelValue: "",
      collapse: false,
      newCauseDialog: false,
      editCauseFlag: false,
      promptDialog: false,
      delCauseLoading: false,
      delCauseID: "",
    };
  },

  created() {
    this.panel = this.panelValue;
  },

  computed: {
    ...mapState(["fca"]),

    ...mapGetters("fca", ["searchActionsCause"]),

    activeCauses() {
      return this.causes || this.fca.causes;
    },

    switchPanelIcon() {
      if (this.panel.length) {
        return "mdi-arrow-collapse-vertical";
      } else {
        return "mdi-arrow-expand-vertical";
      }
    },

    panelValue() {
      this.activeCauses.forEach((c, index) => {
        this.panel.push(index);
      });
      return this.panel;
    },
  },

  methods: {
    ...mapMutations("fca", ["set_cause", "set_parent"]),

    ...mapActions("fca", ["delete_cause"]),

    ...mapActions(["set_alert"]),

    setParent() {
      this.set_parent(this.parent);
    },

    switchPanel() {
      if (this.panel.length) {
        this.panel = [];
      } else {
        this.panel = this.panelValue;
      }
    },

    editCause(cause) {
      this.set_parent(this.parent);
      this.set_cause(cause);
      this.editCauseFlag = true;
      this.newCauseDialog = true;
    },

    closeCauseDialog() {
      this.newCauseDialog = false;
      this.editCauseFlag = false;
      this.panel.push(this.panelValue.length - 1);
    },

    openDelCauseWarning(cause, index) {
      this.delPanelValue = index === 0 ? 0 : index;
      this.promptDialog = true;
      this.delCauseID = cause.id;
    },

    deleteCause() {
      this.delCauseLoading = true;
      this.delete_cause(this.delCauseID)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Causa eliminada`,
          });
          this.promptDialog = false;
          this.delCauseLoading = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al eliminar la causa",
          });
          this.promptDialog = false;
          this.delCauseLoading = false;
        });
    },

    processPanel(tempPanel) {
      if (tempPanel.length) {
        let i = tempPanel.indexOf(this.delPanelValue);
        if (i !== -1) {
          tempPanel.splice(i, 1);
        }
        this.panel = tempPanel.map((p) => {
          if (p === 0) return 0;
          return p - 1;
        });
        this.panel = [...new Set(this.panel)];
      }
    },
  },
};
</script>

<style scoped>
.cause-panel {
  border: 1px solid #567990;
}
</style>
