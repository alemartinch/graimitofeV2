<template>
  <AppSpinner v-if="loading" :msg="`Cargando datos`" />
  <v-container
    v-else-if="eventCreated"
    class="d-flex flex-column align-center justify-center"
    fill-height
  >
    <v-img
      :src="require('@/assets/event_created.png')"
      contain
      max-height="30%"
      style="opacity: 0.5"
    ></v-img
    ><span class="text-h6 text--secondary mt-4"
      >El evento {{ id }} ya ha sido creado</span
    >
    <div>
      <v-btn
        small
        text
        color="primary"
        class="mt-5"
        @click="$router.push({ path: `/events/eventinfo/${id}` })"
        >ir al evento {{ id }}
      </v-btn>
      <v-btn
        small
        text
        color="primary"
        class="mt-5"
        @click="$router.push({ path: `/create_event/` })"
        >crear nuevo evento
      </v-btn>
    </div>
  </v-container>
  <v-container v-else class="pa-0" fluid>
    <EventLoaderHeaderMb v-if="isMobile" />
    <EventLoaderHeader v-else />

    <div
      id="loader-form-container"
      :style="{ 'padding-top': isMobile ? '70px' : '0' }"
      :class="isMobile ? 'overflow-wrapper-mb' : 'overflow-wrapper'"
    >
      <!--ADJUNTOS-->
      <v-card flat class="pa-5" v-if="isMobile">
        <AttachFilesMb editable />
      </v-card>

      <!--GENERAL-->
      <v-card flat class="pa-5">
        <v-card-title
          class="pa-0 text-subtitle-2"
          v-if="!isMobile"
          id="first-step"
          >General</v-card-title
        >
        <FirstStep />
      </v-card>

      <!--RESUMEN Y DESCRIPCIÓN-->
      <v-card flat class="pa-5" v-if="event.temp_event.event_origin !== 'OBSV'">
        <v-card-title class="pa-0 text-subtitle-2" id="second-step">
          {{ getSecondStepTitle }}
          <v-spacer />
        </v-card-title>
        <SecondStep />
      </v-card>

      <!--PARTICIPANTES Y LÍDER-->
      <v-card
        flat
        class="pa-5"
        v-if="
          event.availableFields.leader || event.availableFields.participants
        "
      >
        <v-card-title class="pa-0 text-subtitle-2" id="third-step">
          Participantes
        </v-card-title>
        <ThirdStep />
      </v-card>

      <!--EQUIPO-->
      <v-card flat class="pa-5" v-if="event.availableFields.equipment">
        <v-card-title class="pa-0 text-subtitle-2" id="fourth-step">
          Equipo
        </v-card-title>
        <FourthStep />
      </v-card>

      <!--FCA-->
      <v-card flat class="px-5" min-height="400px">
        <v-card-title
          class="pa-0 text-subtitle-2"
          v-if="!isMobile"
          id="fifth-step"
        >
          {{ getFcaPanelTitle }}
        </v-card-title>
        <FindingsLoaderList v-if="isMobile" loader />
        <FcaLoader v-else class="mt-5" />
      </v-card>
    </div>
  </v-container>
</template>

<script>
import { eatApi } from "@/apis";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import validateEventSteps from "@/components/newevent-page/EventLoader/validateEventSteps";
import FcaLoader from "@/components/newevent-page/EventLoader/FcaLoader/FcaLoader.vue";
import FirstStep from "@/components/newevent-page/EventLoader/FirstStep.vue";
import FourthStep from "@/components/newevent-page/EventLoader/FourthStep.vue";
import SecondStep from "@/components/newevent-page/EventLoader/SecondStep.vue";
import ThirdStep from "@/components/newevent-page/EventLoader/ThirdStep.vue";
import EventLoaderHeader from "@/components/newevent-page/EventLoader/EventLoaderHeader.vue";
import AppSpinner from "@/components/app-page/AppSpinner.vue";
import FindingsLoaderList from "@/components/newevent-page/EventLoader/FcaLoader/FindingsLoaderList.vue";
import EventLoaderHeaderMb from "@/components/newevent-page/EventLoader/EventLoaderHeaderMb.vue";
import AttachFilesMb from "@/components/newevent-page/EventLoader/AttachFilesMb.vue";
import { EVENT_STATUSES } from "@/mixins/globals";

