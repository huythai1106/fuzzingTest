import { elememtObj } from "../../helpers";
import { getKeyValueInXML } from "../../helpers/utils";

export default class XmlMutation {
  xmlData: string;
  keyValues: Array<elememtObj> = [];

  public constructor(xmlData: string) {
    this.xmlData = xmlData;
    this.init();
  }

  private init() {
    this.createKeyValue();
  }

  private createKeyValue() {
    this.keyValues = getKeyValueInXML(this.xmlData);
  }

  public getKeyValue() {
    return this.keyValues;
  }
}
