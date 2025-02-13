<template>
  <v-card flat>
    <v-data-table
      :headers="headers"
      :items="sectors"
      :search="search"
      :loading="loading.getSectors"
      :server-items-length="totalItems"
      :sectors="page"
      showDeleteSectorDialog
      @page-count="pageCount = $event"
      :items-per-page="6"
      hide-default-footer
      fixed-header
    >
      <template v-slot:top>
        <v-toolbar flat>
          <TablePagination
            item-name="Sectores"
            :page.sync="page"
            :length="pageCount"
            :total-items="totalItems"
            :loading="loading.getSectors"
            :border="false"
          />
          <v-spacer />
          <v-btn
            small
            outlined
            color="primary"
            elevation="0"
            class="ml-2"
            @click="$router.push({ path: 'abm-sectors/edit-sector/new' })"
          >
            Nuevo sector
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
          @click="showDeleteSectorDialog(item)"
        >
          <v-icon> mdi-delete-outline </v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <router-view v-on:load-sectors="getSectors" />
    <v-dialog v-model="deletedSectorDialog" persistent width="500">
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
            :disabled="!isDeletedSectorVerify"
            :loading="loading.deleteSector"
            @click="deleteSector"
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
  name: "AbmSectors",
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
        { text: "Tipo", value: "sector_type.name" },
        { text: "Establecimiento", value: "facility.name" },
        { text: "Acciones", value: "actions", sortable: false, align: "right" },
      ],
      sectors: [],
      totalItems: 0,
      options: { itemsPerPage: 6 },
      pageCount: 0,
      page: 1,
      search: "",
      loading: {
        getSectors: false,
        deleteSector: false,
      },
      deletedSectorDialog: false,
      deletedSector: null,
      verifyField: "",
    };
  },

  created() {
    this.getSectors();
  },

  watch: {
    page() {
      this.getSectors();
    },
  },

  computed: {
    ...mapGetters("user", ["isCurrentUserSme"]),

    isDeletedSectorVerify() {
      return this.deletedSector?.name === this.verifyField;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),

    openEditSectorDialog(sectorID) {
      this.$router.push({ path: "abm-sectors/edit-sector/" + sectorID });
    },

    getSectors() {
      this.loading.getSectors = true;
      eatApi
        .getFetcher()
        .get("/sectors/", {
          params: {
            page: this.page,
            page_size: this.options.itemsPerPage,
          },
        })
        .then(({ data }) => {
          const { totalItems, results } = data;
          this.sectors = results;
          this.totalItems = totalItems;
        })
        .finally(() => {
          this.loading.getSectors = false;
        });
    },

    showDeleteSectorDialog(sector) {
      this.deletedSector = sector;
      this.deletedSectorDialog = true;
    },

    resetDeleting() {
      this.deletedSectorDialog = false;
      this.deletedSector = null;
      this.verifyField = "";
    },

    deleteSector() {
      this.loading.deleteSector = true;
      eatApi
        .getFetcher()
        .delete(`sectors/${this.deletedSector.id}`)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Sector eliminado",
          });
          this.getSectors();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Error al tratar de eliminar el sector`,
          });
        })
        .finally(() => {
          this.resetDeleting();
          this.loading.deleteSector = false;
        });
    },
  },
};
</script>
