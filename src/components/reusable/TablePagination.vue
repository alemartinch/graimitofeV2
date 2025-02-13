<template>
  <v-card
    class="d-flex align-center py-2"
    flat
    :disabled="loading"
    :style="{ 'border-bottom': border ? 'thin solid rgba(0, 0, 0, 0.12)' : '' }"
  >
    <span class="text-caption text-uppercase"
      >Total de {{ itemName }}:
      <span class="text-body-1 font-weight-bold">{{ totalItems }}</span></span
    >
    <v-spacer />
    <template v-if="pageSize">
      <span class="text-caption text-uppercase"
        >{{ itemName }} por página:</span
      >
      <v-chip-group
        :value="itemsPerPage"
        @change="$emit('update:itemsPerPage', $event)"
        class="ml-5"
        active-class="white--text text--accent-4 primary"
        mandatory
      >
        <v-chip
          v-for="item in itemsOptions"
          :key="item"
          :value="item"
          label
          small
        >
          {{ item }}
        </v-chip>
      </v-chip-group>
    </template>
    <span class="ml-10 text-caption text-uppercase">Páginas: </span>
    <v-pagination
      :value="page"
      @input="$emit('update:page', $event)"
      :length="length"
      :total-visible="totalVisible"
      color="white"
    />
  </v-card>
</template>
<script>
export default {
  name: "TablePagination",
  props: {
    pageSize: {
      type: Boolean,
      default: false,
    },
    itemName: {
      type: String,
      default: "items",
    },
    itemsPerPage: {},
    page: {
      type: Number,
      require: true,
    },
    length: {
      type: Number,
      require: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    itemsOptions: {
      type: Array,
      default: () => [5, 10, 15],
    },
    totalItems: {
      type: [Number, String],
      default: 0,
    },
    totalVisible: {
      type: Number,
      default: 7,
    },
    border: {
      type: Boolean,
      default: true,
    },
  },
};
</script>
<style scoped>
td {
  border-bottom: none !important;
}
</style>
