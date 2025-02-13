<template>
  <v-card flat outlined class="flex-grow-1">
    <v-card-title class="pa-0"><slot name="card-header"></slot></v-card-title>
    <v-tabs v-model="tab" height="35" grow>
      <v-tabs-slider color="success"></v-tabs-slider>
      <v-tab
        v-for="finding in getFindingsOrdered"
        :key="finding.id"
        class="caption green--text"
      >
        HALLAZGO {{ finding.id }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" style="overflow: auto" class="contenedor">
      <v-tab-item v-for="finding in getFindingsOrdered" :key="finding.id">
        <v-card flat class="d-flex flex-column justify-space-between">
          <div class="pa-3">
            <div v-if="event.temp_event.event_origin !== 'OBSV'" class="my-2">
              <span class="font-weight-bold text-body-2">Desvío:</span><br />
              <span class="text-body-2">{{ getDevName(finding) }}</span>
            </div>
            <div v-if="finding.behavioral">
              <span class="font-weight-bold"
                >Este hallazgo está relacionado a una observación de
                conducta</span
              >
            </div>
            <div class="text-body-2">
              <span class="font-weight-bold">Descripción: </span><br />
              <ExtendTooltip :text="finding.description" trunc-length="200" />
            </div>
          </div>
          <!--          <v-card-actions>-->
          <!--            <slot-->
          <!--              name="actions"-->
          <!--              v-bind:finding="finding"-->
          <!--              v-bind:index="index"-->
          <!--            ></slot>-->
          <!--          </v-card-actions>-->
          <ActionICard
            v-if="
              finding.actions
                ? finding.actions.length
                : searchActionsFinding(finding.id)
            "
            :actions="finding.actions || searchActionsFinding(finding.id)"
            :parent="{ type: 'finding', id: finding.id }"
            :loader="loader"
            :key="finding.id"
          />
          <CauseICard v-else :causes="finding.causes" parent />
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>
<script>
import { mapGetters, mapState } from "vuex";
import ActionICard from "@/components/event-page/ActionICard.vue";
import CauseICard from "@/components/event-page/CauseICard.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import { EVENT_ORIGINS } from "@/mixins/globals";

export default {
  name: "FindingICard",
  components: { ExtendTooltip, CauseICard, ActionICard },
  props: {
    loader: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showFindingActions: false,
      showCauseActions: false,
      tab: null,
      tab2: null,
      tabCauses: null,
    };
  },

  computed: {
    ...mapState(["event", "fca"]),

    ...mapGetters("fca", ["searchCausesFinding", "searchActionsFinding"]),

    getFindingsOrdered() {
      let findings = this.loader
        ? this.fca.findings
        : this.event.temp_event.findings;
      // if (this.event.temp_event.findings && !this.fca.findings.length) {
      //   findings = this.event.temp_event.findings;
      // }
      return findings?.sort((a, b) => {
        return a.id - b.id;
      });
    },
  },

  methods: {
    getDevName(finding) {
      if (finding.deviation) {
        if (finding.deviation === "OM") {
          return "Oportunidad de mejora";
        } else if (finding.deviation === "NC") {
          return "No conformidad";
        } else {
          return "No conformidad mayor";
        }
      } else {
        return "";
      }
    },

    showActionDetail(actionId) {
      this.$router.push({ path: `/actions/${actionId}` });
    },

    getChild(finding) {
      if (finding.actions && finding.actions.length) {
        return { name: "Acciones", length: finding.actions.length };
      } else if (finding.causes && finding.causes.length) {
        return { name: "Causas", length: finding.causes.length };
      } else if (
        this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION
      ) {
        return {
          name: "Acciones",
          length: this.searchActionsFinding(finding.id).length,
        };
      } else {
        return {
          name: "Causas",
          length: this.searchCausesFinding(finding.id).length,
        };
      }
    },
  },
};
</script>

<style scoped>
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-thumb {
  width: 5px;
  border-radius: 10px;
  background: #449cc9;
}
.contenedor {
  scrollbar-width: thin;
}
</style>
