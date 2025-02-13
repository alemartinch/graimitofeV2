import { mapGetters } from "vuex";
import {
  EVENT_STATUSES as ES,
  EVENT_ORIGINS as EO,
  ACTION_STATUSES as AS,
} from "@/mixins/globals";

export const findingPermissions = {
  name: "findingPermissions",
  computed: {
    ...mapGetters("event", ["getCurrentEvent"]),
    ...mapGetters("user", ["currentUserId", "isCurrentUserSme"]),
    ...mapGetters("fca", ["getCurrentFinding"]),
  },

  methods: {
    // FINDINGS
    canPostAddFinding(
      { event_origin, status, originator } = this.getCurrentEvent
    ) {
      const isCurrentEventOriginator = originator.id === this.currentUserId;
      const ADD_FINDING = {
        [EO.EXTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme || isCurrentEventOriginator,
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
        },
        [EO.INTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme || isCurrentEventOriginator,
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
        },
      };
      return ADD_FINDING[event_origin]?.[status]?.();
    },

    canPostEditFinding(
      { event_origin, status, originator } = this.getCurrentEvent,
      { actions } = this.getCurrentFinding
    ) {
      const isCurrentEventOriginator = originator.id === this.currentUserId;
      const findingHasNotPendingActions = actions
        ? !actions.some((action) => action.status === AS.PENDING)
        : true;
      const EDIT_FINDING = {
        [EO.OBSERVATION]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme || isCurrentEventOriginator,
          [ES.CLOSE]: () => this.isCurrentUserSme,
        },
        [EO.EXTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator && findingHasNotPendingActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
          [ES.CLOSE]: () => this.isCurrentUserSme,
        },
        [EO.INTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator && findingHasNotPendingActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
          [ES.CLOSE]: () => this.isCurrentUserSme,
        },
      };
      return EDIT_FINDING[event_origin]?.[status]?.();
    },

    canPostDeleteFinding(
      { event_origin, status, originator, findings } = this.getCurrentEvent,
      { actions, causes } = this.getCurrentFinding
    ) {
      const onlyOneFinding = findings.length === 1;
      if (onlyOneFinding) return false;
      const isCurrentEventOriginator = originator.id === this.currentUserId;
      const causesHasNotCompletedActions = causes?.length
        ? causes.some(({ actions }) =>
            actions.some(
              (a) => ![AS.COMPLETED, AS.EF_COMPLETED].includes(a.status)
            )
          )
        : true;
      const findingHasNotCompletedActions = actions?.length
        ? actions.some(
            (a) => ![AS.COMPLETED, AS.EF_COMPLETED].includes(a.status)
          )
        : true;

      const DELETE_FINDING = {
        [EO.EXTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator &&
              findingHasNotCompletedActions &&
              causesHasNotCompletedActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
        },
        [EO.INTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator &&
              findingHasNotCompletedActions &&
              causesHasNotCompletedActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
        },
      };
      return DELETE_FINDING[event_origin]?.[status]?.();
    },
  },
};
