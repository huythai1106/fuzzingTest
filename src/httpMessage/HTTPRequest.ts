import HTTPRequestManager from "src/httpMessage/HTTPRequestManager";
import JsonMutation from "./body/Json";
import * as constants from "./constants";
import detectType, { TYPE_ALIAS } from "../pkg/detection/type";
import { FuzzingLocationsAlias } from "./constants";
import { makeRequest, sendRequest } from "../helpers";
import { readFile } from "../helpers/file";

class StartLine {
  method!: string;
  url!: URL;
  protocolVersion!: string;
}

class fuzzingLocationDetail {
  key!: any;
  value!: any;
  type!: TYPE_ALIAS;
  dictionaries!: TYPE_ALIAS[];
}

export default class HTTPRequest {
  private static headerRegex: RegExp = /(?<header_key>[\w-]+)\s*:\s*(?<header_value>.*)/g;

  private startLine!: StartLine;
  private headers!: { [key: string]: string };
  private body?: any | undefined;
  private typeBody?: constants.TypeBody | undefined;
  private fuzzingLocations!: Map<FuzzingLocationsAlias, fuzzingLocationDetail[]>;

  private httpRequestManager: HTTPRequestManager;

  public constructor(request: string, HTTPRequestManager: HTTPRequestManager) {
    // console.log([request]);
    this.httpRequestManager = HTTPRequestManager;
    const error = this.analyzeHTTPRequest(request.trim());
    if (error != null) throw error;
    this.httpRequestManager.getHttpLogs().set(this.startLine.url.href, []);
    this.fuzzingLocations = new Map();
  }

  private analyzeHTTPRequest(request: string): Error | null {
    const requestLines = request.split("\n").map((item) => item.trim());

    if (requestLines.length > 0) {
      let error: Error | null;

      error = this.analyzeStartLine(requestLines);
      if (error != null) {
        return error;
      }
      error = this.analyzeHeaders(requestLines);
      if (error != null) {
        return error;
      }

      error = this.analyzeBody(requestLines);
      if (error != null) {
        return error;
      }
    }
    return null;
  }

  private analyzeStartLine(requestLines: string[]): Error | null {
    this.startLine = {} as StartLine;

    const startLinePortions = requestLines[0].split(" ");
    if (startLinePortions.length !== 3) {
      return new Error(`Invalid start-line ${requestLines[0]}`);
    }

    this.startLine.method = startLinePortions[0];
    if (!constants.PERMITTED_METHODS.includes(this.startLine.method)) {
      return new Error(`Method ${this.startLine.method} is not allowed`);
    }

    try {
      this.startLine.url = new URL(startLinePortions[1]);
    } catch (error) {
      return new Error(`Invalid url: ${startLinePortions[1]}`);
    }

    this.startLine.protocolVersion = startLinePortions[2];
    return null;
  }

  private analyzeHeaders(requestLines: string[]): Error | null {
    this.headers = {};

    const emptyIndex = requestLines.indexOf("");
    const headers = requestLines.slice(1, emptyIndex !== -1 ? emptyIndex : requestLines.length);
    for (const header of headers) {
      HTTPRequest.headerRegex.lastIndex = 0;
      if (!HTTPRequest.headerRegex.test(header)) {
        return new Error(`Invalid header: ${header}`);
      }
      HTTPRequest.headerRegex.lastIndex = 0;

      const headerMatcher = [...header.matchAll(HTTPRequest.headerRegex)][0];
      if (headerMatcher?.groups && headerMatcher.groups.header_key.trim()) {
        this.headers[headerMatcher.groups.header_key.trim()] = headerMatcher.groups.header_value.trim();
      }
    }

    if (this.headers["Content-Type"]) {
      switch (this.headers["Content-Type"]) {
        case "application/x-www-form-urlencoded":
          this.typeBody = constants.TypeBody.FORM;
          break;
        case "application/json":
          this.typeBody = constants.TypeBody.JSON;
          break;
        case "application/xml":
          this.typeBody = constants.TypeBody.XML;
          break;
        default:
          this.typeBody = constants.TypeBody.NONE;
      }
    }
    
    return null;
  }
  public async autoDetectFuzzUrl() {
    // detect path param
    // const potentialPathParam = (await detectPotentialPathParam(this)).filter(removeEmpty);
    // const fuzzingPathParam = this.getFuzzingLocation(FuzzingLocationsAlias.PATH)!;
    // for (const path of potentialPathParam) {
    //   const pathType = detectType(path);
    //   fuzzingPathParam.push({
    //     key: path,
    //     value: path,
    //     type: pathType,
    //     dictionaries: [pathType],
    //   } as fuzzingLocationDetail);
    // }

    // detect queries
    const fuzzingQueries = this.getFuzzingLocation(FuzzingLocationsAlias.QUERY)!;

    const queries = this.startLine.url.searchParams;
    for (const [key, value] of queries.entries()) {
      const queryType = detectType(value);
      fuzzingQueries.push({
        key: key,
        value: value,
        type: queryType,
        dictionaries: [queryType],
      } as fuzzingLocationDetail);
    }
  }

