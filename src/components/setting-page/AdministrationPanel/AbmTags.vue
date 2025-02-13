<template>
  <v-card flat>
    <v-data-table
      :headers="headers"
      :items="tags"
      :search="search"
      :loading="loading.getTags"
      :server-items-length="totalItems"
      :sectors="page"
      @page-count="pageCount = $event"
      :items-per-page="5"
      hide-default-footer
      fixed-header
    >
      <template v-slot:top>
        <v-toolbar flat>
          <TablePagination
            item-name="Etiquetas"
            :page.sync="page"
            :length="pageCount"
            :total-items="totalItems"
            :loading="loading.getTags"
            :border="false"
          />
          <v-spacer />
          <v-btn
            small
            outlined
            color="primary"
            elevation="0"
            class="ml-2"
            @click="$router.push({ path: 'abm-tags/edit-tag/new' })"
          >
            Nueva etiqueta
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.colour="{ item }">
        <v-chip small outlined :color="item.colour">{{
          item.name.toUpperCase()
        }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          small
          color="primary"
          class="ml-2"
          @click="openEditTagDialog(item.id)"
        >
          <v-icon> mdi-view-dashboard-edit-outline </v-icon>
        </v-btn>
        <v-btn
          v-if="isCurrentUserSme"
          icon
          small
          color="error"
          class="ml-2"
          @click="showDeleteTagDialog(item)"
        >
          <v-icon> mdi-delete-outline </v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <router-view v-on:load-tags="getTags" />
    <v-dialog v-model="deletedTagDialog" persistent width="500">
      <v-card>
        <v-card-title>¿Seguro desea eliminar esta etiqueta?</v-card-title>
        <v-card-text>
          <div>Escriba el nombre del etiqueta para confirmar</div>
          <v-text-field
            v-model="verifyField"
            solo
            flat
            outlined
            dense
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn small text color="secondary" @click="resetDeleting"
            >cancelar</v-btn
          >
          <v-btn
            small
            text
            color="error"
            :disabled="!isDeletedSectorVerify"
            @click="deleteTag"
            >eliminar etiqueta</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { eatApi } from "@/apis";
import TablePagination from "@/components/reusable/TablePagination.vue";
export default {
  name: "AbmTags",
  components: { TablePagination },
  data() {
    return {
      search: "",
      totalItems: 0,
      page: 1,
      pageCount: 0,
      tagSelected: {},
      dialog: false,
      tags: [],
      loading: {
        getTags: false,
        deleteTag: false,
      },
      deletedTagDialog: false,
      deletedTag: null,
      verifyField: "",
      headers: [
        {
          text: "id",
          align: "start",
          sortable: false,
          value: "id",
        },
        { text: "Nombre", value: "name" },
        { text: "Color", value: "colour" },
        { text: "Acciones", value: "actions", sortable: false, align: "right" },
      ],
    };
  },

  created() {
    this.getTags();
  },

  computed: {
    ...mapGetters("user", ["isCurrentUserSme"]),

    isDeletedSectorVerify() {
      return this.deletedTag?.name === this.verifyField;
    },
  },

  watch: {
    page() {
      this.getTags();
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),

    getTags() {
      this.loading.getTags = true;
      eatApi
        .getFetcher()
        .get("/tags/", {
          params: {
            page: this.page,
            page_size: 5,
          },
        })
        .then(({ data }) => {
          const { totalItems, results } = data;
          this.tags = results;
          this.totalItems = totalItems;
        })
        .catch(() => {})
        .finally(() => {
          this.loading.getTags = false;
        });
    },

    openEditTagDialog(tagID) {
      this.$router.push({ path: "abm-tags/edit-tag/" + tagID });
    },

    showDeleteTagDialog(tag) {
      this.deletedTag = tag;
      this.deletedTagDialog = true;
    },

    resetDeleting() {
      this.deletedTagDialog = false;
      this.deletedTag = null;
      this.verifyField = "";
    },

    deleteTag() {
      this.loading.deleteTag = true;
      eatApi
        .getFetcher()
        .delete(`/tags/${this.deletedTag.id}`)
        .then(() => {
          this.dialog = false;
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Etiqueta eliminada",
          });
          this.getTags();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Error al tratar de eliminar la etiqueta`,
          });
        })
        .finally(() => {
          this.resetDeleting();
        });
    },
  },
};
</script>

<style scoped></style>
