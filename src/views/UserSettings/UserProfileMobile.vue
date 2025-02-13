<template>
  <v-container class="pa-0">
    <header style="position: relative">
      <v-img :src="require('@/assets/profileBg.jpg')" class="elevation-10">
        <div class="d-flex justify-end mt-3 mr-3">
          <v-btn icon @click="logoutDialog = true">
            <v-icon color="white">mdi-logout </v-icon>
          </v-btn>
        </div>
      </v-img>
      <t-avatar :size="avatarSize" :style="avatarStyle" />
    </header>
    <section class="pa-6 mt-10">
      <header
        class="text-h6 font-weight-light d-flex flex-column justify-center align-center"
        style="line-height: 1.3rem"
      >
        <span class="font-weight-medium">{{
          user.user.first_name + " " + user.user.last_name
        }}</span>
        <span class="text--secondary">{{ user.user.username }}</span>
      </header>
      <v-card min-height="150px" flat class="pt-10">
        <h5>ROLES</h5>
        <v-divider />
        <div class="px-2 mt-6">
          <v-chip
            v-for="(rol, index) in user.user.groups"
            :key="index"
            label
            class="mr-2 mb-2 text--primary"
            color="accent"
          >
            {{ rolNameTranslate(rol.name) }}
          </v-chip>
        </div>
      </v-card>
      <v-card min-height="150px" flat class="pt-10">
        <h5>DATOS PERSONALES</h5>
        <v-divider />
        <div class="px-2 mt-5">
          <p v-if="user.user.phone">
            <v-icon class="text--primary">mdi-phone-outline</v-icon>
            <span class="ml-3">{{ user.user.phone }}</span>
          </p>
          <p v-if="user.user.email">
            <v-icon class="text--primary">mdi-email-outline</v-icon>
            <span class="ml-3">{{ user.user.email }}</span>
          </p>
        </div>
      </v-card>
      <v-card min-height="150px" flat class="pt-10">
        <h5>ACCIONES</h5>
        <v-divider />
        <div class="px-2 mt-5"><PasswordForm /></div>
      </v-card>
    </section>
    <GlobalPrompt :active="logoutDialog" prompt-type="alert">
      <template v-slot:message> ¿Desea salir de la sesión? </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="alertButtonLoading"
          @click="logoutDialog = false"
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
  </v-container>
</template>

<script>
// import UserAvatar from "@/components/reusable/UserAvatar.vue";
import { mapActions, mapState } from "vuex";
import { rolNameMixin } from "@/mixins/globals";
import PasswordForm from "@/components/setting-page/PasswordForm.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import TAvatar from "@/components/TAvatar.vue";

export default {
  name: "UserProfileMobile",
  components: {
    TAvatar,
    TBtnPrimary,
    TBtnSecondary,
    GlobalPrompt,
    PasswordForm,
    // UserAvatar,
  },
  mixins: [rolNameMixin],
  data() {
    return {
      logoutDialog: false,
      alertButtonLoading: false,
      avatarSize: 120,
    };
  },
  computed: {
    ...mapState(["user"]),
    avatarStyle() {
      return {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: `-${this.avatarSize / 2}px`,
      };
    },
  },
  methods: {
    ...mapActions("user", ["logout"]),

    logout_user() {
      this.alertButtonLoading = true;
      this.logout();
      this.alertButtonLoading = false;
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped>
.avatar-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -50px;
}
</style>
