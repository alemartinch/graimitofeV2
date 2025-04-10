<template>
  <v-card
    height="300px"
    elevation="22"
    outlined
    class="d-flex flex-column"
    :loading="fetchTasksLoading"
    :disabled="fetchTasksLoading"
  >
    <v-card-title
      class="py-2 justify-space-between"
      style="border-bottom: rgba(44, 103, 125, 0.16) solid 1px"
      >Tareas pendientes
      <v-btn
        v-if="getItemTotal > 0"
        elevation="1"
        x-small
        class="text-no-wrap"
        @click="goToTaskPanel"
        >{{ `Ver ${getItemTotal} mas` }}</v-btn
      >
    </v-card-title>
    <v-skeleton-loader
      v-if="har.loadings.fetchOccurrences"
      type="list-item-two-line@3"
    ></v-skeleton-loader>
    <div v-else-if="occurrences?.length" class="pa-2 overflow-auto">
      <OccurrenceItem
        v-for="occurrence in occurrences"
        :key="occurrence.id"
        :occurrence="occurrence"
        compacted
      />
    </div>
    <div
      v-else
      class="flex-grow-1 d-flex flex-column justify-center align-center"
    >
      <v-img
        class="flex-grow-0 animate__animated animate__bounceIn"
        width="85"
        height="85"
        contain
        :src="require('@/assets/no-pending-tasks.svg')"
      ></v-img>
      <div class="body-2">Sin tareas pendientes</div>
    </div>
  </v-card>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import OccurrenceItem from "@/components/har-page/OccurrenceItem.vue";
import { TASK_STATUSES } from "@/mixins/globals";
import user from "@/store/modules/user";

export default {
  name: "HometaskCard",
  components: {
    OccurrenceItem,
  },

  data() {
    return {
      fetchTasksLoading: false,
      messages: 2,
    };
  },

  created() {
    this.getRegulationOccurrences();
  },

  computed: {
    ...mapState(["har"]),
    ...mapState("user", ["user"]),

    getItemTotal() {
      return this.har.occurrence.itemsTotal - 5;
    },

    occurrences() {
      return this.har.occurrencesData.results;
    },
  },

  methods: {
    ...mapMutations("har", ["set_occurrences_filters"]),
    ...mapActions("har", ["fetchOccurrences"]),
    getRegulationOccurrences() {
      this.set_occurrences_filters({
        status: [TASK_STATUSES.OVERDUE, TASK_STATUSES.PENDING],
        page_size: 5,
      });
      this.fetchOccurrences();
    },
    goToTaskPanel() {
      this.set_occurrences_filters({
        page_size: 8,
        status: [TASK_STATUSES.OVERDUE, TASK_STATUSES.PENDING],
      });
      this.$router.push({ name: "tasks", params: { from: "pendingBtn" } });
    },
  },
};
</script>
<style scoped></style>
