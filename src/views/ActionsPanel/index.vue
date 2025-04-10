<template>
  <div>
    <LayoutPanel>
      <template v-slot:header="{ toggleFilters, showFilters }">
        <span class="text-h5">Panel de acciones</span>
        <v-spacer />
        <t-btn-primary
          class="mr-10"
          :loading="loading.downloadReport"
          @click="downloadActionsReport"
        >
          <v-icon left color="#43A047">mdi-file-excel-outline</v-icon>
          descargar reporte
        </t-btn-primary>
        <v-tooltip left open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              text
              outlined
              class="px-0"
              color="primary"
              v-on="on"
              @click="toggleFilters"
            >
              <v-icon>{{
                showFilters ? "mdi-chevron-right" : "mdi-chevron-left"
              }}</v-icon>
              <v-icon>mdi-filter-outline</v-icon>
            </v-btn>
          </template>
          {{ showFilters ? "Esconder filtros" : "Mostrar filtros" }}
        </v-tooltip>
      </template>
      <template v-slot:content>
        <ActionsTable />
      </template>
      <template v-slot:filters>
        <FiltersPanel
          :data="filters"
          :default-filter="defaultFilter"
          v-on:set-filters="setActionsFilters"
          :set-filter="filtersCurrent"
          :loading="fca.loading.fetchActions"
        />
      </template>
    </LayoutPanel>
    <RouterView v-on:close-action-resume="get_actions" />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import LayoutPanel from "@/Layouts/LayoutPanel.vue";
import FiltersPanel from "@/views/Har/FiltersPanel.vue";
import ActionsTable from "@/components/actions-page/ActionsTable.vue";
import { tcmtReportsApi, eatApi } from "@/apis";
import qs from "qs";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import { getSixMonthsAgo, getToday } from "../../store/modules/helpers.js";

