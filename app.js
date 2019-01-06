var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/chat', function(req, res) {
	res.sendFile(__dirname + '/chat.html');
});

http.listen(8000, function() {
	console.log('Listening on port 8000');
});

function randint(n) {
	return Math.floor(Math.random() * Math.floor(n));
}

class User {
	constructor() {
		this.name = "";
		this.id = "#"+randint(10)+""+randint(10)+""+randint(10)+""+randint(10);
		this.avatar = "";
	}

	setName(name) {
		this.name = name;
	}

	get getName() {
		return this.name;
	}

	setAvatar(url) {
		this.avatar = url;
	}

	get getAvatar() {
		return this.avatar;
	}

	setExistingID(id) {
		this.id = id;
	}

	get getID() {
		return this.id;
	}
}

// var clients = [];
var clients = new Map();

io.on('connection', function(socket){
	//io.emit('chat message', 'New connection');
	// clients.push(socket);
	clients.set(socket, new User());

	socket.on('init', function(name) {
		
		clients.get(socket).setName(name);

		// io.emit('client joined', clients.get(socket).getName)

		var online = [];
		// send a list of online users
		for (let [sock, usr] of clients) {
			if (sock != socket) {
				sock.emit('client joined', clients.get(socket));
				online.push(clients.get(sock));
			}
		}
		online = online.filter(function(e) { return e; });

		socket.emit('clients online', online);
	});

	socket.on('message', function(msg){
		io.emit('message', msg, clients.get(socket).getName);
	});

	socket.on('disconnect', function() {
		io.emit('client left', clients.get(socket));

		clients.delete(socket);
		// var i = clients.indexOf(socket);
		// clients.splice(i, 1);
	});
});
