<template>
  <v-container class="pa-0 ma-0" fluid>
    <TablePagination
      item-name="acciones"
      :page.sync="page"
      :length="pageCount"
      :total-items="fca.actionsData.totalItems"
      :loading="fca.loading.fetchActions"
      class="px-5"
    />
    <v-data-table
      :headers="headers"
      :items="fca.actions"
      fixed-header
      hide-default-footer
      :server-items-length="fca.actionsData.totalItems"
      :page="page"
      :options="options"
      @page-count="pageCount = $event"
      :loading="fca.loading.fetchActions"
    >
      <template v-slot:header.status="{ header }">
        <v-menu offset-y open-on-hover>
          <template v-slot:activator="{ on }">
            <span v-on="on" class="mdi mdi-help-circle">{{ header.text }}</span>
          </template>
          <v-card flat class="text-body-2 pa-3">
            <div>
              <v-icon class="green--text text-body-2">mdi-circle</v-icon>
              Completada
            </div>
            <div>
              <v-icon class="orange--text text-body-2">mdi-circle</v-icon>
              Pendiente
            </div>
            <div>
              <v-icon class="red--text text-body-2">mdi-circle</v-icon>
              Vencida
            </div>
            <br />
            <div>
              <v-icon class="orange--text text-body-2"
                >mdi-alpha-e-circle-outline
              </v-icon>
              Efec. Pendiente
            </div>
            <div>
              <v-icon class="green--text text-body-2"
                >mdi-alpha-e-circle-outline
              </v-icon>
              Efec. Completa
            </div>
            <div>
              <v-icon class="red--text text-body-2"
                >mdi-alpha-e-circle-outline
              </v-icon>
              Efec. Vencida
            </div>
          </v-card>
        </v-menu>
      </template>
      <template v-slot:body="{ items }" v-if="fca.actions.length">
        <tbody>
          <tr v-for="action in items" :key="action.id">
            <td>
              <span
                class="text-decoration-underline"
                style="cursor: pointer"
                @click="goToActionPage(action.id)"
                >{{ action.id }}</span
              >
            </td>
            <td class="py-1">
              <ExtendTooltip :text="action.description" :trunc-length="50" />
            </td>
            <td class="d-flex align-center">
              <UserAvatar :user-object="action.owner" size="35" class="mr-4" />
              {{ action.owner | fullName }}
            </td>
            <td>
              {{ action.due_date | fechaDiaMesAnio }}
              <v-tooltip right v-if="action.original_due_date" max-width="300">
                <template v-slot:activator="{ on }">
                  <v-icon x-small v-on="on" class="blue--text"
                    >mdi-calendar-arrow-right</v-icon
                  >
                </template>
                <p>Esta acción ha sido pospuesta al menos una vez</p>
                <p>Razón: {{ action.postpone_reason }}</p>
                <p>
                  Fecha original:
                  {{ action.original_due_date | fechaDiaMesAnio }}
                </p>
              </v-tooltip>
            </td>
            <td class="text-center">
              <v-btn
                v-if="action.parent_event"
                @click="eventSummary(action.parent_event.id)"
                text
                small
                >{{ action.parent_event.id }}
                {{ event.eventOrigins[action.parent_event.event_origin].abbr }}
              </v-btn>
            </td>
            <td class="pl-8">
              <v-icon :class="getActionStatusColor(action.status).color"
                >mdi-circle
              </v-icon>
              <v-tooltip
                bottom
                max-width="500"
                open-delay="200"
                v-if="
                  action.effectiveness &&
                  action.status !== '20PEND' &&
                  action.status !== '10ODUE'
                "
              >
                <template v-slot:activator="{ on }">
                  <v-icon
                    v-on="on"
                    small
                    :class="getActionStatusColor(action.status).color"
                    >mdi-alpha-e-circle-outline
                  </v-icon>
                </template>
                <span>{{ action.effectiveness_date | fechaDiaMesAnio }}</span>
              </v-tooltip>
            </td>
            <td class="text-left">
              <t-btn-icon small @click="resolveAction(action)">
                {{ resolveNameActionButton(action) }}
              </t-btn-icon>
              <t-btn-icon
                v-if="canSendMailToOwner(action)"
                small
                tooltip="Enviar correo a responsable"
                @click="sendActionMailToOwner(action)"
              >
                mdi-email-send-outline
              </t-btn-icon>
            </td>
          </tr>
        </tbody>
      </template>
      <template v-slot:no-data>
        <v-row class="ma-0 pa-0 mt-16">
          <div class="mx-auto d-flex flex-column align-center">
            <v-img
              :src="require('@/assets/noresult.svg')"
              max-width="60%"
              style="opacity: 0.5"
            ></v-img
            ><span class="text-h6 text--secondary mt-4"
              >No se encontraron resultados</span
            >
          </div>
        </v-row>
      </template>
    </v-data-table>
    <ActionTableMailDialog
      v-if="showMailDialog"
      v-on:close="showMailDialog = false"
    />
  </v-container>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from "vuex";
