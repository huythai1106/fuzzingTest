import { elememtObj } from "src/helpers";
import {
  Contexts,
  getKeyValueInObject,
  isIncludeInArray,
  mutatedString,
} from "../../helpers/utils";
import { readFile } from "src/helpers/file";

export default class JsonMutation {
  jsonData: string;
  jsonObject;

  mutationJsonDatas: Array<any> = [];
  keyValues: elememtObj[] = [];

  private constructor(jsonData: string) {
    this.jsonData = jsonData;
    this.jsonObject = JSON.parse(this.jsonData);
    this.init();
  }

  private init() {
    this.createKeyValue();
    this.createMutationJson();
  }

  private createKeyValue() {
    this.keyValues = getKeyValueInObject(this.jsonObject);
    console.log(this.keyValues);
    this.keyValues.forEach((obj) => {
      if (obj.Type === "number") {
        const value = readFile("./dictionaries/number.txt").split(/\n/);
        obj.mutateValue?.push(...value);
      } else if (isIncludeInArray(Contexts.common, obj.Key).status) {
        // do something with
        const value = isIncludeInArray(Contexts.common, obj.Key).value;
        const dic = (Contexts as any)[value].dic;

        const mutateValue = readFile(`./dictionaries/${dic}.txt`).split(/\n/);
        obj.mutateValue?.push(...mutateValue);
      } else if (obj.Type === "boolean") {
        obj.mutateValue?.push("true", "false");
      } else if (obj.Type === "string") {
        // do something
        const value = mutatedString(obj.Value, 20);
        obj.mutateValue?.push(...value);
      }
    });
  }

  private createMutationJson() {
    let keyValues = JSON.parse(JSON.stringify(this.keyValues));
    while (true) {
      let check = false;
      let jsontmp = this.jsonData;

      keyValues.forEach((obj: any) => {
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

  public getKeyValue() {
    return this.keyValues;
  }

  public getMutation() {
    return this.mutationJsonDatas;
  }
}
