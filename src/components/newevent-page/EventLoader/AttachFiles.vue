<template>
  <v-card :disabled="btnLoading && !isAllFilesUpload">
    <v-card-title> Adjuntar archivos </v-card-title>

    <v-card-text>
      <FileDropZone v-on:add-file="send_event_file" />
      <v-simple-table v-if="event.temp_event.files.length">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Nombre</th>
              <th v-if="!isMobile" class="text-center">Descripción</th>
              <!-- <th v-if="!isMobile" class="text-right">Tamaño</th> -->
              <th class="text-right">Eliminar</th>
              <th class="text-right">Estado</th>
            </tr>
          </thead>
          <transition-group name="component-fade" tag="tbody">
            <tr v-for="(file, index) in event.temp_event.files" :key="index">
              <td>
                <a :href="file.filename" target="_blank">{{ file.name }}</a>
              </td>
              <td v-if="!isMobile" class="text-center">
                <v-menu
                  :ref="`menu${file.size}`"
                  transition="slide-y-transition"
                  offset-y
                  bottom
                  nudge-left="80"
                  :close-on-content-click="false"
                  max-height="auto"
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      v-on="on"
                      :disabled="!file.description && file.uploaded"
                    >
                      <v-icon
                        v-if="!file.description"
                        :color="file.uploaded ? '#bdbdbd' : '#306d96'"
                        >mdi-file-document-edit-outline</v-icon
                      >
                      <v-icon
                        v-else
                        :color="file.uploaded ? '#bdbdbd' : 'success'"
                        >mdi-file-document-box-check-outline</v-icon
                      >
                    </v-btn>
                  </template>
                  <v-textarea
                    v-model="file.description"
                    :disabled="file.uploaded"
                    autofocus
                    solo
                    no-resize
                    hide-details
                    @keydown.enter.prevent="$refs[`menu${file.size}`][0].save()"
                  >
                  </v-textarea>
                </v-menu>
              </td>
              <!-- <td class="text-right" v-if="!isMobile">
                {{ file.size ? readableFileSize(file.size) : "---" }}
              </td> -->
              <td class="text-right">
                <t-btn-icon :loading="file.deleting" @click="deleteFile(file)">
                  mdi-delete-outline
                </t-btn-icon>
              </td>
              <td class="text-right">
                <v-progress-circular
                  :indeterminate="file.uploadPercentage === 100"
                  v-if="!file.uploaded && !file.error"
                  :rotate="360"
                  :size="35"
                  :width="2"
                  :value="file.uploadPercentage"
                  color="teal"
                >
                  <span class="caption">{{ file.uploadPercentage }}</span>
                </v-progress-circular>
                <v-icon v-if="file.error" color="error"
                  >mdi-close-circle</v-icon
                >
                <v-icon v-if="file.uploaded" color="success"
                  >mdi-cloud-check</v-icon
                >
              </td>
            </tr>
          </transition-group>
        </template>
      </v-simple-table>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <t-btn-secondary
        @click="$emit('evt-close-attach')"
        :disabled="btnLoading && !isAllFilesUpload"
      >
        Cerrar
      </t-btn-secondary>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import FileDropZone from "@/components/reusable/FileDropZone.vue";
import TBtnSecondary from "@/components/TBtnSecondary.vue";
import TBtnIcon from "@/components/TBtnIcon.vue";

export default {
  name: "AttachFiles",
  components: { TBtnIcon, TBtnSecondary, FileDropZone },
  data() {
    return {
      btnLoading: false,
      menuDescription: false,
      description: "",
    };
  },

  computed: {
    ...mapState(["event"]),

    isAllFilesUpload() {
      return this.event.temp_event.files.every(
        (file) => file.uploaded || file.error
      );
    },
  },

  methods: {
    ...mapMutations(["SET_ALERT"]),
    ...mapMutations("event", ["set_file", "delete_event_file"]),
    ...mapActions("event", ["send_event_file", "delete_uploaded_event_file"]),

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

<style scoped>
.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.2s ease;
}
.component-fade-enter, .component-fade-leave-to
  /* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
