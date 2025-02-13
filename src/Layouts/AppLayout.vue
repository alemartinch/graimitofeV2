<template>
  <component :is="layout">
    <slot />
  </component>
</template>

<script>
export default {
  name: "AppLayout",
  computed: {
    layout() {
      const layout = this.$vuetify.breakpoint.smAndDown;
      if (layout) {
        return () => import(`@/Layouts/MobileLayout.vue`);
      } else {
        return () => import(`@/Layouts/DesktopLayout.vue`);
      };
    },
  },
};
</script>

<style scoped></style>
