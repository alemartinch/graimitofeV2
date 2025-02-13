const guid = () => {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

export const processRawFiles = (fileList) => {
  const processedFiles = [];
  [...fileList].forEach((file) => {
    processedFiles.push({
      id: guid(),
      file: file,
      filename: null,
      size: file.size,
      name: file.name,
      ext: file.name.split(".").pop(),
      description: "",
      uploaded: false,
      uploadPercentage: 0,
      error: false,
      deleting: false,
    });
  });
  return processedFiles;
};
