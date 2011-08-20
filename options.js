function show_message(text) {
	var status = document.getElementById("status");
	status.innerHTML = text;
	setTimeout(function() { status.innerText = ""; }, 750);
}

function save_options() {
	var patterns = document.getElementById("patterns");
	localStorage["patterns"] = patterns.value;
	var looks = document.getElementById("looks");
	localStorage["looks"] = looks.value;
	var use_default = document.getElementById("use-default");
	localStorage["use-default"] = (use_default.checked ? "true" : "false");
	show_message("保存しました。");
}

function refresh() {
	chrome.extension.sendRequest('refresh', function(response) {
		if (response) {
			show_message("読み込みました。");
		} else {
			show_message("読み込みに失敗しました。");
		}
	});
}

function restore_options() {
	var patterns_value = localStorage["patterns"];
	if (patterns_value) {
		var patterns = document.getElementById("patterns");
		patterns.value = patterns_value;
	}
	var looks = document.getElementById("looks");
	looks.value = localStorage["looks"];
	var use_default = document.getElementById("use-default");
	use_default.checked =
		(localStorage["use-default"] == "true" ? true : false);
}