export default {
  name: "index.vue",
  components: { TBtnPrimary, FiltersPanel, LayoutPanel, ActionsTable },
  data() {
    return {
      loading: { downloadReport: false },
      id: [],
    };
  },
  computed: {
    ...mapState(["event", "fca", "dateRangeOptions"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserOnlySme",
      "getFacilitiesByUser",
    ]),

    defaultFilter() {
      const filter = {
        parent_event__status_not: "OPEN",
        ordering: "status",
        owner__id: [this.isCurrentUserOnlySme ? "" : this.currentUserId],
        /*due_date_after: getSixMonthsAgo,
        due_date_before: getToday,*/
      };

      return filter;
    },

    filtersCurrent() {
      const { page, page_size, ...filter } = this.fca.actionsFilters;
      return {
        owner__id: [this.isCurrentUserOnlySme ? "" : this.currentUserId],
        ...filter,
      };
    },

    facilityParams() {
      this.getFacilitiesByUser?.forEach((item) => this.id.push(item.id));
      return this.id;
    },

    filters() {
      return [
        {
          name: "Ordenar por",
          param: "ordering",
          type: "select",
          options: [
            { key: "status", name: "Estado" },
            { key: "due_date", name: "Vencimiento" },
          ],
          divider: true,
          multiple: false,
        },
        {
          name: "Vencimiento",
          param: ["due_date_after", "due_date_before"],
          label: "Cualquier momento",
          type: "date-range",
          options: [...this.dateRangeOptions],
          divider: false,
          multiple: false,
        },
        {
          name: "Palabras claves",
          param: "keyword",
          type: "text",
        },
        {
          name: "Responsable",
          label: "Todos los usuarios",
          param: "owner__id",
          type: "async",
          params: {
            access_facilities__id: this.getFacilitiesByUser.map((f) => f.id),
          },
          attrs: {
            api: eatApi.getFetcher(),
            url: "/auth/users/search",
            searchParam: "keyword",
            "item-value": "id",
          },
          customFilter: (item, queryText) => {
            const first_name = item.first_name.toLowerCase();
            const last_name = item.last_name.toLowerCase();
            const searchText = queryText.toLowerCase();
            return (
              first_name.indexOf(searchText) > -1 ||
              last_name.indexOf(searchText) > -1
            );
          },
          slots: {
            itemSlot: (item) =>
              `<span>${item.first_name} ${item.last_name}</span>`,
            selectionSlot: (item) =>
              `<span>${item.first_name} ${item.last_name},&nbsp </span>`,
          },
          divider: false,
          multiple: true,
        },
        {
          name: "Establecimiento",
          param: "parent_event__facility__id",
          type: "async",
          // options: store.getters["user/getFacilitiesByUser"].length
          //   ? store.getters["user/getFacilitiesByUser"].map((f) => {
          //       return { key: f.id, name: f.name };
          //     })
          //   : this.event.facilities.map((f) => {
          //       return { key: f.id, name: f.name };
          //     }),
          params: {
            id: this.facilityParams,
          },
          attrs: {
            label: "Todos los Establecimientos",
            api: eatApi.getFetcher(),
            url: "/facilities/search",
            searchParam: "keyword",
            "item-value": "id",
          },
          customFilter: (item, queryText) => {
            const name = item.name.toLowerCase();
            const searchText = queryText.toLowerCase();
            return name.indexOf(searchText) > -1;
          },
          slots: {
            itemSlot: (item) => `<span>${item.name}</span>`,
            selectionSlot: (item) => `<span>${item.name},&nbsp </span>`,
          },
          divider: true,
          multiple: true,
        },
        //ordenado alfabeticamente
        {
          name: "Área de gestión",
          label: "Todas las áreas",
          param: "parent_event__process_areas",
          type: "select",
          options: this.event.process_areas.map((pa) => {
            return { key: pa.id, name: pa.name };
          }),
          divider: false,
          multiple: true,
        },
        {
          name: "Estado",
          label: "Todos los estados",
          param: "status",
          type: "select",
          options: Object.entries(this.fca.statuses).map(([key, { abb }]) => {
            return { key, name: abb };
          }),
          divider: false,
          multiple: true,
        },
        {
          name: "ID del Evento",
          param: "parent_event__id",
          type: "text",
        },
        {
          name: "Origen del evento",
          label: "Todos los orígenes",
          param: "parent_event__event_origin",
          type: "select",
          options: Object.entries(this.event.eventOrigins)
            .map(([key, { name }]) => {
              return { key, name };
            })
            .filter((item) => {
              return item.key !== "LREQ" && item.key !== "IREQ";
            }),
          divider: false,
          multiple: true,
        },
        {
          name: "Sector",
          label: "Seleccione antes Establecimiento",
          param: "parent_event__sector__id",
          type: "select",
          options: this.sectors,
          divider: true,
          multiple: true,
        },
      ];
    },

    sectors() {
      if (this.fca.actionsFilters.parent_event__facility__id) {
        const facilitiesSelected = this.event.facilities.filter(({ id }) =>
          this.fca.actionsFilters.parent_event__facility__id.includes(id),
        );
        const sectorsOfFacilitiesSelected = facilitiesSelected.map(
          ({ sectors }) => sectors,
        );
        return sectorsOfFacilitiesSelected.flat().map(({ id, name }) => {
          return { key: id, name: name };
        });
      } else {
        return [];
      }
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("fca", ["set_actions_filter", "set_actions"]),
    ...mapActions("fca", ["get_actions"]),

    setActionsFilters(filters) {
      this.set_actions_filter({ ...filters, page: 1 });
      this.get_actions();
    },

    downloadActionsReport() {
      this.loading.downloadReport = true;
      let params = JSON.parse(JSON.stringify(this.fca.actionsFilters));
      Object.keys(params).forEach(
        (key) =>
          (params[key] === null || params[key] === undefined) &&
          delete params[key],
      );
      delete params.page;
      delete params.page_size;
      params.report_type = "xlsx";
      tcmtReportsApi
        .getFetcher()
        .get(`actions/filtered`, {
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
          this.SET_ALERT({
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

<style scoped></style>
