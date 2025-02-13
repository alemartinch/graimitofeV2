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
  name: "TBtnSecondary",
  props: {
    color: {
      type: String,
      default: "secondary",
    },
  },
};
</script>
