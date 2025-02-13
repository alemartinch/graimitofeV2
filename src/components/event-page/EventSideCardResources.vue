<template>
  <v-container v-if="event.temp_event.files">
    <AttachFilesCard
      :cant-files="event.temp_event.files.length"
      v-on:add-files="send_event_file"
      max-height="200"
      :disabled="!canPostEditEvent()"
    >
      <template v-slot:title>
        <div
          class="text-body-2 font-weight-bold text--secondary d-flex align-center"
        >
          <span
            >Recursos ({{
              event.temp_event.files.length > numberVisibleFiles
                ? numberVisibleFiles
                : event.temp_event.files.length
            }}{{
              event.temp_event.files.length > numberVisibleFiles
                ? ` de ${event.temp_event.files.length}`
                : ""
            }})</span
          >
          <EventFilesList :editable="canPostEditEvent()" />
        </div>
      </template>
      <template v-if="event.temp_event.files.length">
        <v-progress-linear v-if="loadValue < 100" :value="loadValue" />
        <FileCard
          v-for="file in event.temp_event.files.slice(0, numberVisibleFiles)"
          :key="file.id"
          :file="file"
          v-on:download-file="downloadFile(file.filename)"
          v-on:delete-file="deleteFile(file)"
          :deletable="canPostEditEvent()"
        />
      </template>
    </AttachFilesCard>
  </v-container>
</template>
<script>
import AttachFilesCard from "@/components/reusable/AttachFilesCard.vue";
import EventFilesList from "@/components/event-page/EventFilesList.vue";
import FileCard from "@/components/reusable/FileCard.vue";
import { mapActions, mapMutations, mapState } from "vuex";
import { permissions } from "@/mixins/permissions";

export default {
  name: "EventSideCardResources",
  components: { AttachFilesCard, EventFilesList, FileCard },
  mixins: [permissions],

  data() {
    return {};
  },

  computed: {
    ...mapState(["event"]),

    numberVisibleFiles() {
      return this.isNotebook ? 30 : 30;
    },

    loadValue() {
      const uploadFilesLength = this.event.temp_event?.files.filter(
        (file) => file.uploaded || file.error
      ).length;
      const totalFilesLength = this.event.temp_event?.files.length;
      return (uploadFilesLength * 100) / totalFilesLength;
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("event", ["delete_event_file", "set_file"]),
    ...mapActions("event", ["send_event_file", "delete_uploaded_event_file"]),

    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },

    deleteFile(file) {
      if (file.error || !file.uploaded) {
        this.delete_event_file(file.id);
        return;
      }
      file.deleting = true;
      this.delete_uploaded_event_file(file.id)
        .then(() => {
          this.SET_ALERT({
            appAlertType: "success",
            appAlertMsg: "Archivo eliminado",
          });
          file.deleting = false;
        })
        .catch(() => {
          this.SET_ALERT({
            appAlertType: "error",
            appAlertMsg: "No se pudo eliminar el archivo",
          });
          file.deleting = false;
        });
    },
  },
};
</script>
