<template>
  <v-container
    class="ma-0 pa-md-5 pb-sm-0"
    fluid
    style="border-bottom: 2px solid rgba(34, 34, 34, 0.05)"
  >
    <v-row>
      <v-col cols="auto">
        <div class="d-flex align-center">
          <span class="text-body-1"
            >NUEVO EVENTO
            <span class="font-weight-bold primary--text"
              >ID {{ event.temp_event.id }}</span
            >
          </span>
          <v-icon v-if="event.loading.updateEvent" class="ml-2 green--text"
            >mdi-sync mdi-spin
          </v-icon>
          <v-icon v-else class="ml-2 green--text"
            >mdi-cloud-check-outline</v-icon
          >
          <span
            v-show="event.loading.updateEvent"
            class="text-caption green--text"
            >guardando borrador</span
          >
          <!--          Se renderizan las etiquetas en el caso que existan-->
          <EventTags></EventTags>
        </div>
        <div class="d-flex align-center">
          <span class="text-h4">{{
            event.eventOrigins[event.temp_event.event_origin].name
          }}</span>
        </div>
        <v-divider class="divider" style="border-color: #449cc9" />
        <div>
          <span class="text-body-2">Originador: </span>
          <span class="text-body-2 font-weight-bold pa-1">
            {{ event.temp_event.originator | fullName }}
          </span>
          <br v-if="$vuetify.breakpoint.smAndDown" />
          <span class="text-body-2"
            >{{
              $vuetify.breakpoint.smAndDown
                ? "Fecha de creación: "
                : "• Fecha de creación: "
            }}
          </span>
          <span class="text-body-2 font-weight-bold">
            {{ event.temp_event.added_date | fechaDiaMesAnio }}
          </span>
        </div>
      </v-col>
      <v-spacer />
      <v-col cols="12" md="auto">
        <!-- BOTONES -->
        <EventLoaderBtns />
      </v-col>
    </v-row>
    <LoaderIndex />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import EventLoaderBtns from "@/components/newevent-page/EventLoader/EventLoaderBtns.vue";
import LoaderIndex from "@/components/newevent-page/EventLoader/LoaderIndex.vue";
import EventTags from "@/components/event-page/EventTags.vue";
export default {
  name: "EventLoaderHeader",
  components: { EventTags, LoaderIndex, EventLoaderBtns },
  computed: {
    ...mapState(["user", "event"]),
    ...mapGetters("event", ["getEventTags"]),
  },
};
</script>

<style scoped>
.divider {
  border-width: 1px;
  width: 300px;
  margin-top: 10px;
}
</style>
