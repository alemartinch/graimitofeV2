<template>
  <v-dialog :value="dialog" width="800" persistent>
    <v-card class="pa-2" v-if="loading">
      <v-progress-linear indeterminate />
    </v-card>
    <v-card v-else>
      <DialogLayout>
        <template v-slot:header>
          <v-card-title class="d-block">
            <div class="caption text--secondary d-flex align-center">
              <v-icon small color="primary" style="opacity: 0.6" class="mr-2">
                {{
                  regulation.tier !== "INT"
                    ? "mdi-scale-balance"
                    : "mdi-factory"
                }}
              </v-icon>
              <span
                >REQUERIMIENTO {{ regulation.id }} /
                {{ har.tiers[regulation.tier].toUpperCase() }}</span
              >
            </div>
            <h6 class="text-h6 ml-6">{{ regulation.regulation_code }}</h6>
          </v-card-title>
          <v-card-subtitle class="mt-5">
            <v-alert border="left" color="primary" dense text
              ><span class="text--secondary">{{ regulation.subject }}</span>
            </v-alert>
          </v-card-subtitle>
        </template>
        <template v-slot:content>
          <div>
            <h5 class="mt-4 text-body-2 text--secondary">Reseña</h5>
            <p
              class="text-body-2 mt-1"
              :class="{ 'font-italic': !regulation.review }"
            >
              {{ regulation.review || "No se ha cargado ninguna reseña" }}
            </p>
            <h5 class="mt-4 text-body-2 text--secondary">
              Obligaciones que genera
            </h5>
            <p
              class="text-body-2 mt-1"
              :class="{ 'font-italic': !regulation.obligations }"
            >
              {{
                regulation.obligations || "No se ha cardo ninguna obligación"
              }}
            </p>
          </div>
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
              small
              tooltip="Ampliar"
              @click="goToRegulationPage(regulation.id)"
            >
              mdi-book-open
            </t-btn-icon>
            <t-btn-icon
              small
              tooltip="Evaluar"
              v-if="!infoDialog"
              @click="newAssessment"
            >
              mdi-clipboard-edit-outline
            </t-btn-icon>
            <t-btn-icon
              small
              tooltip="Editar"
              v-if="!infoDialog"
              @click="editRegulation"
              >mdi-pencil-outline
            </t-btn-icon>
            <t-btn-icon
              small
              tooltip="Eliminar"
              v-if="canDeleteRegulation() && !infoDialog"
              color="error"
              @click="alertDialog = true"
            >
              mdi-delete-outline
            </t-btn-icon>
            <v-divider class="my-3" />
            <div>
              <span class="text-body-2 text--secondary">Alcance</span>
              <p class="text-body-1">{{ har.tiers[regulation.tier] }}</p>
            </div>
            <div v-if="regulation.authority" class="mt-4">
              <span class="text-body-2 text--secondary">Autoridad</span>
              <p class="text-body-1">
                {{ regulation.authority.name }}
              </p>
            </div>
            <div>
              <span class="text-body-2 text--secondary">Año de emisión</span>
              <p class="text-body-1">
                {{ regulation.issue_year || "---" }}
              </p>
            </div>
            <div>
              <span class="text-body-2 text--secondary">Año de revisión</span>
              <p class="text-body-1">
                {{ regulation.last_update_year || "---" }}
              </p>
            </div>
            <div v-if="har.regulation.implementation_date">
              <span class="text-body-2 text--secondary"
                >Fecha de implementación</span
              >
              <p class="text-body-1">
                {{ regulation.implementation_date | fechaText }}
              </p>
            </div>
            <div class="d-flex align-center mt-5">
              <InfographicIcon icon="mdi-clipboard-outline" small />
              <span class="font-weight-medium ml-2"
                >{{ regulation.assessments.length }} evaluaciones</span
              >
            </div>
            <div class="d-flex align-center mt-2">
              <InfographicIcon icon="mdi-repeat" small />
              <span class="font-weight-medium ml-2"
                >{{ regulation.repet_actions.length }} tareas</span
              >
            </div>
          </div>
        </template>
        <template v-slot:actions
          ><v-card-actions class="pa-3 justify-end elevation-22">
            <t-btn-secondary @click="close">Cerrar </t-btn-secondary>
          </v-card-actions></template
        >
      </DialogLayout>
      <GlobalPrompt
        title="Eliminar requerimiento"
        :active="alertDialog"
        prompt-type="alert"
      >
        <template v-slot:message>
          Se borrarán todos los datos del requerimiento así cómo las
          evaluaciones, tareas y archivos relacionados a la misma.
        </template>
        <template v-slot:cancel>
          <t-btn-secondary
            :disabled="deleteLoading"
            @click="alertDialog = false"
          >
            Cancelar
          </t-btn-secondary>
        </template>
        <template v-slot:accept>
          <t-btn-delete :loading="deleteLoading" @click="deleteRegulation">
            Eliminar requerimiento
          </t-btn-delete>
        </template>
      </GlobalPrompt>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { tcmtRegApi } from "@/apis";
import InfographicIcon from "@/components/reusable/InfographicIcon.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import { harPermissions } from "@/mixins/permissions/harPermissions";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import DialogLayout from "@/Layouts/DialogLayout.vue";

export default {
  name: "RegulationResume",
  components: {
    DialogLayout,
    TBtnDelete,
    TBtnSecondary,
    TBtnIcon,
    InfographicIcon,
    GlobalPrompt,
  },
  mixins: [harPermissions],
  props: {
    noRoute: {
      type: Boolean,
      default: false,
    },
    regId: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      dialog: true,
      loading: true,
      deleteLoading: false,
      alertDialog: false,
    };
  },

  created() {
    const regulationId = this.$route.query.id || this.regId;
    this.getRegulations(regulationId);
  },

  computed: {
    ...mapState(["har"]),

    infoDialog() {
      return this.$route.name === "regulation-resume-tasks";
    },

    regulation() {
      return this.har.regulation;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("har", ["set_regulation", "reset_regulation"]),

    close() {
      this.reset_regulation();
      if (this.noRoute) {
        this.$emit("close-dialog");
      } else {
        this.$router.go(-1);
      }
    },

    newAssessment() {
      this.$router.push({
        path: `/har/regulations/${this.regulation.id}/new-assessment-panel`,
      });
    },

    editRegulation() {
      this.$router.replace({
        name: `new-regulations-form`,
        query: { edit: true },
      });
    },

    deleteRegulation() {
      this.deleteLoading = true;
      tcmtRegApi
        .getFetcher()
        .delete(`regulations/${this.har.regulation.id}`)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `El requerimiento ha sido eliminada`,
          });
          this.$emit("update-regulations");
          this.$router.go(-1);
        })
        .finally(() => {
          this.deleteLoading = true;
          this.alertDialog = false;
          this.reset_regulation();
        });
    },

    getRegulations(idRegulation) {
      this.loading = true;
      tcmtRegApi
        .getFetcher()
        .get(`regulations/${idRegulation}`)
        .then((res) => {
          this.set_regulation(res.data);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },

    goToRegulationPage(regId) {
      this.$router.push({ path: `/har/regulations/${regId}` });
    },
  },
};
</script>

<style scoped>
.data-container {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
}
</style>
