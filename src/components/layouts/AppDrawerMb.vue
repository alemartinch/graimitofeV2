<template>
  <v-app-bar app clipped-left dense color="#263238">
    <v-toolbar-title>
      <v-row class="ma-0">
        <img
          :src="require('@/assets/newLogoTcmt.svg')"
          style="width: 30px"
          alt="AppLogo"
        />
      </v-row>
    </v-toolbar-title>
    <v-spacer />
    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn text v-on="on" class="px-0">
          <span class="mr-3 green--text text-caption">{{ getRolesList }}</span>
          <UserAvatar size="35" left logged-user-photo />
        </v-btn>
      </template>
      <v-card>
        <v-list-item
          :to="{
            path: '/usersettings/user-profile',
          }"
        >
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Configuración</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item @click="alertDialog = true">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Salir</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </v-menu>
    <GlobalPrompt :active="alertDialog" prompt-type="alert">
      <template v-slot:message> ¿Desea salir de la sesión? </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="alertButtonLoading"
          @click="alertDialog = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>

      <template v-slot:accept>
        <t-btn-primary :loading="alertButtonLoading" @click="logout_user">
          Salir
        </t-btn-primary>
      </template>
    </GlobalPrompt>
  </v-app-bar>
</template>

<script>
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import { mapActions, mapGetters } from "vuex";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "AppDrawerMb",
  components: { TBtnPrimary, TBtnSecondary, UserAvatar, GlobalPrompt },
  data() {
    return {
      alertDialog: false,
      alertButtonLoading: false,
    };
  },

  computed: {
    ...mapGetters("user", ["getRolesList"]),
  },

  methods: {
    ...mapActions(["logout"]),
    ...mapActions(["set_alert"]),

    logout_user() {
      this.alertButtonLoading = true;
      this.logout();
      this.alertButtonLoading = false;
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped></style>
