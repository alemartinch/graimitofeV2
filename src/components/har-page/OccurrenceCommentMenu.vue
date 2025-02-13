<template>
  <div>
    <v-menu
      v-model="menu"
      offset-y
      nudge-bottom="10"
      nudge-left="150"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ on }">
        <v-tooltip top>
          <template v-slot:activator="{ on: onTooltip }">
            <v-btn
              icon
              small
              v-on="on"
              color="primary"
              :disabled="occurrence.status === '40COMP'"
            >
              <v-icon v-on="onTooltip">mdi-swap-vertical-circle-outline</v-icon>
            </v-btn>
          </template>
          Cambiar estado
        </v-tooltip>
      </template>
      <v-card width="300px" class="pa-5">
        <span class="text-body-2">Pasar a:</span>
        <v-chip-group v-model="nextStatus" mandatory>
          <v-chip value="INPR" small filter :disabled="occurrence.in_progress"
            >En proceso</v-chip
          >
          <v-chip value="COMP" small filter>Completa</v-chip>
        </v-chip-group>
        <v-form v-model="formValid">
          <v-textarea
            v-model="comment"
            label="Comentario"
            dense
            auto-grow
            rows="1"
            class="text-body-2 mt-5"
            :rules="[(v) => v.length <= 250 || 'Máx. 250 caracteres']"
          />
        </v-form>
        <v-card-actions class="justify-end pa-0">
          <v-btn
            text
            small
            color="primary"
            @click="setOccurrenceStatus"
            :loading="loadingUpdateOcurrences"
            :disabled="!formValid"
            >cambiar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>
<script>
import { tcmtRegApi } from "@/apis";
import { mapMutations } from "vuex";

export default {
  name: "OccurrenceCommentMenu",

  props: {
    occurrence: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      menu: false,
      formValid: true,
      comment: "",
      nextStatus: "",
      loadingUpdateOcurrences: false,
    };
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    setOccurrenceStatus() {
      const nextStatus =
        this.nextStatus === "INPR" ? "set-in-progress" : "set-complete";
      const taskId = this.occurrence.taskId || this.occurrence.repet_action.id;
      this.loadingUpdateOcurrences = true;
      tcmtRegApi
        .getFetcher()
        .post(
          `repet-actions/${taskId}/occurrences/${this.occurrence.id}/${nextStatus}`,
          { comment: this.comment }
        )
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: `El estado de la ocurrencia se modificó correctamente`,
          });
          this.$emit("close-occurrence-dialog", "noLoading");
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: `Hubo un error al modificar el estado de la ocurrencia`,
          });
        })
        .finally(() => {
          this.loadingUpdateOcurrences = false;
          this.menu = false;
          this.comment = "";
        });
    },
  },
};
</script>