export default {
  name: "EventLoader",
  components: {
    AttachFilesMb,
    EventLoaderHeaderMb,
    FindingsLoaderList,
    AppSpinner,
    EventLoaderHeader,
    FcaLoader,
    FirstStep,
    FourthStep,
    SecondStep,
    ThirdStep,
  },
  mixins: [validateEventSteps],

  created() {
    this.enablePanels = false;
    this.panel = [0, 1, 2, 3, 4];
    this.id = this.$route.params.id;
    this.getEvent(this.$route.params.id);
  },

  data: () => ({
    id: null,
    eventCreated: false,
    enablePanels: true,
    showStepTwo: false,
    showStepThree: false,
    showStepFour: false,
    showStepFive: false,
    showStepSix: false,
    dialog: false,
    panel: [0, 1, 2, 3, 4],
    changeManagment: false,
    interval: null,
    showAttachDialog: false,
    minHeader: false,
    loading: false,
  }),

  beforeDestroy() {
    this.clean_fca();
    this.clean_tempEvent();
  },

  computed: {
    ...mapState(["event", "user", "fca", "appLoading"]),

    ...mapGetters("event", [
      "participantsList",
      "getOccurrenceDateFormat",
      "getFcaPanelTitle",
    ]),

    ...mapGetters("fca", [
      "findingsWithoutCauses",
      "causesWithoutActions",
      "findingsWithoutActions",
      "findings_nc_ncm",
      "findings_om",
    ]),

    getSecondStepTitle() {
      if (
        this.event.availableFields.summary &&
        this.event.availableFields.description
      ) {
        return "Resumen y descripción";
      }
      if (this.event.availableFields.summary) {
        return "Resumen";
      } else {
        return "Descripción";
      }
    },

    eventOrigin: {
      get() {
        return this.event.temp_event.event_origin;
      },
      set(eventOrigin) {
        if (this.event.temp_event.event_origin !== eventOrigin.key) {
          this.set_eventOrigin(eventOrigin.key);
          let defaultEvent = {
            id: this.event.temp_event.id,
            originator: this.event.temp_event.originator,
            leader: "",
            equipment_category: null,
            equipment_id: "",
            equipment_description: "",
            added_date: this.event.temp_event.added_date,
            facility: "",
            sector: "",
            occurrence_date: "",
            occurrence_time: "",
            description: "",
            summary: "",
            learning_experience: false,
            participants: [],
            event_origin: eventOrigin.key,
            process_areas: [],
            equipment: "",
            files: [],
            status: EVENT_STATUSES.PENDING_ACTIONS,
            form: "R",
          };
          this.clean_tempEvent(defaultEvent);
        }
      },
    },
  },

  watch: {
    isValidStepOne(newVal) {
      if (newVal) this.update_event();
    },
    isValidStepTwo(newVal) {
      if (newVal) {
        // Se setea un timeout para que la descripción se llegue a llenar
        setTimeout(() => {
          this.update_event();
        }, 7000);
      }
    },
    isValidStepThree(newVal) {
      if (newVal) this.update_event();
    },
    isValidStepFour(newVal) {
      if (newVal) {
        // Se setea un timeout para que la descripción se llegue a llenar
        setTimeout(() => {
          this.update_event();
        }, 7000);
      }
    },
    floatBtn(newValue) {
      if (!newValue && this.fabBtn) {
        this.fabBtn = false;
      }
    },
    $route(to) {
      this.id = to.params.id;
      this.$router.go(0);
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),

    ...mapMutations("event", [
      "set_event",
      "clean_tempEvent",
      "set_eventOrigin",
      "set_addedDate",
    ]),

    ...mapMutations("fca", [
      "set_findings",
      "clean_fca",
      "set_actions",
      "set_causes",
    ]),

    ...mapActions(["get_page_data"]),

    ...mapActions("event", [
      "create_event",
      "add_process_areas",
      "update_event",
      "save_event",
    ]),

    getEvent(id) {
      this.loading = true;
      eatApi
        .getFetcher()
        .get(`events/full/${id}`)
        .then((response) => {
          const event = response.data.results;
          if (event.status !== EVENT_STATUSES.OPEN) {
            this.SET_ALERT({
              appAlertType: "info",
              appAlertMsg: "El evento ya ha sido creado",
            });
            this.eventCreated = true;
            this.loading = false;
          } else {
            this.set_event(event);
            this.set_addedDate(new Date().toISOString().substr(0, 10));
            this.set_eventOrigin(event.event_origin);
            if (event.findings.length) {
              this.set_findings(event.findings);
            } else if (event.causes.length) {
              this.set_causes(event.causes);
            } else {
              this.set_actions(event.actions);
            }
            this.loading = false;
          }
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Error al cargar los datos del evento",
          });
          this.loading = false;
          this.$router.push({ name: "create_event" });
        });
    },

    showEventSummary() {
      this.enablePanels = true;
      this.panel = [];
    },

    onScrollSD(e) {
      if (typeof window === "undefined") return;
      const top = window.pageYOffset || e.target.scrollTop || 0;
      this.minHeader = top > 0;
    },
  },
};
</script>

<style>
.overflow-wrapper {
  padding-bottom: 15px;
  height: calc(100vh - 64px - 166px);
  overflow: auto;
}
.overflow-wrapper-mb {
  height: auto;
  overflow: hidden;
}
</style>
