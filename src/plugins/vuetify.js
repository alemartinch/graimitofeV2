import Vue from "vue";
import Vuetify from "vuetify";
import "@mdi/font/css/materialdesignicons.css";
import es from "vuetify/es5/locale/es";

Vue.use(Vuetify);

export default new Vuetify({
  breakpoint: {
    thresholds: {
      xs: 600,
      sm: 960,
      md: 1383,
      lg: 1904,
    },
  },
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        // primary: '#1976D2',
        primary: "#449CC9",
        secondary: "#424242",
        // accent: '#82B1FF',
        accent: "#44CC7B",
        error: "#FF7373",
        info: "#2196F3",
        success: "#4CAF50",
        warning: "#FFC107",
      },
      dark: {
        // primary: '#1976D2',
        primary: "#306d96",
        secondary: "#306d96",
        accent: "#306d96",
        error: "#306d96",
        info: "#306d96",
        success: "#306d96",
        warning: "#306d96",
      },
    },
  },
  icons: {
    iconfont: "mdi",
  },
  lang: {
    locales: { es },
    current: "es",
  },
});
