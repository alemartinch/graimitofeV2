import { mapGetters } from "vuex";
import { EVENT_STATUSES as ES, EVENT_ORIGINS as EO } from "@/mixins/globals";

export const eventPermissions = {
  name: "eventPermissions",
  computed: {
    ...mapGetters("event", ["getCurrentEvent", "noCompletedActionInEvent"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserSme",
      "currentUserRoles",
    ]),
  },

  methods: {
    // EVENTS
    canPostEditEvent(
      { event_origin, status, originator } = this.getCurrentEvent
    ) {
      if (this.isCurrentUserSme) return true;
      const isCurrentEventOriginator = originator.id === this.currentUserId;
      const EDIT_EVENT = {
        [EO.OBSERVATION]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
        [EO.CRITICAL_EVENT]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
        [EO.EXTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
        [EO.INTERNAL_AUD]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
        [EO.INTERNAL_REQ]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
        [EO.EXTERNAL_REQ]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
        [EO.PROJECT]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
        [EO.CHANGE]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
        [EO.MEET]: {
          [ES.PENDING_ACTIONS]: () => isCurrentEventOriginator,
          [ES.CERTIFICATE]: () => false,
          [ES.CLOSE]: () => false,
          [ES.PENDING_EFFECTIVENESS]: () => false,
          [ES.OPEN]: () => false,
        },
      };
      return EDIT_EVENT[event_origin]?.[status]?.();
    },

    canPostDeleteEvent(
      { event_origin, status, originator } = this.getCurrentEvent
    ) {
      const isCurrentEventOriginator = originator.id === this.currentUserId;
      if (this.isCurrentUserSme) return true;
      const DELETE_EVENT = {
        [EO.OBSERVATION]: {
          [ES.PENDING_ACTIONS]: () =>
            isCurrentEventOriginator && this.noCompletedActionInEvent,
        },
      };
      return DELETE_EVENT[event_origin]?.[status]?.();
    },

    canEditParticipants(event = this.getCurrentEvent) {
      return this.canPostEditEvent(event) && event.status !== ES.CLOSE;
    },

    canCertifyEvent({ event_origin, status, leader } = this.getCurrentEvent) {
      const isACertifiableEvent =
        status === ES.CERTIFICATE &&
        [EO.CRITICAL_EVENT, EO.EXTERNAL_AUD, EO.INTERNAL_AUD, EO.MEET].includes(
          event_origin
        );
      if (leader) {
        return (
          (leader.id === this.currentUserId || this.isCurrentUserSme) &&
          isACertifiableEvent
        );
      }
      return false;
    },

    canViewEvent(event) {
      const isCurrentUserOriginator =
        +event.originator.id === +this.currentUserId;
      const isCurrentUserLeader = +event.leader?.id === +this.currentUserId;

      const participantsIds = event.participants
        ? event.participants?.map((p) => p.id)
        : [];

      const isCurrentUserEventParticipant = participantsIds.includes(
        this.currentUserId
      );

      if (event.restricted) {
        return (
          this.isCurrentUserSme ||
          isCurrentUserEventParticipant ||
          isCurrentUserOriginator ||
          isCurrentUserLeader
        );
      }

      return true;
    },

    canEditEventTags(event = this.getCurrentEvent) {
      const isCurrentUserOriginator =
        +event.originator.id === +this.currentUserId;
      const isCurrentUserLeader = +event.leader?.id === +this.currentUserId;
      return (
        this.isCurrentUserSme || isCurrentUserOriginator || isCurrentUserLeader
      );
    },

    canEditRestrictedField() {
      return this.canViewEvent(this.getCurrentEvent);
    },
  },
};
