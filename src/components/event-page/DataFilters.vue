<template>
  <v-card
    :disabled="loading"
    flat
    class="ma-0 pa-5"
    :class="dialog ? 'pa-5' : 'pa-0 d-flex'"
  >
    <!--    <v-card-title v-if="dialog" class="ma-0 pa-0 pb-5">Filtros:</v-card-title>-->
    <v-row class="align-center">
      <v-menu
        v-for="filter in data.filter(
          (f) => f.type !== 'text' && f.type !== 'date'
        )"
        :key="filter.param"
        :close-on-content-click="false"
        offset-y
        nudge-bottom="5"
        max-height="300px"
      >
        <template v-slot:activator="{ on: onMenu }">
          <v-tooltip bottom :disabled="!addedFilter[filter.param].length">
            <template v-slot:activator="{ on: onTooltip }">
              <v-chip
                small
                outlined
                class="my-2"
                :class="
                  !!addedFilter[filter.param].length
                    ? 'active_chip mr-3'
                    : 'mr-3'
                "
                v-on="{ ...onMenu, ...onTooltip }"
                :disabled="!filter.options.length"
              >
                <span class="pr-2">{{ `${filter.name}:` }}</span>
                <span
                  class="font-weight-bold"
                  v-if="addedFilter[filter.param].length"
                  >{{
                    addedFilter[filter.param].length >= 2
                      ? addedFilter[filter.param]
                          .map((i) => i.name)
                          .join(", ")
                          .substring(0, 15) + "..."
                      : addedFilter[filter.param][0].name
                  }}
                </span>
                <span class="font-weight-bold" v-else>Todos</span>
                <!--            <v-icon v-if="loading" right> mdi-loading mdi-spin </v-icon>-->
              </v-chip>
            </template>
            <span>{{
              addedFilter[filter.param].length
                ? addedFilter[filter.param].map((i) => i.name).join(", ")
                : "Todos"
            }}</span>
          </v-tooltip>
        </template>
        <v-card :disabled="loading">
          <v-list dense flat>
            <v-list-item-group
              v-model="listModel[filter.param]"
              :multiple="filter.multiple"
              color="primary"
            >
              <v-list-item
                v-for="(item, i) in filter.options"
                :key="filter.param + i"
                :value="item.key"
                @click="applyFilter(filter, item)"
              >
                <v-list-item-avatar size="30" v-if="filter.type === 'user'">
                  <img
                    width="100%"
                    :src="
                      user.photo ? user.photo : require('@/assets/user.svg')
                    "
                    alt="user image"
                  />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title v-if="filter.type === 'user'">
                    {{ item | fullName }}
                  </v-list-item-title>
                  <v-list-item-title v-else>
                    {{ item.name }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-menu>
      <div
        class="d-flex align-center mr-3"
        v-for="filter in data.filter((f) => f.type === 'text')"
        :key="filter.param"
      >
        <v-text-field
          v-model="textModel[filter.param]"
          :placeholder="filter.name"
          persistent-placeholder
          class="text-body-2"
          dense
          solo
          outlined
          flat
          hide-details
          append-icon="mdi-magnify"
          @click:append="applyTextFilter(filter.param)"
          @keydown.enter="applyTextFilter(filter.param)"
        />
      </div>
      <v-col
        cols="4"
        class="pa-0 d-flex"
        v-if="data.some((f) => f.type === 'date')"
      >
        <v-menu
          v-for="filter in data.filter((f) => f.type === 'date')"
          :key="filter.param"
          v-model="menuDateModel[filter.param]"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              :value="dateModel[filter.param]"
              class="mr-5"
              :label="filter.name"
              prepend-inner-icon="mdi-calendar"
              readonly
              v-bind="attrs"
              v-on="on"
            >
              <template v-slot:append-outer>
                <v-icon @click.prevent="cleanDateFilter(filter.param)"
                  >mdi-close</v-icon
                >
              </template>
            </v-text-field>
          </template>
          <v-date-picker
            v-model="dateModel[filter.param]"
            @input="applyDateFilter(filter.param)"
          ></v-date-picker>
        </v-menu>
      </v-col>
      <t-btn-icon
        v-if="!dialog"
        class="align-self-center ml-3"
        :disabled="!filterOn"
        @click="cleanFilter"
      >
        mdi-filter-remove-outline
      </t-btn-icon>
    </v-row>
    <v-card-actions v-if="dialog" class="pa-0 d-flex flex-row-reverse"
      ><v-btn @click="cleanFilter" text color="primary" :disabled="!filterOn"
        >limpiar</v-btn
      ></v-card-actions
    >
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "DataFilters",
  components: { TBtnIcon },
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      menuDateModel: {},
      dateModel: {},
      showFilters: false,
      addedFilter: {},
      filterCount: 0,
      listModel: {},
      textModel: {},
    };
  },

  created() {
    this.data.forEach((filter) => {
      this.addedFilter[filter.param] = [];
    });
  },

  computed: {
    ...mapState(["user", "event"]),

    filterOn() {
      let textFilterChain = "";
      let dateFilterChain = "";
      for (let value in this.textModel) {
        textFilterChain += this.textModel[value];
      }
      for (let value in this.dateModel) {
        dateFilterChain += this.dateModel[value];
      }
      return !!this.filterCount || !!textFilterChain || !!dateFilterChain;
    },

    // dateText: {
    //   get() {
    //     let date = this.event.temp_event.occurrence_date;
    //     if (!date) return null;
    //     const [year, month, day] = date.split("-");
    //     return `${day}-${month}-${year}`;
    //   },
    //   set(date) {
    //     this.set_occurrenceDate(date);
    //   },
  },

  methods: {
    customFilter(item, queryText) {
      const fName = item.first_name.toLowerCase();
      const lName = item.last_name.toLowerCase();
      const searchText = queryText.toLowerCase();

      return fName.indexOf(searchText) > -1 || lName.indexOf(searchText) > -1;
    },

    applyFilter(filter, item) {
      let itemIndex = this.itemExist(filter, item);
      if (itemIndex === -1) {
        this.addedFilter[filter.param].push({
          key: filter.type === "user" ? item.id : item.key,
          name: filter.type === "user" ? item.first_name : item.name,
        });
        this.filterCount++;
      } else {
        this.addedFilter[filter.param].splice(itemIndex, 1);
        this.filterCount--;
      }
      this.emitFilter();
    },

    applyTextFilter(param) {
      this.addedFilter[param].pop();
      this.addedFilter[param].push({ key: this.textModel[param] });
      this.emitFilter();
    },

    applyDateFilter(param) {
      this.menuDateModel[param] = false;
      this.addedFilter[param].pop();
      this.addedFilter[param].push({ key: this.dateModel[param] });
      this.emitFilter();
    },

    itemExist(filter, item) {
      return this.addedFilter[filter.param].findIndex((u) => {
        return u.key === (filter.type === "user" ? item.id : item.key);
      });
    },

    cleanDateFilter(param) {
      this.dateModel[param] = "";
      this.addedFilter[param].pop();
      this.emitFilter();
    },

    cleanFilter() {
      for (let value in this.addedFilter) {
        this.addedFilter[value] = [];
      }
      for (let value in this.listModel) {
        this.listModel[value] = [];
      }
      for (let value in this.textModel) {
        this.textModel[value] = "";
      }
      for (let value in this.dateModel) {
        this.dateModel[value] = "";
      }
      this.filterCount = 0;
      this.emitFilter();
    },

    emitFilter() {
      // this.addedFilter.status = this.baseArray
      let filterParams = {};
      for (let value in this.addedFilter) {
        filterParams[value] = this.addedFilter[value].map((i) => i.key);
      }
      this.$emit("filter", filterParams, this.filterOn);
    },
  },
};
</script>

<style scoped>
.active_chip {
  border: 1px solid #449cc9;
  background-color: #44cc7b;
}

input {
  display: block;
  width: 100px;
  padding: 3px 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  border-radius: 6px;
  -webkit-appearance: none;
  color: #3a3a3a;
  border: 1px solid #cdd9ed;
}
input::placeholder {
  color: #3a3a3a54;
}
input:focus {
  outline: none;
  border: 2px solid #449cc9;
}
</style>
