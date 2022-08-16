class Game {
  constructor(io, room, player, socket) {
    this.status = false;
    this.io = io;
    this.room = room;
    this.player1 = {
      lastTime: null,
      ready: true,
      socket,
      id: player,
      team: this.RandomTeam(),
      seq: this.RandomSeq(),
    };
    this.player2 = null;
    this.gameBoard = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }

  RandomSeq() {
    return Math.floor(Math.random() * 2);
  }

  RandomTeam() {
    return Math.floor(Math.random() * 2) == 0 ? "x" : "o";
  }

  SetPlayer(player, socket) {
    if (this.player2 === null) {
      this.player2 = {
        lastTime: new Date(),
        socket,
        id: player,
        ready: true,
        team: this.player1.team === "x" ? "o" : "x",
        seq: this.player1.seq === 0 ? 1 : 0,
      };
    } else if (this.player1 == null) {
      this.player1 = {
        socket,
        id: player,
        ready: true,
        team: this.player2.team === "x" ? "o" : "x",
        seq: this.player2.seq === 0 ? 1 : 0,
      };
    }
    this.SetTimer();
  }

  SetTimer() {
    this.timer = setInterval(() => {
      if (!this.status) {
        if (
          typeof this.player1 !== "undefined" &&
          typeof this.player2 !== "undefined"
        ) {
          if (this.player1?.seq) {
            if (this.player2?.seq) {
              this.player2.seq = this.player1?.seq;
              this.player2?.socket.emit("seq", this.player2?.seq);
              this.player1.seq = 0;
              this.player1?.socket.emit("seq", this.player1?.seq);
            }
          } else if (this.player2?.seq) {
            if (this.player1?.seq) {
              this.player1.seq = this.player2.seq;
              this.player1?.socket.emit("seq", this.player1?.seq);
              this.player2.seq = 0;
              this.player2?.socket.emit("seq", this.player2?.seq);
            }
          }
        }
      }
    }, 10000);
  }

  GetPlayerTeam(player) {
    if (this.player1.id === player) {
      return this.player1.team;
    } else if (this.player2.id === player) {
      return this.player2.team;
    }
  }

  GetPlayerSeq(player) {
    if (this.player1.id === player) {
      return this.player1.seq;
    } else if (this.player2.id === player) {
      return this.player2.seq;
    }
  }

  GetGameBoard() {
    return this.gameBoard;
  }

  CheckGameBoardCrossEnd() {
    var return_status = this.gameBoard[0][2];
    for (let i = this.gameBoard.length - 1, x = 0; i > 1, x < 2; i--, x++) {
      if (
        this.gameBoard[x][i] === "" ||
        this.gameBoard[x][i] != this.gameBoard[x + 1][i - 1]
      )
        return_status = false;
    }
    return return_status;
  }

  CheckGameBoardCrossStart() {
    var return_status = this.gameBoard[0][0];
    for (let i = 0; i < this.gameBoard.length - 1; i++) {
      if (
        this.gameBoard[i][i] != this.gameBoard[i + 1][i + 1] ||
        this.gameBoard[i][i] === ""
      )
        return_status = false;
    }
    return return_status;
  }

  CheckGameBoardHorizontal() {
    var return_status = false;
    for (let i = 0; i < this.gameBoard.length; i++) {
      if (return_status !== false) break;
      for (let x = 0; x < this.gameBoard[i].length - 1; x++) {
        if (
          this.gameBoard[i][x] !== this.gameBoard[i][x + 1] ||
          this.gameBoard[i][x] === ""
        )
          break;
        if (x === this.gameBoard[i].length - 2) {
          return_status = this.gameBoard[i][x];
          break;
        }
      }
    }
    return return_status;
  }

  CheckGameBoardVertical() {
    var return_status = false;
    for (let i = 0; i < this.gameBoard.length; i++) {
      if (
        this.gameBoard[0][i] !== "" &&
        this.gameBoard[0][i] === this.gameBoard[1][i] &&
        this.gameBoard[2][i] === this.gameBoard[0][i]
      ) {
        return_status = this.gameBoard[0][i];
        break;
      }
    }
    return return_status;
  }

  CheckGameBoardFilled() {
    var return_status = "scoreless";
    for (let i = 0; i < this.gameBoard.length; i++) {
      for (let x = 0; x < this.gameBoard[i].length; x++) {
        if (this.gameBoard[i][x] === "") return_status = false;
      }
    }
    return return_status;
  }

  CheckGameBoard() {
    var check = this.CheckGameBoardCrossEnd();
    if (check !== false) {
      this.player1.ready = false;
      this.player2.ready = false;
      this.status = true;
      this.io.to(this.room).emit("status", { success: true, winner: check });
      return;
    }
    check = this.CheckGameBoardCrossStart();
    if (check !== false) {
      this.player1.ready = false;
      this.player2.ready = false;
      this.status = true;
      this.io.to(this.room).emit("status", { success: true, winner: check });
      return;
    }
    check = this.CheckGameBoardHorizontal();
    if (check !== false) {
      this.player1.ready = false;
      this.player2.ready = false;
      this.status = true;
      this.io.to(this.room).emit("status", { success: true, winner: check });
      return;
    }
    check = this.CheckGameBoardVertical();
    if (check !== false) {
      this.player1.ready = false;
      this.player2.ready = false;
      this.status = true;
      this.io.to(this.room).emit("status", { success: true, winner: check });
      return;
    }
    check = this.CheckGameBoardFilled();
    if (check !== false) {
      this.player1.ready = false;
      this.player2.ready = false;
      this.status = true;
      this.io.to(this.room).emit("status", { success: true, winner: check });
      return;
    }
  }

  GameRestart() {
    if (this.player1?.ready && this.player2?.ready) {
      this.player1.seq = this.RandomSeq();
      this.player1.team = this.RandomTeam();
      this.player2.seq = this.player1.seq === 0 ? 1 : 0;
      this.player2.team = this.player1.team === "x" ? "o" : "x";
      this.status = false;
      this.gameBoard = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ];
      this.io.to(this.room).emit("restart", { success: true });
    }
  }

  PlayerReady(player) {
    if (this.player1.id === player) {
      this.player1.ready = true;
    } else if (this.player2.id === player) {
      this.player2.ready = true;
    }
    this.GameRestart();
  }

  UpdateSeq() {
    if (this.player1.seq) {
      this.player2.seq = this.player1.seq;
      this.player2.socket.emit("seq", this.player2.seq);
      this.player1.seq = 0;
      this.player1.socket.emit("seq", this.player1.seq);
    } else if (this.player2.seq) {
      this.player1.seq = this.player2.seq;
      this.player1.socket.emit("seq", this.player1.seq);
      this.player2.seq = 0;
      this.player2.socket.emit("seq", this.player2.seq);
    }
  }

  ClickBox(player, row, index) {
    if (this.status === false) {
      if (this.gameBoard[row][index] !== "") return { success: false };
      if (this.player1.id === player) {
        if (this.player1.seq === 1) {
          this.gameBoard[row][index] = this.player1.team;
          /** Update Seq */
          this.UpdateSeq();
          clearInterval(this.timer);
          this.SetTimer();
          /** Update Seq End */
          this.CheckGameBoard();
          return { success: true, gameBoard: this.gameBoard };
        }
      } else if (this.player2.id === player) {
        if (this.player2.seq === 1) {
          this.gameBoard[row][index] = this.player2.team;
          /** Update Seq */
          this.UpdateSeq();
          clearInterval(this.timer);
          this.SetTimer();
          /** Update Seq End */
          this.CheckGameBoard();
          return { success: true, gameBoard: this.gameBoard };
        }
      }
      return { success: false, response: "It's not your turn" };
    }
    return { success: false, response: "Game finished" };
  }

  PlayerDisconnect(player) {
    if (this.player1?.id === player) {
      this.player1 = null;
    } else if (this.player2?.id === player) {
      this.player2 = null;
    }
    this.status = false;
    this.gameBoard = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    const rooms = this.io.sockets.adapter.rooms;
    const clientRoom = rooms.get(this.room);
    this.io.to(this.room).emit("count", { count: clientRoom.size });
  }
}

module.exports = Game;
