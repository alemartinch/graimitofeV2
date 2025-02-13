<template>
  <v-alert outlined dense text :color="statuses[currentAction.status].color">
    <div
      class="text-body-1 font-weight-medium"
      :style="{
        color: statuses[currentAction.status].color,
      }"
    >
      <span class="caption">Estado</span><br />
      {{ statuses[currentAction.status].abb }}
    </div>
  </v-alert>
</template>
<script>
import { mapState } from "vuex";

export default {
  name: "ActionStatusInfo",
  computed: {
    ...mapState("fca", ["statuses"]),
    currentAction() {
      return this.$store.getters["fca/getCurrentAction"];
    },
  },
};
</script>
