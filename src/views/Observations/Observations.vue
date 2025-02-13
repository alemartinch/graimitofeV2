<template>
  <v-container class="pa-0 pt-13">
    <v-app-bar fixed color="white"
      ><v-toolbar-title>Observaciones</v-toolbar-title><v-spacer /><v-btn
        text
        color="primary"
        @click="verifyPendingEvents"
        :loading="loading.newObsBtn"
        >nueva</v-btn
      ></v-app-bar
    >
    <!--    <v-row class="ma-0 pa-2">-->
    <!--      <v-spacer />-->
    <!--      <v-btn-->
    <!--        color="primary"-->
    <!--        @click="verifyPendingEvents"-->
    <!--        :loading="loading.newObsBtn"-->
    <!--        >Nueva observación</v-btn-->
    <!--      >-->
    <!--    </v-row>-->
    <ObservationsSkeleton v-if="loading.page" />
    <template v-else>
      <v-list dense v-if="openEvents.length" :disabled="loading.newObsBtn">
        <v-subheader class="primary--text caption"
          >OBSERVACIONES PENDIENTES DE CARGA
        </v-subheader>
        <v-list-item
          v-for="ev in openEvents"
          :key="ev.id"
          :value="ev"
          class="mt-3"
          active-class="primary"
          @click="$router.push({ path: `/create_event/new_event/${ev.id}` })"
        >
          <v-list-item-content>
            <v-list-item-title>
              <span v-if="ev.findings && ev.findings.length" class="text-body-1"
                >H: {{ ev.findings[0].description }}</span
              ><span v-else class="text-body-1 font-italic"
                >Sin hallazgo cargado</span
              >
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-2">
              Ob {{ ev.id }} {{ event.statuses[ev.status].abb }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              <span class="text-right"
                >Última modificación {{ ev.added_date | fechaDiaMesAnio }}</span
              >
              <span class="font-weight-bold">
                por
                {{ ev.originator | fullName }}</span
              >
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list dense :disabled="loading.newObsBtn">
        <v-subheader class="primary--text caption"
          >OBSERVACIONES CARGADAS
        </v-subheader>
        <v-list-item
          v-for="ev in noOpensEvents"
          :key="ev.id"
          :value="ev"
          class="mt-3"
          active-class="primary"
          three-line
          @click="$router.push({ path: `/events/eventinfomb/${ev.id}` })"
        >
          <v-list-item-content>
            <v-list-item-title>
              <span v-if="ev.findings && ev.findings.length" class="text-body-1"
                >H: {{ ev.findings[0].description }}</span
              >
            </v-list-item-title>
            <v-list-item-subtitle class="text-body-2">
              Ob {{ ev.id }} {{ event.statuses[ev.status].abb }}
            </v-list-item-subtitle>
            <v-list-item-subtitle>
              <span class="text-right"
                >Creado el {{ ev.added_date | fechaDiaMesAnio }}</span
              >
              <span class="font-weight-bold">
                por
                {{ ev.originator | fullName }}</span
              >
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
    <v-dialog
      v-model="pendEventsDialog"
      width="500px"
      transition="dialog-top-transition"
    >
      <PendingEventsDialog />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { EVENT_STATUSES, EVENT_ORIGINS } from "@/mixins/globals";
import PendingEventsDialog from "@/components/reusable/PendingEventsDialog.vue";
import ObservationsSkeleton from "@/views/Observations/ObservationsSkeleton.vue";

export default {
  name: "Observations",
  components: { ObservationsSkeleton, PendingEventsDialog },
  data() {
    return {
      pendEventsDialog: false,
      loading: {
        page: false,
        newObsBtn: false,
      },

      openEvents: null,
      noOpensEvents: null,
    };
  },

  created() {
    this.clean_fca();
    this.loading.newObsBtn = true;
    this.getPendingEvents().then(() => {
      this.loading.newObsBtn = false;
    });
    this.getObservations();
  },

  computed: {
    ...mapState(["event", "user"]),
  },

  methods: {
    ...mapMutations("event", ["set_events", "set_events_filter"]),
    ...mapMutations("fca", ["clean_fca"]),
    ...mapMutations(["SET_ALERT"]),
    ...mapActions("event", ["create_event", "get_events"]),
    ...mapActions("user", ["getPendingEvents"]),

    getObservations() {
      this.loading.page = true;
      this.set_events_filter({
        ordering: "-id",
        event_origin: EVENT_ORIGINS.OBSERVATION,
        page_size: 50,
      });
      this.get_events()
        .then(() => {
          this.openEvents = this.event.events.filter((e) => {
            return (
              e.status === EVENT_STATUSES.OPEN &&
              e.originator.id === +this.user.user.id
            );
          });
          this.noOpensEvents = this.event.events.filter(
            (e) => e.status !== EVENT_STATUSES.OPEN
          );
        })
        .finally(() => {
          this.loading.page = false;
        });
    },

    verifyPendingEvents() {
      if (this.user.userPendingEvents.length >= 5) {
        this.pendEventsDialog = true;
      } else {
        this.newObservation();
      }
    },

    newObservation() {
      this.loading.newObsBtn = true;
      this.create_event({
        originator: this.user.user.id,
        event_origin: EVENT_ORIGINS.OBSERVATION,
        added_date: new Date().toISOString().substr(0, 10),
      })
        .then((event) => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Evento creado",
          });
          this.$router.push({ path: `/create_event/new_event/${event.id}` });
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "No pudo crearse el evento",
          });
          this.loading.newObsBtn = false;
        });
    },
  },
};
</script>

<style scoped>
.v-sheet.v-app-bar.v-toolbar:not(.v-sheet--outlined) {
  box-shadow: 0 1px 10px 0 rgba(0, 0, 0, 0.12);
}
</style>
