import Fuzzer from "./fuzzing";
import HttpMessageManager from "./httpMessage/HTTPRequestManager";

const httpMessageManager = new HttpMessageManager();
httpMessageManager.setRequestsByFile(
  "src/fuzzing/resources/rawRequests.txt",
  "~~~"
);
httpMessageManager.removeDuplicatedHTTPRequests();
httpMessageManager.view();

const fuzz = new Fuzzer();
fuzz.setHTTPRequestManager(httpMessageManager);
fuzz
  .autoDetectFuzzLocation()
  .then(() => {
    for (const req of httpMessageManager.getHTTPRequests()) {
      console.log(req.getStartLine().url.href);
      console.log("--------");
    }
  })
  .catch(console.log);
