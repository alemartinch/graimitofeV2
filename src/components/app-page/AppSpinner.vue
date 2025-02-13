<template>
  <v-container fluid fill-height v-if="true">
    <v-row justify="center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="60"
        height="60"
        viewBox="0 0 500 500"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0" x2="1" y1="1" y2="0">
            <stop offset="10%" stop-color="#449CC9">
              <animate
                attributeName="stop-color"
                values="#449CC9; #FFF; #449CC9"
                dur="1s"
                repeatCount="indefinite"
              ></animate>
            </stop>

            <stop offset="100%" stop-color="#FFF">
              <animate
                attributeName="stop-color"
                values="#FFF; #449CC9; #FFF"
                dur="1s"
                repeatCount="indefinite"
              ></animate>
            </stop>
          </linearGradient>

          <linearGradient id="logo-gradient-point" x1="0" x2="1" y1="1" y2="0">
            <stop offset="10%" stop-color="#44CC7B">
              <animate
                attributeName="stop-color"
                values="#44CC7B; #FFF; #44CC7B"
                dur="1s"
                repeatCount="indefinite"
              ></animate>
            </stop>

            <stop offset="100%" stop-color="#FFF">
              <animate
                attributeName="stop-color"
                values="#FFF; #44CC7B; #FFF"
                dur="1s"
                repeatCount="indefinite"
              ></animate>
            </stop>
          </linearGradient>
        </defs>
        <g>
          <path
            d="M422.19 188.47A46.92 46.92 0 1 0 358 171.56a46.92 46.92 0 0 0 64.16 16.91"
            style="fill: url('#logo-gradient-point')"
          />
          <path
            d="m210.79 295.8-.06-.11a46.9 46.9 0 1 0-33.31-57.13v-.09c-12 45.37-73.12 81-118.49 69.07a46.91 46.91 0 1 0 33.41 57.31c12-45.38 73.12-81 118.5-69.07"
            style="fill: url('#logo-gradient')"
          />
          <path
            d="M23.3 188.47a46.9 46.9 0 0 0 64.15-16.91 46.16 46.16 0 0 0 4.63-11.63l.14.24c12.24-45.29 73-80.2 118.28-68l-.13-.24a46.37 46.37 0 0 0 12.37 1.86 46.92 46.92 0 1 0-45.16-58.89l-.13-.22c-12.24 45.29-73 80.2-118.29 68l.13.23a46.81 46.81 0 0 0-36  85.6M422.19 312.38a46.29 46.29 0 0 0-68.79 28.54l-.14-.24c-12.24 45.29-73 80.2-118.28 68l.13.24a46.37 46.37 0 0 0-12.37-1.92 46.92 46.92 0 1 0 45.17 59l.12.22c12.24-45.29 73-80.2 118.29-68l-.13-.23a46.81 46.81 0 0 0 36-85.6"
            style="fill: url('#logo-gradient')"
          />
        </g>
      </svg>
      <!--      <v-progress-circular-->
      <!--        :value="value"-->
      <!--        class="fixed"-->
      <!--        :size="$vuetify.breakpoint.smAndDown ? 40 : 80"-->
      <!--        color="primary"-->
      <!--        :indeterminate="!value"-->
      <!--      >-->
      <!--      </v-progress-circular>-->
      <!--      <span-->
      <!--        v-if="!$vuetify.breakpoint.smAndDown"-->
      <!--        style="color: #449cc9; margin-top: 170px"-->
      <!--        >{{ msg }}</span-->
      <!--      >-->
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "AppSpinner",
  props: {
    msg: {
      type: String,
      default: "Cargando",
      required: false,
    },
    value: {
      type: Number,
      default: 0,
      required: false,
    },
  },
  data: () => ({}),
  computed: {
    ...mapState(["appLoading"]),
  },
};
</script>

<style scoped>
.fixed {
  position: fixed;
  top: 50%;
}
.global-spinner {
  position: absolute;
  background-color: white;
  z-index: 10;
}
</style>
