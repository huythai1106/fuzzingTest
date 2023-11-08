import HTTPRequest from "src/httpMessage/HTTPRequest";
import { elememtObj } from "../../helpers";
import { Contexts, getKeyValueInObject, isIncludeInArray, mutatedString } from "../../helpers/utils";
import { readFile } from "../../helpers/file";

export default class JsonMutation {
  jsonData: string;
  jsonObject: Object;

  mutationJsonDatas: Array<any> = [];
  keyValues: elememtObj[] = [];
  path: string = "src/fuzzing/dictionaries";

  public constructor(jsonData: string) {
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

    this.keyValues.forEach((obj) => {
      if (obj.type === "number") {
        const value = readFile(`${this.path}/number.txt`).split(/\n/);
        obj.mutateValue?.push(...value);
      } else if (isIncludeInArray(Contexts.common, obj.key).status) {
        // do something with
        const value = isIncludeInArray(Contexts.common, obj.key).value;
        const dic = (Contexts as any)[value].dic;
        obj.dictionaries?.push(dic);

        const mutateValue = readFile(`${this.path}/${dic}.txt`).split(/\n/);
        obj.mutateValue?.push(...mutateValue);
      } else if (obj.type === "boolean") {
        obj.mutateValue?.push("true", "false");
      } else if (obj.type === "string") {
        // do something

        const value = mutatedString(obj.value, 20);
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
          const randomValue = Math.floor(Math.random() * obj.mutateValue.length);
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

  public fuzzingBody(request: HTTPRequest) {
    const url = request.getStartLine().url;

    let promises: Promise<any>[] = [];
    for (let i = 0; i < this.mutationJsonDatas.length; i++) {
      promises.push(
        fetch(url.href, {
          method: request.getStartLine().method,
          referrer: request.getHeaders()["Referrer"],
          headers: {
            "Content-Type": "application/json",
          },
          body: this.mutationJsonDatas[i],
        })
          .then((res) => {
            // console.log(res.status, res.json());
            return {
              url: url.href,
              status: res.status,
              body: this.mutationJsonDatas[i],
              response: res.json(),
            };
          })
          .catch((error) => {
            return error;
          })
      );
    }

    return Promise.all(promises);
  }
}
