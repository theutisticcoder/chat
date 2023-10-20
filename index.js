const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var users = [];
var logins = [];
var rooms = [];
var joined = 0;
app.use(express.static(__dirname+"/public"))

io.on('connection', (socket) => {
  console.log('a user connected');
	socket.emit("username");
	socket.on("chosen", user => {
		users.push(user);
	});
	socket.on("message", message => {
		for(var x = 0; x< logins.length; x++){
			if(socket.rooms.has(rooms[x])){
				socket.to(rooms[x]).emit("newmessage", {message: message.message, user: message.user});
			}
		}
	});
	socket.on("roommade", (data) => {
		logins.push({room: data.room, password: data.password});
		rooms.push(data.room)
		socket.join(data.room);
	});
	socket.on("joinattempt", (data) => {
		joined = 0;
		for(var i = 0; i < logins.length; i++){
			if(logins[i].room.toString() === data.room.toString() && logins[i].password.toString() === data.password.toString()){
				socket.join(data.room);
				socket.to(data.room).emit("userjoined");	
			}
			else{
				joined++;
			}
		}		

		if(joined > 0){
			socket.emit("unsuccessfuljoin");
		}
	});
  socket.on('disconnect', () => {
    console.log('a user disconnected')
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});