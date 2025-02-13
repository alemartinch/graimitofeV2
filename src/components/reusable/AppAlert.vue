<template>
  <v-snackbar
    v-model="snackbarModel"
    vertical
    height="auto"
    class="pa-0 v-snack"
    light
    left
    bottom
    multi-line
    :timeout="duration"
    transition="slide-x-transition"
    elevation="22"
  >
    <v-row
      v-if="snackbarModel"
      class="ma-0 mt-2 d-flex align-start"
      @click="snackbarModel = false"
    >
      <v-icon :color="iconoColor" class="mr-2">
        {{ icono }}
      </v-icon>
      <p
        style="width: 400px"
        class="mb-0 mt-1 ml-5"
        v-html="appAlertInfo.appAlertMsg"
      />
      <v-spacer />
      <v-btn small icon @click="snackbarModel = false" class="ml-3">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-row>
  </v-snackbar>
</template>

<script>
import { mapMutations, mapState } from "vuex";
export default {
  name: "AppAlert",
  data() {
    return {
      appAlertInfo: {},
    };
  },
  computed: {
    ...mapState(["appAlert", "openSnackbar"]),

    snackbarModel: {
      get() {
        return this.openSnackbar;
      },
      set(value) {
        this.SET_SNACKBAR(value);
      },
    },

    mobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    duration() {
      // let wordsCount = this.appAlert?.appAlertMsg?.split(" ").length || "";
      return 5000;
    },

    titulo: function () {
      switch (this.appAlertInfo.appAlertType.toLowerCase()) {
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
      switch (this.appAlertInfo.appAlertType.toLowerCase()) {
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

  methods: {
    ...mapMutations(["SET_SNACKBAR"]),
  },

  watch: {
    appAlert: function (appAlertNew) {
      this.appAlertInfo = appAlertNew;
    },
  },
};
</script>

<style scoped>
.v-snack {
  bottom: 4em;
  left: 2em;
}
.v-snack__wrapper {
  display: block;
}
</style>
