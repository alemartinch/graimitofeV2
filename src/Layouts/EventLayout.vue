<template>
  <div class="ly-container">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="content overflow-auto">
      <slot name="content"></slot>
    </div>
    <div class="side">
      <slot name="side"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "EventLayout",
};
</script>

<style scoped>
.ly-container {
  display: grid;
  height: calc(100vh - 48px);
  grid-template-columns: 2fr 1.1fr;
  grid-template-rows: auto 1fr;
  grid-column-gap: 0;
  grid-row-gap: 0;
}

.header {
  grid-area: 1 / 1 / 2 / 2;
}
.content {
  grid-area: 2 / 1 / 3 / 2;
}
.side {
  grid-area: 1 / 2 / 3 / 3;
}
</style>
