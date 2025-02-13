<template>
  <v-list-item
    class="my-2 pa-2 elevation-22"
    :style="{
      'border-radius': '4px',
    }"
  >
    <v-col
      cols="2"
      class="pa-0 d-flex flex-column align-start align-self-start"
      style="width: 150px"
    >
      <span class="caption text--secondary"
        ><v-icon small color="primary" style="opacity: 0.6" class="mr-2">
          {{ regulation.tier !== "INT" ? "mdi-scale-balance" : "mdi-factory" }}
        </v-icon>
        R{{ regulation.id }}</span
      >
      <span class="caption text--disabled ml-7">
        {{ har.tiers[regulation.tier].toUpperCase() }}
        <span v-if="regulation.authority"
          >- ({{ regulation.authority.name }})</span
        >
      </span>
      <span class="text-body-2 ml-7">{{ regulation.regulation_code }}</span>
    </v-col>
    <v-divider vertical class="mx-5" />
    <v-col cols="5" class="text-body-2 pa-0">
      <extend-tooltip :text="regulation.subject" trunc-length="100" />
    </v-col>
    <v-divider vertical class="mx-5" />
    <v-col
      v-if="regulation.assessments.length"
      cols="2"
      class="d-flex flex-column align-self-start pa-0"
    >
      <span class="caption">Evaluaciones vigentes:</span>
      <template v-if="regulation.assessments.length < 4">
        <div
          v-for="assessment in regulation.assessments"
          :key="assessment.id"
          class="caption"
        >
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon
                size="19"
                :color="complianceIcons[assessment.compliance].color"
                class="mr-1"
                v-on="on"
                >{{ complianceIcons[assessment.compliance].icon }}
              </v-icon>
            </template>
            {{ complianceIcons[assessment.compliance].name }}
          </v-tooltip>
          -
          {{ assessment.facility.name }}
        </div>
      </template>
      <template v-else class="d-flex">
        <div class="d-block align-items-center">
          <v-tooltip left>
            <template v-slot:activator="{ on }">
              <v-icon size="15" class="mr-1" v-on="on">mdi-factory </v-icon>
            </template>
            <span>
              <div v-for="(item, index) in moreAssessment" :key="index">
                {{ item }}
              </div>
            </span>
          </v-tooltip>
          <span
            class="text-body-2"
            style="cursor: pointer"
            @click="goToRegulationPage()"
            >- Muchos establecimientos</span
          >
        </div>
      </template>
    </v-col>
    <v-col v-else cols="2" class="pa-0">
      <span class="caption">SIN EVALUACIONES</span>
      <t-btn-icon small tooltip="Evaluar" @click="newAssessment"
        >mdi-clipboard-edit-outline</t-btn-icon
      >
    </v-col>
    <v-spacer />
    <v-divider vertical class="ml-5" />
    <v-col class="pa-0 text-center">
      <t-btn-icon tooltip="Ver resumen" @click="openResumeReg()">
        mdi-eye-outline
      </t-btn-icon>
      <t-btn-icon tooltip="Ampliar" @click="goToRegulationPage()">
        mdi-book-open
      </t-btn-icon>
    </v-col>
  </v-list-item>
</template>
<script>
import { mapState } from "vuex";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "RegulationItem",
  components: { TBtnIcon, ExtendTooltip },
  props: {
    regulation: {
      type: Object,
      required: true,
    },
  },
  created() {},
  computed: {
    ...mapState(["har"]),
    complianceIcons() {
      const nameToIcon = {};
      for (const key in this.har.assessmentResults) {
        const { icon, keys, color, name } = this.har.assessmentResults[key];
        nameToIcon[keys] = { icon: icon, keys: keys, color: color, name: name };
      }
      return nameToIcon;
    },
    moreAssessment() {
      return this.regulation.assessments.map((assessment) => {
        return assessment.facility.name;
      });
    },
    // compliaceColor() {
    //   const nameToIconColor = {};
    //   for (const key in this.har.assessmentResults) {
    //     const { name, color } = this.har.assessmentResults[key];
    //     nameToIconColor[name] = color;
    //   }
    //   return nameToIconColor;
    // },
  },

  methods: {
    openResumeReg() {
      this.$router.push({
        name: `regulation-resume`,
        query: { id: this.regulation.id },
      });
    },

    goToRegulationPage() {
      this.$router.push({ path: `/har/regulations/${this.regulation.id}` });
    },

    newAssessment() {
      this.$router.push({
        path: `/har/regulations/${this.regulation.id}/new-assessment-panel`,
      });
    },
  },
};
</script>
<style></style>
