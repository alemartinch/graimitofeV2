import "@/registerServiceWorker";
import Vue from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";
import vuetify from "@/plugins/vuetify";
import * as filters from "@/Filters";

store.commit(
  "set_apis_enabled",
  import.meta.env.VITE_APP_INSTALL_APIS
    ? import.meta.env.VITE_APP_INSTALL_APIS.split(",")
    : [],
);

store.commit(
  "set_features",
  import.meta.env.VITE_APP_FEATURE_FLAGS
    ? import.meta.env.VITE_APP_FEATURE_FLAGS.split(",")
    : [],
);

// FILTERS
Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

// MIXINS
Vue.mixin({
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
    isNotebook() {
      return this.$vuetify.breakpoint.mdAndDown;
    },
  },
});

Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  router,
  render: (h) => h(App),
}).$mount("#app");
