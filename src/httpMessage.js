const querystring = require("querystring");
const parseString = require("xml2js").parseString;

const topDomain = [".com", ".vn", ".net", ".org"];

const checkContain = (arrayString, originString) => {
  for (let i = 0; i < arrayString.length; i++) {
    if (originString.includes(arrayString[i])) {
      return true;
    }
  }
  return false;
};

class httpMessage {
  rawHeader;
  url;
  method;
  bodyRaw;
  bodyData;
  requestLine;
  typeBody;
  objFields = {};

  typeFuzz = {
    url: {
      isFuzz: true,
      type: "FUZZ",
      value: [],
      dictionaries: [],
    },
    params: {
      isFuzz: true,
      type: "FUZZ1",
      value: [],
      dictionaries: ["text", "number", ""],
    },
    php: {
      isFuzz: true,
      type: "FUZZ2",
      value: [],
      dictionaries: [],
    },
    number: {
      isFuzz: true,
      type: "FUZZ3",
      value: [],
      dictionaries: ["number"],
    },
    text: {
      isFuzz: true,
      type: "FUZZ4",
      value: [],
      dictionaries: ["text"],
    },
    query: {
      isFuzz: true,
      type: "FUZZ5",
      value: [],
      dictionaries: ["xss", "number", "text"],
    },
    "User-Agent": {
      isFuzz: true,
      type: "FUZZ6",
      value: [],
      dictionaries: [],
    },
    "Content-Type": {
      isFuzz: true,
      type: "FUZZ6",
      value: [],
      dictionaries: [],
    },
    Referer: {
      isFuzz: true,
      type: "FUZZ6",
      value: [],
      dictionaries: [],
    },
  };

  isHasBody = false;
  isFuzzed = false;

  constructor(header) {
    this.rawHeader = header;
    this.analysisHeader(header);
  }

  analysisHeader = (header) => {
    let key = {};

    let requestLines = header.split("\n");

    // URL
    if (
      requestLines[0] === "" ||
      requestLines[0] === "\n" ||
      requestLines[0] === "\r"
    ) {
      requestLines.shift();
    }

    if (requestLines[requestLines.length - 1] === "") {
      requestLines.pop();
    }

    this.requestLine = requestLines[0];
    this.url = requestLines[0].split(" ")[1];

    this.method = requestLines[0].split(" ")[0];

    this.analysisUrl(this.url);

    // feilds
    let fields = requestLines.slice(1);

    if (requestLines[requestLines.length - 1] === "\r") {
      requestLines.pop();
      this.isHasBody = false;
    } else {
      this.isHasBody = true;
      this.bodyRaw = requestLines[requestLines.length - 1];
      fields = fields.slice(0, -2);
    }

    fields.pop();

    fields.forEach((line) => {
      const s = line.split(":");

      key[s[0]] = s[1].trim();

      if (s[0] === "content-type") {
        if (s[1].trim() === "application/json") {
          this.typeBody = "json";
        } else if (s[1].trim() === "application/x-www-form-urlencoded") {
          this.typeBody = "text";
        } else if (s[1].trim() === "application/xml") {
          this.typeBody = "xml";
        }
      }
    });

    // console.log(key);
    this.objFields = key;
    this.analysisFields(this.objFields);

    if (this.typeBody !== "" && this.isHasBody) {
      this.bodyData = this.analysisBody(this.bodyRaw, this.typeBody);
    }
  };

  analysisUrl = (url) => {
    if (!url) {
    }
    let argArr;
    if (url.includes("https")) {
      argArr = url.slice(8).split("/");
    } else {
      argArr = url.slice(7).split("/");
    }
    argArr.forEach((arg) => {
      if (arg.includes("?")) {
        const regex = /([^&?]+)=([^&]+)/g;

        let match;
        while ((match = regex.exec(arg)) !== null) {
          const key = match[1];
          const value = match[2];
          if (value) {
            this.typeFuzz.query.value.push({ key, value });
          }
        }
      } else if (checkContain(topDomain, arg)) {
        this.typeFuzz.url.value.push(arg);
      } else if (!isNaN(arg)) {
        this.typeFuzz.number.value.push(arg);
      } else if (arg.includes(".php")) {
        this.typeFuzz.php.value.push(arg);
      } else {
        this.typeFuzz.params.value.push(arg);
      }
    });
  };

  analysisBody = (body, type) => {
    let bodyData;
    switch (type) {
      case "text": {
        bodyData = querystring.parse(body);
        break;
      }
      case "json": {
        bodyData = JSON.parse(body);
        break;
      }
      case "xml": {
        parseString(body, (err, result) => {
          bodyData = result.data;
        });
        break;
      }
      default:
        break;
    }

    return bodyData;
  };

  analysisFields = (fields) => {
    for (const field in fields) {
      if (this.typeFuzz.hasOwnProperty(field)) {
        this.typeFuzz[field].value.push(fields[field]);
      }
    }
  };

  exportUrl = () => {
    let newUrl = this.url;
    for (const key in this.typeFuzz) {
      if (this.typeFuzz[key].dictionaries.length !== 0) {
        if (key === "query") {
          for (let i = 0; i < this.typeFuzz[key].value.length; i++) {
            newUrl = newUrl.replace(
              this.typeFuzz[key].value[i].value,
              this.typeFuzz[key].type
            );
            this.isFuzzed = true;
          }
        } else {
          for (let i = 0; i < this.typeFuzz[key].value.length; i++) {
            if (this.typeFuzz[key].value[i]) {
              newUrl = newUrl.replace(
                this.typeFuzz[key].value[i],
                this.typeFuzz[key].type
              );
              this.isFuzzed = true;
            }
          }
        }
      }
    }

    return newUrl;
  };

  exportHeaderField = () => {
    let headersString = "";
    for (const key in this.objFields) {
      if (this.typeFuzz.hasOwnProperty(key)) {
        headersString += `${key}: ${this.typeFuzz[key].type}\n`;
      } else {
        headersString += `${key}: ${this.objFields[key]}\n`;
      }
      this.isFuzzed = true;
    }

    return headersString;
  };

  exportBody = () => {
    let newBody = this.bodyRaw;
    for (let key in this.bodyData) {
      newBody = newBody.replace(this.bodyData[key], "FUZZBODY");
      this.isFuzzed = true;
    }

    return newBody;
  };

  exportFuzzHeader = () => {
    let headerFuzz = "";
    let requestLine = this.method + " " + this.exportUrl() + " HTTP/1.1\n";
    let fields = this.exportHeaderField();

    headerFuzz = requestLine + fields;

    if (this.isHasBody) {
      headerFuzz += "\n" + this.exportBody() + "\n";
    }

    if(!this.isFuzzed) {
      return "";
    }

    return headerFuzz;
  };
}

module.exports = {
  httpMessage,
};
