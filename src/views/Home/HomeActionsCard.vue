<template>
  <v-card
    height="300px"
    elevation="22"
    outlined
    class="d-flex flex-column"
    :loading="fetchActions"
    :disabled="fetchActions"
  >
    <v-card-title
      class="py-2"
      style="border-bottom: rgba(44, 103, 125, 0.16) solid 1px"
    >
      Acciones abiertas
      <v-spacer />
      <v-item-group v-model="statusSelected" multiple>
        <v-item
          v-for="status in statuses"
          :key="status.name"
          v-slot="{ active, toggle }"
        >
          <span
            v-show="status.visible"
            class="caption text-uppercase font-weight-medium ml-2"
            :class="{ 'font-weight-bold': active, 'text--secondary': !active }"
            @click="toggle"
            style="cursor: pointer; user-select: none"
            >{{ `${status.amount} ${status.name}` }}</span
          >
        </v-item>
      </v-item-group>
    </v-card-title>
    <div
      v-if="!totalActions.length"
      class="flex-grow-1 d-flex flex-column justify-center align-center"
    >
      <v-img
        class="flex-grow-0 animate__animated animate__bounceIn"
        width="85"
        height="85"
        contain
        :src="require('@/assets/no-actions-opens.svg')"
      ></v-img>
      <div class="body-2">Sin acciones abiertas</div>
    </div>
    <div v-else style="height: calc(300px - 49px); overflow: auto" class="mt-5">
      <v-list dense class="px-2">
        <v-list-item
          v-for="action in actions"
          :key="action.id"
          class="text-body-2 py-1 my-2 px-1"
          :style="{
            'border-left': `${fca.statuses[action.status].color} solid 2px`,
          }"
        >
          <v-col class="py-0">
            <ExtendTooltip
              :text="action.description"
              :trunc-length="isMobile ? 20 : 75"
            />
          </v-col>
          <v-col cols="3" class="py-0">
            <v-icon :large="isMobile" :color="fca.statuses[action.status].color"
              >mdi-circle-medium
            </v-icon>
            <span v-if="!isMobile" class="text-body-2">{{
              fca.statuses[action.status].abb
            }}</span>
            <div v-if="!isMobile" class="caption">
              {{ action.due_date | fechaDiaMesAnio }}
            </div>
          </v-col>
          <v-col cols="2" class="py-0 text-right">
            <t-btn-icon small @click="goToAction(action.id)">
              mdi-cog-outline
            </t-btn-icon>
          </v-col>
        </v-list-item>
      </v-list>
    </div>
  </v-card>
</template>
<script>
import { mapActions, mapState } from "vuex";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "HomeActionsCard",
  components: { TBtnIcon, ExtendTooltip },

  data() {
    return {
      fetchActions: false,
      statusSelected: [],
    };
  },

  computed: {
    ...mapState(["fca"]),

    statuses() {
      return [
        {
          name: "Vencidas",
          amount: this.overdueActions.length,
          visible: !!this.overdueActions.length,
        },
        {
          name: "Pendientes",
          amount: this.pendingActions.length,
          visible: !!this.pendingActions.length,
        },
        {
          name: "Ef. Vencida",
          amount: this.efOverdueActions.length,
          visible: !!this.efOverdueActions.length,
        },
        {
          name: "Ef. Pendiente",
          amount: this.efPendingActions.length,
          visible: !!this.efPendingActions.length,
        },
      ];
    },

    actions() {
      let actionsDisplayed = [];
      this.statusSelected.forEach((s) => {
        if (s === 0) {
          actionsDisplayed = [...actionsDisplayed, ...this.overdueActions];
        }
        if (s === 1) {
          actionsDisplayed = [...actionsDisplayed, ...this.pendingActions];
        }
        if (s === 2) {
          actionsDisplayed = [...actionsDisplayed, ...this.efOverdueActions];
        }
        if (s === 3) {
          actionsDisplayed = [...actionsDisplayed, ...this.efPendingActions];
        }
      });
      return actionsDisplayed.length ? actionsDisplayed : this.totalActions;
    },

    totalActions() {
      return [
        ...this.fca.homePageActions.eff_overdue_actions_not_open_events,
        ...this.fca.homePageActions.eff_pending_actions_not_open_events,
        ...this.fca.homePageActions.overdue_actions_not_open_events,
        ...this.fca.homePageActions.pending_actions_not_open_events,
      ];
    },

    overdueActions() {
      return this.fca.homePageActions.overdue_actions_not_open_events;
    },

    pendingActions() {
      return this.fca.homePageActions.pending_actions_not_open_events;
    },

    efOverdueActions() {
      return this.fca.homePageActions.eff_overdue_actions_not_open_events;
    },

    efPendingActions() {
      return this.fca.homePageActions.eff_pending_actions_not_open_events;
    },
  },
  methods: {
    ...mapActions(["get_home_page_data"]),

    goToAction(actionID) {
      const path = this.isMobile
        ? `actions/action/${actionID}`
        : `home/action-resume?id=${actionID}`;
      this.$router.push({
        path,
      });
    },

    updateHomeData() {
      this.fetchActions = true;
      this.get_home_page_data()
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "No pudieron actualizarse las acciones",
          });
        })
        .finally(() => {
          this.fetchActions = false;
        });
    },
  },
};
</script>
