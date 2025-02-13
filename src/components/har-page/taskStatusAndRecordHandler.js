import { harPermissions } from "@/mixins/permissions/harPermissions";
import { TASK_STATUSES } from "@/mixins/globals";
import { mapGetters, mapMutations } from "vuex";
import { processRawFiles } from "@/mixins/helpers";
import { tcmtRegApi } from "@/apis";
import { uploadEntryFilesHandle } from "@/components/har-page/uploadEntryFilesHandle";

export const taskStatusAndRecordHandler = {
  mixins: [uploadEntryFilesHandle, harPermissions],

  data() {
    return {
      dialog: false,
      newComment: "",
      loading: {
        saveNewEntryLoading: false,
      },
    };
  },

  computed: {
    ...mapGetters("har", ["getCurrentTask", "getCurrentOccurrence"]),
    statusConfiguration() {
      return {
        IN_PROGRESS: {
          icon: "mdi-circle-slice-5",
          color: "primary",
          pBtnName: "En proceso",
          endpoint: "set-in-progress",
          disabled:
            !this.canModifyTaskStatus(this.getCurrentOccurrence) ||
            this.getCurrentOccurrence.status === TASK_STATUSES.COMPLETED ||
            this.getCurrentOccurrence.in_progress,
          tooltip: "Poner tarea en progreso",
          dialog: {
            successRespMsg: "se puso en proceso.",
            alert: null,
            title: "Poner tarea en proceso",
          },
          panel: {
            action: () => (this.newRecordType = "IN_PROGRESS"),
            comment_rules: [],
          },
        },
        COMPLETE: {
          icon: "mdi-check-circle-outline",
          color: "primary",
          pBtnName: "Completar",
          endpoint: "set-complete",
          disabled:
            !this.canModifyTaskStatus(this.getCurrentOccurrence) ||
            this.getCurrentOccurrence.status === TASK_STATUSES.COMPLETED,
          tooltip: "Completar tarea",
          dialog: {
            successRespMsg: "se completó correctamente.",
            alert:
              "En caso de detectar desvío, dar aviso al responsable del área para su posterior gestión",
            title: "Completar tarea",
          },
          panel: {
            action: () => (this.newRecordType = "COMPLETE"),
            comment_rules: [],
          },
        },
        RECORD: {
          icon: "mdi-comment-text-outline",
          color: "primary",
          pBtnName: "Guardar",
          endpoint: "entries",
          disabled: !this.canModifyTaskStatus(this.getCurrentOccurrence),
          tooltip: "Agregar registro",
          dialog: {
            successRespMsg: "se guardó correctamente.",
            alert: null,
            title: "Nuevo registro",
          },
          panel: {
            action: () => (this.newRecordType = "RECORD"),
            comment_rules: [
              (v) => !!v,
              (v) => v.length <= 250 || "Máx. 250 caracteres",
            ],
          },
        },
      };
    },
  },

  methods: {
    ...mapMutations(["show_success_notification", "show_error_notification"]),

    addFiles(e) {
      this.files.push(...processRawFiles(e.target?.files || e));
    },

    deleteLocalFile(fileDeleted) {
      const fileIndex = this.files.findIndex(
        (file) => file.id.toString() === fileDeleted.id.toString()
      );
      this.files.splice(fileIndex, 1);
    },

    async saveNewEntry() {
      this.loading.saveNewEntryLoading = true;
      try {
        const newEntry = await this.postNewEntry();
        if (this.files.length) {
          await this.upNewEntryFiles(newEntry.id);
        }
        this.show_success_notification("El registro se guardó correctamente");
        this.$emit("entry-saved");
        this.updateOccurrencePanel && this.updateOccurrencePanel();
        this.resetFormFields();
      } catch (e) {
        this.show_error_notification("Error al guardar el registro");
      } finally {
        this.loading.saveNewEntryLoading = false;
      }
    },

    async postNewEntry() {
      const { data: newEntry } = await tcmtRegApi
        .getFetcher()
        .post(
          `repet-actions/${this.getCurrentTask.id}/occurrences/${
            this.getCurrentOccurrence.id
          }/${this.statusConfiguration[this.newRecordType].endpoint}`,
          { comment: this.newComment }
        );
      return newEntry;
    },

    resetFormFields() {
      this.dialog = false;
      this.newComment = "";
      this.files = [];
    },
  },
};
