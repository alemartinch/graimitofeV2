import { eatApi } from "@/apis";
import qs from "qs";
import { ACTION_STATUSES as AS, EVENT_ORIGINS } from "@/mixins/globals";
import { purgeFilters } from "@/store/modules/helpers";

const state = {
  temp_action: {
    id: null,
    event: null,
    cause: null,
    finding: null,
    description: "",
    owner: null,
    due_date: "",
    original_due_date: "",
    action_type: "",
    effectiveness: false,
    effectiveness_validation_method: "",
    effectiveness_date: "",
    effectiveness_ok: null,
    effectiveness_result: null,
    completed_date: null,
    postpone_reason: "",
    action_status: null,
    action_result: "",
    immediate: false,
    files: [],
  },

  default_action: {
    id: null,
    event: null,
    cause: null,
    finding: null,
    description: "",
    owner: null,
    due_date: "",
    original_due_date: "",
    action_type: "",
    effectiveness: false,
    effectiveness_validation_method: "",
    effectiveness_ok: null,
    effectiveness_result: null,
    effectiveness_date: "",
    completed_date: null,
    postpone_reason: "",
    action_status: null,
    action_result: "",
    immediate: false,
    files: [],
  },

  cause_types: [],

  temp_cause: {
    id: null,
    finding: null,
    event: null,
    description: "",
    cause_type: "",
    sub_cause: "",
  },

  default_cause: {
    id: null,
    finding: null,
    event: null,
    description: "",
    cause_type: "",
    sub_cause: "",
  },

  temp_finding: {
    id: null,
    description: "",
    event: "",
    deviation: "",
    behavioral: false,
  },

  default_finding: {
    description: "",
    event: "",
    deviation: "",
    behavioral: false,
  },

  findings: [],

  causes: [],

  actions: [],

  homePageActions: {},

  actionsData: {},

  actionsFilters: {},

  parent: null,

  loading: { fetchActions: false },

  statuses: {
    [AS.OVERDUE]: {
      name: "Acciones vencidas",
      abb: "Vencida",
      color: "#FF7373",
    },
    [AS.PENDING]: {
      name: "Acciones pendientes",
      abb: "Pendiente",
      color: "orange",
    },
    [AS.EF_OVERDUE]: {
      name: "Acciones con efectividad vencida",
      abb: "Efec. vencida",
      color: "#FF7373",
    },
    [AS.EF_PENDING]: {
      name: "Acciones con efectividad pendiente",
      abb: "Efec. pendiente",
      color: "orange",
    },
    [AS.COMPLETED]: {
      name: "Acciones completas",
      abb: "Completa",
      color: "green",
    },
    [AS.EF_COMPLETED]: {
      name: "Acciones con efectividad completa",
      abb: "Efec. Completa",
      color: "green",
    },
  },
};

