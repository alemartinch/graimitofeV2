<template>
  <v-dialog persistent width="400" value="true">
    <v-card>
      <v-card-title>Certificar evento</v-card-title>
      <v-card-text>
        <v-form v-model="valid">
          <div class="body-2 my-2">Comentario</div>
          <v-textarea
            v-model="certifyComment"
            class="text-body-2"
            auto-grow
            solo
            flat
            outlined
            dense
            :rules="certifyCommentRules"
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <t-btn-secondary @click="$emit('close-dialog')">cerrar</t-btn-secondary>
        <t-btn-primary :disabled="!valid" @click="$emit('certify-event')"
          ><v-icon left>mdi-seal-variant</v-icon>certificar
        </t-btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapMutations, mapState } from "vuex";
import { INPUTS_LENGTH } from "@/mixins/globals";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "EventCertificationComment",
  components: { TBtnPrimary, TBtnSecondary },
  data() {
    return {
      valid: false,
      certifyCommentRules: [
        (v) =>
          v.length <= INPUTS_LENGTH.EVENT_CERTIFICATE_COMMENT ||
          `Max ${INPUTS_LENGTH.EVENT_CERTIFICATE_COMMENT} caracteres`,
      ],
    };
  },
  computed: {
    ...mapState(["event"]),
    certifyComment: {
      get() {
        return this.event.temp_event.leader_comments;
      },
      set(comment) {
        this.set_leader_comments(comment);
      },
    },
  },
  methods: {
    ...mapMutations("event", ["set_leader_comments"]),
  },
};
</script>
