<template>
  <v-menu top absolute>
    <template v-slot:activator="{ on }">
      <div
        v-on="on"
        class="file-container"
        :style="{
          width: containerWidth,
          cursor: 'pointer',
          height: small ? '24px' : 'auto',
        }"
      >
        <icon-base :width="size" :height="size" class="pr-2">
          <component :is="icon" />
        </icon-base>
        <div class="d-flex" :class="small ? 'flex-row' : 'flex-column'">
          <v-tooltip top open-delay="300">
            <template v-slot:activator="{ on }">
              <span
                v-on="on"
                class="font-weight-bold"
                :class="small ? 'caption' : 'text-body-2'"
              >
                {{ file.name | reduceText(reduceSize) }}
              </span>
            </template>
            {{ file.name }}
          </v-tooltip>
          <span v-if="!small" class="caption">{{
            file.ext.toUpperCase()
          }}</span>
        </div>
        <v-spacer />
        <template v-if="appendIcon">
          <v-progress-circular
            v-if="(!file.uploaded && !file.error) || file.deleting"
            indeterminate
            :rotate="360"
            :size="15"
            :width="2"
            :value="file.uploadPercentage"
            color="teal"
          />
          <v-icon v-if="file.error" small color="error"
            >mdi-close-circle</v-icon
          >
          <v-icon small color="success" v-if="file.uploaded && !file.deleting"
            >mdi-cloud-check
          </v-icon>
        </template>
      </div>
    </template>
    <v-card class="pa-2">
      <v-btn
        v-if="deletable"
        small
        text
        color="primary"
        @click="$emit('delete-file')"
        >eliminar</v-btn
      >
      <v-btn
        small
        text
        color="primary"
        v-if="file.uploaded"
        @click="$emit('download-file')"
        >descargar</v-btn
      >
    </v-card>
  </v-menu>
</template>
<script>
import IconBase from "@/components/Icons/SVGBase.vue";
import DocIcon from "@/components/Icons/DocIcon.vue";
import OtherIcon from "@/components/Icons/OtherIcon.vue";
import ImageIcon from "@/components/Icons/ImageIcon.vue";
import PresentationIcon from "@/components/Icons/PresentationIcon.vue";
import SheetIcon from "@/components/Icons/SheetIcon.vue";
import PdfIcon from "@/components/Icons/PdfIcon.vue";

export default {
  name: "FileCard",
  components: { IconBase, DocIcon },
  props: {
    file: {
      type: Object,
      require: true,
    },
    small: {
      type: Boolean,
      default: false,
    },
    appendIcon: {
      type: Boolean,
      default: true,
    },
    deletable: {
      type: Boolean,
      default: true,
    },
  },

  computed: {
    size() {
      return this.small ? 20 : 35;
    },

    containerWidth() {
      return this.small ? "120px" : "200px";
    },

    reduceSize() {
      return this.small ? "7" : "12";
    },

    icon() {
      if (["doc", "docx"].includes(this.file.ext.toLowerCase())) {
        return DocIcon;
      }
      if (
        ["jpg", "jpeg", "bmp", "gif", "png", "svg"].includes(
          this.file.ext.toLowerCase()
        )
      ) {
        return ImageIcon;
      }
      if (["ppt", "pptx"].includes(this.file.ext.toLowerCase())) {
        return PresentationIcon;
      }
      if (["xls", "xlsx"].includes(this.file.ext.toLowerCase())) {
        return SheetIcon;
      }
      if (this.file.ext.toLowerCase() === "pdf") {
        return PdfIcon;
      }
      return OtherIcon;
    },
  },
};
</script>
<style scoped>
.file-container {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  margin-right: 4px;
  margin-bottom: 4px;
  border: 1px solid #80808063;
  border-radius: 5px;
}
</style>
