<template>
  <v-dialog v-model="dialog" width="900" persistent>
    <v-card v-if="loading.fetchOccurrence" class="pa-2">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card
      v-else
      :disabled="har.loadings.fetchOccurrence || loading.taskActivation"
      :loading="har.loadings.fetchOccurrence"
    >
      <DialogLayout>
        <template v-slot:header>
          <v-card-title class="mb-3 flex-nowrap align-start">
            <t-breadcrumbs
              :items="breadcrumbsItems"
              v-on:on-click="goToRegulation"
            />
            <v-spacer />
          </v-card-title>
          <v-card-subtitle class="font-weight-medium">
            {{ har.task.description }}
          </v-card-subtitle>
          <div class="ml-4 d-inline-flex align-center">
            <v-chip
              small
              :color="har.taskStatuses[har.occurrence.status].color"
              outlined
            >
              <v-icon left small>
                {{ har.taskStatuses[har.occurrence.status].icon }}
              </v-icon>
              {{ har.taskStatuses[har.occurrence.status].name }}
            </v-chip>
            <v-icon
              v-if="har.occurrence.in_progress"
              small
              color="primary"
              class="ml-2"
              >mdi-circle-slice-5
            </v-icon>
            <v-icon
              v-if="showPreWarningIndicator"
              small
              class="ml-2"
              color="#153240"
              >mdi-bell-ring-outline
            </v-icon>
            <v-divider class="mx-2" style="width: 40px" />
            <span class="caption d-flex align-center">
              <v-icon small color="#153240">mdi-calendar</v-icon>
              <span class="ml-1">{{
                har.occurrence.due_date | fechaText
              }}</span>
              <t-btn-icon
                v-if="canIDeleteOccurrence()"
                small
                color="error"
                tooltip="Eliminar esta ocurrencia"
                @click="
                  dialog = false;
                  showWarningMessage = true;
                "
                >mdi-delete</t-btn-icon
              >
            </span>
          </div>
          <div class="mt-10 mx-4">
            <div class="text-body-2 font-weight-medium text--secondary d-flex">
              <span>Historial</span>
              <v-spacer />
              <t-btn-icon
                small
                tooltip="Descargar reporte"
                @click="downloadOccurrenceReport"
                :loading="loading.downloadReport"
                >mdi-file-download-outline</t-btn-icon
              >
            </div>
            <v-divider />
          </div>
        </template>
        <template v-slot:content>
          <OccurrenceTaskPanelTimeline />
        </template>
        <template v-slot:side>
          <OccurrenceTaskPanelSide v-on:delete-task="dialog = $event" />
        </template>
        <template v-slot:actions>
          <v-card-actions class="pa-3 justify-end elevation-22">
            <t-btn-secondary @click="closeTaskPanel">Cerrar</t-btn-secondary>
          </v-card-actions>
        </template>
      </DialogLayout>
    </v-card>
    <GlobalPrompt
      title="Eliminar ocurrencia"
      :active="showWarningMessage"
      prompt-type="alert"
    >
      <template v-slot:message>
        Se eliminará sólo esta ocurrencia con vencimiento
        <span>{{ har.occurrence.due_date | fechaText }}</span
        >, junto con todos los registros pertenecientes.
      </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="loading.deleteTask"
          @click="
            showWarningMessage = false;
            dialog = true;
          "
        >
          Cancelar
        </t-btn-secondary>
      </template>
      <template v-slot:accept>
        <t-btn-delete
          :loading="loading.deleteOccurrence"
          @click="delOccurrence"
        >
          Eliminar ocurrencia
        </t-btn-delete>
      </template>
    </GlobalPrompt>
  </v-dialog>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { tcmtRegApi, tcmtReportsApi } from "@/apis";
import { harPermissions } from "@/mixins/permissions/harPermissions";
import DialogLayout from "@/Layouts/DialogLayout.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBreadcrumbs from "@/components/har-page/TBreadcrumbs.vue";
import { TASK_STATUSES } from "@/mixins/globals";
import OccurrenceTaskPanelTimeline from "@/components/har-page/OccurrenceTaskPanelTimeline.vue";
import OccurrenceTaskPanelSide from "@/components/har-page/OccurrenceTaskPanelSide.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import dialogLayout from "@/Layouts/DialogLayout.vue";

