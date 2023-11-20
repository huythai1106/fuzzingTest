import Fuzzer from "./fuzzing";
import HttpMessageManager from "./httpMessage/HTTPRequestManager"
import { FuzzingLocationsAlias } from "./httpMessage/constants";

const httpMessageManager = new HttpMessageManager()
httpMessageManager.setRequestsByFile("src/fuzzing/resources/rawRequests.txt", '~~~')
httpMessageManager.removeDuplicatedHTTPRequests();

// const fuzz = new Fuzzer()
// fuzz.setHTTPRequestManager(httpMessageManager)
// fuzz.autoDetectFuzzLocation().then(() => {
//     for (const req of httpMessageManager.getHTTPRequests()) {
//         console.log(req.getStartLine().method, req.getStartLine().url.pathname)
//         // console.log("PATH => ",req.getFuzzingLocation(FuzzingLocationsAlias.PATH));
//         // console.log("QUERY => ",req.getFuzzingLocation(FuzzingLocationsAlias.QUERY));
//         // console.log("--------")
//     }
// }).catch(console.log)


import PathParamDetection from "./pkg/detection/pathParam";

PathParamDetection(httpMessageManager.getHTTPRequests())
