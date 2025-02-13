<template>
  <v-card flat>
    <v-data-table
      :headers="headers"
      :items="users"
      :search="search"
      :height="tableSize"
      :loading="loading.getUser"
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
            item-name="Usuarios"
            :page.sync="page"
            :length="pageCount"
            :total-items="totalItems"
            :loading="loading.getUser"
            :border="false"
          />
          <v-spacer />
          <v-text-field
            v-model="search"
            class="text-body-2"
            prepend-inner-icon="mdi-magnify"
            label="Buscar por usuario, nombre o apellido"
            dense
            solo
            flat
            outlined
            single-line
            hide-details
            @keydown.enter="getUsers"
          >
            <template v-slot:append v-if="search">
              <v-icon
                @click="
                  search = '';
                  getUsers();
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
            @click="getUsers"
            >filtrar</v-btn
          >
          <v-spacer />
          <v-btn
            small
            outlined
            color="primary"
            elevation="0"
            class="ml-2"
            @click="$router.push({ path: 'abm-users/edit-user/new' })"
          >
            Nuevo usuario
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.groups="{ item }">
        {{ item.groups.map((g) => rolNameTranslate(g.name)).join(" - ") }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          small
          color="primary"
          class="ml-2"
          @click="openEditUserDialog(item.id)"
        >
          <v-icon> mdi-account-edit-outline</v-icon>
        </v-btn>
        <v-btn
          v-if="isCurrentUserSme"
          icon
          small
          color="error"
          class="ml-2"
          @click="showDeleteUserDialog(item)"
        >
          <v-icon> mdi-delete-outline </v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <RouterView v-on:load-users="getUsers" />
    <!--    fin modal consulta eliminar usuario-->
    <v-dialog v-model="deletedUserDialog" persistent width="500">
      <v-card :disabled="loading.deleteUser">
        <v-card-title>¿Seguro desea eliminar este usuario?</v-card-title>
        <v-card-text>
          <div>Escriba el nombre de usuario para confirmar</div>
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
            :disabled="!isDeletedUserVerified"
            :loading="loading.deleteUser"
            @click="deleteUser"
            >eliminar usuario</v-btn
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
import { rolNameMixin } from "@/mixins/globals";

export default {
  name: "AbmUsers",
  mixins: [rolNameMixin],
  components: { TablePagination },
  data: () => ({
    headers: [
      {
        text: "Id",
        align: "start",
        sortable: false,
        value: "id",
      },
      { text: "Nombre", value: "first_name", sortable: false },
      { text: "Apellido", value: "last_name", sortable: false },
      { text: "Usuario", value: "username", sortable: false },
      { text: "Telefono", value: "phone", sortable: false },
      { text: "Email", value: "email", sortable: false },
      { text: "Roles", value: "groups", sortable: false },
      { text: "Acciones", value: "actions", sortable: false, align: "right" },
    ],
    users: [],
    loading: {
      getUser: false,
      deleteUser: false,
    },
    totalItems: 0,
    options: { itemsPerPage: 6 },
    pageCount: 0,
    page: 1,
    showEditUserDialog: false,
    search: "",
    deletedUserDialog: false,
    deletedUser: null,
    verifyField: "",
  }),

  created() {
    this.getUsers();
  },

  watch: {
    page() {
      this.getUsers();
    },
  },

  computed: {
    ...mapGetters("user", ["isCurrentUserSme"]),

    tableSize() {
      const height = window.innerHeight;
      return height - 64 - 8 - 52 - 48 - 30;
    },

    isDeletedUserVerified() {
      return this.deletedUser?.username === this.verifyField;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),

    openEditUserDialog(userID) {
      this.$router.push({ path: "abm-users/edit-user/" + userID });
    },

    resetDeleting() {
      this.loading.deleteUser = false;
      this.deletedUserDialog = false;
      this.deletedUser = null;
      this.verifyField = "";
    },

    getUsers() {
      this.loading.getUser = true;
      eatApi
        .getFetcher()
        .get("/auth/users/search", {
          params: {
            page: this.page,
            page_size: this.options.itemsPerPage,
            keyword: this.search,
            include_sme: true,
          },
        })
        .then(({ data }) => {
          const { totalItems, results } = data;
          this.users = results;
          this.totalItems = totalItems;
        })
        .catch(() => {})
        .finally(() => {
          this.loading.getUser = false;
        });
    },

    showDeleteUserDialog(user) {
      this.deletedUser = user;
      this.deletedUserDialog = true;
    },

    deleteUser() {
      this.loading.deleteUser = true;
      eatApi
        .getFetcher()
        .delete("/auth/users/" + this.deletedUser.id)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Usuario eliminado",
          });
          this.getUsers();
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Error al tratar de eliminar el usuario`,
          });
        })
        .finally(() => {
          this.resetDeleting();
        });
    },
  },
};
</script>
