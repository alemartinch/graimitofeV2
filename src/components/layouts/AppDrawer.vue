<template>
  <div>
    <v-app-bar app dense color="#263238" dark elevation="22">
      <v-toolbar-title> </v-toolbar-title>
      <v-spacer />
      <span class="caption">TetraChem</span>
      <img
        :src="require('@/assets/newLogoTcmt.svg')"
        style="width: 25px"
        class="mx-3"
        alt="Company Logo"
      />
      <span class="caption" style="color: #587181">Master Tool</span>
      <UserToolbarMenu v-on:logout="logoutDialog = true" />
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="isMiniVariant"
      color="#263238"
      app
      :width="$vuetify.breakpoint.mdAndDown ? 200 : 210"
      dark
      style="z-index: 100"
    >
      <template v-slot:prepend>
        <CompanyLogo />
      </template>

      <v-list dense nav>
        <div v-for="(submenu, index) in menu" :key="index">
          <v-subheader v-if="submenu.visible" class="text-no-wrap"
            ><v-divider></v-divider
          ></v-subheader>
          <v-list-item
            dark
            v-for="(item, index) in submenu.items"
            :key="index"
            v-show="item.visible"
            link
            :to="{ path: item.path }"
            class="ml-1"
            active-class="tcmt-secondary"
          >
            <v-tooltip right nudge-right="10" :disabled="!isMiniVariant">
              <template v-slot:activator="{ on }">
                <v-list-item-icon v-on="on" class="mr-2">
                  <IconBase icon-color="#b3b3b3" width="22" height="22">
                    <component :is="item.icon" />
                  </IconBase>
                </v-list-item-icon>
              </template>
              {{ item.name }}
            </v-tooltip>
            <v-list-item-content>
              <v-list-item-title class="font-weight-light"
                >{{ item.name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </div>

        <v-divider class="mx-10 my-3" style="border-color: #449cc9" />
        <v-row class="justify-center ma-0"
          ><v-tooltip bottom open-delay="200">
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                small
                v-on="on"
                @click="isMiniVariant = !isMiniVariant"
              >
                <v-icon
                  >{{
                    isMiniVariant
                      ? "mdi-chevron-double-right"
                      : "mdi-chevron-double-left"
                  }}
                </v-icon>
              </v-btn>
            </template>
            {{ isMiniVariant ? "Expandir menú" : "Contraer menú" }}
          </v-tooltip>
        </v-row>
      </v-list>
      <template v-slot:append>
        <v-row class="justify-center ma-0">
          <p
            class="text-center"
            style="color: white; font-size: 0.8rem; opacity: 0.3"
          >
            <span v-if="!isMiniVariant">TCMT</span>
            v{{ version }}
          </p>
        </v-row>
      </template>
    </v-navigation-drawer>

    <!-- LOGOUT PROMPT -->
    <GlobalPrompt :active="logoutDialog" prompt-type="alert">
      <template v-slot:message> ¿Desea salir de la sesión? </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="alertButtonLoading"
          @click="logoutDialog = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>

      <template v-slot:accept>
        <t-btn-primary :loading="alertButtonLoading" @click="logout_user">
          Salir
        </t-btn-primary>
      </template>
    </GlobalPrompt>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import CompanyLogo from "@/components/CompanyLogo.vue";
import UserToolbarMenu from "@/components/layouts/UserToolbarMenu.vue";
import IconBase from "@/components/Icons/IconBase.vue";
import IconEvent from "@/components/Icons/IconEvent.vue";
import IconHome from "@/components/Icons/IconHome.vue";
import IconEventPanel from "@/components/Icons/IconEventPanel.vue";
import IconActionsPanel from "@/components/Icons/IconActionsPanel.vue";
import IconRegPanel from "@/components/Icons/IconRegPanel.vue";
import IconReports from "@/components/Icons/IconReports.vue";
import { version } from "/package.json";
//import IconDocumentationPanel from "@/components/Icons/IconDocumentationPanel.vue";
import IconTask from "@/components/Icons/IconTask.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import store from "@/store";

export default {
  name: "AppDrawer",
  components: {
    TBtnPrimary,
    TBtnSecondary,
    IconBase,
    UserToolbarMenu,
    CompanyLogo,
    GlobalPrompt,
  },

  data: () => ({
    drawer: null,
    isMiniVariant: false,
    logoutDialog: false,
    alertButtonLoading: false,
    isTrue: false,
    version: version,
  }),

  created() {
    this.isMiniVariant = this.isNotebook;
  },

  computed: {
    ...mapState(["user", "apisEnabled"]),

    isRepetActionAvailable() {
      return this.apisEnabled.includes("repet");
    },
    isForbidden() {
      return store.getters["user/currentUserRoles"].includes("BASE")
        ? "/unauthorised"
        : "/reports";
    },

    menu() {
      return [
        {
          subheader: "HOME",
          visible: false,
          items: [
            {
              name: "Inicio",
              // icon: "mdi-home-outline",
              icon: IconHome,
              path: "/home",
              visible: true,
            },
          ],
        },
        {
          subheader: "Eventos y acciones",
          visible: !this.isMiniVariant,
          items: [
            {
              name: "Crear evento",
              // icon: "mdi-file-plus-outline",
              icon: IconEvent,
              path: "/create_event",
              visible: true,
            },
            {
              name: "Panel de eventos",
              icon: IconEventPanel,
              // icon: "mdi-format-list-bulleted-square",
              path: "/events",
              visible: true,
            },
            {
              name: "Panel de acciones",
              icon: IconActionsPanel,
              // icon: "mdi-format-list-bulleted-triangle",
              path: "/actions/",
              visible: true,
            },
          ],
        },
        {
          subheader: "Acciones repetitivas",
          visible: !this.isMiniVariant,
          items: [
            {
              name: "Panel requerimientos",
              icon: IconRegPanel,
              // icon: "mdi-format-list-bulleted-triangle",
              path: "/har/",
              visible: this.isRepetActionAvailable,
            },
            {
              name: "Panel de tareas",
              icon: IconTask,
              // icon: "mdi-format-list-bulleted-triangle",
              path: "/tasks",
              visible: this.isRepetActionAvailable,
            },
          ],
        },
        // {
        //   subheader: "Gestión de documentación",
        //   visible: !this.isMiniVariant,
        //   // items: [
        //   //   {
        //   //     name: "Documentacion",
        //   //     icon: IconDocumentationPanel,
        //   //     // icon: "mdi-format-list-bulleted-triangle",
        //   //     path: "/documentation/",
        //   //     visible: this.isRepetActionAvailable,
        //   //   },
        //   // ],
        // },
        {
          subheader: "Reportes",
          visible: !this.isMiniVariant,
          items: [
            {
              name: "Estadisticas y reportes",
              icon: IconReports,
              // icon: "mdi-chart-areaspline",
              path: this.isForbidden,
              visible: true,
            },
          ],
        },
      ];
    },

    avatarSize() {
      if (this.isMiniVariant) {
        return "30";
      }
      if (this.$vuetify.breakpoint.mdAndDown) {
        return "60";
      }
      return "76";
    },

    getUserPhoto() {
      return this.user.user.photo;
      // const userPhoto = this.user.user.photo64;
      // return "data:image/png;base64," + userPhoto;
    },
  },
  methods: {
    ...mapActions(["logout"]),
    ...mapActions(["set_alert"]),

    logout_user() {
      this.alertButtonLoading = true;
      this.logout();
      this.alertButtonLoading = false;
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped>
.v-list--nav .v-list-item:not(:last-child):not(:only-child),
.v-list--rounded .v-list-item:not(:last-child):not(:only-child) {
  margin-bottom: 0;
}

.v-application--is-ltr .v-list-item__action:first-child,
.v-application--is-ltr .v-list-item__icon:first-child {
  margin-right: 15px;
}

.tcmt-secondary {
  /*border: 1px solid #449cc9;*/
  background-color: rgba(68, 156, 201, 0.08);
  color: white;
}
</style>
