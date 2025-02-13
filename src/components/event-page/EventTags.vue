<template>
  <div class="ml-6 d-flex align-center">
    <v-chip
      v-for="tag in visibleTags"
      :key="tag.id"
      x-small
      outlined
      :color="tag.colour"
      label
      :close="canEditEventTags()"
      :text-color="tag.colour"
      class="mx-1 pa-2"
      close-icon="mdi-close"
      @click:close="deleteEventTags(tag)"
    >
      {{ tag.name }}
    </v-chip>
    <v-menu bottom offset-y open-on-hover v-if="hiddenTags.length">
      <template v-slot:activator="{ on }">
        <v-chip x-small v-on="on">+{{ hiddenTags.length }}</v-chip>
      </template>
      <v-card class="pa-2">
        <v-chip
          v-for="tag in hiddenTags"
          :key="tag.id"
          x-small
          outlined
          :color="tag.colour"
          label
          :close="canEditEventTags()"
          :text-color="tag.colour"
          class="mx-1 pa-2"
          close-icon="mdi-close"
          @click:close="deleteEventTags(tag)"
        >
          {{ tag.name }}
        </v-chip>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { permissions } from "@/mixins/permissions";

export default {
  name: "EventTags",
  mixins: [permissions],

  data() {
    return {
      maxVisibleTags: 3,
    };
  },

  computed: {
    ...mapGetters("event", ["getEventTags"]),

    visibleTags() {
      if (this.getEventTags) {
        return this.getEventTags.slice(0, this.maxVisibleTags);
      } else {
        return false;
      }
    },

    hiddenTags() {
      if (this.getEventTags) {
        return this.getEventTags.slice(this.maxVisibleTags);
      } else {
        return [];
      }
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("event", ["DELETE_EVENT_TAG"]),
    ...mapActions("event", ["update_event"]),

    deleteEventTags(tag) {
      this.DELETE_EVENT_TAG(tag.id);
      this.update_event().then(() => {
        this.SET_ALERT({
          appAlertType: "success",
          appAlertMsg: "Etiqueta eliminada exitosamente",
        });
      });
    },
  },
};
</script>

<style scoped></style>
