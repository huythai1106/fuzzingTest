import { elememtObj } from "../../helpers";
import { Contexts, getKeyValueInString, isIncludeInArray, mutatedString } from "../../helpers/utils";
import { readFile } from "../../helpers/file";


export default class FormMutation {
formData: string;
mutationFormDatas: Array<string> = [];
keyValues: Array<elememtObj> = [];
path: string = "src/fuzzing/dictionaries";

public constructor(formData: string) {
    this.formData = formData;
    this.init();
}

private init() {
    this.createKeyValue();
    this.createMutationFormDatas();
  } 

  private createKeyValue() {
    this.keyValues = getKeyValueInString(this.formData);

    this.keyValues.forEach((obj) => {
      if (obj.type === "number") {
        const value = readFile(`${this.path}/number.txt`).split(/\n/);
        obj.mutateValue?.push(...value);
      } else if (isIncludeInArray(Contexts.common, obj.key).status) {
        const value = isIncludeInArray(Contexts.common, obj.key).value;
        const dic = (Contexts as any)[value].dic;
        obj.dictionaries?.push(dic);
        const mutateValue = readFile(`${this.path}/${dic}.txt`).split(/\n/);
        obj.mutateValue?.push(...mutateValue);
      } else if (obj.type === "boolean") {
        obj.mutateValue?.push("true", "false");
      } else if (obj.type === "string") {
        const value = mutatedString(obj.value, 20);
        obj.mutateValue?.push(...value);
      }
    });
  }

  private createMutationFormDatas() {
    let newKeyValues = this.keyValues;
    while (true) {
      let check = false;
      let formTmp = this.formData;    

      newKeyValues.forEach((obj: any) => {
        if (obj.mutateValue && obj.mutateValue.length > 0) {
          const randomValue = Math.floor(Math.random() * obj.mutateValue.length);
          let value = obj.mutateValue[randomValue];
          
          formTmp = formTmp.replace(`${obj.key}=${obj.value}`, `${obj.key}=${value}`);
          obj.mutateValue.splice(randomValue, 1);

          if (obj.mutateValue.length > 0) {
            check = true;
          }
        }
      });
      this.mutationFormDatas.push(formTmp);

      if (!check) {
        break;
      }
    }
  }

  public getKeyValue() {
    return this.keyValues;
  }

  public getMutation() {
    return this.mutationFormDatas;
  }
}