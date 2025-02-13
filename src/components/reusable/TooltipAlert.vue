<template>
  <v-menu
    open-on-hover
    open-delay="200"
    nudge-top="8"
    nudge-left="15"
    max-width="500"
  >
    <template v-slot:activator="{ on }">
      <v-icon
        v-on="on"
        :color="type"
        class="ml-3"
        :class="{
          'animate__animated animate__pulse animate__infinite': animate,
        }"
        >{{ getIcon }}</v-icon
      >
    </template>
    <v-card class="pa-0 ma-0">
      <v-alert :type="type" dense text class="text-body-2 ma-0">
        <slot />
      </v-alert>
    </v-card>
  </v-menu>
</template>
<script>
export default {
  name: "TooltipAlert",
  props: {
    type: {
      type: String,
      required: true,
      validator: (type) => {
        return ["success", "info", "warning", "error"].includes(type);
      },
    },
    animate: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    getIcon() {
      const icons = {
        success: "mdi-check-circle",
        info: "mdi-information",
        warning: "mdi-alert-circle",
        error: "mdi-information",
      };
      return icons[this.type];
    },
  },
};
</script>
<style scoped>
td {
  font-size: 12px !important;
}
</style>
