<template>
  <v-app>
    <component :is="alert" />
    <AppLayout>
      <v-main>
        <router-view />
      </v-main>
    </AppLayout>
    <v-dialog v-model="updateExists" width="500" persistent>
      <v-card>
        <v-card-title
          >Actualización disponible <v-spacer /><v-icon color="accent"
            >mdi-download</v-icon
          ></v-card-title
        >
        <v-card-text class="text-body-1"
          >Hay una nueva versión del sistema. Debe actualizar para poder
          continuar.</v-card-text
        >
        <v-card-actions>
          <v-spacer />
          <v-btn text color="primary" @click="refreshApp()"
            >actualizar
          </v-btn></v-card-actions
        >
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import AppAlertMb from "@/components/reusable/AppAlertMb.vue";
import AppAlert from "@/components/reusable/AppAlert.vue";
import AppLayout from "@/Layouts/AppLayout.vue";
import { Update } from "@/mixins/Update";
import { mapActions, mapGetters } from "vuex";
import "vuetify/dist/vuetify.min.css"

export default {
  name: "App",
  mixins: [Update],
  components: {
    AppLayout,
    AppAlertMb,
    AppAlert,
  },
  data: () => ({
    drawer: null,
    //
  }),
  created() {
    if (this.loggedIn) {
      this.get_page_data().catch(() => "Hubo un error en la carga de datos");
    }
  },
  computed: {
    ...mapGetters("user", ["loggedIn"]),
    alert() {
      return this.$vuetify.breakpoint.smAndDown ? "AppAlertMb" : "AppAlert";
    },
  },
  methods: {
    ...mapActions(["get_page_data"]),
  },
};
</script>

<style>
.view-container {
  max-width: 100%;
  padding: 12px;
  height: calc(100vh - 48px);
  overflow: auto;
}
::-webkit-scrollbar {
  width: 5px;
  /*border-radius: 10px;*/
  background: lightgrey;
}
::-webkit-scrollbar-thumb {
  width: 5px;
  /*border-radius: 10px;*/
  background: rgba(21, 50, 64, 0.6);
}
.contenedor {
  scrollbar-width: thin;
}
.v-pagination__item {
  box-shadow: none !important;
}
.v-pagination__navigation {
  box-shadow: none !important;
}
.theme--light.v-pagination .v-pagination__item--active {
  color: #449cc9 !important;
  font-weight: bolder !important;
}
.theme--light.v-pagination .v-pagination__item--active:after {
  content: "";
  display: block;
  width: 8px;
  height: 2px;
  position: relative;
  margin: auto;
  top: 0;
  left: 0;
  background-color: #449cc9 !important;
}

.v-application ul,
.v-application ol {
  padding-left: 0;
}
</style>
