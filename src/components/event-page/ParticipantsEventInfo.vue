<template>
  <div
    class="d-flex justify-space-between"
    :class="isNotebook ? 'flex-column' : 'flex-row'"
  >
    <div v-if="event.temp_event.leader" class="flex-shrink-0">
      <span class="text-body-2 font-weight-bold text--secondary mr-2"
        >Líder del evento</span
      >
      <v-menu
        v-if="editable"
        ref="menuLeader"
        offset-overflow
        left
        :close-on-content-click="false"
        :return-value.sync="newLeader"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            small
            :loading="leaderLoading"
            :disabled="!getUsers.length"
          >
            <v-icon color="primary" v-on="on">
              mdi-18px mdi-account-convert-outline
            </v-icon>
          </v-btn>
        </template>
        <v-card class="pa-4" width="400" elevation="2">
          <span class="text-body-2 mb-4">Nuevo líder</span>
          <AsyncCombobox
            class="mt-2"
            v-model="newLeader"
            :only-groups="['LEAD']"
            :api="eatApi().getFetcher()"
            url="/auth/users/search"
            search-param="keyword"
            :params="leaderParams"
            item-text="first_name"
            item-value="id"
            :combobox="false"
            outlined
            prepend-inner-icon="mdi-human-male-board"
            required
            return-object
            label="Seleccionar lider"
          >
            <template v-slot:item="{ item }">
              <span>{{ item.first_name }} {{ item.last_name }}</span>
            </template>
            <template v-slot:selection="data">
              <v-chip v-bind="data.attrs" :input-value="data.selected" small>
                {{ data.item | fullName }}
              </v-chip>
            </template>
          </AsyncCombobox>
          <div class="d-flex">
            <v-spacer />
            <t-btn-primary :disabled="!newLeader" @click="changeLeader"
              >cambiar
            </t-btn-primary>
          </div>
        </v-card>
      </v-menu>
      <div class="d-flex align-center mt-2 ml-2">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <UserAvatar
              v-on="on"
              left
              full
              :user-object="event.temp_event.leader"
              :size="isNotebook ? 40 : 36"
            />
          </template>
          Roles<br />
          {{
            event.temp_event.leader.groups.map(({ name }) => name).join(", ")
          }}
        </v-tooltip>
      </div>
    </div>
    <div v-if="event.temp_event.participants" class="mr-5 mt-10 mt-lg-0">
      <span class="text-body-2 font-weight-bold text--secondary"
        >Participantes
        <v-menu
          v-if="editable"
          ref="menuParticipants"
          offset-overflow
          left
          :close-on-content-click="false"
          :return-value.sync="newParticipants"
        >
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              class="ml-2"
              v-on="on"
              color="primary"
              :loading="parLoading"
              :disabled="!getUsers.length"
            >
              <v-icon>mdi-account-multiple-plus-outline</v-icon>
            </v-btn>
          </template>
          <v-card class="pa-4" width="400" elevation="2">
            <span class="text-body-2">Agregar participantes</span>
            <AsyncCombobox
              class="mt-2"
              v-model="newParticipants"
              :api="eatApi().getFetcher()"
              url="/auth/users/search"
              search-param="keyword"
              item-text="first_name"
              item-value="id"
              multiple
              required
              :combobox="false"
              prepend-inner-icon="mdi-account-group"
              :params="participantsParams"
              outlined
              return-object
              label="Seleccionar participantes"
            >
              <template v-slot:item="{ item }">
                <span>{{ item.first_name }} {{ item.last_name }}</span>
              </template>
              <template v-slot:selection="data">
                <v-chip v-bind="data.attrs" :input-value="data.selected" small>
                  {{ data.item | fullName }}
                </v-chip>
              </template>
            </AsyncCombobox>
            <div class="d-flex">
              <v-spacer />
              <v-btn
                text
                class="primary"
                x-small
                @click="addParticipants"
                :disabled="newParticipants ? !newParticipants.length : true"
                >agregar
              </v-btn>
            </div>
          </v-card>
        </v-menu>
      </span>
      <div class="d-flex flex-wrap align-center mt-2">
        <v-tooltip
          top
          v-for="(participant, i) in participants.slice(
            0,
            numberVisibleParticipants
          )"
          :key="i"
        >
          <template v-slot:activator="{ on }">
            <UserAvatar
              :user-object="participant"
              :size="isNotebook ? 36 : 32"
              class="ml-2 mb-2"
              style="cursor: pointer"
              v-on="on"
              @mouseover="participant.showOverlay = true"
              @mouseleave="participant.showOverlay = false"
            >
              <v-overlay
                v-if="editable"
                absolute
                :value="participant.showOverlay"
              >
                <v-icon small @click="deleteParticipant(participant.id)"
                  >mdi-close</v-icon
                >
              </v-overlay>
            </UserAvatar>
          </template>
          {{ participant | fullName }}
        </v-tooltip>
        <div class="mb-2 ml-2">
          <InfographicIcon
            small
            class="ml-2"
            color="#449CC9"
            v-if="participants.length > numberVisibleParticipants"
          >
            <v-menu
              open-on-click
              left
              :close-on-content-click="false"
              min-width="200px"
            >
              <template v-slot:activator="{ on }">
                <span
                  class="text-body-2 primary--text"
                  v-on="on"
                  style="cursor: pointer"
                  >+{{ participants.length - numberVisibleParticipants }}</span
                >
              </template>
              <v-card class="pa-2">
                <div
                  v-for="participant in participants.slice(
                    numberVisibleParticipants,
                    participants.length
                  )"
                  :key="participant.id"
                  class="text-body-2 d-flex align-center justify-space-between"
                >
                  <span>{{ participant | fullName }}</span>
                  <v-spacer />
                  <v-btn
                    v-if="editable"
                    icon
                    small
                    :loading="parLoading"
                    @click="deleteParticipant(participant.id)"
                  >
                    <v-icon small color="grey lighten-1">mdi-close</v-icon>
                  </v-btn>
                </div>
              </v-card>
            </v-menu></InfographicIcon
          >
        </div>
      </div>
      <template v-if="event.temp_event.participants">
        <v-chip
          v-show="false"
          v-for="(participant, i) in event.temp_event.participants"
          :key="i"
          :small="isNotebook"
          class="mr-2 mb-2"
          :close="event.temp_event.participants.length > 1 && editable"
          @click:close="deleteParticipant"
        >
          <UserAvatar :user-object="participant" left size="24" />
          {{ participant | fullName }}
        </v-chip>
      </template>
    </div>
  </div>
