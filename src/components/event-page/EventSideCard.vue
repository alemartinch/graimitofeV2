<template>
  <v-card flat height="auto" min-height="100%" class="pa-5" elevation="22">
    <div class="text-body-2">
      <span>Creado por: </span>
      <span class="font-weight-bold">
        {{ event.temp_event.originator | fullName }}
      </span>
      <span>el día: </span>
      <span class="font-weight-bold">
        {{ event.temp_event.added_date | fechaDiaMesAnio }}
      </span>
    </div>

    <div
      class="text-body-1 font-weight-medium mt-3"
      :style="{
        color: event.statuses[event.temp_event.status].color,
      }"
    >
      <span class="caption">Estado</span><br />
      {{ event.statuses[event.temp_event.status].name }}
      <v-menu
        v-if="isCertifiedEvent"
        bottom
        offset-y
        open-on-hover
        :close-on-content-click="false"
      >
        <template v-slot:activator="{ on }">
          <v-icon small color="accent" v-on="on"
            >mdi-file-certificate-outline</v-icon
          >
        </template>
        <v-card class="pa-2" width="300">
          <h4 class="caption font-weight-bold accent--text">
            EVENTO CERTIFICADO
          </h4>
          <p class="text-body-2">
            {{ event.temp_event.leader_comments || "Sin comentarios" }}
          </p>
        </v-card>
      </v-menu>
    </div>

    <v-divider class="my-5" />

    <v-chip-group
      v-show="isNotebook"
      v-model="navSelection"
      mandatory
      class="mb-5"
      active-class="primary--text"
    >
      <v-chip
        v-show="nav.enable"
        v-for="nav in navbar"
        :key="nav.key"
        :value="nav.key"
        label
        style="background-color: white; border: 1px solid #449cc9"
      >
        <v-icon left small color="#153240">{{ nav.icon }}</v-icon>
        {{ nav.name }}
      </v-chip>
    </v-chip-group>

    <EventSideCardInfo v-if="navSelection === 0" />
    <ParticipantsEventInfo v-if="navSelection === 1" />
    <EventSideCardResources v-if="navSelection === 2" />

    <v-divider class="my-5" v-if="!isNotebook" />

    <ParticipantsEventInfo v-if="!isNotebook" />

    <v-divider
      class="my-5"
      v-if="
        (event.temp_event.participants || event.temp_event.leader) &&
        !isNotebook
      "
    />

    <EventSideCardResources v-if="!isNotebook" />
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import ParticipantsEventInfo from "@/components/event-page/ParticipantsEventInfo.vue";
import EventSideCardInfo from "@/components/event-page/EventSideCardInfo.vue";
import EventSideCardResources from "@/components/event-page/EventSideCardResources.vue";
import {
  EVENT_ORIGINS as EO,
  EVENT_STATUSES as ES,
} from "@/mixins/globals";

export default {
  name: "EventSideCard",
  components: {
    EventSideCardResources,
    EventSideCardInfo,
    ParticipantsEventInfo,
  },

  props: {
    editable: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      navSelection: 0,
    };
  },

  computed: {
    ...mapState(["event"]),

    isCertifiedEvent() {
      return (
        this.event.temp_event.status === ES.CLOSE &&
        [EO.CRITICAL_EVENT, EO.EXTERNAL_AUD, EO.INTERNAL_AUD, EO.MEET].includes(
          this.event.temp_event.event_origin
        )
      );
    },

    navbar() {
      return [
        {
          name: "Información",
          icon: "mdi-information",
          key: 0,
          enable: true,
        },
        {
          name: "Participantes",
          icon: "mdi-account-box-multiple-outline",
          key: 1,
          enable:
            this.event.availableFields.participants ||
            this.event.availableFields.leader,
        },
        {
          name: "Recursos",
          icon: "mdi-file-document-multiple-outline",
          key: 2,
          enable: true,
        },
      ];
    },
  },
};
</script>
