<template>
  <div
    class="pa-5"
    style="height: 100%; box-shadow: -5px 0 5px -5px rgba(99, 99, 99, 0.2)"
  >
    <span v-for="btn in taskActions" :key="btn.name">
      <t-btn-icon
        v-if="btn.visible"
        :color="btn.color"
        @click="btn.action()"
        :loading="btn.loading"
        small
        :tooltip="btn.tooltip"
      >
        {{ btn.icon }}
      </t-btn-icon>
    </span>

    <v-alert
      type="error"
      outlined
      icon="mdi-repeat-off"
      v-if="!har.task.active"
      class="caption font-weight-bold"
      >TAREA DESACTIVADA<br />La tarea se encuentra inactiva y no generará más
      ocurrencias
    </v-alert>
    <v-divider class="my-3" />
    <div class="d-flex mb-5">
      <UserAvatar :user-object="har.task.owner" size="36" />
      <div class="ml-2 d-flex flex-column">
        <span class="caption text--secondary">Reponsable:</span
        ><span class="text-body-2">{{ har.task.owner | fullName }}</span>
      </div>
    </div>
    <div class="d-flex align-center mb-5">
      <InfographicIcon icon="mdi-factory" />
      <div class="ml-3 d-flex flex-column">
        <span class="caption text--secondary">Establecimiento</span>
        <span class="text-caption text-md-body-2">
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
        <span class="text-body-2">{{
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
        <span class="text-body-2">{{
          har.task.pre_warning_active
            ? `${har.task.pre_warning_days} día/s antes`
            : "Sin preaviso"
        }}</span>
      </div>
    </div>
    <v-divider class="my-4" />
    <v-card class="pa-2 d-flex flex-column" color="#f7f9fa" flat>
      <div v-if="har.task.files.length">
        <FileCard
          v-for="file in har.task.files"
          :key="file.id"
          :file="file"
          v-on:download-file="downloadFile(file.filename)"
          :deletable="false"
        />
      </div>
      <span class="text-body-2" v-else style="margin: auto"
        >No se cargaron recursos.</span
      >
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
            $emit('delete-task', true);
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
  </div>
</template>
<script>
import FileCard from "@/components/reusable/FileCard.vue";
import InfographicIcon from "@/components/reusable/InfographicIcon.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import { harPermissions } from "@/mixins/permissions/harPermissions";
import { mapActions, mapMutations, mapState } from "vuex";
import { tcmtRegApi } from "@/apis";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";

export default {
  name: "OccurrenceTaskPanelSide",
  components: {
    GlobalPrompt,
    TBtnDelete,
    TBtnSecondary,
    FileCard,
    InfographicIcon,
    TBtnIcon,
    UserAvatar,
  },
  mixins: [harPermissions],
  data() {
    return {
      showWarningMessage: false,
      loading: {
        deleteTask: false,
        taskActivation: false,
        saveNewFiles: false,
        deleteFiles: false,
      },
    };
  },
  computed: {
    ...mapState(["har"]),
    currentTask() {
      return this.har.task;
    },
    taskActions() {
      return [
        {
          name: "Desactivar tarea",
          // icon: "mdi-repeat-off",
          // icon: "mdi-clipboard-off-outline",
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
            this.$emit("delete-task", false);
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
      "set_task_active",
      "set_task_files",
      "reset_task",
      "set_task_nextDueDate",
    ]),
    ...mapActions("har", ["fetchOccurrences", "fetchOccurrence", "deleteTask"]),
    toggleTaskActivation() {
      this.loading.taskActivation = true;
      const activationAction = this.currentTask.active ? "disable" : "enable";
      tcmtRegApi
        .getFetcher()
        .put(`repet-actions/${this.currentTask.id}/${activationAction}`)
        .then(({ data }) => {
          this.fetchOccurrences();
          this.fetchOccurrence({
            taskID: this.har.task.id,
            occurrenceID: this.har.occurrence.id,
          });
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
    delTask() {
      this.loading.deleteTask = true;
      this.deleteTask()
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `La tarea se eliminó con éxito`,
          });
          this.fetchOccurrences();
          this.closeTaskPanel();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg:
              "Ocurrió un error al eliminar la tarea. Intentelo nuevamente.",
          });
        })
        .finally(() => {
          this.loading.deleteTask = false;
        });
    },
    resetTask() {
      this.set_task_files([]);
      this.reset_task();
    },
    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },
  },
};
</script>
