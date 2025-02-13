<template>
  <v-container fluid class="bg-login" fill-height style="height: 100vh">
    <v-row justify="center"
      ><img
        :src="require('@/assets/imagotipoTCMT_mob.svg')"
        width="50%"
        alt="TCMT logo"
    /></v-row>
    <v-form
      v-model="formLoginValid"
      class="pa-5 mb-16"
      style="width: 100%"
      :disabled="loading.login"
    >
      <v-row>
        <v-text-field
          v-model="username"
          autofocus
          class="px-3"
          label="Usuario"
          filled
          solo
          flat
          outlined
          autocomplete="off"
          :rules="[rAlphaNumericSigns]"
        />
      </v-row>
      <v-row>
        <v-text-field
          v-model="password"
          class="px-3"
          label="Password"
          filled
          solo
          flat
          outlined
          :type="showPass ? 'text' : 'password'"
          :append-icon="showPass ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
          @click:append="showPass = !showPass"
          @keyup.enter.stop="login_user"
          :rules="[rAlphaNumericSigns]"
        />
      </v-row>
      <v-btn
        block
        large
        :disabled="!formLoginValid || !username || !password"
        class="primary"
        @click.stop="login_user"
        :loading="loading.login"
        >Acceder
      </v-btn>
    </v-form>
  </v-container>
</template>

<script>
import { LoginMixin } from "@/views/Login/mixins";

export default {
  mixins: [LoginMixin],
};
</script>

<style>
.bg-login {
  background: #eeeeee;
  /*background: url("/static/img/Bgs/bg-login.png");*/
}
</style>
