const fs = require("fs");
const { httpMessage } = require("./httpMessage");
const { separateRequest } = require("../utils/index");
const { compareRequest } = require("../utils/compareRequest");

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

    let requestsURLFuzz = [];

    let stringExport = "";

    // for (let i = 0; i < mapHeaderURL.length; i++) {
    //   for (let j = i - 1; j >= 0; j--) {
    //     if (compareRequest(mapHeaderURL[i], mapHeaderURL[j])) {
    //       mapHeaderURL.splice(j, 1);
    //       j--;
    //       i--;
    //       break;
    //     }
    //   }
    // }

    console.time("Execution time");

    for (let i = 0; i < mapHeaderURL.length; i++) {
      if (requestsURLFuzz.length === 0) {
        requestsURLFuzz.push(mapHeaderURL[i]);
      } else {
        let check = true;
        for (let j = 0; j < requestsURLFuzz.length; j++) {
          if (compareRequest(mapHeaderURL[i], requestsURLFuzz[j])) {
            check = false;

            break;
          }
        }

        check && requestsURLFuzz.push(mapHeaderURL[i]);
      }
    }
    console.timeEnd("Execution time");

    for (let i = 0; i < requestsURLFuzz.length; i++) {
      if (requestsURLFuzz[i]) {
        let aaa = new httpMessage(requestsURLFuzz[i]);
        // console.log(aaa.exportFuzzHeader());
        stringExport += aaa.exportFuzzHeader() + "\n\n";
      }
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
