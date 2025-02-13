import { tcmtRegApi } from "@/apis";
import { harParameters } from "@/store/modules/harParameters";
import { purgeFilters } from "@/store/modules/helpers";
import qs from "qs";
import { saveFileAndUploadToS3 } from "@/store/modules/s3upload";

const state = {
  regulation: {
    id: null,
    tier: "",
    authority: "",
    regulation_code: "",
    link: "",
    issue_year: "",
    last_update_year: "",
    implementation_date: "",
    review: "",
    subject: "",
    obligations: "",
    process_area_id: 0,
  },

  regulationFilters: {},

  regulationsData: {},

  loadings: {
    fetchRegulations: false,
    fetchOccurrences: false,
    fetchOccurrence: false,
  },

  assessment: {
    id: null,
    compliance: null,
    compliance_evidence: "",
    facility_id: -1,
    regulation_id: null,
    files: [],
    sectors: [0],
    repetitive_action_required: false,
  },

  assessments: [],

  task: {
    id: null,
    frequency_active: false,
    frequency_key: "DAY",
    frequency_number: 0,
    next_due_date: "",
    pre_warning_days: 1,
    pre_warning_active: false,
    description: "",
    regulation_id: null,
    facility_id: null,
    owner: null,
    active: true,
    files: [],
  },

  tasks: [],

  occurrence: {
    comments: [],
    complete_date: null,
    description: "",
    due_date: "",
    id: null,
    owner: null,
    pre_warning_days: 0,
    repet_action_id: 0,
    status: "",
    tier: "",
    itemsTotal: "",
  },

  occurrences: [],

  occurrencesFilters: {},

  occurrencesData: {},

  tasksData: {},

  ...harParameters,
};

const getters = {
  getCurrentTask(state) {
    return state.task;
  },

  getCurrentOccurrence(state) {
    return state.occurrence;
  },

  getRegulationsTable(state) {
    // return state.regulationsData.results;
    if (state.regulationsData.results) {
      return state.regulationsData.results.map((regulation) => {
        let lastEvaluations = [];
        if (regulation.assessments.length) {
          lastEvaluations = regulation.assessments
            .filter((assessment) => assessment.current_revision)
            .map(({ facility, created_on, compliance }) => {
              return {
                facility: facility ? facility.name : "Todos",
                compliance: state.assessmentResults[compliance].name,
                created_on,
              };
            });
        }
        return { ...regulation, status: lastEvaluations };
      });
    }
  },

  getTasksById(state) {
    return state.regulation.repet_actions.sort((a, b) => a.id - b.id);
  },

  getOccurrencesByTask(state) {
    const occurrences = state.occurrencesData.results || [];
    if (
      !["repet_action_id", "-repet_action_id"].includes(
        state.occurrencesFilters.ordering,
      )
    ) {
      return [
        {
          occurrences,
        },
      ];
    }

    const tasks = occurrences.map((oc) => {
      return { id: oc.repet_action.id, occurrences: [] };
    });

    const uTasks = Array.from(new Set(tasks.map((t) => t.id))).map((task) => {
      return tasks.find((t) => t.id === task);
    });

    uTasks.forEach((task) => {
      occurrences.forEach((occurrence) => {
        if (occurrence.repet_action.id === task.id)
          task.occurrences.push(occurrence);
      });
    });
    return uTasks;
  },

  getAssessmentsByCurrency(state) {
    return state.regulation.assessments.sort(
      (a, b) => b.current_revision - a.current_revision,
    );
  },

  getRegulationFilters(state) {
    return state.regulationFilters;
  },
};

