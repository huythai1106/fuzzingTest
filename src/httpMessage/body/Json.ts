import { elememtObj } from "../../helpers";
import { getKeyValueInObject } from "../../helpers/utils";

export default class JsonMutation {
  jsonData: string;
  jsonObject: Object;

  keyValues: elememtObj[] = [];

  public constructor(jsonData: string) {
    this.jsonData = jsonData;
    this.jsonObject = JSON.parse(this.jsonData);
    this.init();
  }

  private init() {
    this.createKeyValue();
  }

  private createKeyValue() {
    this.keyValues = getKeyValueInObject(this.jsonObject);
  }

  public getKeyValue() {
    return this.keyValues;
  }
}
