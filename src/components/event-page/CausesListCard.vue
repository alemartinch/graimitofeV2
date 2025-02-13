<template>
  <v-card flat outlined>
    <v-card-title class="py-2 blue lighten-3">
      Causas
      <v-spacer />
      <t-btn-primary
        v-if="canAddCause()"
        :ripple="false"
        plain
        color="darkblue"
        @click="addCause"
      >
        <v-icon left small>mdi-plus</v-icon>
        <span class="caption"> Agregar causa </span>
      </t-btn-primary>
    </v-card-title>
    <v-card-text class="pa-0">
      <v-progress-linear v-if="cardLoading" indeterminate />
      <v-simple-table :dense="isNotebook" fixed-header :height="tableHeight">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                <span>ID</span>
              </th>
              <th class="text-left" v-if="!mobile">
                <span class="mdi mdi-family-tree mdi-rotate-180"></span>
              </th>
              <th>Descripción</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cause in causes"
              :key="cause.id"
              :class="isEmptyCause(cause)"
            >
              <td>{{ cause.id }}</td>
              <td v-if="!mobile">
                {{ parentName(cause.parent) }}{{ cause.parent.id }}
              </td>
              <td>
                <ExtendTooltip :text="cause.description" trunc-length="60" />
              </td>
              <td>
                <CauseResume
                  :cause="cause"
                  :key="cause.id"
                  v-on:close-causes-list="getEvent"
                />
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
    <v-dialog
      v-model="causeLoaderDialog"
      persistent
      max-width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
      transition="isMobile ? 'dialog-bottom-transition' : ''"
    >
      <CausesLoader @evt-close-dialog="getEvent" />
    </v-dialog>
  </v-card>
</template>

<script>
import { eatApi } from "@/apis";
import { mapGetters, mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import { EVENT_ORIGINS } from "@/mixins/globals";
import CauseResume from "@/components/event-page/CauseResume.vue";
import CausesLoader from "@/components/newevent-page/EventLoader/FcaLoader/CausesLoader.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "CausesListCard",
  components: { TBtnPrimary, ExtendTooltip, CausesLoader, CauseResume },
  mixins: [permissions],
  data() {
    return {
      cardLoading: false,
      causeLoaderDialog: false,
    };
  },
  computed: {
    ...mapState(["event"]),
    ...mapGetters("event", ["extractCauses"]),

    mobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    causes() {
      return this.extractCauses;
    },

    tableHeight() {
      return this.isNotebook ? 250 : 340;
    },
  },

  methods: {
    ...mapMutations("event", ["set_event"]),
    ...mapMutations("fca", ["set_parent"]),

    parentName(parent) {
      switch (parent.type) {
        case "finding":
          return "H";
        case "event":
          return "E";
        default:
          return "E";
      }
    },

    canAddCause() {
      return (
        !(
          this.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD
        ) && this.canPostAddCause()
      );
    },

    addCause() {
      this.set_parent({ type: "event", id: this.event.temp_event.id });
      this.causeLoaderDialog = true;
    },

    getEvent() {
      this.causeLoaderDialog = false;
      this.cardLoading = true;
      eatApi
        .getFetcher()
        .get(`events/full/${this.event.temp_event.id}`)
        .then((response) => {
          this.set_event(response.data.results);
          this.cardLoading = false;
        })
        .catch(() => {
          this.cardLoading = false;
        });
    },

    isEmptyCause(cause) {
      if (!cause.actions.length) {
        return "error";
      }
    },
  },
};
</script>

<style scoped></style>
