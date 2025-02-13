<template>
  <div class="d-flex" style="height: calc(100vh - 120px); overflow: auto">
    <div style="width: 155px; border-right: 2px solid #d5e9f3">
      <v-chip-group
        v-model="selection"
        mandatory
        column
        active-class="primary--text"
      >
        <v-chip
          v-for="nav in navs"
          :key="nav.name"
          :value="nav.name"
          :to="nav.path"
          label
          style="width: 140px; background-color: white"
        >
          {{ nav.name }}
        </v-chip>
      </v-chip-group>
    </div>
    <div
      class="flex-grow-1 pa-2"
      style="height: calc(100vh - 120px); overflow: auto"
    >
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "AdministrationPanel",
  components: {},
  data() {
    return {
      selection: null,
      navs: [
        {
          name: "Usuarios",
          path: "abm-users",
        },
        {
          name: "Establecimientos",
          path: "abm-facilities",
        },
        // {
        //   name: "Grupos Estab...",
        //   path: "abm-groups",
        // },
        {
          name: "Sectores",
          path: "abm-sectors",
        },
        {
          name: "Tipo de Sectores",
          path: "abm-sectors-type",
        },
        {
          name: "Etiquetas",
          path: "abm-tags",
        },
        {
          name: "Versiones Apis",
          path: "apis-version",
        },
        {
          name: "ApiKey",
          path: "api-key",
        },
      ],
    };
  },
  computed: {
    ...mapState("facilities", ["users"]),
  },
};
</script>
