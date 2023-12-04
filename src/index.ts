import Fuzzer from "./fuzzing";
import HttpMessageManager from "./httpMessage/HTTPRequestManager";
import { FuzzingLocationsAlias } from "./httpMessage/constants";
import executeCommands from "./script";
const httpMessageManager = new HttpMessageManager();
httpMessageManager.setRequestsByFile("src/fuzzing/resources/rawRequests.txt", "~~~");

const fuzz = new Fuzzer();
fuzz.setHTTPRequestManager(httpMessageManager);
fuzz.autoDetectFuzzLocation().then(() => {
  // executeCommands(httpMessageManager.getCmdFuzz());
  httpMessageManager.getHTTPRequests().forEach((request) => {
    console.log(request.getStartLine().url.href);
    // console.log("HEADERS: ");
    // console.log(request.getHeaders());
    console.log("PATH: ");
    console.log(request.getFuzzingLocation(FuzzingLocationsAlias.PATH));
    console.log("QUERY: ");
    console.log(request.getFuzzingLocation(FuzzingLocationsAlias.QUERY));
    console.log("BODY: ");
    console.log(request.getFuzzingLocation(FuzzingLocationsAlias.BODY));
    // console.log(request.getStartLine().url.hostname);
  });

  console.log(httpMessageManager.getCmdFuzz());
  // console.log(httpMessageManager.totalNumberFuzzPath);
  // console.log(httpMessageManager.totalNumberFuzzQuery);
  // console.log(httpMessageManager.totalNumberFuzzBody);
});
