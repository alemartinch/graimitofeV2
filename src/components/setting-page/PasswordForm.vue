<template>
  <v-dialog v-model="dialog" width="500" :persistent="persistent">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-if="!persistent"
        color="red lighten-2"
        dark
        elevation="0"
        v-bind="attrs"
        v-on="on"
      >
        Cambiar contraseña
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        Cambio de contraseña {{ persistent ? "requerido" : "" }}
      </v-card-title>
      <v-card-subtitle>
        La contraseña nueva debe tener al menos 8 caracteres y debe contener al
        menos una letra.
      </v-card-subtitle>
      <v-card-text>
        <v-form v-model="validForm">
          <v-row>
            <v-col cols="12" class="py-0">
              <div class="body-2 my-2">Contraseña actual</div>
              <v-text-field
                v-model="currentPassword"
                placeholder=""
                solo
                flat
                outlined
                dense
                required
                :rules="[rRequired, cunPassError]"
                @focus="cunPassError = null"
                :type="showPass1 ? 'text' : 'password'"
                :append-icon="
                  showPass1 ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
                "
                @click:append="showPass1 = !showPass1"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="py-0">
              <div class="body-2 my-2">Nueva contraseña</div>
              <v-text-field
                v-model="newPassword"
                placeholder=""
                solo
                flat
                outlined
                dense
                required
                :rules="[rRequired, rPasswordMin, newPassError]"
                @focus="newPassError = null"
                :type="showPass2 ? 'text' : 'password'"
                :append-icon="
                  showPass2 ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
                "
                @click:append="showPass2 = !showPass2"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="py-0">
              <div class="body-2 my-2">Confirmar nueva contraseña</div>
              <v-text-field
                v-model="confirmNewPassword"
                placeholder=""
                solo
                flat
                outlined
                dense
                required
                :rules="[rRequired, rMatch, conPassError]"
                @focus="conPassError = null"
                :type="showPass3 ? 'text' : 'password'"
                :append-icon="
                  showPass3 ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
                "
                @click:append="showPass3 = !showPass3"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!persistent"
          color="secondary"
          text
          @click="dialog = false"
          :disabled="loading"
          >cerrar</v-btn
        >
        <v-btn
          v-else
          color="secondary"
          text
          @click="logout_user"
          :disabled="loading"
          >salir</v-btn
        >
        <v-btn
          color="primary"
          text
          @click="updateUserPass"
          :loading="loading"
          :disabled="!validForm"
          >cambiar</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { eatApi } from "@/apis";
import { Validations } from "@/mixins/Validations";
import { mapActions } from "vuex";
import errorCodes from "@/apis/errorCodes";

export default {
  name: "PasswordForm",
  mixins: [Validations],
  props: {
    persistent: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showPass1: false,
      showPass2: false,
      showPass3: false,
      cunPassError: null,
      newPassError: null,
      conPassError: null,
      dialog: this.persistent,
      loading: false,
      validForm: false,
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      cPassRules: [(v) => !!v || "La contraseña actual es requerida"],
      conPassRules: {
        required: (v) => !!v || "Este campo requerido",
        match: (v) =>
          v === this.newPassword || "Las contraseñas deben coincidir",
        min: (v) => v.length >= 8 || "Min 8 caractéres",
        incorrectPass: () => `La contraseña es incorrecta`,
      },
    };
  },
  computed: {
    rMatch() {
      return (v) => v === this.newPassword || "Las contraseñas deben coincidir";
    },
  },
  methods: {
    ...mapActions(["set_alert"]),
    ...mapActions("user", ["logout"]),

    updateUserPass() {
      this.loading = true;
      eatApi
        .getFetcher()
        .post(`/auth/password-change/`, {
          current_password: this.currentPassword,
          new_password: this.newPassword,
          new_password_again: this.confirmNewPassword,
        })
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `La contraseña ha sido cambiada correctamente`,
          });
          this.logout_user();
        })
        .catch((e) => {
          this.set_alert({
            appAlertType: "Error",
            appAlertMsg: errorCodes(e.code),
            priority: true,
          });
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false;
            this.dialog = false;
          }, 2000);
        });
    },

    logout_user() {
      this.logout();
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped></style>
