function generateRoomId() {
  var result = "";
  const length = 16;
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-@";

  for (var i = 0; i < length; i++)
    result += possible.charAt(Math.floor(Math.random() * possible.length));

  return result;
}
module.exports = generateRoomId;
