<template>
  <div class="pa-5 d-flex flex-column align-start">
    <div class="text-caption">
      <span
        class="text-decoration-none"
        style="cursor: pointer"
        @click="goToParentEvent"
        >EVENTO {{ tEvent.id }} ({{
          event.eventOrigins[tEvent.event_origin].abbr
        }})</span
      >
      <v-menu
        v-if="fca.temp_action.finding"
        open-on-hover
        open-delay="500"
        max-width="500"
        nudge-top="10"
        nudge-right="5"
      >
        <template v-slot:activator="{ on }">
          <span v-on="on">{{
            ` / HALLAZGO ${fca.temp_action.finding.id}`
          }}</span>
        </template>
        <v-card class="pa-2 text-body-2" outlined>
          <span class="text-caption"
            >HALLAZGO {{ fca.temp_action.finding.id }}</span
          >
          <p>{{ fca.temp_action.finding.description }}</p>
        </v-card>
      </v-menu>
      <v-menu
        v-if="fca.temp_action.cause"
        open-on-hover
        open-delay="500"
        max-width="500"
        nudge-top="10"
        nudge-right="5"
      >
        <template v-slot:activator="{ on }">
          <span v-on="on">{{ ` / CAUSA ${fca.temp_action.cause.id}` }}</span>
        </template>
        <v-card class="pa-2 text-body-2" outlined>
          <span class="text-caption">CAUSA {{ fca.temp_action.cause.id }}</span>
          <p>{{ fca.temp_action.cause.description }}</p>
        </v-card>
      </v-menu>
      <span class="font-weight-medium">{{
        ` / ACCIÓN ${fca.temp_action.id}`
      }}</span>
    </div>
    <div class="text-subtitle-1 font-weight-medium" style="width: 100%">
      <ExtendTooltip :text="fca.temp_action.description" :trunc-length="120" />
      <v-menu
        ref="newDescriptionMenu"
        bottom
        :close-on-content-click="false"
        max-width="300"
        nudge-left="150"
        nudge-bottom="30"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-if="event.postEdit && canPostEditAction()"
            icon
            plain
            small
            color="primary"
            :ripple="false"
            v-on="on"
          >
            <v-icon>mdi-pencil-outline mdi-18px</v-icon>
          </v-btn>
        </template>
        <v-card class="pa-2" width="300" outlined>
          <v-form v-model="valid">
            <v-textarea
              v-model="newActionDescription"
              class="text-body-2 pt-0"
              :rules="descriptionRules"
              :rows="newActionDescription.length / 40"
              auto-grow
              autofocus
              @input="formUpdated = true"
            />
          </v-form>
          <div class="pa-1 d-flex justify-end">
            <v-btn
              small
              text
              color="primary"
              :loading="loading.actionDescription"
              :disabled="!valid || !formUpdated"
              @click="updateActionDescription"
              >guardar</v-btn
            >
          </div>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import { INPUTS_LENGTH } from "@/mixins/globals";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";

export default {
  name: "ActionResumeHeader",
  mixins: [permissions],
  components: { ExtendTooltip },

  data() {
    return {
      valid: false,
      formUpdated: false,
      newActionDescription: "",
      loading: { actionDescription: false },
      descriptionRules: [
        (v) =>
          (v.length <= INPUTS_LENGTH.ACTION_DESCRIPTION && v.length > 0) ||
          `Max ${INPUTS_LENGTH.ACTION_DESCRIPTION} caracteres`,
      ],
    };
  },

  created() {
    this.newActionDescription = this.getCurrentAction.description;
  },

  computed: {
    ...mapState(["fca", "event"]),

    currentAction() {
      return this.$store.getters["fca/getCurrentAction"];
    },

    tEvent() {
      return this.fca.temp_action.parent_event || this.event.temp_event;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapActions("fca", ["update_action"]),

    goToParentEvent() {
      if (!this.isMobile) {
        this.$router.push({
          path: `/events/eventinfo/${this.tEvent.id}`,
        });
      }
    },

    updateActionDescription() {
      this.$refs.newDescriptionMenu.save();
      this.loading.actionDescription = true;
      this.update_action({ description: this.newActionDescription })
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "La acción ha sido actualizada con éxito",
          });
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al actualizar la acción",
          });
        })
        .finally(() => (this.loading.actionDescription = false));
    },
  },
};
</script>
