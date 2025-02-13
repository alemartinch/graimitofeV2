<template>
  <v-container class="view-container pb-0">
    <v-tabs v-model="tab" height="40">
      <v-tab to="/usersettings/user-profile"
        >Datos personales <v-icon>mdi-account-cog-outline</v-icon></v-tab
      >
      <v-tab to="/usersettings/admin-panel/abm-users" v-if="isCurrentUserSme"
        >Panel de administración
        <v-icon>mdi-cog-transfer-outline</v-icon></v-tab
      >
    </v-tabs>
    <v-divider class="divider" />
    <router-view />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "UserSettings",
  components: {},
  data() {
    return {
      tab: 0,
      md: 2,
    };
  },
  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["isCurrentUserSme"]),
  },
};
</script>

<style scoped>
.divider {
  border-width: 1px;
  position: relative;
  bottom: 2px;
  border-color: rgb(117 182 215 / 30%);
}
</style>
