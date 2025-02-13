<template>
  <v-dialog v-model="dialog" width="800" persistent>
    <v-card :disabled="loading">
      <v-card-title>Previsualización del correo</v-card-title>
      <v-card-text>
        <div>
          <span class="mr-2 font-weight-bold">Asunto:</span>
          <span>TCMT | IMPORTANTE recordatorio de seguimiento de ACCIÓN</span>
        </div>
        <div>
          <span class="mr-2 font-weight-bold">Destinatario:</span>
          <span
            >{{ temp_action.owner | fullName }} (responsable de la acción)</span
          >
        </div>
        <div v-if="temp_action.parent_event.leader">
          <span class="mr-2 font-weight-bold">Copia:</span>
          <span
            >{{ temp_action.parent_event.leader | fullName }} (líder del
            evento)</span
          >
        </div>
        <div class="mt-5">
          <v-textarea v-model="bodyMsg" solo dense outlined flat></v-textarea>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <t-btn-secondary @click="$emit('close')">Cancelar</t-btn-secondary>
        <t-btn-primary @click="sendMail" :loading="loading"
          >Enviar</t-btn-primary
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { ACTION_STATUSES } from "@/mixins/globals";
import { eatApi } from "@/apis";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";

export default {
  name: "ActionTableMailDialog",
  components: { TBtnPrimary, TBtnSecondary },
  data() {
    return {
      dialog: true,
      bodyMsg: "",
      loading: false,
    };
  },
  created() {
    const statusString = [
      ACTION_STATUSES.COMPLETED,
      ACTION_STATUSES.OVERDUE,
      ACTION_STATUSES.PENDING,
    ].includes(this.temp_action.status)
      ? this.statuses[this.temp_action.status].abb
      : `con ${this.statuses[this.temp_action.status].abb}`;
    this.bodyMsg = `${this.temp_action.owner.first_name}, usted tiene la siguiente acción ${statusString}`;
  },
  computed: {
    ...mapState("fca", ["temp_action", "statuses"]),
  },
  methods: {
    ...mapMutations(["SET_ALERT"]),

    sendMail() {
      this.loading = true;
      eatApi
        .getFetcher()
        .post(`/actions/${this.temp_action.id}/resend-notification`, {
          note: this.bodyMsg,
        })
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `El correo fue enviado correctamente`,
          });
          this.$emit("close");
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Ocurrió un error y no pudo enviarse el correo.`,
          });
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped></style>
