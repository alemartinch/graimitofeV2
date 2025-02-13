<template>
  <v-container
    v-if="globalError"
    fill-height
    fluid
    class="v-overlay--absolute bg-white"
  >
    <v-row justify="center" style="opacity: 0.6">
      <v-col>
        <v-img
          height="200"
          contain
          :src="require('@/assets/noresult.svg')"
        />
        <div class="display-1 font-weight-light text-center">
          Ups, ocurrió un problema.
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "GlobalError",

  computed: {
    ...mapState(["globalError"]),
  },

  methods: {
    ...mapMutations(["HIDE_GLOBAL_ERROR"]),
  },

  beforeDestroy() {
    this.HIDE_GLOBAL_ERROR();
  },
};
</script>

<style scoped>
.bg-white {
  background-color: whitesmoke;
  z-index: 10;
}
</style>
