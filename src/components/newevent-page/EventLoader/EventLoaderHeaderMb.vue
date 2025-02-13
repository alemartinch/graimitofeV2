<template>
  <v-app-bar color="white" fixed height="72px">
    <v-app-bar-title
      ><span class="text-body-2"
        >NUEVO EVENTO
        <strong style="color: #44cc7b">ID{{ event.temp_event.id }}</strong>
      </span>
      <br />
      <span class="text-h5">{{ getOriginName }}</span></v-app-bar-title
    >

    <v-spacer />

    <v-btn
      text
      color="primary"
      @click="saveEvent"
      :loading="saveEventLoading"
      :disabled="!isValidAllStep"
    >
      guardar
    </v-btn>

    <v-menu offset-y>
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" icon>
          <v-icon size="30">mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="error--text" @click="alertDialog = true"
              >Eliminar</v-list-item-title
            >
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </v-menu>
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
  </v-app-bar>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import validateEventSteps from "@/components/newevent-page/EventLoader/validateEventSteps";
import saveEvent from "@/components/newevent-page/EventLoader/saveEvent";
import deleteEvent from "@/components/newevent-page/EventLoader/deleteEvent";

export default {
  name: "EventLoaderHeaderMb",
  components: {
    GlobalPrompt,
  },
  mixins: [validateEventSteps, saveEvent, deleteEvent],
  data() {
    return {
      alertDialog: false,
    };
  },
  computed: {
    ...mapState(["user", "event"]),
    ...mapGetters("event", ["getOriginName"]),
  },
};
</script>

<style scoped>
.v-sheet.v-app-bar.v-toolbar:not(.v-sheet--outlined) {
  box-shadow: 0 1px 10px 0 rgba(0, 0, 0, 0.12);
}
</style>
