<template>
  <div class="ly-container">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="content pa-5 overflow-auto">
      <slot name="content"></slot>
    </div>
    <div class="side">
      <slot name="side"></slot>
    </div>
    <div class="actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "DialogLayout",
};
</script>

<style scoped>
.ly-container {
  display: grid;
  height: 90vh;
  grid-template-columns: 65% 35%;
  grid-template-rows: auto 1fr 52px;
  grid-template-areas:
    "header side"
    "content side"
    "footer footer";
  grid-column-gap: 0;
  grid-row-gap: 0;
}

.header {
  grid-area: header;
}
.content {
  grid-area: content;
}
.side {
  grid-area: side;
}
.actions {
  grid-area: footer;
}
</style>
