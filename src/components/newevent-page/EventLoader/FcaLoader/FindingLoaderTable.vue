<template>
  <v-container class="ma-0 pa-0" fluid>
    <v-row class="align-center mb-4">
      <v-btn
        class="ma-2"
        tile
        text
        outlined
        color="#4CAF50"
        :disabled="
          event.temp_event.event_origin === 'OBSV' && fca.findings.length >= 1
        "
        @click="
          newFindingDialog = true;
          set_parent(event.temp_event);
        "
      >
        <v-icon left>mdi-plus</v-icon>
        <span class="caption"> Agregar hallazgo </span>
      </v-btn>
      <template v-if="!mobile"
        ><span
          class="align-self-center subtitle-2 text--disabled"
          v-if="
            event.temp_event.event_origin === 'OBSV' && fca.findings.length >= 1
          "
          >En la observación sólo se permite la carga de un hallazgo</span
        >
        <template v-if="fca.findings.length">
          <v-divider vertical class="mx-3" />
          <t-btn-icon @click="switchPanel">{{ switchPanelIcon }}</t-btn-icon>
        </template>
      </template>
    </v-row>
    <v-expansion-panels
      v-if="!mobile"
      v-model="panel"
      multiple
      :flat="!panel.length"
    >
      <v-expansion-panel
        v-for="(finding, index) in fca.findings"
        :key="finding.id"
        class="mt-4"
        :class="panel.length ? 'finding-panel' : ''"
      >
        <v-expansion-panel-header class="py-0 px-0" hide-actions>
          <template v-slot:default>
            <v-row class="pl-0 ma-0" justify="space-between">
              <v-col cols="12" md="3" align-self="center">
                <span class="font-weight-bold green--text text--lighten-2"
                  >HALLAZGO ID: {{ finding.id }}</span
                >
                <v-icon
                  v-show="
                    finding.deviation.key !== 'OM'
                      ? causesWithoutActionsInFinding(finding.id)
                      : isFindingWithoutActions(finding.id)
                  "
                  x-small
                  color="error"
                  class="mr-5 animated pulse infinite"
                  >mdi-alert-circle-outline
                </v-icon>
              </v-col>
              <v-col cols="12" md="4">
                <span class="overline">Descripción<br /></span>
                <v-tooltip bottom max-width="500">
                  <template v-slot:activator="{ on }">
                    <span v-on="on">{{
                      finding.description | reduceText(40)
                    }}</span>
                  </template>
                  <span>{{ finding.description }}</span>
                </v-tooltip>
              </v-col>
              <v-col
                cols="12"
                md="3"
                v-if="event.temp_event.event_origin !== 'OBSV'"
              >
                <span class="overline">Desviación<br /></span>
                {{ finding.deviation.name }}
              </v-col>
              <v-spacer />
              <v-col
                cols="12"
                md="2"
                class="py-0 text-right"
                align-self="center"
              >
                <t-btn-icon
                  tooltip="Editar Hallazgo"
                  @click.stop="editFinding(finding)"
                >
                  mdi-pencil
                </t-btn-icon>
                <t-btn-icon
                  tooltip="Eliminar Hallazgo"
                  @click.stop="openDelFindingWarning(finding, index)"
                >
                  mdi-delete-outline
                </t-btn-icon>
              </v-col>
            </v-row>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <ActionLoaderTable
            v-if="
              finding.deviation.key === 'OM' ||
              event.temp_event.event_origin === 'OBSV'
            "
            :parent="{ type: 'finding', id: finding.id, data: finding }"
            :actions="searchActionsFinding(finding.id)"
          />
          <CauseLoaderTable
            v-else
            :parent="{ type: 'finding', id: finding.id, data: finding }"
            :causes="searchCausesFinding(finding.id)"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <FindingICard v-else loader>
      <template slot="card-header"></template>
      <template v-slot:actions="slotProps">
        <v-btn
          color="success"
          icon
          @click.stop="editFinding(slotProps.finding)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          color="error"
          icon
          @click.stop="
            openDelFindingWarning(slotProps.finding, slotProps.index)
          "
        >
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
      </template>
    </FindingICard>

    <GlobalPrompt :active="promptDialog" prompt-type="alert">
      <template v-slot:message>
        Se eliminará el HALLAZGO {{ delFindingID }} junto con todas las causas
        y/o acciones asociadas al mismo.
      </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="delFindingLoading"
          @click="promptDialog = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>

      <template v-slot:accept>
        <t-btn-delete :loading="delFindingLoading" @click="deleteFinding">
          Eliminar Hallazgo
        </t-btn-delete>
      </template>
    </GlobalPrompt>

    <v-dialog
      v-model="newFindingDialog"
      persistent
      max-width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
      transition="isMobile ? 'dialog-bottom-transition' : ''"
    >
      <FindingsLoader
        :editFinding="editFindingFlag"
        @evt-close-dialog="closeFindingDialog"
      />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import CauseLoaderTable from "@/components/newevent-page/EventLoader/FcaLoader/CauseLoaderTable.vue";
