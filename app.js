var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static("public"));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.get('/chat', function(req, res) {
	res.sendFile(__dirname + '/chat.html');
});

http.listen(process.env.PORT || 8000, function() {
	console.log('Listening on port ' +  process.env.PORT);
});

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)]
}

var n1 = "Baby,Booble,Bunker,Cuddle,Cutie,Doodle,Foofie,Gooble,Honey,Kissie,Lover,Lovey,Moofie,Mooglie,Moopie,Moopsie,Nookum,Poochie,Pookie,Schmoopie,Schnoogle,Schnookie,Schnookum,Smooch,Smoochie,Smoosh,Snoogle,Snoogy,Snookie,Snookum,Snuggy,Sweetie,Woogle,Woogy,Wookie,Wookum,Wuddle,Wuggy,Wunny,Bumble,Bump,Dip".split(",");
var n2 = "Boo,Bunch,Bunny,Cake,Cakes,Cute,Darling,Dumpling,Dumplings,Face,Foof,Goo,Head,Kin,Kins,Lips,Love,Mush,Pie,Pook,Pums,Bumble,Bump,Dip".split(",");

function randint(n) {
	return Math.floor(Math.random() * Math.floor(n));
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class User {
	constructor() {
		this.name = "";
		this.id = -1;
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

	setID(id) {
		this.id = id;
	}

	get getID() {
		return this.id;
	}
}

var clients = new Map();

io.on('connection', function(socket) {
	clients.set(socket, new User());

	socket.on('init', function(name) {
		var avatar = "img/avatars/" + randint(1, 1758) + ".png";

		if (name === "") {
			name = n1.random() + "" + n2.random();
		}

		clients.get(socket).setName(name);
		clients.get(socket).setAvatar(avatar);

		socket.emit("user data", {
			name: name,
			k1: "k1value", // Will be used later for authentication
			avatar: avatar
		});

		var online = [];

		// Send a list of online users
		for (let [sock, usr] of clients) {
			if (sock != socket) {
				sock.emit('client joined', clients.get(socket));
				online.push(clients.get(sock));
			}
		}
		online = online.filter(function(e) { return e.name != ""; });

		socket.emit('clients online', online);
	});

	socket.on('message', function(msg) {
		var usrname = clients.get(socket).getName;
		var avi = clients.get(socket).getAvatar;

		io.emit('message', msg, {
			name: usrname,
			avatar: avi
		});
	});

	socket.on('disconnect', function() {
		io.emit('client left', clients.get(socket));

		clients.delete(socket);
	});
});
