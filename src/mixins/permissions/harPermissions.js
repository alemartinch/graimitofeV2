import { mapGetters, mapState } from "vuex";

export const harPermissions = {
  name: "harPermissions",

  computed: {
    ...mapState(["har"]),
    ...mapGetters("user", [
      "isCurrentUserRegu",
      "isCurrentUserSme",
      "isCurrentUserExec",
      "isCurrentUserEmpl",
      "isCurrentUserBase",
      "currentUserId",
    ]),
  },

  methods: {
    canDeleteAssessment() {
      return this.isCurrentUserSme;
    },

    canEditAssessment() {
      return this.isCurrentUserSme || this.isCurrentUserRegu;
    },

    canDeleteTask() {
      return this.isCurrentUserSme;
    },

    canEditTask() {
      return this.isCurrentUserSme || this.isCurrentUserRegu;
    },

    canDeactivateTask(task) {
      const currentTask = task || this.har.task;
      return (
        currentTask.frequency_key !== "NO" &&
        (this.isCurrentUserSme || this.isCurrentUserRegu)
      );
    },

    canModifyTaskStatus(occurrence) {
      const currentTask = occurrence.repet_action || this.har.task;
      const isCurrentUserOwner = this.currentUserId === currentTask.owner.id;

      return isCurrentUserOwner || this.isCurrentUserSme;
    },

    canIDeleteOccurrence() {
      return this.isCurrentUserSme;
    },

    canEditRegulation() {
      return this.isCurrentUserSme || this.isCurrentUserRegu;
    },

    canDeleteRegulation() {
      return this.isCurrentUserSme;
    },

    canModifyOccurrencesEntry() {
      const occurrenceUserID = +this.har.task.owner.id;
      const isCurrenUserTaskOwner = this.currentUserId === occurrenceUserID;

      return (
        this.isCurrentUserSme ||
        this.isCurrentUserRegu ||
        (isCurrenUserTaskOwner && this.isCurrentUserEmpl)
      );
    },

    canDeleteOccurrencesEntry(entry) {
      return this.canModifyOccurrencesEntry() && !entry.related_status;
    },
  },
};
