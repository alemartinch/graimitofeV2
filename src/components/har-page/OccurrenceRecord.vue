<template>
  <v-hover v-slot="{ hover }">
    <v-card flat :disabled="recordUpdating">
      <v-card-title class="pa-0 ma-0 d-flex" style="height: 32px">
        <div class="caption font-weight-medium">
          <!--        <UserChip :user="comment.user" />-->
          <!--        <span class="ml-1 mr-1"> • </span>-->
          {{ entry.created_on | fechaText }}
          <span v-if="entry.related_status" class="ml-1 mr-1"> • </span>
          <span
            :class="relatedStatus.color"
            class="caption font-weight-medium"
            style="opacity: 0.7"
            >{{ relatedStatus.msg }}</span
          >
        </div>
        <v-spacer />
        <div v-if="hover" class="d-inline-flex">
          <div v-for="btn in recordActions" :key="btn.name">
            <t-btn-icon
              v-if="btn.visible"
              small
              :disabled="btn.disabled"
              :color="btn.color"
              @click="btn.action"
            >
              {{ btn.icon }}
            </t-btn-icon>
          </div>
        </div>
      </v-card-title>
      <v-textarea
        ref="textArea"
        v-if="edit"
        v-model="newComment"
        rows="1"
        no-resize
        auto-grow
        dense
        class="text-body-2"
        style="line-height: 1em"
      ></v-textarea>
      <p v-else class="caption" style="line-height: 1.3em">
        {{ entry.comment }}
      </p>
      <template v-if="entry.files.length">
        <v-slide-group show-arrows>
          <v-slide-item v-for="file in entry.files" :key="file.id">
            <FileCard
              small
              :file="file"
              v-on:download-file="downloadFile(file.filename)"
              v-on:delete-file="deleteFile(file)"
            />
          </v-slide-item>
        </v-slide-group>
      </template>
      <v-overlay v-model="overlay" absolute opacity="0.3">
        <v-card light>
          <v-card-text class="caption"
            >Se eliminará el comentario y los archivos que estén
            adjuntados</v-card-text
          >
          <v-card-actions class="justify-end pt-0">
            <v-btn x-small plain color="secondary" @click="overlay = false"
              >cancelar</v-btn
            >
            <v-btn
              x-small
              plain
              color="error"
              @click="deleteRecord"
              :loading="loading.deleteRecord"
              >eliminar</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-overlay>
      <input
        type="file"
        ref="inputFile"
        class="d-none"
        @change="addFiles"
        :accept="fileTypes"
        multiple
      />
    </v-card>
  </v-hover>
</template>

<script>
import TBtnIcon from "@/components/TBtnIcon.vue";
import { harPermissions } from "@/mixins/permissions/harPermissions";
import FileCard from "@/components/reusable/FileCard.vue";
import { tcmtRegApi } from "@/apis";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { processRawFiles } from "@/mixins/helpers";
import { uploadEntryFilesHandle } from "@/components/har-page/uploadEntryFilesHandle";

