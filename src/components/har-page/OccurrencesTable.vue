<template>
  <v-container class="pa-0 ma-0 d-flex flex-column" fluid style="height: 100%">
    <TablePagination
      item-name="Tareas"
      :page.sync="page"
      @update:page="getOccurrences"
      :length="pageCount"
      :total-items="har.occurrencesData.totalItems"
      :loading="loading"
      class="px-5"
    />
    <v-list
      dense
      class="py-0 px-5 overflow-auto"
      v-if="har.occurrencesData.totalItems || loading"
      :disabled="loading"
    >
      <v-skeleton-loader
        v-if="loading"
        class="mx-auto"
        type="list-item-two-line@8"
      ></v-skeleton-loader>
      <div v-else v-for="task in getOccurrencesByTask" :key="task.id">
        <v-subheader v-if="task.id">TAREA {{ task.id }}</v-subheader>
        <OccurrenceItem
          v-for="occurrence in task.occurrences"
          :key="occurrence.id"
          :occurrence="occurrence"
        />
      </div>
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
import OccurrenceItem from "@/components/har-page/OccurrenceItem.vue";

export default {
  name: "OccurrencesTable",
  components: {
    OccurrenceItem,
    TablePagination,
  },
  data() {
    return {
      itemsPerPage: this.isNotebook ? 6 : 8,
      showRegulationResume: false,
      regId: null,
      localLoading: true,
    };
  },

  created() {
    this.set_occurrences_filters({
      page: this.page,
      page_size: this.itemsPerPage,
      owner_id: this.isCurrentUserOnlySme ? "" : this.currentUserId,
      ordering: "status,due_date",
      // facility_id: this.getFacilitiesByUser?.map((f) => f.id),
    });
    this.getOccurrences();
  },

  computed: {
    ...mapState(["har"]),
    ...mapGetters("har", ["getOccurrencesByTask"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserOnlySme",
      "getFacilitiesByUser",
    ]),

    page: {
      get() {
        return this.har.occurrencesFilters.page || 1;
      },
      set(page) {
        this.add_occurrences_filters({ page, page_size: this.itemsPerPage });
      },
    },

    pageCount() {
      return (
        Math.ceil(this.har.occurrencesData.totalItems / this.itemsPerPage) || 0
      );
    },

    loading() {
      return this.har.loadings.fetchOccurrences && this.localLoading;
    },
  },

  methods: {
    ...mapMutations("har", [
      "add_occurrences_filters",
      "set_occurrences_filters",
    ]),
    ...mapActions("har", ["fetchOccurrences"]),

    getOccurrences() {
      this.fetchOccurrences();
    },

    openResumeReg(id) {
      this.$router.push({
        name: `regulation-resume-tasks`,
        query: { id },
      });
    },
  },
};
</script>
