import HTTPRequest from "src/httpMessage/HTTPRequest";
import HTTPRequestManager from "src/httpMessage/HTTPRequestManager";
import HTTPResponseManager from "src/httpMessage/HTTPResponseManager";

export default class Fuzzer {
  private httpRequestManager?: HTTPRequestManager;
  private httpResponseManager?: HTTPResponseManager;

  public constructor() {}

  public setHTTPRequestManager(httpRequestManager: HTTPRequestManager) {
    this.httpRequestManager = httpRequestManager;
  }

  public setHTTPResponseManager(httpResponseManager: HTTPResponseManager) {
    this.httpResponseManager = httpResponseManager;
  }

  /**
   * Auto detect which is used to fuzz.
   */
  public async autoDetectFuzzLocation() {
    if (!this.httpRequestManager || this.httpRequestManager.getHTTPRequests().length === 0) {
      throw new Error("You do not set any requests yet.");
    }

    await this.httpRequestManager.autoDetectFuzzLocation();
  }

  public async startFuzzAttack() {
    console.log("Starting fuzz attack");
    console.log("--------------------------------");
  }
}
