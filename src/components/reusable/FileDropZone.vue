<template>
  <v-row
    :class="dropZoneClass"
    class="my-5"
    @dragover="handleDragOver"
    @dragleave="dropZoneClass = 'drop_zone'"
    @drop="handleFileSelect"
    @click="$refs.inputFile.click()"
    justify="center"
    align-content="center"
  >
    <span></span>
    <span class="text-center" style="color: #306d96"
      >Haga click o arrastre los archivos a esta zona<br /><v-icon
        color="#306d96"
        >mdi-arrow-expand-down</v-icon
      ></span
    >
    <input
      type="file"
      ref="inputFile"
      class="d-none"
      @change="addFile"
      :accept="fileTypes"
      multiple
    />
  </v-row>
</template>
<script>
export default {
  name: "FileDropZone",
  props: {
    fileTypes: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      dropZoneClass: "drop_zone",
    };
  },
  methods: {
    handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      this.dropZoneClass = "drop_zone_hover";
      evt.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
    },
    handleFileSelect(evt) {
      this.btnLoading = false;
      evt.stopPropagation();
      evt.preventDefault();
      this.dropZoneClass = "drop_zone";
      const fileList = evt.dataTransfer.files;
      this.$emit("add-file", fileList);
    },
    addFile(e) {
      this.btnLoading = false;
      const fileList = e.target.files;
      this.$emit("add-file", fileList);
    },
  },
};
</script>

<style scoped>
.drop_zone {
  width: 90%;
  height: 100px;
  border: 2px dashed #306d96;
  margin: auto;
  opacity: 0.5;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.drop_zone_hover {
  width: 90%;
  height: 100px;
  border: 2px dashed #306d96;
  margin: auto;
  opacity: 1;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
}
</style>
