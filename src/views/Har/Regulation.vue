<template>
  <AppSpinner v-if="loading.regulation" :msg="`Cargando evento ${id}`" />
  <EventLayout v-else>
    <template v-slot:header>
      <div class="pa-5 d-flex">
        <div>
          <h6 class="caption text--secondary">
            REQUERIMIENTO {{ har.regulation.id }}
          </h6>
          <h5 class="text-h5">
            {{ har.regulation.regulation_code }}
          </h5>
          <v-alert
            border="left"
            color="primary"
            dense
            :icon="subjectIcon"
            text
            class="mt-5"
            ><span class="text-body-2 text--primary">{{
              har.regulation.subject
            }}</span>
          </v-alert>
        </div>
        <v-spacer />
        <v-menu
          bottom
          nudge-bottom="40"
          nudge-left="60"
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ on }">
            <v-btn v-on="on" icon plain small color="primary" :ripple="false">
              <v-icon>mdi-file-download-outline</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-2 d-flex flex-column align-start">
            <v-btn
              @click="downloadRegulationReport('xlsx')"
              text
              small
              color="primary"
              :loading="loading.downloadReport.xlsx"
            >
              <v-icon left color="#43A047">mdi-file-excel-outline</v-icon>
              descargar excel
            </v-btn>
            <v-btn
              @click="downloadRegulationReport('csv')"
              text
              small
              color="primary"
              :loading="loading.downloadReport.csv"
            >
              <v-icon left color="#43A047">mdi-file-table-outline</v-icon>
              descargar CSV
            </v-btn>
            <v-btn
              @click="downloadRegulationReport('pdf')"
              text
              small
              color="primary"
              :loading="loading.downloadReport.pdf"
            >
              <v-icon left color="#E57373">mdi-file-document</v-icon>
              descargar pdf
            </v-btn>
          </v-card>
        </v-menu>
        <t-btn-icon
          v-for="action in actionsBtns"
          :key="action.name"
          :color="action.color"
          :tooltip="action.tooltip"
          @click="action.action()"
          v-show="action.visible"
          :loading="action.loading"
        >
          {{ action.icon }}
        </t-btn-icon>
      </div>
      <v-tabs v-model="selection" class="px-5" height="30">
        <v-tab v-for="item in tags" :key="item.name" class="caption">
          {{ item.name }}
        </v-tab>
      </v-tabs>
      <v-divider class="divider mx-5" />
    </template>
    <template v-slot:content>
      <v-tabs-items v-model="selection" class="pa-5 fill-height overflow-auto">
        <v-tab-item v-for="item in tags" :key="item.name" class="fill-height">
          <component :is="item.component" />
        </v-tab-item>
      </v-tabs-items>
      <RouterView v-on:update-regulation="getRegulation" />
    </template>
    <template v-slot:side>
      <v-card flat class="pa-5" height="100%" elevation="22">
        <div class="d-flex justify-space-between">
          <div style="width: 200px">
            <div>
              <span class="text-body-2 text--secondary">Alcance</span>
              <p class="text-body-1">{{ har.tiers[har.regulation.tier] }}</p>
            </div>
            <div v-if="har.regulation.authority" class="mt-4">
              <span class="text-body-2 text--secondary">Autoridad</span>
              <p class="text-body-1">
                {{ har.regulation.authority.name }}
              </p>
            </div>
            <div v-if="har.regulation.link" class="mt-4">
              <span class="text-body-2 text--secondary">Link</span>
              <p class="text-body-1 text-truncate">
                <a
                  :href="har.regulation.link"
                  target="_blank"
                  style="text-decoration: none"
                  >{{ har.regulation.link }}</a
                >
              </p>
            </div>
          </div>
          <div class="ml-3" style="width: 50%">
            <div>
              <span class="text-body-2 text--secondary">Año de emisión</span>
              <p class="text-body-1">
                {{ har.regulation.issue_year || "---" }}
              </p>
            </div>
            <div class="mt-4">
              <span class="text-body-2 text--secondary">Año de revisión</span>
              <p class="text-body-1">
                {{ har.regulation.last_update_year || "---" }}
              </p>
            </div>
            <div v-if="har.regulation.implementation_date" class="mt-4">
              <span class="text-body-2 text--secondary"
                >Fecha de implementación</span
              >
              <p class="text-body-1">
                {{ har.regulation.implementation_date | fechaText }}
              </p>
            </div>
          </div>
        </div>
        <v-divider />
        <h5 class="mt-4 text-body-2 text--secondary">Reseña</h5>
        <p class="text-body-2 mt-1">
          <extend-tooltip
            :text="har.regulation.review"
            trunc-length="400"
            alt-text="Sin Reseña"
          />
        </p>
        <h5 class="mt-4 text-body-2 text--secondary">
          Obligaciones que genera
        </h5>
        <p class="text-body-2 mt-1">
          <extend-tooltip
            :text="har.regulation.obligations"
            trunc-length="400"
            alt-text="Sin obligaciones"
          /></p
      ></v-card>
    </template>
  </EventLayout>
