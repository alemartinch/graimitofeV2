<template>
  <v-tooltip
    :top="!bottomTooltip"
    :bottom="bottomTooltip"
    :disabled="!tooltip"
    open-delay="500"
  >
    <template v-slot:activator="{ on: tooltip }">
      <v-btn
        v-bind="$attrs"
        v-on="$listeners"
        :color="color"
        icon
        plain
        small
        :ripple="false"
      >
        <v-icon v-on="tooltip"
          >{{ small ? "mdi-18px" : "mdi-24px" }}
          <slot></slot>
        </v-icon>
      </v-btn>
    </template>
    <span v-html="tooltip"></span>
  </v-tooltip>
</template>

<script>
export default {
  name: "TBtnIcon",
  props: {
    color: {
      type: String,
      default: "primary",
    },
    small: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: String,
      default: "",
    },
    bottomTooltip: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
