<script>
export default {
  name: "HomeMobileSkeleton",
};
</script>

<template>
  <div style="opacity: 0.7">
    <v-skeleton-loader type="card" height="150px" />
    <v-skeleton-loader type="card" height="150px" class="mt-5" />
    <v-skeleton-loader type="list-item-two-line@4" class="mt-5" />
  </div>
</template>

<style scoped></style>
