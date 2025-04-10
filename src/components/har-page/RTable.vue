<template>
  <v-container class="pa-0 ma-0 d-flex flex-column" fluid style="height: 100%">
    <TablePagination
      item-name="requerimientos"
      :page.sync="page"
      @update:page="getRegulations"
      :length="pageCount"
      :total-items="har.regulationsData.totalItems"
      :loading="loading"
      class="px-5"
    />
    <v-list
      dense
      class="py-0 px-5 overflow-auto"
      v-if="har.regulationsData.totalItems || loading"
      :disabled="loading"
    >
      <v-skeleton-loader
        v-if="loading"
        class="mx-auto"
        type="list-item-two-line@8"
      ></v-skeleton-loader>
      <RegulationItem
        v-else
        v-for="regulation in regulations"
        :key="regulation.id"
        :regulation="regulation"
      />
    </v-list>
    <div
      v-else
      class="d-flex flex-column justify-center align-center"
      style="height: 100%"
    >
      <h4>No se encontraron resultados</h4>
      <p>No se encontraron resultados para los filtros seleccionados</p>
    </div>
  </v-container>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import TablePagination from "@/components/reusable/TablePagination.vue";
import RegulationItem from "@/components/har-page/RegulationItem.vue";

export default {
  name: "RTable",
  components: { RegulationItem, TablePagination },
  data() {
    return {
      itemsPerPage: this.isNotebook ? 6 : 8,
      evaluationDialog: false,
      resumeRegulation: false,
    };
  },
  created() {
    this.set_regulation_filter({
      page: this.page,
      page_size: this.itemsPerPage,
      current_revision: true,
      ordering: "-id",
    });
    this.getRegulations();
  },

  computed: {
    ...mapState(["har", "user"]),
    ...mapGetters("har", ["getRegulationsTable"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserOnlySme",
      "getFacilitiesByUser",
    ]),

    regulations() {
      return this.getRegulationsTable;
    },

    page: {
      get() {
        return this.har.regulationFilters.page || 1;
      },
      set(page) {
        this.set_regulation_filter({
          page,
          page_size: this.itemsPerPage,
        });
      },
    },

    pageCount() {
      return (
        Math.ceil(this.har.regulationsData.totalItems / this.itemsPerPage) || 0
      );
    },

    loading() {
      return this.har.loadings.fetchRegulations;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("har", ["set_regulation_filter"]),
    ...mapActions("har", ["fetchRegulations"]),

    getRegulations() {
      this.fetchRegulations()
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Los requerimientos no pudieron cargarse`,
          });
        });
    },

    openResumeReg(id) {
      this.$router.push({
        name: `regulation-resume`,
        query: { id },
      });
    },

    goToRegulationPage(regId) {
      this.$router.push({ path: `/har/regulations/${regId}` });
    },
  },
};
</script>

<style>
td {
  border-bottom: none !important;
}
</style>
