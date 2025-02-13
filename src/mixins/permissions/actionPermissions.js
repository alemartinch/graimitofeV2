import { mapGetters, mapState } from "vuex";
import {
  EVENT_STATUSES as ES,
  EVENT_ORIGINS as EO,
  ACTION_STATUSES as AS,
} from "@/mixins/globals";

export const actionPermissions = {
  name: "actionPermissions",
  computed: {
    ...mapState("event", ["postEdit"]),
    ...mapGetters("event", [
      "getCurrentEvent",
      "extractActions",
      "noCompletedActionInEvent",
    ]),
    ...mapGetters("user", ["currentUserId", "isCurrentUserSme"]),
    ...mapGetters("fca", ["getCurrentAction"]),
  },

  methods: {
    isActionCompleted({ status } = this.getCurrentAction) {
      return status !== AS.OVERDUE && status !== AS.PENDING;
    },

    canPostAddAction({ status, originator } = this.getCurrentEvent) {
      if (this.isCurrentUserSme) return status !== ES.CLOSE;
      if (originator.id === this.currentUserId) {
        return status === ES.PENDING_ACTIONS;
      }
      return false;
    },

    canPostEditAction(
      { status, originator } = this.getCurrentEvent,
      action = this.getCurrentAction
    ) {
      if (this.isMobile) return false;
      if (this.isCurrentUserSme) return true;
      if (originator.id === this.currentUserId) {
        return action.status === AS.PENDING && status === ES.PENDING_ACTIONS;
      }
      return false;
    },

    canPostEditResultAndEff({ event_origin, status } = this.getCurrentEvent) {
      if (this.canPostEditAction()) {
        if (
          event_origin === EO.CRITICAL_EVENT ||
          event_origin === EO.EXTERNAL_AUD ||
          event_origin === EO.INTERNAL_AUD
        ) {
          return status === ES.CERTIFICATE;
        }
      }
      return false;
    },

    canPostDeleteAction(
      { status, originator } = this.getCurrentEvent,
      action = this.getCurrentAction
    ) {
      if (this.extractActions.length === 1) return false;
      if (this.isCurrentUserSme) return status === ES.PENDING_ACTIONS;
      if (originator.id === this.currentUserId) {
        return action.status === AS.PENDING;
      }
      return false;
    },

    canPostponeAction({ original_due_date, event } = this.getCurrentAction) {
      if (!original_due_date) return true;
      if (this.isCurrentUserSme) return true;
      const originator = event
        ? event.originator
        : this.event.temp_event.originator?.id;
      return this.currentUserId === originator;
    },

    canPostModifyActionAndEffec({ leader } = this.getCurrentEvent) {
      if (this.postEdit) {
        return leader.id === this.currentUserId || this.isCurrentUserSme;
      }
      return false;
    },

    canModifyEffectivenessDate(
      { leader } = this.getCurrentEvent,
      { status, owner } = this.getCurrentAction
    ) {
      if (this.currentUserId) return status !== AS.EF_COMPLETED;
      if (leader.id === this.currentUserId)
        return this.postEdit && status !== AS.EF_COMPLETED;
      if (owner.id === this.currentUserId)
        return status === AS.PENDING || status === AS.OVERDUE;
    },

    canResolveAction({ owner, status } = this.getCurrentAction) {
      if (this.isCurrentUserSme) return true;
      if (owner && owner.id === this.currentUserId) {
        return status === AS.PENDING || status === AS.OVERDUE;
      } else {
        return false;
      }
    },

    canResolveEffectiveness(
      { leader } = this.getCurrentEvent,
      { owner, status } = this.getCurrentAction
    ) {
      if (status !== AS.EF_COMPLETED) {
        return (
          owner.id === this.currentUserId ||
          this.isCurrentUserSme ||
          (this.postEdit ? leader.id === this.currentUserId : false)
        );
      }
      return this.isCurrentUserSme;
    },

    canCompleteEffectiveness(
      { effectiveness, owner, status } = this.getCurrentAction
    ) {
      return (
        effectiveness &&
        (owner.id === this.currentUserId || this.isCurrentUserSme) &&
        (status === AS.EF_PENDING || status === AS.EF_OVERDUE)
      );
    },

    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },

    canSendMailToOwner({ status, parent_event }) {
      const isCurrentUserOriginator =
        this.currentUserId === parent_event?.originator?.id;
      const isCurrentUserLeader =
        this.currentUserId === parent_event.leader?.id;
      const isActionOpen =
        status !== AS.COMPLETED && status !== AS.EF_COMPLETED;

      return (
        isActionOpen &&
        (this.isCurrentUserSme ||
          isCurrentUserLeader ||
          isCurrentUserOriginator)
      );
    },

    canAttachFilesToAction() {
      if (this.isCurrentUserSme) {
        return true;
      }

      const { status, parent_event, owner } = this.getCurrentAction;
      const isActionOpen = status !== AS.COMPLETED;
      const isCurrentUserEventLeader =
        this.currentUserId === +parent_event.leader?.id;
      const isCurrentUserOwner = this.currentUserId === +owner.id;

      if (isCurrentUserEventLeader) {
        return parent_event.status !== ES.CLOSE;
      }

      if (isCurrentUserOwner) {
        return isActionOpen;
      }
    },

    // canEditEffectivenessComment() {
    //   const { status } = this.getCurrentAction;
    // },
  },
};
