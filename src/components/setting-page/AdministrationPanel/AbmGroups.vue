<template>
  <v-card flat>
    <v-data-table
      :headers="headers"
      :items="sectors"
      :search="search"
      :loading="loading.getGroups"
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
            item-name="Grupos Establecimientos"
            :page.sync="page"
            :length="pageCount"
            :total-items="totalItems"
            :loading="loading.getGroups"
            :border="false"
          />
          <v-spacer />
          <v-btn
            small
            outlined
            color="primary"
            elevation="0"
            class="ml-2"
            @click="$router.push({ path: 'abm-groups/edit-group/new' })"
          >
            Nuevo grupo
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          small
          color="primary"
          class="ml-2"
          @click="openEditGroupDialog(item.id)"
        >
          <v-icon> mdi-view-dashboard-edit-outline </v-icon>
        </v-btn>
        <v-btn
          v-if="isCurrentUserSme"
          icon
          small
          color="error"
          class="ml-2"
          @click="showDeleteGroupDialog(item)"
        >
          <v-icon> mdi-delete-outline </v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <router-view v-on:load-groups="getGroups" />
    <v-dialog v-model="deletedSGroupDialog" persistent width="500">
      <v-card :disabled="loading.deleteUser">
        <v-card-title>¿Seguro desea eliminar este grupo?</v-card-title>
        <v-card-text>
          <div>Escriba el nombre del grupo para confirmar</div>
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
            :disabled="!isDeletedGroupVerify"
            :loading="loading.deleteGroup"
            @click="deleteGroup"
            >eliminar grupo</v-btn
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
  name: "AbmGroups",
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
        { text: "Acciones", value: "actions", sortable: false, align: "right" },
      ],
      sectors: [],
      totalItems: 0,
      options: { itemsPerPage: 6 },
      pageCount: 0,
      page: 1,
      search: "",
      loading: {
        getGroups: false,
        deleteGroup: false,
      },
      deletedGroupDialog: false,
      deletedGroup: null,
      verifyField: "",
    };
  },

  created() {
    this.getGroups();
  },

  watch: {
    page() {
      this.getGroups();
    },
  },

  computed: {
    ...mapGetters("user", ["isCurrentUserSme"]),

    isDeletedGroupVerify() {
      return this.deletedGroup?.name === this.verifyField;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),

    openEditGroupDialog(groupID) {
      this.$router.push({ path: "abm-groups/edit-group/" + groupID });
    },

    getGroups() {
      this.loading.getGroups = true;
      eatApi
        .getFetcher()
        .get("/facilities/groups/", {
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
          this.loading.getGroups = false;
        });
    },

    showDeleteGroupDialog(group) {
      this.deletedGroup = group;
      this.deletedGroupDialog = true;
    },

    resetDeleting() {
      this.deletedGroupDialog = false;
      this.deletedGroup = null;
      this.verifyField = "";
    },

    deleteGroup() {
      this.loading.deleteGroup = true;
      eatApi
        .getFetcher()
        .delete(`/facilities/groups/${this.deletedGroup.id}`)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Sector eliminado",
          });
          this.getGroups();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Error al tratar de eliminar el grupo`,
          });
          this.getGroups();
        })
        .finally(() => {
          this.getGroups();
          this.resetDeleting();
        });
    },
  },
};
</script>
