<template>
  <v-container class="pa-0">
    <v-card
      :outlined="parent ? parent.type === 'event' : true"
      :flat="parent ? parent.type !== 'event' : true"
      :min-height="setMinHeight"
      class="d-flex flex-column justify-space-between"
    >
      <v-card-title
        v-if="parent ? parent.type === 'event' : !noTitle"
        class="py-2 brown lighten-3"
      >
        Acciones
        <v-spacer />
        <t-btn-primary
          v-if="canAddAction"
          plain
          :ripple="false"
          color="darkbrown"
          @click="
            newActionDialog = true;
            setParent();
          "
        >
          <v-icon left small>mdi-plus</v-icon>
          <span class="caption"> Agregar acción </span>
        </t-btn-primary>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-progress-linear v-if="cardLoading" indeterminate />
        <v-simple-table
          v-if="actions"
          :dense="isNotebook"
          :height="tableHeight"
          fixed-header
        >
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  <span>ID</span>
                </th>
                <th class="text-left">
                  <span class="mdi mdi-family-tree mdi-rotate-180"></span>
                </th>
                <th class="text-left">Descripción</th>
                <th class="text-left">Responsable</th>
                <th class="text-left">Estado</th>
                <th class="text-left" v-if="!mobile">Vencimiento</th>
                <th class="text-left"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="action in actions" :key="action.id">
                <td>{{ action.id }}</td>
                <td v-if="!loader && !mobile">
                  {{
                    parentName(
                      action.parent ? action.parent.type : parent.type
                    )
                  }}{{ action.parent ? action.parent.id : parent.id }}
                </td>
                <td>
                  <ExtendTooltip :text="action.description" trunc-length="30" />
                </td>
                <td class="text-left">
                  <UserAvatar :user-object="action.owner" size="28" />
                </td>
                <td>
                  <v-icon
                    :large="isMobile"
                    :color="fca.statuses[action.status].color"
                    >mdi-circle-medium
                  </v-icon>
                  <span v-if="!isMobile" class="text-body-2">{{
                    fca.statuses[action.status].abb
                  }}</span>
                </td>
                <td v-if="!mobile">
                  {{ action.due_date | fechaText }}
                  <v-tooltip right v-if="action.original_due_date">
                    <template v-slot:activator="{ on }">
                      <v-icon x-small v-on="on" class="blue--text"
                        >mdi-calendar-arrow-right</v-icon
                      >
                    </template>
                    <span>Esta acción ha sido pospuesta al menos una vez</span>
                    <p>{{ action.postpone_reason }}</p>
                  </v-tooltip>
                </td>
                <td v-if="!loader">
                  <t-btn-icon
                    color="primary"
                    @click="
                      $router.push({
                        name: `action-resume-events`,
                        query: { id: action.id },
                      })
                    "
                    >mdi-cog-outline</t-btn-icon
                  >
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
      <v-card-actions v-if="loader">
        <v-btn
          block
          color="#caad8b"
          text
          small
          @click="
            newActionDialog = true;
            setParent();
          "
          >Agregar acción
        </v-btn>
      </v-card-actions>
    </v-card>
    <!--CARGA DE ACCION-->
    <v-dialog
      v-model="newActionDialog"
      persistent
      max-width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
      transition="isMobile ? 'dialog-bottom-transition' : ''"
    >
      <ActionsLoader
        :key="'l' + key"
        :editAction="editActionFlag"
        @evt-close-dialog="closeActionDialog"
      />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import { EVENT_ORIGINS, ACTION_STATUSES as AS } from "@/mixins/globals";
import ActionsLoader from "@/components/newevent-page/EventLoader/FcaLoader/ActionsLoader.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "ActionICard",
  components: {
    TBtnPrimary,
    TBtnIcon,
    UserAvatar,
    ExtendTooltip,
    ActionsLoader,
  },
  mixins: [permissions],
  props: {
    parent: {
      type: Object,
    },
    actions: {
      type: Array,
      required: true,
    },
    noTitle: {
      type: Boolean,
      default: false,
    },
    loader: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      key: "",
      actionDetailDialog: false,
      cardLoading: false,
      newActionDialog: false,
      editActionFlag: false,
    };
  },
  computed: {
    ...mapState(["event", "fca"]),

    mobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    tableHeight() {
      if (this.loader) return "auto";
      return this.isNotebook ? 250 : 340;
    },

    setMinHeight() {
      if (this.parent) {
        return this.parent.type !== "event" &&
          !this.$vuetify.breakpoint.smAndDown
          ? 0
          : 0;
      }
      return 0;
    },

    canAddAction() {
      if (
        this.event.temp_event.event_origin === EVENT_ORIGINS.PROJECT ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.CHANGE ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.INTERNAL_REQ ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.EXTERNAL_REQ ||
        this.event.temp_event.event_origin === EVENT_ORIGINS.MEET
      ) {
        return this.canPostAddAction();
      }
      return false;
    },
  },
  methods: {
    ...mapMutations("fca", ["set_action", "setAction_event", "set_parent"]),
    ...mapMutations("event", ["set_event"]),

    parentName(type) {
      switch (type) {
        case "finding":
          return "H";
        case "event":
          return "E";
        case "cause":
          return "C";
        default:
          return "E";
      }
    },

    showActionDetail(action) {
      this.set_action(action);
      this.set_parent(this.parent || action.parent);
      this.key = action.id;
    },

    closeActionDialog() {
      this.newActionDialog = false;
      if (this.event.postEdit) {
        this.$emit("close-new-action-dialog");
      }
      this.editActionFlag = false;
    },

    getActionStatusColor(status) {
      if (this.loader) {
        return { color: "" };
      }
      switch (status) {
        case AS.PENDING:
          return { color: "yellow lighten-4", name: "Pendiente" };
        case AS.OVERDUE:
          return { color: "red lighten-4", name: "Vencida" };
        case AS.COMPLETED:
          return { color: "green lighten-4", name: "Completada" };
        case AS.EF_COMPLETED:
          return { color: "green lighten-4", name: "Eff. Completada" };
        case AS.EF_PENDING:
          return { color: "orange lighten-4", name: "Eff. Pendiente" };
        case AS.EF_OVERDUE:
          return { color: "red lighten-4", name: "Eff. Vencida" };
        default:
          return { color: "grey lighten-4", name: "Sin definir" };
      }
    },

    setParent() {
      this.set_parent(this.parent);
    },
  },
};
</script>

<style scoped></style>
