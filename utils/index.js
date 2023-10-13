const separateRequest = (out) => {
  const arrRequest = [];

  out.split("~~~").forEach((line, index) => {
    if (
      line === "" ||
      line === "\n" ||
      line === "\r" ||
      line === "\r\n" ||
      !line
    ) {
      console.log(line);
    } else {
      arrRequest.push(line);
    }
  });

  return arrRequest;
};

module.exports = {
  separateRequest,
};
