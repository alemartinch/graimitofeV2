<template>
  <v-card flat>
    <v-data-table
      :headers="headers"
      :items="facilities"
      :search="search"
      :loading="loading.getFacilities"
      :server-items-length="totalItems"
      :page="page"
      :options="options"
      @page-count="pageCount = $event"
      :items-per-page="6"
      hide-default-footer
      fixed-header
    >
      <template v-slot:top>
        <v-toolbar flat>
          <TablePagination
            item-name="Establecimientos"
            :page.sync="page"
            :length="pageCount"
            :total-items="totalItems"
            :loading="loading.getFacilities"
            :border="false"
          />
          <v-spacer />
          <v-text-field
            v-model="search"
            class="text-body-2"
            prepend-inner-icon="mdi-magnify"
            label="Buscar nombre"
            dense
            solo
            flat
            outlined
            single-line
            hide-details
            @keydown.enter="getFacilities"
          >
            <template v-slot:append v-if="search">
              <v-icon
                @click="
                  search = '';
                  getFacilities();
                "
                >mdi-close</v-icon
              >
            </template>
          </v-text-field>
          <v-btn
            small
            class="ml-2"
            color="primary"
            text
            :disabled="!search"
            @click="getFacilities"
            >filtrar</v-btn
          >
          <v-spacer />
          <v-btn
            small
            outlined
            color="primary"
            elevation="0"
            class="ml-2"
            @click="$router.push({ path: 'abm-facilities/edit-facility/new' })"
          >
            Nuevo establecimiento
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          small
          color="primary"
          class="ml-2"
          @click="openEditFacilityDialog(item.id)"
        >
          <v-icon> mdi-home-edit-outline </v-icon>
        </v-btn>
        <v-btn
          v-if="isCurrentUserSme"
          icon
          small
          color="error"
          class="ml-2"
          @click="showDeleteFacilityDialog(item)"
        >
          <v-icon> mdi-delete-outline </v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <router-view v-on:load-facilities="getFacilities" />
    <v-dialog v-model="deletedFacilityDialog" persistent width="500">
      <v-card :disabled="loading.deleteUser">
        <v-card-title
          >¿Seguro desea eliminar este establecimiento?</v-card-title
        >
        <v-card-text>
          <div>Escriba el nombre del establecimiento para confirmar</div>
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
            :disabled="!isDeletedFacilityVerified"
            :loading="loading.deleteFacility"
            @click="deleteFacility"
            >eliminar establecimiento</v-btn
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
  name: "AbmFacilities",
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
        { text: "Localidad", value: "location" },
        // { text: "Direccion", value: "address" },
        // { text: "Telefono", value: "phone" },
        // { text: "Email", value: "email" },
        { text: "Acciones", value: "actions", sortable: false, align: "right" },
      ],
      facilities: [],
      totalItems: 0,
      options: { itemsPerPage: 6 },
      pageCount: 0,
      page: 1,
      search: "",
      loading: {
        getFacilities: false,
        deleteFacility: false,
      },
      deletedFacilityDialog: false,
      deletedFacility: null,
      verifyField: "",
    };
  },

  created() {
    this.getFacilities();
  },

  watch: {
    page() {
      this.getFacilities();
    },
  },

  computed: {
    ...mapGetters("user", ["isCurrentUserSme"]),

    isDeletedFacilityVerified() {
      return this.deletedFacility?.name === this.verifyField;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),

    openEditFacilityDialog(facilityID) {
      this.$router.push({ path: "abm-facilities/edit-facility/" + facilityID });
    },

    getFacilities() {
      this.loading.getFacilities = true;
      eatApi
        .getFetcher()
        .get("/facilities/search", {
          params: {
            page: this.page,
            page_size: this.options.itemsPerPage,
            keyword: this.search,
          },
        })
        .then(({ data }) => {
          const { totalItems, results } = data;
          this.facilities = results;
          this.totalItems = totalItems;
        })
        .finally(() => {
          this.loading.getFacilities = false;
        });
    },

    showDeleteFacilityDialog(facility) {
      this.deletedFacility = facility;
      this.deletedFacilityDialog = true;
    },

    resetDeleting() {
      this.deletedFacilityDialog = false;
      this.deletedFacility = null;
      this.verifyField = "";
    },

    deleteFacility() {
      this.loading.deleteFacility = true;
      eatApi
        .getFetcher()
        .delete(`facilities/${this.deletedFacility.id}`)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Establecimiento eliminado",
          });
          this.getFacilities();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Error al tratar de eliminar el establecimiento`,
          });
        })
        .finally(() => {
          this.resetDeleting();
        });
    },
  },
};
</script>
