require('dotenv').config()
const app = require("express")();
const http = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: process.env.CLIENT_URL,
});

const port = process.env.PORT || 3000;
require("./middleware/middleware")(app);

app.get("/", (req, res) => {
  res.send("Hi Fimple! (:");
});

require("./game/socketGame")(io);

http.listen(port, () => {
  console.log(`Socket listening on port ${port}`);
});
