class="ma-0"
<template>
  <v-container class="pa-0 ma-0" fluid>
    <v-form v-model="isValidStep" ref="form">
      <v-row class="ma-0">
        <v-col cols="12" md="6">
          <div class="body-2 my-2 d-flex align-center">
            Líder del evento
            <v-switch
              v-if="event.temp_event.event_origin === 'MEET'"
              v-model="leaderEnable"
              @change="resetLeader"
              class="mt-0 ml-2"
              dense
              hide-details
            ></v-switch>
          </div>
          <AsyncCombobox
            v-model="leader"
            :api="eatApi().getFetcher()"
            url="/auth/users/search"
            search-param="keyword"
            :params="leaderParams"
            item-text="first_name"
            item-value="id"
            :preload="[event.temp_event.leader]"
            :combobox="false"
            outlined
            dense
            prepend-inner-icon="mdi-human-male-board"
            :disabled="
              !event.availableFields.leader ||
              (event.temp_event.event_origin === 'MEET' && !leaderEnable)
            "
            :rules="event.temp_event.event_origin === 'MEET' ? [] : leaderRules"
            required
            return-object
            @change="update_event"
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
        </v-col>
      </v-row>
      <v-row class="ma-0">
        <v-col
          v-if="event.availableFields.participants"
          cols="12"
          md="6"
          class="py-0"
        >
          <div class="body-2 my-2 d-flex align-center">
            Participantes
            <v-switch
              v-if="
                event.temp_event.event_origin === 'IAUD' ||
                event.temp_event.event_origin === 'EAUD'
              "
              v-model="participantsEnable"
              @change="resetParticipants"
              class="mt-0 ml-2"
              dense
              hide-details
            ></v-switch>
          </div>
          <AsyncCombobox
            v-model="participants"
            :api="eatApi().getFetcher()"
            url="/auth/users/search"
            search-param="keyword"
            item-text="first_name"
            item-value="id"
            :preload="[...event.temp_event.participants]"
            prepend-inner-icon="mdi-account-group"
            :params="participantsParams"
            outlined
            dense
            multiple
            :rules="[
              (v) => v.length > 0 || 'Es necesario al menos un participante',
            ]"
            :disabled="
              !event.availableFields.participants ||
              ((event.temp_event.event_origin === 'IAUD' ||
                event.temp_event.event_origin === 'EAUD') &&
                !participantsEnable)
            "
            required
            :combobox="false"
            return-object
            @change="update_event"
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
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { ROLES } from "@/mixins/globals";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { eatApi } from "@/apis";

export default {
  components: { AsyncCombobox },
  data() {
    return {
      leaderEnable: false,
      participantsEnable: false,
      isValidStep: false,
      leaderRules: [(v) => !!v || "El líder de evento es requerido"],
    };
  },

  computed: {
    ...mapState(["event", "user"]),

    changeFacility() {
      return this.event.temp_event.facility.id;
    },

    participantSwitch() {
      return this.participantsEnable;
    },

    getLeaders() {
      return this.event.users.filter((user) =>
        user.groups.some((role) => role.name === ROLES.LEADER)
      );
    },

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

    leader: {
      get() {
        return this.event.temp_event.leader;
      },
      set(leader) {
        this.set_leader(leader);
      },
    },

    participants: {
      get() {
        return this.event.temp_event.participants;
      },
      set(participant) {
        this.set_participants(participant);
      },
    },
  },

  watch: {
    changeFacility(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.set_leader(null);
        this.set_participants([]);
      }
    },

    participantSwitch(newValue) {
      this.set_participants_switch(newValue);
    },
  },

  methods: {
    eatApi() {
      return eatApi;
    },
    ...mapMutations("event", [
      "set_participants",
      "set_leader",
      "remove_participants",
      "remove_leader",
      "set_participants_switch",
    ]),

    ...mapActions(["set_alert"]),
    ...mapActions("event", ["update_event"]),

    resetLeader(input) {
      if (!input) {
        this.set_leader("");
        this.update_event();
      }
    },
    resetParticipants(input) {
      if (!input) {
        this.set_participants([]);
        this.update_event();
      }
    },

    remove(item) {
      const index = this.friends.indexOf(item.name);
      if (index >= 0) this.friends.splice(index, 1);
    },
  },
};
</script>

<style />
