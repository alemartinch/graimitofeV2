<template>
  <v-container>
    <v-card>
      <v-card-title>Adminstrador de Tareas</v-card-title>
      <v-card-text>
        <v-row class="pa-5">
          <v-col cols="4">
            <v-row>
              <span
                ><span class="black--text">Id: </span>
                <span class="blue--text">{{ har.occurrence.id }}</span></span
              >
            </v-row>
            <v-row>
              <span
                ><span class="black--text">Responsable:</span>
                <template v-if="har.occurrence.owner === null">
                  Sin asignar
                </template>
                <template v-else>{{
                  har.occurrence.owner.username
                }}</template></span
              >
            </v-row>
            <v-row>
              <span
                ><span class="black--text">Vencimiento:</span>
                {{ har.occurrence.due_date }}</span
              >
            </v-row>
            <v-row>
              <span
                ><span class="black--text">Estado actual: </span
                >{{ har.taskStatuses[har.occurrence.status].name }}</span
              >
            </v-row>
          </v-col>
          <v-col cols="8">
            <v-row>
              <span class="black--text">Descripcion: </span>
              {{ har.occurrence.description }}
            </v-row>
            <v-row class="pt-2">
              <span class="black--text mr-1">Comentarios: </span>
              {{ har.occurrence.comment }}
            </v-row>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row>
          <v-col cols="4">
            <v-radio-group
              v-model="selected"
              v-if="har.occurrence.status === 'PEND'"
            >
              <v-radio label="En proceso" value="enproceso"></v-radio>
              <v-radio label="Completado" value="completada"></v-radio>
            </v-radio-group>
            <v-radio-group v-model="selected" v-else>
              <v-radio label="Completado" value="completada"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="8" class="mt-6">
            <v-text-field
              v-model="comment"
              placeholder="Agregar comentarios..."
              outlined
            >
            </v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-row class="justify-end">
          <v-col cols="2" class="pl-15">
            <v-btn @click="closePanel" text plain>Cerrar</v-btn>
          </v-col>
          <v-col cols="2">
            <v-btn
              @click="
                setStatusOccurrence(
                  selected,
                  har.occurrence.repet_action_id,
                  har.occurrence.id
                )
              "
              color="primary"
              text
              >Guardar</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { tcmtRegApi } from "@/apis";
import { mapMutations, mapState } from "vuex";
export default {
  name: "TaskManage",
  data() {
    return {
      statusTask: ["enproceso", "completada"],
      selected: "",
      comment: "",
    };
  },
  computed: {
    ...mapState(["har"]),
  },
  methods: {
    ...mapMutations(["SET_ALERT"]),
    closePanel() {
      this.$emit("close-task-manage");
    },

    setStatusOccurrence(val, repId, ocId) {
      let repetId = repId;
      let occuId = ocId;

      if (val === "enproceso") {
        tcmtRegApi
          .getFetcher()
          .post(
            `/repet-actions/${repetId}/occurrences/${occuId}/set-in-progress`,
            { comment: this.comment }
          )
          .then((res) => {
            this.closePanel();
          });
      } else {
        {
          tcmtRegApi
            .getFetcher()
            .post(
              `/repet-actions/${repetId}/occurrences/${occuId}/set-complete`,
              { comment: this.comment }
            )
            .then((res) => {
              this.closePanel();
            });
        }
      }

      this.SET_ALERT({
        appAlertType: "success",
        appAlertMsg: `Se cambio el estado de la Tarea`,
      });
    },
  },
};
</script>

<style scoped></style>
