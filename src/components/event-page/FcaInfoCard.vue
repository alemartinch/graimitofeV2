<template>
  <div>
    <FindingICard v-if="event.temp_event.findings.length" />
    <CauseICard
      v-else-if="event.temp_event.causes.length"
      :causes="event.temp_event.causes"
    />
    <ActionICard
      v-else-if="event.temp_event.actions.length"
      :parent="{ type: 'event', id: event.temp_event.id }"
      :actions="event.temp_event.actions"
    />
  </div>
</template>

<script>
import ActionICard from "@/components/event-page/ActionICard.vue";
import CauseICard from "@/components/event-page/CauseICard.vue";
import FindingICard from "@/components/event-page/FindingICard.vue";
import { mapState } from "vuex";

export default {
  name: "FcaInfoCard",
  components: { FindingICard, CauseICard, ActionICard },
  computed: {
    ...mapState(["event"]),
  },
};
</script>

<style scoped></style>
