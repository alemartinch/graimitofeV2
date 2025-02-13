<template>
  <v-list-item
    class="my-2 elevation-22"
    two-line
    :style="{
      'border-radius': '4px',
      'border-left-width': '3px',
      'border-left-style': 'solid',
      'border-left-color': har.taskStatuses[occurrence.status].color,
    }"
    @click="openTaskView"
  >
    <v-list-item-content>
      <v-list-item-title class="d-flex justify-space-between">
        <span class="caption text--secondary"
          >T{{ occurrence.repet_action_id }}</span
        >
        <UserChip :user="occurrence.repet_action.owner" />
      </v-list-item-title>
      <v-list-item-subtitle
        class="text-body-2 font-weight-regular text--primary text-wrap text-truncate"
        >{{ occurrence.repet_action.description }}
        <v-divider class="mt-1" />
      </v-list-item-subtitle>
      <v-list-item-subtitle class="caption"
        ><OccurrenceTableTaskIndicators :occurrence="occurrence" dense />
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>
<script>
import { mapState } from "vuex";
import OccurrenceTableTaskIndicators from "@/components/har-page/OccurrenceTableTaskIndicators.vue";
import UserChip from "@/components/reusable/UserChip.vue";

export default {
  name: "OccurrenceItemMobile",
  components: { UserChip, OccurrenceTableTaskIndicators },
  props: {
    occurrence: { type: Object, required: true },
  },
  computed: {
    ...mapState(["har"]),
  },
  methods: {
    openTaskView() {
      this.$router.push({
        name: `task-mobile`,
        query: {
          taskID: this.occurrence.repet_action_id,
          occurrenceID: this.occurrence.id,
        },
      });
    },
  },
};
</script>

<style scoped></style>
