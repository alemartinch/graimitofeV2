<template>
  <v-card
    v-if="!userObservations.length"
    outlined
    flat
    height="200"
    class="mt-2 d-flex flex-column justify-center align-center"
  >
    <v-icon x-large color="secondary" style="opacity: 0.4"
      >mdi-file-eye-outline</v-icon
    >
    <span class="caption">No has cargado ningun observación</span>
    <t-btn-primary class="mt-2" :loading="loading" @click="newObservation"
      >Cargar observación</t-btn-primary
    >
  </v-card>
  <v-list v-else dense>
    <v-list-item
      v-for="observation in userObservations"
      :key="observation.id"
      two-line
      class="mb-1 elevation-22 rounded-sm"
      link
      :to="{
        path: `${
          observation.status === 'OPEN'
            ? '/create_event/new_event/'
            : '/events/eventinfomb/'
        }${observation.id}`,
      }"
      :style="observation.status === 'OPEN' ? openItemStyle : {}"
    >
      <v-list-item-content>
        <v-list-item-title class="d-flex justify-space-between">
          <span class="caption text--secondary">E{{ observation.id }}</span>
          <span class="caption">{{
            event.statuses[observation.status].abb.toUpperCase()
          }}</span>
        </v-list-item-title>
        <v-list-item-subtitle class="text-wrap text--primary text-truncate"
          >{{ observation.findingDescription }}
          <v-divider class="mt-1" />
        </v-list-item-subtitle>
        <v-list-item-subtitle class="caption d-flex justify-end"
          >Creado el
          {{ observation.added_date | fechaText }}</v-list-item-subtitle
        >
      </v-list-item-content>
    </v-list-item>
    <t-btn-primary block @click="$router.push({ path: `/observations` })"
      >ver mas
    </t-btn-primary>
  </v-list>
</template>
<script>
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { EVENT_ORIGINS, EVENT_STATUSES } from "@/mixins/globals";

export default {
  name: "HomeObservationsList",
  components: { TBtnPrimary },
  data() {
    return {
      openItemStyle: {
        border: "1px black dashed",
      },
      loading: false,
    };
  },

  computed: {
    ...mapState(["event"]),
    ...mapGetters("user", ["currentUserId"]),

    userObservations() {
      const currentUserObservations = this.event.events.filter((e) => {
        return (
          e.originator.id === this.currentUserId &&
          e.status !== EVENT_STATUSES.CLOSE
        );
      });
      const currentUserObservationsSort = currentUserObservations.sort(
        (a, b) => {
          // Ordenar por "status"
          if (a.status === "OPEN" && b.status !== "OPEN") {
            return -1;
          } else if (a.status !== "OPEN" && b.status === "OPEN") {
            return 1;
          }
          // Si los "status" son iguales, ordenar por fecha descendente
          return 0;
        }
      );
      return currentUserObservationsSort
        .map((obs) => {
          return {
            ...obs,
            findingDescription:
              obs.findings[0]?.description || "Sin hallazgo creado",
          };
        })
        .splice(0, 6);
    },
  },

  methods: {
    ...mapMutations(["show_success_notification", "show_error_notification"]),
    ...mapActions("event", ["create_event"]),

    newObservation() {
      this.loading = true;
      this.create_event({
        originator: this.currentUserId,
        event_origin: EVENT_ORIGINS.OBSERVATION,
        added_date: new Date().toISOString().substr(0, 10),
      })
        .then((event) => {
          this.show_success_notification("Evento creado");
          this.$router.push({ path: `/create_event/new_event/${event.id}` });
        })
        .catch(() => {
          this.show_error_notification("No pudo crearse el evento");
          this.loading = false;
        });
    },
  },
};
</script>
