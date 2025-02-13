<template>
  <!--  <AppSpinner v-if="fetchData" />-->
  <v-container class="ma-0" fluid>
    <v-tabs v-model="tab" :grow="$vuetify.breakpoint.smAndDown">
      <v-tab> Reporte general </v-tab>
      <v-tab> Reporte individual </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <!-- FECHAS -->
        <v-row class="mt-2">
          <v-col cols="2">
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
                  toDate = null;
                "
                no-title
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="2">
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
        <v-row class="mt-2 flex-row">
          <v-col cols="4">
            <AsyncCombobox
              v-model="facilitySelected2"
              :api="eatApi().getFetcher()"
              url="/facilities/search"
              label="Establecimiento"
              :params="facilityParams"
              item-text="name"
              item-value="id"
              search-param="keyword"
              return-object
              :combobox="false"
              outlined
              dense
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
          <v-col class="ps-0 ms-0 mt-1">
            <t-btn-primary
              @click="createReport"
              :loading="loading"
              :disabled="isDisabled"
              >generar
            </t-btn-primary>
          </v-col>
        </v-row>
        <v-item-group v-model="selected" mandatory class="mt-0">
          <v-row>
            <v-col
              v-for="(item, i) in facilityComputed"
              :key="i"
              cols="6"
              md="4"
            >
              <v-item v-slot="{ active, toggle }">
                <v-card
                  :color="active ? 'primary' : ''"
                  :elevation="active ? 6 : 0"
                  :height="$vuetify.breakpoint.smAndDown ? '' : 200"
                  @click="toggle"
                  :dark="active"
                  outlined
                >
                  <v-card-title>{{ item.facility }}</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col>
                        <span class="text-h3">{{
                          item.events_closed + item.events_opened
                        }}</span>
                        <br />
                        <span class="text-overline">Evento/s creado/s</span>
                      </v-col>
                      <v-col class="text-center">
                        <v-progress-circular
                          :rotate="180"
                          :size="120"
                          :width="15"
                          :value="
                            percent(
                              item.events_closed,
                              item.events_closed + item.events_opened
                            )
                          "
                          :color="active ? 'smokewhite' : ''"
                        >
                          <div class="d-flex flex-column align-center">
                            <span class="text-h6">
                              {{ item.events_closed }}
                            </span>
                            <span>Cerrados</span>
                          </div>
                        </v-progress-circular>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-item>
            </v-col>
          </v-row>
        </v-item-group>
        <v-row class="mt-5" v-if="this.facilityComputed[0]">
          <v-col cols="12" md="6" lg="6" v-if="eventsBySector.length">
            <EventsBySector :data="eventsBySector" />
          </v-col>
          <v-col cols="12" md="6" lg="6" v-if="eventsByOrigin.length">
            <EventsByOrigin :data="eventsByOrigin" />
          </v-col>
          <v-col cols="12" md="6" lg="6" v-if="eventsByOriginAndPa.length">
            <EventsByOriginAndPA :data="eventsByOriginAndPa" />
          </v-col>
          <v-col cols="12" md="6" lg="6" v-if="actionsCompleted.totalActions">
            <ActionsCompleted :data="actionsCompleted" />
          </v-col>
        </v-row>
      </v-tab-item>
      <v-tab-item>
        <IndividualReport />
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</template>

<script>
/* eslint-disable */
import { eatApi } from "@/apis";
import { mapGetters, mapMutations } from "vuex";
import { EVENT_ORIGINS as EO } from "@/mixins/globals";

import EventsBySector from "@/components/reports-page/EventsBySector.vue";
import EventsByOrigin from "@/components/reports-page/EventsByOrigin.vue";
import EventsByOriginAndPA from "@/components/reports-page/EventsByOriginAndPA.vue";
import ActionsCompleted from "@/components/reports-page/ActionsCompleted.vue";
import IndividualReport from "@/components/reports-page/IndividualReport.vue";
import AppSpinner from "@/components/app-page/AppSpinner.vue";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { facilityName } from "@/Filters";
import TBtnPrimary from "@/components/TBtnPrimary.vue";


