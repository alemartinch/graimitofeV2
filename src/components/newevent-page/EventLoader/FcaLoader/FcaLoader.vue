<template>
  <v-container class="ma-0 pa-0" fluid>
    <!--FCA PANELS-->
    <FindingLoaderTable
      v-if="event.eventOrigins[event.temp_event.event_origin].fca === 'FCA'"
      :mobile="$vuetify.breakpoint.smAndDown"
      :parent="{ type: 'event', id: event.temp_event.id }"
    />

    <!--CA PANELS-->
    <CauseLoaderTable
      v-if="event.eventOrigins[event.temp_event.event_origin].fca === 'CA'"
      :parent="{ type: 'event', id: event.temp_event.id }"
    />

    <!--A PANELS-->
    <ActionLoaderTable
      v-if="event.eventOrigins[event.temp_event.event_origin].fca === 'A'"
      :parent="{ type: 'event', id: event.temp_event.id }"
    />
  </v-container>
</template>

<script>
import { mapState } from "vuex";
import ActionLoaderTable from "@/components/newevent-page/EventLoader/FcaLoader/ActionLoaderTable.vue";
import CauseLoaderTable from "@/components/newevent-page/EventLoader/FcaLoader/CauseLoaderTable.vue";
import FindingLoaderTable from "@/components/newevent-page/EventLoader/FcaLoader/FindingLoaderTable.vue";

export default {
  name: "FcaLoader",

  components: {
    FindingLoaderTable,
    CauseLoaderTable,
    ActionLoaderTable,
  },

  computed: {
    ...mapState(["event", "fca"]),
  },
};
</script>

<style scoped>
v-expansion-panel-header {
  min-height: 64px;
}
.finding-panel {
  border: 2px solid #4caf50;
}
.cause-panel {
  border: 2px solid #567990;
}
.action-panel {
  border: 2px solid #caad8b;
  border-radius: 5px;
}
</style>
