<script>
export default {
  name: "TaskMobileSkeleton",
};
</script>

<template>
  <div style="opacity: 0.7">
    <v-skeleton-loader type="article" height="125" />
    <v-skeleton-loader type="image" class="mt-2 mx-5 mb-5" height="80" />
    <div class="d-flex mx-5 mt-1" v-for="key in [1, 2, 3, 4]" :key="key">
      <v-skeleton-loader type="text" width="130" />
      <v-skeleton-loader type="text" width="130" class="ml-5" />
    </div>
    <div class="mt-5" v-for="key in [5, 6, 7, 8]" :key="key">
      <v-skeleton-loader type="list-item-avatar" class="mt-2 mx-5 pa-0" />
      <v-skeleton-loader type="paragraph" class="mx-5" />
    </div>
  </div>
</template>

<style scoped></style>
