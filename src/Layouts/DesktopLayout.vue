<template>
  <div class="d-flex fill-height">
    <AppDrawer v-if="loggedIn" />
    <slot />
  </div>
</template>

<script>
import AppDrawer from "@/components/layouts/AppDrawer.vue";
import { mapGetters } from "vuex";
export default {
  name: "DesktopLayout",
  components: { AppDrawer },
  computed: {
    ...mapGetters("user", ["loggedIn"]),
  },
};
</script>

<style scoped></style>
