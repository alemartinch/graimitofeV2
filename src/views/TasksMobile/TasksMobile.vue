<template>
  <v-container class="pt-13">
    <v-app-bar fixed color="white">
      <v-toolbar-title>Tareas</v-toolbar-title>
    </v-app-bar>
    <TasksMobileSkeleton v-if="har.loadings.fetchOccurrences" />
    <v-list v-else dense>
      <OccurrenceItemMobile
        v-for="occurrence in occurrences"
        :occurrence="occurrence"
        :key="occurrence.id"
        compacted
      />
    </v-list>
  </v-container>
</template>

<script>
import { TASK_STATUSES } from "@/mixins/globals";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import TasksMobileSkeleton from "@/views/TasksMobile/TasksMobileSkeleton.vue";
import OccurrenceItemMobile from "@/components/har-page/OccurrenceItemMobile.vue";

export default {
  name: "TasksMobile",
  components: { OccurrenceItemMobile, TasksMobileSkeleton },
  created() {
    this.getUserOccurrences();
  },
  computed: {
    ...mapState(["har"]),
    ...mapGetters("user", ["currentUserId"]),
    occurrences() {
      return this.har.occurrencesData.results;
    },
  },
  methods: {
    ...mapMutations("har", ["set_occurrences_filters"]),
    ...mapActions("har", ["fetchOccurrences"]),
    getUserOccurrences() {
      this.set_occurrences_filters({
        ordering: "status,due_date",
        owner_id: this.currentUserId,
        status: [TASK_STATUSES.OVERDUE, TASK_STATUSES.PENDING],
      });
      this.fetchOccurrences();
    },
  },
};
</script>
<style scoped></style>
