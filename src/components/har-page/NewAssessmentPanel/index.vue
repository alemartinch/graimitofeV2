<template>
  <v-dialog v-model="evalDialog" width="800" persistent>
    <v-card class="py-2" :disabled="loading">
      <v-card-title class="pt-0 mb-3">
        <div>
          <span class="caption">
            {{
              `REQUERIMIENTO ${
                regulation.id
              } / ${regulation.regulation_code.toUpperCase()} / ${har.tiers[
                har.regulation.tier
              ].toUpperCase()}`
            }}<br
          /></span>
          <span>{{
            isEditAssessment
              ? `EDITAR EVALUACIÓN ${har.assessment.id}`
              : "Nueva evaluación"
          }}</span>
        </div>
      </v-card-title>
      <v-card-text>
        <EvaluationForm v-model="valid" />
      </v-card-text>
      <v-card-actions class="justify-end">
        <div class="flex-grow-1"></div>
        <t-btn-secondary @click="closeNewAssessmentDialog" :disabled="loading"
          >cancelar
        </t-btn-secondary>
        <t-btn-primary
          @click="saveAssessment()"
          :loading="loading"
          :disabled="!valid || loading"
        >
          {{
            isEditAssessment ? "Modificar evaluación" : "Finalizar evaluación"
          }}
        </t-btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import EvaluationForm from "@/components/har-page/NewAssessmentPanel/EvaluationForm.vue";
import { uploadAssessmentFiles } from "@/apis/har-apis";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "NewAssessmentPanel",

  components: { TBtnPrimary, TBtnSecondary, EvaluationForm },

  data() {
    return {
      evalDialog: true,
      valid: false,
      evaluationId: "",
      loading: false,
      alertMsg: "",
      goToTasks: false,
      goToEvent: false,
      titleEval: "",
    };
  },

  computed: {
    ...mapState(["har", "user"]),

    regulation() {
      return this.har.regulation;
    },

    isEditAssessment() {
      return !!this.har.assessment.id;
    },
  },

  methods: {
    ...mapMutations("har", ["set_assessment_files", "reset_assessment"]),
    ...mapActions(["set_alert"]),
    ...mapActions("har", ["createAssessment", "updateAssessment"]),

    saveAssessment() {
      this.loading = true;
      this.createAssessment(this.isEditAssessment)
        .then(async (assessmentId) => {
          let alertObject = {
            appAlertType: "success",
            appAlertMsg:
              "El <strong>REQUERIMIENTO " +
              this.har.regulation.id +
              "</strong> se evaluó correctamente.(EVAL. " +
              assessmentId +
              ")",
          };
          if (this.har.assessment.files.length) {
            const errorFiles = await this.upAssessmentFiles(assessmentId);
            if (errorFiles.length) {
              alertObject = {
                appAlertType: "warning",
                appAlertMsg:
                  "El <strong>REQUERIMIENTO " +
                  this.har.regulation.id +
                  "</strong> se evaluó correctamente <span class='mdi mdi-check-circle mdi-18px green--text'></span> <br>" +
                  "Pero uno o varios archivos no pudieron guardarse, puede intentarlo nuevamente desde el panel de la evaluación.",
              };
            }
          }
          this.set_alert(alertObject);
          this.loading = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg:
              "Ocurrió un error al guardar la evaluación. Intentelo nuevamente.",
          });
        })
        .finally(() => {
          this.$emit("update-regulation");
          this.closeNewAssessmentDialog();
        });
    },

    upAssessmentFiles(assessmentId) {
      return new Promise((resolve) => {
        const localFiles = this.har.assessment.files.filter(
          (file) => !file.uploaded
        );
        uploadAssessmentFiles(assessmentId, localFiles).then((responses) => {
          resolve(responses.filter((r) => r.status === "rejected"));
        });
      });
    },

    closeNewAssessmentDialog() {
      this.$router.go(-1);
      this.reset_assessment();
      this.set_assessment_files([]);
    },
  },
};
</script>
<style scoped>
.overflow-container {
  padding-bottom: 0;
  height: 300px;
  overflow: auto;
}
</style>
