import { FuzzingLocationsAlias } from "./httpMessage/constants";
import Fuzzer from "./fuzzing";
import HttpMessageManager from "./httpMessage/HTTPRequestManager";

const httpMessageManager = new HttpMessageManager();
httpMessageManager.setRequestsByFile("src/fuzzing/resources/rawRequests.txt", "~~~");
httpMessageManager.removeDuplicatedHTTPRequests();
// httpMessageManager.view();

const fuzz = new Fuzzer();
fuzz.setHTTPRequestManager(httpMessageManager);
fuzz
  .autoDetectFuzzLocation()
  .then(() => {
    for (const req of httpMessageManager.getHTTPRequests()) {
      // console.log(req.getStartLine().url.href);
      // console.log(req.getFuzzingLocation(FuzzingLocationsAlias.QUERY));
      // console.log(req.getFuzzingLocation(FuzzingLocationsAlias.BODY));
      // console.log("--------");
    }
    fuzz.startFuzzAttack();
  })
  .then(() => {
    // console.log(httpMessageManager.getHttpLogs());
    console.log("finished");
  })
  .catch(console.log);
