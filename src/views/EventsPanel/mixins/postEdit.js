import { mapActions, mapMutations, mapState } from "vuex";

export const postEdit = {
  name: "postEdit",
  data() {
    return {
      editLoading: false,
    };
  },
  computed: {
    ...mapState(["user", "fca", "event"]),
  },

  methods: {
    ...mapActions(["get_page_data"]),

    ...mapMutations("event", ["set_event", "set_eventOrigin", "set_post_edit"]),
    ...mapMutations("fca", ["set_findings", "set_causes", "set_actions"]),

    editEvent(event) {
      this.editLoading = true;
      this.get_page_data()
        .then(() => {
          this.set_event(event);
          this.set_eventOrigin(event.event_origin);
          this.set_post_edit(true);
          if (this.event.temp_event.findings.length) {
            this.set_findings(this.event.temp_event.findings);
          } else if (this.event.temp_event.causes.length) {
            this.set_causes(this.event.temp_event.causes);
          } else {
            this.set_actions(this.event.temp_event.actions);
          }
          this.$router.push({ path: `/create_event` });
        })
        .catch(() => {
          this.editLoading = false;
          this.set_alert({
            appAlertType: "error",
            appAlertMsg:
              "Error al cargar los datos necesarios para crear el evento.",
          });
        });
    },
  },
};
