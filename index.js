const process = require("process");
const { handleProcess } = require("./src/preProcessHeader");

const main = () => {
  var args = process.argv;
  console.log("number of arguments is " + args.length);

  args.forEach((val, index) => {
    console.log(`${index}: ${val}`);
  });

  if (args.length <= 2) {
    console.log("Need a arguments");
    return;
  }
  if (args[2].includes(".")) {
    console.log("Need a folder");
    return;
  }

  handleProcess(args[2]);
};

main();
