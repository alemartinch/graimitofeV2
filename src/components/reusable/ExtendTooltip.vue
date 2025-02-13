<template>
  <v-menu
    open-on-hover
    open-delay="500"
    max-width="500"
    nudge-top="9"
    nudge-left="9"
    :disabled="!text || text.length <= truncLength"
  >
    <template v-slot:activator="{ on }">
      <span v-on="on" v-if="!!text">{{ text | reduceText(+truncLength) }}</span>
      <span v-else class="text--disabled">{{ altText }}</span>
    </template>
    <v-card class="pa-2 text-body-2" outlined>
      <span>{{ text }}</span>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: "ExtendTooltip",
  props: {
    text: {
      type: String,
      require: true,
    },
    altText: {
      type: String,
      default: "Sin Datos",
    },
    truncLength: {
      type: [Number, String],
      default: "20",
    },
  },
};
</script>

<style scoped></style>
