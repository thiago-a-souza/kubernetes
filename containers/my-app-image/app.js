const http = require('http');
const os = require('os');

console.log("starting server");

var handler = function(request, response) {
  response.writeHead(200);
  response.end("V1.0 => OS: " + os.hostname() + "\n");
};

var www = http.createServer(handler);
www.listen(8081);
