<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-form v-model="isValidStep" ref="form">
      <!--AREAS DE GESTION-->
      <v-row v-if="event.availableFields.process_areas" class="ma-0">
        <v-col cols="12 " md="6" class="py-0">
          <div class="body-2 my-2">
            Area de gestión<span
              v-if="event.temp_event.event_origin === 'OBSV'"
              style="color: red"
              >*</span
            >
          </div>
          <v-select
            v-model="processArea"
            :items="event.process_areas"
            item-text="name"
            item-value="name"
            :placeholder="
              !event.availableFields.process_areas ? 'No aplica' : ''
            "
            solo
            flat
            outlined
            dense
            prepend-inner-icon="mdi-chart-bubble"
            autofocus
            return-object
            :disabled="!event.availableFields.process_areas"
            :rules="paRules"
            @change="update_event"
          />
        </v-col>
      </v-row>

      <!--CATEGORÍA-->
      <v-row v-if="event.availableFields.classification" class="ma-0">
        <v-col cols="12 " md="6" class="py-0">
          <div class="body-2 my-2">Categoría</div>
          <v-select
            v-model="category"
            :items="categories"
            item-text="name"
            item-value="key"
            solo
            flat
            outlined
            dense
            prepend-inner-icon="mdi-label-multiple-outline"
            :rules="paRules"
            @change="update_event"
          />
        </v-col>
      </v-row>

      <!-- ESTABLECIMIENTO -->
      <v-row class="ma-0 align-center">
        <v-col cols="12" md="3" class="py-0">
          <div class="body-2 my-2 d-flex align-center">
            Establecimiento
            <span
              v-if="event.temp_event.event_origin === 'OBSV'"
              style="color: red"
              >*</span
            >
            <!--            <v-switch-->
            <!--              v-if="event.temp_event.event_origin === 'MEET'"-->
            <!--              v-model="facilityEnable"-->
            <!--              @change="resetFacility"-->
            <!--              class="mt-0 ml-2"-->
            <!--              dense-->
            <!--              hide-details-->
            <!--            ></v-switch>-->
          </div>
          <AsyncCombobox
            v-model="facility"
            :api="eatApi().getFetcher()"
            url="/facilities/search"
            item-text="name"
            item-value="id"
            search-param="keyword"
            return-object
            :combobox="false"
            outlined
            dense
            :params="facilityParams"
            prepend-inner-icon="mdi-factory"
            :rules="event.temp_event.event_origin === 'MEET' ? [] : estRules"
            :disabled="
              !event.availableFields.facility ||
              (event.temp_event.event_origin === 'MEET' && !facilityEnable)
            "
            @change="update_event"
          >
            <template v-slot:item="{ item }">
              <span>{{ item.name }}</span>
            </template>
            <template v-slot:selection="data">
              <v-chip
                class="py-3"
                v-bind="data.attrs"
                :input-value="data.selected"
                small
              >
                {{ data.item | facilityName }}
              </v-chip>
            </template>
          </AsyncCombobox>
        </v-col>
        <v-col
          cols="12"
          md="3"
          v-if="event.availableFields.sector"
          class="py-0"
        >
          <div class="body-2 my-2">
            Sector
            <span
              v-if="event.temp_event.event_origin === 'OBSV'"
              style="color: red"
              >*</span
            >
          </div>
          <v-select
            ref="sectorInput"
            v-model="sector"
            :items="sectors"
            no-data-text="Seleccione un establecimiento"
            item-text="name"
            item-value="id"
            :placeholder="!event.availableFields.sector ? 'No aplica' : ''"
            solo
            flat
            outlined
            dense
            return-object
            prepend-inner-icon="mdi-drawing-box"
            :rules="event.temp_event.event_origin === 'MEET' ? [] : sectorRules"
            :disabled="
              !event.temp_event.facility ||
              event.temp_event.facility.id === 'N/A'
            "
            @change="update_event"
          />
        </v-col>
      </v-row>

      <!-- FECHA Y HORA -->
      <v-row
        wrap
        v-if="
          event.availableFields.occurrence_date ||
          event.availableFields.occurrence_time
        "
        class="ma-0"
      >
        <v-col cols="12" md="3" class="py-0">
          <div class="body-2 my-2">Fecha de ocurrencia</div>
          <v-menu
            v-model="menuDate"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="occurrenceDate"
                :disabled="!event.availableFields.occurrence_date"
                prepend-inner-icon="mdi-calendar-outline"
                :placeholder="
                  !event.availableFields.occurrence_date ? 'No aplica' : ''
                "
                solo
                flat
                outlined
                dense
                readonly
                autocomplete="off"
                v-on="on"
                :rules="
                  event.temp_event.event_origin !== 'OBSV' ? dateRules : []
                "
                @="update_event"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="date"
              @input="changeDate"
              no-title
              :allowed-dates="allowedDates"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col
          v-if="event.availableFields.occurrence_time"
          cols="12"
          md="2"
          class="py-0"
        >
          <div class="body-2 my-2">Hora de ocurrencia</div>
          <v-menu
            ref="menu"
            v-model="menuTime"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="occurrenceTime"
                :disabled="!event.availableFields.occurrence_time || !date"
                prepend-inner-icon="mdi-clock-outline"
                :placeholder="
                  !event.availableFields.occurrence_time ? 'No aplica' : ''
                "
                solo
                flat
                outlined
                dense
                readonly
                v-on="on"
                :rules="
                  event.temp_event.event_origin !== 'OBSV' ? timeRules : []
                "
              ></v-text-field>
            </template>
            <v-time-picker
              v-if="menuTime"
              v-model="time"
              format="24hr"
              full-width
              @click:minute="changeTime"
              :allowed-hours="allowedTime.allowedHours"
              :allowed-minutes="allowedTime.allowedMinutes"
            ></v-time-picker>
          </v-menu>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from "vuex";