import { permissions } from "@/mixins/permissions";
import { ACTION_STATUSES as AS } from "@/mixins/globals";
import TablePagination from "@/components/reusable/TablePagination.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import ActionTableMailDialog from "@/components/actions-page/ActionTableMailDialog.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "ActionsTable",
  mixins: [permissions],
  components: {
    TBtnIcon,
    ActionTableMailDialog,
    UserAvatar,
    ExtendTooltip,
    TablePagination,
  },
  data() {
    return {
      options: { itemsPerPage: this.isNotebook ? 12 : 10 },
      pageCount: 0,
      headers: [
        {
          text: "ID",
          align: "start",
          value: "id",
          sortable: false,
        },
        { text: "Descripción", value: "description", sortable: false },
        { text: "Responsable", value: "owner__fullname", sortable: false },
        { text: "Vencimiento", value: "due_date", sortable: false },
        { text: "Evento", value: "event.id", align: "center", sortable: false },
        {
          text: "Estado",
          value: "status",
          align: "left",
          sortable: false,
        },
        { text: "", sortable: false },
      ],
      showMailDialog: false,
    };
  },

  created() {
    this.getActions();
  },

  computed: {
    ...mapState(["user", "event", "fca"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserOnlySme",
      "getFacilitiesByUser",
    ]),

    page: {
      get() {
        return this.fca.actionsFilters.page || 1;
      },
      set(page) {
        this.set_actions_filter({ page, page_size: this.options.itemsPerPage });
        this.get_actions();
      },
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("fca", [
      "set_actions_filter",
      "SET_ACTION",
      "reset_fca_filters",
    ]),
    ...mapActions("fca", ["get_actions"]),

    getActions() {
      // this.reset_fca_filters();
      this.set_actions_filter({
        page: this.page,
        page_size: this.options.itemsPerPage,
        ordering: "status",
        parent_event__status_not: "OPEN",
        owner__id: this.isCurrentUserOnlySme ? "" : this.currentUserId,
      });
      this.get_actions().catch(() => {
        this.SET_ALERT({
          appAlertType: "error",
          appAlertMsg: `Las acciones no pudieron cargarse`,
        });
      });
    },

    goToActionPage(actionID) {
      this.$router.push({
        path: `/actions/action/${actionID}`,
      });
    },

    resolveAction(action) {
      this.$router.push({
        name: `action-resume-actions`,
        query: { id: action.id },
      });
    },

    getActionStatusColor(status) {
      switch (status) {
        case AS.PENDING:
          return { color: "orange--text", name: "Pendiente" };
        case AS.OVERDUE:
          return { color: "red--text", name: "Vencida" };
        case AS.COMPLETED:
          return { color: "green--text", name: "Completada" };
        case AS.EF_COMPLETED:
          return { color: "green--text", name: "Eff. Completada" };
        case AS.EF_PENDING:
          return { color: "orange--text", name: "Eff. Pendiente" };
        case AS.EF_OVERDUE:
          return { color: "red--text", name: "Eff. Vencida" };
        default:
          return { color: "grey--text", name: "Sin definir" };
      }
    },

    resolveNameActionButton(action) {
      if (
        this.canResolveAction(action) ||
        this.canCompleteEffectiveness(action)
      ) {
        return "mdi-cog-outline";
      }
      return "mdi-eye-outline";
    },

    eventSummary(eventId) {
      this.$router.push({ path: `/events/eventinfo/${eventId}` });
    },

    sendActionMailToOwner(action) {
      this.SET_ACTION(action);
      this.showMailDialog = true;
    },
  },
};
</script>

<style scoped>
td {
  border-bottom: none !important;
}
.component-fade-enter-active,
.component-fade-leave-active {
  transition: all 0.1s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