const mutations = {
  SET_OCCURRENCE_TOTAL_ITEM: (state, totalItems) => {
    state.occurrence.itemsTotal = totalItems;
  },

  SET_LOADING_TRUE: (state, loading) => {
    state.loadings[loading] = true;
  },

  SET_LOADING_FALSE: (state, loading) => {
    state.loadings[loading] = false;
  },

  SET_REGULATION_LOADING: (state, status) => {
    state.loadings.fetchRegulations = status;
  },

  SET_OCCURRENCES_LOADING: (state, status) => {
    state.loadings.fetchOccurrences = status;
  },

  // REGULATIONS
  set_regulation: (state, payload) => {
    state.regulation = JSON.parse(JSON.stringify(payload));
  },

  reset_regulation: (state) => {
    state.regulation = {
      id: null,
      tier: "",
      authority: "",
      regulation_code: "",
      link: "",
      issue_year: "",
      last_update_year: "",
      implementation_date: "",
      review: "",
      subject: "",
      obligations: "",
      process_area_id: 0,
    };
  },

  set_regulation_filter: (state, filters) => {
    state.regulationFilters = { ...state.regulationFilters, ...filters };
    purgeFilters(state.regulationFilters, filters);
  },

  SET_REGULATIONS: (state, regulations) => {
    state.regulationsData = JSON.parse(JSON.stringify(regulations));
  },

  // OCCURRENCES
  set_occurrence: (state, occurrence) => {
    occurrence.entries = occurrence.entries.map((entry) => {
      entry.files = entry.files.map((file) => {
        return {
          ...file,
          uploaded: true,
          ext: file.name.split(".").pop(),
        };
      });
      return {
        ...entry,
        edit: false,
      };
    });
    state.occurrence = occurrence;
  },

  add_occurrences_filters: (state, filters) => {
    state.occurrencesFilters = { ...state.occurrencesFilters, ...filters };
    purgeFilters(state.occurrencesFilters, filters);
  },

  set_occurrences_filters: (state, filters) => {
    state.occurrencesFilters = { ...state.occurrencesFilters, ...filters };
    purgeFilters(state.occurrencesFilters);
  },

  SET_OCCURRENCES: (state, data) => {
    // state.occurrences = data.results.slice();
    const occurrences = data.results;
    occurrences.forEach((occurrence) => {
      occurrence.entries = occurrence.entries.map((entry) => {
        entry.files = entry.files.map((file) => {
          return {
            ...file,
            uploaded: true,
            ext: file.name.split(".").pop(),
          };
        });
        return {
          ...entry,
          edit: false,
        };
      });
    });
    state.occurrencesData = JSON.parse(JSON.stringify(data));
  },

  // ASSESSMENTS
  set_assessment_type: (state, typeReg) => {
    state.assessment.is_internal_regulation = typeReg;
  },

  set_compliance: (state, payload) => {
    state.assessment.compliance = payload;
  },

  set_sectors: (state, payload) => {
    state.assessment.sectors = payload;
  },

  set_compliance_evidence: (state, payload) => {
    state.assessment.compliance_evidence = payload;
  },

  set_facility: (state, payload) => {
    state.assessment.facility_id = payload;
  },

  set_assessments: (state, payload) => {
    state.assessments = payload.slice();
  },

  set_assessment_files: (state, payload) => {
    state.assessment.files.push(...payload);
  },

  delete_assessment_file: (state, fileId) => {
    const fileIndex = state.assessment.files.findIndex(
      (file) => file.id.toString() === fileId.toString(),
    );
    state.assessment.files.splice(fileIndex, 1);
  },

  reset_assessment: (state) => {
    state.assessment = {
      id: null,
      compliance: null,
      compliance_evidence: "",
      repetitive_action_required: true,
      facility_id: -1,
      regulation_id: 0,
      is_internal_regulation: false,
      sectors: [],
      files: [],
    };
  },

  FILL_ASSESSMENTS: (state, payload) => {
    state.assessments.push(...payload);
  },

  SET_ASSESSMENT: (state, payload) => {
    const assessmentFiles = [];
    payload.files.forEach((file) => {
      assessmentFiles.push({
        ...file,
        uploaded: true,
        ext: file.name.split(".").pop(),
      });
    });
    payload.files = assessmentFiles;
    payload.facility_id ??= -1;
    state.assessment = JSON.parse(JSON.stringify(payload));
  },

  SET_ASSESSMENT_FILES: (state, payload) => {
    state.assessment.files.push({
      ...payload,
      uploaded: true,
      ext: payload.name.split(".").pop(),
    });
  },

  // TASKS
  set_task_files: (state, payload) => {
    state.task.files.push(...payload);
  },

  delete_task_file: (state, fileId) => {
    const fileIndex = state.task.files.findIndex(
      (file) => file.id.toString() === fileId.toString(),
    );
    state.task.files.splice(fileIndex, 1);
  },

  set_task: (state, payload) => {
    const taskFiles = [];
    payload.files.forEach((file) => {
      taskFiles.push({
        ...file,
        uploaded: true,
        ext: file.name.split(".").pop(),
      });
    });
    payload.files = taskFiles;
    payload.facility_id ??= -1;
    payload.frequency_active = payload.frequency_key !== "NO";
    state.task = JSON.parse(JSON.stringify(payload));
  },

  set_task_owner: (state, payload) => {
    state.task.owner = payload;
  },

  set_task_description: (state, payload) => {
    state.task.description = payload;
  },

  set_task_facility: (state, facility_id) => {
    state.task.facility_id = facility_id;
  },

  set_task_nextDueDate: (state, payload) => {
    state.task.next_due_date = payload;
  },

  set_task_frequency_key: (state, payload) => {
    state.task.frequency_key = payload;
  },

  set_task_frequency_number: (state, payload) => {
    state.task.frequency_number = payload;
  },

  set_task_preWarningActive: (state, payload) => {
    state.task.pre_warning_active = payload;
  },

  set_task_frequencyActive: (state, payload) => {
    state.task.frequency_active = payload;
  },

  set_task_preWarningDays: (state, payload) => {
    state.task.pre_warning_days = payload;
  },

  set_task_regulation_id: (state, payload) => {
    state.task.regulation_id = payload;
  },

  set_task_active: (state, activation) => {
    state.task.active = activation;
  },

  reset_task: (state) => {
    state.task = {
      id: null,
      frequency_active: false,
      frequency_key: "DAY",
      frequency_number: 0,
      next_due_date: "",
      pre_warning_days: 1,
      pre_warning_active: false,
      description: "",
      regulation_id: null,
      facility_id: null,
      owner: null,
      active: true,
      files: [],
    };
  },

  reset_occurrence: (state) => {
    state.occurrence = {
      comments: [],
      complete_date: null,
      description: "",
      due_date: "",
      id: null,
      owner: null,
      pre_warning_days: 0,
      repet_action_id: 0,
      status: "",
      tier: "",
      itemsTotal: "",
    };
  },

  ADD_TASK: (state, payload) => {
    payload.loading = false;
    state.tasks.push(payload);
  },

  UPDATE_TASK: (state, payload) => {
    const taskIndex = state.tasks.findIndex((task) => task.id === payload.id);
    state.tasks.splice(taskIndex, 1, payload);
  },

  DELETE_TASK: (state, payload) => {
    const taskIndex = state.tasks.findIndex((task) => task.id === payload);
    state.tasks.splice(taskIndex, 1);
  },

  SET_TASK_FILE: (state, payload) => {
    state.task.files.push({
      ...payload,
      uploaded: true,
      ext: payload.name.split(".").pop(),
    });
  },

  SET_TASKS: (state, data) => {
    state.tasksData = JSON.parse(JSON.stringify(data));
  },

  reset_har_filters: (state) => {
    state.occurrencesFilters = {};
    state.regulationFilters = {};
  },
};

