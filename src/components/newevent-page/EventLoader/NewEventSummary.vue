<template>
  <v-card>
    <v-card-title> EVENTO {{ event.temp_event.id }} </v-card-title>
    <v-card-text>
      <div class="mb-1">
        <span class="font-weight-bold">Origen: </span
        ><span class="body-1">{{ getOriginName }}</span>
      </div>
      <div class="mb-1">
        <span class="font-weight-bold">Originador: </span
        ><span class="body-1">{{
          event.temp_event.originator | fullName
        }}</span>
      </div>
      <div v-if="event.temp_event.process_areas[0]" class="mb-1">
        <span class="font-weight-bold">Área de gestión: </span
        ><span class="body-1">{{
          event.temp_event.process_areas[0].name
        }}</span>
      </div>
      <div v-if="event.temp_event.facility" class="mb-1">
        <span class="font-weight-bold">Establecimiento: </span
        ><span class="body-1">{{ event.temp_event.facility.name }}</span>
      </div>
      <div v-if="event.temp_event.sector" class="mb-1">
        <span class="font-weight-bold">Sector: </span
        ><span class="body-1">{{ event.temp_event.sector.name }}</span>
      </div>
      <div v-if="event.temp_event.occurrence_date" class="mb-1">
        <span class="font-weight-bold">Ocurrencia: </span
        ><span class="body-1"
          >{{ event.temp_event.occurrence_date | fechaDiaMesAnio }}
          {{ event.temp_event.occurrence_time }}</span
        >
      </div>

      <div v-if="event.temp_event.tags" class="mb-1 d-flex">
        <span class="font-weight-bold">Etiquetas: </span>
        <EventTags resumeflagTag="true"></EventTags>
      </div>

      <br />
      <div v-if="event.temp_event.summary" class="mb-1">
        <span class="font-weight-bold">Resumen: </span
        ><span>{{ event.temp_event.summary }}</span>
      </div>
      <div v-if="event.temp_event.description" class="mb-1">
        <span class="font-weight-bold">Descripción: </span
        ><span style="white-space: pre-wrap">{{
          event.temp_event.description
        }}</span>
      </div>
      <br />
      <div v-if="event.temp_event.leader" class="mb-1">
        <span class="font-weight-bold">Líder: </span
        ><span class="body-1">{{ event.temp_event.leader | fullName }}</span>
      </div>
      <div v-if="event.temp_event.participants.length" class="mb-1">
        <span class="font-weight-bold">Participantes: </span
        ><span class="body-1">{{ participantsList }}</span>
      </div>
      <v-divider />
      <div v-if="event.temp_event.equipment_category" class="mb-1">
        <span class="font-weight-bold">Equipo: </span
        ><span class="body-1">{{
          event.temp_event.equipment_category.name
        }}</span>
      </div>
      <div v-if="event.temp_event.equipment_id" class="mb-1">
        <span class="font-weight-bold">ID: </span
        ><span class="body-1">{{ event.temp_event.equipment_id }}</span>
      </div>
      <div v-if="event.temp_event.equipment_description" class="mb-1">
        <span class="font-weight-bold">Descripción: </span
        ><span>{{ event.temp_event.equipment_description }}</span>
      </div>
    </v-card-text>
    <v-card-actions class="text-right">
      <v-spacer />
      <t-btn-secondary
        :disabled="saveEventLoading"
        @click="$emit('evt-close-dialog')"
        >CANCELAR</t-btn-secondary
      >
      <t-btn-primary :loading="saveEventLoading" @click="saveEvent"
        >CONFIRMAR</t-btn-primary
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import saveEvent from "@/components/newevent-page/EventLoader/saveEvent";
import EventTags from "@/components/event-page/EventTags.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "NewEventSummary",
  components: { TBtnPrimary, TBtnSecondary, EventTags },
  mixins: [saveEvent],
  computed: {
    ...mapState(["event"]),

    ...mapGetters("event", ["getOriginName", "participantsList"]),

    mobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
  },
};
</script>
