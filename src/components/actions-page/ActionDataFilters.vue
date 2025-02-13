<template>
  <v-card :disabled="loading || parentLoading" flat class="pa-0 ma-0">
    <v-row class="align-center">
      <v-menu :close-on-content-click="false" offset-y max-height="300px">
        <template v-slot:activator="{ on }">
          <v-chip
            small
            outlined
            v-on="on"
            :class="!!owner ? 'active_chip' : ''"
          >
            <span class="pr-2">Responsable:</span>
            <span v-if="!loading" class="font-weight-bold">{{ userName }}</span>
            <v-icon v-if="loading" right> mdi-loading mdi-spin </v-icon>
          </v-chip>
        </template>
        <v-card :disabled="parentLoading">
          <v-list dense>
            <v-list-item-group v-model="owner" @change="filterOwner">
              <v-list-item
                v-for="user in users"
                :key="user.id"
                active-class="primary"
                :value="user"
              >
                <v-list-item-avatar size="30">
                  <img
                    width="100%"
                    :src="
                      user.photo ? user.photo : require('@/assets/user.svg')
                    "
                    alt="user image"
                  />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ user | fullName }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-menu>
      <v-menu :close-on-content-click="false" offset-y max-height="300px">
        <template v-slot:activator="{ on }">
          <v-chip
            small
            outlined
            :class="!!status.length ? 'active_chip' : ''"
            v-on="on"
            class="ml-3"
          >
            <span class="pr-2">Estado:</span>
            <template v-if="!loading">
              <span v-if="!status.length" class="font-weight-bold">Todos</span>
              <span class="font-weight-bold">{{ statusName }}</span>
            </template>
            <v-icon v-if="loading" right> mdi-loading mdi-spin </v-icon>
          </v-chip>
        </template>
        <v-card :disabled="parentLoading">
          <v-list dense>
            <v-list-item-group v-model="status" @change="filterStatus" multiple>
              <v-list-item
                v-for="status in statuses"
                :key="status.key"
                active-class="primary"
                :value="status.key"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    {{ status.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-menu>
      <v-btn
        small
        color="primary"
        class="align-self-center ml-3"
        text
        :disabled="!filterOn"
        @click="cleanFilter"
      >
        borrar filtros
      </v-btn>
      <v-spacer />
    </v-row>
  </v-card>
</template>

<script>
import filterLogic from "@/components/actions-page/filterLogic";

export default {
  name: "ActionDataFilters",
  mixins: [filterLogic],
};
</script>

<style scoped>
.active_chip {
  border: 2px solid #449cc9;
  background-color: #44cc7b;
}
</style>
