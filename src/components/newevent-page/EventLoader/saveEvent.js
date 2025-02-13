import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      saveEventLoading: false,
    };
  },
  computed: {
    ...mapState(["event"]),
  },

  methods: {
    ...mapActions("event", ["save_event", "update_event"]),

    ...mapActions(["set_alert"]),

    saveEvent() {
      this.saveEventLoading = true;
      this.update_event()
        .then(() => {
          this.save_event().then((event) => {
            this.set_alert({
              appAlertType: "success",
              appAlertMsg: "Evento guardado",
            });
            const path = this.$vuetify.breakpoint.smAndDown
              ? `/observations`
              : "/events/eventinfo/" + event.id;
            this.$router.push({ path });
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "No pudo guardarse el evento",
          });
          this.saveEventLoading = false;
        });
    },
  },
};