</template>

<script>
import { eatApi } from "@/apis";
import { mapActions, mapMutations, mapState } from "vuex";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import eventInfo from "@/views/EventsPanel/mixins/eventInfo";
import InfographicIcon from "@/components/reusable/InfographicIcon.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import { ROLES } from "@/mixins/globals";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";

export default {
  name: "ParticipantsEventInfo",
  components: {
    AsyncCombobox,
    TBtnPrimary,
    InfographicIcon,
    UserAvatar,
  },
  mixins: [eventInfo],
  data() {
    return {
      menuLeader: false,
      menuParticipants: false,
      leaderLoading: false,
      parLoading: false,
      newLeader: null,
      newParticipants: [],
      showOverlay: false,
      participants: [],
    };
  },

  created() {
    this.copyEventParticipants();
  },

  computed: {
    ...mapState(["event"]),

    participantsParams() {
      if (this.event.temp_event.facility.id == "N/A") {
        return { access_facilities__id: null };
      } else {
        return {
          access_facilities__id: this.event.temp_event.facility.id,
        };
      }
    },

    leaderParams() {
      if (this.event.temp_event.facility.id == "N/A") {
        return { access_facilities__id: null, groups__name: ["LEAD"] };
      } else {
        return {
          access_facilities__id: this.event.temp_event.facility.id,
          groups__name: ["LEAD"],
        };
      }
    },

    numberVisibleParticipants() {
      return this.isNotebook ? 8 : 4;
    },

    editable() {
      return this.enablePostEdit && this.canEditParticipants();
    },

    getLeaders() {
      return this.event.users.filter((user) =>
        user.groups.some((role) => role.name === ROLES.LEADER)
      );
    },

    getUsers() {
      let allParticipants = this.event.temp_event?.participants.map(
        (p) => p.id
      );
      allParticipants.push(this.event.temp_event.leader.id);
      return this.event.users.filter((u) => !allParticipants.includes(u.id));
    },
  },

  methods: {
    ...mapMutations("event", ["set_event", "set_participants"]),
    ...mapActions(["set_alert"]),

    eatApi() {
      return eatApi;
    },

    copyEventParticipants() {
      this.participants = this.event.temp_event?.participants.map((p) => {
        return { ...p, showOverlay: false };
      });
    },

    changeLeader() {
      this.$refs.menuLeader.save();
      this.leaderLoading = true;
      this.updateEvent({ leader: this.newLeader.id });
    },

    deleteParticipant(id) {
      this.parLoading = true;
      let participants = [];
      this.event.temp_event?.participants.forEach((p) => {
        if (p.id !== id) participants.push(p.id);
      });
      this.updateEvent({ participants });
    },

    addParticipants() {
      this.$refs.menuParticipants.save();
      this.parLoading = true;
      let participants = [
        ...this.newParticipants.map((p) => p.id),
        ...this.event.temp_event?.participants.map((p) => p.id),
      ];
      this.updateEvent({ participants });
      // this.newParticipants = [];
    },

    getEvent() {
      eatApi
        .getFetcher()
        .get(`events/full/${this.event.temp_event.id}`)
        .then((response) => {
          this.set_event(response.data.results);
          this.parLoading = false;
          this.leaderLoading = false;
          this.copyEventParticipants();
        })
        .catch(() => {
          this.parLoading = false;
          this.leaderLoading = false;
        });
    },

    updateEvent(params) {
      eatApi
        .getFetcher()
        .put("events/" + this.event.temp_event.id, params)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: "Evento editado",
          });
          // this.set_participants(params);
          this.getEvent();
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "El evento no pudo ser editado",
          });
        })
        .finally(() => {
          this.parLoading = false;
          this.leaderLoading = false;
        });
    },
  },
};
</script>
