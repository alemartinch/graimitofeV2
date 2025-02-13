import { mapGetters } from "vuex";
import {
  EVENT_STATUSES as ES,
  EVENT_ORIGINS as EO,
  ACTION_STATUSES as AS,
} from "@/mixins/globals";

export const causePermissions = {
  name: "causePermissions",
  computed: {
    ...mapGetters("event", ["getCurrentEvent"]),
    ...mapGetters("user", ["currentUserId", "isCurrentUserSme"]),
    ...mapGetters("fca", ["getCurrentCause"]),
  },

  methods: {
    // CAUSES
    canPostAddCause(
      { event_origin, status, originator } = this.getCurrentEvent
    ) {
      const isCurrentEventOriginator = originator.id === this.currentUserId;
      const ADD_CAUSE = {
        [EO.CRITICAL_EVENT]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme || isCurrentEventOriginator,
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
        },
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
      return ADD_CAUSE[event_origin]?.[status]?.();
    },

    canPostEditCause(
      { event_origin, status, originator } = this.getCurrentEvent,
      { actions } = this.getCurrentCause
    ) {
      const isCurrentEventOriginator = originator.id === this.currentUserId;
      const causeHasNotPendingActions = actions
        ? !actions.some((action) => action.status === AS.PENDING)
        : false;
      const EDIT_CAUSE = {
        [EO.CRITICAL_EVENT]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator && causeHasNotPendingActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
          [ES.CLOSE]: () => this.isCurrentUserSme,
        },
        [EO.EXTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator && causeHasNotPendingActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
          [ES.CLOSE]: () => this.isCurrentUserSme,
        },
        [EO.INTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator && causeHasNotPendingActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
          [ES.CLOSE]: () => this.isCurrentUserSme,
        },
      };
      return EDIT_CAUSE[event_origin]?.[status]?.();
    },

    canPostDeleteCause(
      { event_origin, status, originator } = this.getCurrentEvent,
      { actions } = this.getCurrentCause
    ) {
      const isCurrentEventOriginator = originator.id === this.currentUserId;
      const causeHasNotPendingActions = actions
        ? !actions.some((action) => action.status === AS.PENDING)
        : false;
      const DELETE_CAUSE = {
        [EO.CRITICAL_EVENT]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator && causeHasNotPendingActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
        },
        [EO.EXTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator && causeHasNotPendingActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
        },
        [EO.INTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () =>
            this.isCurrentUserSme ||
            (isCurrentEventOriginator && causeHasNotPendingActions),
          [ES.PENDING_EFFECTIVENESS]: () => this.isCurrentUserSme,
          [ES.CERTIFICATE]: () => this.isCurrentUserSme,
        },
      };
      return DELETE_CAUSE[event_origin]?.[status]?.();
    },
  },
};
