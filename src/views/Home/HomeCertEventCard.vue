<template>
  <v-card height="300px" elevation="22" outlined class="d-flex flex-column">
    <v-card-title
      class="py-2"
      style="border-bottom: rgba(44, 103, 125, 0.16) solid 1px"
      >Eventos pendientes de certificación
    </v-card-title>
    <div
      v-if="!valiEvents.length"
      class="flex-grow-1 d-flex flex-column justify-center align-center"
    >
      <v-img
        class="flex-grow-0 animate__bounceIn"
        width="85"
        height="85"
        contain
        :src="require('@/assets/no-pendings-events.svg')"
      ></v-img>
      <div class="body-2">Sin eventos para certificar</div>
    </div>
    <div v-else style="height: calc(300px - 49px); overflow: auto" class="mt-5">
      <v-list dense>
        <v-list-item
          v-for="ev in valiEvents"
          :key="ev.id"
          class="py-1"
          style="border-bottom: rgba(44, 103, 125, 0.16) solid 1px"
        >
          <v-col cols="2" md="4" class="py-0">
            <span class="caption">{{ ev.id }}</span> <br />
            <span>{{
              isMobile
                ? event.eventOrigins[ev.event_origin].abbr
                : event.eventOrigins[ev.event_origin].name
            }}</span>
          </v-col>
          <v-col class="text-body-2">
            <ExtendTooltip :text="ev.summary" :trunc-length="100" />
          </v-col>
          <v-col cols="1">
            <t-btn-icon
              @click="$router.push({ path: `/events/eventinfo/${ev.id}` })"
            >
              mdi-file-certificate-outline
            </t-btn-icon>
          </v-col>
        </v-list-item>
      </v-list>
    </div>
  </v-card>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { EVENT_STATUSES } from "@/mixins/globals";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "HomeCertEventCard",
  components: { TBtnIcon, ExtendTooltip },

  data() {
    return {
      delEventID: null,
      showPrompt: false,
      delEventLoading: false,
    };
  },
  computed: {
    ...mapState(["event"]),

    valiEvents() {
      return this.event.homePageEvents.filter(
        (e) => e.status === EVENT_STATUSES.CERTIFICATE
      );
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapActions("event", ["delete_event"]),

    goToEvent() {
      const path = this.isMobile ? "/observations" : "/create_event";
      this.$router.push({ path });
    },
  },
};
</script>
