<template>
  <v-dialog v-model="dialog" width="513" persistent>
    <v-card v-if="loading.fetchAssessment" class="pa-2">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card
      v-else
      class="pa-4 d-flex flex-column"
      height="565"
      outlined
      :style="{
        borderColor: har.assessment.current_revision ? '#44CC7B' : '',
        borderWidth: '1px',
      }"
      :disabled="loading.deleteAssessmentFile || loading.deleteAssessment"
    >
      <div>
        <div class="d-flex align-center">
          <div>
            <span class="caption text--secondary">
              {{ `R${har.regulation.id}`
              }}<span class="font-weight-bold">{{
                `/ EVALUACIÓN ${har.assessment.id}`
              }}</span
              ><br
            /></span>
          </div>
          <v-spacer />
          <t-btn-icon
            v-if="canEditAssessment()"
            small
            tooltip="Editar"
            @click="openEditAssessmentPanel"
          >
            mdi-pencil-outline
          </t-btn-icon>
          <t-btn-icon
            v-if="canDeleteAssessment()"
            small
            tooltip="Eliminar"
            :loading="loading.deleteAssessment"
            @click="deleteAssessment"
            >mdi-delete-outline
          </t-btn-icon>
        </div>
        <div class="d-inline-flex align-center">
          <v-chip
            label
            class="text-h6"
            color="primary"
            style="color: whitesmoke"
          >
            <v-icon left> {{ getComplianceIcon }}</v-icon>
            {{ har.assessmentResults[har.assessment.compliance].name }}
          </v-chip>
          <v-divider class="mx-2" style="width: 30px" />
          <span class="caption">
            Evaluada el
            <span class="font-weight-medium">{{
              har.assessment.created_on | fechaText
            }}</span>
          </span>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon small class="ml-2" :color="revision.color" v-on="on">
                {{ revision.icon }}
              </v-icon>
            </template>
            {{ revision.tooltip }}
          </v-tooltip>
        </div>
        <v-alert
          v-if="['NCOM', 'PCOM'].includes(har.assessment.compliance)"
          color="orange"
          dense
          outlined
          class="caption mt-3 mb-0 text-break"
          style="opacity: 0.6"
        >
          <span v-html="alertMessage"></span>
          <v-icon
            class="ml-2"
            style="cursor: pointer"
            color="secondary"
            small
            @click="$router.push({ path: `/create_event/` })"
            >mdi-open-in-new
          </v-icon>
        </v-alert>
        <div class="mt-5">
          <div class="d-flex align-center">
            <InfographicIcon icon="mdi-factory" />
            <div class="ml-3 d-flex flex-column">
              <span class="caption">Establecimiento </span>
              <span class="text-caption text-md-body-2 font-weight-bold">
                {{ facility }}
              </span>
            </div>
          </div>
          <div class="text-body-2 mt-5">
            <h4 class="subtitle-2">Justificación</h4>
            {{ har.assessment.compliance_evidence }}
          </div>
          <div class="text-body-2 font-weight-bold mt-5">Recursos</div>
          <AttachFilesCard
            :cant-files="har.assessment.files.length"
            v-on:add-files="addFiles"
            max-height="300"
          >
            <FileCard
              v-for="file in har.assessment.files"
              small
              :key="file.id"
              :file="file"
              v-on:delete-file="deleteFile(file.id)"
              v-on:download-file="downloadFile(file.filename)"
            />
          </AttachFilesCard>
        </div>
      </div>
      <v-spacer />
      <div class="d-flex justify-end">
        <t-btn-secondary @click="closeAssessmentPanel">Cerrar</t-btn-secondary>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import "animate.css";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { tcmtRegApi } from "@/apis";
import AttachFilesCard from "@/components/reusable/AttachFilesCard.vue";
import FileCard from "@/components/reusable/FileCard.vue";
import { INPUTS_LENGTH } from "@/mixins/globals";
import { saveFileAndUploadToS3 } from "@/store/modules/s3upload.js";
import InfographicIcon from "@/components/reusable/InfographicIcon.vue";
import { harPermissions } from "@/mixins/permissions/harPermissions";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";

