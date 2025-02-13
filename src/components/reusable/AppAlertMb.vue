<template>
  <v-snackbar
    width="100%"
    v-model="snackbar"
    :timeout="duration"
    transition="slide-y-reverse-transition"
  >
    <div class="d-flex align-center" v-if="snackbar">
      <v-icon :color="iconoColor" class="mr-2">
        {{ icono }}
      </v-icon>
      <p style="width: 300px" class="mb-0" v-html="appAlert.appAlertMsg" />
      <v-spacer />
      <v-btn
        small
        icon
        @click="snackbar = false"
        class="mr-3 align-self-center"
      >
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </div>
  </v-snackbar>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "AppAlertMb",
  data() {
    return {
      snackbar: false,
    };
  },
  computed: {
    ...mapState(["appAlert"]),

    mobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    duration() {
      // let wordsCount = this.appAlert?.appAlertMsg?.split(" ").length || "";
      return 5000;
    },

    titulo: function () {
      switch (this.appAlert.appAlertType.toLowerCase()) {
        case "success":
        case "succes":
        case "sucess":
          return "OK";
        case "info":
        case "information":
        case "informacion":
          return "INFO";
        case "warning":
        case "aviso":
        case "notice":
          return "AVISO";
        case "error":
          return "ERROR";
        default:
          return "INFO";
      }
    },

    icono() {
      switch (this.appAlert.appAlertType.toLowerCase()) {
        case "success":
        case "succes":
        case "sucess":
          return "mdi-check-circle-outline";
        case "info":
        case "information":
        case "informacion":
          return "mdi-information-outline";
        case "warning":
        case "aviso":
        case "notice":
          return "mdi-alert-outline";
        case "error":
          return "mdi-close-circle-outline";
        default:
          return "mdi-information-outline";
      }
    },

    iconoColor: function () {
      switch (this.icono) {
        case "mdi-check-circle-outline":
          return "green";
        case "mdi-information-outline":
          return "info";
        case "mdi-alert-outline":
          return "orange";
        case "mdi-close-circle-outline":
          return "red";
        default:
          return "info";
      }
    },
  },

  watch: {
    appAlert: function (appAlert) {
      this.snackbar = !!appAlert;
    },
  },
};
</script>

<style scoped></style>
