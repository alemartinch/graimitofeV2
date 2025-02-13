import Vue from "vue";
import Router from "vue-router";
import store from "@/store";
import ActionResume from "@/components/actions-page/ActionResume/index.vue";
import RegulationResume from "@/components/har-page/RegulationResume.vue";
import NewRegulationDialog from "@/components/har-page/NewRegulationDialog.vue";
import TaskForm from "@/components/har-page/TaskForm.vue";
import NewAssessmentPanel from "@/components/har-page/NewAssessmentPanel/index.vue";
import AssessmentPanel from "@/components/har-page/NewAssessmentPanel/AssessmentPanel.vue";
import OccurrenceTaskPanel from "@/components/har-page/OccurrenceTaskPanel.vue";
import { ROLES } from "@/mixins/globals";
Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/Login/index.vue"),
      meta: { requiresVisitor: true },
    },
    {
      path: "/change-password",
      name: "change-password",
      component: () => import("@/views/ChangePassword.vue"),
    },
    {
      path: "/unauthorised",
      name: "unauthorised",
      component: () => import("@/views/UnauthorisedPage.vue"),
    },
    {
      path: "/not-mobile",
      name: "not-mobile",
      component: () => import("@/views/NotMobilePage.vue"),
    },
    {
      path: "/home",
      name: "home",
      component: () => import("@/views/Home/index.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "action-resume",
          name: "action-resume-home",
          component: ActionResume,
        },
        {
          path: "home-task-occurrence-panel",
          name: "home-task-occurrence-panel",
          component: OccurrenceTaskPanel,
        },
      ],
    },
    {
      path: "/home-mobile",
      name: "home-mobile",
      component: () => import("@/views/Home/HomeMobile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/create_event",
      name: "create_event",
      component: () => import("@/views/CreateEvent/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/create_event/new_event/:id",
      name: "new_event",
      component: () => import("@/views/CreateEvent/EventLoader.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/events/",
      name: "events",
      component: () => import("@/views/EventsPanel/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/events/noconformities/",
      name: "noconformities",
      component: () => import("@/views/NoConformities.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/events/eventinfo/:id",
      name: "eventinfo",
      component: () => import("@/views/EventsPanel/EventInfo.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "action-resume",
          name: "action-resume-events",
          component: ActionResume,
        },
      ],
    },
    {
      path: "/events/eventinfo/:id/restricted-event",
      name: "restricted-event",
      component: () => import("@/views/EventsPanel/RestrictedEvent.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/events/eventinfomb/:id",
      name: "eventinfomb",
      component: () => import("@/views/EventsPanel/EventInfoMb.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/actions",
      name: "actions",
      component: () => import("@/views/ActionsPanel/index.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "action-resume",
          name: "action-resume-actions",
          component: ActionResume,
        },
      ],
    },
    {
      path: "/actionsMb/",
      name: "actionsMb",
      component: () => import("@/views/ActionsMb.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/actions/action/:id",
      name: "action",
      component: () => import("@/views/Action/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/observations",
      name: "observation",
      component: () => import("@/views/Observations/Observations.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/tasks-mobile",
      name: "tasks-mobile",
      component: () => import("@/views/TasksMobile/TasksMobile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/tasks-mobile/task-mobile",
      name: "task-mobile",
      component: () => import("@/views/TasksMobile/TaskMobile.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/reports",
      name: "reports",
      component: () => import("@/views/Reports.vue"),
      meta: { requiresAuth: true, isExternal: [ROLES.BASE] },
    },
    {
      path: "/usersettings",
      name: "usersetting",
      component: () => import("@/views/UserSettings/UserSettings.vue"),
      redirect: "/usersettings/user-profile",
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: "user-profile",
          component: () => import("@/views/UserSettings/UserProfile.vue"),
        },
        {
          path: "admin-panel",
          component: () => import("@/views/UserSettings/AdministrationPanel.vue"),
          redirect: "admin-panel/abm-users",
          meta: { authorisedRoles: [ROLES.SME] },
          children: [
            {
              path: "abm-users",
              component: () =>
                import(
                  "@/components/setting-page/AdministrationPanel/AbmUsers.vue"
                ),
              children: [
                {
                  path: "edit-user/:id",
                  component: () =>
                    import(
                      "@/components/setting-page/AdministrationPanel/EditUserPanel.vue"
                    ),
                },
              ],
            },
            {
              path: "abm-facilities",
              component: () =>
                import(
                  "@/components/setting-page/AdministrationPanel/AbmFacilities.vue"
                ),
              children: [
                {
                  path: "edit-facility/:id",
                  component: () =>
                    import(
                      "@/components/setting-page/AdministrationPanel/EditFacility.vue"
                    ),
                },
              ],
            },
            {
              path: "abm-groups",
              component: () =>
                import(
                  "@/components/setting-page/AdministrationPanel/AbmGroups.vue"
                ),
              children: [
                {
                  path: "edit-group/:id",
                  component: () =>
                    import(
                      "@/components/setting-page/AdministrationPanel/EditGroup.vue"
                    ),
                },
              ],
            },
            {
              path: "abm-sectors",
              component: () =>
                import(
                  "@/components/setting-page/AdministrationPanel/AbmSectors.vue"
                ),
              children: [
                {
                  path: "edit-sector/:id",
                  component: () =>
                    import(
                      "@/components/setting-page/AdministrationPanel/EditSector.vue"
                    ),
                },
              ],
            },
            {
              path: "abm-sectors-type",
              component: () =>
                import(
                  "@/components/setting-page/AdministrationPanel/AbmSectorsType.vue"
                ),
              children: [
                {
                  path: "edit-sector-type/:id",
                  component: () =>
                    import(
                      "@/components/setting-page/AdministrationPanel/EditSectorType.vue"
                    ),
                },
              ],
            },
            {
              path: "abm-tags",
              component: () =>
                import("@/components/setting-page/AdministrationPanel/AbmTags.vue"),
              children: [
                {
                  path: "edit-tag/:id",
                  component: () =>
                    import(
                      "@/components/setting-page/AdministrationPanel/EditTag.vue"
                    ),
                },
              ],
            },
            {
              path: "api-key",
              component: () =>
                import(
                  "@/components/setting-page/AdministrationPanel/ApiKeyManagement.vue"
                ),
            },
            {
              path: "apis-version",
              component: () =>
                import(
                  "@/components/setting-page/AdministrationPanel/ApisVersion.vue"
                ),
            },
          ],
        },
      ],
    },
    {
      path: "/user-profile-mb",
      name: "user-profile-mb",
      component: () => import("@/views/UserSettings/UserProfileMobile.vue"),
      meta: { requiresAuth: true, isExternal: [ROLES.BASE] },
    },
    {
      path: "/har",
      name: "har",
      component: () => import("@/views/Har/index.vue"),
      meta: { requiresAuth: true, isExternal: [ROLES.BASE] },
      children: [
        {
          path: "regulation-resume",
          name: "regulation-resume",
          component: RegulationResume,
        },
        {
          path: "new-regulations-form",
          name: "new-regulations-form",
          component: NewRegulationDialog,
        },
      ],
    },
    {
      path: "/har/regulations/:id",
      name: "regulations",
      component: () => import("@/views/Har/Regulation.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "new-assessment-panel",
          name: "new-assessment-panel",
          component: NewAssessmentPanel,
        },
        {
          path: "assessment-panel",
          name: "assessment-panel",
          component: AssessmentPanel,
        },
        {
          path: "new-task-panel",
          name: "new-task-panel",
          component: TaskForm,
        },
        {
          path: "regulations-task-occurrence-panel",
          name: "regulations-task-occurrence-panel",
          component: OccurrenceTaskPanel,
        },
        {
          path: "new-regulation-form-reg-page",
          name: "new-regulation-form-reg-page",
          component: NewRegulationDialog,
        },
      ],
    },
    {
      path: "/tasks",
      name: "tasks",
      component: () => import("@/views/Tasks.vue"),
      meta: { requiresAuth: true, notMobile: true },
      children: [
        {
          path: "regulation-resume",
          name: "regulation-resume-tasks",
          component: RegulationResume,
        },
        {
          path: "tasks-task-occurrence-panel",
          name: "tasks-task-occurrence-panel",
          component: OccurrenceTaskPanel,
        },
        {
          path: "new-task-panel",
          name: "new-task-panel-tasks",
          component: TaskForm,
        },
      ],
      // scrollBehavior() {
      //   return { x: 0, y: 0 };
      // },
    },
    {
      path: "/task-occurrence",
      beforeEnter: (to, from, next) => {
        const { taskId, occurrenceId } = to.query;
        if (window.innerWidth <= 768) {
          next(
            `/tasks-mobile/task-mobile?taskID=${taskId}&occurrenceID=${occurrenceId}`
          );
        } else {
          next(
            `/tasks/tasks-task-occurrence-panel?taskID=${taskId}&occurrenceID=${occurrenceId}`
          );
        }
      },
    },
    {
      path: "/documentation",
      name: "documentation",
      component: () => import("@/views/Documentation/index.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authRoles = to.matched.reduce((acc, record) => {
    if (record.meta.authorisedRoles?.length)
      return [...acc, ...record.meta.authorisedRoles];
    return acc;
  }, []);
  const isExternalRole = to.matched.reduce((acc, record) => {
    if (record.meta.isExternal?.length)
      return [...acc, ...record.meta.isExternal];
    return acc;
  }, []);
  const cantShowInMobile = to.matched.some((record) => record.meta.notMobile);
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters["user/loggedIn"]) {
      next({
        name: "login",
        query: { redirect: to.path },
        // pasar ruta aca
      });
    } else if (store.getters["user/passwordChangeRequired"]) {
      next({ name: "change-password" });
    } else if (
      authRoles.length &&
      store.getters["user/currentUserRoles"].some((role) => {
        authRoles.includes(role);
      })
    ) {
      next({
        name: "unauthorised",
      });
    } else if (
      isExternalRole &&
      store.getters["user/currentUserRoles"].some((rol) =>
        isExternalRole.includes(rol)
      )
    ) {
      next({
        name: "unauthorised",
      });
    } else if (window.innerWidth <= 768 && cantShowInMobile) {
      next({
        name: "not-mobile",
      });
    } else {
      next();
    }
  } else if (to.matched.some((record) => record.meta.requiresVisitor)) {
    if (store.getters["user/loggedIn"]) {
      const isMobile = window.innerWidth <= 768;
      next({
        name: isMobile ? "home-mobile" : "home",
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
