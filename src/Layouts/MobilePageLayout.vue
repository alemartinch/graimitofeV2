<template>
  <div>
    <div
      class="header"
      :style="{
        boxShadow: isScrolling
          ? 'rgb(99 99 99 / 20%) 0px 5px 5px -5px'
          : 'none',
      }"
    >
      <v-btn color="primary" icon @click="$router.go(-1)"
        ><v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <slot name="title" v-bind:isScrolling="isScrolling"></slot>
      <v-spacer />
      <slot name="actions" v-bind:isScrolling="isScrolling"></slot>
    </div>
    <div class="content" v-scroll.self="handleScroll">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "MobilePageLayout",
  data() {
    return {
      isScrolling: false,
    };
  },
  methods: {
    handleScroll(e) {
      this.isScrolling = e.target.scrollTop !== 0;
    },
  },
};
</script>

<style scoped>
.header {
  background-color: white;
  display: flex;
  align-items: center;
  padding: 8px;
}
.content {
  height: calc(100vh - 56px - 56px);
  overflow: auto;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.content::-webkit-scrollbar {
  display: none;
}
</style>
