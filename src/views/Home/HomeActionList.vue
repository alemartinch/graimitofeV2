<template>
  <v-list dense>
    <v-list-item
      v-for="action in actionList"
      :key="action.id"
      two-line
      class="mb-1"
      link
      :to="{ path: `/actions/action/${action.id}` }"
    >
      <v-list-item-content>
        <v-list-item-title class="d-flex justify-space-between">
          <span class="caption text--secondary">A{{ action.id }}</span>
          <span class="caption red--text">{{ action.statusDescription }}</span>
        </v-list-item-title>
        <v-list-item-subtitle class="text-wrap text--primary"
          >{{ action.description | reduceText(100) }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <t-btn-primary block @click="$router.push({ path: `/actionsMb` })"
      >ver mas</t-btn-primary
    >
  </v-list>
</template>
<script>
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "HomeActionList",
  components: { TBtnPrimary },
  props: {
    actionList: {
      type: Array,
      required: true,
    },
  },
};
</script>
