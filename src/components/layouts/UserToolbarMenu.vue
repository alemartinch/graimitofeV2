<template>
  <v-menu offset-y nudge-bottom="9">
    <template v-slot:activator="{ on }">
      <UserAvatar
        size="35"
        logged-user-photo
        v-on="on"
        class="ml-5"
        style="cursor: pointer"
      />
    </template>
    <v-card class="pa-3">
      <v-icon class="mb-1 me-2" size="30px" color="primary"
        >mdi-account-key</v-icon
      >
      <span class="button"
        >{{ user.user | fullName }} - {{ user.user.username }}</span
      >
      <v-divider class="my-2" />
      <template class="mt-4">
        <v-chip
          v-for="(rol, index) in user.user.groups"
          :key="index"
          small
          outlined
          label
          class="mr-2"
          color="accent"
        >
          {{ rolNameTranslate(rol.name) }}
        </v-chip>
      </template>
      <div class="mt-2">
        <template
          v-if="getFacilitiesByUser.length && getFacilitiesByUser.length < 4"
        >
          <v-chip
            v-for="(facility, index) in getFacilitiesByUser"
            :key="index"
            small
            outlined
            label
            class="mr-2 mt-1"
            color="primary"
          >
            {{ facility.name }}
          </v-chip>
        </template>
      </div>
      <v-divider class="mt-3" />
      <v-list-item
        dense
        class="mt-3"
        :to="{ path: '/usersettings/user-profile' }"
      >
        <v-list-item-icon>
          <v-icon>mdi-account</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Configuración</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item dense @click="$emit('logout')">
        <v-list-item-icon>
          <v-icon>mdi-logout</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Salir</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </v-menu>
</template>
<script>
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import { mapGetters, mapState } from "vuex";
import { rolNameMixin } from "@/mixins/globals";

export default {
  name: "UserToolbarMenu",
  components: { UserAvatar },
  mixins: [rolNameMixin],

  data() {
    return {
      showLoadImage: false,
      showOverlay: false,
    };
  },
  computed: {
    ...mapState(["user"]),
    ...mapState(["user"]),
    ...mapGetters("user", [
      "getRolesList",
      "currentUser",
      "getFacilitiesByUser",
    ]),

    userInitials() {
      return this.user.user.first_name[0] + this.user.user.last_name[0];
    },
    avatarSize() {
      if (this.$vuetify.breakpoint.mdAndDown) {
        return "60";
      }
      return "76";
    },
  },
};
</script>
