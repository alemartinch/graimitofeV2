<template>
  <v-card outlined flat>
    <v-card-title class="py-2 green lighten-3">
      Hallazgos
      <v-spacer />
      <t-btn-primary
        v-if="canPostAddFinding()"
        :ripple="false"
        plain
        color="#0f420f"
        :disabled="
          event.temp_event.event_origin === 'OBSV' && fca.findings.length >= 1
        "
        @click="
          newFindingDialog = true;
          set_parent(event.temp_event);
        "
      >
        <v-icon left small>mdi-plus</v-icon>
        <span class="caption"> Agregar hallazgo </span>
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
              <th>Descripción</th>
              <th>Tipo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="finding in findings"
              :key="finding.id"
              :class="isEmptyFinding(finding)"
            >
              <td>{{ finding.id }}</td>
              <td>
                <ExtendTooltip :text="finding.description" trunc-length="80" />
              </td>
              <td>
                {{ finding.deviation || "No aplica" }}
              </td>
              <td>
                <FindingResume
                  :finding="finding"
                  :key="`f${finding.id}`"
                  v-on:close-findings-list="getEvent"
                />
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
    <v-dialog
      v-model="newFindingDialog"
      persistent
      max-width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
      transition="isMobile ? 'dialog-bottom-transition' : ''"
    >
      <FindingsLoader
        :edit-finding="false"
        @evt-close-dialog="
          newFindingDialog = false;
          getEvent();
        "
      />
    </v-dialog>
  </v-card>
</template>

<script>
import { eatApi } from "@/apis";
import { mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import FindingResume from "@/components/event-page/FindingResume.vue";
import FindingsLoader from "@/components/newevent-page/EventLoader/FcaLoader/FindingsLoader.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "FindingListCard",
  components: { TBtnPrimary, ExtendTooltip, FindingsLoader, FindingResume },
  mixins: [permissions],
  data() {
    return {
      cardLoading: false,
      newFindingDialog: false,
    };
  },
  computed: {
    ...mapState(["event"]),
    findings() {
      return this.event.temp_event.findings;
    },
    tableHeight() {
      return this.$vuetify.breakpoint.mdAndDown ? 250 : 340;
    },
  },
  methods: {
    ...mapMutations("event", ["set_event"]),
    ...mapMutations("fca", ["set_parent"]),

    getEvent() {
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

    isEmptyFinding(finding) {
      if (!(finding.actions.length || finding.causes.length)) {
        return "error";
      }
    },
  },
};
</script>

<style scoped></style>
