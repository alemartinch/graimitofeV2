<template>
  <v-card
    :outlined="parent ? parent.type === 'event' : true"
    :flat="parent ? parent.type !== 'event' : true"
    class="flex-grow-1"
  >
    <v-tabs v-model="tab" grow height="35">
      <v-tabs-slider color="primary" />
      <v-tab v-for="cause in causes" :key="cause.id" class="caption">
        CAUSA {{ cause.id }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" style="overflow: auto">
      <v-tab-item v-for="cause in causes" :key="cause.id">
        <v-card flat>
          <v-card-text>
            <ExtendTooltip :text="cause.description" trunc-length="200" />
          </v-card-text>
        </v-card>
        <!--ACCIONES-->
        <ActionICard
          :actions="cause.actions"
          :parent="{ type: 'cause', id: cause.id }"
          :key="cause.id"
        />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import ActionICard from "@/components/event-page/ActionICard.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";

export default {
  name: "CauseICard",
  components: { ExtendTooltip, ActionICard },
  props: {
    causes: {
      type: Array,
      required: true,
    },
    parent: {
      type: Boolean,
    },
  },
  data() {
    return {
      tab: 0,
      tab2: 0,
    };
  },
  computed: {
    ...mapState(["event"]),
  },
};
</script>
