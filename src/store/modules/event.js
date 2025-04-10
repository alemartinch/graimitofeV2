// TODO: mover usuarios a otro store
import { eatApi } from "@/apis";
import { saveFileAndUploadToS3 } from "@/store/modules/s3upload";
import { eventsParameters } from "@/store/modules/eventsParameters";
import {
  ACTION_STATUSES as AS,
  EVENT_ORIGINS as EO,
  EVENT_STATUSES as ES,
} from "@/mixins/globals";
import qs from "qs";
import { purgeFilters } from "@/store/modules/helpers";
import { getSixMonthsAgo, getToday } from "./helpers.js";

const state = {
  temp_event: {
    id: null,
    originator: null,
    leader: null,
    equipment_category: null,
    equipment_id: "",
    equipment_description: "",
    added_date: "",
    facility: "",
    sector: "",
    occurrence_date: "",
    occurrence_time: "",
    description: "",
    summary: "",
    learning_experience: false,
    participants: [],
    event_origin: "",
    process_areas: [],
    classification: null,
    files: [],
    status: ES.PENDING_ACTIONS,
    form: "R",
    leader_comments: "",
    tags: [],
    restricted: false,
  },

  participantsSwitch: false,

  default_event: {
    id: null,
    originator: null,
    leader: null,
    equipment_category: null,
    equipment_id: "",
    equipment_description: "",
    added_date: new Date().toISOString(),
    facility: "",
    sector: "",
    occurrence_date: "",
    occurrence_time: "",
    description: "",
    summary: "",
    learning_experience: false,
    participants: [],
    event_origin: "",
    process_areas: [],
    files: [],
    status: ES.PENDING_ACTIONS,
    form: "R",
    tags: [],
    leader_comments: "",
    restricted: false,
  },

  events: [],
  homePageEvents: [],
  loading: { fetchEvents: false, updateEvent: false },
  eventsFilters: {},
  eventsData: {},

  equipment_categories: [],
  facilities: [],
  process_areas: [],
  users: [],

  availableFields: {},

  postEdit: false,

  ...eventsParameters,
};

const getters = {
  getCurrentEvent: (state) => {
    return state.temp_event;
  },
  getParticipantsSwitch: (state) => {
    return state.participantsSwitch;
  },

  getHarFacilities: (state) => {
    // state.facilities.push({ name: "Todos", id: -1 });
    return state.facilities;
  },

  getStatusList: (state) => {
    const eStatuses = [];
    for (const e in state.statuses) {
      if (e !== ES.OPEN) {
        eStatuses.push({
          key: e,
          name: state.statuses[e].name,
          abb: state.statuses[e].abb,
        });
      }
    }
    return eStatuses;
  },

  getFcaPanelTitle(state) {
    if (state.availableFields.findings && state.availableFields.actions) {
      return "Hallazgos y Acciones";
    }
    if (state.availableFields.findings) {
      return "Hallazgos, Causas y Acciones";
    }
    if (state.availableFields.causes) {
      return "Causas y Acciones";
    }
    if (state.availableFields.actions) {
      return "Acciones";
    }
    return "";
  },

  getFindingsOrdered: (state) => {
    if (state.temp_event.findings) {
      return state.temp_event.findings.sort((a, b) => {
        return a.id - b.id;
      });
    }
  },

  getOccurrenceDateFormat: (state) => {
    const date = state.temp_event.occurrence_date;
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  },

  participantsList: (state) => {
    if (!state.temp_event.participants.length) {
      return false;
    }
    const participants = [];
    state.temp_event.participants.forEach((participant) => {
      participants.push(`${participant.first_name} ${participant.last_name} `);
    });
    return participants.join(" ● ");
  },

  getOriginName: (state) => {
    if (state.temp_event.event_origin) {
      return state.eventOrigins[state.temp_event.event_origin].name;
    }
  },

  extractActions: (state) => {
    const actions = [];
    if (state.temp_event?.findings?.length) {
      state.temp_event.findings.forEach((finding) => {
        if (finding.causes.length) {
          finding.causes.forEach((cause) => {
            cause.actions.forEach((action) => {
              action.parent = {
                type: "cause",
                id: cause.id,
                description: cause.description,
              };
              actions.push(action);
            });
          });
        }
        if (finding.actions.length) {
          finding.actions.forEach((action) => {
            action.parent = {
              type: "finding",
              id: finding.id,
              description: finding.description,
            };
            actions.push(action);
          });
        }
      });
    }
    if (state.temp_event?.causes?.length) {
      state.temp_event.causes.forEach((cause) => {
        cause.actions.forEach((action) => {
          action.parent = {
            type: "cause",
            id: cause.id,
            description: cause.description,
          };
          actions.push(action);
        });
      });
    }
    if (state.temp_event?.actions?.length) {
      state.temp_event.actions.forEach((action) => {
        action.parent = {
          type: "event",
          id: state.temp_event.id,
          description: state.temp_event.summary,
        };
        actions.push(action);
      });
    }
    return actions;
  },

  noCompletedActionInEvent: (state, { extractActions }) => {
    return !extractActions.some((action) =>
      [AS.COMPLETED, AS.EF_COMPLETED].includes(action.status),
    );
  },

  extractCauses: (state) => {
    const causes = [];
    if (state.temp_event.findings.length) {
      state.temp_event.findings.forEach((finding) => {
        if (finding.causes.length) {
          finding.causes.forEach((cause) => {
            cause.parent = {
              type: "finding",
              id: finding.id,
              description: finding.description,
            };
            causes.push(cause);
          });
        }
      });
    }
    if (state.temp_event.causes.length) {
      state.temp_event.causes.forEach((cause) => {
        cause.parent = {
          type: "event",
          id: state.temp_event.id,
          description: state.temp_event.summary,
        };
        causes.push(cause);
      });
    }
    return causes;
  },

  getEventTags: () => {
    return state.temp_event.tags;
  },
};

