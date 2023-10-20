const {
  getKeyValue,
  mutatedString,
  checkContain,
  listCommon,
  getValueFile,
} = require("./utils/index");

class JsonMutation {
  jsonData;
  jsonObject;

  mutationJsonDatas = [];
  keyValues = [];

  constructor(jsonData) {
    this.jsonData = jsonData;
    this.jsonObject = JSON.parse(this.jsonData);
    this.init();
  }

  init() {
    this.createKeyValue();
    this.createMutationJson(this.jsonData, this.keyValues);
  }

  createKeyValue() {
    this.keyValues = getKeyValue(this.jsonObject);
    console.log(this.keyValues);
    this.keyValues.forEach((obj) => {
      if (obj.Type === "number") {
        const value = getValueFile("./dictionaries/number.txt").split(/\n/);
        obj.mutateValue.push(...value);
      } else if (checkContain(listCommon.common, obj.Key).status) {
        // do something with
        const value = getValueFile(
          `./dictionaries/${checkContain(listCommon.common, obj.Key).value}.txt`
        ).split(/\n/);
        obj.mutateValue.push(...value);
      } else if (obj.Type === "boolean") {
        obj.mutateValue.push("true", "false");
      } else if (obj.Type === "string") {
        // do something
        const value = mutatedString(obj.Value, 20);
        obj.mutateValue.push(...value);
      }
    });
  }

  createMutationJson() {
    let keyValues = JSON.parse(JSON.stringify(this.keyValues));
    while (true) {
      let check = false;
      let jsontmp = this.jsonData;

      keyValues.forEach((obj) => {
        if (obj.mutateValue && obj.mutateValue.length > 0) {
          const randomValue = Math.floor(
            Math.random() * obj.mutateValue.length
          );
          let value = obj.mutateValue[randomValue];
          jsontmp = jsontmp.replace(obj.Value, value);
          obj.mutateValue.splice(randomValue, 1);
          if (obj.mutateValue.length > 0) {
            check = true;
          }
        }
      });
      this.mutationJsonDatas.push(jsontmp);

      if (!check) {
        break;
      }
    }
  }
  getKeyValue() {
    return this.keyValues;
  }

  getMutation() {
    return this.mutationJsonDatas;
  }
}

module.exports = {
  JsonMutation,
};
