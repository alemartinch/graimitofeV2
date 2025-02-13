<template>
  <div>
    <v-dialog
      v-model="showAttachDialog"
      max-width="800"
      persistent
      scrollable
      v-if="editable"
    >
      <template v-slot:activator="{ on }">
        <t-btn-icon small v-on="on"> mdi-arrow-expand</t-btn-icon>
      </template>
      <AttachFiles v-on:evt-close-attach="getEvent" />
    </v-dialog>
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import AttachFiles from "@/components/newevent-page/EventLoader/AttachFiles.vue";
import { eatApi } from "@/apis";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "EventFilesList",
  components: { TBtnIcon, AttachFiles },
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialog: false,
      showAttachDialog: false,
      loading: false,
    };
  },
  computed: {
    ...mapState(["event"]),
  },
  methods: {
    ...mapMutations("event", ["set_event"]),
    getEvent() {
      this.showAttachDialog = false;
      this.loading = true;
      eatApi
        .getFetcher()
        .get(`events/full/${this.event.temp_event.id}`)
        .then((response) => {
          this.set_event(response.data.results);
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped></style>