export default {
  name: "AssessmentPanel",
  components: {
    TBtnSecondary,
    TBtnIcon,
    InfographicIcon,
    FileCard,
    AttachFilesCard,
  },
  mixins: [harPermissions],

  data() {
    return {
      assessmentId: this.$route.query.id,
      dialog: true,
      loading: {
        justification: false,
        fetchAssessment: false,
        deleteAssessmentFile: false,
        deleteAssessment: false,
      },
      facilities: [],
      jusRules: [
        (v) => !!v || "Debe completar este campo",
        (v) =>
          (!!v &&
            v.length <= INPUTS_LENGTH.ASSESSMENT_COMPLIANCE &&
            v.length > 0) ||
          `Max ${INPUTS_LENGTH.ASSESSMENT_COMPLIANCE} caracteres`,
      ],
      lastFileId: 0,
    };
  },

  created() {
    this.getAssessment();
  },

  computed: {
    ...mapState(["har"]),
    ...mapGetters("event", ["getHarFacilities"]),

    revision() {
      return this.har.assessment.current_revision
        ? {
            color: "#44CC7B",
            icon: "mdi-calendar-check-outline",
            tooltip: "Evaluación vigente",
          }
        : {
            color: "currentColor",
            icon: "mdi-calendar-clock-outline",
            tooltip: "Esta evaluación ya no tiene vigencia",
          };
    },

    justification: {
      get() {
        return this.har.assessment.compliance_evidence;
      },
      set(justification) {
        this.set_compliance_evidence(justification);
      },
    },

    tasks() {
      return this.har.tasks;
    },

    facility() {
      return this.har.assessment.facility
        ? this.har.assessment.facility.name
        : "Todos los establecimientos";
    },

    alertMessage() {
      return this.har.assessment.compliance === "NCOM"
        ? `La evaluación deriva en una <strong>No Conformidad Mayor</strong>,
           se recomienda generar un evento crítico para evaluar causas y acciones correctivas.`
        : `Se recomienda crear un evento de tipo <strong>Observación</strong> para este resultado`;
    },

    getComplianceIcon() {
      return this.har.assessmentResults[this.har.assessment.compliance].icon;
    },
  },

  methods: {
    ...mapActions(["set_alert"]),
    ...mapActions("har", ["updateAssessment"]),
    ...mapMutations("har", [
      "set_compliance_evidence",
      "SET_ASSESSMENT",
      "reset_assessment",
      "set_assessment_files",
      "delete_assessment_file",
      "set_assessment_files",
    ]),

    getAssessment() {
      this.loading.fetchAssessment = true;
      tcmtRegApi
        .getFetcher()
        .get(`assessments/${this.assessmentId}`)
        .then((res) => {
          this.SET_ASSESSMENT(res.data);
        })
        .catch(() => {
          this.loading.fetchAssessment = false;
          this.closeAssessmentPanel();
        })
        .finally(() => {
          this.loading.fetchAssessment = false;
        });
    },

    saveJustification() {
      this.loading.justification = true;
      this.updateAssessment()
        .then(() => {
          this.set_alert({
            appAlertType: "succes",
            appAlertMsg: `Justificación actualizada`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Error al actualizar la justificación`,
          });
        })
        .finally(() => {
          this.loading.justification = false;
        });
    },

    closeAssessmentPanel() {
      const lastSlashIndex = this.$route.path.lastIndexOf("/");
      const beforePath = this.$route.path.slice(0, lastSlashIndex);
      this.$router.replace({ path: beforePath });
      this.$emit("update-regulation");
      this.reset_assessment();
      this.set_assessment_files([]);
    },

    deleteFile(fileId) {
      this.loading.deleteAssessmentFile = true;
      tcmtRegApi
        .getFetcher()
        .delete(`assessments/${this.har.assessment.id}/files/${fileId}`)
        .then(() => {
          this.delete_assessment_file(fileId);
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
          this.loading.deleteAssessmentFile = false;
        });
    },

    addFiles(fileList) {
      const assessmentFiles = [];
      [...fileList].forEach((file) => {
        assessmentFiles.push({
          id: `l` + this.lastFileId + 1,
          file: file,
          filename: null,
          size: file.size,
          name: file.name,
          ext: file.name.split(".").pop(),
          description: "",
          uploaded: false,
          uploadPercentage: 0,
          error: false,
          deleting: false,
        });
        this.lastFileId++;
      });
      this.set_assessment_files(assessmentFiles);
      this.har.assessment.files.forEach((file) => {
        if (!file.uploaded) {
          saveFileAndUploadToS3(
            tcmtRegApi.getFetcher(),
            `assessments/${this.har.assessment.id}/add-file`,
            {},
            file
          )
            .then((response) => {
              file.uploaded = true;
              file.id = response.data.id;
            })
            .catch(() => {
              file.error = true;
            });
        }
      });
    },

    openEditAssessmentPanel() {
      this.$router.replace({ name: "new-assessment-panel" });
    },

    deleteAssessment() {
      this.loading.deleteAssessment = true;
      tcmtRegApi
        .getFetcher()
        .delete(`/assessments/${this.har.assessment.id}`)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `La evaluación se eliminó correctamente`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error al tratar de eliminar la evaluación`,
          });
        })
        .finally(() => {
          this.loading.deleteAssessment = false;
          this.closeAssessmentPanel();
        });
    },

    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },
  },
};
</script>

<style scoped>
td {
  font-size: 12px !important;
}
</style>
