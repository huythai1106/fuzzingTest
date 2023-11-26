import Fuzzer from "./fuzzing";
import HttpMessageManager from "./httpMessage/HTTPRequestManager";
import executeCommands from "./script";

const httpMessageManager = new HttpMessageManager();
httpMessageManager.setRequestsByFile("src/fuzzing/resources/rawRequests.txt", "~~~");

const fuzz = new Fuzzer();
fuzz.setHTTPRequestManager(httpMessageManager);
fuzz.autoDetectFuzzLocation().then(() => {
  console.log(httpMessageManager.getCmdFuzz());
  executeCommands(httpMessageManager.getCmdFuzz());

  // httpMessageManager.getHTTPRequests().forEach((request) => {
  //   // console.log(request.getStartLine().url.href);
  //   // console.log("PATH");
  //   // console.log("______________________");
  //   // console.log(request.getFuzzingLocation(FuzzingLocationsAlias.PATH));
  //   // console.log("QUERY");
  //   // console.log("______________________");
  //   // console.log(request.getFuzzingLocation(FuzzingLocationsAlias.QUERY));
  //   // console.log("BODY");
  //   // console.log("______________________");
  //   // console.log(request.getFuzzingLocation(FuzzingLocationsAlias.BODY));
  //   // console.log(request.getStartLine().url.hostname);
  // });
});
