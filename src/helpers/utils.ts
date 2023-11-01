import { elememtObj } from ".";

const Contexts = {
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

const mutatedString = (inputString: string, numMutations = 100) => {
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

const isIncludeInArray = (arrayString: Array<any>, originString: string) => {
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

const getKeyValueInObject = (jsonData: string) => {
  const objValue: elememtObj[] = [];

  const setKeyValue = (obj: any) => {
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

export const removeEmpty = (input: any) => {
  return !!input;
};

const compareRequest = (msg1: string, msg2: string) => {
  //handle "" in msg array
  let request1 = msg1.split("\r\n");
  while (request1[request1.length - 1] === "") {
    request1.pop();
  }
  if (request1[0] === "") {
    request1.shift();
  }

  let request2 = msg2.split("\r\n");
  while (request2[request2.length - 1] === "") {
    request2.pop();
  }
  if (request2[0] === "") {
    request2.shift();
  }

  //get url

  let url1 = request1[0]?.split(" ")[1]?.split("?")[0].split("#")[0];
  let url2 = request2[0]?.split(" ")[1]?.split("?")[0].split("#")[0];

  //get method
  let method1 = request1[0]?.split(" ")[0];
  let method2 = request2[0]?.split(" ")[0];

  //get required field
  let host1 = "";
  let host2 = "";
  let referer1 = "";
  let referer2 = "";
  let contentType1 = "";
  let contentType2 = "";

  request1.forEach((line, index) => {
    if (request1[index].split(" ")[0] === "Content-Type:") {
      contentType1 = request1[index].split(" ")[1];
    } else if (
      request1[index].split(" ")[0] === "host:" ||
      request1[index].split(" ")[0] === "Host:"
    ) {
      host1 = request1[index].split(" ")[1];
    } else if (request1[index].split(" ")[0] === "Referer:") {
      referer1 = request1[index].split(" ")[1];
    }
  });
  request2.forEach((line, index) => {
    if (request2[index].split(" ")[0] === "Content-Type:") {
      contentType2 = request2[index].split(" ")[1];
    } else if (
      request2[index].split(" ")[0] === "host:" ||
      request2[index].split(" ")[0] === "Host:"
    ) {
      host2 = request2[index].split(" ")[1];
    } else if (request2[index].split(" ")[0] === "Referer:") {
      referer2 = request2[index].split(" ")[1];
    }
  });

  //duplicate checked
  if (method1 !== method2) return false;
  if (url1 !== url2) return false;
  if (host1 !== host2) return false;
  if (referer1 !== referer2) return false;
  if (contentType1 !== contentType2) return false;

  return true;
};

export {
  Contexts,
  isIncludeInArray,
  mutatedString,
  getKeyValueInObject,
  compareRequest,
};
