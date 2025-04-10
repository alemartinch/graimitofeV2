<template>
  <div>
    <LayoutPanel>
      <template v-slot:header="{ toggleFilters, showFilters }">
        <span class="text-h5">Panel de requerimientos</span>
        <v-spacer />
        <t-btn-primary
          :loading="loading.downloadReport"
          @click="downloadRegulationsReport"
          class="mr-10"
          :disabled="isExternal"
        >
          <v-icon left color="#43A047">mdi-file-excel-outline</v-icon>
          descargar reporte
        </t-btn-primary>
        <t-btn-primary
          class="mr-10"
          @click="openNewRegulationDialog"
          :disabled="isExternal"
          >nuevo requerimiento
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
        <RTable />
      </template>
      <template v-slot:filters>
        <FiltersPanel
          :data="filters"
          :default-filter="{
            ordering: '-id',
            page: 1,
          }"
          v-on:set-filters="setRegulationsFilters"
          :set-filter="filtersCurrent"
          :loading="har.loadings.fetchRegulations"
        />
      </template>
    </LayoutPanel>
    <RouterView v-on:update-regulations="fetchRegulations" />
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import LayoutPanel from "@/Layouts/LayoutPanel.vue";
import RTable from "@/components/har-page/RTable.vue";
import FiltersPanel from "@/views/Har/FiltersPanel.vue";
import { eatApi, tcmtReportsApi } from "@/apis";
import qs from "qs";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import store from "@/store";

export default {
  components: { TBtnPrimary, LayoutPanel, FiltersPanel, RTable },
  data() {
    return {
      loading: {
        fetchRegulation: false,
        downloadReport: false,
      },
      showFilters: false,
      id: [],
    };
  },

  computed: {
    ...mapState(["har", "event"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserOnlySme",
      "getFacilitiesByUser",
    ]),

    filtersCurrent() {
      const filter = this.har.regulationFilters;
      // const filterDefault = null;
      // if (this.id?.length == filter?.facility_id?.length) {
      //   filter.facility_id = null;
      // }
      return filter;
    },

    facilityParams() {
      this.getFacilitiesByUser?.forEach((item) => this.id.push(item.id));
      return this.id;
    },

    isExternal: function () {
      return !!store.getters["user/currentUserRoles"]?.includes("BASE");
    },

    filters() {
      return [
        {
          name: "Ordenar por",
          param: "ordering",
          type: "select",
          options: [
            { key: "id", name: "ID" },
            { key: "tier", name: "Alcance" },
            { key: "authority", name: "Autoridad" },
            { key: "regulation_code", name: "Norma/Código" },
          ],
          divider: true,
          multiple: false,
        },
        {
          name: "Establecimiento",
          param: "facility_id",
          searchParam: "keyword",
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
        //order alfabetico
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
          multiple: true,
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
          name: "Estado de la evaluación",
          label: "Todos los estados",
          param: "compliance",
          type: "select",
          options: Object.entries(this.har.assessmentResults).map(
            ([key, values]) => {
              return { key, name: values.name };
            }
          ),
          divider: false,
          multiple: true,
        },
        {
          name: "Norma/Código",
          param: "regulation_code",
          type: "text",
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
    ...mapMutations("har", ["set_regulation_filter", "reset_regulation"]),
    ...mapActions("har", ["fetchRegulations"]),

    setRegulationsFilters(filters) {
      this.set_regulation_filter({ ...filters, page: 1 });
      this.fetchRegulations()
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Los requerimientos no pudieron cargarse`,
          });
        });
    },

    getUserByFacilities() {
      return this.event.users.map((u) => {
        return { key: u.id, name: `${u.first_name} ${u.last_name}` };
      });
    },

    openNewRegulationDialog() {
      this.reset_regulation();
      this.$router.push({
        name: `new-regulations-form`,
      });
    },

    downloadRegulationsReport() {
      this.loading.downloadReport = true;
      let params = JSON.parse(JSON.stringify(this.har.regulationFilters));
      Object.keys(params).forEach(
        (key) =>
          (params[key] === null || params[key] === undefined) &&
          delete params[key]
      );
      delete params.page;
      delete params.page_size;
      params.report_type = "xlsx";
      tcmtReportsApi
        .getFetcher()
        .get(`regulations/filtered`, {
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
