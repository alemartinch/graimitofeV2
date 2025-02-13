<template>
  <v-container class="ma-0 pa-0">
    <div class="body-2 my-2">Adjuntos</div>
    <v-slide-group active-class="success">
      <v-slide-item v-for="(file, i) in filesToUpload" :key="i">
        <v-menu absolute>
          <template v-slot:activator="{ on }">
            <v-card
              width="150"
              height="100"
              elevation="1"
              class="my-1 mr-2 d-inline-flex flex-column justify-space-around align-center"
              v-on="on"
              :style="{
                opacity: file.deleting ? '0.4' : '1',
                'background-color': '#f1f1f1',
                'background-image': isDocument(file.ext)
                  ? 'none'
                  : `url(${file.filename})`,
                'background-size': 'cover',
                'background-position': 'center',
              }"
            >
              <div
                v-if="!file.uploaded || isDocument(file.ext)"
                style="width: 90%; font-size: 10px"
                class="text-wrap"
              >
                {{ file.file.name }}
              </div>
              <div v-if="isDocument(file.ext) && file.uploaded">
                <v-icon color="primary">mdi-file-document</v-icon>
              </div>
              <v-progress-circular
                v-if="!file.uploaded && !file.error"
                :indeterminate="file.uploadPercentage === 100"
                :value="file.uploadPercentage"
                :rotate="360"
                size="40"
                width="2"
                color="teal"
                ><span class="caption">{{
                  file.uploadPercentage
                }}</span></v-progress-circular
              >
              <v-icon v-if="file.error" color="error">mdi-close-circle</v-icon>
            </v-card>
          </template>
          <v-sheet class="pa-0"
            ><v-btn
              text
              color="error"
              @click="editable ? deleteFile(file) : downloadFile(file)"
              >{{ editable ? "Eliminar" : "descargar" }}</v-btn
            ></v-sheet
          >
        </v-menu>
      </v-slide-item>
    </v-slide-group>
    <v-btn
      v-if="editable"
      class="mt-2"
      text
      color="primary"
      @click="$refs.inputFile.click()"
      ><v-icon left>mdi-rotate-270 mdi-attachment</v-icon>adjuntar</v-btn
    >
    <input
      type="file"
      ref="inputFile"
      class="d-none"
      @change="setFiles"
      :accept="fileTypes"
      multiple
    />
  </v-container>
</template>

<script>
import handleAttachFiles from"@/components/newevent-page/EventLoader/handleAttachFiles";

export default {
  name: "AttachFilesMb",
  mixins: [handleAttachFiles],
  props: {
    editable: {
      type: Boolean,
      default: false,
    },
    fileTypes: {
      type: String,
      default: "",
    },
  },
  methods: {
    setFiles(e) {
      this.btnLoading = false;
      const fileList = e.target.files;
      this.addFile(fileList);
    },
    downloadFile(file) {
      window.open(file.filename, "_blank");
    },
  },
};
</script>

<style scoped>
.drop_zone {
  width: 150px;
  height: 100px;
  opacity: 1;
}
</style>