const mutations = {
  CREATE_EVENT: (state, payload) => {
    state.temp_event.id = payload.id;
    state.temp_event.originator = payload.originator;
    state.temp_event.event_origin = payload.event_origin;
    state.temp_event.added_date = payload.added_date;
  },

  UPDATE_EVENT: () => {
    // ???
  },

  DELETE_EVENT: (eventId) => {
    const eventIndex = state.events.findIndex((event) => event.id === eventId);
    state.events.splice(eventIndex, 1);
  },

  SAVE_EVENT: (state, payload) => {
    // ???
  },

  set_dateFirstStep: (state, payload) => {
    state.dateFirstStep = payload;
  },

  set_timeFirstStep: (state, payload) => {
    state.timeFirstStep = payload;
  },

  set_events: (state, payload) => {
    state.events = JSON.parse(JSON.stringify(payload));
  },

  set_event: (state, payload) => {
    state.temp_event = JSON.parse(JSON.stringify(payload));

    //Seteo un valor vacío a todas las propiedades con valor null
    for (const prop in state.temp_event) {
      if (state.temp_event[prop] === null) {
        state.temp_event[prop] = "";
      }
    }

    // Formateo la fecha de ocurrencia
    state.temp_event.occurrence_date = state.temp_event.occurrence_date.substr(
      0,
      10,
    );

    if (state.temp_event?.event_origin === EO.MEET) {
      if (!state.temp_event.facility) {
        state.temp_event.facility = { name: "No Aplica", id: "N/A" };
      }
      if (!state.temp_event.sector) {
        state.temp_event.sector = { name: "No Aplica", id: "N/A" };
      }
    }

    if (payload.files?.length) {
      state.temp_event.files = payload.files.map((file) => {
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

  set_id: (state, payload) => {
    state.temp_event.id = payload;
  },

  set_originator: (state, payload) => {
    state.temp_event.originator = payload;
  },

  set_eventOrigin: (state, payload) => {
    state.temp_event.event_origin = payload;
    for (const k in state.availableFields) {
      state.availableFields[k] = false;
    }
    switch (payload) {
      case EO.CHANGE:
        state.availableFields = {
          ...state.availableFields,
          process_areas: true,
          facility: true,
          sector: true,
          leader: true,
          summary: true,
          link_folder: true,
          actions: true,
        };
        break;
      case EO.EXTERNAL_AUD:
      case EO.INTERNAL_AUD:
        state.availableFields = {
          ...state.availableFields,
          process_areas: true,
          facility: true,
          leader: true,
          participants: true,
          occurrence_date: true,
          summary: true,
          description: true,
          link_folder: true,
          findings: true,
          action_type: true,
          action_cause: true,
        };
        break;
      case EO.PROJECT:
        state.availableFields = {
          ...state.availableFields,
          process_areas: true,
          facility: true,
          sector: true,
          summary: true,
          link_folder: true,
          actions: true,
          action_cause: true,
        };
        break;
      case EO.INTERNAL_REQ:
      case EO.EXTERNAL_REQ:
        state.availableFields = {
          ...state.availableFields,
          facility: true,
          summary: true,
          description: true,
          link_folder: true,
          actions: true,
        };
        break;
      case EO.CRITICAL_EVENT:
        state.availableFields = {
          ...state.availableFields,
          process_areas: true,
          facility: true,
          sector: true,
          leader: true,
          occurrence_date: true,
          occurrence_time: true,
          summary: true,
          description: true,
          learning_experience: true,
          participants: true,
          equipment: true,
          link_folder: true,
          causes: true,
          action_type: true,
          classification: true,
        };
        break;
      case EO.OBSERVATION:
        state.availableFields = {
          ...state.availableFields,
          process_areas: true,
          facility: true,
          sector: true,
          occurrence_date: true,
          occurrence_time: true,
          link_folder: true,
          findings: true,
          actions: true,
        };
        break;
      case EO.MEET:
        state.availableFields = {
          ...state.availableFields,
          process_areas: true,
          facility: true,
          sector: true,
          leader: true,
          summary: true,
          occurrence_date: true,
          description: true,
          participants: true,
          actions: true,
          action_cause: true,
        };
        break;
    }
  },

  set_post_edit: (state, payload) => {
    state.postEdit = payload;
  },

  set_processArea: (state, payload) => {
    state.temp_event.process_areas = [payload];
  },

  set_eventCategory: (state, payload) => {
    state.temp_event.classification = payload;
  },

  set_facility: (state, payload) => {
    state.temp_event.facility = payload;
  },

  set_sector: (state, payload) => {
    state.temp_event.sector = payload;
  },

  set_addedDate: (state, payload) => {
    state.temp_event.added_date = payload;
  },

  set_occurrenceDate: (state, payload) => {
    state.temp_event.occurrence_date = payload;
  },

  set_occurrenceTime: (state, payload) => {
    state.temp_event.occurrence_time = payload;
  },

  set_summary: (state, payload) => {
    state.temp_event.summary = payload;
  },

  set_description: (state, payload) => {
    state.temp_event.description = payload;
  },

  set_learningExp: (state, payload) => {
    state.temp_event.learning_experience = payload;
  },

  set_equipment_cat: (state, payload) => {
    state.temp_event.equipment_category = payload;
  },

  set_equipment_id: (state, payload) => {
    state.temp_event.equipment_id = payload;
  },

  set_equipment_des: (state, payload) => {
    state.temp_event.equipment_description = payload;
  },

  set_leader: (state, payload) => {
    state.temp_event.leader = payload;
  },

  set_leader_comments: (state, payload) => {
    state.temp_event.leader_comments = payload;
  },

  remove_leader: (state) => {
    state.temp_event.leader = null;
  },

  set_participants: (state, payload) => {
    state.temp_event.participants = payload;
  },

  set_participants_switch: (state, payload) => {
    state.participantsSwitch = payload;
  },

  remove_participants: (state, payload) => {
    const index = state.temp_event.participants.findIndex(
      (p) => p.id === payload.id,
    );
    if (index >= 0) state.temp_event.participants.splice(index, 1);
  },

  set_equipment: (state, payload) => {
    state.temp_event.equipment = payload;
  },

  delete_event_file: (state, fileId) => {
    const fileIndex = state.temp_event.files.findIndex(
      (file) => file.id === fileId,
    );
    state.temp_event.files.splice(fileIndex, 1);
  },

  set_file: (state, file) => {
    state.temp_event.files.push({ ...file });
  },

  clean_tempEvent: (state, payload = state.default_event) => {
    state.temp_event = JSON.parse(JSON.stringify(payload));
  },

  set_events_filter: (state, filters) => {
    state.eventsFilters = { ...state.eventsFilters, ...filters };
    purgeFilters(state.eventsFilters, filters);
  },

  SET_EVENTS_DATA: (state, eventsData) => {
    const { results, ...data } = eventsData;
    state.eventsData = data;
    state.events = results;
  },

  SET_EVENTS_LOADING: (state, status) => {
    state.loading.fetchEvents = status;
  },

  PUSH_EVENT_TAGS: (state, tags) => {
    state.temp_event.tags.push(...tags);
  },

  DELETE_EVENT_TAG: (state, tagID) => {
    const tagIndex = state.temp_event.tags.findIndex((tag) => tag.id === tagID);
    state.temp_event.tags.splice(tagIndex, 1);
  },

  SET_RESTRICTED_EVENT(state, payload) {
    state.temp_event.restricted = payload;
  },
};

const actions = {
  get_events: ({ commit }) => {
    commit("SET_EVENTS_LOADING", true);
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .get("events/full/search", {
          params: state.eventsFilters,
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then((res) => {
          commit("SET_EVENTS_DATA", res.data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          commit("SET_EVENTS_LOADING", false);
        });
    });
  },

  create_event: (context, payload) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .post("events/", payload)
        .then((response) => {
          context.commit("CREATE_EVENT", response.data.results);
          resolve(response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  update_event: (context) => {
    const event = JSON.parse(JSON.stringify(state.temp_event));

    // Preparo el evento a enviar con los datos adecuados
    event.originator = state.temp_event.originator?.id;
    event.event_origin = state.temp_event.event_origin;
    event.added_date = state.temp_event.added_date.substr(0, 10);
    event.facility =
      event.facility?.id === "N/A" ? null : state.temp_event.facility.id;
    event.sector =
      event.sector?.id === "N/A" ? null : state.temp_event.sector.id;
    event.leader = state.temp_event.leader ? state.temp_event.leader.id : null;
    event.equipment_category = state.temp_event.equipment_category
      ? state.temp_event.equipment_category.id
      : null;

    if (!event.occurrence_date) {
      event.occurrence_date = null;
    }

    if (!event.occurrence_time) {
      event.occurrence_time = null;
    }

    // Adecuo los participantes
    event.participants = [];
    state.temp_event.participants?.forEach((p) =>
      event.participants.push(p.id),
    );

    // Adecuo las areas de procesos
    event.process_areas = [];
    state.temp_event.process_areas.forEach((pa) =>
      event.process_areas.push(pa.id),
    );

    // Adecuo las Tags
    event.tags = [];
    state.temp_event.tags.forEach((tag) => event.tags.push(tag.id));

    state.loading.updateEvent = true;
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .put("events/" + event.id, event)
        .then((response) => {
          context.commit("UPDATE_EVENT", response.data.results);
          setTimeout(() => {
            state.loading.updateEvent = false;
          }, 500);
          resolve();
        })
        .catch((error) => {
          state.loading.updateEvent = false;
          reject(error);
        });
    });
  },

  save_event: (context) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .post(`/events/${state.temp_event.id}/move-to-apen`)
        .then((response) => {
          context.commit("SAVE_EVENT", response.data.results);
          resolve(response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  delete_current_event: () => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .delete("events/" + state.temp_event.id)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  delete_event: ({ commit }, eventID) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .delete("events/" + eventID)
        .then(() => {
          commit("DELETE_EVENT", eventID);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  send_event_file: ({ state, commit }, fileList) => {
    [...fileList].forEach((file) => {
      commit("set_file", {
        file: file,
        name: file.name,
        size: file.size,
        ext: file.name.split(".").pop(),
        description: "",
        uploaded: false,
        uploadPercentage: 0,
        error: false,
        deleting: false,
      });
    });
    state.temp_event.files.forEach((file) => {
      if (!file.uploaded) {
        const objectData = {
          event: state.temp_event.id,
          description: file.description,
          size: file.size,
        };
        saveFileAndUploadToS3(
          eatApi.getFetcher(),
          `events/${state.temp_event.id}/files`,
          objectData,
          file,
        )
          .then((response) => {
            file.filename = response.data.results.filename;
            file.uploaded = true;
            file.id = response.data.results.id;
          })
          .catch(() => {
            file.error = true;
          });
      }
    });
  },

  delete_uploaded_event_file: ({ commit, state }, fileId) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .delete(`events/${state.temp_event.id}/files/${fileId}`)
        .then(() => {
          commit("delete_event_file", fileId);
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
