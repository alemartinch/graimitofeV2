<template>
  <v-dialog v-model="dialog" width="500" :persistent="true">
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
      <v-card-subtitle class="mt-0 mb-4">
        <span style="font-size: 13px">La contraseña nueva debe tener al menos una
        mayúscula, un número y un caracter especial, ademas no debe incluir datos del usuario</span>
      </v-card-subtitle>
      <v-card-text>
        <v-form ref="form" v-model="validForm">
          <v-row>
            <v-col cols="12" class="py-0">
              <div class="body-2 my-0">Contraseña actual</div>
              <v-text-field
                  v-model="currentPassword"
                  placeholder=""
                  solo
                  flat
                  outlined
                  dense
                  required
                  :rules="[conPassRules.required]"
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
                  :rules="[conPassRules.required, conPassRules.min, conPassRules.rPasswordComplex]"
                  @focus="newPassError = null"
                  :type="showPass2 ? 'text' : 'password'"
                  :append-icon="
                  showPass2 ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
                "
                  @click:append="showPass2 = !showPass2"
              />
            </v-col>
            <ul class="mb-2 mt-0 ps-3">
              <li :class="{'color-green': testNumberComputed }">
                <span class="mdi mdi-check-circle"></span>Un número de 0 a 9.
              </li>
              <li :class="{'color-green': testMayusComputed }">
                <span class="mdi mdi-check-circle"></span>Una letra mayúscula.
              </li>
              <li :class="{'color-green': testSpecialComputed }">
                <span class="mdi mdi-check-circle"></span>Un caracter especial (!¡@#$%&?¿/+-).
              </li>
              <li :class="{'color-green': testMinLengthComputed }">
                <span class="mdi mdi-check-circle"></span>Mínimo 8 caracteres de logitud.
              </li>
            </ul>
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
                  :rules="[conPassRules.required, conPassRules.match]"
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
            @click="closeDialog()"
            :disabled="loading"
        >cerrar
        </v-btn
        >
        <v-btn
            v-else
            color="secondary"
            text
            @click="logout_user"
            :disabled="loading"
        >salir
        </v-btn
        >
        <v-btn
            color="primary"
            text
            @click="updateUserPass"
            :loading="loading"
            :disabled="!validForm"
        >cambiar
        </v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {eatApi} from "@/apis";
import {Validations} from "@/mixins/Validations";
import {mapActions} from "vuex";
import errorCodes from "@/apis/errorCodes";
import IconEye from "../Icons/IconEye.vue";

export default {
  name: "PasswordForm",
  components: {IconEye},
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
        rPasswordComplex(v) {
          return (
              /[A-Z]/.test(v) &&
              /[!¡@#$%^&*()\-_=+[\]{};:'"\\|,.<>/¿?]/.test(v) ||
              "Debe contener al menos una mayúscula y un carácter especial"
          );
        },

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
    testMayusComputed() {
      return (
          /[A-Z]/.test(this.newPassword)
      );
    },
    testNumberComputed() {
      return (
          /[0-9]/.test(this.newPassword)
      );
    },
    testSpecialComputed() {
      return (
          /[!@#$%^&*()\-_=+[\]{};:'"\\|,.<>/?]/.test(this.newPassword)
      )
    },
    testMinLengthComputed() {
      return (
          this.newPassword.length >= 8
      )
    }

  },
  methods: {
    ...mapActions(["set_alert"]),
    ...mapActions(["logout"]),

    closeDialog() {
      this.resetValues();
      this.dialog = false
    },

    resetValues () {
      this.$refs.form.reset();
      this.$refs.form.resetValidation();

      this.currentPassword = "";
      this.newPassword = "";
      this.confirmNewPassword = ""
      this.cunPassError = null;
      this.newPassError = null;
      this.conPassError = null;
      this.validForm = false;

    },

    updateUserPass() {
      this.loading = true;
      eatApi
          .getFetcher()
          .post(`/auth/password-change/`, {
            current_password: this.currentPassword,
            new_password: this.newPassword,
            new_password_again: this.confirmNewPassword,
          })
          .then((res) => {
            this.loading = false
            if (res !== false) {
            this.set_alert({
              appAlertType: "success",
              appAlertMsg: `La contraseña ha sido cambiada correctamente`,
            });
            this.logout_user()}
          })
          .catch((e) => {
            console.error(e)
           /* this.set_alert({
              appAlertType: "Error",
              appAlertMsg: errorCodes(e.code),
              priority: true,
            });*/
          })
          .finally(() => {
          });
    },

    logout_user() {
      this.logout();
      this.$router.push({name: "login"});
    },
  },
};
</script>

<style scoped>
.color-green {
  color: seagreen;
}

ul {
  list-style: none;

  & li {
    display: flex;
    align-items: center;
  }

  & span {
    margin-bottom: 4px;
    font-size: 24px;
    margin-right: 2px;
  }
}
</style>
