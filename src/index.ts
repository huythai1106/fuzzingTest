import HttpMessageManager from "./httpMessage/HTTPRequestManager"

const httpMessageManager = new HttpMessageManager()
httpMessageManager.setRequestsByFolder("src/fuzzing/resources", "~~~")
httpMessageManager.removeDuplicatedHTTPRequests()
httpMessageManager.view()
console.log(httpMessageManager.getHTTPRequests().length)
