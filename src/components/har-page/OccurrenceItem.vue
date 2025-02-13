<template>
  <v-list-item
    class="justify-space-between my-2 pa-0 elevation-22"
    :style="{
      'border-radius': '4px',
      'border-left-width': '3px',
      'border-left-style': 'solid',
      'border-left-color': har.taskStatuses[occurrence.status].color,
    }"
  >
    <v-col :cols="compacted ? 9 : 10" class="text-body-2 d-flex align-start">
      <div>
        <span>
          <span class="caption text--disabled mr-2"
            >T{{ occurrence.repet_action.id }}</span
          >
          <br v-if="compacted" />
          <ExtendTooltip
            :text="occurrence.repet_action.description"
            :trunc-length="compacted ? 50 : 85"
          />
        </span>
        <br />
        <OccurrenceTableTaskIndicators :occurrence="occurrence" class="mt-1" />
      </div>
    </v-col>
    <v-spacer />
    <v-col cols="1" class="text-body-2 d-flex justify-end align-center">
      <v-tooltip v-if="occurrence.repet_action.owner" top>
        <template v-slot:activator="{ on }">
          <UserAvatar
            v-on="on"
            size="35"
            :user-object="occurrence.repet_action.owner || ''"
          />
        </template>
        {{ occurrence.repet_action.owner | fullName }}
      </v-tooltip>
      <v-divider vertical class="mx-4" />
      <OccurrenceStatusSetting :occurrence="occurrence" :menu="compacted" />
    </v-col>
  </v-list-item>
</template>
<script>
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import OccurrenceStatusSetting from "@/components/har-page/OccurrenceStatusSetting.vue";
import OccurrenceTableTaskIndicators from "@/components/har-page/OccurrenceTableTaskIndicators.vue";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import { mapState } from "vuex";

export default {
  name: "OccurrenceItem",
  components: {
    ExtendTooltip,
    OccurrenceStatusSetting,
    OccurrenceTableTaskIndicators,
    UserAvatar,
  },
  props: {
    occurrence: { type: Object, required: true },
    compacted: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(["har"]),
  },
};
</script>
