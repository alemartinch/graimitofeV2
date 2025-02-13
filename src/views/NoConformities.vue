<template>
  <div class="view-container">
    <v-data-table
      height="100%"
      class="d-flex flex-column fill-height"
      :items="noConformities"
      :headers="headers"
      :loading="loading.noConformities"
      loading-text="Cargando no conformidades..."
      hide-default-footer
      fixed-header
      :server-items-length="totalNc"
      :page.sync="page"
      :items-per-page.sync="itemsPerPage"
      :options.sync="options"
      @update:options="getNoConformities"
      @page-count="pageCount = $event"
      sort-by="event_id"
      sort-desc
      :dense="$vuetify.breakpoint.mdAndDown"
    >
      <template v-slot:top>
        <v-row class="d-flex ma-0 align-center">
          <div class="text-h5">No conformidades</div>
          <t-btn-icon
            color="#43A047"
            class="ml-3"
            @click="downloadNCReport"
            :loading="loading.downloadReport"
          >
            mdi-file-excel-outline
          </t-btn-icon>
          <v-spacer />
          <t-btn-primary @click="$router.push({ path: `/events` })"
            ><v-icon left>mdi-arrow-left</v-icon>eventos</t-btn-primary
          >
        </v-row>
        <v-row class="ma-0 py-3">
          <DataFilters
            :data="filterData"
            :loading="loading.noConformities"
            v-on:filter="setFilter"
          />
        </v-row>
      </template>
      <template v-if="noConformities.length" v-slot:body="{ items }">
        <tbody>
          <tr v-for="nc in items" :key="nc.id">
            <td>
              <extend-tooltip :text="nc.description" trunc-length="100" />
            </td>
            <td>
              {{ event.eventOrigins[nc.event_origin].name }}
            </td>
            <td>
              {{ nc.event_id }}
            </td>
            <td>
              {{ nc.finding_id || "---" }}
            </td>
            <td>
              {{ nc.deviation || "---" }}
            </td>
            <!--            <td>-->
            <!--              {{ nc.status }}-->
            <!--            </td>-->
            <td>
              <t-btn-icon
                @click="
                  $router.push({ path: `/events/eventinfo/${nc.event_id}` })
                "
                >mdi-eye-outline</t-btn-icon
              >
            </td>
          </tr>
        </tbody>
      </template>
      <template v-slot:footer>
        <v-divider />
        <TablePagination
          item-name="No conformidades"
          :items-per-page.sync="options.itemsPerPage"
          :page.sync="page"
          :length="pageCount"
          :total-items="totalNc"
          :loading="loading.noConformities"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script>
import qs from "qs";
import { mapActions, mapState } from "vuex";
import { tcmtReportsApi, eatApi } from "@/apis";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TablePagination from "@/components/reusable/TablePagination.vue";
import DataFilters from "@/components/event-page/DataFilters.vue";
import { EVENT_STATUSES } from "@/mixins/globals";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "NoConformities",
  components: {
    TBtnPrimary,
    TBtnIcon,
    DataFilters,
    TablePagination,
    ExtendTooltip,
  },
  data() {
    return {
      noConformities: [],
      filter: {
        status: [
          EVENT_STATUSES.PENDING_ACTIONS,
          EVENT_STATUSES.PENDING_EFFECTIVENESS,
          EVENT_STATUSES.CERTIFICATE,
          EVENT_STATUSES.CLOSE,
        ],
      },
      totalNc: 0,
      options: {},
      pageCount: 0,
      page: 1,
      pagesArray: [5, 10, 15],
      itemsPerPage: 10,
      loading: {
        noConformities: false,
        downloadReport: false,
      },
      headers: [
        {
          text: "Descripción",
          align: "start",
          value: "description",
          sortable: false,
        },
        {
          text: "Tipo de evento",
          align: "start",
          value: "event_origin",
          sortable: false,
        },
        {
          text: "Id Evento",
          align: "start",
          value: "event_id",
          sortable: false,
        },
        {
          text: "Id Hallazgo",
          align: "start",
          value: "finding_id",
          sortable: false,
        },
        {
          text: "Tipo",
          align: "left",
          value: "deviation",
          sortable: false,
        },
        {},
        // {
        //   text: "Estado",
        //   align: "center",
        //   sortable: false,
        // },
      ],
    };
  },

  computed: {
    ...mapState(["event"]),

    filterData() {
      return [
        {
          name: "Área",
          param: "process_areas",
          options: this.processAreas,
          multiple: true,
          type: "",
        },
        {
          name: "Establecimiento",
          param: "facilities",
          options: this.facilities,
          multiple: true,
          type: "",
        },
        {
          name: "Sector",
          param: "sectors",
          options: this.sectors,
          multiple: true,
          type: "",
        },
      ];
    },
    processAreas() {
      return this.event.process_areas.map((pa) => {
        return { key: pa.id, name: pa.name };
      });
    },
    facilities() {
      return this.event.facilities.map((f) => {
        return { key: f.id, name: f.name };
      });
    },
    sectors() {
      if (this.filter.facilities) {
        const facilitiesSelected = this.event.facilities.filter(({ id }) =>
          this.filter.facilities.includes(id)
        );
        const sectorsOfFacilitiesSelected = facilitiesSelected.map(
          ({ sectors }) => sectors
        );
        return sectorsOfFacilitiesSelected.flat().map(({ id, name }) => {
          return { key: id, name };
        });
      } else {
        return [];
      }
    },
  },
  methods: {
    ...mapActions(["set_alert"]),

    setFilter(filter) {
      this.filter = JSON.parse(JSON.stringify(filter));
      this.filter.status = [
        EVENT_STATUSES.PENDING_ACTIONS,
        EVENT_STATUSES.PENDING_EFFECTIVENESS,
        EVENT_STATUSES.CERTIFICATE,
        EVENT_STATUSES.CLOSE,
      ];
      this.filter.page = this.options.page = 1;
      this.getNoConformities();
    },

    getNoConformities() {
      this.loading.noConformities = true;
      if (this.options.sortBy?.length) {
        this.filter.ordering = this.options.sortDesc[0]
          ? `-${this.options.sortBy[0]}`
          : this.options.sortBy[0];
      } else {
        delete this.filter.ordering;
      }
      if (this.filter.page === this.options.page) {
        this.filter.page = this.options.page = 1;
      } else {
        this.filter.page = this.options.page;
      }
      this.filter.page_size = this.options.itemsPerPage;
      eatApi
        .getFetcher()
        .get(`/reports/no-conformity`, {
          params: this.filter,
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then((res) => {
          this.noConformities = res.data.results;
          this.totalNc = res.data.totalItems;
        })
        .catch(() => {})
        .finally(() => (this.loading.noConformities = false));
    },

    downloadNCReport() {
      this.loading.downloadReport = true;
      let params = JSON.parse(JSON.stringify(this.filter));
      delete params.page;
      delete params.page_size;
      params.report_type = "xlsx";
      tcmtReportsApi
        .getFetcher()
        .get(`events/no-conformity`, {
          params,
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then((res) => {
          const url = res.data.download_url;
          window.open(url, "_blank");
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Error al descargar el reporte",
          });
        })
        .finally(() => {
          this.loading.downloadReport = false;
        });
    },
  },
};
</script>

<style scoped>
td {
  border-bottom: none !important;
}
</style>
