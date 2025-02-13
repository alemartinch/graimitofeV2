<template>
  <v-dialog v-model="tagsDialog" :max-width="isMobile ? 400 : 800" persistent>
    <v-card :disabled="loading.getTags">
      <v-card-title>Seleccione las etiquetas</v-card-title>
      <v-card-text style="height: 300px; overflow: auto">
        <TablePagination
          item-name="Etiquetas"
          :page.sync="page"
          :length="pageCount"
          :total-items="totalItems"
          :border="false"
        />
        <v-progress-linear v-if="loading.getSectorsType" indeterminate />
        <v-chip-group
          v-model="selectedTags"
          active-class="primary--text"
          column
          multiple
          class="mt-10"
          v-else-if="availableTags.length"
        >
          <v-chip
            v-for="tag in availableTags"
            :key="tag.id"
            :color="tag.colour"
            :value="tag"
            filter
            outlined
            label
            small
          >
            {{ tag.name }}
          </v-chip>
        </v-chip-group>
        <p v-else>
          Se han usado todas las etiquetas disponibles. Puede crear una nueva
          desde el botón <code>NUEVA ETIQUETA</code>
        </p>
      </v-card-text>
      <v-card-actions class="justify-end">
        <EventTagDialogCreateNewTag
          v-if="isCurrentUserSme"
          v-on:tag-created="insertNewTag"
        />
        <v-spacer />
        <t-btn-secondary @click="$emit('close-tags-dialog')"
          >Cerrar</t-btn-secondary
        >
        <t-btn-primary @click="applyTags" :disabled="!selectedTags.length"
          >Aceptar</t-btn-primary
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { eatApi } from "@/apis";
import { mapActions, mapGetters, mapMutations } from "vuex";
import EventTagDialogCreateNewTag from "@/components/newevent-page/EventLoader/EventTagDialogCreateNewTag.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import TablePagination from "@/components/reusable/TablePagination.vue";

export default {
  name: "SelectableTagDialog",
  components: {
    TablePagination,
    TBtnPrimary,
    TBtnSecondary,
    EventTagDialogCreateNewTag,
  },
  data() {
    return {
      tagsDialog: true,
      apiTags: [],
      selectedTags: [],
      loading: {
        getTags: false,
      },
      page: 1,
      totalItems: 0,
    };
  },

  created() {
    this.getTags();
  },

  watch: {
    page() {
      this.getTags();
    },
  },

  computed: {
    ...mapGetters("event", ["getEventTags"]),
    ...mapGetters("user", ["isCurrentUserSme"]),

    pageCount() {
      return Math.ceil(this.totalItems / 30);
    },

    availableTags() {
      const currentEventTagsIds = this.getEventTags
        ? this.getEventTags?.map((tag) => tag.id)
        : [];
      const allTags = this.apiTags || [];
      allTags.sort((a, b) => b.id - a.id);

      return allTags.filter((tag) => {
        return !currentEventTagsIds.includes(tag.id);
      });
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("event", ["PUSH_EVENT_TAGS"]),
    ...mapActions("event", ["update_event"]),

    getTags() {
      this.loading.getTags = true;
      eatApi
        .getFetcher()
        .get("/tags/", {
          params: {
            page: this.page,
            page_size: 30,
          },
        })
        .then(({ data }) => {
          const { totalItems, results } = data;
          this.apiTags = results;
          this.totalItems = totalItems;
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un error al consultar las etiquetas",
          });
        })
        .finally(() => {
          this.loading.getTags = false;
        });
    },

    applyTags() {
      this.PUSH_EVENT_TAGS(this.selectedTags);
      this.update_event();
      this.selectedTags = [];
    },

    insertNewTag(newTag) {
      this.apiTags.unshift(newTag);
    },
  },
};
</script>