export default {
  name: "OccurrenceTaskPanel",
  components: {
    GlobalPrompt,
    TBtnDelete,
    OccurrenceTaskPanelSide,
    OccurrenceTaskPanelTimeline,
    TBreadcrumbs,
    TBtnSecondary,
    TBtnIcon,
    DialogLayout,
  },
  mixins: [harPermissions],
  data() {
    return {
      occurrenceID: this.$route.query.occurrenceID,
      taskID: this.$route.query.taskID,
      dialog: true,
      loading: {
        fetchOccurrence: false,
        deleteOccurrence: false,
        downloadReport: false,
      },
      commentRules: [
        (v) => !!v,
        (v) => v.length <= 250 || "Máx. 250 caracteres",
      ],
      showWarningMessage: false,
    };
  },
  created() {
    this.loading.fetchOccurrence = true;
    this.getOccurrence();
  },
  computed: {
    ...mapState(["har", "user"]),
    dialogLayout() {
      return dialogLayout;
    },
    currentTask() {
      return this.har.task;
    },

    currentRegulation() {
      return {
        id: this.currentTask.regulation_id,
        tier: this.currentTask.tier,
      };
    },

    showPreWarningIndicator() {
      return (
        this.har.task.extra.is_pre_warning_time &&
        this.har.occurrence.status === TASK_STATUSES.PENDING
      );
    },

    breadcrumbsItems() {
      const breadcrumbs = [
        {
          text: `TAREA ${this.currentTask.id}`,
          link: false,
          strong: true,
        },
      ];
      if (this.currentRegulation.id) {
        breadcrumbs.unshift({
          text: `REQUERIMIENTO ${this.har.tiers[this.currentRegulation.tier]} ${
            this.currentRegulation.id
          }`,
          link: true,
        });
      }
      return breadcrumbs;
    },

    statusChip() {
      return {
        [TASK_STATUSES.COMPLETED]: {
          color: "success",
          label: "Completa",
          icon: "mdi-check-circle-outline",
        },
        [TASK_STATUSES.PENDING]: {
          color: "orange",
          label: "Pendiente",
          icon: "mdi-circle",
        },
        [TASK_STATUSES.OVERDUE]: {
          color: "error",
          label: "Vencida",
          icon: "mdi-circle",
        },
      };
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("har", ["set_task_files", "reset_task"]),
    ...mapActions("har", ["fetchOccurrence", "fetchOccurrences"]),

    getOccurrence() {
      this.loading.fetchOccurrence = true;
      this.fetchOccurrence({
        taskID: this.taskID,
        occurrenceID: this.occurrenceID,
      })
        .then(() => {})
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Error al cargar los datos de la tarea",
          });
        })
        .finally(() => {
          this.loading.fetchOccurrence = false;
        });
    },

    downloadOccurrenceReport() {
      this.loading.downloadReport = true;
      tcmtReportsApi
        .getFetcher()
        .get(
          `repet-actions/occurrences/${this.har.occurrence.id}?report_type=pdf`
        )
        .then((res) => {
          const url = res.data.download_url;
          window.open(url, "_blank");
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Error al descargar el archivo",
          });
        })
        .finally(() => {
          this.loading.downloadReport = false;
        });
    },

    delOccurrence() {
      this.loading.deleteOccurrence = true;
      tcmtRegApi
        .getFetcher()
        .delete(
          `repet-actions/${this.currentTask.id}/occurrences/${this.har.occurrence.id}`
        )
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "La ocurrencia se eliminó correctamente",
          });
          this.fetchOccurrences();
          this.closeTaskPanel();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un error al eliminar la ocurrencia",
          });
        })
        .finally(() => {
          this.showWarningMessage = false;
        });
    },

    goToRegulation() {
      const regID = this.currentRegulation.id;
      this.resetTask();
      this.$router.push({
        path: `/har/regulations/${regID}`,
      });
    },

    closeTaskPanel() {
      const lastSlashIndex = this.$route.path.lastIndexOf("/");
      const beforePath = this.$route.path.slice(0, lastSlashIndex);
      this.$router.replace({ path: beforePath });
      this.resetTask();
    },

    resetTask() {
      this.set_task_files([]);
      this.reset_task();
    },
  },
};
</script>

<style scoped>
.v-timeline::after {
  content: "";
  position: absolute;
  left: 40px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #449cc9;
  border: 2px solid white;
  box-shadow: 0 2px 1px -1px rgba(99, 99, 99, 0.2),
    0 1px 1px 0 rgba(99, 99, 99, 0.2), 0 1px 3px 0 rgba(99, 99, 99, 0.2);
}
</style>
