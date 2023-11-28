import HTTPRequestManager from "src/httpMessage/HTTPRequestManager";
import JsonMutation from "./body/Json";
import FormMutation from "./body/Form";
import * as constants from "./constants";
import detectType, { TYPE_ALIAS } from "../pkg/detection/type";
import { FuzzingLocationsAlias } from "./constants";
import { detectPotentialPathParamBySendRequest } from "../pkg/detection/pathParam";
import { removeEmpty } from "../helpers/utils";
import { elememtObj, makeRequest, sendRequest } from "../helpers";
import { readFile } from "../helpers/file";
import { pattenOfUrl } from "../helpers/utils";
import { PATH } from "../helpers/assert";
import XmlMutation from "./body/Xml";

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
    // const potentialPathParam = (await detectPotentialPathParamBySendRequest(this)).filter(removeEmpty);

    // console.log(potentialPathParam);

    const fuzzingPathParam = this.getFuzzingLocation(FuzzingLocationsAlias.PATH)!;

    let result = pattenOfUrl(this.getStartLine().url, this.httpRequestManager.pattenURL);

    if (result[0] === true) {
      let tokens = (result[1] as string).split("/");
      let tokensUrl = this.getStartLine().url.pathname.slice(1).split("/");
      for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === "FUZZING") {
          const pathType = detectType(tokensUrl[i]);
          fuzzingPathParam.push({
            key: tokensUrl[i],
            value: tokensUrl[i],
            type: pathType,
            dictionaries: [pathType],
          } as fuzzingLocationDetail);
        }
      }
    }

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
    if (this.hasBody()) {
      let keyValues: elememtObj[] = [];
      const fuzzingBody = this.getFuzzingLocation(FuzzingLocationsAlias.BODY)!;
      if (this.typeBody === constants.TypeBody.JSON) {
        keyValues = new JsonMutation(this.body).getKeyValue();
      } else if (this.typeBody === constants.TypeBody.FORM) {
        keyValues = new FormMutation(this.body).getKeyValue();
      } else if (this.typeBody === constants.TypeBody.XML) {
        keyValues = new XmlMutation(this.body).getKeyValue();
      } else {
        // do something
      }
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
    return null;
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

  public makingRequestToFuzz() {
    // make a command line request to fuzz with wfuzz
    // start with wfuzz -c -X METHODNAME -w(wordlist) filepatd -d body -H headerFuzz

    let stringFuzz = `wfuzz -c `;
    let host = this.startLine.url.host;
    let wordlists = "";
    let methodName = `-X ${this.startLine.method} `;
    let index = 0;

    let fuzzLocationPath = this.getFuzzingLocation(FuzzingLocationsAlias.PATH);
    let fuzzLocationQuery = this.getFuzzingLocation(FuzzingLocationsAlias.QUERY);
    let fuzzLocationBody = this.getFuzzingLocation(FuzzingLocationsAlias.BODY);

    if (!fuzzLocationPath?.length && !fuzzLocationQuery?.length && !fuzzLocationBody?.length) {
      return "";
    }

    // path
    let pathname = this.startLine.url.pathname;
    if (fuzzLocationPath?.length) {
      for (let i = 0; i < fuzzLocationPath.length; i++) {
        pathname = pathname.replace(fuzzLocationPath[i].value, `FUZ${index === 0 ? "" : index}Z`);
        wordlists += `-w ${PATH}/${fuzzLocationPath[i].type}.txt `;

        index++;
      }
    }

    // params
    let search = this.startLine.url.search;
    if (fuzzLocationQuery?.length) {
      for (let i = 0; i < fuzzLocationQuery.length; i++) {
        if (fuzzLocationQuery[i].value) {
          search = search.replace(fuzzLocationQuery[i].type === "json" ? encodeURIComponent(fuzzLocationQuery[i].value) : fuzzLocationQuery[i].value, `FUZ${index === 0 ? "" : index}Z`);
          wordlists += `-w ${PATH}/${fuzzLocationQuery[i].type}.txt `;

          index++;
        }
      }
    }

    // body
    let fuzzBody = "";
    if (this.hasBody() && fuzzLocationBody?.length) {
      let body = this.body;

      for (let i = 0; i < fuzzLocationBody.length; i++) {
        body = body.replace(fuzzLocationBody[i].value, `FUZ${index === 0 ? "" : index}Z`);
        wordlists += `-w ${PATH}/${fuzzLocationBody[i].type}.txt `;
        index++;
      }
      fuzzBody = `-d "${body}"`;
    }

    let fullUrl = host + pathname + search;

    stringFuzz += wordlists + methodName + fuzzBody + fullUrl;

    return stringFuzz;
  }
}
