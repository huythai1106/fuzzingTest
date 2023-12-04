import path from "path";
import { readFile, readFolder } from "../helpers/file";
import HTTPRequest from "./HTTPRequest";
import PathParamDetection from "../pkg/detection/pathParam";

export default class HTTPRequestManager {
  private httpRequests: HTTPRequest[];
  private httpLogs: Map<string, any[]>;
  public stopFlag: boolean = true;
  public pattenURL: Record<number, string[]> = {};
  public cmdFuzzs: Set<string> = new Set();
  public totalNumberFuzzPath: number = 0;
  public totalNumberFuzzQuery: number = 0;
  public totalNumberFuzzBody: number = 0;

  public constructor() {
    this.httpRequests = [];
    this.httpLogs = new Map();
  }

  public setRequestsByRawString(rawRequests: string, separation: string) {
    const arrayRawRequests = rawRequests.split(separation);

    arrayRawRequests.forEach((request) => {
      request = request.trim();
      if (request) {
        try {
          const httpRequest = new HTTPRequest(request, this);
          this.httpRequests.push(httpRequest);
        } catch (error) {
          console.log(`\x1b[31m[ERROR] \x1b[0m${(error as Error).message}`);
        }
      }
    });

    this.removeDuplicatedHTTPRequests();

    this.pattenURL = PathParamDetection(this.getHTTPRequests());
  }

  public setRequestsByFile(filePath: string, separation: string) {
    const requestsString = readFile(filePath);
    this.setRequestsByRawString(requestsString, separation);
  }

  public setRequestsByFolder(folderPath: string, separation: string) {
    const fileNames = readFolder(folderPath);
    for (const file of fileNames) {
      this.setRequestsByFile(path.join(folderPath, file), separation);
    }
  }

  public removeDuplicatedHTTPRequests() {
    const httpMsgMap = new Map();
    for (const httpMessage of this.httpRequests) {
      if (httpMsgMap.has(httpMessage.toString())) {
        continue;
      }
      httpMsgMap.set(httpMessage.toString(), httpMessage);
    }

    this.httpRequests = [];
    for (const [_, value] of httpMsgMap) {
      this.httpRequests.push(value);
    }
  }

  public async autoDetectFuzzLocation() {
    for (const req of this.httpRequests) {
      await req.autoDetectFuzzLocation();
    }
  }

  public getCmdFuzz() {
    if (this.cmdFuzzs.size !== 0) {
      return this.cmdFuzzs;
    }

    this.httpRequests.forEach((r) => {
      let a = r.makingRequestToFuzz();
      if (!this.cmdFuzzs.has(a)) {
        this.totalNumberFuzzBody += r.numberFuzzBody;
        this.totalNumberFuzzQuery += r.numberFuzzQuery;
        this.totalNumberFuzzPath += r.numberFuzzPath;
      }
      a && this.cmdFuzzs.add(a);
    });

    return this.cmdFuzzs;
  }

  public view() {
    this.httpRequests.forEach((item) => console.log(item.toString()));
  }

  public getHTTPRequests() {
    return [...this.httpRequests];
  }

  public getHttpLogs() {
    return this.httpLogs;
  }
}
