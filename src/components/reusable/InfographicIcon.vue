<template>
  <v-tooltip top :disabled="!tooltip">
    <template v-slot:activator="{ on }">
      <div
        v-on="on"
        class="d-flex justify-center align-center"
        :style="{
          width: `${getSize.wrapperSize}px`,
          height: `${getSize.wrapperSize}px`,
          border: `1px ${dashed ? 'dashed' : 'solid'} ${resolveColor}`,
          borderRadius: '50%',
          paddingTop: '2px',
        }"
      >
        <v-icon :size="getSize.iconSize" :color="resolveColor">{{
          icon
        }}</v-icon>
        <slot></slot>
      </div>
    </template>
    {{ tooltip }}
  </v-tooltip>
</template>
<script>
export default {
  name: "InfographicIcon",
  props: {
    icon: {
      type: String,
      default: "mdi-none",
    },
    size: {
      type: [Number, String],
      default: 36,
    },
    color: {
      type: String,
      default: "currentColor",
    },
    small: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: String,
      default: "",
    },
    dashed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      attr: this.$attrs,
    };
  },
  computed: {
    getSize() {
      if (this.small) {
        return { iconSize: "16", wrapperSize: 32 };
      }
      if (this.large) {
        return { iconSize: "24", wrapperSize: 40 };
      }
      return { iconSize: "20", wrapperSize: 36 };
    },
    resolveColor() {
      switch (this.color) {
        case "currentColor":
          return "#153240";
        case "success":
          return "#4CAF50";
        case "warning":
          return "orange";
        case "error":
          return "#FF7373";
        case "accent":
          return "#44CC7B";
        default:
          return this.color;
      }
    },
  },
};
</script>
