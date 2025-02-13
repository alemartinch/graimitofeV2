<template>
  <v-hover v-slot:default="{ hover }" v-ripple="false">
    <v-card
      class="pa-2 d-flex flex-column"
      :elevation="hover ? 2 : 0"
      outlined
      :style="{
        cursor: 'pointer',
        borderColor: assessment.current_revision ? '#44CC7B' : '',
        opacity: assessment.current_revision ? 1 : 0.6,
      }"
      @click="
        $router.push({
          name: `assessment-panel`,
          query: { id: assessment.id },
        })
      "
    >
      <div class="d-flex align-center">
        <div class="primary--text">
          <span class="caption text--secondary"> E{{ assessment.id }} </span>
          <v-icon small color="primary">{{
            har.assessmentResults[assessment.compliance].icon
          }}</v-icon>
          <span class="caption font-weight-medium">
            {{
              har.assessmentResults[assessment.compliance].name.toUpperCase()
            }}
          </span>
        </div>
        <v-spacer />
        <!--        <span v-if="assessment.files.length" class="caption  d-flex align-center">-->
        <!--          <v-icon x-small class="mr-1">mdi-file </v-icon>{{ assessment.files.length }}</span-->
        <!--        >-->
        <!--        <span class="mx-2">-</span>-->
        <div class="caption d-flex align-center">
          <span class="caption">
            Evaluada el
            <span class="font-weight-medium">{{
              assessment.created_on | fechaText
            }}</span>
          </span>
        </div>
        <span class="mx-1">-</span>
        <div>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon small :color="revision.color" v-on="on">
                {{ revision.icon }}
              </v-icon>
            </template>
            {{ revision.tooltip }}
          </v-tooltip>
          <span
            class="caption text-uppercase font-weight-medium ml-1"
            :style="{ color: revision.color }"
            >{{ revision.label }}</span
          >
        </div>
      </div>
      <div class="text-body-2 mt-2">
        <extend-tooltip
          :text="assessment.compliance_evidence"
          trunc-length="200"
        >
        </extend-tooltip>
      </div>
    </v-card>
  </v-hover>
</template>
<script>
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import { mapState } from "vuex";

export default {
  name: "AssessmentItem",
  components: {
    ExtendTooltip,
  },
  props: {
    assessment: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(["har"]),
    revision() {
      return this.assessment.current_revision
        ? {
            color: "#44CC7B",
            icon: "mdi-calendar-check-outline",
            tooltip: "Evaluación vigente",
            label: "Vigente",
          }
        : {
            color: "currentColor",
            icon: "mdi-calendar-clock-outline",
            tooltip: "Esta evaluación ya no tiene vigencia",
            label: "Histórica",
          };
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
