export const PERMITTED_METHODS = ["POST", "PATCH", "PUT", "GET", "DELETE", "OPTION", "TRACE", "CONNECT", "HEAD"];

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
