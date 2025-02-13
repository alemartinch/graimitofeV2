import { eatApi } from "@/apis";
import { mapActions, mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import { ACTION_STATUSES as AS } from "@/mixins/globals";
import DialogLayout from "@/Layouts/DialogLayout.vue";
import ActionResumeHeader from "@/components/actions-page/ActionResume/ActionResumeHeader.vue";
import ActionResumeForm from "@/components/actions-page/ActionResume/ActionResumeForm.vue";
import ActionResumePostForm from "@/components/actions-page/ActionResume/ActionResumePostForm.vue";
import ActionResumeData from "@/components/actions-page/ActionResume/ActionResumeData.vue";
import { processRawFiles } from "@/mixins/helpers";
import { saveFileAndUploadToS3 } from "@/store/modules/s3upload";

export default {
  name: "ActionResume",
  components: {
    DialogLayout,
    ActionResumePostForm,
    ActionResumeForm,
    ActionResumeData,
    ActionResumeHeader,
  },
  mixins: [permissions],
  props: {
    action: {
      type: Object,
    },
  },

  data() {
    return {
      valid: false,
      validPostpone: false,
      loading: false,
      postpone: false,
      actionLoading: false,
      delActionLoading: false,
      delFileActionLoading: false,
      effCompleted: false,
      formUpdated: false,
    };
  },

  created() {
    this.loading = true;
    eatApi
      .getFetcher()
      .get(`actions/${this.actionId}`)
      .then(({ data }) => {
        this.set_action(data.results);
        this.set_event(data.results.parent_event);
        this.loading = false;
      })
      .catch(() => {
        this.set_alert({
          appAlertType: "error",
          appAlertMsg: `No existe la acción a la cual desea acceder o no tiene permisos para hacerlo`,
        });
        this.closeActionDialog();
      });
  },

  beforeDestroy() {
    this.reset_action();
  },

  watch: {
    postpone(newValue, oldValue) {
      if (oldValue !== newValue) {
        this.valid = false;
        this.validPostpone = false;
      }
    },
  },

  computed: {
    ...mapState(["user", "fca", "event"]),

    actionID() {
      return this.fca.temp_action.id;
    },

    isReadyForEffectiveness() {
      return (
        this.fca.temp_action.status === AS.EF_OVERDUE ||
        this.fca.temp_action.status === AS.EF_PENDING
      );
    },
  },

  methods: {
    ...mapMutations(["show_success_notification", "show_error_notification"]),
    ...mapMutations("fca", [
      "set_parent",
      "set_action",
      "reset_action",
      "UPDATE_ACTION",
      "set_effectiveness_result",
      "set_effectiveness_comment",
      "set_action_files",
      "delete_action_file",
      "UPDATE_ACTION",
    ]),
    ...mapMutations("event", ["set_event"]),

    ...mapActions(["set_alert"]),

    ...mapActions("fca", [
      "update_action",
      "complete_action",
      "postpone_action",
      "complete_effectiveness",
      "delete_action",
      "get_action",
    ]),

    saveActionResolution() {
      this.actionLoading = true;
      if (this.postpone) {
        this.postponeAction(this.actionID);
      } else if (this.effCompleted) {
        this.completeEffectiveness();
      } else if (
        [AS.OVERDUE, AS.PENDING].includes(this.fca.temp_action.status)
      ) {
        this.completeAction(this.actionID);
      } else {
        this.updateAction(this.actionID);
      }
    },

    completeEffectiveness() {
      this.complete_effectiveness()
        .then(() => {
          this.resetFlags();
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Efectividad completada`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No completar la efectividad de la acción`,
          });
          this.closeActionDialog();
        });
    },

    updateAction(actionID) {
      this.update_action({})
        .then(async (actionResult) => {
          this.resetFlags();
          let alertObject = {
            appAlertType: "success",
            appAlertMsg: "La acción ha sido actualizada con éxito",
          };
          if (this.fca.temp_action.files.length) {
            const errorFiles = await this.upActionFiles(actionID);
            if (errorFiles.length) {
              alertObject = {
                appAlertType: "warning",
                appAlertMsg:
                  "La <strong>acción " +
                  actionID +
                  "</strong> se actualizó correctamente" +
                  "<span class='mdi mdi-check-circle mdi-18px green--text'></span> <br>" +
                  "Pero uno o varios archivos no pudieron guardarse.",
              };
            }
          }
          this.get_action(actionResult.id)
          this.set_alert(alertObject);
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No se pudo actualizar la acción`,
          });
          this.actionLoading = false;
          this.closeActionDialog();
        });
    },

    async completeAction(actionID) {
      try {
        const actionResult = await this.complete_action(actionID);
        this.get_action(actionResult.id).then(() =>
          console.log("Acción actualizada")
        );
      } catch (error) {
        this.closeActionDialog();
        this.set_alert({
          appAlertType: "error",
          appAlertMsg: `No se pudo completar la acción`,
        });
      } finally {
        this.resetFlags();
      }
    },

    postponeAction(actionID) {
      this.postpone_action(actionID)
        .then(() => {
          // this.closeActionDialog();
          this.resetFlags();
          this.postpone = false;
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Acción pospuesta`,
          });
        })
        .catch(() => {
          this.closeActionDialog();
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `No se pudo posponer la acción`,
          });
        });
    },

    async addFiles(fileList) {
      this.set_action_files(processRawFiles(fileList));
      this.fca.temp_action.files.forEach((file) => {
        if (!file.uploaded) {
          const actionData = {
            action: this.actionID,
            size: file.size,
          };
          saveFileAndUploadToS3(
            eatApi.getFetcher(),
            `actions/${this.actionID}/files`,
            actionData,
            file
          )
            .then((response) => {
              file.filename = response.data.results.filename;
              file.uploaded = true;
              file.id = response.data.results.id;
            })
            .catch(() => {
              file.error = true;
            });
        }
      });
    },

    deleteFile(file) {
      if (!file.uploaded) {
        this.delete_action_file(file.id);
        return;
      }
      file.deleting = true;
      eatApi
        .getFetcher()
        .delete(`actions/${this.actionID}/files/${file.id}`)
        .then(() => {
          this.delete_action_file(file.id);
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El archivo se eliminó correctamente`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Error al eliminar el archivo`,
          });
        })
        .finally(() => {
          file.deleting = false;
        });
    },

    deleteAction() {
      this.delActionLoading = true;
      this.delete_action(this.actionID)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Acción eliminada`,
          });
        })
        .finally(() => {
          this.closeActionDialog();
          this.delActionLoading = false;
        });
    },

    resetEffectivenessResult() {
      this.formUpdated = true;
      if (!this.effCompleted) {
        this.set_effectiveness_result(null);
        this.set_effectiveness_comment(null);
      }
    },

    resetFlags() {
      this.actionLoading = false;
      this.formUpdated = false;
    },

    closeActionDialog() {
      this.$emit("close-action-resume");
      if (!this.isMobile) {
        this.actionLoading = false;
        this.dialog = false;
      }
      this.$router.go(-1);
    },
  },
};
