<template>
  <v-card flat>
    <v-data-table
      :headers="headers"
      :items="sectorsType"
      :search="search"
      :loading="loading.getSectorsType"
      :server-items-length="totalItems"
      :sectors="page"
      showDeleteSectorTypeDialog
      @page-count="pageCount = $event"
      :items-per-page="6"
      hide-default-footer
      fixed-header
    >
      <template v-slot:top>
        <v-toolbar flat>
          <TablePagination
            item-name="Tipo de sectores"
            :page.sync="page"
            :length="pageCount"
            :total-items="totalItems"
            :loading="loading.getSectorsType"
            :border="false"
          />
          <v-spacer />
          <v-btn
            small
            outlined
            color="primary"
            elevation="0"
            class="ml-2"
            @click="
              $router.push({ path: 'abm-sectors-type/edit-sector-type/new' })
            "
          >
            Nuevo tipo sector
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          small
          color="primary"
          class="ml-2"
          @click="openEditSectorDialog(item.id)"
        >
          <v-icon> mdi-view-dashboard-edit-outline </v-icon>
        </v-btn>
        <v-btn
          v-if="isCurrentUserSme"
          icon
          small
          color="error"
          class="ml-2"
          @click="showDeleteSectorTypeDialog(item)"
        >
          <v-icon> mdi-delete-outline </v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <router-view v-on:load-sectors-type="getSectorsType" />
    <v-dialog v-model="deletedSectorTypeDialog" persistent width="500">
      <v-card :disabled="loading.deleteUser">
        <v-card-title>¿Seguro desea eliminar este sector?</v-card-title>
        <v-card-text>
          <div>Escriba el nombre del sector para confirmar</div>
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
            :disabled="!isDeletedSectorTypeVerify"
            :loading="loading.deleteSectorType"
            @click="deleteSectorType"
            >eliminar sector</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { eatApi } from "@/apis";
import { mapGetters, mapMutations } from "vuex";
import TablePagination from "@/components/reusable/TablePagination.vue";
export default {
  name: "AbmSectorsType",
  components: {
    TablePagination,
    // editFacility,
  },
  data() {
    return {
      headers: [
        {
          text: "Id",
          align: "start",
          sortable: false,
          value: "id",
        },
        { text: "Nombre", value: "name" },
        { text: "Descripción", value: "description" },
        { text: "Acciones", value: "actions", sortable: false, align: "right" },
      ],
      sectorsType: [],
      totalItems: 0,
      options: { itemsPerPage: 6 },
      pageCount: 0,
      page: 1,
      search: "",
      loading: {
        getSectorsType: false,
        deleteSectorType: false,
      },
      deletedSectorTypeDialog: false,
      deletedSectorType: null,
      verifyField: "",
    };
  },

  created() {
    this.getSectorsType();
  },

  watch: {
    page() {
      this.getSectorsType();
    },
  },

  computed: {
    ...mapGetters("user", ["isCurrentUserSme"]),

    isDeletedSectorTypeVerify() {
      return this.deletedSectorType?.name === this.verifyField;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),

    openEditSectorDialog(sectorID) {
      this.$router.push({
        path: "abm-sectors-type/edit-sector-type/" + sectorID,
      });
    },

    getSectorsType() {
      this.loading.getSectorsType = true;
      eatApi
        .getFetcher()
        .get("/sectors/types/", {
          params: {
            page: this.page,
            page_size: this.options.itemsPerPage,
          },
        })
        .then(({ data }) => {
          const { totalItems, results } = data;
          this.sectorsType = results;
          this.totalItems = totalItems;
        })
        .finally(() => {
          this.loading.getSectorsType = false;
        });
    },

    showDeleteSectorTypeDialog(sector) {
      this.deletedSectorType = sector;
      this.deletedSectorTypeDialog = true;
    },

    resetDeleting() {
      this.deletedSectorTypeDialog = false;
      this.deletedSectorType = null;
      this.verifyField = "";
    },

    deleteSectorType() {
      this.loading.deleteSector = true;
      eatApi
        .getFetcher()
        .delete(`/sectors/types/${this.deletedSectorType.id}`)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Sector eliminado",
          });
          this.getSectorsType();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Error al tratar de eliminar el sector`,
          });
        })
        .finally(() => {
          this.resetDeleting();
        });
    },
  },
};
</script>
