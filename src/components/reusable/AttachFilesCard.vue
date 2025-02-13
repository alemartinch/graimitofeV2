<template>
  <div>
    <div class="d-flex align-center justify-space-between">
      <slot name="title"> {{ cantFiles }} archivo/s </slot>
      <v-btn
        v-if="!onlyList"
        class="my-2"
        plain
        color="primary"
        small
        :disabled="disabled"
        @click="$refs.inputFile.click()"
      >
        <v-icon left>mdi-rotate-270 mdi-attachment</v-icon>
        adjuntar
      </v-btn>
    </div>
    <input
      type="file"
      ref="inputFile"
      class="d-none"
      @change="$emit('add-files', $event.target.files)"
      :accept="fileTypes"
      multiple
    />
    <div :style="{ maxHeight: `${+maxHeight}px`, overflow: 'auto' }">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "AttachFilesCard",
  props: {
    cantFiles: {
      type: Number,
      default: 0,
    },
    maxHeight: {
      type: [Number, String],
      default: 150,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    onlyList: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      fileTypes:
        ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.bmp,.gif,.png,.svg",
      lastFileId: 0,
    };
  },
  computed: {
    ...mapState(["har"]),
  },
  methods: {
    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },
  },
};
</script>

<style scoped></style>
