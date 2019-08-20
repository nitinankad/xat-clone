var modal = document.querySelector(".modal");
var closeButton = document.querySelector(".close-button");

function toggleModal() {
	modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
	if (event.target === modal) {
		toggleModal();
	}
}

function hasClass(elem, className) {
	return elem.className.split(" ").indexOf(className) > -1;
}

function displayMyModal() {
	$(".dialogDisplayName").text(me.name);

	$("#dialogAvatar").attr("src", me.avatar);

	if (me.regname == null) {
		$(".dialogTitle").text(me.id);

	} else {
		$(".dialogTitle").text(me.regname + " ("+me.id+")");

	}

	toggleModal();
}

function displayUserModal(targetData) {
	$(".dialogDisplayName").text(targetData.name);

	$("#dialogAvatar").attr("src", targetData.avatar);

	if (targetData.regname == null) {
		$(".dialogTitle").text(targetData.id);

	} else {
		$(".dialogTitle").text(targetData.regname + " ("+targetData.id+")");

	}

	toggleModal();
}

document.addEventListener("click", function (e) {
	if (hasClass(e.target, "userlist_name")) {
		var targetID = parseInt(e.target.getAttribute("data-id"));
		var targetData = clients.get(targetID);

		// Change the modal contents
		displayUserModal(targetData);


	} else if (hasClass(e.target, "userlist_my_name")) {
		displayMyModal();

	} else if (hasClass(e.target, "message_sender")) {
		// Handles names that appear in the chat history
		var targetID = parseInt(e.target.getAttribute("data-id"));
		var targetData = clients.get(targetID);

		if (targetID == me.id) {
			displayMyModal();

		} else {
			displayUserModal(targetData);
		
		}
	}

}, false);

closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);

