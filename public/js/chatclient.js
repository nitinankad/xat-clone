// Clears the user list and fills it up again when there is a change in users
function resetUserlist(users) {
	var id = "#userlist";

	$(id).empty();

	var userlistHTML = "";

	userlistHTML += '<li><img src="img/GreenPawn.png" class="userlist_pawn"><div class="userlist_my_name">' + me.getName + '</div></li>';

	for (var i = 1; i < users.length; i++) {
		if (users[i].name != "")
			userlistHTML += '<li><img src="img/GreenPawn.png" class="userlist_pawn"><div class="userlist_name">' + users[i].name + '</div></li>';
	}

	$(id).html(userlistHTML);
}

class User {
	constructor(name, avatar) {
		if (!name)
			name = "";

		if (!avatar)
			avatar = "";

		this.name = name;
		this.avatar = avatar;
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
}

var me = new User();

$(function() {
	var socket = io();
	var clients = [];

	socket.emit("init", name);

	function sendMessage() {
		var message = $("textarea").val();

		if ($.trim(message) == "") return false;

		$('<li><div class="message"><div class="user_profile"><img src="' + me.getAvatar + '" class="avatar"/></div><div class="user_message"><div class="message_sender"><img src="img/GreenPawn.png" class="message_pawn">' + me.getName + '</div><div class="message_contents">' + message + '</div></div></div></li>').appendTo($('#chat_history'));

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
		if (usr.name != me.getName && usr.avatar != me.getAvatar) {
			$('<li><div class="message"><div class="user_profile"><img src="' + usr.avatar + '" class="avatar"/></div><div class="user_message"><div class="message_sender"><img src="img/GreenPawn.png" class="message_pawn">' + usr.name + '</div><div class="message_contents">' + msg + '</div></div></div></li>').appendTo($('#chat_history'));

			$(".message_history").scrollTop($(".message_history").prop("scrollHeight"));
		}
	});

	// Get a list of online users and fill up the userlist
	socket.on("clients online", function(online) {
		online.unshift(me);
		clients = online;

		resetUserlist(clients);
	});

	// Server sends back user information if local storage is not set
	socket.on("user data", function(data) {
		me.setName(data.name);
		me.setAvatar(data.avatar);
	});

	socket.on("client joined", function(person) {
		clients.push(person);

		resetUserlist(clients);
	});

	socket.on("client left", function(person) {
		var i = clients.indexOf(person);
		clients.splice(i, 1);

		resetUserlist(clients);
	});

});