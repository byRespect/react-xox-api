const cors = require("cors");
module.exports = function (app) {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      optionsSuccessStatus: 200,
    })
  );
};
