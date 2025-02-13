<template>
  <v-dialog v-model="dialog" width="900" persistent>
    <v-card v-if="loading.fetchTask" class="pa-2">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card
      v-else
      :disabled="loading.updateOccurrences || loading.taskActivation"
      :loading="loading.updateOccurrences"
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
          <v-card-subtitle>
            <p>{{ har.task.description }}</p>
          </v-card-subtitle>
        </template>
        <template v-slot:content>
          <span class="text-body-2 font-weight-medium mb-5">Historial</span>
        </template>
        <template v-slot:side>
          <div
            class="pa-5"
            style="
              height: 100%;
              box-shadow: -5px 0 5px -5px rgba(99, 99, 99, 0.2);
            "
          >
            <t-btn-icon
              v-for="btn in actionsBtns"
              :key="btn.name"
              v-show="btn.visible"
              :color="btn.color"
              :tooltip="btn.tooltip"
              @click="btn.action()"
              :loading="btn.loading"
              small
            >
              {{ btn.icon }}
            </t-btn-icon>
            <div class="mb-5 text-body-2 font-weight-medium">
              Información de la tarea
            </div>
            <v-alert
              type="error"
              outlined
              icon="mdi-repeat-off"
              v-if="!har.task.active"
              class="caption font-weight-bold"
              >TAREA DESACTIVADA<br />La tarea se encuentra inactiva y no
              generará más ocurrencias</v-alert
            >
            <div class="d-flex mb-5">
              <UserAvatar :user-object="har.task.owner" size="36" />
              <div class="ml-2 d-flex flex-column">
                <span class="caption text--secondary">Reponsable:</span
                ><span class="text-body-2 font-weight-medium">{{
                  har.task.owner | fullName
                }}</span>
              </div>
            </div>
            <div class="d-flex align-center mb-5">
              <InfographicIcon icon="mdi-factory" />
              <div class="ml-3 d-flex flex-column">
                <span class="caption text--secondary">Establicimiento</span>
                <span class="text-caption text-md-body-2 font-weight-medium">
                  {{
                    har.task.facility
                      ? har.task.facility.name
                      : "Todos los establecimientos"
                  }}
                </span>
              </div>
            </div>
            <div class="d-flex align-center mb-5">
              <InfographicIcon icon="mdi-repeat" />
              <div class="ml-3 d-flex flex-column">
                <span class="caption text--secondary">Frecuencia</span>
                <span class="text-body-2 font-weight-medium">{{
                  +har.task.frequency_active
                    ? `Cada ${har.task.frequency_number} ${
                        har.frequencies[har.task.frequency_key].both
                      }`
                    : "No repetitiva"
                }}</span>
              </div>
            </div>
            <div class="d-flex align-center mb-5">
              <InfographicIcon icon="mdi-bell-alert-outline" />
              <div class="ml-3 d-flex flex-column">
                <span class="caption text--secondary">Preaviso</span>
                <span class="text-body-2 font-weight-medium">{{
                  har.task.pre_warning_active
                    ? `${har.task.pre_warning_days} día/s antes`
                    : "Sin preaviso"
                }}</span>
              </div>
            </div>
            <div class="mb-5 text-body-2 font-weight-medium">Recursos</div>
            <div style="max-height: 180px; overflow: auto">
              <div v-if="har.task.files.length">
                <FileCard
                  v-for="file in har.task.files"
                  :key="file.id"
                  :file="file"
                  v-on:download-file="downloadFile(file.filename)"
                  :deletable="false"
                />
              </div>
              <div v-else class="text-body-2">Sin adjuntos</div>
            </div>
          </div>
        </template>
        <template v-slot:actions>
          <v-card-actions class="pa-3 justify-end elevation-22">
            <t-btn-secondary @click="closeTaskPanel">Cerrar</t-btn-secondary>
          </v-card-actions>
        </template>
      </DialogLayout>
    </v-card>
    <GlobalPrompt
      title="Eliminar tarea"
      :active="showWarningMessage"
      prompt-type="alert"
    >
      <template v-slot:message>
        Se borrarán todos los datos de la tarea así cómo las ocurrencias
        vigentes e históricas.
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
        <t-btn-delete :loading="loading.deleteTask" @click="delTask">
          Eliminar tarea
        </t-btn-delete>
      </template>
    </GlobalPrompt>
  </v-dialog>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { tcmtRegApi } from "@/apis";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import InfographicIcon from "@/components/reusable/InfographicIcon.vue";
import FileCard from "@/components/reusable/FileCard";
import { harPermissions } from "@/mixins/permissions/harPermissions.vue";
import DialogLayout from "@/Layouts/DialogLayout.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import TBreadcrumbs from "@/components/har-page/TBreadcrumbs.vue";

