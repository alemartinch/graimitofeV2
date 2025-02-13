<template>
  <div
    class="d-flex flex-column justify-space-between"
    style="height: 100%; width: 100%"
  >
    <!--  Array de Filtros -->
    <div class="filter-fields">
      <div
        class="text-subtitle-2 mb-5 d-flex justify-space-between align-center"
      >
        <span>FILTROS</span>
        <div style="width: 100px" />
        <v-text-field
          v-model="filterSearchInput"
          placeholder="buscar filtro"
          class="subtitle-2"
          style="width: 90px"
          append-icon="mdi-magnify mdi-18px"
          dense
        />
      </div>
      <div v-for="(filter, index) in data" :key="index" class="mb-6">
        <template v-if="filterSearchArray.includes(filter.name.toLowerCase())">
          <h5 class="text-body-2 text-no-wrap">
            {{ filter.name }}
          </h5>
          <template v-if="['number', 'text'].includes(filter.type)">
            <v-text-field
              v-model="textModel[filter.param]"
              :label="filter.label"
              :type="filter.type"
              dense
              outlined
              solo
              flat
              hide-details
            />
          </template>
          <template v-if="filter.type === 'select'">
            <v-select
              v-model="textModel[filter.param]"
              :items="filter.options"
              :label="filter.label"
              item-text="name"
              item-value="key"
              hide-details
              class="text-body-2"
              :disabled="
                filter.children &&
                filter.children.some((child) => textModel[child.param])
              "
              :multiple="filter.multiple"
              :clearable="filter.param !== 'ordering'"
              @click:clear="
                filter.children && filter.children.length
                  ? resetChildren(filter.children)
                  : ''
              "
              dense
              outlined
              solo
              flat
            ></v-select>
            <v-chip-group
              v-if="filter.param === 'ordering'"
              v-model="ordering"
              mandatory
            >
              <v-chip small filter value="">Ascendente</v-chip>
              <v-chip small filter value="-">Descendente</v-chip>
            </v-chip-group>
          </template>
          <template v-if="filter.type === 'async'">
            <AsyncCombobox
              v-model="textModel[filter.param]"
              v-bind="filter.attrs"
              :item-text="filter.itemText"
              :multiple="filter.multiple"
              :filter="filter.customFilter"
              class="text-body-2"
              :params="filter.params"
              :combobox="false"
              dense
              outlined
              solo
              flat
              hide-details
            >
              <template v-slot:item="{ item }">
                <span v-html="filter.slots.itemSlot(item)"></span>
              </template>
              <template v-slot:selection="{ item }">
                <span
                  class="my-1"
                  v-html="filter.slots.selectionSlot(item)"
                ></span>
              </template>
            </AsyncCombobox>
          </template>
          <div
            v-if="filter.type === 'date-range'"
            class="d-flex flex-column pl-2"
            style="border-left: 1px dashed #153240"
          >
            <v-select
              v-model="dateRange"
              :items="filter.options"
              :label="filter.label"
              item-text="name"
              item-value="range"
              :clearable="filter.param !== 'ordering'"
              @change="setRangeDate(filter.param)"
              hide-details
              dense
              outlined
              solo
              flat
            ></v-select>
            <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              min-width="auto"
              nudge-left="300"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  :value="dateRangeText"
                  class="px-2 text-body-2"
                  readonly
                  hide-details
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateRange"
                no-title
                scrollable
                range
                @change="setRangeDate(filter.param)"
              />
            </v-menu>
          </div>
          <template v-if="filter.children && filter.children.length">
            <div v-for="child in filter.children" :key="child.param">
              <v-checkbox
                v-if="child.type === 'checkbox'"
                v-model="textModel[child.param]"
                :label="child.label"
                dense
                hide-details
                @change="
                  setParentFilter(
                    filter.param,
                    child.parent_value_link,
                    child.param
                  )
                "
              />
            </div>
          </template>
          <template v-if="filter.type === 'checkbox'">
            <v-checkbox
              v-model="textModel[filter.param]"
              :label="filter.label"
              dense
              hide-details
            />
          </template>
          <v-divider v-if="filter.divider" class="my-4" />
        </template>
      </div>
    </div>

    <!-- Panel de acciones-->
    <div
      class="filter-action"
      style="border-top: 1px solid #cfd7df; width: 100%"
    >
      <v-btn
        color="primary"
        text
        @click="applyFilter"
        :disabled="filterNoChange && orderingNoChange"
        >aplicar</v-btn
      >
      <v-btn color="primary" small text @click="cleanFilter"
        ><v-icon small>mdi-filter-remove-outline</v-icon></v-btn
      >
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";

