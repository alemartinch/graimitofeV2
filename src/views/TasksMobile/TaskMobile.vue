<template>
  <TaskMobileSkeleton v-if="har.loadings.fetchOccurrence" />
  <v-container v-else>
    <t-breadcrumbs
      v-if="!har.loadings.fetchOccurrence"
      :items="breadcrumbsItems"
    />
    <h2 class="text-body-1">{{ har.task.description }}</h2>
    <v-divider class="my-3"></v-divider>
    <v-alert
      outlined
      dense
      text
      :color="har.taskStatuses[har.occurrence.status].color"
    >
      <div
        class="text-body-1 font-weight-medium"
        :style="{
          color: har.taskStatuses[har.occurrence.status].color,
        }"
      >
        <span class="caption">{{
          har.taskStatuses[har.occurrence.status].name.toUpperCase()
        }}</span>
        <br /><span v-if="occurrenceIsNotComplete">{{
          occurrenceDueDate
        }}</span>
      </div>
    </v-alert>

    <v-card flat class="text-body-2">
      <v-row v-for="data in taskInfo" :key="data.name" class="ma-0">
        <template v-if="!data.hidden">
          <v-col cols="1" class="pa-0">
            <v-icon small>{{ data.icon }}</v-icon>
          </v-col>
          <v-col cols="5" class="pa-0">{{ data.name }}</v-col>
          <v-col class="pa-0">
            {{ data.value }}
            <span v-if="data.name === 'Estado' && har.occurrence.in_progress">
              (<v-icon small color="primary" class="mr-1"
                >mdi-circle-slice-5</v-icon
              >En progreso)
            </span>
          </v-col>
        </template>
      </v-row>
    </v-card>
    <v-divider class="my-3"></v-divider>
    <div class="d-flex align-center">
      <h4 class="caption">ACTIVIDAD</h4>
      <v-spacer />
      <t-btn-icon
        v-for="taskAction in statusTaskActions"
        :key="taskAction.key"
        :disabled="taskAction.disabled"
        @click="setTaskStatus(taskAction.key)"
      >
        {{ taskAction.icon }}
      </t-btn-icon>
    </div>
    <v-list v-if="har.occurrence.entries.length">
      <div v-for="record in occurrenceRecords" :key="record.id">
        <v-list-item>
          <v-card flat width="100%">
            <div class="text-body-2 d-flex align-center justify-space-between">
              <UserAvatar :user-object="record.user" :size="25" full />
              <span class="caption font-italic">{{ record.created }}</span>
            </div>
            <div class="mt-2">
              <span
                v-if="record.status"
                class="caption text-uppercase"
                :class="record.status.color"
              >
                {{ record.status.name }}
              </span>
              <p class="text-body-2 mb-0">{{ record.comment }}</p>
            </div>
          </v-card>
        </v-list-item>
        <v-divider class="mx-10 my-3"></v-divider>
      </div>
    </v-list>
    <p v-else class="mt-10 font-italic text-center">Sin actividad reciente.</p>
    <v-bottom-sheet v-if="openDialog" :value="true" persistent>
      <OccurrenceActionDialog
        :new-record-type="newRecordType"
        v-on:close="openDialog = false"
        v-on:entry-saved="updateOccurrences"
      />
    </v-bottom-sheet>
  </v-container>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { taskStatusAndRecordHandler } from "@/components/har-page/taskStatusAndRecordHandler";
import { TASK_STATUSES } from "@/mixins/globals";
import { fechaText } from "@/Filters";
import TaskMobileSkeleton from "@/views/TasksMobile/TaskMobileSkeleton.vue";
import TBreadcrumbs from "@/components/har-page/TBreadcrumbs.vue";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";
import OccurrenceActionDialog from "@/components/har-page/OccurrenceActionDialog.vue";

