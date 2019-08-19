var express = require("express")
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(express.static("public"));

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

app.get("/chat", function(req, res) {
	res.sendFile(__dirname + "/chat.html");
});

http.listen(process.env.PORT || 8000, function() {
	console.log("Listening on port " +  process.env.PORT);
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

class Users {
	constructor() {
		this.clients = new Map(); 
	}

	addUser(sock, id, name, avatar, regname) {
		if (name == "") return;

		var newUser = {
			id, name, avatar, regname
		}

		this.clients.set(sock, newUser);
	}

	removeUser(sock) {
		this.clients.delete(sock);
	}

	getUser(sock) {
		return this.clients.get(sock);
	}

	getAllUsers() {
		return this.clients;
	}
}

// Client data stored in the format of (socket, {id, name, ...})
var clients = new Users();

io.on("connection", function(socket) {

	socket.on("init", function(data) {
		var id = data.id;
		var name = data.name;
		var avatar = data.avatar;
		var regname = data.regname;

		// Flag to assign data to client
		var sendBackData = false;

		if (name === "" || avatar === "")
			sendBackData = true;

		if (name === "") {
			name = n1.random() + "" + n2.random();
		}

		if (avatar === "") {
			avatar = "img/avatars/" + randint(1, 1758) + ".png";
		}

		if (id === "") {
			id = randint(100000, 99999999);
		}

		if (regname === "") {
			regname = null;
		}

		clients.addUser(socket, id, name, avatar, regname);

		if (sendBackData) {
			socket.emit("user data", {
				id: id,
				name: name,
				avatar: avatar,
				regname: regname
			});
		}
		
		var online = [];

		// Send a list of online users
		for (let [sock, usr] of clients.getAllUsers()) {
			if (sock != socket) {
				var joinedUser = clients.getUser(socket);

				sock.emit("client joined", {
					id: joinedUser.id,
					name: joinedUser.name,
					avatar: joinedUser.avatar,
					regname: joinedUser.regname
				});

				online.push({
					id: usr.id,
					name: usr.name,
					avatar: usr.avatar,
					regname: usr.regname
				});
			}
		}

		socket.emit("clients online", online);
	});

	socket.on("message", function(msg) {
		var data = clients.getUser(socket);

		var displayName = data.name;
		var userID = data.id;
		var avi = data.avatar;

		io.emit("message", msg, {
			name: displayName,
			id: userID,
			avatar: avi
		});
	});

	socket.on("disconnect", function() {
		var disconnectedSocketData = clients.getUser(socket);

		if (disconnectedSocketData == null || disconnectedSocketData == undefined) return;

		io.emit("client left", {
			id: disconnectedSocketData.id
		});

		clients.removeUser(socket);
	});
});