export default {
  name: "FiltersPanel",
  components: { AsyncCombobox },
  props: {
    data: {
      type: Array,
      required: true,
    },

    setFilter: {
      type: Object,
      default: () => {},
    },

    defaultFilter: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      ordering: "",
      textModel: {},
      dateRange: [],
      menu: "",
      lastAppliedFilter: null,
      lastOrdering: "",
      filterSearchInput: "",
      //isFilterDefault: null,
    };
  },

  created() {
    //this.cleanFilter();
    // this.applyFilter();
    // const appliedFilter = this.isDefaultFilters
    //   ? this.defaultFilter
    //   : this.setFilter;
    const appliedFilter =
      this.setFilter && Object.entries(this.setFilter).length
        ? this.setFilter
        : this.defaultFilter;
    this.textModel = JSON.parse(JSON.stringify(appliedFilter));
    for (const prop in this.textModel) {
      if (prop.includes("before")) {
        this.dateRange[0] = this.textModel[prop];
      }
      if (prop.includes("after")) {
        this.dateRange[1] = this.textModel[prop];
      }
    }
    this.adjustOrdering();
    this.lastAppliedFilter = JSON.parse(JSON.stringify(this.textModel));
  },

  computed: {
    ...mapGetters("user", ["getFacilitiesByUser", "isDefaultFilters"]),
    filterSearchArray() {
      const filtersNames = this.data.map((filter) => filter.name.toLowerCase());
      if (this.filterSearchInput) {
        return filtersNames.filter((fName) =>
          fName.includes(this.filterSearchInput.toLowerCase())
        );
      }
      return filtersNames;
    },

    filterNoChange() {
      const lastFilterKeys = Object.keys(this.lastAppliedFilter);
      const newFilterKeys = Object.keys(this.textModel);
      if (lastFilterKeys.length !== newFilterKeys.length) {
        return false;
      } else {
        for (let prop in this.lastAppliedFilter) {
          if (Array.isArray(this.lastAppliedFilter[prop])) {
            if (
              JSON.stringify(this.lastAppliedFilter[prop]) !==
              JSON.stringify(this.textModel[prop])
            )
              return false;
          } else if (this.lastAppliedFilter[prop] !== this.textModel[prop]) {
            return false;
          }
        }
      }

      return true;
    },

    orderingNoChange() {
      return this.ordering === this.lastOrdering;
    },

    dateRangeText() {
      if (!this.dateRange) {
        return "Selecciona el período";
      }
      const months = [
        "ene",
        "feb",
        "mar",
        "abr",
        "may",
        "jun",
        "jul",
        "ago",
        "sep",
        "oct",
        "nov",
        "dic",
      ];
      let firstDateText = "";
      let secondDateText = "";
      if (this.dateRange[0]) {
        const firstDate = new Date(this.dateRange[0] + " 00:00:00");
        firstDateText =
          firstDate.getDate() +
          " " +
          months[firstDate.getMonth()] +
          " " +
          firstDate.getUTCFullYear();
      }
      if (this.dateRange[1]) {
        const secondDate = new Date(this.dateRange[1] + " 00:00:00");
        secondDateText =
          secondDate.getDate() +
          " " +
          months[secondDate.getMonth()] +
          " " +
          secondDate.getUTCFullYear();
      }

      return firstDateText + " ~ " + secondDateText;
    },
  },

  methods: {
    ...mapMutations("user", ["SET_IS_DEFAULT_FILTER"]),
    setRangeDate(params) {
      const firstDateParam = params[0];
      const secondDateParam = params[1];

      if (!this.dateRange) {
        this.textModel[firstDateParam] = null;
        this.textModel[secondDateParam] = null;
      }

      // Si la primera fecha es mayor se acomodan de forma correcta
      if (this.dateRange[0] > this.dateRange[1]) {
        [this.dateRange[0], this.dateRange[1]] = [
          this.dateRange[1],
          this.dateRange[0],
        ];
      }

      this.textModel = {
        ...this.textModel,
        [firstDateParam]: this.dateRange[0],
        [secondDateParam]: this.dateRange[1] || this.dateRange[0],
      };
    },

    setParentFilter(parentParam, value, childParam) {
      if (this.textModel[childParam]) {
        this.textModel[parentParam] = [...value];
      } else {
        this.textModel[parentParam] = [];
      }
    },

    resetChildren(children) {
      //this.SET_IS_DEFAULT_FILTER(false);
      //this.isFilterDefault = true;
      children.forEach((child) => {
        this.textModel[child.param] = null;
      });
    },

    applyFilter() {
      //this.SET_IS_DEFAULT_FILTER(false);
      const filter = JSON.parse(JSON.stringify(this.textModel));
      this.lastAppliedFilter = JSON.parse(JSON.stringify(this.textModel));
      this.lastOrdering = this.ordering;
      if (filter.ordering) {
        filter.ordering = this.ordering + filter.ordering;
      }
      this.$emit("set-filters", filter);
    },

    cleanFilter() {
      //this.SET_IS_DEFAULT_FILTER(true);
      this.ordering = "";
      this.dateRange = null;
      for (let prop in this.textModel) {
        this.textModel[prop] = null;
      }
      this.textModel = { ...this.textModel, ...this.defaultFilter };
      this.adjustOrdering();
      //this.applyFilter();
    },

    adjustOrdering() {
      if (this.textModel.ordering?.at(0) === "-") {
        this.textModel.ordering = this.textModel.ordering.slice(1);
        this.ordering = "-";
        this.lastOrdering = "-";
      }
    },
  },
};
</script>
<style scoped>
.filter-fields {
  padding: 12px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.filter-action {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: 52px;
  padding-inline: 8px;
  border-top: 1px solid #cfd7df;
}
input[type="text"],
textarea {
  background-color: white;
}
.filter-search {
  border: 1px solid #333;
  border-radius: 5px;
  width: 100px;
  background: whitesmoke;
  font-size: 14px;
  font-weight: normal;
  color: #3a3a3a;
}
.filter-search:focus {
  outline-color: #449cc9;
}
.filter-search::placeholder {
  color: rgba(21, 50, 64, 0.6);
  font-weight: normal;
}
</style>