const getters = {
  getCurrentFinding: (state) => {
    return state.temp_finding;
  },

  getCurrentCause: (state) => {
    return state.temp_cause;
  },

  getCurrentAction: (state) => {
    return state.temp_action;
  },

  findings_nc_ncm: (state, getters, rootState) => {
    const isAuditEvent =
      rootState.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD ||
      rootState.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD;
    if (isAuditEvent) {
      return state.findings.filter(
        (finding) =>
          finding.deviation.key === "NC" || finding.deviation.key === "NCM"
      );
    } else {
      return state.findings;
    }
  },

  findings_om: (state, getters, rootState) => {
    const auditEvent =
      rootState.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD ||
      rootState.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD;
    if (auditEvent) {
      return state.findings.filter((finding) => finding.deviation.key === "OM");
    } else {
      return state.findings;
    }
  },

  searchCausesFinding: (state) => (id) => {
    return state.causes.filter((cause) => cause.finding === id);
  },

  searchActionsFinding: (state) => (id) => {
    return state.actions.filter((action) => {
      if (action.finding) {
        return action.finding.id === id;
      }
    });
  },

  searchActionsCause: (state) => (id) => {
    return state.actions.filter((action) => {
      if (action.cause) {
        return action.cause.id === id;
      }
    });
  },

  causesWithoutActionsInFinding: (state) => (id) => {
    if (!state.actions.length || !state.causes.length) {
      // No existen ni causas ni acciones
      return true;
    }

    const causesInFinding = state.causes.filter((cause) => cause.finding === id);
    if (!causesInFinding.length) {
      // El hallazgo no tiene causas
      return true;
    }

    let emptyCause = false;
    for (let i = 0; i < causesInFinding.length; i++) {
      const index = state.actions.findIndex((action) => {
        if (action.cause) {
          return action.cause.id === causesInFinding[i].id;
        }
      });
      if (index === -1) {
        emptyCause = true;
        break;
      }
    }
    return emptyCause;
  },

  findingsWithoutCauses: (state, getters, rootState) => {
    let findings = [];
    if (
      rootState.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_AUD ||
      rootState.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_AUD
    ) {
      findings = getters.findings_nc_ncm;
    } else {
      findings = state.findings;
    }
    if (!state.causes.length) {
      return true;
    }
    let emptyFinding = false;
    for (let i = 0; i < findings.length; i++) {
      const index = state.causes.findIndex((cause) => {
        if (cause.finding) {
          return cause.finding === findings[i].id;
        }
      });
      if (index === -1) {
        emptyFinding = true;
        break;
      }
    }
    return emptyFinding;
  },

  causesWithoutActions: (state) => {
    if (!state.causes.length) {
      return true;
    }
    if (!state.actions.length) {
      return true;
    }
    let emptyCause = false;
    for (let i = 0; i < state.causes.length; i++) {
      const index = state.actions.findIndex((action) => {
        if (action.cause) {
          return action.cause.id === state.causes[i].id;
        }
      });
      if (index === -1) {
        emptyCause = true;
        break;
      }
    }
    return emptyCause;
  },

  findingsWithoutActions: (state, getters) => {
    const findings = getters.findings_om;
    if (!findings) {
      return true;
    }
    if (!state.actions.length) {
      return true;
    }
    let emptyFinding = false;
    for (let i = 0; i < findings.length; i++) {
      const index = state.actions.findIndex((action) => {
        if (action.finding) {
          return action.finding.id === findings[i].id;
        }
      });
      if (index === -1) {
        emptyFinding = true;
        break;
      }
    }
    return emptyFinding;
  },

  isFindingWithoutActions: (state) => (id) => {
    if (!state.findings.length) {
      return false;
    }
    if (!state.actions.length) {
      return true;
    }
    const index = state.actions.findIndex((action) => {
      if (action.finding) {
        return action.finding.id === id;
      }
    });
    if (index === -1) {
      return true;
    }
  },

  getFilesAction: (state) => {
    return state.temp_action.files;
  },
};