export default {
  name: "TaskPanel",
  components: {
    TBreadcrumbs,
    TBtnDelete,
    TBtnSecondary,
    TBtnIcon,
    GlobalPrompt,
    DialogLayout,
    FileCard,
    InfographicIcon,
    UserAvatar,
  },
  mixins: [harPermissions],
  data() {
    return {
      taskId: this.$route.query.id,
      dialog: true,
      loading: {
        fetchTask: false,
        updateOccurrences: false,
        deleteTask: false,
        taskActivation: false,
      },
      showWarningMessage: false,
    };
  },
  created() {
    this.loading.fetchTask = true;
    this.getTask();
  },
  computed: {
    ...mapState(["har"]),
    currentTask() {
      return this.har.task;
    },
    currentRegulation() {
      return {
        id: this.currentTask.regulation_id,
        tier: this.currentTask.tier,
      };
    },
    occurrences() {
      return this.currentTask.next_occurrences.map((occ) => {
        return {
          ...occ,
          taskId: this.currentTask.id,
          repet_action: this.currentTask,
        };
      });
    },
    breadcrumbsItems() {
      return [
        {
          text: `REQUERIMIENTO ${this.har.tiers[this.currentRegulation.tier]} ${
            this.currentRegulation.id
          }`,
          link: true,
        },
        {
          text: `TAREA ${this.currentTask.id}`,
          link: false,
          strong: true,
        },
      ];
    },
    actionsBtns() {
      return [
        {
          name: "Desactivar tarea",
          icon: "mdi-repeat-off",
          color: this.currentTask.active ? "primary" : "error",
          action: () => this.toggleTaskActivation(),
          visible: this.canDeactivateTask(),
          tooltip: this.currentTask.active
            ? "Desactivar tarea"
            : "Activar tarea",
          loading: this.loading.taskActivation,
        },
        {
          name: "Editar tarea",
          icon: "mdi-pencil-outline",
          color: "primary",
          action: () => this.openNewTaskPanel(),
          visible: this.canEditTask(),
          tooltip: "Editar tarea",
          loading: false,
        },
        {
          name: "Eliminar tarea",
          icon: "mdi-delete-outline",
          color: "primary",
          action: () => {
            this.dialog = false;
            this.showWarningMessage = true;
          },
          visible: this.canDeleteTask(),
          tooltip: "Eliminar tarea",
          loading: this.loading.deleteTask,
        },
      ];
    },
  },
  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("har", [
      "set_task",
      "reset_task",
      "set_task_files",
      "set_task_nextDueDate",
      "set_task_active",
    ]),
    ...mapActions("har", ["deleteTask", "fetchOccurrences"]),

    getTask() {
      this.loading.updateOccurrences = true;
      tcmtRegApi
        .getFetcher()
        .get(`repet-actions/${this.taskId}`)
        .then((res) => {
          this.set_task(res.data);
        })
        .catch(() => {})
        .finally(() => {
          this.loading.fetchTask = false;
          this.loading.updateOccurrences = false;
        });
    },

    delTask() {
      this.loading.deleteTask = true;
      this.deleteTask()
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `La tarea se eliminó con éxito`,
          });
          this.$emit("update-regulation", true);
          this.closeTaskPanel();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg:
              "Ocurrió un error al elminar la tarea. Intentelo nuevamente.",
          });
        })
        .finally(() => {
          this.loading.deleteTask = false;
        });
    },

    openNewTaskPanel() {
      const today = new Date().toISOString().substr(0, 10);
      if (this.currentTask.next_due_date <= today) {
        this.set_task_nextDueDate("");
      }
      if (this.$route.path.includes("regulations")) {
        this.$router.replace({ name: "new-task-panel" });
      } else {
        this.$router.replace({ name: "new-task-panel-tasks" });
      }
    },

    closeTaskPanel() {
      const lastSlashIndex = this.$route.path.lastIndexOf("/");
      const beforePath = this.$route.path.slice(0, lastSlashIndex);
      this.$router.replace({ path: beforePath });
      this.resetTask();
    },

    toggleTaskActivation() {
      this.loading.taskActivation = true;
      const activationAction = this.currentTask.active ? "disable" : "enable";
      tcmtRegApi
        .getFetcher()
        .put(`repet-actions/${this.currentTask.id}/${activationAction}`)
        .then(({ data }) => {
          this.fetchOccurrences();
          this.set_task_active(data.active);
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg:
              "Error al tratar de modificar la activación de la tarea",
          });
        })
        .finally(() => {
          this.loading.taskActivation = false;
        });
    },

    resetTask() {
      this.set_task_files([]);
      this.reset_task();
    },

    goToRegulation() {
      const regID = this.currentRegulation.id;
      this.resetTask();
      this.$router.push({
        path: `/har/regulations/${regID}`,
      });
    },

    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },
  },
};
</script>
