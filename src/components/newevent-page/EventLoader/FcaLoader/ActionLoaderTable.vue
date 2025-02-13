<template>
  <v-container class="ma-0 pa-0" fluid>
    <v-btn
      v-if="parent.type === 'event'"
      class="ma-2"
      outlined
      tile
      text
      @click="
        newActionDialog = true;
        setParent();
      "
    >
      <v-icon left>mdi-plus-box-outline</v-icon>
      <span class="caption"> Agregar Acción </span>
    </v-btn>
    <v-simple-table
      class="ma-5"
      :class="{ 'elevation-7': !parent }"
      :dense="parent.type !== 'event'"
    >
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">
              <span class="subtitle-1 font-weight-medium">Acciones</span>
            </th>
            <th class="text-left">Descripción</th>
            <th class="text-left">Responsable</th>
            <th class="text-left">Vencimiento</th>
            <th class="text-right">Editar/Eliminar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="action in activeActions" :key="action.id">
            <td>ACCIÓN {{ action.id }}</td>
            <td>
              <v-tooltip bottom max-width="500">
                <template v-slot:activator="{ on }">
                  <span v-on="on">{{ action.description | reduceText }}</span>
                </template>
                <span>{{ action.description }}</span>
              </v-tooltip>
            </td>
            <td>
              {{ action.owner | fullName }}
            </td>
            <td>{{ action.due_date | fechaDiaMesAnio }}</td>
            <td class="text-right">
              <t-btn-icon
                small
                tooltip="Editar Acción"
                @click="editAction(action)"
                :disabled="
                  action.status === '50COMP' || action.status === '60CEFF'
                "
              >
                mdi-pencil
              </t-btn-icon>
              <t-btn-icon
                small
                tooltip="Eliminar Acción"
                @click="openDelActionWarning(action)"
                :disabled="
                  action.status === '50COMP' || action.status === '60CEFF'
                "
              >
                mdi-delete-outline
              </t-btn-icon>
            </td>
          </tr>
          <tr v-if="parent.type !== 'event'">
            <td colspan="6" class="text-center">
              <v-btn
                block
                color="#caad8b"
                text
                small
                @click="
                  newActionDialog = true;
                  setParent();
                "
                >Agregar acción
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <!--CARGA DE ACCION-->
    <v-dialog
      v-model="newActionDialog"
      persistent
      max-width="700px"
      scrollable
      :fullscreen="$vuetify.breakpoint.smAndDown"
      transition="isMobile ? 'dialog-bottom-transition' : ''"
    >
      <ActionsLoader
        :editAction="editActionFlag"
        @evt-close-dialog="closeActionDialog"
      />
    </v-dialog>

    <GlobalPrompt :active="promptDialog" prompt-type="alert">
      <template v-slot:message>
        La ACCIÓN {{ delActionID }} se eliminará de forma permanente. No podrá
        deshacerse esta operación
      </template>
      <template v-slot:cancel>
        <t-btn-secondary
          :disabled="delActionLoading"
          @click="promptDialog = false"
        >
          Cancelar
        </t-btn-secondary>
      </template>

      <template v-slot:accept>
        <t-btn-delete :loading="delActionLoading" @click="deleteAction">
          Eliminar Acción
        </t-btn-delete>
      </template>
    </GlobalPrompt>
  </v-container>
</template>

<script>
import ActionsLoader from "@/components/newevent-page/EventLoader/FcaLoader/ActionsLoader.vue";
import GlobalPrompt from "@/components/reusable/GlobalPrompt.vue";
import { mapActions, mapMutations, mapState } from "vuex";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnDelete from "@/components/TBtnDelete.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import { eatApi } from "@/apis";

export default {
  name: "ActionLoaderTable",
  components: {
    TBtnIcon,
    TBtnDelete,
    TBtnSecondary,
    ActionsLoader,
    GlobalPrompt,
  },
  props: {
    parent: {
      type: Object,
    },
    actions: {
      type: Array,
    },
  },
  data() {
    return {
      newActionDialog: false,
      editActionFlag: false,
      promptDialog: false,
      delActionLoading: false,
      delActionID: "",
    };
  },
  computed: {
    ...mapState(["fca", "event"]),

    activeActions() {
      return this.actions || this.fca.actions;
    },
  },
  methods: {
    ...mapMutations("fca", [
      "set_action",
      "set_parent",
      "delete_fca_arrays",
      "set_actions",
      "set_findings",
      "set_causes",
    ]),

    ...mapActions("fca", ["delete_action"]),

    ...mapActions(["set_alert"]),

    setParent() {
      this.set_parent(this.parent);
    },

    editAction(action) {
      this.set_parent(this.parent);
      this.set_action(action);
      this.editActionFlag = true;
      this.newActionDialog = true;
    },

    closeActionDialog() {
      this.newActionDialog = false;
      this.editActionFlag = false;
      eatApi
        .getFetcher()
        .get(`events/full/${this.event.temp_event.id}`)
        .then((response) => {
          const event = response.data.results;
          this.delete_fca_arrays();
          if (event.findings.length) {
            this.set_findings(event.findings);
          } else if (event.causes.length) {
            this.set_causes(event.causes);
          } else {
            this.set_actions(event.actions);
          }
        });
    },

    openDelActionWarning(action) {
      this.promptDialog = true;
      this.delActionID = action.id;
    },

    deleteAction() {
      this.delActionLoading = true;
      this.delete_action(this.delActionID)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Acción eliminada`,
          });
          this.promptDialog = false;
          this.delActionLoading = false;
        })
        .catch(() => {
          // this.set_alert({
          //   appAlertType: "error",
          //   appAlertMsg: "Ocurrió un problema al eliminar la acción",
          // });
          this.promptDialog = false;
          this.delActionLoading = false;
        });
    },
  },
};
</script>

<style scoped></style>
