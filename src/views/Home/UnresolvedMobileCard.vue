<template>
  <v-card
    class="pa-3 mt-2 rounded-lg"
    elevation="22"
    min-height="100"
    outlined
    :style="{ borderColor: totalItems ? '#449cc9' : '#44cc7b' }"
    @click="$emit('show-list')"
  >
    <div
      class="d-flex flex-column justify-center align-center"
      v-if="!totalItems"
    >
      <v-img
        :src="require('@/assets/goodjob.png')"
        width="40"
        contain
        class="my-5"
      />
      <span class="caption">NO TIENES {{ data.title.toUpperCase() }}</span>
    </div>
    <div class="d-flex align-center" v-else>
      <v-col cols="4" class="d-flex flex-column align-center">
        <span class="text-h4 font-weight-regular">{{ totalItems }}</span
        ><span class="caption text-center">{{ data.title.toUpperCase() }}</span>
      </v-col>
      <v-divider
        vertical
        class="mx-5"
        style="border-color: #449cc9; opacity: 0.5"
      />
      <div class="text-body-2 align-self-start">
        <div
          v-for="item in data.items"
          :key="item.title"
          :class="{ 'text--secondary': !item.value }"
        >
          <span class="text-h5">{{ item.value }}</span>
          <span class="caption ml-2">{{ item.title.toUpperCase() }}</span>
        </div>
      </div>
    </div>
  </v-card>
</template>
<script>
import { mapState } from "vuex";

export default {
  name: "UnresolvedMobileCard",
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["fca"]),

    totalItems() {
      return this.data.items.reduce((acumulador, elemento) => {
        return acumulador + elemento.value;
      }, 0);
    },
  },
};
</script>
