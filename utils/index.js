const separateRequest = (out) => {
  const arrRequest = [];

  out.split("\n\n").forEach((line, index) => {
    arrRequest.push(line);
  });

  arrRequest.pop();

  return arrRequest;
};

module.exports = {
  separateRequest,
};
