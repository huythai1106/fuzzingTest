const fs = require("fs");

const listCommon = {
  common: [
    "method",
    "lang",
    "module",
    "password",
    "user",
    "email",
    "username",
    "pwd",
    "pass",
  ],
  method: {
    dic: "method",
    rank: 0,
  },
  lang: {
    dic: "lang",
    rank: 0,
  },
  module: {
    dic: "module",
    rank: 0,
  },
  user: {
    dic: "username",
    rank: 0,
  },
  email: {
    dic: "username",
    rank: 0,
  },
  username: {
    dic: "username",
    rank: 0,
  },
  password: {
    dic: "password",
    rank: 0,
  },
  pwd: {
    dic: "password",
    rank: 0,
  },
  pass: {
    dic: "password",
    rank: 0,
  },
};

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

const checkContain = (arrayString, originString) => {
  for (let i = 0; i < arrayString.length; i++) {
    if (originString.includes(arrayString[i])) {
      return {
        value: arrayString[i],
        status: true,
      };
    }
  }
  return {
    value: null,
    status: false,
  };
};

const mutatedString = (inputString, numMutations = 100) => {
  const mutations = [];

  for (let i = 0; i < numMutations; i++) {
    let mutatedString = inputString.slice();

    const numChanges = Math.floor(Math.random() * 5) + 1; // Tối đa 5 thay đổi

    for (let j = 0; j < numChanges; j++) {
      const randomIndex = Math.floor(Math.random() * mutatedString.length);
      const randomChar = String.fromCharCode(
        Math.floor(Math.random() * 26) + 97
      );

      const mutationType = Math.floor(Math.random() * 3);
      if (mutationType === 0) {
        // Thay thế
        mutatedString =
          mutatedString.slice(0, randomIndex) +
          randomChar +
          mutatedString.slice(randomIndex + 1);
      } else if (mutationType === 1) {
        // Chèn
        mutatedString =
          mutatedString.slice(0, randomIndex) +
          randomChar +
          mutatedString.slice(randomIndex);
      } else {
        // Xóa
        mutatedString =
          mutatedString.slice(0, randomIndex) +
          mutatedString.slice(randomIndex + 1);
      }
    }

    mutations.push(mutatedString);
  }

  return mutations;
};

const getKeyValue = (jsonData) => {
  const objValue = [];

  const setKeyValue = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === "object") {
          if (Array.isArray(value)) {
            // console.log(`Key: ${key}, Type: array, Length: ${value.length}`);
            objValue.push({
              Key: key,
              Type: "array",
              Length: value.length,
            });
          } else {
            // console.log(`Key: ${key}, Type: ${typeof value}`);
            objValue.push({ Key: key, Type: typeof value });
          }
          setKeyValue(value);
        } else {
          objValue.push({
            mutateValue: [],
            Key: key,
            Value: value,
            Type: typeof value,
          });
        }
      }
    }
  };

  if (Array.isArray(jsonData)) {
    jsonData.forEach((item) => {
      setKeyValue(item);
    });
  } else {
    setKeyValue(jsonData);
  }

  return objValue;
};

const getValueFile = (fileName) => {
  const value = fs.readFileSync(fileName, {
    encoding: "utf8",
    flag: "r",
  });

  return value;
};

module.exports = {
  separateRequest,
  mutatedString,
  getKeyValue,
  listCommon,
  checkContain,
  getValueFile,
};
