/*
This is a placeholder for uploading a file to the backend, intead of the actual file
which is then uploaded directly to S3.
This can be removed once the backend removes the logic to process file storage.
*/
const fileContentPlaceholder = new Blob(["x"]);

const saveFileAndUploadToS3 = function (api, uploadUrl, objectData, file) {
  // Save (post) the file object and then put the actual file in S3
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const headers = {
      "x-amz-acl": "bucket-owner-full-control",
      "x-amz-meta-resized": "false",
      "x-amz-meta-source": "frontend",
    };
    if (objectData) {
      const jsonData = JSON.stringify(objectData);
      const blobData = new Blob([jsonData], { type: "application/json" });
      formData.append("data", blobData);
    }
    formData.append("filename", fileContentPlaceholder, file.file.name);
    api
      .post(uploadUrl, formData)
      .then((response) => {
        const responsData =
          "results" in response.data ? response.data.results : response.data;
        api
          .put(responsData.filename, file.file, {
            onUploadProgress: (progressEvent) => {
              file.uploadPercentage = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
            },
            headers: headers,
          })
          .then(() => {
            resolve(response);
          })
          .catch((error) => {
            api.delete(`${uploadUrl}/${responsData.id}`);
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const updateFileAndUploadToS3 = function (api, uploadUrl, filename, file) {
  // Update (put) the file object and then put the actual file in S3
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const headers = {
      "x-amz-acl": "bucket-owner-full-control",
      "Content-Type": file.type,
      "x-amz-meta-resized": "false",
      "x-amz-meta-source": "frontend",
    };
    formData.append(filename, fileContentPlaceholder, file.name);
    api
      .put(uploadUrl, formData)
      .then((response) => {
        const responsData =
          "results" in response.data ? response.data.results : response.data;
        api
          .put(responsData[filename], file, { headers: headers })
          .then(() => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export { saveFileAndUploadToS3, updateFileAndUploadToS3 };
