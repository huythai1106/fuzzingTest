const fs = require("fs");
const { httpMessage } = require("./httpMessage");
const { separateRequest } = require("../utils/index");

const handleProcess = (folderName) => {
  fs.readdir(`${folderName}`, (err, files) => {
    if (err) {
      console.log(err);
      return;
    }

    for (const file of files) {
      handleProcessFile(folderName, file);
    }
  });
};

const handleProcessFile = (folderName, fileName) => {
  fs.readFile(`${folderName}/${fileName}`, "utf-8", (error, data) => {
    // Tách header thành các phần riêng biệt
    if (error) {
      console.log(error);
      return;
    }
    let mapHeaderURL = separateRequest(data);

    let stringExport = "";

    for (let i = 0; i < mapHeaderURL.length; i++) {
      let aaa = new httpMessage(mapHeaderURL[i]);
      // console.log(aaa.exportFuzzHeader());
      stringExport += aaa.exportFuzzHeader() + "\n\n";
    }

    // console.log(stringExport);

    exportToFile(stringExport, fileName);
  });
};

const exportToFile = (content, fileName) => {
  fs.writeFile(`export/${fileName}`, content, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

module.exports = {
  handleProcess,
};
