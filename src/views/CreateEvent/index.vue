<template>
  <v-container
    class="ma-0 pa-5 d-flex flex-column justify-space-between"
    fluid
    style="height: 100%"
  >
    <v-row class="ma-0 pa-0">
      <div>
        <span class="text-h4">Nuevo evento</span>
        <br />
        <span>Seleccione el origen del evento:</span>
      </div>
      <v-spacer />
      <v-btn
        v-if="pendingEvents.length"
        @click="pendEventsDialog = true"
        outlined
        small
        :color="disableNewEvent ? 'error' : 'warning'"
        :loading="fetchPendingEvents"
        >{{ isMobile ? "EP" : "eventos pendientes" }} ({{
          pendingEvents.length
        }})
        <v-icon right class="animated pulse infinite">mdi-alert</v-icon>
      </v-btn>
    </v-row>
    <div
      class="d-flex flex-column justify-space-between mx-auto"
      style="width: 782px"
    >
      <span class="subtitle-2 text--secondary mb-1">
        Gestión de Hallazgos / Causas y Acciones
      </span>
      <div class="d-flex justify-space-between mb-5" style="gap: 16px">
        <TypeEventCard
          v-for="origin in firstGroup"
          :key="origin.key"
          :origin="origin"
          v-on:on-click="newEvent"
        />
      </div>
      <span class="subtitle-2 text--secondary mb-1">Gestión de acciones</span>
      <div class="d-flex justify-space-between mb-5" style="gap: 16px">
        <TypeEventCard
          v-for="origin in secondGroup"
          :key="origin.key"
          :origin="origin"
          v-on:on-click="newEvent"
        />
      </div>
      <span class="subtitle-2 text--secondary mb-1"
        >Módulo de observaciones</span
      >
      <div class="d-flex justify-space-between" style="gap: 16px">
        <TypeEventCard
          v-for="origin in thirdGroup"
          :key="origin.key"
          :origin="origin"
          v-on:on-click="newEvent"
        />
      </div>
    </div>
    <v-dialog
      v-model="pendEventsDialog"
      width="500px"
      transition="isMobile ? 'dialog-bottom-transition' : ''"
    >
      <PendingEventsDialog
        :fetch-pending-events="fetchPendingEvents"
        v-on:close-dialog="pendEventsDialog = false"
      />
    </v-dialog>
    <div class="flex-grow-1"></div>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import PendingEventsDialog from "@/components/reusable/PendingEventsDialog.vue";
import { EVENT_ORIGINS } from "@/mixins/globals";
import TypeEventCard from "@/views/CreateEvent/TypeEventCard.vue";

export default {
  components: { TypeEventCard, PendingEventsDialog },
  data: () => ({
    eventId: null,
    pendEventsDialog: false,
    loading: false,
    fetchPendingEvents: false,
  }),

  created() {
    this.getPendEvents();
  },

  beforeDestroy() {
    this.clean_fca();
    this.clean_tempEvent();
  },

  computed: {
    ...mapState(["user", "event"]),

    origins() {
      let eOrigins = [];
      for (let o in this.event.eventOrigins) {
        if (
          ![EVENT_ORIGINS.EXTERNAL_REQ, EVENT_ORIGINS.INTERNAL_REQ].includes(o)
        ) {
          eOrigins.push({
            key: o,
            name: this.event.eventOrigins[o].name,
            img: this.event.eventOrigins[o].img,
          });
        }
      }
      return eOrigins;
    },

    firstGroup() {
      return this.origins.filter((o) =>
        [
          EVENT_ORIGINS.CRITICAL_EVENT,
          EVENT_ORIGINS.INTERNAL_AUD,
          EVENT_ORIGINS.EXTERNAL_AUD,
        ].includes(o.key)
      );
    },

    secondGroup() {
      return this.origins.filter((o) =>
        [
          EVENT_ORIGINS.MEET,
          EVENT_ORIGINS.CHANGE,
          EVENT_ORIGINS.PROJECT,
        ].includes(o.key)
      );
    },

    thirdGroup() {
      return this.origins.filter((o) =>
        [EVENT_ORIGINS.OBSERVATION].includes(o.key)
      );
    },

    disableNewEvent() {
      return this.user.userPendingEvents.length >= 5;
    },

    pendingEvents() {
      return this.user.userPendingEvents;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("event", [
      "set_event",
      "set_eventOrigin",
      "clean_tempEvent",
      "set_addedDate",
    ]),
    ...mapMutations("fca", ["clean_fca"]),
    ...mapActions("event", ["create_event"]),
    ...mapActions("user", ["getPendingEvents"]),

    getPendEvents() {
      this.fetchPendingEvents = true;
      this.pendEventsDialog = !this.user.settings.showEventsPends;

      this.getPendingEvents().then((ePend) => {
        if (!ePend.length) {
          this.pendEventsDialog = false;
        } else {
          this.fetchPendingEvents = false;
        }
      });
    },

    newEvent(eventOrigin) {
      this.origins.forEach((o) => {
        if (o.key === eventOrigin) o.loading = true;
      });
      this.loading = true;
      this.create_event({
        originator: this.user.user.id,
        event_origin: eventOrigin,
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
          this.loading = false;
          this.origins.forEach((o) => (o.loading = false));
        });
    },

    newObservation() {
      this.set_eventOrigin(EVENT_ORIGINS.OBSERVATION);
      this.newEvent();
    },
  },
};
</script>
<style scoped>
.grid-container {
  width: 70%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
}
.borderColor {
  border-left: 5px solid #449cc9;
}
</style>
