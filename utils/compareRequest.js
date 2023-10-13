const compareRequest = (msg1, msg2) => {
    //handle "" in msg array
    let request1 = msg1.split("\r\n");
    while(request1[request1.length - 1] === "") {
      request1.pop();
    }
    if(request1[0] === "") {
      request1.shift();
    }
    
    let request2 = msg2.split("\r\n");
    while(request2[request2.length - 1] === "") {
      request2.pop();
    }
    if(request2[0] === "") {
      request2.shift();
    }
  
    //get url
    let url1 = request1[0].split(" ")[1].split("?")[0].split("#")[0];
    let url2 = request2[0].split(" ")[1].split("?")[0].split("#")[0];
  
    //get method
    let method1 = request1[0].split(" ")[0];
    let method2 = request2[0].split(" ")[0];
  
    //get required field
    let host1 = "";
    let host2 = "";
    let referer1 = "";
    let referer2 = "";
    let contentType1 = "";
    let contentType2 = "";
  
    request1.forEach((line, index) => {
      if(request1[index].split(" ")[0] === "Content-Type:") {
        contentType1 = request1[index].split(" ")[1];
      } else if(request1[index].split(" ")[0] === "host:" ||
                request1[index].split(" ")[0] === "Host:") {
        host1 = request1[index].split(" ")[1];
      } else if(request1[index].split(" ")[0] === "Referer:") {
        referer1 = request1[index].split(" ")[1];
      }
    });
    request2.forEach((line, index) => {
      if(request2[index].split(" ")[0] === "Content-Type:") {
        contentType2 = request2[index].split(" ")[1];
      } else if(request2[index].split(" ")[0] === "host:" ||
                request2[index].split(" ")[0] === "Host:") {
        host2 = request2[index].split(" ")[1];
      } else if(request2[index].split(" ")[0] === "Referer:") {
        referer2 = request2[index].split(" ")[1];
      }
    });


    
    //duplicate checked
    if(method1 !== method2) return false;
    if(url1 !== url2) return false;
    if(host1 !== host2) return false;
    if(referer1 !== referer2) return false;
    if(contentType1 !== contentType2) return false;

    return true;
  }

module.exports = {
  compareRequest,
};