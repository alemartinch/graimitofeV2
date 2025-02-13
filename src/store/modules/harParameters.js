import { TASK_STATUSES } from "@/mixins/globals";

export const harParameters = {
  tiers: {
    INT: "Interno",
    LOC: "Legal / Local",
    PRV: "Legal / Provincial",
    NAC: "Legal / Nacional",
    OTR: "Otros",
  },

  assessmentResults: {
    NAPP: {
      name: "No aplica",
      icon: "mdi-clipboard-remove-outline",
      color: "grey darken-2",
      keys: "NAPP",
    },
    OBSL: {
      name: "Obsoleto",
      icon: "mdi-clipboard-text-off-outline",
      color: "grey darken-1",
      keys: "OBSL",
    },
    COMP: {
      name: "En cumplimiento",
      icon: "mdi-clipboard-check-outline",
      color: "green darken-3",
      keys: "COMP",
    },
    NCOM: {
      name: "En no cumplimiento",
      icon: "mdi-clipboard-alert-outline",
      color: "red darken-2",
      keys: "NCOM",
    },
    PCOM: {
      name: "En proceso",
      icon: "mdi-clipboard-clock-outline",
      color: "amber darken-3",
      keys: "PCOM",
    },
    NASS: {
      name: "Sin evaluar",
      icon: "mdi-clipboard-outline",
      color: "primary",
      keys: "NASS",
    },
  },

  frequencies: {
    DAY: { both: "día/s", s: "día", p: "días" },
    WEEK: { both: "semana/s", s: "semana", p: "semanas" },
    MONTH: { both: "mes/es", s: "mes", p: "meses" },
    YEAR: { both: "año/s", s: "año", p: "años" },
    NO: "No repetitiva",
  },

  taskStatuses: {
    [TASK_STATUSES.COMPLETED]: {
      color: "#00BF9C",
      name: "Completa",
      icon: "mdi-check-circle-outline",
    },
    [TASK_STATUSES.PENDING]: {
      color: "orange",
      name: "Pendiente",
      icon: "mdi-circle",
    },
    [TASK_STATUSES.OVERDUE]: {
      color: "#FF7373",
      name: "Vencida",
      icon: "mdi-circle",
    },
  },
};
