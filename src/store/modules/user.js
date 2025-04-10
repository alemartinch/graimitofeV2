import _ from "lodash";
import { eatApi, tcmtAuthApi } from "@/apis";
import { ROLES, EVENT_STATUSES, ACTION_STATUSES as AS } from "@/mixins/globals";

const state = {
  username: localStorage.getItem("username") || null,
  user: localStorage.getItem("udata")
    ? JSON.parse(localStorage.getItem("udata"))
    : null,
  company: JSON.parse(localStorage.getItem("company")) || {},
  users: [],
  access_facilities: [],
  userEvents: [],
  userPendingEvents: [],
  userActions: [],
  othersActions: [],
  percentUpload: 0,
  filters: localStorage.getItem("ufilters")
    ? JSON.parse(localStorage.getItem("ufilters"))
    : {
      actions: {
        owner_id: "",
        status: [],
        ordering: "status",
        parent_event__status_not: EVENT_STATUSES.OPEN,
      },
    },
  defaultFilters: {
    actions: {
      owner_id: "",
      status: [],
      ordering: "status",
      parent_event__status_not: EVENT_STATUSES.OPEN,
    },
  },
  reportFilters: { report: null, filters: null },
  settings: localStorage.getItem("usettings")
    ? JSON.parse(localStorage.getItem("usettings"))
    : {},
  defaultSettings: {
    showEventsPends: false,
    logoWidth: 60,
  },
  maxValues: {
    max_num_facilities: 0,
    max_num_users: 0,
    max_num_sectors_facilities: 0,
    max_num_tags: 0,
    max_open_events_user: 0,
  },
  isdefaultFilters: true,
};

const getters = {
  isDefaultFilters: (state) => {
    return state.isdefaultFilters;
  },

  loggedIn: (state) => {
    return state.username !== null && state.user !== null;
  },

  passwordChangeRequired: (state) => {
    return state.user.password_change_required;
  },

  currentUser: (state) => {
    return state.user;
  },

  currentUserId: (state) => {
    return +state.user.id;
  },

  currentUserRoles: (state) => {
    return state.user.groups?.map((role) => role.name);
  },

  getFacilitiesByUser(state) {
    return state.access_facilities.length > 0
      ? state.access_facilities
      : JSON.parse(localStorage.getItem("access_facilities")) ?? [];
  },

  isCurrentUserSme: (state, { currentUserRoles }) => {
    return currentUserRoles?.includes(ROLES.SME);
  },

  isCurrentUserEmpl: (state, { currentUserRoles }) => {
    return currentUserRoles?.includes(ROLES.EMPLOYEE);
  },
  isCurrentUserRegu: (state, { currentUserRoles }) => {
    return currentUserRoles?.includes(ROLES.REGU);
  },
  // NO SE USA MAS
  isCurrentUserExec: (state, { currentUserRoles }) => {
    return currentUserRoles?.includes(ROLES.EXECUTOR);
  },
  isCurrentUserBase: (state, { currentUserRoles }) => {
    return currentUserRoles?.includes(ROLES.BASE);
  },

  isCurrentUserOnlySme(state, { currentUserRoles }) {
    return currentUserRoles?.length === 1 && currentUserRoles[0] === ROLES.SME;
  },

  getRolesList: (state) => {
    return state.user.groups
      .map((g) => {
        switch (g.name) {
          case ROLES.LEADER:
            return "Líder";
          case ROLES.SME:
            return "Administrador";
          case ROLES.EMPLOYEE:
            return "Empleado";
          case ROLES.BASE:
            return "Base";
          case ROLES.REGU:
            return "Regulador";
          case ROLES.ORIGINATOR:
            return "Originador";
          default:
            return g.name;
        }
      })
      .join(" • ");
  },

  getCurrentCompany() {
    return state.company;
  },

  pendActions: (state) => {
    return state.userActions.filter((action) => action.status === AS.PENDING);
  },

  dueActions: (state) => {
    return state.userActions.filter((action) => action.status === AS.OVERDUE);
  },

  eOdueActions: (state) => {
    return state.userActions.filter(
      (action) => action.status === AS.EF_OVERDUE,
    );
  },

  ePendActions: (state) => {
    return state.userActions.filter(
      (action) => action.status === AS.EF_PENDING,
    );
  },

  getIndReport: (state) => {
    return (
      state.reportFilters.report || {
        events: 0,
        actions: 0,
        events_pending: {
          pending_complete: 0,
          pending_effectiveness: 0,
          pending_certify: 0,
        },
        obsv_behavioral: 0,
        obsv_not_behavioral: 0,
        actions_completed: {
          after_due_date: 0,
          after_postponed_due_date: 0,
          before_due_date: 0,
          before_postponed_due_date: 0,
          with_effectiveness_overdue: 0,
        },
        effectiveness_actions: {
          effectiveness_pending: 0,
          effectiveness_overdue: 0,
          effectiveness_completed: 0,
        },
        actions_pending: 0,
        actions_pending_overdue: 0,
      }
    );
  },

  getIndFilter: (state) => {
    return (
      state.reportFilters.filters || {
        fromDate: null,
        toDate: null,
        facility: [],
        sector: [],
        processArea: [],
        origin: [],
        status: null,
      }
    );
  },
};

