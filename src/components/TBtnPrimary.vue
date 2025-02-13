<template>
  <v-btn
    :small="!isMobile"
    text
    :color="color"
    v-on="$listeners"
    v-bind="$attrs"
    :disabled="disabled"
  >
    <slot />
  </v-btn>
</template>

<script>
export default {
  name: "TBtnPrimary",
  props: {
    color: {
      type: String,
      default: "primary",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
