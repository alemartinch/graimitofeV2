import { Validations } from "@/mixins/Validations";
import { mapActions, mapGetters, mapState } from "vuex";
import { eatApi, tcmtRegApi, tcmtReportsApi } from "@/apis";

export const LoginMixin = {
  mixins: [Validations],
  data() {
    return {
      showPass: false,
      username: "",
      password: "",
      formLoginValid: true,
      loading: { login: false, sendNewPassword: false },
      forgottenPassword: false,
    };
  },

  computed: {
    ...mapState(["user"]),
    ...mapGetters("user", ["passwordChangeRequired"]),
  },

  methods: {
    ...mapActions("user", ["login", "getUsers"]),
    ...mapActions(["set_alert", "get_page_data"]),

    login_user: function () {
      if (this.formLoginValid) {
        this.loading.login = true;
        this.login({
          username: this.username.trim(),
          password: this.password,
        })
          .then(() => {
            tcmtRegApi.setHeaderToken();
            tcmtReportsApi.setHeaderToken();
            this.getUsers();
            this.get_page_data();
            if (this.passwordChangeRequired) {
              this.$router.push({
                path: "/change-password",
              });
            } else {
              const homeRoute = this.isMobile ? "/home-mobile" : "/home";
              this.$router.push({
                path: this.$route.query.redirect || homeRoute,
              });
            }
          })
          .catch((error) => {
            let alertMsg =
              error.response.data?.errors[0]?.message?.toLowerCase() || "";
            if (alertMsg === "incorrect username or password") {
              alertMsg = "Usuario o contraseña inválidos";
            } else {
              alertMsg = "Error al tratar de iniciar sesión";
            }
            this.set_alert({
              appAlertType: "error",
              appAlertMsg: alertMsg,
            });
          })
          .finally(() => {
            this.loading.login = false;
          });
      }
    },

    cancelResetPassword() {
      this.username = "";
      this.password = "";
      this.forgottenPassword = false;
      this.$refs.userField.focus();
    },

    sendNewPassword() {
      this.loading.sendNewPassword = true;
      eatApi
        .getFetcher()
        .put(`auth/password-reset/${this.username}`)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: "La contraseña fue reseteada, revise su correo",
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un error al tratar de resetear la contraseña",
          });
        })
        .finally(() => {
          this.forgottenPassword = false;
          this.loading.sendNewPassword = false;
        });
    },
  },
};
