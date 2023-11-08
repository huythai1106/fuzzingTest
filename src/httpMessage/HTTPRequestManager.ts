import path from "path";
import { readFile, readFolder } from "../helpers/file";
import HTTPRequest from "./HTTPRequest";

export default class HTTPRequestManager {
  private httpRequests: HTTPRequest[];
  private httpLogs: Map<string, any[]>;
  public stopFlag: boolean = true;

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

  public async startFuzzing() {
    for (const req of this.httpRequests) {
      await req.fuzzingRequest();
    }
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
