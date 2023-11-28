import detectType, { TYPE_ALIAS } from "../pkg/detection/type";
import { elememtObj } from ".";
import { parseString } from "xml2js";

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
          let typeP = detectType(value);

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

const getKeyValueInXML = (xmlData: string) => {
  let keyValue: elememtObj[] = [];
  let obj: object = {};

  parseString(xmlData, (err, result) => {
    if (err) {
      console.error("Lỗi khi phân tích XML:", err);
      return;
    }

    // Convert JSON to XML
    obj = { ...result };
  });

  keyValue = getKeyValueInObject(obj);

  return keyValue;
};

export const removeEmpty = (input: any) => {
  return !!input;
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

export { Contexts, isIncludeStringInArray, mutatedString, getKeyValueInObject, pattenOfUrl, getKeyValueInString, getKeyValueInXML };
