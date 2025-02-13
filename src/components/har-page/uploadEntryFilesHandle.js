import { saveFileAndUploadToS3 } from "@/store/modules/s3upload";
import { tcmtRegApi } from "@/apis";

export const uploadEntryFilesHandle = {
  data() {
    return {
      files: [],
    };
  },
  methods: {
    upNewEntryFiles(entryID) {
      const localFiles = this.files.filter((file) => !file.uploaded);
      return Promise.all(
        localFiles.map((file) => {
          return saveFileAndUploadToS3(
            tcmtRegApi.getFetcher(),
            `repet-actions/${this.getCurrentTask.id}/occurrences/${this.getCurrentOccurrence.id}/entries/${entryID}/add-file`,
            {},
            file
          ).catch(() => {
            throw "file";
          });
        })
      );
    },
  },
};
