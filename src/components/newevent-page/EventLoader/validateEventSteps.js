import { mapGetters, mapState } from "vuex";
import { EVENT_ORIGINS } from "@/mixins/globals";

export default {
  computed: {
    ...mapState(["event", "fca"]),
    ...mapGetters("fca", [
      "findingsWithoutCauses",
      "causesWithoutActions",
      "findingsWithoutActions",
      "findings_nc_ncm",
      "findings_om",
    ]),
    ...mapGetters("event", ["getParticipantsSwitch"]),

    isValidStepOne() {
      return (
        (!!this.event.temp_event.facility ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.MEET) &&
        (this.event.temp_event.sector ||
          !this.event.availableFields.sector ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.MEET) &&
        this.event.temp_event.event_origin &&
        (this.event.temp_event.process_areas.length ||
          !this.event.availableFields.process_areas) &&
        (!!this.event.temp_event.occurrence_date ||
          !this.event.availableFields.occurrence_date ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION) &&
        (!!this.event.temp_event.occurrence_time ||
          !this.event.availableFields.occurrence_time ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION)
      );
    },

    isValidStepTwo() {
      return (
        (!!this.event.temp_event.summary ||
          !this.event.availableFields.summary) &&
        (!!this.event.temp_event.description ||
          !this.event.availableFields.description)
      );
    },

    isValidStepThree() {
      return (
        (!!this.event.temp_event.leader ||
          !this.event.availableFields.leader ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.MEET) &&
        this.checkParticipantAUD()
      );
    },

    isValidStepFour() {
      let valid =
        !this.event.availableFields.equipment ||
        (this.event.temp_event.equipment_category &&
          !!this.event.temp_event.equipment_description);
      if (this.event.temp_event.equipment_category) {
        valid =
          valid || this.event.temp_event.equipment_category.name === "N/A";
      }
      return valid;
    },

    isValidStepFive() {
      if (
        this.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD
      ) {
        if (this.findings_nc_ncm.length > 0 && this.findings_om.length > 0) {
          return (
            !this.findingsWithoutCauses &&
            !this.causesWithoutActions &&
            !this.findingsWithoutActions
          );
        } else {
          return (
            (!this.findingsWithoutCauses && !this.causesWithoutActions) ||
            !this.findingsWithoutActions
          );
        }
      }

      if (this.event.temp_event.event_origin === EVENT_ORIGINS.CRITICAL_EVENT) {
        return !this.causesWithoutActions;
      }

      if (
        this.event.temp_event.event_origin === EVENT_ORIGINS.CHANGE ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.PROJECT ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_REQ ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_REQ
      ) {
        return this.fca.actions.length > 0;
      }

      if (
        this.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.MEET
      ) {
        return !this.findingsWithoutActions;
      }

      return false;
    },

    isValidAllStep() {
      return (
        this.isValidStepOne &&
        this.isValidStepTwo &&
        this.isValidStepThree &&
        this.isValidStepFour &&
        this.isValidStepFive
      );
    },
  },

  methods: {
    checkParticipantAUD() {
      if (
        this.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD
      ) {
        return !this.getParticipantsSwitch
          ? true
          : this.getParticipantsSwitch &&
              !!this.event.temp_event.participants?.length;
      } else {
        return (
          !!this.event.temp_event.participants?.length ||
          !this.event.availableFields.participants
        );
      }
    },
  },
};
