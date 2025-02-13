<template>
  <div>
    <!--    <AppDrawerMb v-if="loggedIn" />-->

    <slot />

    <v-bottom-navigation
      v-if="isMobile && loggedIn"
      class="d-flex d-sm-none mt-6"
      app
      grow
      mandatory
      shift
    >
      <v-btn link :to="{ path: '/home-mobile' }" value="home">
        <span>Inicio</span>
        <v-icon>mdi-home-variant-outline</v-icon>
      </v-btn>

      <v-btn link :to="{ path: '/observations' }" value="observations">
        <span>Observ.</span>
        <v-icon>mdi-eye</v-icon>
      </v-btn>

      <v-btn link :to="{ path: '/actionsMb/' }" value="actions">
        <span>Acciones</span>
        <v-icon>mdi-alpha-a-box-outline</v-icon>
      </v-btn>

      <v-btn link :to="{ path: '/tasks-mobile' }" value="tareas">
        <span>Tareas</span>
        <v-icon>mdi-clipboard-check-outline</v-icon>
      </v-btn>

      <v-btn link :to="{ path: '/user-profile-mb' }" value="settings">
        <span>Cuenta</span>
        <v-icon>mdi-account-outline</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "MobileLayout",
  computed: {
    ...mapGetters("user", ["loggedIn"]),
  },
};
</script>

<style scoped>
.v-btn:before {
  background: none !important;
}
</style>
