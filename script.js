const { exec } = require("child_process");
const fs = require("fs");

const string = `GET https://courses.uet.vnu.edu.vn/FUZZ1/yui_combo.php?rollup/FUZZ1/FUZZ1 HTTP/1.1
host: courses.uet.vnu.edu.vn
Connection: keep-alive
sec-ch-ua: "Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"
sec-ch-ua-mobile: ?0
User-Agent: FUZZ6
sec-ch-ua-platform: "Windows"
Accept: text/css,*/*;q=0.1
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: no-cors
Sec-Fetch-Dest: style
Referer: FUZZ6
Accept-Language: en-US,en;q=0.9
Cookie: MoodleSession=m77osp872meih1t0l7cacilt3t`;

const runScript = "node index.js raw";

exec(runScript, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
