const { createServer } = require("node:http");
const hostname = "127.0.0.1";
const port = 3001;
const fs = require("fs");

const server = createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  console.log(req.method)
  if (req.method == "GET") {
    console.log(fs.readFileSync("./registros.json").toString())
    res.end(
      JSON.stringify({
        message: fs.readFileSync("./registros.json").toString(),
      })
    );
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString(); // Convert Buffer to string
  });

  req.on("end", () => {
    fs.writeFileSync("./registros.json", body);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Hello World", receivedBody: body }));
  });
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});



