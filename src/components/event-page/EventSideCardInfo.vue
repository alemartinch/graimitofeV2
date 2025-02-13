<template>
  <div>
    <div class="d-flex align-center">
      <InfographicIcon icon="mdi-chart-bubble" />
      <div class="ml-3 d-flex flex-column">
        <span class="caption text--secondary">Área de gestión </span>
        <span class="text-md-body-2 font-weight-bold">
          {{ event.temp_event.process_areas[0].name }}
        </span>
      </div>
    </div>

    <div
      class="d-flex align-center mt-5"
      v-if="event.temp_event.event_origin === 'CRTE'"
    >
      <InfographicIcon icon="mdi-format-list-bulleted-type" />
      <div class="ml-3 d-flex flex-column">
        <span class="caption text--secondary">Categoría </span>
        <span class="text-md-body-2 font-weight-bold">
          {{ event.crteCats[event.temp_event.classification] }}
        </span>
      </div>
    </div>

    <div class="d-flex align-center mt-5">
      <InfographicIcon icon="mdi-factory" />
      <div class="ml-3 d-flex flex-column">
        <span class="caption text--secondary">Establecimiento </span>
        <span class="text-caption text-md-body-2 font-weight-bold">
          {{ event.temp_event.facility.name }}
          <span v-if="event.temp_event.sector">
            <v-icon>mdi-arrow-right-bold</v-icon>
            {{ event.temp_event.sector.name | reduceText }}
          </span>
        </span>
      </div>
    </div>

    <div
      class="d-flex align-center mt-5"
      v-if="event.temp_event.occurrence_date"
    >
      <InfographicIcon icon="mdi-calendar-alert" />
      <div class="ml-3 d-flex flex-column">
        <span class="caption text--secondary">Ocurrencia </span>
        <span class="text-caption text-md-body-2 font-weight-bold">
          {{ event.temp_event.occurrence_date | fechaText }} -
          {{ event.temp_event.occurrence_time || "" }}h
        </span>
      </div>
    </div>

    <div
      class="d-flex align-center mt-5"
      v-if="event.temp_event.equipment_category"
    >
      <InfographicIcon icon="mdi-diving-scuba-tank" />
      <div class="ml-3 d-flex flex-column">
        <span class="caption text--secondary">Equipo </span>
        <span class="text-caption text-md-body-2 font-weight-bold">
          {{ event.temp_event.equipment_category.name
          }}<v-menu
            v-if="event.temp_event.equipment_category.name !== 'N/A'"
            bottom
            nudge-bottom="20"
            open-on-click
            max-width="300"
            :close-on-content-click="false"
            ><template v-slot:activator="{ on }"
              ><v-icon small color="primary" class="ml-1" v-on="on"
                >mdi-information-outline</v-icon
              ></template
            >
            <v-card class="pa-2">
              <p
                v-if="event.temp_event.equipment_id"
                class="text-uppercase text-caption font-weight-bold mb-0"
              >
                {{ " ID " + event.temp_event.equipment_id }}
              </p>
              <p class="text-caption">
                {{ event.temp_event.equipment_description }}
              </p>
            </v-card>
          </v-menu>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import InfographicIcon from "@/components/reusable/InfographicIcon.vue";

export default {
  name: "EventSideCardInfo",
  components: { InfographicIcon },
  computed: {
    ...mapState(["event"]),
  },
};
</script>