const actions = {
  fetchRegulations: ({ commit }) => {
    commit("SET_REGULATION_LOADING", true);
    return new Promise((resolve, reject) => {
      tcmtRegApi
        .getFetcher()
        .get(`regulations/search`, {
          params: state.regulationFilters,
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then((res) => {
          commit("SET_REGULATIONS", res.data);
          resolve(res.data);
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          commit("SET_REGULATION_LOADING", false);
        });
    });
  },

  fetchRegulation: ({ commit }, regId) => {
    return new Promise((resolve, reject) => {
      tcmtRegApi
        .getFetcher()
        .get(`regulations/${regId}`)
        .then(({ data }) => {
          commit("set_regulation", data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getAssessment: (context, payload) => {
    return new Promise((resolve, reject) => {
      tcmtRegApi
        .getFetcher()
        .get(`assessments/${payload}`)
        .then((res) => {
          context.commit("SET_ASSESSMENT", res.data);
          res.data.repet_actions.forEach((repetAction) => {
            context.commit("ADD_TASK", repetAction);
          });
          resolve(res.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getAssessments: (context, payload) => {
    return new Promise((resolve, reject) => {
      tcmtRegApi
        .getFetcher()
        .get("assessments/search", {
          params: payload,
        })
        .then((res) => {
          context.commit("FILL_ASSESSMENTS", res.data.results);
          resolve(res.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  createAssessment: (context, edit) => {
    return new Promise((resolve, reject) => {
      const assessment = JSON.parse(JSON.stringify(state.assessment));
      assessment.regulation_id = state.regulation.id;
      assessment.facility_id =
        assessment.facility_id.id < 0 ? null : state.assessment.facility_id.id;
      if (edit) {
        tcmtRegApi
          .getFetcher()
          .put(`assessments/${assessment.id}`, assessment)
          .then(({ data }) => {
            // context.commit("SET_ASSESSMENT", data);
            resolve(data.id);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        tcmtRegApi
          .getFetcher()
          .post("assessments/", assessment)
          .then(({ data }) => {
            resolve(data.id);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  },

  updateAssessment: (context) => {
    return new Promise((resolve, reject) => {
      const assessment = JSON.parse(JSON.stringify(state.assessment));
      assessment.regulation_id = state.regulation.id;
      assessment.facility_id =
        assessment.facility_id < 0 ? null : state.assessment.facility_id;
      assessment.sectors = state.assessment.sectors.map((s) => {
        return typeof s === "number" ? s : s.id;
      });
      tcmtRegApi
        .getFetcher()
        .put(`assessments/${assessment.id}`, assessment)
        .then(({ data }) => {
          context.commit("SET_ASSESSMENT", data);
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  fetchTasks: ({ commit }, params) => {
    return new Promise((resolve, reject) => {
      tcmtRegApi
        .getFetcher()
        .get(`repet-actions/search`, {
          params,
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then((res) => {
          commit("SET_TASKS", res.data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  upTaskFiles: (context, payload) => {
    return new Promise((resolve, reject) => {
      const localFiles = state.task.files.filter((file) => !file.uploaded);
      localFiles.forEach((file) => {
        saveFileAndUploadToS3(
          tcmtRegApi.getFetcher(),
          `repet-actions/${payload}/add-file`,
          {},
          file,
        )
          .then(() => {
            // context.commit("SET_TASK_FILE", res.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
      resolve();
    });
  },

  createTask: ({ state }) => {
    return new Promise((resolve, reject) => {
      const { frequency_active, ...task } = state.task;
      task.regulation_id = state.regulation.id;
      task.owner_id = state.task.owner.id;
      task.facility_id =
        state.task.facility_id < 0 ? null : state.task.facility_id;
      task.owner_id = state.task.owner.id;
      if (!frequency_active) {
        task.frequency_key = "NO";
      }
      tcmtRegApi
        .getFetcher()
        .post("repet-actions/", task)
        .then((res) => {
          // context.commit("ADD_TASK", res.data);
          resolve(res.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  updateTask: ({ state, commit }) => {
    return new Promise((resolve, reject) => {
      const { frequency_active, ...task } = state.task;
      task.regulation_id = state.regulation.id;
      task.owner_id = state.task.owner.id;
      task.facility_id =
        state.task.facility_id < 0 ? null : state.task.facility_id;
      task.owner_id = state.task.owner.id;
      if (!frequency_active) {
        task.frequency_key = "NO";
      }
      tcmtRegApi
        .getFetcher()
        .put(`repet-actions/${state.task.id}`, task)
        .then((res) => {
          commit("UPDATE_TASK", res.data);
          resolve(res.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  deleteTask: () => {
    return new Promise((resolve, reject) => {
      tcmtRegApi
        .getFetcher()
        .delete(`repet-actions/${state.task.id}`)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  fetchOccurrences: ({ commit }) => {
    commit("SET_OCCURRENCES_LOADING", true);
    return new Promise((resolve, reject) => {
      const filteredParams = Object.entries(state.occurrencesFilters).reduce(
        (acc, [key, value]) => {
          if (value != null) {
            // opera tanto para `null` y `undefined`
            acc[key] = value;
          }
          return acc;
        },
        {},
      );
      tcmtRegApi
        .getFetcher()
        .get(`repet-actions/occurrences/search`, {
          params: filteredParams,
          paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: "repeat" });
          },
        })
        .then((res) => {
          commit("SET_OCCURRENCE_TOTAL_ITEM", res.data.totalItems);
          commit("SET_OCCURRENCES", res.data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          commit("SET_OCCURRENCES_LOADING", false);
        });
    });
  },

  fetchOccurrence: ({ commit }, { taskID, occurrenceID }) => {
    commit("SET_LOADING_TRUE", "fetchOccurrence");
    return new Promise((resolve, reject) => {
      tcmtRegApi
        .getFetcher()
        .get(`repet-actions/${taskID}/occurrences/${occurrenceID}`)
        .then(({ data }) => {
          const { repet_action, ...occurrence } = data;
          commit("set_task", repet_action);
          commit("set_occurrence", occurrence);
          resolve();
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          commit("SET_LOADING_FALSE", "fetchOccurrence");
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