const mutations = {
  set_parent: (state, payload) => {
    state.parent = payload;
  },

  // FINDINGS
  set_finding: (state, payload) => {
    if (payload.deviation.key === "") {
      payload.deviation = "";
    }
    state.temp_finding = JSON.parse(JSON.stringify(payload));
  },

  setFinding_des: (state, payload) => {
    state.temp_finding.description = payload;
  },

  setFinding_dev: (state, payload) => {
    state.temp_finding.deviation = payload;
  },

  setFinding_behavioral: (state, payload) => {
    state.temp_finding.behavioral = payload;
  },

  set_findings: (state, findings) => {
    // Limpio el state
    state.findings = [];
    state.actions = [];
    state.causes = [];

    // Debo parsear opjeto por objeto del array para no modificar los objetos originales
    if (findings.length > 0) {
      findings.forEach((f) => {
        state.findings.push(JSON.parse(JSON.stringify(f)));
      });

      state.findings.forEach((finding) => {
        let deviation = {};
        deviation.key = finding.deviation;
        if (deviation.key === "NC") deviation.name = "No conformidad";
        if (deviation.key === "NCM") deviation.name = "No conformidad mayor";
        if (deviation.key === "OM") deviation.name = "Oportunidad de mejora";
        finding.deviation = deviation;

        if (finding.causes && finding.causes.length) {
          finding.causes.forEach((cause) => {
            if (cause.actions.length) {
              cause.actions.forEach((action) => {
                action.cause = JSON.parse(JSON.stringify(cause));
                action.due_date = action.due_date.substr(0, 10);
                state.actions.push(action);
              });
            }
            delete cause.actions;
            cause.finding = finding.id;
            state.causes.push(cause);
          });
        } else if (finding.actions && finding.actions.length) {
          finding.actions.forEach((action) => {
            action.finding = finding;
            action.due_date = action.due_date.substr(0, 10);
            state.actions.push(action);
          });
        }
        delete finding.causes;
        delete finding.actions;
      });
      state.actions.forEach((action) => {
        if (action.cause) delete action.cause.actions;
      });
    }
  },

  reset_finding: (state) => {
    state.temp_finding = JSON.parse(JSON.stringify(state.default_finding));
  },

  ADD_FINDING: (state, payload) => {
    const deviation = {};
    deviation.key = payload.deviation;
    if (deviation.key === "NC") deviation.name = "No conformidad";
    if (deviation.key === "NCM") deviation.name = "No conformidad mayor";
    if (deviation.key === "OM") deviation.name = "Oportunidad de mejora";
    payload.deviation = deviation;
    state.findings.unshift(payload);
  },

  UPDATE_FINDING: (state, payload) => {
    const deviation = {};
    deviation.key = payload.deviation;
    if (deviation.key === "NC") deviation.name = "No conformidad";
    if (deviation.key === "NCM") deviation.name = "No conformidad mayor";
    if (deviation.key === "OM") deviation.name = "Oportunidad de mejora";
    payload.deviation = deviation;
    const findingIndex = state.findings.findIndex(
      (finding) => finding.id === payload.id
    );
    state.findings.splice(findingIndex, 1, payload);
  },

  DELETE_FINDING: (state, payload) => {
    const findingIndex = state.findings.findIndex(
      (finding) => finding.id === payload
    );
    state.findings.splice(findingIndex, 1);

    // busco las causas pertenecientes a ese hallazgo
    const causesFinding = state.causes.filter(
      (cause) => cause.finding === payload
    );

    if (causesFinding.length) {
      // Elimino del array causas[] las causas encontradas
      causesFinding.forEach((causeFinding) => {
        const causeIndex = state.causes.findIndex(
          (cause) => cause.id === causeFinding.id
        );
        if (state.actions.length) {
          // Busco las acciones correspondientes a cada causa a eliminar
          const actionsCause = state.actions.filter((action) => {
            if (action.cause) return action.cause.id === causeFinding.id;
          });
          // Elimino las acciones correspondientes a las causas eliminadas
          actionsCause.forEach((actionCause) => {
            const actionIndex = state.actions.indexOf(actionCause);
            state.actions.splice(actionIndex, 1);
          });
        }
        state.causes.splice(causeIndex, 1);
      });
    }
  },

  // CAUSES
  set_cause: (state, payload) => {
    // Limpio el state
    state.actions = [];

    const cause = payload;
    if (cause.cause_type.sub_causes) {
      cause.cause_type.sub_causes = state.cause_types.find(
        (causeType) => causeType.id === payload.cause_type.id
      ).sub_causes;
    }
    state.temp_cause = JSON.parse(JSON.stringify(cause));
  },

  set_causes: (state, payload) => {
    state.causes = JSON.parse(JSON.stringify(payload));
    state.causes.forEach((cause) => {
      if (cause.actions?.length) {
        cause.actions.forEach((action) => {
          action.cause = JSON.parse(JSON.stringify(cause));
          state.actions.push(action);
        });
      }
      delete cause.actions;
    });
    state.actions.forEach((action) => {
      delete action.cause?.actions;
    });
  },

  set_causeDes: (state, payload) => {
    state.temp_cause.description = payload;
  },

  set_causeType: (state, payload) => {
    state.temp_cause.cause_type = JSON.parse(JSON.stringify(payload));
  },

  set_subcause: (state, payload) => {
    state.temp_cause.sub_cause = payload;
  },

  ADD_CAUSE: (state, payload) => {
    state.causes.unshift(payload);
  },

  UPDATE_CAUSE: (state, payload) => {
    const causeIndex = state.causes.findIndex((cause) => cause.id === payload.id);
    state.causes.splice(causeIndex, 1, payload);
  },

  DELETE_CAUSE: (state, payload) => {
    const causeIndex = state.causes.findIndex((cause) => cause.id === payload);
    state.causes.splice(causeIndex, 1);

    // busco las acciones pertenecientes a esa causa
    const actionsCause = state.actions.filter((action) => {
      if (action.cause) return action.cause.id === payload;
    });

    // Elimino las acciones correspondientes a las causas eliminadas
    actionsCause.forEach((actionFinding) => {
      const actionIndex = state.actions.indexOf(actionFinding);
      state.actions.splice(actionIndex, 1);
    });
  },

  UPDATE_CAUSE_TYPES: (state, payload) => {
    state.cause_types = payload.slice();
  },

  // ACTIONS

  set_actions_filter: (state, filters) => {
    state.actionsFilters = { ...state.actionsFilters, ...filters };
    purgeFilters(state.actionsFilters, filters);
  },

  reset_fca_filters: (state) => {
    state.actionsFilters = {};
  },

  set_actions: (state, actions) => {
    state.actions = actions.slice();
  },

  SET_ACTION: (state, action) => {
    state.temp_action = action;
    if (action.files.length) {
      state.temp_action.files = action.files.map((file) => {
        return {
          ...file,
          ext: file.name.split(".").pop(),
          description: "",
          uploaded: true,
          uploadPercentage: 0,
          error: false,
          deleting: false,
        };
      });
    }
  },

  SET_ACTIONS_DATA: (state, actionsData) => {
    const { results, ...data } = actionsData;
    state.actionsData = data;
    state.actions = results;
  },

  SET_ACTIONS_LOADING: (state, status) => {
    state.loading.fetchActions = status;
  },

  clean_fca: (state) => {
    state.actions = [];
    state.causes = [];
    state.findings = [];
    state.parent = null;
  },

  setAction_event: (state, payload) => {
    state.temp_action.event = payload;
  },

  set_action: (state, payload) => {
    if (payload.files) {
      const actionFiles = [];
      payload.files.forEach((file) => {
        actionFiles.push({
          ...file,
          uploaded: true,
          ext: file.name.split(".").pop(),
        });
      });
      payload.files = actionFiles;
    }
    state.temp_action = JSON.parse(JSON.stringify(payload));
    state.temp_action.due_date = state.temp_action.due_date.substr(0, 10);
    // if (state.temp_action.action_result === null)
    //   state.temp_action.action_result = "";
    // if (state.temp_action.effectiveness_validation_method === null) {
    //   state.temp_action.effectiveness_validation_method = "";
    // }
  },

  reset_cause: (state) => {
    state.temp_cause = JSON.parse(JSON.stringify(state.default_cause));
  },

  setAction_des: (state, payload) => {
    state.temp_action.description = payload;
  },

  reset_action: (state) => {
    state.temp_action = JSON.parse(JSON.stringify(state.default_action));
  },

  setAction_cause: (state, payload) => {
    state.temp_action.cause = payload;
  },

  setAction_owner: (state, payload) => {
    state.temp_action.owner = payload;
  },

  setAction_due_date: (state, payload) => {
    if (!payload) {
      state.temp_action.due_date = "";
      return;
    }
    const [day, month, year] = payload.split("-");
    state.temp_action.due_date = `${year}-${month}-${day}`;
  },

  setAction_action_type: (state, payload) => {
    state.temp_action.action_type = payload;
  },

  setAction_immediate: (state, payload) => {
    state.temp_action.immediate = payload;
  },

  setAction_result: (state, payload) => {
    state.temp_action.action_result = payload;
  },

  setAction_eff_validation_method: (state, payload) => {
    state.temp_action.effectiveness_validation_method = payload;
  },

  setAction_effectiveness_date: (state, effectiveness_date) => {
    if (!effectiveness_date) {
      state.temp_action.effectiveness_date = null;
      return;
    }
    // const [day, month, year] = payload.split("-");
    // state.temp_action.effectiveness_date = `${year}-${month}-${day}`;
    state.temp_action.effectiveness_date = effectiveness_date;
  },

  set_effectiveness_result: (state, payload) => {
    state.temp_action.effectiveness_ok = payload;
  },

  set_effectiveness_comment: (state, payload) => {
    state.temp_action.effectiveness_result = payload;
  },

  setAction_postpone_reason: (state, payload) => {
    state.temp_action.postpone_reason = payload;
  },

  set_action_files: (state, payload) => {
    state.temp_action.files.push(...payload);
  },

  delete_action_file: (state, fileId) => {
    const fileIndex = state.temp_action.files.findIndex(
      (file) => file.id.toString() === fileId.toString()
    );
    state.temp_action.files.splice(fileIndex, 1);
  },

  delete_fca_arrays(state) {
    state.findings = [];
    state.causes = [];
    state.actions = [];
  },

  ADD_ACTION: (state, payload) => {
    payload.due_date = payload.due_date.substr(0, 10);
    state.actions.unshift(payload);
  },

  UPDATE_ACTION: (state, payload) => {
    state.temp_action = JSON.parse(JSON.stringify(payload));
    if (payload.files.length) {
      state.temp_action.files = payload.files.map((file) => {
        return {
          ...file,
          ext: file.name.split(".").pop(),
          description: "",
          uploaded: true,
          uploadPercentage: 0,
          error: false,
          deleting: false,
        };
      });
    }

    if (typeof state.actions === "object") return;
    const actionIndex = state.actions.findIndex(
      (action) => action.id === state.temp_action.id
    );
    state.temp_action.due_date = state.temp_action.due_date.substr(0, 10);
    state.actions.splice(actionIndex, 1, state.temp_action);
  },

  DELETE_ACTION: (state, payload) => {
    const actionIndex = state.actions.findIndex(
      (action) => action.id === payload
    );
    state.actions.splice(actionIndex, 1);
  },

  FILL_ACTION_BOARD: (state, payload) => {
    state.actions = payload;
  },
};

