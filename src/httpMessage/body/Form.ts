import { elememtObj } from "../../helpers";
import { getKeyValueInString } from "../../helpers/utils";

export default class FormMutation {
  formData: string;
  keyValues: Array<elememtObj> = [];
  path: string = "src/fuzzing/dictionaries";

  public constructor(formData: string) {
    this.formData = formData;
    this.init();
  }

  private init() {
    this.createKeyValue();
  }

  private createKeyValue() {
    this.keyValues = getKeyValueInString(this.formData);
  }

  public getKeyValue() {
    return this.keyValues;
  }
}