</template>

<script>
import { tcmtRegApi, tcmtReportsApi } from "@/apis";
import { mapActions, mapState } from "vuex";
import AppSpinner from "@/components/app-page/AppSpinner.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import AssessmentsTable from "@/components/har-page/AssessmentsTable.vue";
import TasksTable from "@/components/har-page/RegTasksTable.vue";
import EventLayout from "@/Layouts/EventLayout.vue";
import { harPermissions } from "@/mixins/permissions/harPermissions";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "Regulation",

  components: {
    TBtnIcon,
    EventLayout,
    TasksTable,
    AssessmentsTable,
    ExtendTooltip,
    AppSpinner,
  },

  mixins: [harPermissions],

  data() {
    return {
      id: this.$route.params.id,
      loading: {
        regulation: false,
        deleteRegulation: false,
        downloadReport: {
          pdf: false,
          csv: false,
          xlsx: false,
        },
      },
      selection: null,
      tags: [
        {
          name: "Evaluaciones",
          component: AssessmentsTable,
        },
        {
          name: "Tareas",
          component: TasksTable,
        },
      ],
    };
  },

  computed: {
    ...mapState(["har"]),

    subjectIcon() {
      const icon =
        this.har.regulation.tier !== "INT"
          ? "mdi-scale-balance"
          : "mdi-factory";
      return icon + " mdi-18px";
    },

    actionsBtns() {
      return [
        {
          name: "Editar requerimiento",
          icon: "mdi-pencil-outline",
          color: "primary",
          action: () => this.editRegulation(),
          visible: this.canEditRegulation(),
          tooltip: "Editar requerimiento",
          loading: false,
        },
        {
          name: "Eliminar requerimiento",
          icon: "mdi-delete-outline",
          color: "primary",
          action: () => this.deleteRegulation(),
          visible: this.canDeleteRegulation(),
          tooltip: "Eliminar requerimiento",
          loading: this.loading.deleteRegulation,
        },
      ];
    },
  },

  created() {
    this.loading.regulation = true;
    this.getRegulation();
  },

  methods: {
    ...mapActions(["set_alert"]),
    ...mapActions("har", ["fetchRegulation"]),

    getRegulation() {
      this.fetchRegulation(this.id).finally(() => {
        this.loading.regulation = false;
      });
    },

    downloadRegulationReport(fileType) {
      this.loading.downloadReport[fileType] = true;
      tcmtReportsApi
        .getFetcher()
        .get(`regulations/${this.har.regulation.id}?report_type=${fileType}`)
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
          this.loading.downloadReport[fileType] = false;
        });
    },

    editRegulation() {
      this.$router.push({
        name: `new-regulation-form-reg-page`,
        query: { edit: true },
      });
    },

    deleteRegulation() {
      this.loading.deleteRegulation = true;
      tcmtRegApi
        .getFetcher()
        .delete(`/regulations/${this.id}`)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: "La regulación se eliminó correctamente",
          });
          this.$router.replace({ name: "har" });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "La regulación no pudo ser eliminada",
          });
        })
        .finally(() => {
          this.loading.deleteRegulation = false;
        });
    },
  },
};
</script>

<style scoped>
.divider {
  border-width: 1px;
  position: relative;
  bottom: 2px;
  border-color: rgb(117 182 215 / 30%);
}
</style>
