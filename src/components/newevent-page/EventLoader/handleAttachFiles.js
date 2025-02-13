import { mapActions, mapMutations, mapState } from "vuex";
import { eatApi } from "@/apis";
import FileDropZone from "@/components/reusable/FileDropZone.vue";
import { saveFileAndUploadToS3 } from "@/store/modules/s3upload.js";

export default {
  name: "AttachFiles",
  components: { FileDropZone },
  data() {
    return {
      filesToUpload: [],
      btnLoading: false,
      menuDescription: false,
      description: "",
    };
  },

  created() {
    if (this.event.temp_event.files.length) {
      this.event.temp_event.files.forEach((eventFile) => {
        this.filesToUpload.unshift({
          file: { name: eventFile.name, size: eventFile.size },
          id: eventFile.id,
          description: eventFile.description,
          filename: eventFile.filename,
          uploaded: true,
          uploadPercentage: 0,
          error: false,
          deleting: false,
          ext: eventFile.name.split(".").pop(),
        });
      });
    }
  },

  computed: {
    ...mapState(["event"]),

    isMobile() {
      return this.$vuetify.breakpoint.smAndDown;
    },

    isAllFilesUpload() {
      return this.filesToUpload.every((file) => file.uploaded || file.error);
    },

    filesUploaded() {
      return this.filesToUpload.filter((file) => file.uploaded);
    },

    filesNotUploaded() {
      return this.filesToUpload.filter((file) => !file.uploaded);
    },
  },

  methods: {
    ...mapMutations("event", ["set_file"]),

    ...mapActions(["set_alert"]),

    isDocument(ext) {
      return !["jpg", "png", "jpge", "gif", "svg", "bmp"].includes(ext);
    },

    closeAttachDialog() {
      this.$emit("evt-close-attach", this.filesUploaded.length);
      this.filesNotUploaded.forEach((file) => {
        const fileIndex = this.filesToUpload.indexOf(file);
        this.filesToUpload.splice(fileIndex, 1);
      });
    },

    addFile(fileList) {
      this.btnLoading = false;
      for (let i = 0; i < fileList.length; i++) {
        if (
          !this.filesToUpload.length ||
          (this.filesToUpload.findIndex(
            (file) => file.file.size === fileList[i].size
          ) === -1 &&
            fileList[i].name.length < 100)
        ) {
          this.filesToUpload.unshift({
            file: fileList[i],
            description: "",
            uploaded: false,
            uploadPercentage: 0,
            error: false,
            deleting: false,
            ext: fileList[i].name.split(".").pop(),
          });
        }
      }
      this.sendFiles();
    },

    sendFiles() {
      // const config = {
      //   onUploadProgress: progressEvent => {
      //     let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      //     state.percentUploadFiles = percentCompleted
      //   }
      // }
      // let arrayFileRequests = []
      this.btnLoading = true;
      this.filesToUpload.forEach((file) => {
        if (!file.uploaded) {
          const objectData = {
            event: this.event.temp_event.id,
            description: file.description,
            size: file.size,
          };
          saveFileAndUploadToS3(
            eatApi.getFetcher(),
            `events/${this.event.temp_event.id}/files`,
            objectData,
            file
          )
            .then((response) => {
              file.filename = response.data.results.filename;
              file.uploaded = true;
              file.id = response.data.results.id;
              this.set_file(file);
            })
            .catch(() => {
              file.error = true;
            });
        }
      });
    },

    deleteFile(file) {
      if (file.error || !file.uploaded) {
        const fileIndex = this.filesToUpload.indexOf(file);
        this.filesToUpload.splice(fileIndex, 1);
        return;
      }
      file.deleting = true;
      eatApi
        .getFetcher()
        .delete(`events/${this.event.temp_event.id}/files/${file.id}`)
        .then(() => {
          const fileIndex = this.filesToUpload.indexOf(file);
          this.filesToUpload.splice(fileIndex, 1);
          this.set_file(file);
          file.deleting = false;
        })
        .catch(() => {
          this.set_alert({
            appAlertType: "error",
            appAlertMsg: "No se pudo eliminar el archivo",
          });
          file.deleting = false;
        });
    },
  },
};
