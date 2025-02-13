<template>
  <component
    :is="componentType"
    v-bind="$attrs"
    v-on="$listeners"
    :items="items"
    :search-input.sync="search"
    :loading="loading"
    :label="label"
    clearable
  >
    <template v-slot:item="data">
      <slot name="item" v-bind="data"></slot>
    </template>
    <template v-slot:selection="data">
      <slot name="selection" v-bind="data"></slot>
    </template>
  </component>
</template>

<script>
import { VAutocomplete, VCombobox } from "vuetify/lib/components";
import qs from "qs";

export default {
  name: "AsyncCombobox",
  props: {
    combobox: {
      type: Boolean,
      default: true,
    },
    api: {
      type: Function,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    searchParam: {
      type: String,
      required: true,
    },
    params: {
      type: Object,
      default: () => {},
    },
    preload: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      items: [],
      search: null,
      timeout: null,
      loading: false,
    };
  },
  created() {
    this.loadData(
      this.preload.length
        ? { id: this.preload.map((u) => u.id) }
        : { page: 1, page_size: 50 }
    );
  },
  methods: {
    loadData(params = {}) {
      this.loading = true;
      this.api
        .get(this.url, {
          params: { ...params, ...this.params },
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then(({ data }) => {
          this.items = [...this.items, ...data.results];
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  watch: {
    search(val) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.loadData({ [this.searchParam]: val });
      }, 500);
    },
    params: {
      handler() {
        this.items = [];
        this.loadData({ page: 1, page_size: 50 });
      },
      deep: true,
    },
  },
  computed: {
    componentType() {
      return this.combobox ? VCombobox : VAutocomplete;
    },
  },
};
</script>

<style scoped></style>
