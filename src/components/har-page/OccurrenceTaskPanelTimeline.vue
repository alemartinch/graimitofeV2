<template>
  <v-timeline dense clipped style="margin-left: -25px">
    <v-timeline-item
      v-for="(record, index) in timelineItems"
      :key="index"
      v-show="
        !(har.occurrence.status === '40COMP' && record.type === 'newRecord')
      "
      fill-dot
      color="#EEE"
      small
    >
      <template v-slot:icon>
        <v-tooltip top v-if="['entry', 'newRecord'].includes(record.type)">
          <template v-slot:activator="{ on }">
            <UserAvatar
              :user-object="
                record.type === 'entry' ? record.entry.user : user.user
              "
              size="28"
              v-on="on"
            />
          </template>
          <span v-if="record.type === 'entry'">{{
            record.entry.user | fullName
          }}</span>
          <span v-else>{{ user.user | fullName }}</span>
        </v-tooltip>
        <v-icon v-else small>mdi-calendar</v-icon>
      </template>
      <div v-if="record.type === 'entry'">
        <OccurrenceRecord
          :entry="record.entry"
          v-on:record-updated="getOccurrence"
        />
      </div>
      <div v-else-if="record.type === 'dueDate'">
        <span class="caption font-weight-medium"
          >Vencimiento: {{ record.date | fechaText }}</span
        >
      </div>
      <OccurrenceNewRecord v-else-if="har.occurrence.status !== '40COMP'" />
    </v-timeline-item>
  </v-timeline>
</template>
<script>
import OccurrenceNewRecord from "@/components/har-page/OccurrenceNewRecord.vue";
import OccurrenceRecord from "@/components/har-page/OccurrenceRecord.vue";
import UserAvatar from "@/components/reusable/UserAvatar.vue";
import { mapActions, mapMutations, mapState } from "vuex";

export default {
  name: "OccurrenceTaskPanelTimeline",
  components: { OccurrenceNewRecord, OccurrenceRecord, UserAvatar },
  computed: {
    ...mapState(["har", "user"]),

    entries() {
      return this.har.occurrence.entries;
    },

    timelineItems() {
      const records = this.entries.map((entry) => {
        return {
          type: "entry",
          date: entry.created_on,
          entry: entry,
        };
      });
      records.push(
        {
          type: "dueDate",
          date: this.har.occurrence.due_date,
          comment: null,
        },
        {
          type: "newRecord",
          date: this.addHoursToDate(new Date(), 3),
          comment: null,
        }
      );
      records.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
      return records;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapActions("har", ["fetchOccurrence"]),

    addHoursToDate(objDate, intHours) {
      const numberOfMlSeconds = objDate.getTime();
      const addMlSeconds = intHours * 60 * 60000;
      return new Date(numberOfMlSeconds + addMlSeconds);
    },

    getOccurrence() {
      this.fetchOccurrence({
        taskID: this.har.task.id,
        occurrenceID: this.har.occurrence.id,
      })
        .then(() => {})
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "Error al cargar los datos de la tarea",
          });
        });
    },
  },
};
</script>
