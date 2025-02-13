<template>
  <div
    class="pt-0 px-5 pa-md-5 overflow-auto"
    style="height: 100%; box-shadow: -5px 0 5px -5px rgba(99, 99, 99, 0.2)"
  >
    <slot name="data-header"></slot>

    <template v-if="!isMobile">
      <ActionStatusInfo class="mt-3" />
    </template>
    <v-divider class="my-5" />

    <div v-if="isMobile" class="text-subtitle-2 font-weight-medium">
      Responsable
    </div>
    <div class="d-flex justify-space-between align-center mt-2">
      <UserAvatar :user-object="currentAction.owner" size="35" full />
      <v-menu
        v-if="event.postEdit && canPostEditAction()"
        ref="menuOwner"
        offset-overflow
        left
        :close-on-content-click="false"
        :return-value.sync="newActionOwner"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            v-on="on"
            small
            color="primary"
            icon
            plain
            :ripple="false"
            :loading="loading.newActionOwner"
            :disabled="!getUsers.length"
          >
            <v-icon>mdi-18px mdi-account-convert-outline</v-icon>
          </v-btn>
        </template>
        <v-card class="pa-4" width="350">
          <span class="text-body-2">Nuevo responsable</span>
          <AsyncCombobox
            v-model="newActionOwner"
            :api="eatApi().getFetcher()"
            url="/auth/users/search"
            search-param="keyword"
            item-text="first_name"
            item-value="id"
            :combobox="false"
            outlined
            dense
            prepend-inner-icon="mdi-human-male-board"
            required
            return-object
          >
            <template v-slot:item="{ item }">
              <span>{{ item.first_name }} {{ item.last_name }}</span>
            </template>
            <template v-slot:selection="data">
              <v-chip
                class="py-3"
                v-bind="data.attrs"
                :input-value="data.selected"
                small
              >
                {{ data.item | fullName }}
              </v-chip>
            </template>
          </AsyncCombobox>
          <div class="d-flex">
            <v-spacer />
            <t-btn-primary
              small
              @click="changeOwner"
              :loading="loading.newActionOwner"
              >cambiar
            </t-btn-primary>
          </div>
        </v-card>
      </v-menu>
    </div>

    <v-divider class="my-5" />

    <template v-if="currentAction.action_type">
      <div class="d-flex align-center mt-5">
        <InfographicIcon icon="mdi-label-multiple-outline" />
        <div class="ml-3 d-flex flex-column">
          <span class="caption text--secondary">Tipo </span>
          <span class="text-md-body-2 font-weight-bold">
            {{ getActionType(currentAction.action_type) }}
          </span>
        </div>
        <v-spacer />
        <v-btn
          v-if="event.postEdit && canPostEditAction()"
          icon
          plain
          small
          color="primary"
          :ripple="false"
          :tooltip="
            'Cambiar a' + currentAction.action_type === 'IMPR'
              ? 'Correctiva'
              : 'Preventiva'
          "
          :loading="loading.newActionType"
          @click="changeActionType"
        >
          <v-icon>mdi-swap-horizontal-circle-outline</v-icon>
        </v-btn>
      </div>
      <v-divider class="my-5" />
    </template>

    <ActionTimeline />
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { eatApi } from "@/apis/index.js";
import {permissions} from "@/mixins/permissions/index.js";
import ActionTimeline from "@/components/actions-page/ActionResume/ActionTimeline.vue";
import ActionStatusInfo from "@/components/actions-page/ActionResume/ActionStatusInfo.vue";
import InfographicIcon from "@/components/reusable/InfographicIcon.vue";

export default {
  name: "ActionResumeData",
  components: {
    InfographicIcon,
    ActionStatusInfo,
    ActionTimeline,
    TBtnPrimary,
    UserAvatar,
    AsyncCombobox,
  },
  mixins: [permissions],
  data() {
    return {
      newActionOwner: null,
      loading: { newActionOwner: false, newActionType: false },
    };
  },

  computed: {
    ...mapState(["event", "fca"]),

    getUsers() {
      return this.event.users.filter(
        (u) => u.id !== this.currentAction.owner.id
      );
    },

    currentAction() {
      return this.$store.getters["fca/getCurrentAction"];
    },

    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    photo() {
      return this.currentAction.owner?.photo || null;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("fca", [
      "setAction_owner",
      "setAction_action_type",
      "UPDATE_ACTION",
    ]),
    ...mapActions("fca", ["update_action"]),

    eatApi() {
      return eatApi;
    },

    changeOwner() {
      this.$refs.menuOwner.save();
      this.loading.newActionOwner = true;
      this.update_action({ owner: this.newActionOwner })
        .then((resAction) => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "La acción ha sido actualizada con éxito",
          });
          this.UPDATE_ACTION(resAction);
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al actualizar la acción",
          });
        })
        .finally(() => (this.loading.newActionOwner = false));
    },

    changeActionType() {
      this.loading.newActionType = true;
      const action_type =
        this.currentAction.action_type === "IMPR" ? "CORR" : "IMPR";
      this.update_action({ action_type })
        .then((resAction) => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "La acción ha sido actualizada con éxito",
          });
          this.UPDATE_ACTION(resAction);
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al actualizar la acción",
          });
        })
        .finally(() => (this.loading.newActionType = false));
    },

    getActionType(actionType) {
      switch (actionType) {
        case "IMPR":
          return "Preventiva";
        case "CORR":
          return "Correctiva";
        default:
          return "No aplica";
      }
    },
  },
};
</script>
<style scoped>
.v-timeline-item__divider {
  justify-content: start !important;
}
</style>
