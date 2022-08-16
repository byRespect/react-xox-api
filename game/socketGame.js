const Game = require("./game");
const gameArray = [];
module.exports = function (io) {
  io.of("/").adapter.on("leave-room", (room, id) => {
    if (io.sockets.adapter.rooms.get(room).size === 0) {
      var index = gameArray.indexOf(room);
      if (index > -1) {
        gameArray.splice(index, 1);
      }
    } else {
      gameArray[room]?.PlayerDisconnect(id);
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", (invite) => {
      const rooms = io.sockets.adapter.rooms;
      const room = rooms.get(invite);

      if (typeof room === "undefined") {
        socket.emit("join", {
          success: false,
          response: "Room invalid.",
        });
      } else if (room.size > 0 && room.size < 2) {
        gameArray[invite]?.SetPlayer(socket.id, socket);
        socket.join(invite);
        socket.emit("join", {
          team: gameArray[invite]?.GetPlayerTeam(socket.id),
          seq: gameArray[invite]?.GetPlayerSeq(socket.id),
          success: true,
          invite: invite,
          response: "Joined successfuly.",
        });
      } else {
        socket.emit("join", {
          success: false,
          response: "Room is full.",
        });
      }
    });

    socket.on("count", ({ room }) => {
      const rooms = io.sockets.adapter.rooms;
      const clientRoom = rooms.get(room);
      if (typeof clientRoom !== "undefined") {
        io.to(room).emit("count", { count: clientRoom.size });
      }
    });

    socket.on("create", () => {
      const roomId = require("./utils")();
      gameArray[roomId] = new Game(io, roomId, socket.id, socket);
      socket.join(roomId);
      socket.emit("create", {
        team: gameArray[roomId].GetPlayerTeam(socket.id),
        success: true,
        roomId,
        seq: gameArray[roomId].GetPlayerSeq(socket.id),
        response: "Room successfully created.",
      });
    });

    socket.on("click", ({ room, row, index }) => {
      if (typeof gameArray[room] !== "undefined") {
        io.to(room).emit(
          "click",
          gameArray[room].ClickBox(socket.id, row, index)
        );
        socket.emit("seq", gameArray[room].GetPlayerSeq(socket.id));
      } else {
        socket.emit("click", { success: false });
      }
    });

    socket.on("info", (room) => {
      socket.emit("info", {
        team: gameArray[room].GetPlayerTeam(socket.id),
        seq: gameArray[room].GetPlayerSeq(socket.id),
        gameBoard: gameArray[room].GetGameBoard(),
      });
    });

    socket.on("ready", (room) => {
      gameArray[room]?.PlayerReady(socket.id);
    });

    socket.on("disconnect", () => {
      //console.log("A user disconnected");
    });
  });
};
