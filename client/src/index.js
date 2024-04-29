const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Novi korisnik povezan');

  socket.on('moveMade', (move) => {
    socket.broadcast.emit('moveMade', move);
  });

  socket.on('disconnect', () => {
    console.log('Korisnik odspojen');
  });
});

server.listen(3000, () => {
  console.log('Server je pokrenut na portu 3000');
});
