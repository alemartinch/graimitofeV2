<template>
  <div class="ly-container">
    <div class="header elevation-22">
      <slot
        name="header"
        v-bind:toggleFilters="toggleFilters"
        v-bind:showFilters="showFilters"
      />
    </div>
    <div class="content">
      <div class="data">
        <slot name="content" />
      </div>
      <v-expand-x-transition>
        <div class="filters" v-show="showFilters">
          <slot name="filters" />
        </div>
      </v-expand-x-transition>
    </div>
  </div>
</template>

<script>
export default {
  name: "LayoutPanel",
  data() {
    return {
      showFilters: true,
    };
  },
  methods: {
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
  },
};
</script>
<style scoped>
.ly-container {
  height: 100%;
}
.header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 16px;
  height: 64px;
  z-index: 1;
}
.content {
  position: relative;
  display: flex;
  height: calc(100vh - 48px - 64px);
}
.data {
  flex-grow: 1;
  height: 100%;
  overflow: auto;
}
.filters {
  height: 100%;
  display: flex;
  width: 300px;
  flex-grow: 0;
  background-color: #f5f7f9;
  border-left: 1px solid #cfd7df;
  flex-direction: column;
  align-items: center;
}
</style>
