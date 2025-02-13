<template>
  <v-card elevation="22" outlined class="pa-2 mb-2 d-flex flex-column">
    <div class="d-flex align-center">
      <span class="caption text--secondary mr-2"> T{{ task.id }} </span>
      <span v-if="!task.active" class="caption font-weight-bold error--text"
        >TAREA DESACTIVADA</span
      >
      <v-spacer />
      <UserChip :user="task.owner" />
      <v-divider vertical class="mx-3 my-1" />
      <div v-for="btn in taskBtns" :key="btn.name">
        <t-btn-icon
          :disabled="!btn.visible"
          :color="btn.color"
          :tooltip="btn.tooltip"
          @click="btn.action()"
          :loading="btn.loading"
          small
        >
          {{ btn.icon }}
        </t-btn-icon>
      </div>
    </div>
    <span class="text-body-2 mt-1">{{ task.description }}</span>
    <v-divider class="mt-2" />
    <div
      class="d-flex align-center caption text-uppercase font-weight-medium mt-1"
    >
      <span v-for="attr in taskAttrs" :key="attr.name" class="mr-3">
        <v-tooltip top open-delay="200"
          ><template v-slot:activator="{ on }"
            ><v-icon v-on="on" small class="mr-1">{{
              attr.icon
            }}</v-icon></template
          >{{ attr.tooltipIcon }}</v-tooltip
        ><v-tooltip top open-delay="200">
          <template v-slot:activator="{ on }">
            <span v-on="on">{{ attr.label }}</span> </template
          >{{ attr.tooltipLabel }}
        </v-tooltip>
      </span>
      <span>
        <v-icon small>mdi-rotate-270 mdi-attachment</v-icon>
        <v-menu top nudge-top="20" :disabled="!taskFiles.length">
          <template v-slot:activator="{ on }">
            <t-btn-text v-on="on" :disabled="!taskFiles.length">
              {{ task.files.length }} archivos adjuntos
            </t-btn-text>
          </template>
          <v-card class="pa-2" width="220px">
            <div v-if="taskFiles.length">
              <FileCard
                v-for="file in taskFiles"
                :key="file.id"
                :file="file"
                :deletable="false"
                v-on:download-file="downloadFile(file.filename)"
              />
            </div>
          </v-card>
        </v-menu>
      </span>
      <v-spacer />
      <span class="text-lowercase"
        ><v-icon small>mdi-calendar-alert</v-icon>
        {{ task.next_due_date | fechaText }}</span
      >
    </div>
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
          :disabled="loadings.deleteTask"
          @click="showWarningMessage = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>
      <template v-slot:accept>
        <t-btn-delete :loading="loadings.deleteTask" @click="delTask">
          Eliminar tarea
        </t-btn-delete>
      </template>
    </GlobalPrompt>
  </v-card>
</template>
<script>
import TBtnIcon from "@/components/TBtnIcon.vue";
import UserChip from "@/components/reusable/UserChip.vue";
import { mapActions, mapMutations, mapState } from "vuex";
import { harPermissions } from "@/mixins/permissions/harPermissions";
import { tcmtRegApi } from "@/apis";
import FileCard from "@/components/reusable/FileCard.vue";
import TBtnText from "@/components/reusable/TBtnText.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";

export default {
  name: "TaskItem",
  components: {
    TBtnDelete,
    GlobalPrompt,
    TBtnSecondary,
    TBtnText,
    FileCard,
    TBtnIcon,
    UserChip,
  },
  mixins: [harPermissions],
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loadings: {
        taskActivation: false,
        deleteTask: false,
      },
      showWarningMessage: false,
    };
  },
  computed: {
    ...mapState(["har"]),
    taskBtns() {
      return [
        {
          name: "Desactivar tarea",
          icon: this.task.active ? "mdi-repeat-off" : "mdi-repeat",
          color: "primary",
          action: () => this.toggleTaskActivation(),
          visible: this.canDeactivateTask(this.task),
          tooltip: this.task.active ? "Desactivar tarea" : "Activar tarea",
          loading: this.loadings.taskActivation,
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
          loading: false,
        },
      ];
    },
    taskAttrs() {
      return [
        {
          name: "Frecuencia",
          icon: "mdi-repeat",
          label:
            this.task.frequency_key !== "NO"
              ? `Cada ${this.task.frequency_number} ${
                  this.har.frequencies[this.task.frequency_key].both
                }`
              : "No repetitiva",
          tooltipIcon: "Frecuencia",
          tooltipLabel:
            this.task.frequency_key !== "NO"
              ? `Esta tarea se repite cada ${this.task.frequency_number} ${
                  this.har.frequencies[this.task.frequency_key].both
                }`
              : "Tarea no repetitiva",
        },
        {
          name: "Preaviso",
          icon: "mdi-bell-outline",
          tooltipIcon: "Pre-aviso",
          tooltipLabel: this.task.pre_warning_active
            ? `Se notificará ${this.task.pre_warning_days} día/s antes
               del vencimientos de la tarea`
            : "Sin preaviso",
          label: this.task.pre_warning_active
            ? `${this.task.pre_warning_days} día/s antes`
            : "Sin preaviso",
        },
      ];
    },
    taskFiles() {
      return this.task.files.map((file) => {
        return { ...file, uploaded: true, ext: file.name.split(".").pop() };
      });
    },
  },
  methods: {
    ...mapActions("har", ["fetchRegulation", "deleteTask"]),
    ...mapMutations("har", ["set_task"]),
    ...mapMutations(["show_success_notification", "show_error_notification"]),
    toggleTaskActivation() {
      this.loadings.taskActivation = true;
      const activationAction = this.task.active ? "disable" : "enable";
      tcmtRegApi
        .getFetcher()
        .put(`repet-actions/${this.task.id}/${activationAction}`)
        .then(() => {
          this.show_success_notification(
            `La tarea T${this.task.id} se ${
              this.task.active ? "desactivó" : "activó"
            } correctamente`
          );
          return this.fetchRegulation(this.har.regulation.id);
        })
        .then(() => {
          this.loadings.taskActivation = false;
        })
        .catch(() => {
          this.show_error_notification(
            "Error al tratar de modificar la activación de la tarea"
          );
        })
        .finally(() => {
          this.loadings.taskActivation = false;
        });
    },
    openNewTaskPanel() {
      this.set_task(this.task);
      const today = new Date().toISOString().substr(0, 10);
      if (this.task.next_due_date <= today) {
        this.set_task_nextDueDate("");
      }
      this.$router.replace({ name: "new-task-panel" });
    },
    delTask() {
      this.set_task(this.task);
      this.loadings.deleteTask = true;
      this.deleteTask()
        .then(() => {
          this.show_success_notification("La tarea se eliminó con éxito");
          this.fetchRegulation(this.har.regulation.id);
        })
        .catch(() => {
          this.show_error_notification(
            "Ocurrió un error al eliminar la tarea. Intentelo nuevamente."
          );
        })
        .finally(() => {
          this.loadings.deleteTask = false;
          this.showWarningMessage = false;
        });
    },
    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },
  },
};
</script>
