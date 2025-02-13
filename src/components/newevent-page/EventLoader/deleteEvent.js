import { mapActions, mapMutations } from "vuex";

export default {
  data() {
    return {
      deleteEventLoading: false,
    };
  },
  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapActions("event", ["delete_current_event"]),

    deleteEvent() {
      this.deleteEventLoading = true;
      this.delete_current_event()
        .then(() => {
          this.alertDialog = false;
          this.deleteEventLoading = false;
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Evento eliminado",
          });
          if (this.$vuetify.breakpoint.smAndDown) {
            this.$router.push({ path: `/observations` });
          } else {
            this.$router.push({ path: `/create_event/` });
          }
        })
        .catch((e) => {
          this.alertDialog = false;
          this.deleteEventLoading = false;
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `No pudo eliminarse el evento, error: ${e}`,
          });
        });
    },
  },
};
