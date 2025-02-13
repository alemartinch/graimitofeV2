<template>
  <v-dialog value="true" width="800" persistent>
    <v-card class="pa-1">
      <v-card-title
        ><div>
          {{ resolveTaskFormTitle }}<BR />
          <span
            v-if="!har.regulation.id && !this.isEditTask"
            class="orange--text caption"
          >
            <v-icon x-small color="orange" class="mr-1">mdi-alert</v-icon>Está
            creando una tarea sin requerimiento asociado
          </span>
        </div></v-card-title
      >
      <v-card-text class="overflow-container">
        <v-form v-model="valid" ref="taskForm">
          <v-row class="ma-0">
            <v-col cols="7" class="py-0 px-0">
              <div class="body-2 mb-2">Establecimiento</div>
              <AsyncCombobox
                v-model="facility"
                :api="eatApi().getFetcher()"
                url="/facilities/search"
                search-param="keyword"
                item-text="name"
                item-value="id"
                :combobox="false"
                outlined
                dense
                label="Seleccione un establecimiento"
                :params="facilityParams"
                return-object
                prepend-inner-icon="mdi-factory"
                :rules="[
                  (v) =>
                    (!!v && v !== -1) || 'Debe seleccionar un establecimiento',
                ]"
              >
                <template v-slot:item="{ item }">
                  <span>{{ item.name }}</span>
                </template>
                <template v-slot:selection="data">
                  <v-chip
                    class="py-3"
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    small
                  >
                    {{ data.item | facilityName }}
                  </v-chip>
                </template>
              </AsyncCombobox>
              <div class="body-2 my-2">Responsable</div>
              <AsyncCombobox
                v-model="owner"
                :disabled="!this.har.task.facility_id"
                :api="eatApi().getFetcher()"
                url="/auth/users/search"
                search-param="keyword"
                item-text="first_name"
                item-value="id"
                :params="userParams"
                class="mb-5"
                outlined
                dense
                required
                return-object
                prepend-inner-icon="mdi-human-male-board"
                :rules="[
                  (v) => !!v || 'El responsable de la tarea es requerido',
                ]"
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
              <div class="body-2 my-2">Descripción</div>
              <v-textarea
                v-model="description"
                class="text-body-2 mb-5"
                outlined
                solo
                flat
                dense
                rows="1"
                no-resize
                auto-grow
                :rules="desRules"
                hide-details
              ></v-textarea>
              <v-divider />
              <AttachFilesCard
                :cant-files="har.task.files.length"
                v-on:add-files="addFiles"
              >
                <FileCard
                  v-for="file in har.task.files"
                  :key="file.id"
                  :file="file"
                  v-on:delete-file="deleteFile(file.id)"
                  :append-icon="false"
                />
              </AttachFilesCard>
            </v-col>
            <v-col cols="5" class="py-0 px-0 pl-10">
              <div class="body-2 my-2">Próximo vencimiento</div>
              <v-menu
                v-model="menuDate"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="290px"
              >
                <template v-slot:activator="{ on }">
                  <v-text-field
                    v-model="dateFormatted"
                    class="mb-5"
                    prepend-inner-icon="mdi-calendar-outline"
                    solo
                    flat
                    outlined
                    dense
                    readonly
                    autocomplete="off"
                    v-on="on"
                    :rules="[(v) => !!v || 'Este campo es requerido']"
                    hide-details
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="nextDueDate"
                  @input="menuDate = false"
                  no-title
                  :allowed-dates="allowedDates"
                ></v-date-picker>
              </v-menu>
              <div class="d-flex align-center">
                <div class="body-2 my-2">Frecuencia</div>
                <v-switch
                  v-model="frequency_active"
                  class="mt-0 ml-2"
                  dense
                  hide-details
                ></v-switch>
              </div>
              <v-chip-group
                v-model="frequency_key"
                active-class="white--text text--accent-4 primary"
                mandatory
                column
              >
                <v-chip
                  v-for="item in fOptions"
                  :key="item"
                  :value="item"
                  label
                  small
                  class="pa-2"
                  :disabled="!frequency_active"
                >
                  {{ har.frequencies[item].p.toUpperCase() }}
                </v-chip>
              </v-chip-group>
              <v-text-field
                v-model="frequency_number"
                class="d-flex align-start pa-0 ma-0 mb-5"
                solo
                flat
                outlined
                dense
                type="number"
                :suffix="har.frequencies[har.task.frequency_key].both"
                :disabled="!frequency_active"
                prepend-inner-icon="mdi-repeat mr-4"
                :rules="[(v) => v >= 0 || 'Valor incorrecto']"
                hide-details
              >
              </v-text-field>

              <div class="d-flex align-center">
                <div class="body-2 my-2">Pre-aviso</div>
                <v-switch
                  v-model="pre_warning_active"
                  class="mt-0 ml-2"
                  dense
                  hide-details
                ></v-switch>
              </div>
              <v-text-field
                v-model="pre_warning_days"
                class="d-flex align-start pa-0 ma-0"
                :disabled="!pre_warning_active"
                solo
                flat
                outlined
                dense
                type="number"
                suffix="días"
                hide-details
                prepend-inner-icon="mdi-bell-alert-outline mr-4"
                :rules="[(v) => v >= 0 || 'Valor mínimo 1 día']"
                min="1"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <div class="flex-grow-1"></div>
        <t-btn-secondary @click="closeDialog" :disabled="loading"
          >Cancelar
        </t-btn-secondary>
        <t-btn-primary
          @click="saveTask"
          :loading="loading"
          :disabled="!valid || loading"
          >{{ isEditTask ? "Modificar tarea" : "Crear tarea" }}
        </t-btn-primary>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { tcmtRegApi, eatApi } from "@/apis";
