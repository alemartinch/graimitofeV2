<template>
  <v-container fill-height fluid class="grey lighten-3">
    <v-row justify="center" class="ma-0">
      <v-col cols="auto">
        <v-card
          :disabled="loading.login"
          :loading="loading.login"
          width="400px"
          elevation="24"
        >
          <v-card-title class="blue-grey darken-4 white--text display-1 pt-9">
            <img
              :src="require('@/assets/imagotipoTCMT.png')"
              style="width: 30%"
              class="mx-auto"
              alt="Logo TCMT"
            />
          </v-card-title>
          <v-card-text class="pb-0">
            <v-form v-model="formLoginValid" class="px-5 pt-10">
              <p v-if="forgottenPassword" class="mb-10">
                Proporciona tu nombre de usuario para que se te envíe un correo
                con la nueva contraseña.
              </p>
              <v-row>
                <v-text-field
                  ref="userField"
                  v-model="username"
                  autofocus
                  solo
                  flat
                  outlined
                  dense
                  autocomplete="off"
                  class="px-3"
                  label="Usuario"
                  prepend-inner-icon="mdi-account"
                  :rules="[rAlphaNumericSigns]"
                />
              </v-row>
              <v-row>
                <v-text-field
                  v-if="!forgottenPassword"
                  v-model="password"
                  solo
                  flat
                  outlined
                  dense
                  class="px-3"
                  label="Password"
                  prepend-inner-icon="mdi-lock"
                  :type="showPass ? 'text' : 'password'"
                  :append-icon="
                    showPass ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
                  "
                  @click:append="showPass = !showPass"
                  @keyup.enter.stop="login_user"
                  :rules="[rAlphaNumericSigns]"
                />
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <span
              v-if="!forgottenPassword"
              class="text-body-2 ml-7 link"
              @click="forgottenPassword = true"
              >¿Olvidó su contraseña?</span
            >
            <v-spacer />
            <t-btn-primary
              v-if="!forgottenPassword"
              :disabled="!formLoginValid || !username || !password"
              @click.stop="login_user"
              :loading="loading.login"
              >Acceder
            </t-btn-primary>
            <t-btn-secondary
              v-if="forgottenPassword"
              @click="cancelResetPassword"
            >
              cancelar
            </t-btn-secondary>
            <t-btn-primary
              v-if="forgottenPassword"
              @click.stop="sendNewPassword"
              :loading="loading.sendNewPassword"
              :disabled="!formLoginValid || !username"
            >
              enviar
            </t-btn-primary>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { LoginMixin } from "@/views/Login/mixins";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";

export default {
  components: { TBtnSecondary, TBtnPrimary },
  mixins: [LoginMixin],
};
</script>

<style scoped>
.link {
  color: rgba(21, 50, 64, 0.6);
}
.link:hover {
  text-decoration: underline;
  color: #449cc9;
  cursor: pointer;
}
</style>
