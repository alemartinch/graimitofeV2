<template>
  <v-card
    light
    :disabled="actionLoading"
    :height="event.postEdit ? '100% ' : ''"
    class="d-flex flex-column justify-space-between"
  >
    <v-card-actions class="d-flex justify-space-between" v-if="mobile">
      <v-btn
        color="primary"
        icon
        @click="cancelAction"
        :disabled="actionLoading"
        ><v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-divider vertical style="color: blue" />
      <span class="ml-5">
        {{ editAction ? "Editar Acción" : "Nueva Acción" }}
      </span>
      <v-spacer />
      <v-btn
        color="primary"
        text
        @click="saveAction"
        :disabled="!valid"
        :loading="actionLoading"
        >{{ editAction ? "guardar" : "crear" }}
      </v-btn>
      <v-menu v-if="editAction && mobile" top :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-btn color="error" icon v-on="on"
            ><v-icon>mdi-delete-outline</v-icon></v-btn
          >
        </template>
        <v-card width="200">
          <v-card-text class="caption">
            La acción se eliminará de forma permanente. No podrá deshacerse esta
            operación
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn
              color="error"
              text
              small
              @click="deleteAction"
              :loading="delActionLoading"
              >eliminar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-card-actions>
    <v-card-title v-if="!$vuetify.breakpoint.smAndDown">
      <span class="headline">
        {{ editAction ? "Editar Acción" : "Nueva Acción" }}
      </span>
    </v-card-title>
    <v-card-subtitle v-if="isExistParent" class="mt-4">
      <v-row>
        <v-col
          cols="auto"
          class="pb-0 ml-2"
          :class="{
            'green-border': fca.parent.type === 'finding',
            'blue-border': fca.parent.type === 'cause',
          }"
        >
          <span class="mt-2 subtitle-2"
            >{{ fca.parent.type === "finding" ? "HALLAZGO " : "CAUSA " }}
            {{ fca.parent.data.id }}<br
          /></span>
          <ExtendTooltip
            :text="fca.parent.data.description"
            :trunc-length="150"
          />
        </v-col>
      </v-row>
    </v-card-subtitle>
    <v-card-text
      ref="card_text"
      :style="{
        overflow: 'auto',
        height: $vuetify.breakpoint.smAndDown ? 'auto' : '480px',
      }"
    >
      <v-form v-model="valid" ref="actionForm">
        <v-row>
          <v-col cols="12" md="8" class="pb-0">
            <div class="body-2 my-2">Responsable</div>
            <AsyncCombobox
              v-model="action_owner"
              :api="eatApi().getFetcher()"
              url="/auth/users/search"
              search-param="keyword"
              item-text="first_name"
              item-value="id"
              outlined
              dense
              :params="actionOwnerParams"
              :preload="fca.temp_action.owner ? [fca.temp_action.owner] : []"
              :hide-details="
                event.temp_event.event_origin === 'OBSV' &&
                (!event.temp_event.facility ||
                  !event.temp_event.process_areas[0])
              "
              prepend-inner-icon="mdi-account"
              required
              autofocus
              :rules="ownerRules"
              :disabled="
                !event.temp_event.id ||
                (event.temp_event.event_origin === 'OBSV' &&
                  (!event.temp_event.facility ||
                    !event.temp_event.process_areas[0]))
              "
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
            <span
              class="red--text text--lighten-1 text-caption"
              v-if="
                event.temp_event.event_origin === 'OBSV' &&
                (!event.temp_event.facility ||
                  !event.temp_event.process_areas[0])
              "
              >* Debe seleccionar un area de proceso y un establecimiento</span
            >
          </v-col>
          <v-col
            cols="12"
            md="6"
            v-if="enableInmediateAction"
            align-self="center"
          >
            <v-switch
              v-model="action_immediate"
              label="Acción Inmediata"
              inset
              required
              dense
              :disabled="!event.temp_event.id"
              hide-details
            >
            </v-switch>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6" class="py-0">
            <div class="body-2 my-2">Vencimiento</div>
            <v-menu
              v-model="menu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="action_dueDate"
                  prepend-inner-icon="mdi-calendar-outline"
                  solo
                  flat
                  outlined
                  dense
                  readonly
                  v-on="on"
                  autocomplete="off"
                  :rules="dateRules"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="date"
                @input="changeDate"
                no-title
                :allowed-dates="
                  action_immediate ? allowedDatesInmediate : allowedDates
                "
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="py-0">
            <div class="body-2 my-2">
              {{
                action_immediate ? "Acción tomada" : "Descripción de la acción"
              }}
            </div>
            <v-textarea
              v-model="action_des"
              name="descripcion"
              solo
              flat
              outlined
              dense
              no-resize
              auto-grow
              :rules="desRules"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" v-if="event.availableFields.action_type">
            <div class="body-2 my-2">Tipo de acción</div>
            <v-radio-group
              v-model="action_type"
              dense
              hide-details
              :rules="[(v) => !!v || 'El tipo de acción es requerido']"
            >
              <v-radio :key="1" label="Preventiva" value="IMPR" />
              <v-radio :key="2" label="Correctiva" value="CORR" />
            </v-radio-group>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions v-if="!$vuetify.breakpoint.smAndDown">
      <v-menu v-if="editAction && mobile" top :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-btn color="error" text v-on="on"> eliminar </v-btn>
        </template>
        <v-card width="200">
          <v-card-text class="caption">
            La acción se eliminará de forma permanente. No podrá deshacerse esta
            operación
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn
              color="error"
              text
              small
              @click="deleteAction"
              :loading="delActionLoading"
              >eliminar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-menu>
      <div class="flex-grow-1"></div>
      <t-btn-secondary
        @click="cancelAction"
        :disabled="actionLoading || delActionLoading"
        >Cerrar</t-btn-secondary
      >
      <t-btn-primary
        :block="mobile"
        @click="saveAction"
        :loading="actionLoading"
        :disabled="!valid || delActionLoading"
        >guardar</t-btn-primary
      >
      <t-btn-primary
        v-if="!editAction"
        outlined
        @click="saveActionAndCreateOther"
        :loading="actionLoading"
        :disabled="!valid"
        >guardar y generar otra</t-btn-primary
      >
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { eatApi } from "@/apis";
import { EVENT_ORIGINS, INPUTS_LENGTH } from "@/mixins/globals";
import ExtendTooltip from "@/components/reusable/ExtendTooltip.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";