export default {
  name: "OccurrenceRecord",
  components: { FileCard, TBtnIcon },
  mixins: [uploadEntryFilesHandle, harPermissions],
  props: {
    entry: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      edit: false,
      newComment: "",
      overlay: false,
      loading: {
        deletingFile: false,
        saveNewComment: false,
        deleteRecord: false,
        uploadFile: false,
      },
      fileTypes:
        ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.bmp,.gif,.png,.svg",
    };
  },
  computed: {
    ...mapState(["har"]),
    ...mapGetters("har", ["getCurrentTask", "getCurrentOccurrence"]),

    relatedStatus() {
      const statusMapping = {
        "15INPR": { msg: "PUESTA EN PROCESO", color: "blue--text" },
        "40COMP": { msg: "TAREA COMPLETA", color: "green--text" },
        DEFAULT: { msg: "", color: "" },
      };

      return statusMapping[this.entry.related_status || "DEFAULT"];
    },

    recordActions() {
      return [
        {
          name: "Editar comentario",
          icon: !this.edit ? "mdi-pencil-outline" : "mdi-check",
          disabled: !this.edit
            ? !this.canModifyOccurrencesEntry()
            : !this.newComment,
          action: () => {
            !this.edit ? this.editComment() : this.updateComment();
          },
          visible: true,
          color: "primary",
        },
        {
          name: "Adjuntar archivo",
          icon: "mdi-attachment mdi-rotate-90",
          disabled: !this.canModifyOccurrencesEntry(),
          action: () => this.$refs.inputFile.click(),
          visible: !this.edit,
          color: "primary",
        },
        {
          name: "Eliminar registro",
          icon: !this.edit ? "mdi-delete-outline" : "mdi-close",
          disabled: !this.canDeleteOccurrencesEntry(this.entry),
          action: () =>
            !this.edit ? (this.overlay = true) : (this.edit = false),
          visible: true,
          color: "error",
        },
      ];
    },

    recordUpdating() {
      return (
        this.loading.saveNewComment ||
        this.loading.uploadFile ||
        this.loading.deletingFile
      );
    },
  },

  methods: {
    ...mapMutations(["show_success_notification", "show_error_notification"]),
    ...mapActions("har", ["fetchOccurrence"]),

    editComment() {
      this.edit = true;
      this.newComment = this.entry.comment;
    },

    updateComment() {
      this.loading.saveNewComment = true;
      const repetActionID = this.getCurrentTask.id;
      tcmtRegApi
        .getFetcher()
        .put(
          `repet-actions/${repetActionID}/occurrences/${this.getCurrentOccurrence.id}/entries/${this.entry.id}`,
          {
            comment: this.newComment,
          }
        )
        .then(() => {
          this.$emit("record-updated");
          this.show_success_notification(
            "El comentario se editó correctamente"
          );
        })
        .catch(() => {
          this.show_error_notification("Error al editar el comentario");
        })
        .finally(() => {
          this.loading.saveNewComment = false;
          this.edit = false;
          this.newComment = "";
        });
    },

    deleteRecord() {
      this.loading.deleteRecord = true;
      const repetActionId = this.getCurrentTask.id;
      tcmtRegApi
        .getFetcher()
        .delete(
          `repet-actions/${repetActionId}/occurrences/${this.getCurrentOccurrence.id}/entries/${this.entry.id}`
        )
        .then(() => {
          this.$emit("record-updated");
          this.show_success_notification(
            "El comentario se eliminó correctamente"
          );
        })
        .catch(() => {
          this.show_error_notification("Error al eliminar el comentario");
        })
        .finally(() => {
          this.loading.deleteRecord = false;
          this.overlay = false;
        });
    },

    deleteFile(file) {
      this.loading.deletingFile = true;
      file.deleting = true;
      if (!file.uploaded) {
        return;
      }
      tcmtRegApi
        .getFetcher()
        .delete(
          `repet-actions/${this.getCurrentTask.id}/occurrences/${this.getCurrentOccurrence.id}/entries/${this.entry.id}/files/${file.id}`
        )
        .then(() => {
          this.delete_entry_file(file.id);
          this.show_success_notification("El archivo se eliminó correctamente");
        })
        .catch(() => {
          this.show_error_notification("Error al eliminar el archivo");
        })
        .finally(() => {
          this.loading.deletingFile = false;
        });
    },

    addFiles(e) {
      this.loading.uploadFile = true;
      this.files = processRawFiles(e.target.files);
      this.upNewEntryFiles(this.entry.id)
        .then(() => {
          this.show_success_notification("El archivo se adjuntó correctamente");
          this.fetchOccurrence({
            taskID: this.getCurrentTask.id,
            occurrenceID: this.getCurrentOccurrence.id,
          });
        })
        .catch(() => {
          this.show_error_notification(
            "Ocurrió un error al adjuntar el archivo"
          );
        })
        .finally(() => {
          this.files = [];
          this.loading.uploadFile = false;
        });
    },

    delete_entry_file(fileID) {
      const fileIndex = this.entry.files.findIndex(
        (file) => file.id.toString() === fileID.toString()
      );
      this.entry.files.splice(fileIndex, 1);
    },

    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },
  },
};
</script>
