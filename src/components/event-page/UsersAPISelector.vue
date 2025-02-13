<template>
  <v-autocomplete
    v-bind="$attrs"
    v-on="$listeners"
    item-text="full_name"
    item-value="id"
    :items="items"
    :append-icon="loading ? 'mdi-loading mdi-spin' : '$dropdown'"
    solo
    flat
    outlined
    dense
    return-object
  >
    <template v-slot:item="{ item }">
      <div class="d-flex my-2" @click="search = ''">
        <UserAvatar :user-object="item" size="36" />
        <div class="d-flex flex-column ml-2">
          <span class="caption"
            ><span class="green--text">{{
              `${item.first_name} ${item.last_name}`
            }}</span>
            -
            <span class="">{{ `${item.username}` }}</span></span
          >
          <span class="caption text--secondary">
            {{
              item.groups.map((g) => rolNameTranslate(g.name)).join(" • ")
            }}</span
          >
        </div>
      </div>
    </template>
    <template v-slot:selection="data">
      <v-chip
        class="py-3"
        v-bind="data.attrs"
        :input-value="data.selected"
        small
        close
        @click:close="
          data.parent.selectItem(
            $attrs.hasOwnProperty('multiple') ? data.item : ''
          )
        "
      >
        <UserAvatar :user-object="data.item" left size="24" />
        {{ data.item | fullName }}
      </v-chip>
    </template>
  </v-autocomplete>
</template>

<script>
import { eatApi } from "@/apis";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import { mapGetters } from "vuex";
import { ROLES } from "@/mixins/globals";
import { rolNameMixin } from "@/mixins/globals";
//import qs from "qs";

export default {
  name: "UsersAPISelector",
  components: { UserAvatar },
  mixins: [rolNameMixin],
  props: {
    onlyGroups: {
      type: Array,
      validator: (value) => {
        const groups = Object.values(ROLES);
        return value.every((item) => groups.includes(item));
      },
      default: () => [],
    },
    preload: {
      type: Array,
      default: () => [],
    },
    parentFrom: String,
  },

  data() {
    return {
      searchParam: "keyword",
      url: "/auth/users/search",
      entries: [],
      //      search: null,
      timeout: null,
      loading: false,
    };
  },

  created() {
    this.loading = true;
    let params = {
      page: 1,
      page_size: 50,
    };
    // if (this.preload.length) {
    //   params = {
    //     id: [...this.preload.map((u) => u.id)],
    //   };
    // }
    eatApi
      .getFetcher()
      .get(this.url, {
        params,
        // paramsSerializer: (params) => {
        //   return qs.stringify(params, { arrayFormat: "repeat" });
        // },
      })
      .then(({ data }) => {
        this.entries = data.results;
      })
      .catch(() => {
        console.error("Error al cargar los usuario");
      })
      .finally(() => {
        this.loading = false;
      });
  },

  //  watch: {
  //    search(val) {
  //      // Items have already been requested
  //      if (this.loading) return;
  //
  //      const fetchData = () => {
  //        this.loading = true;
  //        eatApi
  //          .getFetcher()
  //          .get(this.url, {
  //            params: {
  //              [this.searchParam]: val,
  //              ...this.filters,
  //            },
  //            paramsSerializer: (params) => {
  //              return qs.stringify(params, { arrayFormat: "repeat" });
  //            },
  //          })
  //          .then(({ data }) => {
  //            this.entries = data.results;
  //          })
  //          .catch((error) => {
  //            console.error(error);
  //          })
  //          .finally(() => {
  //            this.loading = false;
  //          });
  //      };
  //
  //      clearTimeout(this.timeout);
  //      this.timeout = setTimeout(fetchData, 500);
  //    },
  //  },

  computed: {
    ...mapGetters("user", ["getRolesList"]),
    ...mapGetters("har", ["getCurrentTask"]),
    ...mapGetters("event", ["getCurrentEvent"]),
    //devueve los usuarios segun el establecmiento asignado
    items() {
      const filteredUsers = [];
      const users = [];
      // const idFacilitySelected = this.getCurrentEvent.facility.id;
      const idFacilitySelected = this.getCurrentTask?.facility?.id;
      this.entries.filter((user) => {
        if (user.groups.some((group) => group.name.includes(this.onlyGroups))) {
          filteredUsers.push(user);
        }
      });
      filteredUsers.forEach((user) => {
        if (
          user.access_facilities.some(
            (item) => item.id === idFacilitySelected
          ) ||
          user.access_facilities.length === 0
        ) {
          return users.push(user);
        }
        return users;
      });
      return users.map((user) => {
        return { ...user, full_name: user.first_name + " " + user.last_name };
      });
    },
    filters() {
      const filters = {};
      filters.groups__name = [...this.onlyGroups];
      return filters;
    },
  },
};
</script>
<style scoped></style>