export default {
  name: "ActionsLoader",
  components: { AsyncCombobox, TBtnPrimary, TBtnSecondary, ExtendTooltip },
  props: {
    editAction: {
      type: Boolean,
      default: false,
      required: false,
    },
  },

  data() {
    return {
      loading: false,
      users: [],
      menu: false,
      date: "",
      newActionDialog: false,
      valid: false,
      instantAction: false,
      actionLoading: false,
      delActionLoading: false,
      editFlag: true,
      createOtherAction: false,
      // allowedDates: (v) => v >= new Date().toISOString().substr(0, 10),
      allowedDatesInmediate: (v) => v <= new Date().toISOString().substr(0, 10),
      desRules: [
        (v) =>
          (v.length <= INPUTS_LENGTH.ACTION_DESCRIPTION && v.length > 0) ||
          `Max ${INPUTS_LENGTH.ACTION_DESCRIPTION} caracteres`,
      ],
      ownerRules: [(v) => !!v || "El responsable de la acción es requerido"],
      causeRules: [(v) => !!v || "La causa asociada es requerida"],
      dateRules: [(v) => !!v || "La fecha de vencimiento requerida"],
      tAction: null,
    };
  },

  created() {
    this.tAction = JSON.parse(JSON.stringify(this.fca.temp_action));
    this.loadOwners();
  },

  computed: {
    ...mapState(["event", "user", "fca"]),

    actionOwnerParams() {
      return {
        access_facilities__id: this.event.temp_event.facility.id,
      };
    },

    mobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    isExistParent() {
      return this.fca.parent?.data;
    },

    allowedDates() {
      if (this.event.postEdit && this.fca.temp_action.effectiveness_date) {
        return (v) =>
          v >= new Date().toISOString().substr(0, 10) &&
          v < this.fca.temp_action.effectiveness_date;
      }
      return (v) => v >= new Date().toISOString().substr(0, 10);
    },

    action_des: {
      get() {
        return this.action_immediate
          ? this.fca.temp_action.action_result
          : this.fca.temp_action.description;
      },
      set(des) {
        if (this.action_immediate) {
          this.setAction_des("Acción con resolución inmediata");
          this.setAction_result(des);
        } else {
          this.setAction_des(des);
        }
      },
    },

    action_cause: {
      get() {
        return this.fca.temp_action.cause;
      },
      set(cause) {
        this.setAction_cause(cause);
      },
    },

    action_owner: {
      get() {
        return this.fca.temp_action.owner;
      },
      set(owner) {
        this.setAction_owner(owner);
      },
    },

    action_dueDate: {
      get() {
        return this.datePicker;
      },
      set(dueDate) {
        this.setAction_due_date(dueDate);
      },
    },

    action_type: {
      get() {
        return this.fca.temp_action.action_type;
      },
      set(type) {
        this.setAction_action_type(type);
      },
    },

    action_immediate: {
      get() {
        return this.fca.temp_action.immediate;
      },
      set(immediate) {
        this.setAction_immediate(immediate);
        if (immediate) {
          this.date = new Date().toISOString().substr(0, 10);
          this.setAction_des("");
        } else {
          this.setAction_des("");
          this.date = "";
        }
        this.setAction_due_date(this.action_dueDate);
      },
    },

    enableInmediateAction() {
      if (this.action_owner) {
        return (
          this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION &&
          this.event.temp_event.originator.id === this.action_owner.id
        );
      } else {
        return false;
      }
    },

    datePicker: function () {
      if (this.editAction && this.editFlag) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.date = this.fca.temp_action.due_date;
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.editFlag = false;
      }
      if (!this.date) return null;
      const [year, month, day] = this.date.split("-");
      return `${day}-${month}-${year}`;
    },
  },

  watch: {
    action_owner(newVal, oldVal) {
      if (
        oldVal &&
        newVal &&
        newVal !== oldVal &&
        oldVal.id === this.event.temp_event.originator.id
      ) {
        if (
          this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION &&
          this.event.temp_event.originator.id !== this.action_owner.id
        ) {
          this.date = "";
          this.setAction_due_date(this.action_dueDate);
        }
      }
    },
  },

  methods: {
    ...mapMutations("fca", [
      "setAction_des",
      "setAction_cause",
      "setAction_owner",
      "setAction_due_date",
      "setAction_action_type",
      "setAction_immediate",
      "setAction_result",
      "set_action",
      "reset_action",
      "setAction_event",
    ]),

    ...mapActions("fca", ["add_action", "update_action", "delete_action"]),

    ...mapActions(["set_alert"]),

    eatApi() {
      return eatApi;
    },

    loadOwners() {
      this.loading = true;
      eatApi
        .getFetcher()
        .get("/auth/users/", {
          params: {
            page: 1,
            page_size: 50,
          },
        })
        .then(({ data }) => (this.users = data.results))
        .catch((error) => {
          console.error(error);
        })
        .finally(() => (this.loading = false));
    },

    // loadOwners() {
    //   if (
    //     this.event.temp_event.event_origin === EVENT_ORIGINS.OBSERVATION &&
    //     this.event.temp_event.facility &&
    //     this.event.temp_event.process_areas[0]
    //   ) {
    //     this.loading = true;
    //     let idFacility = this.event.temp_event.facility.id;
    //     let idProcessArea = this.event.temp_event.process_areas[0].id;
    //     axios
    //       .get(`/facilities/${idFacility}/process-areas`)
    //       .then((response) => {
    //         let fam = response.data.results.find(
    //           (element) => element.process_area === idProcessArea
    //         );
    //         this.users = fam.managers.slice();
    //         this.users.push(this.event.temp_event.originator);
    //         this.loading = false;
    //       })
    //       .catch((e) => {
    //         console.error(e);
    //         this.loading = false;
    //       });
    //   } else {
    //     this.users = this.event.users;
    //   }
    // },

    changeDate() {
      this.menu = false;
      this.setAction_due_date(this.action_dueDate);
    },

    saveAction() {
      this.actionLoading = true;
      if (!this.editAction) {
        this.addAction();
      } else {
        this.updateAction();
      }
    },

    saveActionAndCreateOther() {
      this.createOtherAction = true;
      this.actionLoading = true;
      this.addAction();
    },

    addAction() {
      this.add_action()
        .then((response) => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Acción creada (ID:${response.id})`,
          });
          if (this.createOtherAction) {
            this.$refs.card_text.scrollTo(0, 0);
            this.resetAction();
          } else {
            this.cancelAction();
          }
          this.actionLoading = false;
        })
        .catch((e) => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: this.setAlertMessage(e.response.data.code),
          });
          this.cancelAction();
          this.actionLoading = false;
        });
    },

    setAlertMessage(code) {
      switch (code) {
        case "Invalid":
          return "No tienen los permisos para realizar esta acción";
        default:
          return "Ocurrió un problema al crear la Acción";
      }
    },

    updateAction() {
      this.update_action()
        .then((response) => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Acción editada (ID:${response.id})`,
          });
          if (this.event.postEdit) {
            this.$emit("evt-close-dialog");
          }
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al editar la Acción",
          });
        })
        .finally(() => {
          this.cancelAction();
          this.actionLoading = false;
        });
    },

    deleteAction() {
      this.delActionLoading = true;
      this.delete_action(this.fca.temp_action.id)
        .then(() => {
          this.set_alert({
            appAlertType: "success",
            appAlertMsg: `Acción eliminada`,
          });
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "Ocurrió un problema al eliminar la acción",
          });
        })
        .finally(() => {
          this.cancelAction();
          this.delActionLoading = false;
        });
    },

    resetAction() {
      this.date = "";
      this.editFlag = true;
      this.reset_action();
      this.$refs.actionForm.resetValidation();
      this.createOtherAction = false;
    },

    cancelAction() {
      this.$emit("evt-close-dialog");
      if (this.event.postEdit) {
        this.set_action(this.tAction);
        return;
      }
      this.$refs.actionForm.resetValidation();
      this.resetAction();
      this.$refs.card_text.scrollTo(0, 0);
    },
  },
};
</script>

<style scoped>
.blue-border {
  border-left: 3px solid #567990;
}
.green-border {
  border-left: 3px solid #4caf50;
}
</style>