const actions = {
  get_actions: ({ commit }) => {
    commit("SET_ACTIONS_LOADING", true);
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .get(`actions/search`, {
          params: state.actionsFilters,
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then((res) => {
          commit("SET_ACTIONS_DATA", res.data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          commit("SET_ACTIONS_LOADING", false);
        });
    });
  },

  getAllActions: (context, payload) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .get(`actions/search`, {
          params: payload,
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then((response) => {
          context.commit("FILL_ACTION_BOARD", response.data.results);
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  add_finding: (context) => {
    return new Promise((resolve, reject) => {
      const finding = JSON.parse(JSON.stringify(state.temp_finding));
      finding.event = state.parent.id;
      eatApi
        .getFetcher()
        .post("findings/", finding)
        .then((response) => {
          context.commit("ADD_FINDING", response.data.results);
          resolve(response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  update_finding: (context) => {
    return new Promise((resolve, reject) => {
      const finding = JSON.parse(JSON.stringify(state.temp_finding));
      finding.event = state.parent.id;
      finding.deviation =
        state.temp_finding.deviation.key || state.temp_finding.deviation;
      eatApi
        .getFetcher()
        .put(`findings/${finding.id}`, finding)
        .then((response) => {
          context.commit("UPDATE_FINDING", response.data.results);
          resolve(response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  delete_finding: (context, payload) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .delete(`findings/${payload}`)
        .then((res) => {
          if (res) {
            context.commit("DELETE_FINDING", payload);
            resolve();
            return;
          }
          reject();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  add_cause: (context) => {
    return new Promise((resolve, reject) => {
      const cause = JSON.parse(JSON.stringify(state.temp_cause));
      if (state.parent.type === "finding") {
        cause.finding = state.parent.id;
      } else {
        cause.event = state.parent.id;
      }
      cause.cause_type = cause.cause_type.id;
      cause.sub_cause = cause?.sub_cause.id;
      eatApi
        .getFetcher()
        .post("causes/", cause)
        .then((response) => {
          context.commit("ADD_CAUSE", response.data.results);
          resolve(response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  update_cause: (context) => {
    const cause = JSON.parse(JSON.stringify(state.temp_cause));
    cause.cause_type = cause.cause_type.id;
    cause.sub_cause = cause.sub_cause?.id;
    // if (state.parent.type === "finding") {
    //   cause.finding = state.parent.id;
    // } else {
    //   cause.event = state.parent.id;
    // }
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .put(`causes/${state.temp_cause.id}`, cause)
        .then((response) => {
          context.commit("UPDATE_CAUSE", response.data.results);
          resolve(response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  delete_cause: (context, payload) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .delete(`causes/${payload}`)
        .then((res) => {
          if (res) {
            context.commit("DELETE_CAUSE", payload);
            resolve();
            return;
          }
          reject();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  get_action: (context, actionID) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .get(`actions/${actionID}`)
        .then(({ data }) => {
          context.commit("SET_ACTION", data.results);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  add_action: (context) => {
    return new Promise((resolve, reject) => {
      const action = JSON.parse(JSON.stringify(state.temp_action));
      action.owner = action.owner.id;
      if (state.parent.type === "cause") {
        action.cause = state.parent.id;
      } else if (state.parent.type === "finding") {
        action.finding = state.parent.id;
      } else {
        action.event = state.parent.id;
      }
      delete action.effectiveness;
      delete action.effectiveness_date;
      delete action.original_due_date;
      delete action.completed_date;
      eatApi
        .getFetcher()
        .post("actions/", action)
        .then((response) => {
          context.commit("ADD_ACTION", response.data.results);
          resolve(response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  update_action: (context, data) => {
    return new Promise((resolve, reject) => {
      const action = {
        ...JSON.parse(JSON.stringify(state.temp_action)),
        ...data,
      };
      action.owner = action.owner.id;
      if (action.event) delete action.event;
      if (action.finding) delete action.finding;
      if (action.cause) delete action.cause;
      action.effectiveness_result ||= null;
      eatApi
        .getFetcher()
        .put(`actions/${action.id}`, action)
        .then(({ data }) => {
          // context.commit("UPDATE_ACTION", response.data.results);
          resolve(data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  delete_action: (context, payload) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .delete(`actions/${payload}`)
        .then((res) => {
          if (res) {
            context.commit("DELETE_ACTION", payload);
            resolve();
            return;
          }
          reject();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  complete_action: (context, payload) => {
    return new Promise((resolve, reject) => {
      const action = {
        action_result: state.temp_action.action_result,
        effectiveness_date: state.temp_action.effectiveness_date,
        effectiveness_validation_method:
          state.temp_action.effectiveness_validation_method,
      };
      eatApi
        .getFetcher()
        .post(`actions/${payload}/move-to-complete`, action)
        .then(({ data }) => {
          resolve(data.results);
        })
        .catch((error) => {
          reject(error.response.data.code);
        });
    });
  },

  postpone_action: (context, payload) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .put(`actions/${payload}/reset-due-date`, {
          new_due_date: context.state.temp_action.due_date,
          postpone_reason: context.state.temp_action.postpone_reason,
        })
        .then((response) => {
          resolve(response);
          context.commit("UPDATE_ACTION", response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  complete_effectiveness: (context) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .put(`actions/${state.temp_action.id}/set-effectiveness`, {
          effectiveness_ok: state.temp_action.effectiveness_ok,
          effectiveness_result: state.temp_action.effectiveness_result || null,
        })
        .then((response) => {
          resolve(response);
          context.commit("UPDATE_ACTION", response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  get_cause_types: (context) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .get(`/cause-types`)
        .then((response) => {
          context.commit("UPDATE_CAUSE_TYPES", response.data.results);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