  public autoDetectFuzzBody() {
    // console.log("Fuzz body");
    if (this.hasBody()) {
      if (this.typeBody === constants.TypeBody.JSON) {
        const fuzzingBody = this.getFuzzingLocation(FuzzingLocationsAlias.BODY)!;

        const json = new JsonMutation(this.body);
        const keyValues = json.getKeyValue();

        keyValues.forEach((obj) => {
          if (obj.dictionaries && obj.dictionaries.length > 0) {
            fuzzingBody.push({
              dictionaries: obj.dictionaries as any,
              key: obj.key,
              type: obj.type as any,
              value: obj.value,
            });
          }
        });
      }
    }
    return null;
  }

  public async fuzzingRequest() {
    this.fuzzingUrl();
    await this.fuzzingBody();
  }

  public fuzzingUrl() {}

  public async fuzzingBody() {
    const fuzzingBody = this.getFuzzingLocation(FuzzingLocationsAlias.BODY)!;
    if (fuzzingBody.length !== 0) {
      for (const obj of fuzzingBody) {
        // send request to server
        let values: any[] = [];
        obj.dictionaries.forEach((dic) => {
          values = [...values, ...readFile(`${constants.DICTIONATY_PATH}/${dic}.txt`).split(/\r\n/)];
        });
        values.forEach(async (v) => {
          let newBody = this.body;

          newBody = newBody.replace(obj.value, v);
          const r = makeRequest(this, {
            body: newBody,
          });

          const response = sendRequest(r);
          let res: any = await response;
          let json = await res.json();
          this.httpRequestManager.getHttpLogs().get(this.startLine.url.href)?.push({
            status: res.status,
            body: newBody,
            json: json,
          });

          console.log("fuzzing");
          console.log("---------------");
          console.log({
            status: res.status,
            body: newBody,
            json: json,
          });
        });
      }
    }
  }

  /**
   * Combination of autoDetectFuzzUrl and autoDetectFuzzBody.
   */
  public async autoDetectFuzzLocation() {
    await this.autoDetectFuzzUrl();
    await this.autoDetectFuzzBody();
  }

  public getFuzzingLocation(alias: FuzzingLocationsAlias) {
    if (!this.fuzzingLocations.has(alias) || !this.fuzzingLocations.get(alias)) {
      const initiation: fuzzingLocationDetail[] = [];
      this.fuzzingLocations.set(alias, initiation);
      return initiation;
    }
    return this.fuzzingLocations.get(alias);
  }

  /**Currently always return null */
  private analyzeBody(requestLines: string[]): Error | null {
    const emptyIndex = requestLines.indexOf("");
    if (emptyIndex === -1) {
      return null;
    }
    const bodyLines = requestLines.slice(emptyIndex + 1);
    this.body = bodyLines.join("\n").trim();

    return null;
  }

  public hasBody(): boolean {
    return !!this.body;
  }

  public getStartLine() {
    return { ...this.startLine };
  }

  public getHeaders() {
    return { ...this.headers };
  }

  public getBody() {
    return this.body || null;
  }

  public getTypeBody() {
    return this.typeBody;
  }

  public toString() {
    return `${this.startLine.method}.${this.startLine.url.protocol}${this.startLine.url.host}${this.startLine.url.pathname}.${this.headers["Content-Type"] || ""}.${this.headers["Referer"] || ""}`;
  }

  public headerToString() {
    let string = "";
    for (const header in this.headers) {
      if (this.headers.hasOwnProperty(header)) {
        string += header + ": " + this.headers[header] + "\n";
      }
    }

    return string;
  }
}
