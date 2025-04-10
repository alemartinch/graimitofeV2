<template>
  <div>
    <LayoutPanel>
      <template v-slot:header="{ toggleFilters, showFilters }">
        <span class="text-h5">Panel de eventos</span>
        <v-spacer />
        <t-btn-primary
          :loading="loading.downloadReport"
          @click="downloadEventsReport"
          class="mr-10"
        >
          <v-icon left color="#43A047">mdi-file-excel-outline</v-icon>
          descargar reporte
        </t-btn-primary>
        <t-btn-primary
          @click="$router.push({ path: `/events/noconformities` })"
          class="align-self-center"
          >No conformidades<v-icon right>mdi-arrow-right</v-icon></t-btn-primary
        >
        <v-tooltip left open-delay="500">
          <template v-slot:activator="{ on }">
            <v-btn
              @click="toggleFilters"
              class="px-0"
              color="primary"
              outlined
              text
              v-on="on"
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
        <EventsTable />
      </template>
      <template v-slot:filters>
        <FiltersPanel
          :data="filters"
          :default-filter="defaultFilter"
          v-on:set-filters="setEventsFilters"
          :set-filter="filtersCurrent"
          :loading="event.loading.fetchEvents"
        />
      </template>
    </LayoutPanel>
    <RouterView />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { tcmtReportsApi, eatApi } from "@/apis";
import { EVENT_STATUSES } from "../../mixins/globals/index.js";
import LayoutPanel from "@/Layouts/LayoutPanel.vue";
import FiltersPanel from "@/views/Har/FiltersPanel.vue";
import EventsTable from "@/views/EventsPanel/EventsTable.vue";
import qs from "qs";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import { getSixMonthsAgo, getToday } from "../../store/modules/helpers.js";

export default {
  name: "index.vue",
  components: { TBtnPrimary, EventsTable, FiltersPanel, LayoutPanel },

  data() {
    return {
      loading: { downloadReport: false },
      apiTags: [],
      id: [],
    };
  },

  created() {
    eatApi
      .getFetcher()
      .get("/tags/", {
        params: {
          page: 1,
          page_size: 30,
        },
      })
      .then(({ data }) => {
        this.apiTags = data.results;
      });
  },

  computed: {
    ...mapState(["event", "fca", "dateRangeOptions", "user"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserOnlySme",
      "getFacilitiesByUser",
    ]),

    defaultFilter() {
      const filter = {
        status_not: EVENT_STATUSES.OPEN,
        ordering: "-id",
        /*occurrence_date_after: getSixMonthsAgo,
        occurrence_date_before: getToday,*/
      };
      return filter;
    },

    filtersCurrent() {
      const { page, page_size, ...filter } = this.event.eventsFilters;
      return filter;
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
            { key: "id", name: "ID" },
            { key: "occurrence_date", name: "Fecha ocurrencia" },
          ],
          divider: true,
          multiple: false,
        },
        {
          name: "Fecha de ocurrencia",
          param: ["occurrence_date_after", "occurrence_date_before"],
          label: "Cualquier momento",
          type: "date-range",
          options: [...this.dateRangeOptions],
          divider: false,
          multiple: false,
        },
        {
          name: "Originador",
          param: "originator__id",
          type: "async",
          params: {
            access_facilities__id: this.getFacilitiesByUser.map((f) => f.id),
          },
          attrs: {
            label: "Todos los usuarios",
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
          param: "facility__id",
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
        // ordenado alfabeticamente

        {
          name: "Área de gestión",
          label: "Todas las áreas",
          param: "process_areas",
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
          options: Object.entries(this.event.statuses).map(([key, { abb }]) => {
            return { key, name: abb };
          }),
          divider: false,
          multiple: true,
        },
        {
          name: "Etiquetas",
          label: "Todas",
          param: "tags",
          type: "select",
          options: this.apiTags.map((tag) => {
            return { key: tag.id, name: tag.name };
          }),
          divider: false,
          multiple: true,
        },
        {
          name: "ID",
          param: "id",
          type: "text",
        },
        {
          name: "Líder",
          label: "Todos los usuarios",
          param: "leader__id",
          type: "select",
          options: this.event.users.map((u) => {
            return { key: u.id, name: `${u.first_name} ${u.last_name}` };
          }),
          divider: false,
          multiple: true,
        },
        {
          name: "Origen del evento",
          label: "Todos los orígenes",
          param: "event_origin",
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
          name: "Palabras claves",
          param: "keyword",
          type: "text",
        },
      ];
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("event", ["set_events_filter", "set_events"]),
    ...mapActions("event", ["get_events"]),

    setEventsFilters(filters) {
      this.set_events_filter({ ...filters, page: 1 });
      this.get_events();
    },

    downloadEventsReport() {
      this.loading.downloadReport = true;
      let params = JSON.parse(JSON.stringify(this.event.eventsFilters));
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
        .get(`events/filtered`, {
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
