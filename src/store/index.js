import Vue from "vue";
import Vuex from "vuex";
import user from "@/store/modules/user";
import event from "@/store/modules/event";
import fca from "@/store/modules/fca";
import har from "@/store/modules/har";
import companies from "@/store/modules/companies";

import axios from "axios";

import {
  getToday,
  getWeekAgo,
  getMonthAgo,
  getMonthAfter,
  getWeekAfter,
  getSixMonthsAgo,
} from "@/store/modules/helpers";
import { tcmtRegApi, eatApi } from "@/apis";
import { EVENT_STATUSES, ROLES } from "../mixins/globals/index.js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    appAlert: null,
    openSnackbar: false,
    apisEnabled: [],
    features: [],
    dateRangeOptions: [
      // {
      //   name: "Hoy",
      //   range: [getToday],
      // },
      // {
      //   name: "Ayer",
      //   range: [getYesterday],
      // },
      // {
      //   name: "Esta semana",
      //   range: [firstWeekDay(), getToday],
      // },
      {
        name: "Últimos 6 meses",
        range: [getSixMonthsAgo, getToday],
      },
      // {
      //   name: "Este mes",
      //   range: [firstMonthDay, getToday],
      // },
      {
        name: "Últimos 7 días",
        range: [getWeekAgo, getToday],
      },
      {
        name: "Últimos 30 días",
        range: [getMonthAgo, getToday],
      },
      {
        name: "Próximos 7 días",
        range: [getToday, getWeekAfter],
      },
      {
        name: "Próximos 30 días",
        range: [getToday, getMonthAfter],
      },
    ],
  },

  getters: {
    isRepetActionAvailable: (state) => {
      return state.apisEnabled.includes("repet");
    },
  },

  mutations: {
    set_apis_enabled: (state, apisEnabled) => {
      state.apisEnabled = apisEnabled.slice();
    },
    set_features: (state, features) => {
      state.features = features.slice();
    },
    SET_ALERT: (state, payload) => {
      state.appAlert = payload;
      state.openSnackbar = true;
    },

    show_success_notification: (state, message) => {
      state.appAlert = {
        appAlertType: "success",
        appAlertMsg: message,
      };
      state.openSnackbar = true;
    },

    show_error_notification: (state, message) => {
      state.appAlert = {
        appAlertType: "error",
        appAlertMsg: message,
      };
      state.openSnackbar = true;
    },

    SET_SNACKBAR: (state, payload) => {
      state.openSnackbar = payload;
    },
    SET_PAGE_DATA: (state, payload) => {
      for (const prop in payload) {
        if (prop === "cause_types") state.fca[prop] = payload[prop];
        state.event[prop] = payload[prop];
      }
    },
    SET_HOME_PAGE_DATA: (state, homeData) => {
      const { events_open, events_vali, ...actions } = homeData[0].data.results;
      state.event.homePageEvents = [...events_open, ...events_vali];
      state.fca.homePageActions = actions;
      if (homeData[1]) {
        const { repet_actions_by_owner } = homeData[1].data;
        state.har.tasks = repet_actions_by_owner;
      }
    },
    SET_FILTERS: (state) => {
      const currentUserId = +state.user.user.id;
      const currentUserRoles = state.user.user.groups?.map((role) => role.name);
      const isCurrentUserSme = currentUserRoles?.includes(ROLES.SME);

      state.fca.actionsFilters = {
        ordering: "status",
        parent_event__status_not: "OPEN",
        /*due_date_after: getSixMonthsAgo,
        due_date_before: getToday,*/
        owner__id: [isCurrentUserSme ? "" : currentUserId],
      };

      state.event.eventsFilters = {
        status_not: EVENT_STATUSES.OPEN,
        ordering: "-id",
        /*occurrence_date_after: getSixMonthsAgo,
        occurrence_date_before: getToday,*/
      };

      state.har.occurrencesFilters = {
        ordering: "status,due_date",
        /*due_date_after: getSixMonthsAgo,
        due_date_before: getToday,*/
        owner_id: [isCurrentUserSme ? "" : currentUserId],
      };
    },
    UPDATE_LOGOUT: (state) => {
      state.user.username = null;
      state.user.user = null;
      state.event.eventsFilters = {};
      state.fca.actionsFilters = {};
      state.har.regulationFilters = {};
      state.har.occurrencesFilters = {};
      //state.filters = state.defaultFilters;
      localStorage.removeItem("username");
      localStorage.removeItem("udata");
      localStorage.removeItem("ufilters");
      localStorage.removeItem("usettings");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("company");
      localStorage.removeItem("access_facilities");
    },
  },

  actions: {
    set_alert: ({ commit }, payload) => {
      commit("SET_ALERT", payload);
    },

    get_page_data: ({ commit }) => {
      commit("SET_FILTERS");
      return new Promise(async (resolve, reject) => {
        try {
          const pageData = await eatApi.getFetcher().get("/pages/new-event");
          commit("SET_PAGE_DATA", pageData.data.results);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },

    get_home_page_data: ({ getters, commit }) => {
      return new Promise((resolve, reject) => {
        axios
          .all([
            eatApi.getFetcher().get(`pages/home`),
            getters.isRepetActionAvailable
              ? tcmtRegApi.getFetcher().get(`pages/home`)
              : Promise.resolve(),
          ])
          .then((data) => {
            commit("SET_HOME_PAGE_DATA", data);
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    logout: (context) => {
      context.commit("UPDATE_LOGOUT");
    },
  },

  modules: {
    user,
    event,
    fca,
    har,
    companies,
  },
});
