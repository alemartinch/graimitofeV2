<template>
  <div style="height: 100%">
    <AppSpinner v-if="loading.fetchEventData" />
    <EventLayout v-else>
      <template v-slot:header>
        <div class="pa-5 pb-0">
          <div class="d-flex align-center">
            <span class="text-h6 text-md-body-1 d-flex">
              EVENTO {{ event.temp_event.id }} /
              <span class="text-body-1 font-weight-medium"
                >{{ getOriginName.toUpperCase() }}
              </span>
              <EventTags resumeflagTag="true"></EventTags>
            </span>
            <v-spacer />
            <v-menu
              bottom
              nudge-bottom="40"
              nudge-left="60"
              :close-on-content-click="false"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  v-if="apisEnabled.includes('reports')"
                  icon
                  plain
                  small
                  color="primary"
                  :ripple="false"
                >
                  <v-icon>mdi-file-download-outline</v-icon>
                </v-btn>
              </template>
              <v-card class="pa-2 d-flex flex-column align-start">
                <v-btn
                  @click="downloadEventReport('xlsx')"
                  text
                  small
                  color="primary"
                  :loading="loading.downloadReport.csv"
                >
                  <v-icon left color="#43A047">mdi-file-excel-outline</v-icon>
                  descargar excel
                </v-btn>
                <v-btn
                  @click="downloadEventReport('pdf')"
                  text
                  small
                  color="primary"
                  :loading="loading.downloadReport.pdf"
                >
                  <v-icon left color="#E57373">mdi-file-document</v-icon>
                  descargar pdf
                </v-btn>
              </v-card>
            </v-menu>
            <span v-for="btn in actionsBtns" :key="btn.name">
              <t-btn-icon
                v-if="btn.visible"
                :color="btn.color"
                :tooltip="btn.tooltip"
                bottom-tooltip
                @click="btn.action()"
              >
                {{ btn.icon }}
              </t-btn-icon>
            </span>
          </div>
          <div
            class="d-flex align-center"
            v-if="event.temp_event.event_origin !== 'OBSV'"
          >
            <span class="text-h6 mt-3">{{ event.temp_event.summary }}</span>
          </div>
          <v-chip-group
            v-model="selection"
            mandatory
            class="mt-10"
            active-class="primary--text font-weight-medium"
          >
            <v-chip
              v-for="nav in navbar"
              :key="nav.key"
              :value="nav.key"
              label
              v-show="!nav.disabled"
              style="background-color: white; border: 1px solid #449cc9"
            >
              {{ nav.name }}
            </v-chip>
          </v-chip-group>
        </div>
      </template>
      <template v-slot:content>
        <div class="d-flex flex-column pa-5" style="height: 100%">
          <FcaEventInfo v-if="selection === 0" />
          <v-card v-else class="pa-5 flex-grow-1" flat outlined height="100%">
            <p class="text-body-2" style="white-space: pre-wrap">
              {{ event.temp_event.description }}
            </p>
          </v-card>
        </div>
      </template>
      <template v-slot:side>
        <EventInfoCard :editable="enablePostEdit && canEditParticipants()" />
      </template>
    </EventLayout>

    <SelectableTagDialog
      v-if="showTagsDialog"
      v-on:close-tags-dialog="
        showTagsDialog = false;
        getEvent;
      "
    />

    <!-- ALERTA DE ELIMINACIÓN DE EVENTO -->
    <GlobalPrompt
      title="Eliminar evento"
      :active="alertDialog"
      prompt-type="alert"
    >
      <template v-slot:message>
        Se borrarán todos los datos del evento así cómo los hallazgos, causas,
        acciones y archivos relacionados al mismo.
      </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="loading.alertBtn"
          @click="alertDialog = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>

      <template v-slot:accept>
        <t-btn-delete :loading="loading.alertBtn" @click="deleteEvent">
          Eliminar evento
        </t-btn-delete>
      </template>
    </GlobalPrompt>
    <!-- DIÁLOGO DE EDICIÓN DE EVENTO -->
    <EditEventDialog
      v-if="showEditEventDialog"
      v-on:close-dialog="
        showEditEventDialog = false;
        refreshEvent();
      "
    />
    <EventCertificationComment
      v-if="showCertifyCommentDialog"
      v-on:close-dialog="showCertifyCommentDialog = false"
      v-on:certify-event="
        showCertifyCommentDialog = false;
        certifyEvent();
      "
    />
    <RouterView v-on:close-action-resume="refreshEvent" />
  </div>
