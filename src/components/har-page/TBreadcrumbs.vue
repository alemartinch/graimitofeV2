<template>
  <v-breadcrumbs v-bind="$attrs" v-on="$listeners">
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item
        @click="emitEvent(item.link)"
        style="opacity: 0.7"
        class="caption"
        :class="{ 'font-weight-bold': item.strong, 'link-to': item.link }"
      >
        {{ item.text.toUpperCase() }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>
<script>
export default {
  name: "t-breadcrumbs",
  methods: {
    emitEvent(link) {
      if (link) this.$emit("on-click");
    },
  },
};
</script>

<style scoped>
.link-to {
  cursor: pointer;
  transition: all ease 50ms;
}
.link-to:hover {
  color: #449cc9;
  opacity: 1;
}
</style>
