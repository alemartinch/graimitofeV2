<template>
  <v-card
    height="300px"
    elevation="22"
    outlined
    class="d-flex flex-column"
    :loading="loading"
  >
    <v-card-title
      class="py-2 d-inline-block text-truncate"
      style="border-bottom: rgba(44, 103, 125, 0.16) solid 1px"
      >{{ isMobile ? "Observacion/es" : "Eventos" }} pendientes de carga
    </v-card-title>
    <div
      v-if="!pendingEvents.length"
      class="flex-grow-1 d-flex flex-column justify-center align-center"
    >
      <v-img
        class="flex-grow-0 animate__bounceIn"
        width="85"
        height="85"
        contain
        :src="require('@/assets/no-pendings-events.svg')"
      ></v-img>
      <div class="body-2">Sin eventos pendientes de carga</div>
      <v-btn text small color="primary" @click="goToCreateEvent"
        >crear evento</v-btn
      >
    </div>
    <div v-else style="height: calc(300px - 49px); overflow: auto" class="mt-5">
      <v-list dense>
        <v-list-item
          v-for="ev in pendingEvents"
          :key="ev.id"
          class="py-1"
          style="border-bottom: rgba(44, 103, 125, 0.16) solid 1px"
        >
          <v-col cols="2" md="4" class="py-0">
            <span class="caption">{{ ev.id }}</span> <br />
            <span>{{
              isMobile
                ? event.eventOrigins[ev.event_origin].abbr
                : event.eventOrigins[ev.event_origin].name
            }}</span>
          </v-col>
          <v-spacer />
          <div class="d-flex align-center">
            <v-progress-circular
              color="primary"
              :value="ev.percentage"
              class="caption"
              >{{ ev.percentage }}
            </v-progress-circular>
            <span class="ml-2 caption">% completado</span>
          </div>
          <v-spacer />
          <t-btn-icon
            @click="$router.push({ path: `/create_event/new_event/${ev.id}` })"
          >
            mdi-file-document-edit-outline
          </t-btn-icon>
          <t-btn-icon
            color="error"
            @click="
              delEventID = ev.id;
              showPrompt = true;
            "
            >mdi-delete-outline
          </t-btn-icon>
        </v-list-item>
      </v-list>
    </div>
    <GlobalPrompt
      title="Eliminar evento"
      :active="showPrompt"
      prompt-type="alert"
      v-on:evt-no="showPrompt = false"
    >
      <template v-slot:message>
        Se borrarán todos los datos del evento así cómo los hallazgos, causas,
        acciones y archivos relacionados al mismo.
      </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="delEventLoading"
          @click="showPrompt = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>

      <template v-slot:accept>
        <t-btn-delete :loading="delEventLoading" @click="deleteEvent">
          Eliminar evento
        </t-btn-delete>
      </template>
    </GlobalPrompt>
  </v-card>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import { EVENT_STATUSES, EVENT_ORIGINS } from "@/mixins/globals";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";

export default {
  name: "HomeEventCard",
  components: {
    TBtnDelete,
    TBtnSecondary,
    TBtnIcon,
    GlobalPrompt,
  },

  data() {
    return {
      delEventID: null,
      showPrompt: false,
      delEventLoading: false,
      loading: false,
    };
  },
  computed: {
    ...mapState(["event"]),

    pendingEvents() {
      const pendingEvents = [];
      const openEvents = this.event.homePageEvents.filter(
        (e) => e.status === EVENT_STATUSES.OPEN
      );
      openEvents.forEach((event) => {
        let totalSteps = 0;
        let completedSteps = 0;
        for (const prop in event) {
          const eventAvailableFields =
            this.event.eventOrigins[event.event_origin].availableFields;
          if (eventAvailableFields.includes(prop)) {
            totalSteps++;
            if (event[prop]) {
              completedSteps++;
              if (Array.isArray(event[prop]) && !event[prop].length) {
                completedSteps--;
              }
            }
          }
        }
        pendingEvents.push({
          ...event,
          percentage: Math.trunc((completedSteps * 100) / totalSteps),
        });
      });
      return this.isMobile
        ? pendingEvents.filter(
            (e) => e.event_origin === EVENT_ORIGINS.OBSERVATION
          )
        : pendingEvents;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapActions("event", ["delete_event"]),
    ...mapActions(["get_home_page_data"]),

    getHomePageData() {
      this.loading = true;
      this.get_home_page_data()
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Error al actualizar las tareas",
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    goToCreateEvent() {
      const path = this.isMobile ? "/observations" : "/create_event";
      this.$router.push({ path });
    },

    deleteEvent() {
      this.delEventLoading = true;
      this.delete_event(this.delEventID)
        .then(() => {
          this.getHomePageData();
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Evento eliminado",
          });
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `No pudo eliminarse el evento`,
          });
        })
        .finally(() => {
          this.delEventID = null;
          this.showPrompt = false;
          this.delEventLoading = false;
        });
    },
  },
};
</script>