import ActionLoaderTable from "@/components/newevent-page/EventLoader/FcaLoader/ActionLoaderTable.vue";
import FindingsLoader from "@/components/newevent-page/EventLoader/FcaLoader/FindingsLoader.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import FindingICard from "@/components/event-page/FindingICard.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "FindingLoaderTable",
  components: {
    TBtnIcon,
    TBtnDelete,
    TBtnSecondary,
    FindingICard,
    CauseLoaderTable,
    ActionLoaderTable,
    FindingsLoader,
    GlobalPrompt,
  },
  props: {
    actionChildren: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: Object,
    },
    mobile: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      panel: [],
      delPanelValue: "",
      newFindingDialog: false,
      editFindingFlag: false,
      promptDialog: false,
      delFindingLoading: false,
      delFindingID: "",
    };
  },

  created() {
    this.panel = this.panelValue;
  },

  computed: {
    ...mapState(["event", "fca"]),

    ...mapGetters("fca", [
      "findings_nc_ncm",
      "findings_om",
      "searchCausesFinding",
      "searchActionsFinding",
      "isFindingWithoutActions",
      "causesWithoutActionsInFinding",
    ]),

    switchPanelIcon() {
      if (this.panel.length) {
        return "mdi-arrow-collapse-vertical";
      } else {
        return "mdi-arrow-expand-vertical";
      }
    },

    panelValue() {
      let expandArray = [];
      this.fca.findings.forEach((f, index) => {
        expandArray.push(index);
      });
      return expandArray;
    },

    // findings () {
    //   return this.actionChildren ? this.findings_om : this.findings_nc_ncm
    // }
  },

  methods: {
    ...mapMutations("fca", ["set_finding", "set_parent"]),

    ...mapActions("fca", ["delete_finding"]),

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

    editFinding(finding) {
      this.set_parent(this.parent);
      this.set_finding(finding);
      this.editFindingFlag = true;
      this.newFindingDialog = true;
    },

    closeFindingDialog() {
      this.newFindingDialog = false;
      this.editFindingFlag = false;
      this.panel.push(this.panelValue.length - 1);
    },

    openDelFindingWarning(finding, index) {
      this.delPanelValue = index === 0 ? 0 : index;
      this.promptDialog = true;
      this.delFindingID = finding.id;
    },

    deleteFinding() {
      this.delFindingLoading = true;
      let tempPanel = this.panel.slice();
      this.delete_finding(this.delFindingID)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Hallazgo eliminada`,
          });
          this.promptDialog = false;
          this.delFindingLoading = false;
          this.processPanel(tempPanel);
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al eliminar la hallazgo",
          });
          this.promptDialog = false;
          this.delFindingLoading = false;
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
.finding-panel {
  border: 1px #4caf50 solid;
}
</style>
