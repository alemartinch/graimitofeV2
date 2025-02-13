<template>
  <v-btn
    :small="!isMobile"
    text
    :color="color"
    v-on="$listeners"
    v-bind="$attrs"
  >
    <slot />
  </v-btn>
</template>

<script>
export default {
  name: "TBtnDelete",
  props: {
    color: {
      type: String,
      default: "error",
    },
  },
};
</script>
