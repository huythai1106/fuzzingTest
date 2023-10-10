const fs = require("fs");
const { httpMessage } = require("./httpMessage");

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
    let mapHeaderURL = [];

    const string = data.split("\n");
    let a = "";
    string.forEach((line, index) => {
      if (line.includes("GET") || line.includes("POST")) {
        if (a !== "") {
          mapHeaderURL.push(a);
        }
        a = "";
      }
      a += line + "\n";

      if (index === string.length - 1) {
        mapHeaderURL.push(a);
        a = "";
      }
    });
    let stringExport = "";

    for (let i = 0; i < mapHeaderURL.length; i++) {
      // console.log(aaa.exportUrl(aaa.url, aaa.typeFuzz));
      let aaa = new httpMessage(mapHeaderURL[i]);
      // console.log(aaa.exportFuzzHeader());
      stringExport += aaa.exportFuzzHeader();
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