</template>

<script>
import AppSpinner from "@/components/app-page/AppSpinner.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import eventInfo from "@/views/EventsPanel/mixins/eventInfo";
import EventLayout from "@/Layouts/EventLayout.vue";
import EventInfoCard from "@/components/event-page/EventSideCard.vue";
import FcaEventInfo from "@/views/EventsPanel/FcaEventInfo.vue";
import { mapGetters } from "vuex";
import EditEventDialog from "@/views/EventsPanel/EditEventDialog.vue";
import { EVENT_ORIGINS } from "@/mixins/globals";
import EventCertificationComment from "@/views/EventsPanel/EventCertificationComment.vue";
import EventTags from "@/components/event-page/EventTags.vue";
import SelectableTagDialog from "@/components/newevent-page/EventLoader/SelectableTagDialog.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";

export default {
  name: "EventInfo",
  components: {
    TBtnDelete,
    TBtnSecondary,
    TBtnIcon,
    SelectableTagDialog,
    EventCertificationComment,
    EditEventDialog,
    FcaEventInfo,
    EventInfoCard,
    EventLayout,
    AppSpinner,
    GlobalPrompt,
    EventTags,
  },

  mixins: [eventInfo],

  data() {
    return {
      selection: null,
      showEditEventDialog: false,
      showCertifyCommentDialog: false,
    };
  },

  created() {
    this.getEvent();
  },

  computed: {
    ...mapGetters("event", ["getFcaPanelTitle"]),

    isEventLocked() {
      return this.event.temp_event.restricted;
    },

    actionsBtns() {
      return [
        {
          icon: "mdi-tag-multiple-outline",
          tooltip: "Agregar etiqueta",
          color: "primary",
          action: () => (this.showTagsDialog = true),
          visible: this.canEditEventTags(),
        },
        {
          icon: this.isEventLocked ? "mdi-lock" : "mdi-lock-open",
          tooltip: this.isEventLocked
            ? "Desbloquear evento"
            : "Restringir evento.<br/>" +
              "El evento, una vez guardado, sólo podrá ser visualizado<br/> " +
              "por el originador, el líder, los participantes y el SME.",
          color: this.isEventLocked ? "error" : "primary",
          action: this.onBlockEvent,
          visible: this.canEditRestrictedField(),
        },
        {
          name: "Certificar evento",
          icon: "mdi-file-certificate-outline",
          color: "primary",
          tooltip: "Certificar evento",
          action: () => (this.showCertifyCommentDialog = true),
          visible: this.canCertifyEvent(),
        },
        {
          name: "Editar evento",
          icon: "mdi-pencil-outline",
          color: "primary",
          tooltip: "Editar evento",
          action: () => (this.showEditEventDialog = true),
          visible:
            this.canPostEditEvent() &&
            this.event.temp_event.event_origin !== EVENT_ORIGINS.OBSERVATION,
        },
        {
          name: "Eliminar evento",
          icon: "mdi-delete-outline",
          color: "primary",
          tooltip: "Eliminar evento",
          action: () => (this.alertDialog = true),
          visible: this.canPostDeleteEvent(),
        },
      ];
    },

    navbar() {
      return [
        {
          name: this.getFcaPanelTitle,
          key: 0,
          disabled: false,
        },
        {
          name: "Descripción",
          key: 1,
          disabled: !this.event.availableFields.description,
        },
      ];
    },
  },
};
</script>

<style scoped>
.divider {
  border-width: 1px;
  width: 300px;
  margin-top: 16px;
}
</style>
