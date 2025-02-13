const ROLES = {
  SME: "SME",
  EMPLOYEE: "EMPL",
  LEADER: "LEAD",
  ORIGINATOR: "ORIG",
  REGU: "REGU",
  BASE: "BASE",
};

// const ROLES = {
//   SME: "SME",
//   EXECUTOR: "EXEC",
//   EMPLOYEE: "EMPL",
//   LEADER: "LEAD",
//   ORIGINATOR: "ORIG",
//   REGU: "REGU",
//   EXTERNAL: "EXTC",
// };

// const NEW_ROLES = [
//   { rol: "SME", description: "SME" },
//   { rol: "EMPLOYEE", description: "Empleado" },
//   { rol: "LEAD", description: "Lider" },
//   { rol: "ORIG", description: "Originador" },
//   { rol: "REGU", description: "Regu" },
//   { rol: "BASE", description: "Base" },
// ];

const EVENT_STATUSES = {
  OPEN: "OPEN",
  PENDING_ACTIONS: "APEN",
  PENDING_EFFECTIVENESS: "EFFC",
  CERTIFICATE: "VALI",
  CLOSE: "CLOS",
};

const EVENT_ORIGINS = {
  OBSERVATION: "OBSV",
  CRITICAL_EVENT: "CRTE",
  EXTERNAL_AUD: "EAUD",
  INTERNAL_AUD: "IAUD",
  PROJECT: "PROJ",
  INTERNAL_REQ: "IREQ",
  EXTERNAL_REQ: "LREQ",
  CHANGE: "CHNG",
  MEET: "MEET",
};

const ACTION_STATUSES = {
  OVERDUE: "10ODUE",
  PENDING: "20PEND",
  EF_OVERDUE: "30EODU",
  EF_PENDING: "40EPEN",
  COMPLETED: "50COMP",
  EF_COMPLETED: "60CEFF",
};

const TASK_STATUSES = {
  OVERDUE: "10ODUE",
  PENDING: "20PEND",
  COMPLETED: "40COMP",
};

const TIERS = {
  NACIONAL: "NAC",
  PROVINCIAL: "PRV",
  LOCAL: "LOC",
  INTERNAL: "INT",
  OTHERS: "OTR",
};

const INPUTS_LENGTH = {
  EVENT_SUMMARY: 250,
  EVENT_DESCRIPTION: 5000,
  EVENT_CERTIFICATE_COMMENT: 500,
  EQUIPMENT_DESCRIPTION: 250,
  FINDING_DESCRIPTION: 5000,
  ACTION_DESCRIPTION: 500,
  ACTION_RESULT: 500,
  REASON_POSTPONE: 250,
  REG_SUBJECT: 250,
  REG_REVIEW: 5000,
  REG_OBLIGATIONS: 5000,
  ASSESSMENT_COMPLIANCE: 500,
  TASK_DESCRIPTION: 250,
};

const rolNameMixin = {
  methods: {
    rolNameTranslate(value) {
      if (value === "SME") {
        return "Administrador";
      } else if (value === "EMPL") {
        return "Empleado";
      } else if (value === "LEAD") {
        return "Lider";
      } else if (value === "ORIG") {
        return "Originador";
      } else if (value === "REGU") {
        return "Regulador";
      } else {
        return "Base";
      }
    },
  },
};

export {
  ROLES,
  EVENT_STATUSES,
  EVENT_ORIGINS,
  ACTION_STATUSES,
  TASK_STATUSES,
  TIERS,
  INPUTS_LENGTH,
  rolNameMixin,
};
