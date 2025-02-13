<template>
  <v-card
    flat
    class="pa-5 pb-0"
    style="height: calc(100vh - 120px); overflow: auto"
  >
    <div class="d-flex">
      <UserAvatar
        logged-user-photo
        size="120"
        @mouseover="showOverlay = true"
        @mouseleave="showOverlay = false"
        rounded
      >
        <v-overlay absolute :value="showOverlay">
          <v-icon @click="showLoadImage = true">mdi-camera</v-icon>
        </v-overlay>
      </UserAvatar>
      <v-divider
        vertical
        class="ml-3"
        style="border-color: #449cc9; border-width: 1px; opacity: 0.4"
      />
      <div class="d-flex flex-column justify-space-between ml-3">
        <div>
          <span class="text-h6">{{ user.user | fullName }}</span>
          <br />
          <span class="text--disabled">{{ user.user.username }}</span>
        </div>
        <div>
          Roles:<br />
          <v-chip
            v-for="(rol, index) in user.user.groups"
            :key="index"
            small
            outlined
            label
            class="mr-2"
            color="accent"
          >
            {{ rolNameTranslate(rol.name) }}
          </v-chip>
        </div>
      </div>
    </div>
    <v-divider class="mt-5" />
    <div class="d-flex ml-3 align-items-center">
      <div class="mt-3">
        Establecimientos asignados/permitidos: <br />
        <template v-if="getFacilitiesByUser.length">
          <v-chip
            v-for="(facility, index) in getFacilitiesByUser"
            :key="index"
            small
            outlined
            label
            class="mr-2 mt-1"
            color="primary"
          >
            {{ facility.name }}
          </v-chip>
        </template>
        <template v-else>
          <v-chip small outlined label class="mr-2" color="accent">
            Todos
          </v-chip>
        </template>
      </div>
    </div>
    <v-divider class="mt-5" />
    <v-row class="ma-0">
      <v-col cols="4">
        <div class="mt-4">Usuario:</div>
        <span class="text-h5">{{ user.user.username }}</span>
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col cols="5">
        <div class="mt-4">Nombre:</div>
        <DataTextFieldToggle
          :data="user.user.first_name"
          :rules="[rAlpha, rRequired]"
          v-on:value-changed="updateUserName"
          :loading="nameLoading"
        />
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col cols="5">
        <div class="mt-4">Apellido:</div>
        <DataTextFieldToggle
          :data="user.user.last_name"
          :rules="[rAlpha, rRequired]"
          v-on:value-changed="updateUserLastName"
          :loading="lastNameLoading"
        />
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col cols="6">
        <div class="mt-4">Correo:</div>
        <DataTextFieldToggle
          :data="user.user.email"
          :rules="[rEmail, rRequired]"
          v-on:value-changed="updateUserMail"
          :loading="emailLoading"
        />
      </v-col>
    </v-row>
    <v-row class="ma-0">
      <v-col cols="5">
        <div class="mt-4">Teléfono:</div>
        <DataTextFieldToggle
          :data="user.user.phone"
          :rules="[rPhone, rRequired]"
          v-on:value-changed="updateUserPhone"
          :loading="phoneLoading"
        />
      </v-col>
    </v-row>
    <v-row class="align-center ma-0">
      <v-col cols="5">
        <div class="mt-4">Seguridad:</div>
        <PasswordForm />
      </v-col>
    </v-row>
    <v-row class="align-center ma-0">
      <v-col>
        <div class="mt-4">Sesión:</div>
        <v-btn color="primary" outlined @click="logoutDialog = true"
          >salir de la sesión
        </v-btn>
      </v-col>
    </v-row>

    <v-dialog v-model="showLoadImage" max-width="400" persistent scrollable>
      <LoadImage v-on:close-dialog="showLoadImage = false" />
    </v-dialog>
    <!-- LOGOUT PROMPT -->
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
  </v-card>
</template>
<script>
import DataTextFieldToggle from "@/components/reusable/DataTextFieldToggle.vue";
import PasswordForm from "@/components/setting-page/PasswordForm.vue";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import LoadImage from "@/components/setting-page/LoadImage.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import { Validations } from "@/mixins/Validations";
import { eatApi } from "@/apis";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import { rolNameMixin } from "@/mixins/globals";

export default {
  name: "UserProfile",
  components: {
    TBtnPrimary,
    TBtnSecondary,
    DataTextFieldToggle,
    PasswordForm,
    UserAvatar,
    LoadImage,
    GlobalPrompt,
  },
  mixins: [Validations, rolNameMixin],
  data() {
    return {
      passForm: false,
      showLoadImage: false,
      showOverlay: false,
      nameLoading: false,
      lastNameLoading: false,
      emailLoading: false,
      phoneLoading: false,
      logoutDialog: false,
      alertButtonLoading: false,
    };
  },
  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["currentUser", "getFacilitiesByUser"]),
  },
  methods: {
    ...mapActions(["set_alert"]),
    ...mapActions("user", ["logout"]),
    ...mapMutations("user", [
      "SET_EMAIL",
      "SET_PHONE",
      "SET_NAME",
      "SET_LNAME",
    ]),
    updateUserMail(email) {
      this.emailLoading = true;
      eatApi
        .getFetcher()
        .put(`/auth/users/${this.user.user.id}`, { email: email })
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El correo ha sido actualizado correctamente`,
          });
          this.emailLoading = false;
          this.SET_EMAIL(email);
        });
    },
    updateUserPhone(phone) {
      this.phoneLoading = true;
      eatApi
        .getFetcher()
        .put(`/auth/users/${this.user.user.id}`, { phone: phone })
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El teléfono ha sido actualizado correctamente`,
          });
          this.phoneLoading = false;
          this.SET_PHONE(phone);
        });
    },
    updateUserName(name) {
      this.nameLoading = true;
      eatApi
        .getFetcher()
        .put(`/auth/users/${this.user.user.id}`, { first_name: name })
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El nombre ha sido actualizado correctamente`,
          });
          this.nameLoading = false;
          this.SET_NAME(name);
        });
    },
    updateUserLastName(lastName) {
      this.lastNameLoading = true;
      eatApi
        .getFetcher()
        .put(`/auth/users/${this.user.user.id}`, { last_name: lastName })
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `El apellido ha sido actualizado correctamente`,
          });
          this.lastNameLoading = false;
          this.SET_LNAME(lastName);
        });
    },
    logout_user() {
      this.alertButtonLoading = true;
      this.logout();
      this.alertButtonLoading = false;
      this.$router.push({ name: "login" });
    },

    getUserPhoto() {
      return this.user.user.photo;
      // const userPhoto = this.user.user.photo64;
      // return "data:image/png;base64," + userPhoto;
    },
  },
};
</script>
