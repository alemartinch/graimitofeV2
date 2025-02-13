import { saveFileAndUploadToS3 } from "@/store/modules/s3upload";
import { tcmtRegApi, eatApi } from "@/apis/index";

export const uploadAssessmentFiles = (assessmentId, localFiles) => {
  const filesRequests = localFiles.map((lFile) =>
    saveFileAndUploadToS3(
      tcmtRegApi.getFetcher(),
      `assessments/${assessmentId}/add-file`,
      {},
      lFile
    )
  );
  return Promise.allSettled(filesRequests);
};

export const uploadActionFiles = (actionId, localFiles) => {
  const filesRequests = localFiles.map((lFile) => {
    const actionData = {
      action: actionId,
      size: lFile.size,
    };
    return saveFileAndUploadToS3(
      eatApi.getFetcher(),
      `actions/${actionId}/files`,
      actionData,
      lFile
    );
  });
  return Promise.allSettled(filesRequests);
};

export const uploadOccurrenceFiles = (taskId, occurrenceId, localFiles) => {
  const filesRequests = localFiles.map((lFile) => {
    const occurrenceData = {
      id: occurrenceId,
    };
    return saveFileAndUploadToS3(
      tcmtRegApi.getFetcher(),
      `repet-actions/${taskId}/occurrences/${occurrenceId}/add-file`,
      occurrenceData,
      lFile
    );
  });
  return Promise.allSettled(filesRequests);
};
