"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arguments = void 0;
var Arguments = /** @class */ (function () {
    function Arguments(discrimitator, defaultValue, cmd) {
        this.value = defaultValue;
        if (cmd.length > 0) {
            var indexOfArgument = cmd.indexOf(discrimitator);
            if (indexOfArgument > -1) {
                var inputValue = cmd[indexOfArgument + 1];
                switch (typeof (defaultValue)) {
                    case "number":
                        this.value = parseInt(inputValue);
                    case "string":
                        this.value = parseInt(inputValue);
                }
            }
        }
    }
    return Arguments;
}());
exports.Arguments = Arguments;
// exports.getArguments =function getArguments(){
//     const myArgs = process.argv.slice(2);
//     var indexOfPort = myArgs.indexOf("-p") != -1 ? myArgs.indexOf("-p") + 1 : null;
//     var indexOfPortsToConnect = myArgs.indexOf("-o") != -1 ? myArgs.indexOf("-o") + 1 : null;
//     var port = 8080;
//     var broadCast = [];
//     if((indexOfPort != null && !isNaN(myArgs[indexOfPort])))
//         port = myArgs[indexOfPort];
//     else if (indexOfPort != null){
//         console.error(`Invalid argument '-p' ${myArgs[indexOfPort]}.`);
//         process.exit();
//     }
//     if((indexOfPortsToConnect != null && !Array.isArray(myArgs[indexOfPortsToConnect]))){
//         broadCast = JSON.parse(myArgs[indexOfPortsToConnect].split(','));
//     }
//     else if (indexOfPortsToConnect != null){
//         console.error(`Invalid argument '-o' ${myArgs[indexOfPortsToConnect]}.`);
//         process.exit();
//     }
//     console.log(`Node is running on port ${port} connecting with: [${broadCast}]`);
//     return new Arguments({port:port,broadCast:broadCast});
// }
