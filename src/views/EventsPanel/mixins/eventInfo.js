import { mapGetters, mapState, mapMutations, mapActions } from "vuex";
import { permissions } from "@/mixins/permissions";
import { tcmtReportsApi, eatApi } from "@/apis";
import { EVENT_STATUSES, EVENT_ORIGINS } from "@/mixins/globals";
import axios from "axios";

export default {
  name: "eventInfo",
  mixins: [permissions],
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      id: this.$route.params.id,
      fcaShow: 0,
      filesEventDialog: false,
      showAttachDialog: false,
      showTagsDialog: false,
      certifyComment: "",
      loading: {
        certifyEvent: false,
        eventSummary: false,
        eventDescription: false,
        alertBtn: false,
        fetchEventData: false,
        downloadReport: { pdf: false, csv: false },
        refreshEvent: false,
      },
      alertDialog: false,
      source: null,
    };
  },

  beforeDestroy() {
    if (this.event.temp_event.findings.length) {
      this.set_findings([]);
    }
  },

  beforeRouteLeave(to, from, next) {
    this.source.cancel("sdfsdf");
    this.set_post_edit(false);
    next();
  },

  // watch: {
  //   $route(to) {
  //     this.id = to.params.id;
  //     this.$router.go(0);
  //   },
  // },

  computed: {
    ...mapState(["event", "user", "appLoading", "apisEnabled"]),

    ...mapGetters("event", [
      "getOriginName",
      "participantsList",
      "extractActions",
      "extractCauses",
    ]),

    enablePostEdit() {
      return this.canPostEditEvent();
    },
  },

  methods: {
    ...mapMutations([
      "SET_ALERT",
      "show_success_notification",
      "show_error_notification",
    ]),
    ...mapMutations("event", [
      "set_event",
      "set_description",
      "set_summary",
      "set_post_edit",
      "set_eventOrigin",
      "SET_RESTRICTED_EVENT",
    ]),
    ...mapMutations("fca", ["set_findings", "set_causes", "set_actions"]),
    ...mapActions("fca", ["get_cause_types"]),
    ...mapActions("event", ["delete_current_event", "update_event"]),
    ...mapActions(["set_alert"]),

    downloadEventReport(fileType) {
      this.loading.downloadReport[fileType] = true;
      tcmtReportsApi
        .getFetcher()
        .get(`events/${this.event.temp_event.id}?report_type=${fileType}`)
        .then((res) => {
          const url = res.data.download_url;
          window.open(url, "_blank");
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Error al descargar el archivo",
          });
        })
        .finally(() => {
          this.loading.downloadReport[fileType] = false;
        });
    },

    refreshEvent() {
      this.loading.refreshEvent = true;
      eatApi
        .getFetcher()
        .get(`events/full/${this.event.temp_event.id}`)
        .then((response) => {
          this.set_event(response.data.results);
        })
        .catch(() => {})
        .finally(() => {
          this.loading.refreshEvent = false;
        });
    },

    getEvent() {
      this.loading.fetchEventData = true;
      const CancelToken = axios.CancelToken;
      this.source = CancelToken.source();
      eatApi
        .getFetcher()
        .get(`events/full/${this.id}`)
        .then(({ data }) => {
          if (data.results.restricted && !this.canViewEvent(data.results)) {
            this.$router.push({
              path: `/events/eventinfo/${data.results.id}/restricted-event`,
            });
          }
          this.set_event(data.results);
          this.set_actions([]);
          this.set_post_edit(true);
          this.set_eventOrigin(this.event.temp_event.event_origin);
          if (this.event.temp_event.findings.length) {
            this.set_findings(this.event.temp_event.findings);
          } else if (this.event.temp_event.causes.length) {
            this.set_causes(this.event.temp_event.causes);
          } else {
            this.set_actions(this.event.temp_event.actions);
          }
          this.loading.fetchEventData = false;
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "El evento no fue encontrado",
          });
        })
        .finally(() => {
          this.loading.fetchEventData = false;
        });
    },

    certifyEvent() {
      this.loading.certifyEvent = true;
      eatApi
        .getFetcher()
        .post(`/events/${this.event.temp_event.id}/move-to-clos`, {
          leader_comments: this.event.temp_event.leader_comments,
        })
        .then(() => {
          this.getEvent();
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Evento certificado",
          });
        })
        .catch(() => {
          this.loading.certifyEvent = false;
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "El evento no pudo certificarse",
          });
        });
    },

    isCertifiedEvent() {
      return (
        this.event.temp_event.status === EVENT_STATUSES.CLOSE &&
        (this.event.temp_event.event_origin === EVENT_ORIGINS.CRITICAL ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD ||
          this.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD)
      );
    },

    onBlockEvent() {
      this.SET_RESTRICTED_EVENT(!this.event.temp_event.restricted);
      this.update_event().then(() => {
        this.getEvent();
      });
    },

    deleteEvent() {
      this.loading.alertBtn = true;
      this.delete_current_event()
        .then(() => {
          this.alertDialog = false;
          this.loading.alertBtn = false;
          this.show_success_notification("Evento eliminado");
          this.$router.push({ path: `/events/` });
        })
        .catch(() => {
          this.alertDialog = false;
          this.loading.alertBtn = false;
          this.show_error_notification("Error al eliminar el evento");
        });
    },

    openNewTab(eventId) {
      this.$router.push({ path: `/events/eventinfo/${eventId}` });
    },
  },
};
