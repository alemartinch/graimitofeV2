import axios from "axios";
import router from "@/router";
import store from "@/store";
import errorCodes from "@/apis/errorCodes";

class BasicService {
  constructor(options) {
    this.fetcher = axios.create(options);

    this.fetcher.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          // If there is a token, attach it to every request header
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Axios (intercept http responses)
    this.fetcher.interceptors.response.use(
      // If response OK, return it
      (response) => {
        return response;
      },

      // if response with errors, proceed as follows
      (error) => {
        if (error?.message === "Network Error") {
          store.commit("SET_ALERT", {
            appAlertType: "Error",
            appAlertMsg:
              "Conexión inestable. No se puedo realizar la acción solicitada",
          });
          return Promise.reject(error);
        }

        if (error.response) {
          const { config, response: { status, data } } = error;
          const originalRequest = config;
          const msg = data.errors[0]?.message?.toLowerCase() || "";

          // Check when the user is trying to log in
          if (
            originalRequest.url.includes("auth/token") &&
            [401, 403].includes(status)
          ) {
            if (
              msg.includes("creden") ||
              msg.includes("token") ||
              msg.includes("password")
            ) {
              // If credentials are invalid, let the app handle it (login_user function)
              return Promise.reject(error);
            } else if (msg.includes("permiso") || msg.includes("permission")) {
              // If permissions are denied, redirect to the "no-permissions" page
              router.push({ name: "sinpermiso" });
              return false;
            }

            // Connection timeout
          } else if ([408, 504].includes(status)) {
            store.commit("SET_ALERT", {
              appAlertType: "Error",
              appAlertMsg:
                "Conexión inestable. No se puedo realizar la acción solicitada",
            });
            return Promise.reject(error);

            // Token expired
          } else if ([401].includes(status) && (msg.includes("expire") || msg.includes("invalid"))) {
            store.commit("user/UPDATE_LOGOUT");
            router.push({ name: "login" });
            store.commit("SET_ALERT", {
              appAlertType: "error",
              appAlertMsg: "La sesión ha expirado. Inicie sesión nuevamente",
            });
            return false;

            // Token error
          } else if ([401].includes(status) && msg.includes("error")) {
            store.commit("user/UPDATE_LOGOUT");
            router.push({ name: "login" });
            return false;

            // Known errors
          } else if (data.errors[0]?.code) {
            const code = data.errors[0].code;
            store.commit("SET_ALERT", {
              appAlertType: "Error",
              appAlertMsg: errorCodes(code),
              priority: true,
            });
            return false;
          }

          // Any other permission error
          if (status === 403) {
            store.commit("SET_ALERT", {
              appAlertType: "error",
              appAlertMsg: "No tiene permisos para realizar esta acción",
              priority: true,
            });
            return false;
          }
        }

        return Promise.reject(error);
      }
    );
  }
  getFetcher() {
    return this.fetcher;
  }

  setHeaderToken() {
    this.fetcher.defaults.headers.token = localStorage.getItem("accessToken");
  }
}

const eatApi = new BasicService({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
});

const tcmtAuthApi = new BasicService({
  baseURL: import.meta.env.VITE_APP_BASE_URL_AUTH,
});

const tcmtRegApi = new BasicService({
  baseURL: import.meta.env.VITE_APP_BASE_URL_REPET,
  headers: {
    token: localStorage.getItem("accessToken"),
  },
});

const tcmtReportsApi = new BasicService({
  baseURL: import.meta.env.VITE_APP_BASE_URL_REPORTS,
  headers: {
    token: localStorage.getItem("accessToken"),
  },
});

export { eatApi, tcmtAuthApi, tcmtRegApi, tcmtReportsApi };
