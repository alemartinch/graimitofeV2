<template>
  <v-container fluid class="ma-0 pa-0">
    <v-row class="ma-0 pa-0 flex-row-reverse">
      <v-col>
        <v-btn
          color="primary"
          :small="!mobile"
          depressed
          @click="showNewEventSummDialog = true"
          :disabled="!isValidAllStep"
          >guardar evento
        </v-btn>
      </v-col>
      <v-col
        cols="auto"
        class="px-1"
        v-for="(button, index) in eventBtns"
        :key="index"
      >
        <t-btn-icon
          :tooltip="button.tooltip"
          @click="button.action"
          :color="button.color"
          :disabled="button.disabled"
        >
          {{ button.icon }}
        </t-btn-icon>
      </v-col>
    </v-row>

    <v-fab-transition v-if="false">
      <v-speed-dial
        v-show="floatBtn"
        v-model="fabBtn"
        fixed
        right
        bottom
        direction="top"
        transition="slide-y-reverse-transition"
        v-scroll="onScrollSD"
      >
        <template v-slot:activator>
          <v-btn v-model="fabBtn" color="blue darken-2" dark fab>
            <v-icon v-if="fabBtn">mdi-close</v-icon>
            <v-icon v-else>mdi-menu</v-icon>
          </v-btn>
        </template>
        <v-btn fab dark small color="red" @click="alertDialog = true">
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
        <v-btn fab dark small color="indigo" @click="triggerFile">
          <v-icon>mdi-attachment</v-icon>
        </v-btn>
        <v-btn
          fab
          small
          color="green"
          :disabled="!isValidAllStep"
          @click="showNewEventSummDialog = true"
        >
          <v-icon color="white">mdi-content-save</v-icon>
        </v-btn>
      </v-speed-dial>
    </v-fab-transition>

    <input
      v-if="$vuetify.breakpoint.smAndDown"
      ref="inputfile"
      onchange="cambiar()"
      type="file"
      capture="camera"
      style="display: none"
    />

    <v-dialog
      v-model="showNewEventSummDialog"
      max-width="600"
      scrollable
      :fullscreen="mobile"
      transition="isMobile ? 'dialog-bottom-transition' : ''"
    >
      <NewEventSummary v-on:evt-close-dialog="showNewEventSummDialog = false" />
    </v-dialog>

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
        <v-btn
          text
          color="secondary"
          :disabled="deleteEventLoading"
          elevation="0"
          @click="alertDialog = false"
        >
          Cancelar
        </v-btn>
      </template>
      <template v-slot:accept>
        <v-btn
          color="error"
          :loading="deleteEventLoading"
          depressed
          text
          @click="deleteEvent"
        >
          Eliminar evento
        </v-btn>
      </template>
    </GlobalPrompt>

    <!-- ATTACH FILES -->
    <v-dialog
      v-model="showAttachDialog"
      :max-width="isMobile ? 600 : 800"
      persistent
      scrollable
    >
      <AttachFiles v-on:evt-close-attach="showAttachDialog = false" />
    </v-dialog>

    <!--  TAGS DIALOG    -->
    <SelectableTagDialog
      v-if="showTagsDialog"
      v-on:close-tags-dialog="showTagsDialog = false"
    />
  </v-container>
</template>
<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import deleteEvent from "@/components/newevent-page/EventLoader/deleteEvent";
import validateEventSteps from "@/components/newevent-page/EventLoader/validateEventSteps";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import NewEventSummary from "@/components/newevent-page/EventLoader/NewEventSummary.vue";
import AttachFiles from "@/components/newevent-page/EventLoader/AttachFiles.vue";
import SelectableTagDialog from "@/components/newevent-page/EventLoader/SelectableTagDialog.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import store from "@/store";

export default {
  name: "EventLoaderBtns",
  components: {
    TBtnIcon,
    SelectableTagDialog,
    GlobalPrompt,
    NewEventSummary,
    AttachFiles,
  },

  mixins: [permissions, validateEventSteps, deleteEvent],

  data() {
    return {
      alertDialog: false,
      fabBtn: false,
      fab: false,
      floatBtn: false,
      showAttachDialog: false,
      showNewEventSummDialog: false,
      showTagsDialog: false,
      isEventLocked: false,
    };
  },

  computed: {
    ...mapState(["event", "fca"]),
    ...mapGetters("fca", [
      "findingsWithoutCauses",
      "causesWithoutActions",
      "findingsWithoutActions",
      "findings_nc_ncm",
      "findings_om",
    ]),

    ...mapGetters("event", ["getEventTags"]),

    eventBtns() {
      return [
        {
          icon: "mdi-delete-outline",
          tooltip: "Eliminar evento",
          color: "primary",
          action: () => (this.alertDialog = true),
        },
        {
          icon: "mdi-attachment mdi-rotate-270",
          tooltip: `Adjuntar archivo (${this.event.temp_event.files.length})`,
          color: "primary",
          action: () => (this.showAttachDialog = true),
        },
        {
          disabled: store.getters["user/currentUserRoles"].includes("BASE")
            ? true
            : false,
          icon: this.isEventLocked ? "mdi-lock" : "mdi-lock-open",
          tooltip: this.isEventLocked
            ? "Desbloquear evento"
            : "Restringir evento.<br/>" +
              "El evento, una vez guardado, sólo podrá ser visualizado<br/> " +
              "por el originador, el líder, los participantes y el SME.",
          color: this.isEventLocked ? "error" : "primary",
          action: this.onBlockEvent,
        },
        {
          icon: "mdi-tag-multiple-outline",
          tooltip: "Agregar etiqueta",
          color: "primary",
          action: () => (this.showTagsDialog = true),
        },
      ];
    },

    mobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },
  },
  methods: {
    ...mapActions("event", ["update_event"]),
    ...mapMutations("event", ["SET_RESTRICTED_EVENT"]),
    ...mapActions(["set_alert"]),
    triggerFile() {
      this.$refs.inputfile.click();
    },

    onScrollSD(e) {
      if (typeof window === "undefined") return;
      const top = window.pageYOffset || e.target.scrollTop || 0;
      this.floatBtn = top > 100;
    },

    onBlockEvent() {
      this.isEventLocked = !this.isEventLocked;
      this.SET_RESTRICTED_EVENT(this.isEventLocked);
      this.update_event().then();
    },
  },
};
</script>

<style scoped>
.v-speed-dial--bottom {
  bottom: 75px;
}
</style>
