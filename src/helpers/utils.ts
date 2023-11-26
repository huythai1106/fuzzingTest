import detectType, { TYPE_ALIAS } from "../pkg/detection/type";
import { elememtObj } from ".";

const Contexts = {
  common: ["method", "lang", "module", "password", "user", "email", "username", "pwd", "pass"],
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
      const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);

      const mutationType = Math.floor(Math.random() * 3);
      if (mutationType === 0) {
        // Thay thế
        mutatedString = mutatedString.slice(0, randomIndex) + randomChar + mutatedString.slice(randomIndex + 1);
      } else if (mutationType === 1) {
        // Chèn
        mutatedString = mutatedString.slice(0, randomIndex) + randomChar + mutatedString.slice(randomIndex);
      } else {
        // Xóa
        mutatedString = mutatedString.slice(0, randomIndex) + mutatedString.slice(randomIndex + 1);
      }
    }

    mutations.push(mutatedString);
  }

  return mutations;
};

const isIncludeStringInArray = (arrayString: Array<any>, originString: any) => {
  if (typeof originString !== "string") {
    return {
      status: false,
      value: null,
    };
  }
  for (let i = 0; i < arrayString.length; i++) {
    if (originString.includes(arrayString[i])) {
      return {
        value: arrayString[i],
        status: true,
      };
    }
  }
  return {
    status: false,
    value: null,
  };
};

const getKeyValueInObject = (jsonData: object) => {
  const objValue: elememtObj[] = [];

  const setKeyValue = (obj: any) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === "object") {
          if (Array.isArray(value)) {
            objValue.push({
              key: key,
              type: "array",
              length: value.length,
            });
          } else {
            objValue.push({ key: key, type: typeof value });
          }
          setKeyValue(value);
        } else {
          let typeP = detectType(key);

          objValue.push({
            key: key,
            value: value,
            type: typeP,
            dictionaries: [typeP],
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

const getKeyValueInString = (formData: string) => {
  const objValue: elememtObj[] = [];
  const params = new URLSearchParams(formData);
  const keyValue: { key: string; value: string }[] = [];

  params.forEach((value, key) => {
    let newValue: any;
    if (!isNaN(Number(value))) {
      newValue = Number(value);
    } else {
      newValue = value;
    }
    objValue.push({
      key: key,
      value: newValue,
      type: typeof newValue,
      dictionaries: [typeof newValue],
    });
  });

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
    } else if (request1[index].split(" ")[0] === "host:" || request1[index].split(" ")[0] === "Host:") {
      host1 = request1[index].split(" ")[1];
    } else if (request1[index].split(" ")[0] === "Referer:") {
      referer1 = request1[index].split(" ")[1];
    }
  });
  request2.forEach((line, index) => {
    if (request2[index].split(" ")[0] === "Content-Type:") {
      contentType2 = request2[index].split(" ")[1];
    } else if (request2[index].split(" ")[0] === "host:" || request2[index].split(" ")[0] === "Host:") {
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

const pattenOfUrl = (url: URL, pattens: Record<number, string[]>): [boolean, undefined | string] => {
  let tokens = url.pathname.slice(1).split("/");

  let length = tokens.length;

  if (!length || !pattens[length]) {
    return [false, undefined];
  }

  if (pattens[length].includes(url.pathname.slice(1))) {
    return [false, undefined];
  }

  if (pattens[length] === undefined) {
    return [false, undefined];
  }

  let potientialPattens = pattens[length].map((p) => {
    return p.split("/");
  });

  for (let i = 0; i < length; i++) {
    let token = tokens[i];
    potientialPattens = potientialPattens.filter((p) => {
      if (p[i] === "FUZZING" || token === p[i]) {
        return true;
      }
      return false;
    });
  }

  if (potientialPattens.length === 0) {
    return [false, undefined];
  } else if (potientialPattens.length > 1) {
    let numberFuzz = 0;
    let index = 0;
    potientialPattens.forEach((p, index1) => {
      let count = 0;
      for (let i = 0; i < p.length; i++) {
        p[i] === "FUZZING" && count++;
      }
      if (count > numberFuzz) {
        numberFuzz = count;
        index = index1;
      }
    });

    return [true, potientialPattens[index].join("/")];
  } else {
    return [true, potientialPattens[0].join("/")];
  }
};

export { Contexts, isIncludeStringInArray, mutatedString, getKeyValueInObject, compareRequest, pattenOfUrl, getKeyValueInString };
