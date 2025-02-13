<template>
  <v-autocomplete
    v-model="model"
    :items="items"
    :loading="isLoading"
    :search-input.sync="search"
    color="white"
    hide-no-data
    hide-selected
    item-text="id"
    item-value="id"
    placeholder="ID Evento"
    solo
    dense
    hide-details
    @input="goToEvent(model.id)"
    append-icon="mdi-magnify"
    return-object
  >
    <template v-slot:item="data">
      <span class="body-2"
        >{{ data.item.id }} - {{ nameEventOrigin(data.item.event_origin) }} -
        {{ data.item.originator | fullName }}</span
      >
    </template>
  </v-autocomplete>
</template>

<script>
import { eatApi } from "@/apis";

export default {
  name: "GlobalSearch",
  data: () => ({
    descriptionLimit: 60,
    entries: [],
    items: [],
    isLoading: false,
    model: null,
    search: null,
  }),

  computed: {
    fields() {
      if (!this.model) return [];

      return Object.keys(this.model).map((key) => {
        return {
          key,
          value: this.model[key] || "n/a",
        };
      });
    },
    // items () {
    //   return this.entries.map(entry => {
    //     const Description = entry.Description.length > this.descriptionLimit
    //       ? entry.Description.slice(0, this.descriptionLimit) + '...'
    //       : entry.Description
    //
    //     return Object.assign({}, entry, { Description })
    //   })
    // }
  },

  watch: {
    search() {
      // Items have already been loaded
      // if (!this.items) return

      // Items have already been requested
      if (this.isLoading) return;

      this.isLoading = true;

      // Lazily load input items
      eatApi
        .getFetcher()
        .get(`events/?page=1&page_size=50`)
        .then((res) => {
          this.items = res.data.results;
        })
        .catch(() => {})
        .finally(() => (this.isLoading = false));
    },
  },

  methods: {
    goToEvent(eventID) {
      this.$router.push({ path: `/events/${eventID}` });
      this.model = "";
    },

    nameEventOrigin(eventOrigin) {
      switch (eventOrigin) {
        case EVENT_ORIGINS.CHANGE:
          return "Gestión de cambio";
        case EVENT_ORIGINS.EXTERNAL_AUD:
          return "Auditoría externa";
        case EVENT_ORIGINS.INTERNAL_AUD:
          return "Auditoría interna";
        case EVENT_ORIGINS.PROJECT:
          return "Proyecto";
        case EVENT_ORIGINS.INTERNAL_REQ:
          return "Requerimiento interno";
        case EVENT_ORIGINS.EXTERNAL_REQ:
          return "Requerimiento legal";
        case EVENT_ORIGINS.CRITICAL:
          return "Evento crítico";
        case EVENT_ORIGINS.OBSERVATION:
          return "Observación";
      }
    },
  },
};
</script>

<style scoped></style>