import { EVENT_ORIGINS } from "@/mixins/globals";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { eatApi } from "@/apis";
import { facilityName } from "@/Filters";

export default {
  name: "FirstStep",
  components: { AsyncCombobox },
  data() {
    return {
      isValidStep: true,
      loading: false,
      facilityEnable: true,
      date: "",
      menuDate: false,
      menuTime: false,
      time: "00:00",
      allowedDates: (v) => v <= new Date().toISOString().substr(0, 10),
      paRules: [(v) => !!v || "Debe elegir un área de sistema de gestión"],
      estRules: [(v) => !!v || "El establecimiento es requerido"],
      sectorRules: [(v) => !!v || "El sector es requerido"],
      dateRules: [(v) => !!v || "La fecha de ocurrencia requerida"],
      timeRules: [(v) => !!v || "La hora de ocurrencia requerida"],
    };
  },

  computed: {
    ...mapState(["event", "user"]),
    ...mapGetters("user", ["currentUser"]),
    ...mapGetters("user", ["getFacilitiesByUser"]),

    facilityParams() {
      const id = [];
      this.getFacilitiesByUser?.forEach((item) => id.push(item.id));
      return {
        id: id,
      };
    },

    categories() {
      let aCategories = [];
      for (let cat in this.event.crteCats) {
        if (cat !== "NA")
          aCategories.push({ key: cat, name: this.event.crteCats[cat] });
      }
      return aCategories;
    },

    facilities() {
      if (this.currentUser.access_facilities?.length > 0) {
        const facilities = [];
        this.currentUser.access_facilities?.forEach((f) => {
          this.event.facilities.filter((item) => {
            if (item.id === f.id) {
              facilities.push(item);
            }
          });
        });
        return facilities;
      }
      if (this.event.temp_event.event_origin === EVENT_ORIGINS.MEET) {
        return [...this.event.facilities, { name: "No Aplica", id: "N/A" }];
      }
      return this.event.facilities;
    },
    // facilities() {
    //   if (this.event.temp_event.event_origin === EVENT_ORIGINS.MEET) {
    //     return [...this.event.facilities, { name: "No Aplica", id: "N/A" }];
    //   }
    //   return this.event.facilities;
    // },

    sectors() {
      if (this.event.temp_event.facility.sectors) {
        let aSectors = this.event.temp_event.facility.sectors.slice();
        if (this.event.temp_event.event_origin === EVENT_ORIGINS.MEET) {
          aSectors.unshift({ name: "No Aplica", id: "N/A" });
        }
        return aSectors;
      }
      return [];
    },

    allowedTime() {
      if (this.date === new Date().toISOString().substr(0, 10)) {
        return {
          allowedHours: (v) => v <= new Date().getHours(),
          allowedMinutes:
            this.time.substring(0, 2) < new Date().getHours()
              ? null
              : (v) => v <= new Date().getMinutes(),
        };
      } else {
        return {
          allowedHours: null,
          allowedMinutes: null,
        };
      }
    },

    datePicker: function () {
      if (!this.date) return null;
      const [year, month, day] = this.date.split("-");
      return `${day}-${month}-${year}`;
    },

    occurrenceDate: {
      get() {
        let date = this.event.temp_event.occurrence_date;
        if (!date) return null;
        const [year, month, day] = date.split("-");
        return `${day}-${month}-${year}`;
      },
      set(date) {
        this.set_occurrenceDate(date);
      },
    },

    occurrenceTime: {
      get() {
        return this.event.temp_event.occurrence_time;
      },
      set(time) {
        this.set_occurrenceTime(time);
      },
    },

    processArea: {
      get() {
        return this.event.temp_event.process_areas[0];
      },
      set(processArea) {
        this.set_processArea(processArea);
      },
    },

    category: {
      get() {
        return this.event.temp_event.classification;
      },
      set(category) {
        this.set_eventCategory(category);
      },
    },

    facility: {
      get() {
        return this.event.temp_event.facility;
      },
      set(facility) {
        if (facility.id !== this.event.temp_event.facility.id) {
          this.sector = "";
          if (this.$refs.sectorInput) this.$refs.sectorInput.resetValidation();
        }
        this.set_facility(facility);
      },
    },

    sector: {
      get() {
        return this.event.temp_event.sector;
      },
      set(sector) {
        this.set_sector(sector);
      },
    },
  },

  methods: {
    facilityName,
    ...mapMutations("event", [
      "set_originator",
      "set_id",
      "set_facility",
      "set_sector",
      "set_processArea",
      "set_eventCategory",
      "clean_tempEvent",
      "set_occurrenceDate",
      "set_occurrenceTime",
    ]),

    ...mapActions(["set_alert"]),

    ...mapActions("event", ["create_event", "update_event"]),

    ...mapActions("user", ["getUsers"]),

    eatApi() {
      return eatApi;
    },

    resetFacility(input) {
      if (!input) {
        this.set_facility("");
        this.set_sector("");
        this.update_event();
      }
    },

    changeDate() {
      this.menuDate = false;
      this.set_occurrenceDate(this.date);
      this.set_occurrenceTime("");
      this.update_event();
    },

    changeTime() {
      this.menuTime = false;
      this.set_occurrenceTime(this.time);
      this.update_event();
    },
  },
};
</script>

<style />
