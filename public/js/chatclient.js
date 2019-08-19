// Clears the user list and fills it up again when there is a change in users
function resetUserlist(users) {
	var id = "#userlist";

	$(id).empty();

	var userlistHTML = "";

	userlistHTML += '<li><img src="img/GreenPawn.png" class="userlist_pawn"><div class="userlist_my_name">' + me.name + '</div></li>';

	users.forEach(function(value, key, map) {
		userlistHTML += '<li><img src="img/GreenPawn.png" class="userlist_pawn"><div class="userlist_name" data-id="'+ value.id +'">' + value.name + '</div></li>';

	});

	$(id).html(userlistHTML);
}

var me = null;
var clients = null;

$(function() {
	var socket = io();
	clients = new Map();

	var userinfo = localStorage.getItem("userinfo");

	if (userinfo == null) {
		socket.emit("init", {
			id: "",
			name: "",
			avatar: "",
			regname: ""
		});
	} else {
		var storageData = JSON.parse(userinfo);

		me = {
			id: storageData.id,
			name: storageData.name,
			avatar: storageData.avatar,
			regname: storageData.regname
		};

		socket.emit("init", me);
	}

	function sendMessage() {
		var message = $("textarea").val();

		if ($.trim(message) == "") return false;

		$('<li><div class="message"><div class="user_profile"><img src="' + me.avatar + '" class="avatar"/></div><div class="user_message"><div class="message_sender"><img src="img/GreenPawn.png" class="message_pawn">' + me.name + '</div><div class="message_contents">' + message + '</div></div></div></li>').appendTo($('#chat_history'));

		socket.emit("message", message);

		$('textarea').val(null);

		$(".message_history").scrollTop($(".message_history").prop("scrollHeight"));

	}

	$(window).on('keydown', function(e) {
		if (e.which == 13) {
			sendMessage();
			return false;
		}
	});

	socket.on("message", function(msg, usr) {
		if (usr.name != me.name && usr.avatar != me.avatar) {
			$('<li><div class="message"><div class="user_profile"><img src="' + usr.avatar + '" class="avatar"/></div><div class="user_message"><div class="message_sender"><img src="img/GreenPawn.png" class="message_pawn">' + usr.name + '</div><div class="message_contents">' + msg + '</div></div></div></li>').appendTo($('#chat_history'));

			$(".message_history").scrollTop($(".message_history").prop("scrollHeight"));
		}
	});

	// Get a list of online users and fill up the userlist
	socket.on("clients online", function(online) {
		clients.clear();

		online.forEach(function(data) {
			clients.set(data.id, {
				id: data.id,
				name: data.name,
				avatar: data.avatar,
				regname: data.regname
			});
		});

		resetUserlist(clients);
	});

	// Server sends back user information if local storage is not set
	socket.on("user data", function(data) {
		me = {
			name: data.name,
			avatar: data.avatar,
			id: data.id,
			regname: data.regname
		};

		localStorage.setItem("userinfo", JSON.stringify(me));
	});

	socket.on("client joined", function(person) {
		clients.set(person.id, {
			id: person.id,
			name: person.name,
			avatar: person.avatar,
			regname: person.regname
		});

		resetUserlist(clients);
	});

	socket.on("client left", function(person) {
		clients.delete(person.id);

		resetUserlist(clients);
	});

});