export default {
  name: "Reports",
  components: {
    TBtnPrimary,
    AsyncCombobox,
    AppSpinner,
    IndividualReport,
    ActionsCompleted,
    EventsByOrigin,
    EventsBySector,
    EventsByOriginAndPA,
  },
  data() {
    return {
      tab: 0,
      selected: 0,
      reports: [],
      eventsByFacility: [],
      facilitySelected: 0,
      selectedFacility: [],
      facilitySelected2: null,
      loading: false,
      fromDateMenu: false,
      fromDate: null,
      toDateMenu: false,
      toDate: null,
      allowedDates: (v) => v >= this.fromDate,
    };
  },

  watch: {
    facilitySelected2(newValue, oldValue) {
      if (!newValue) {
        return (this.reports = []);
      }
    },
  },

  computed: {
    ...mapGetters("user", ["getFacilitiesByUser"]),

    isDisabled() {
      return !this.fromDate || !this.facilitySelected2;
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
    facilityParams() {
      const id = [];
      this.getFacilitiesByUser?.forEach((item) => id.push(item.id));
      return {
        id: id,
      };
    },
    facilityComputed() {
      return this.reports;
    },
    eventsBySector() {
      if (this.facilityComputed[0]) {
        let ebs = [];
        this.facilityComputed[0].events_by_sector.forEach((sector) => {
          if (sector.count) {
            ebs.push({
              sector: sector.name,
              events: sector.count,
            });
          }
        });
        return ebs;
      } else {
        return [];
      }
    },

    eventsByOrigin() {
      if (this.facilityComputed[0]) {
        let ebs = [];
        this.facilityComputed[0].event_by_origin.forEach((origin) => {
          if (origin.count) {
            ebs.push({
              origin: this.nameEventOrigin(origin.name),
              events: origin.count,
            });
          }
        });
        return ebs;
      } else {
        return [];
      }
    },

    eventsByOriginAndPa() {
      if (this.facilityComputed[0]) {
        const eboapServer = this.facilityComputed[0].events_by_origin_and_pa;
        let eboap = [];
        for (let origin in eboapServer) {
          eboap.push({
            Origen: this.nameEventOrigin(origin),
            Calidad: eboapServer[origin].Calidad || null,
            "Medio Ambiente": eboapServer[origin]["Medio Ambiente"] || null,
            Operacion: eboapServer[origin]["Operación"] || null,
            "Sistema Comun de Gestion":
              eboapServer[origin]["Sistema Común de Gestión"] || null,
            SySO: eboapServer[origin]["SySO"] || null,
            Otros: eboapServer[origin].Otros || null,
          });
        }
        let result = this.checkProperties(eboap);
        if (result) {
          return eboap;
        } else {
          return [];
        }
      } else {
        return [];
      }
    },

    actionsCompleted() {
      if (this.facilityComputed[0]) {
        let actions = this.facilityComputed[0];

        let completeAfterDue =
          actions.completed_after_due_date.due_date +
          actions.completed_after_postponed_due_date.postponed_due_date;

        let completeBeforeDue =
          actions.completed_before_due_date.due_date +
          actions.completed_before_postponed_due_date.postponed_due_date;

        let totalActionsComplete = completeAfterDue + completeBeforeDue;

        let sunburstChart = [
          {
            name: "Antes de vencer",
            value: completeBeforeDue,
            children: [
              {
                name: "P",
                value:
                  actions.completed_before_postponed_due_date
                    .postponed_due_date,
              },
              {
                name: "NP",
                value: actions.completed_before_due_date.due_date,
              },
            ],
          },
          {
            name: "Después de vencer",
            value: completeAfterDue,
          },
        ];

        return {
          totalActions: actions.total_actions,
          totalActionsComplete,
          sunburstChart,
        };
      } else {
        return {};
      }
    },
  },

  methods: {
    facilityName,
    ...mapMutations(["START_LOADING", "STOP_LOADING"]),

    eatApi() {
      return eatApi;
    },

    createReport() {
      if (!this.facilitySelected2) {
        this.reports = [];
        return;
      }
      this.loading = true;
      eatApi
        .getFetcher()
        .post(`/reports/reports-main`, {
          facility__id: this.facilitySelected2.id,
          fromDate: this.fromDate,
          toDate: this.toDate,
        })
        .then((response) => {
          this.reports = response.data.results;
          this.loading = false;
        })
        .catch((error) => {
          this.loading = false;
        });
    },

    checkProperties(array) {
      for (let object of array) {
        let values = Object.values(object);
        if (values.every((value) => value === null || value === undefined)) {
          return false;
        }
      }
      return true;
    },

    percent(parcial, total) {
      return Math.round((parcial / total) * 100);
    },

    nameEventOrigin(origin) {
      switch (origin) {
        case EO.MEET:
          return "REU";
        case EO.CHANGE:
          return "GC";
        case EO.EXTERNAL_AUD:
          return "AE";
        case EO.INTERNAL_AUD:
          return "AI";
        case EO.PROJECT:
          return "PROY";
        case EO.INTERNAL_REQ:
          return "RI";
        case EO.EXTERNAL_REQ:
          return "RL";
        case EO.CRITICAL_EVENT:
          return "EC";
        case EO.OBSERVATION:
          return "OBS";
      }
    },
  },
};
</script>

<style scoped></style>
