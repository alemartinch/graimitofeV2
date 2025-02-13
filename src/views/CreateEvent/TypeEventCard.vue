<template>
  <v-hover v-slot:default="{ hover }">
    <v-card
      width="250px"
      :disabled="
        (!origin.loading && loading) || (isMobile && origin.key !== 'OBSV')
      "
      class="px-2 py-5 d-flex flex-column align-center"
      :style="{
        borderColor: hover ? '#449CC9' : '',
        borderWidth: '2px',
      }"
      @click="$emit('on-click', origin.key)"
      outlined
      flat
    >
      <span class="text-caption text-md-body-1 text-uppercase">{{
        origin.name
      }}</span>
      <div
        class="mt-2 flex-grow-1 d-flex flex-column justify-center align-center"
      >
        <v-img
          v-if="!origin.loading"
          contain
          :src="origin_img"
          :max-width="isMobile ? '30%' : '40%'"
          :style="{ opacity: hover || isMobile ? '1' : '0.7' }"
        ></v-img>
        <AppSpinner v-else> </AppSpinner>
      </div>
    </v-card>
  </v-hover>
</template>
<script>
import AppSpinner from "@/components/app-page/AppSpinner.vue";

export default {
  name: "TypeEventCard",
  components: { AppSpinner },
  props: {
    loading: {},
    newEvent: {},
    origin: {
      type: Object,
    },
  },
  computed: {
    origin_img() {
      if (this.origin?.img) {
        return new URL(`../../assets/${this.origin.img}`, import.meta.url).href;
      } else {
        return "";
      }
    }
  }
};
</script>