const mutations = {

  UPDATE_LOGIN: (state, payload) => {
    state.username = payload.results.username;
    state.user = payload.results;
    state.email = payload.results.email;
    state.first_name = payload.results.first_name;
    state.id = payload.results.id;
    state.is_active = payload.results.is_active;
    state.last_name = payload.results.last_name;
    state.company = payload.company;
    state.access_facilities = payload.results.access_facilities;
    localStorage.setItem("username", payload.results.username);
    localStorage.setItem("udata", JSON.stringify(payload.results));
    localStorage.setItem("company", JSON.stringify(payload.company));
    localStorage.setItem("accessToken", payload.access_token);
    localStorage.setItem("ufilters", JSON.stringify(state.defaultFilters));
    localStorage.setItem("usettings", JSON.stringify(state.defaultSettings));
    localStorage.setItem(
      "access_facilities",
      JSON.stringify(state.access_facilities),
    );
  },

  SET_PHOTO: (state, payload) => {
    state.user.photo = payload;
    // state.user.photo64 = payload;
    localStorage.setItem("udata", JSON.stringify(state.user));
  },
  SET_COMPANY_PHOTO: (state, payload) => {
    state.company.logo = payload;
    localStorage.setItem("company", JSON.stringify(state.company));
  },
  set_logo_width: (state, payload) => {
    state.settings.logoWidth += payload;
    localStorage.setItem("usettings", JSON.stringify(state.settings));
  },
  SET_EMAIL: (state, payload) => {
    state.user.email = payload;
    localStorage.setItem("udata", JSON.stringify(state.user));
  },
  SET_PHONE: (state, payload) => {
    state.user.phone = payload;
    localStorage.setItem("udata", JSON.stringify(state.user));
  },
  SET_NAME: (state, payload) => {
    state.user.first_name = payload;
    localStorage.setItem("udata", JSON.stringify(state.user));
  },
  SET_LNAME: (state, payload) => {
    state.user.last_name = payload;
    localStorage.setItem("udata", JSON.stringify(state.user));
  },
  LOAD_USERS: (state, payload) => {
    state.users = payload;
  },
  FILL_DASHBOARD: (state, payload) => {
    state.userEvents = payload.events;
    state.userActions = payload.actions;
  },
  FILL_ACTION_BOARD: (state, payload) => {
    state.userActions = payload.actions;
    state.othersActions = payload.others;
  },
  FILL_EVENTS_BOARD: (state, payload) => {
    state.userEvents = payload;
  },
  FILL_PEVENTS_BOARD: (state, payload) => {
    state.userPendingEvents = payload;
  },

  del_pending_event: (state, payload) => {
    const eIndex = state.userPendingEvents.findIndex(
      (uPe) => uPe.id === payload,
    );
    state.userPendingEvents.splice(eIndex, 1);
  },

  add_filter: (state, payload) => {
    if (state.filters) {
      state.filters = _.mergeWith(state.filters, payload, (o, s) => {
        if (_.isArray(o)) {
          return s.slice();
        }
      });
    } else {
      state.filters = JSON.parse(JSON.stringify(payload));
    }
    localStorage.setItem("ufilters", JSON.stringify(state.filters));
  },

  add_rFilter: (state, payload) => {
    state.reportFilters = JSON.parse(JSON.stringify(payload));
    // rFilter.date = new Date().toISOString().substr(0, 10)
    // state.reportFilters.push(rFilter)
    // localStorage.setItem('rfilters', JSON.stringify(state.reportFilters))
  },

  clean_filter: (state) => {
    state.filters = JSON.parse(JSON.stringify(state.defaultFilters));
    localStorage.setItem("ufilters", JSON.stringify(state.filters));
  },

  cleanReportHistory: (state, payload) => {
    state.reportFilters = JSON.parse(JSON.stringify(payload));
    // localStorage.setItem('rfilters', JSON.stringify(state.reportFilters))
  },

  set_settings(state, payload) {
    state.settings = _.merge(state.settings, payload);
    localStorage.setItem("usettings", JSON.stringify(state.settings));
  },

  SET_MAX_VALUES(state, payload) {
    state.maxValues.max_num_users = payload.max_values.max_number_of_users;
    state.maxValues.max_num_sectors_facilities =
      payload.max_values.max_number_of_sectors_per_facility;
    state.maxValues.max_num_tags = payload.max_values.max_number_of_tags;
    state.maxValues.max_open_events_user =
      payload.max_values.max_open_events_per_user;
    state.maxValues.max_num_facilities =
      payload.max_values.max_number_of_facilities;
  },
};