export default {
  name: "TaskMobile",
  components: {
    OccurrenceActionDialog,
    TBtnIcon,
    TaskMobileSkeleton,
    UserAvatar,
    TBreadcrumbs,
  },
  mixins: [taskStatusAndRecordHandler],
  data() {
    return {
      occurrenceID: this.$route.query.occurrenceID,
      taskID: this.$route.query.taskID,
      loading: false,
      openDialog: false,
      newRecordType: "",
    };
  },
  created() {
    this.getOccurrence();
  },
  computed: {
    ...mapState(["har", "user"]),

    currentRegulation() {
      return {
        id: this.currentTask.regulation_id,
        tier: this.currentTask.tier,
      };
    },

    currentTask() {
      return this.har.task;
    },

    currentOccurrence() {
      return this.har.occurrence;
    },

    breadcrumbsItems() {
      return [
        {
          text: `TAREA ${this.currentTask.id}`,
          link: false,
          strong: false,
        },
      ];
    },

    taskInfo() {
      return [
        {
          icon: "mdi-circle-outline",
          name: "Estado",
          value: this.har.taskStatuses[this.har.occurrence.status].name,
        },
        {
          icon: "mdi-account-circle-outline",
          name: "Responsable",
          value: `${this.currentTask.owner.first_name} ${this.currentTask.owner.last_name}`,
        },
        {
          icon: "mdi-factory",
          name: "Establecimiento",
          value: this.currentTask.facility.name,
        },
        {
          icon: "mdi-repeat",
          name: "Frecuencia",
          value: this.resolveTaskFrequency,
        },
        {
          icon: "mdi-file-link-outline",
          name: "Requerimiento",
          value: this.parentReqData,
          hidden: !this.har.task.regulation_id,
        },
      ];
    },

    resolveTaskFrequency() {
      if (!this.currentTask.frequency_active) {
        return "No repetitiva";
      }

      return `Cada ${this.currentTask.frequency_number} ${
        this.har.frequencies[this.currentTask.frequency_key].both
      }`;
    },

    parentReqData() {
      const regulationID = `R${this.har.task.regulation_id}`;
      const tier = this.har.tiers[this.har.task.tier];
      return regulationID + " " + tier;
    },

    occurrenceIsNotComplete() {
      return this.har.occurrence.status !== TASK_STATUSES.COMPLETED;
    },

    occurrenceDueDate() {
      return fechaText(this.har.occurrence.due_date);
    },

    occurrenceRecords() {
      const recordsOrderByDate = this.har.occurrence.entries
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a.created_on);
          const dateB = new Date(b.created_on);
          return dateB - dateA;
        });

      const statusMap = {
        "15INPR": {
          name: "Puesta en progreso",
          color: "blue--text",
        },
        [TASK_STATUSES.COMPLETED]: {
          name: "Completada",
          color: "green--text",
        },
      };

      return recordsOrderByDate.map((entry) => {
        return {
          id: entry.id,
          comment: entry.comment,
          created: fechaText(entry.created_on),
          status: entry.related_status && statusMap[entry.related_status],
          user: entry.user,
        };
      });
    },

    statusTaskActions() {
      const actionsArray = Object.entries(this.statusConfiguration).map(
        ([key, data]) => ({ key, ...data })
      );
      return actionsArray;
    },
  },

  methods: {
    ...mapMutations(["show_error_notification"]),
    ...mapActions("har", ["fetchOccurrence"]),

    getOccurrence() {
      this.loading = true;
      this.fetchOccurrence({
        taskID: this.taskID,
        occurrenceID: this.occurrenceID,
      })
        .then(() => {})
        .catch(() => {
          this.show_error_notification("Error al cargar los datos de la tarea");
        })
        .finally(() => {
          this.loading = false;
        });
    },

    setTaskStatus(key) {
      this.newRecordType = key;
      this.openDialog = true;
    },

    updateOccurrences() {
      this.fetchOccurrence({
        taskID: this.taskID,
        occurrenceID: this.occurrenceID,
      }).finally(() => {
        this.openDialog = false;
      });
    },
  },
};
</script>

<style scoped></style>
