<template>
  <span
    v-on="$listeners"
    class="caption font-weight-medium text-uppercase"
    :class="{ 'text-btn': !disabled }"
    ><slot
  /></span>
</template>
<script>
export default {
  name: "TBtnText",
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style scoped>
.text-btn {
  cursor: pointer;
  user-select: none;
  transition: 200ms ease all;
}
.text-btn:hover {
  color: #449cc9;
}
</style>