const actions = {
  login: (context, payload) => {
    return new Promise((resolve, reject) => {
      tcmtAuthApi
        .getFetcher()
        .post("auth/token", payload)
        .then((response) => {
          context.commit("UPDATE_LOGIN", response.data);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getUsers: (context) => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .get("auth/users/?page=1&page_size=50")
        .then((response) => {
          context.commit("LOAD_USERS", response.data.results);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getUserDashBoard: () => {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .get("pages/home")
        .then((response) => {
          // context.commit('FILL_DASHBOARD', response.data.results)
          resolve(response.data.results);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getActionsBoard: (context) => {
    return new Promise(async (resolve, reject) => {
      try {
        const actions = await eatApi
          .getFetcher()
          .get(`pages/owner-dashboard/${state.user.id}`);
        context.commit("FILL_ACTION_BOARD", actions.data.results);
        resolve(actions.data.results);
      } catch (error) {
        reject(error);
      }
    });
  },

  getEventsBoard: (context) => {
    return new Promise(async (resolve, reject) => {
      try {
        const events = await eatApi.getFetcher().get(`events/full`);
        context.commit("FILL_EVENTS_BOARD", events.data.results);
        resolve(events.data.results);
      } catch (error) {
        reject(error);
      }
    });
  },

  getPendingEvents: (context) => {
    return new Promise(async (resolve, reject) => {
      try {
        const events = await eatApi
          .getFetcher()
          .get(
            `events/full/search?originator__id=${state.user.id}&status=OPEN`,
          );
        context.commit("FILL_PEVENTS_BOARD", events.data.results);
        resolve(events.data.results);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteUser: (context, userId) => {
    return new Promise((resolve, reject) => {
      try {
        const deleteUser = eatApi.getFetcher().delete(`/auth/users/${userId}`);
        resolve(deleteUser.data);
      } catch (error) {
        reject(error);
      }
    });
  },

  getMaxValues(context) {
    return new Promise((resolve, reject) => {
      eatApi
        .getFetcher()
        .get("pages/max-values")
        .then((response) => {
          context.commit("SET_MAX_VALUES", response.data.results);
          resolve(response);
        })
        .catch((error) => reject(console.error(error)));
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
