<template>
  <v-container class="pa-0 ma-0" fluid>
    <TablePagination
      item-name="eventos"
      :page.sync="page"
      :length="pageCount"
      :total-items="event.eventsData.totalItems"
      :loading="event.loading.fetchEvents"
      class="px-5"
    />
    <v-progress-linear
      v-if="event.loading.fetchEvents"
      color="primary"
      indeterminate
    ></v-progress-linear>
    <v-data-table
      v-else
      :items="event.events"
      :headers="headers"
      fixed-header
      hide-default-footer
      :server-items-length="event.eventsData.totalItems"
      :page="page"
      :options="options"
      @page-count="pageCount = $event"
    >
      <template v-slot:body="{ items }">
        <tbody>
          <tr
            v-for="ev in items"
            :key="ev.id"
            :class="ev.status === 'OPEN' ? 'text--disabled' : ''"
          >
            <td>
              {{ ev.id }}
              <v-tooltip right v-if="canPostEditEvent(ev)">
                <template v-slot:activator="{ on }">
                  <v-icon x-small v-on="on">mdi-pencil</v-icon>
                </template>
                Puedes editar este evento
              </v-tooltip>
              <v-tooltip right v-if="ev.restricted">
                <template v-slot:activator="{ on }">
                  <v-icon x-small color="red" v-on="on"
                    >mdi-lock-outline</v-icon
                  >
                </template>
                Evento restringido
              </v-tooltip>
            </td>
            <td>
              {{ event.eventOrigins[ev.event_origin].name || "" }}
            </td>
            <td>
              {{ ev.originator | fullName }}
            </td>
            <td>
              <ExtendTooltip
                :text="
                  ev.event_origin !== 'OBSV'
                    ? ev.summary
                    : ev.findings[0].description
                "
                trunc-length="50"
              />
            </td>
            <td>
              {{ ev.occurrence_date | fechaDiaMesAnio }}
            </td>
            <td class="text-left">
              {{ codeStatus(ev.status) }}
            </td>
            <td class="text-center">
              <t-btn-icon
                v-if="ev.status !== 'OPEN'"
                :color="canCertifyEvent(ev) ? 'accent' : 'primary'"
                @click="openEventSummary(ev)"
                class="pa-0"
                :disabled="!canViewEvent(ev)"
              >
                {{ resolveNameEventButton(ev) }}
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
            <v-btn
              small
              text
              plain
              color="primary"
              class="mt-5"
              @click="$router.push({ path: `/create_event/` })"
              >crear nuevo evento</v-btn
            >
          </div>
        </v-row>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";
import { EVENT_STATUSES } from "@/mixins/globals";
import TablePagination from "@/components/reusable/TablePagination.vue";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import { getSixMonthsAgo, getToday } from "../../store/modules/helpers.js";

export default {
  name: "EventsTable",
  components: { TBtnIcon, ExtendTooltip, TablePagination },
  mixins: [permissions],
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
        {
          text: "Origen",
          align: "start",
          value: "event_origin",
          sortable: false,
        },
        {
          text: "Originador",
          align: "start",
          value: "originator.first_name",
          sortable: false,
        },
        {
          text: "Resumen",
          align: "start",
          value: "summary",
          sortable: false,
        },
        {
          text: "Ocurrió el",
          align: "start",
          value: "occurrence_date",
          sortable: false,
        },
        {
          text: "Estado",
          align: "left",
          value: "status",
          sortable: false,
        },
        {
          text: "",
          align: "center",
          sortable: false,
        },
      ],
    };
  },

  created() {
    this.getEvents();
  },

  computed: {
    ...mapState(["event"]),
    ...mapGetters("user", [
      "currentUserId",
      "isCurrentUserOnlySme",
      "getFacilitiesByUser",
    ]),

    page: {
      get() {
        return this.event.eventsFilters.page || 1;
      },
      set(page) {
        this.set_events_filter({ page, page_size: this.options.itemsPerPage });
        this.get_events();
      },
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("event", ["set_events_filter"]),
    ...mapActions("event", ["get_events"]),

    codeStatus(status) {
      switch (status) {
        case EVENT_STATUSES.CERTIFICATE:
          return "CERT";
        case EVENT_STATUSES.PENDING_EFFECTIVENESS:
          return "EFEC";
        default:
          return status;
      }
    },

    openEventSummary(event) {
      this.$router.push({ path: `/events/eventinfo/${event.id}` });
    },

    getEvents() {
      this.set_events_filter({
        page: this.page,
        page_size: this.options.itemsPerPage,
      });
      this.get_events()
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Los eventos no pudieron cargarse`,
          });
        });
    },

    resolveNameEventButton(event) {
      return this.canCertifyEvent(event)
        ? "mdi-file-certificate-outline"
        : "mdi-eye-outline";
    },
  },
};
</script>

<style scoped>
td {
  border-bottom: none !important;
}
</style>
