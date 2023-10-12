const { exec } = require("child_process");
const fs = require("fs");

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
