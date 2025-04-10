<template>
  <div>
    <LayoutPanel>
      <template v-slot:header="{ toggleFilters, showFilters }">
        <span class="text-h5">Panel de tareas</span>
        <v-spacer />
        <t-btn-primary
          :loading="loading.downloadReport"
          @click="createNewTask"
          class="mr-10"
          :disabled="isExternal"
        >
          nueva tarea
        </t-btn-primary>
        <t-btn-primary
          :loading="loading.downloadReport"
          @click="downloadTasksReport"
          class="mr-10"
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
        <OccurrencesTable />
      </template>
      <template v-slot:filters>
        <FiltersPanel
          :data="filters"
          :default-filter="defaultFilter"
          v-on:set-filters="setTasksFilters"
          :set-filter="filtersCurrent"
          :loading="har.loadings.fetchOccurrences"
        />
      </template>
    </LayoutPanel>
    <RouterView v-on:update-regulation="fetchOccurrences" />
  </div>
</template>

<script>
import LayoutPanel from "@/Layouts/LayoutPanel.vue";
import FiltersPanel from "@/views/Har/FiltersPanel.vue";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import OccurrencesTable from "@/components/har-page/OccurrencesTable.vue";
import { eatApi, tcmtReportsApi } from "@/apis";
import qs from "qs";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import store from "@/store";
import { getSixMonthsAgo, getToday } from "../store/modules/helpers.js";

export default {
  name: "Tasks",
  components: { TBtnPrimary, OccurrencesTable, FiltersPanel, LayoutPanel },
  data() {
    return {
      itemsPerPage: this.isNotebook ? 6 : 8,
      loading: { downloadReport: false },
      id: [],
    };
  },
  computed: {
    ...mapState(["dateRangeOptions", "har", "event"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserOnlySme",
      "getFacilitiesByUser",
    ]),

    defaultFilter() {
      const filter = {
        ordering: "status,due_date",
        owner_id: [this.isCurrentUserOnlySme ? "" : this.currentUserId],
        /*due_date_after: getSixMonthsAgo,
        due_date_before: getToday,*/
      };

      return filter;
    },

    filtersCurrent() {
      const { page, page_size, ...filter } =  this.har.occurrencesFilters;
      return {
        owner_id: [this.isCurrentUserOnlySme ? "" : this.currentUserId],
        ...filter,
      };

    },

    facilityParams() {
      this.getFacilitiesByUser?.forEach((item) => this.id.push(item.id));
      return this.id;
    },

    isExternal() {
      return !!store.getters["user/currentUserRoles"]?.includes("BASE");
    },

    filters() {
      return [
        {
          name: "Ordenar por",
          param: "ordering",
          type: "select",
          options: [
            { key: "repet_action_id", name: "Tarea" },
            { key: "status,due_date", name: "Estado" },
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
          name: "Responsable",
          label: "Todos los usuarios",
          param: "owner_id",
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
          param: "facility_id",
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
          name: "Alcance",
          label: "Todos los alcances",
          param: "tier",
          type: "select",
          options: Object.entries(this.har.tiers)
            .map(([key, name]) => {
              return { key, name };
            })
            .filter((t) => t.key !== "OTR"),
          divider: false,
          multiple: true,
          children: [
            {
              name: "Requerimiento",
              label: "Sin requerimiento asociado",
              param: "is_standalone",
              type: "checkbox",
              parent_value_link: [],
            },
          ],
        },
        {
          name: "Área de gestión",
          label: "Todas las áreas",
          param: "process_area_id",
          type: "select",
          options: this.event.process_areas.map((pa) => {
            return { key: pa.id, name: pa.name };
          }),
          divider: false,
          multiple: true,
        },
        {
          name: "Descripción",
          param: "description",
          label: "Cualquier descripción",
          type: "text",
          divider: false,
        },
        {
          name: "Estado",
          label: "Todos los estados",
          param: "status",
          type: "select",
          options: Object.entries(this.har.taskStatuses).map(
            ([key, { name }]) => {
              return { key, name };
            }
          ),
          divider: false,
          multiple: true,
          children: [
            {
              name: "Pre-aviso activo",
              label: "Con preaviso activo",
              param: "is_pre_warning_time",
              type: "checkbox",
              options: [true, false],
              parent_value_link: ["20PEND"],
            },
          ],
        },
        {
          name: "En proceso",
          label: "En proceso",
          param: "in_progress",
          type: "checkbox",
          divider: false,
          multiple: false,
        },
        {
          name: "ID Tarea",
          param: "repet_action_id",
          label: "Todas las tareas",
          type: "number",
          divider: false,
        },
        {
          name: "ID Requerimiento asociada",
          param: "regulation_id",
          label: "Todos los requerimientos",
          type: "number",
          divider: false,
        },
      ];
    },
  },
  methods: {
    ...mapMutations("har", [
      "set_occurrences_filters",
      "reset_regulation",
      "reset_task",
      "reset_occurrence",
    ]),
    ...mapActions("har", ["fetchOccurrences"]),

    setTasksFilters(filters) {
      this.set_occurrences_filters({
        ...filters,
        page: 1,
        page_size: this.itemsPerPage,
      });
      this.fetchOccurrences()
        .then(() => {
          // console.log("Las tareas fueron cargadas correctamente");
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Las tareas no pudieron cargarse`,
          });
        });
    },

    createNewTask() {
      this.reset_regulation();
      this.reset_task();
      this.reset_occurrence();
      this.$router.push({
        name: `new-task-panel-tasks`,
      });
    },

    downloadTasksReport() {
      this.loading.downloadReport = true;
      let params = JSON.parse(JSON.stringify(this.har.occurrencesFilters));
      Object.keys(params).forEach(
        (key) =>
          (params[key] === null || params[key] === undefined) &&
          delete params[key]
      );
      delete params.page;
      delete params.page_size;
      // params.ordering = "status";
      params.report_type = "xlsx";
      tcmtReportsApi
        .getFetcher()
        .get(`repet-actions/filtered`, {
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
