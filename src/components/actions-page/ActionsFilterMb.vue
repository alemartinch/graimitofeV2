<template>
  <v-expansion-panels flat style="border: 1px #44cc7b solid">
    <v-expansion-panel>
      <v-expansion-panel-header disable-icon-rotate class="px-4">
        <template v-slot:default="{ open }">
          <v-row v-if="!open && !filterOn && !parentLoading" class="ma-0">
            <v-chip label small class="ml-2 mt-1">Todas las acciones</v-chip>
          </v-row>
          <div v-if="!open && filterOn" class="d-flex flex-column">
            <v-row class="ma-0">
              <v-chip label small class="ml-2 mt-1">
                <v-icon left> mdi-account </v-icon>
                <span v-if="!owner">Todos los usuarios</span>
                <span v-else-if="owner.id === parseInt(user.user.id, 10)"
                  >Mis acciones</span
                >
                <span v-else>{{ owner | fullName }}</span>
              </v-chip>
            </v-row>
            <v-row v-if="status.length" class="ma-0">
              <v-chip
                label
                small
                v-for="(status, i) in status"
                :key="i"
                class="ml-2 mt-1"
                >{{ getStatusColor(status).name }}
              </v-chip>
            </v-row>
          </div>
        </template>
        <template v-slot:actions>
          <v-btn
            text
            icon
            :disabled="!filterOn"
            @click.stop="cleanFilter"
            :loading="parentLoading"
          >
            <v-icon :color="filterOn ? 'primary' : ''">
              {{ filterOn ? "mdi-filter-remove" : "mdi-filter-outline" }}
            </v-icon>
          </v-btn>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <AsyncCombobox
          v-model="owner"
          :items="users"
          :api="eatApi().getFetcher()"
          url="/auth/users/search"
          search-param="keyword"
          :params="facilityParams"
          :placeholder="loading ? 'Cargando usuarios...' : 'Responsable'"
          item-text="first_name"
          item-value="id"
          return-object
          solo
          flat
          outlined
          dense
          clearable
          prepend-inner-icon="mdi-account"
          hide-selected
          hide-details
          @change="filterOwner"
          :loading="loading"
        >
          <template v-slot:item="{ item }">
            <span>{{ item.first_name }} {{ item.last_name }}</span>
          </template>
          <template v-slot:selection="data">
            <v-chip
              class="py-3"
              v-bind="data.attrs"
              :input-value="data.selected"
              small
            >
              {{ data.item | fullName }}
            </v-chip>
          </template>
        </AsyncCombobox>
        <v-chip-group
          v-model="status"
          class="mt-5"
          active-class="white--text text--accent-4 primary"
          multiple
          @change="filterStatus"
        >
          <v-chip
            v-for="item in statuses"
            :key="item.name"
            :value="item.key"
            label
            small
          >
            {{ item.abb }}
          </v-chip>
        </v-chip-group>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import filterLogic from "./filterLogic";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { eatApi } from "@/apis";
import { mapGetters } from "vuex";

export default {
  name: "ActionsFilterMb",
  components: { AsyncCombobox },
  mixins: [filterLogic],
  methods: {
    eatApi() {
      return eatApi;
    },
  },
  computed: {
    ...mapGetters("user", ["getFacilitiesByUser"]),
    facilityParams() {
      const id = [];
      this.getFacilitiesByUser?.forEach((item) => id.push(item.id));
      return {
        access_facilities__id: id,
      };
    },
  },
};
</script>

<style scoped></style>
