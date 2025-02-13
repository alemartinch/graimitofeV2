<template>
  <div v-if="har.regulation.assessments.length" class="pb-4 mt-3">
    <div class="row justify-space-between align-items-center">
      <v-col class="align-items-center col-md-6 py-0">
        <v-autocomplete
          prepend-icon="mdi-factory"
          v-model="selectedFacility"
          :items="facilitiesNames.sort()"
          outlined
          dense
          chips
          clearable
          deletable-chips
          small-chips
          class="d-flex"
          :disabled="facilitiesNames.length === 1"
        >
        </v-autocomplete>
      </v-col>
      <v-spacer />
      <v-col class="col-auto">
        <t-btn-primary @click="newAssessment">
          <v-icon left>mdi-clipboard-edit-outline</v-icon>
          Nueva evaluación
        </t-btn-primary>
      </v-col>
    </div>
    <v-list v-if="selectedFacility">
      <AssessmentItem
        v-for="assessment in getAssessmentsGroupedByFacilities[selectedFacility]
          .assessments"
        :key="assessment.id"
        :assessment="assessment"
        class="mr-2 mb-2"
      />
    </v-list>
  </div>
  <div
    v-else
    class="fill-height d-flex flex-column justify-center align-center"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 167.84 194.68"
      width="10%"
      opacity="0.6"
    >
      <g id="Capa_2" data-name="Capa 2">
        <g id="Capa_1-2" data-name="Capa 1">
          <rect
            x="52.82"
            y="14.29"
            width="115.02"
            height="144"
            rx="12.07"
            style="fill: #2c677d"
          />
          <line
            x1="75.59"
            y1="49.54"
            x2="144.67"
            y2="49.54"
            style="
              fill: none;
              stroke: #fcfcfc;
              stroke-linecap: round;
              stroke-miterlimit: 10;
              stroke-width: 6px;
            "
          />
          <line
            x1="75.99"
            y1="67.92"
            x2="145.07"
            y2="67.92"
            style="
              fill: none;
              stroke: #fcfcfc;
              stroke-linecap: round;
              stroke-miterlimit: 10;
              stroke-width: 6px;
            "
          />
          <line
            x1="75.59"
            y1="86.29"
            x2="144.67"
            y2="86.29"
            style="
              fill: none;
              stroke: #fcfcfc;
              stroke-linecap: round;
              stroke-miterlimit: 10;
              stroke-width: 6px;
            "
          />
          <line
            x1="75.59"
            y1="104.66"
            x2="144.67"
            y2="104.66"
            style="
              fill: none;
              stroke: #fcfcfc;
              stroke-linecap: round;
              stroke-miterlimit: 10;
              stroke-width: 6px;
            "
          />
          <line
            x1="75.99"
            y1="123.03"
            x2="145.07"
            y2="123.03"
            style="
              fill: none;
              stroke: #fcfcfc;
              stroke-miterlimit: 10;
              stroke-width: 6px;
            "
          />
          <circle
            cx="67.87"
            cy="125.4"
            r="39.11"
            style="
              fill: #fff;
              stroke: #4d4d4d;
              stroke-linecap: round;
              stroke-miterlimit: 10;
              stroke-width: 10px;
            "
          />
          <line
            x1="40.93"
            y1="153.74"
            x2="5"
            y2="189.68"
            style="
              fill: none;
              stroke: #4d4d4d;
              stroke-linecap: round;
              stroke-miterlimit: 10;
              stroke-width: 10px;
            "
          />
          <polygon
            points="64.89 14.29 134.94 0 134.94 14.29 64.89 14.29"
            style="fill: #fead84"
          />
          <line
            x1="81.32"
            y1="113.36"
            x2="54.41"
            y2="140.26"
            style="
              fill: none;
              stroke: #dd642f;
              stroke-linecap: round;
              stroke-miterlimit: 10;
              stroke-width: 9px;
            "
          />
          <line
            x1="54.41"
            y1="113.36"
            x2="81.32"
            y2="140.26"
            style="
              fill: none;
              stroke: #dd642f;
              stroke-linecap: round;
              stroke-miterlimit: 10;
              stroke-width: 9px;
            "
          />
        </g>
      </g>
    </svg>
    <span class="mt-3">Sin evaluaciones realizadas</span>
    <v-btn plain text class="primary--text" @click="newAssessment"
      >Evaluar requerimiento
    </v-btn>
  </div>
</template>
<script>
import { mapGetters, mapState } from "vuex";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import AssessmentItem from "@/components/har-page/AssessmentItem.vue";

export default {
  name: "AssessmentsTable",
  components: { AssessmentItem, TBtnPrimary },
  data() {
    return {
      selectedFacility: "",
    };
  },

  computed: {
    ...mapState(["har"]),
    ...mapGetters("har", ["getAssessmentsByCurrency"]),

    assessments() {
      return this.har.regulation.assessments.map((assessment) => {
        if (!assessment.facility) {
          assessment.facility = { name: "Todos los establecimientos" };
        }
        return assessment;
      });
    },

    getAssessmentsGroupedByFacilities() {
      return this.assessments.reduce((acc, item) => {
        const facilityName = item.facility.name;
        if (!acc[facilityName]) {
          acc[facilityName] = { facilityName, assessments: [] };
        }
        this.selectedFacility = facilityName;
        acc[facilityName].assessments.push(item);
        return acc;
      }, {});
    },

    facilitiesNames() {
      return Object.keys(this.getAssessmentsGroupedByFacilities);
    },
  },

  methods: {
    newAssessment() {
      this.$router.push({
        name: `new-assessment-panel`,
      });
    },
  },
};
</script>
