<template>
  <div class="d-flex flex-column pb-5">
    <div class="d-flex align-center">
      <v-btn-toggle v-model="fcaShow" mandatory>
        <template v-if="event.temp_event.findings">
          <v-tooltip
            top
            nudge-right="30"
            v-if="
              event.temp_event.findings.length || event.temp_event.causes.length
            "
          >
            <template v-slot:activator="{ on }">
              <v-btn small icon v-on="on" :value="0">
                <v-icon small>mdi-view-compact-outline</v-icon>
              </v-btn>
            </template>
            <span>Panel anidado</span>
          </v-tooltip>
        </template>
        <template v-if="event.temp_event.findings">
          <v-tooltip top v-if="event.temp_event.findings.length">
            <template v-slot:activator="{ on }">
              <v-btn small text v-on="on" :value="3"> hallazgos </v-btn>
            </template>
            <span>Lista de hallazgos</span>
          </v-tooltip>
        </template>
        <v-tooltip top v-if="extractCauses.length">
          <template v-slot:activator="{ on }">
            <v-btn small text v-on="on" :value="2"> causas </v-btn>
          </template>
          <span>Lista de causas</span>
        </v-tooltip>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn small text v-on="on" :value="1"> acciones </v-btn>
          </template>
          <span>Lista de acciones</span>
        </v-tooltip>
      </v-btn-toggle>
      <v-progress-circular
        v-if="loading.refreshEvent"
        indeterminate
        size="18"
        width="2"
        class="ml-5"
        color="primary"
      />
    </div>
    <FcaInfoCard v-if="fcaShow === 0" />
    <ActionICard
      v-if="fcaShow === 1"
      :actions="extractActions"
      :parent="{ type: 'event', id: event.temp_event.id }"
      v-on:close-new-action-dialog="refreshEvent"
    />
    <CausesListCard v-if="fcaShow === 2" />
    <FindingListCard v-if="fcaShow === 3" />
  </div>
</template>
<script>
import ActionICard from "@/components/event-page/ActionICard.vue";
import CausesListCard from "@/components/event-page/CausesListCard.vue";
import FcaInfoCard from "@/components/event-page/FcaInfoCard.vue";
import FindingListCard from "@/components/event-page/FindingListCard.vue";
import eventInfo from "@/views/EventsPanel/mixins/eventInfo";

export default {
  name: "FcaEventInfo",
  components: {
    ActionICard,
    CausesListCard,
    FcaInfoCard,
    FindingListCard,
  },
  mixins: [eventInfo],
};
</script>