import AttachFilesCard from "@/components/reusable/AttachFilesCard.vue";
import FileCard from "@/components/reusable/FileCard.vue";
import { INPUTS_LENGTH } from "@/mixins/globals";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnPrimary from "@/components/TBtnPrimary.vue";
import AsyncCombobox from "@/components/reusable/AsyncCombobox.vue";
import { facilityName } from "@/Filters";

export default {
  name: "TaskForm",
  components: {
    AsyncCombobox,
    TBtnPrimary,
    TBtnSecondary,
    FileCard,
    AttachFilesCard,
  },
  props: {
    /*users: {
      type: Array,
      required: true,
    },*/

    editable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      usersByapi: [],
      valid: false,
      loading: false,
      menuDate: false,
      date: "",
      fOptions: ["DAY", "WEEK", "MONTH", "YEAR"],
      desRules: [
        (v) => !!v || "Este campo es requerido",
        (v) =>
          (!!v && v.length <= INPUTS_LENGTH.TASK_DESCRIPTION && v.length > 0) ||
          `Máx. ${INPUTS_LENGTH.TASK_DESCRIPTION} caracteres`,
      ],
      allowedDates: (v) => v > new Date().toISOString().substr(0, 10),
      lastFileId: 0,
      // reset: false,
    };
  },

  created() {
    //this.reset_task();
    //this.reset_occurrence();
    tcmtRegApi
      .getFetcher()
      .get(`/users/?page=1&page_size=50`)
      .then((res) => {
        this.usersByapi = res.data.results;
      })
      .catch(() => {});
  },

  computed: {
    ...mapState(["har", "event"]),
    ...mapGetters("event", ["getHarFacilities"]),
    ...mapGetters("user", ["getFacilitiesByUser"]),

    changeFacility() {
      return this.har.task.facility_id;
    },

    isEditTask() {
      return !!this.har.task.id;
    },

    facilityParams() {
      const id = [];
      this.getFacilitiesByUser.forEach((item) => id.push(item.id));
      return {
        id: id,
      };
    },

    // reset() {
    //   this.reset = true;
    //   return this.reset;
    // },

    userParams() {
      return { access_facilities__id: this.har.task.facility_id };
    },

    taskParams() {
      return { id: [] };
    },
    resolveTaskFormTitle() {
      // isEditTask ? `EDITAR TAREA ${har.task.id}` : "Nueva tarea"
      const newTaskTitle = this.har.regulation.id
        ? "Nueva tarea"
        : "Nueva tarea";
      return this.isEditTask
        ? `EDITAR TAREA ${this.har.task.id}`
        : newTaskTitle;
    },

    dateFormatted: function () {
      if (!this.har.task.next_due_date) return null;
      const [year, month, day] = this.har.task.next_due_date.split("-");
      return `${day}-${month}-${year}`;
    },

    regulationId: {
      get() {
        return this.har.task.regulation_id;
      },

      set(id) {
        this.set_task_regulation_id(id);
      },
    },

    owner: {
      get() {
        return this.har.task.owner;
      },
      set(owner) {
        this.set_task_owner(owner);
      },
    },

    facility: {
      get() {
        return this.har.task.facility_id;
      },
      set(facility_id) {
        this.set_task_facility(facility_id.id);
      },
    },

    description: {
      get() {
        return this.har.task.description;
      },
      set(description) {
        this.set_task_description(description);
      },
    },
    nextDueDate: {
      get() {
        return this.har.task.next_due_date;
      },
      set(date) {
        this.set_task_nextDueDate(date);
      },
    },
    frequency_active: {
      get() {
        return this.har.task.frequency_active;
      },
      set(active) {
        this.set_task_frequencyActive(active);
      },
    },
    frequency_number: {
      get() {
        return this.har.task.frequency_number;
      },
      set(frequency) {
        this.set_task_frequency_number(frequency);
      },
    },
    frequency_key: {
      get() {
        return this.har.task.frequency_key;
      },
      set(key) {
        this.set_task_frequency_key(key);
      },
    },
    pre_warning_active: {
      get() {
        return this.har.task.pre_warning_active;
      },
      set(active) {
        this.set_task_preWarningActive(active);
      },
    },
    pre_warning_days: {
      get() {
        return this.har.task.pre_warning_days;
      },
      set(days) {
        this.set_task_preWarningDays(days);
      },
    },
  },
  methods: {
    facilityName,
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("har", [
      "set_task_owner",
      "set_task_description",
      "set_task_facility",
      "set_task_nextDueDate",
      "set_task_frequency_key",
      "set_task_frequency_number",
      "set_task_frequencyActive",
      "set_task_preWarningActive",
      "set_task_preWarningDays",
      "reset_task",
      "set_task_regulation_id",
      "set_task_files",
      "delete_task_file",
    ]),

    ...mapActions("har", [
      "createTask",
      "updateTask",
      "upTaskFiles",
      "fetchOccurrences",
    ]),

    eatApi() {
      return eatApi;
    },

    async saveTask() {
      this.loading = true;
      try {
        const task = this.isEditTask
          ? await this.updateTask()
          : await this.createTask();
        if (this.har.task.files.length) {
          await this.upTaskFiles(task.id);
        }
        this.SET_ALERT({
          appAlertType: "success",
          appAlertMsg: `La <strong>TAREA ${task.id}</strong> se guardó con éxito`,
        });
        this.$emit("update-regulation", true);
        this.fetchOccurrences();
        this.closeDialog();
      } catch (error) {
        if (error === "task") {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg:
              "Ocurrió un error al guardar la tarea. Intentelo nuevamente.",
          });
          this.closeDialog();
        }
        if (error === "file") {
          this.SET_ALERT({
            appAlertType: "warning",
            appAlertMsg:
              "La <strong>TAREA " +
              this.har.task.id +
              "</strong> se guardó correctamente <span class='mdi mdi-check-circle mdi-18px green--text'></span> <br>" +
              "Pero uno o varios archivos no pudieron guardarse, puede intentarlo nuevamente desde el panel de la tarea.",
          });
          this.$emit("update-regulation", true);
          this.fetchOccurrences();
          this.closeDialog();
        }
      } finally {
        this.loading = false;
      }
    },

    closeDialog() {
      // this.set_task_files([]);
      this.reset_task();
      this.$refs.taskForm.resetValidation();
      const lastSlashIndex = this.$route.path.lastIndexOf("/");
      const beforePath = this.$route.path.slice(0, lastSlashIndex);
      this.$router.replace({ path: beforePath });
    },

    addFiles(fileList) {
      let taskFiles = [];
      [...fileList].forEach((file) => {
        taskFiles.push({
          id: `l` + this.lastFileId + 1,
          file: file,
          filename: null,
          size: file.size,
          name: file.name,
          ext: file.name.split(".").pop(),
          description: "",
          uploaded: false,
          uploadPercentage: 0,
          error: false,
          deleting: false,
        });
        this.lastFileId++;
      });
      this.set_task_files(taskFiles);
    },

    deleteFile(fileId) {
      this.delete_task_file(fileId);
    },
  },

  watch: {
    changeFacility(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.set_task_owner(null);
      }
    },
  },
};
</script>

<style scoped>
.overflow-container {
  height: 400px;
  overflow: auto;
}
</style>
