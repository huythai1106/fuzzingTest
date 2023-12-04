import { PATH } from "../helpers/assert";
import { exportFile, isExistFileNameInFolder, readFile } from "../helpers/file";

export const PERMITTED_METHODS = ["POST", "PATCH", "PUT", "GET", "DELETE", "OPTION", "TRACE", "CONNECT", "HEAD"];
export const KEYFUZZ = "FUZZ";

export enum FuzzingLocationsAlias {
  PATH,
  QUERY,
  BODY,
}

export enum TypeBody {
  JSON,
  XML,
  FORM,
  TEXT,
  NONE,
}

export const DICTIONATY_PATH = "src/fuzzing/dictionaries";

export const makeWordlist = (dic: string[]) => {
  let wordlist = dic.join("_");
  let path = `${PATH}/${wordlist}.txt`;
  if (!isExistFileNameInFolder(`${wordlist}.txt`, PATH)) {
    let dataTotal = [];
    for (const t of dic) {
      let data = readFile(`${PATH}/${t}.txt`).split("\n");
      dataTotal.push(...data);
    }
    exportFile(path, dataTotal.join("\n"));
  }

  return path;
};
