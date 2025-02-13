<template>
  <v-card v-if="fetchPendingEvents" class="pa-5">
    <v-progress-linear
      indeterminate
      color="primary"
      class="mb-0"
    ></v-progress-linear>
    Buscando eventos pendientes
  </v-card>
  <v-card v-else>
    <v-card-title class="text-body-2 text-md-body-1">
      Tienes {{ pendingEvents.length }} eventos pendientes de carga
    </v-card-title>
    <div class="pa-2">
      <v-alert
        v-if="disableNewEvent"
        type="error"
        dense
        text
        class="text-caption text-md-body-2"
      >
        Ha llegado al límite de eventos pendientes. Para continuar complete los
        eventos pendientes de carga o elimínelos.
      </v-alert>
      <v-list dense v-if="pendingEvents.length && !fetchPendingEvents">
        <v-list-item-group v-model="pendEvent" mandatory color="primary">
          <v-list-item v-for="(ev, i) in pendingEvents" :key="i" :value="ev">
            <v-list-item-content>
              <v-list-item-title
                ><span class="text-body-1"
                  >ID: {{ ev.id }} •
                  {{ event.eventOrigins[ev.event_origin].name }}</span
                ></v-list-item-title
              >
              <v-list-item-subtitle>
                <span class="font-weight-bold">Última modificación: </span>
                {{ ev.added_date | fechaDiaMesAnio }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-checkbox
        v-show="!isMobile"
        v-model="toggleShowPends"
        label="No mostrar"
        hide-details
        dense
      ></v-checkbox>
    </div>
    <v-card-actions>
      <div class="flex-grow-1"></div>
      <t-btn-delete @click="showPrompt = true" :disabled="!pendEvent"
        >Eliminar evento
      </t-btn-delete>
      <t-btn-primary
        @click="
          $router.push({ path: `/create_event/new_event/${pendEvent.id}` })
        "
        :disabled="
          !pendEvent || (isMobile && pendEvent.event_origin !== 'OBSV')
        "
      >
        Editar evento
      </t-btn-primary>
    </v-card-actions>
    <GlobalPrompt
      title="Eliminar evento"
      :active="showPrompt"
      prompt-type="alert"
    >
      <template v-slot:message>
        Se borrarán todos los datos del evento así cómo los hallazgos, causas,
        acciones y archivos relacionados al mismo.
      </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="alertButtonLoading"
          @click="showPrompt = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>

      <template v-slot:accept>
        <t-btn-delete :loading="alertButtonLoading" @click="deleteEvent">
          Eliminar evento
        </t-btn-delete>
      </template>
    </GlobalPrompt>
  </v-card>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import { eatApi } from "@/apis";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";

export default {
  name: "PendingEventsDialog",
  components: { TBtnSecondary, TBtnPrimary, TBtnDelete, GlobalPrompt },
  props: {
    fetchPendingEvents: {
      type: Boolean,
    },
  },
  data() {
    return {
      pendEvent: null,
      showPrompt: false,
      alertButtonLoading: false,
    };
  },
  computed: {
    ...mapState(["user", "event"]),
    pendingEvents() {
      return this.user.userPendingEvents;
    },
    toggleShowPends: {
      get() {
        return this.user.settings.showEventsPends;
      },
      set(value) {
        this.set_settings({ showEventsPends: value });
      },
    },
    disableNewEvent() {
      return this.user.userPendingEvents.length >= 5;
    },
  },
  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("user", ["del_pending_event", "set_settings"]),

    deleteEvent() {
      this.alertButtonLoading = true;
      eatApi
        .getFetcher()
        .delete("events/" + this.pendEvent.id)
        .then(() => {
          this.alertButtonLoading = false;
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Evento eliminado",
          });
          this.del_pending_event(this.pendEvent.id);
          this.showPrompt = false;
          if (!this.pendingEvents.length) this.$emit("close-dialog");
        })
        .catch((e) => {
          this.alertButtonLoading = false;
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `No pudo eliminarse el evento, error: ${e}`,
          });
          this.showPrompt = false;
        });
    },
  },
};
</script>
