<template>
  <v-dialog v-model="dialog" width="600">
    <template v-slot:activator="{ on }">
      <div class="d-flex justify-center flex-column">
        <span class="text-caption">NUEVO REPORTE</span>
        <t-btn-icon :loading="loading" class="align-self-center" v-on="on"
          >mdi-plus
        </t-btn-icon>
      </div>
    </template>
    <v-card>
      <v-card-title> Nuevo reporte individual </v-card-title>
      <v-card-text style="height: 600px; overflow: auto" class="text--black">
        <v-form ref="form">
          <!-- FECHAS -->
          <v-row>
            <v-col>
              <div class="body-2">
                Fecha desde <span style="color: red">*</span>
              </div>
              <v-menu
                v-model="fromDateMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    :value="fromDateFormatted"
                    prepend-inner-icon="mdi-calendar-outline"
                    solo
                    flat
                    outlined
                    dense
                    readonly
                    v-on="on"
                    hide-details
                    autocomplete="off"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="fromDate"
                  @input="
                    fromDateMenu = false;
                    toDate = '';
                  "
                  no-title
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col>
              <div class="body-2">
                Fecha hasta <span style="color: red">*</span>
              </div>
              <v-menu
                v-model="toDateMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    :value="toDateFormatted"
                    prepend-inner-icon="mdi-calendar-outline"
                    solo
                    flat
                    outlined
                    dense
                    readonly
                    v-on="on"
                    hide-details
                    autocomplete="off"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="toDate"
                  @input="toDateMenu = false"
                  no-title
                  :allowed-dates="allowedDates"
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>

          <!-- ESTABLECIMIENTO Y SECTOR -->
          <v-row>
            <v-col cols="12 pb-0">
              <div class="body-2 font-weight-bold">Establecimiento</div>
              <AsyncCombobox
                v-model="facility"
                :api="eatApi().getFetcher()"
                url="/facilities/search"
                item-text="name"
                search-param="keyword"
                return-object
                multiple
                :combobox="false"
                outlined
                dense
                :params="facilityParams"
                prepend-inner-icon="mdi-factory"
              >
                <template v-slot:item="{ item }">
                  <span>{{ item.name }}</span>
                </template>
                <template v-slot:selection="data">
                  <v-chip
                    class="py-3"
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    small
                  >
                    {{ data.item | facilityName }}
                  </v-chip>
                </template>
              </AsyncCombobox>
            </v-col>
            <v-col v-if="facility" cols="12 pt-0">
              <div class="body-2 font-weight-bold">
                Sectores de {{ facility.name }}
              </div>
              <v-select
                v-model="sector"
                :items="sectorsAvailable"
                multiple
                label="Sectores"
                item-text="name"
                item-value="id"
                return-object
                chips
                outlined
              >
              </v-select>
            </v-col>
          </v-row>

          <!--AREAS DE GESTION-->
          <v-row>
            <v-col cols="12">
              <div class="body-2 font-weight-bold">Area de gestión</div>
              <v-chip-group
                v-model="processArea"
                active-class="white--text text--accent-4 primary"
                multiple
                column
              >
                <v-chip
                  v-for="item in process_areas"
                  :key="item.id"
                  :value="item"
                  label
                  filter
                >
                  {{ item.name | reduceText }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>

          <!-- ORIGEN -->
          <v-row>
            <v-col cols="12">
              <div class="body-2 font-weight-bold">Origen</div>
              <v-chip-group
                v-model="origin"
                active-class="white--text text--accent-4 primary"
                multiple
                column
              >
                <v-chip
                  v-for="item in origins"
                  :key="item.key"
                  :value="item"
                  label
                  filter
                >
                  {{ item.name | reduceText }}
                </v-chip>
              </v-chip-group>
            </v-col>
            <v-col cols="12">
              <div class="body-2 font-weight-bold">Estado del evento</div>
              <v-chip-group
                v-model="status"
                active-class="white--text text--accent-4 primary"
                column
              >
                <v-chip
                  v-for="(item, i) in statuses"
                  :key="i"
                  :value="item"
                  label
                  filter
                >
                  {{ item.name | reduceText }}
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <t-btn-icon @click="cleanFilters" :disabled="loading">
          mdi-broom
        </t-btn-icon>
        <div class="flex-grow-1"></div>
        <t-btn-secondary
          @click="
            dialog = false;
            cleanFilters();
          "
          :disabled="loading"
          >Cerrar
        </t-btn-secondary>
        <t-btn-primary
          @click="generateReport"
          :loading="loading"
          :disabled="!fromDate || !toDate"
          >generar reporte
        </t-btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { EVENT_STATUSES, EVENT_ORIGINS } from "@/mixins/globals";
import _ from "lodash";
import { eatApi } from "@/apis";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { facilityName, reduceText } from "@/Filters";

export default {
  name: "NewIndReportForm",
  components: { AsyncCombobox, TBtnIcon, TBtnPrimary, TBtnSecondary },
  data() {
    return {
      loading: false,
      dialog: false,
      fromDateMenu: false,
      fromDate: null,
      toDateMenu: false,
      toDate: null,
      allowedDates: (v) => v >= this.fromDate,
      facilities: [],
      process_areas: [],
      facility: [],
      sector: [],
      processArea: [],
      origin: [],
      status: null,
      showParams: null,
      statuses: [
        {
          name: "Abiertos",
          key: [
            EVENT_STATUSES.PENDING_ACTIONS,
            EVENT_STATUSES.PENDING_EFFECTIVENESS,
            EVENT_STATUSES.CERTIFICATE,
          ],
        },
        { name: "Cerrados", key: [EVENT_STATUSES.CLOSE] },
      ],
      origins: [
        {
          key: EVENT_ORIGINS.CHANGE,
          name: "Gestión de cambio",
        },
        {
          key: EVENT_ORIGINS.INTERNAL_AUD,
          name: "Auditoría interna",
        },
        {
          key: EVENT_ORIGINS.EXTERNAL_AUD,
          name: "Auditoría externa",
        },
        {
          key: EVENT_ORIGINS.INTERNAL_AUD,
          name: "Requerimiento interno",
        },
        {
          key: EVENT_ORIGINS.EXTERNAL_REQ,
          name: "Requerimiento Legal",
        },
        {
          key: EVENT_ORIGINS.PROJECT,
          name: "Proyecto",
        },
        {
          key: EVENT_ORIGINS.CRITICAL_EVENT,
          name: "Evento Crítico",
        },
        {
          key: EVENT_ORIGINS.OBSERVATION,
          name: "Observación",
        },
      ],
    };
  },
  created() {
    this.getData();
  },
  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["getFacilitiesByUser"]),

    sectorsAvailable() {
      if (!this.facility) {
        return null;
      } else {
        const sect = [];
        this.facility.forEach((item) => {
          if (item.sectors) {
            item.sectors.forEach((sector) => {
              sect.push(sector);
            });
          }
        });
        return sect;
      }
    },

    facilityParams() {
      const id = [];
      this.getFacilitiesByUser.forEach((item) => id.push(item.id));
      return {
        id: id,
      };
    },

    fromDateFormatted() {
      if (!this.fromDate) return null;
      const [year, month, day] = this.fromDate.split("-");
      return `${day}-${month}-${year}`;
    },

    toDateFormatted() {
      if (!this.toDate) return null;
      if (this.toDate === new Date().toISOString().substr(0, 10)) {
        return "HOY";
      }
      const [year, month, day] = this.toDate.split("-");
      return `${day}-${month}-${year}`;
    },
  },
  methods: {
    reduceText,
    facilityName,
    ...mapActions(["set_alert"]),
    ...mapMutations("user", ["add_rFilter"]),

    eatApi() {
      return eatApi;
    },

    getData() {
      this.loading = true;
      eatApi
        .getFetcher()
        .get("/pages/new-event")
        .then((res) => {
          this.facilities = res.data.results.facilities;
          this.process_areas = res.data.results.process_areas;
          this.loading = false;
        });
    },

    cleanFilters() {
      this.fromDate = null;
      this.toDate = null;
      this.facility = [];
      this.sector = [];
      this.processArea = [];
      this.origin = [];
      this.status = null;
    },

    generateReport() {
      this.loading = true;
      let params = {
        from_date: this.fromDate,
        to_date: this.toDate,
        facilities: this.facility.map((f) => f.id),
        sectors: this.sector.map((f) => f.id),
        process_areas: this.processArea.map((p) => p.id),
        event_origins: this.origin.map((o) => o.key),
        status: this.status ? _.flatten(this.status.key) : [],
      };
      eatApi
        .getFetcher()
        .post("/reports/individual-report", params)
        .then((res) => {
          const filters = {
            fromDate: this.fromDate,
            toDate: this.toDate,
            facility: this.facility,
            sector: this.sector,
            processArea: this.processArea,
            origin: this.origin,
            status: this.status,
          };
          this.add_rFilter({ report: res.data.results, filters });
          this.dialog = false;
          this.loading = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: `Error al generar el reporte`,
          });
          this.dialog = false;
          this.loading = false;
        });
      // this.cleanFilters()
    },
    loadReport(report) {
      this.fromDate = report.fromDate;
      this.toDate = report.toDate;
      this.facility = report.facility;
      this.dialog = true;
    },
  },
};
</script>
