import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { EVENT_STATUSES, EVENT_ORIGINS } from "@/mixins/globals";
import { TASK_STATUSES } from "@/mixins/globals";
import HomeEventCard from "@/views/Home/HomeEventCard.vue";
import AppSpinner from "@/components/app-page/AppSpinner.vue";
import HomeActionsCard from "@/views/Home/HomeActionsCard.vue";
import IconBase from "@/components/Icons/IconBase.vue";
import IconEvent from "@/components/Icons/IconEvent.vue";
import IconAction from "@/components/Icons/IconAction.vue";
import IconTask from "@/components/Icons/IconTask.vue";
import HomeTasksCard from "@/views/Home/HomeTasksCard.vue";
import HomeCertEventCard from "@/views/Home/HomeCertEventCard.vue";

export default {
  name: "homePage",
  components: {
    HomeTasksCard,
    IconTask,
    IconAction,
    IconEvent,
    IconBase,
    HomeActionsCard,
    AppSpinner,
    HomeEventCard,
  },

  data() {
    return {
      today: new Date(),
      afternoonStartHour: 13,
      eveningStartHour: 20,
      loading: false,
    };
  },

  created() {
    this.loading = true;
    this.getHomePageData();
    if (this.isMobile) {
      this.getRegulationOccurrences();
      this.getLastObservations();
    }
    this.getMaximusValues();
  },

  computed: {
    ...mapState(["user", "event", "fca", "har", "apisEnabled"]),
    ...mapGetters("user", ["currentUserId"]),

    getDate() {
      const days = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ];
      const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      const today = new Date();

      const dateNum = today.getDate();
      const monthName = today.getMonth();

      return `${days[today.getDay() - 1]}, ${dateNum} de ${months[monthName]}`;
    },

    isRepetActionAvailable() {
      return this.apisEnabled.includes("repet");
    },

    cards() {
      return [
        {
          component: HomeActionsCard,
          visible: true,
          cols: this.isMobile ? 12 : 6,
        },
        {
          component: HomeTasksCard,
          visible: this.isRepetActionAvailable && !this.isMobile,
          cols: 6,
        },
        {
          component: HomeCertEventCard,
          visible: !this.isMobile,
          cols: this.isMobile ? 12 : 6,
        },
        {
          component: HomeEventCard,
          visible: true,
          cols: this.isMobile ? 12 : 6,
        },
      ];
    },

    totalOpenEvents() {
      return this.isMobile
        ? this.event.events.filter(
            (e) =>
              e.status === EVENT_STATUSES.OPEN &&
              e.event_origin === EVENT_ORIGINS.OBSERVATION
          ).length
        : this.event.homePageEvents.filter(
            (e) => e.status === EVENT_STATUSES.OPEN
          ).length;
    },

    totalCertEvents() {
      return this.event.homePageEvents.filter(
        (e) => e.status === EVENT_STATUSES.CERTIFICATE
      ).length;
    },

    totalActions() {
      return [
        ...(this.fca.homePageActions.eff_overdue_actions_not_open_events || []),
        ...(this.fca.homePageActions.eff_pending_actions_not_open_events || []),
        ...(this.fca.homePageActions.overdue_actions_not_open_events || []),
        ...(this.fca.homePageActions.pending_actions_not_open_events || []),
      ];
    },

    actionList() {
      const orderedActions = this.totalActions.sort((a, b) => {
        {
          const fechaA = a.effectiveness_date || a.due_date;
          const fechaB = b.effectiveness_date || b.due_date;

          const fechaObjA = new Date(fechaA);
          const fechaObjB = new Date(fechaB);

          return fechaObjA - fechaObjB;
        }
      });

      const currentDate = new Date();

      const getStatusDescription = (date) => {
        const timeDifferenceInMilliseconds = date - currentDate;

        const timeDifferenceInDays = Math.floor(
          timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24)
        );

        const thresholds = {
          today: 0,
          yesterday: -1,
          lastWeek: -7,
          lastMonth: -30,
          lastYear: -365,
        };

        if (timeDifferenceInDays === 1) {
          return "vence mañana";
        } else if (timeDifferenceInDays === thresholds.today) {
          return "vence hoy";
        } else if (timeDifferenceInDays === thresholds.yesterday) {
          return "venció ayer";
        } else if (timeDifferenceInDays === thresholds.lastMonth) {
          return "venció hace un mes";
        } else if (timeDifferenceInDays === thresholds.lastYear) {
          return "venció hace un año";
        } else if (timeDifferenceInDays === 7) {
          return "vence en una semana";
        } else if (timeDifferenceInDays === 30) {
          return "vence en un mes";
        } else if (timeDifferenceInDays === 365) {
          return "vence en un año";
        } else if (timeDifferenceInDays > 0) {
          return `vence en ${timeDifferenceInDays} días`;
        } else {
          return `venció hace ${timeDifferenceInDays * -1} días`;
        }
      };

      orderedActions.forEach((action) => {
        const date = action.effectiveness_date || action.due_date;
        const statusDescription = getStatusDescription(new Date(date));

        action.statusDescription = action.effectiveness_date
          ? `La efectividad ${statusDescription}`
          : `La acción ${statusDescription}`;
      });
      return orderedActions.splice(0, 3);
    },

    effOverdueActions() {
      return this.fca.homePageActions.eff_overdue_actions_not_open_events;
    },

    effPendingActions() {
      return this.fca.homePageActions.eff_pending_actions_not_open_events;
    },

    overdueActions() {
      return this.fca.homePageActions.overdue_actions_not_open_events;
    },

    pendingActions() {
      return this.fca.homePageActions.pending_actions_not_open_events;
    },

    actionCardData() {
      return {
        title: "Acciones sin resolver",
        items: [
          {
            title: "Pendientes",
            value: this.pendingActions.length,
          },
          {
            title: "Vencidas",
            value: this.overdueActions.length,
          },

          {
            title: "Efectividad pendiente",
            value: this.effPendingActions.length,
          },

          {
            title: "Efectividad vencida",
            value: this.effOverdueActions.length,
          },
        ],
      };
    },

    taskCardData() {
      const occurrences = this.har.occurrencesData.results;
      const overdueTasks = occurrences.filter(
        (o) => o.status === TASK_STATUSES.OVERDUE
      ).length;
      const pendingTasks = occurrences.filter(
        (o) => o.status === TASK_STATUSES.PENDING
      ).length;
      const preWarningActiveTasks = occurrences.filter(
        (o) =>
          o.status === TASK_STATUSES.PENDING &&
          o.repet_action.extra.is_pre_warning_time
      ).length;
      return {
        title: "Tareas activas",
        items: [
          {
            title: "Pre-aviso activado",
            value: preWarningActiveTasks,
          },
          {
            title: "Pendientes",
            value: pendingTasks,
          },
          {
            title: "Vencidas",
            value: overdueTasks,
          },
        ],
      };
    },

    greeting() {
      if (this.today.getHours() < this.afternoonStartHour) {
        return "Buenos días";
      } else if (this.today.getHours() >= this.eveningStartHour) {
        return "Buenas noches";
      } else {
        return "Buenas tardes";
      }
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("fca", ["set_actions"]),
    ...mapMutations("har", ["set_occurrences_filters"]),
    ...mapActions("user", ["getMaxValues"]),
    ...mapActions("har", ["fetchOccurrences"]),
    ...mapActions(["get_home_page_data"]),
    ...mapMutations("event", ["set_events", "set_events_filter"]),
    ...mapActions("event", ["create_event", "get_events"]),

    getMaximusValues() {
      this.getMaxValues();
    },

    getHomePageData() {
      this.get_home_page_data()
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Error al actualizar las tareas",
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },

    getRegulationOccurrences() {
      this.set_occurrences_filters({
        ordering: "status,due_date",
        status: [TASK_STATUSES.OVERDUE, TASK_STATUSES.PENDING],
      });
      this.fetchOccurrences();
    },

    getLastObservations() {
      this.set_events_filter({
        originator__id: this.currentUserId,
        ordering: "-added_date",
        event_origin: EVENT_ORIGINS.OBSERVATION,
        page_size: 50,
      });
      this.get_events()
    },
  },
};
