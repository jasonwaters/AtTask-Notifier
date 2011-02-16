function attaskApi(aGateway) {
	this.gateway = aGateway;
	this.sessionID = null;
	this.userID = null;
}

attaskApi.prototype.isLoggedIn = function() {
	return this.sessionID != null;
};

attaskApi.prototype.login = function(username, password, callback) {
	this.request("/login", "username="+username+"&password="+password, function(response, fail) {
		if(response != null) {
			this.sessionID = response.sessionID;
			this.userID = response.userID;
		}
		callback(response, fail);
	});
	
};

attaskApi.prototype.get = function(objCode, objID, params, callback) {
	this.request("/"+objCode+"/"+objID, params, callback);
};

attaskApi.prototype.request = function(path, params, callback) {
	var req = new XMLHttpRequest();
	
	var method = params == null || params.length ==0 ? "GET" : "POST";
	
	req.open(method, this.gateway + '/api'+path, true);
	req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	req.onload = function(evt) {
		var response = JSON.parse(evt.target.responseText).data;
		callback(response);
	};
	
	req.onerror = function(evt) {
		callback(null, evt.target.status);
	};

	req.send(method == "POST" ? params : null);
};



function attasknotify() {
	this.login_window = null;
	this.sessionID = null;
	this.userID = null;
	this.API = null;
}

attasknotify.prototype.onLoad = function() {
    this.initialized = true;
    this.strings = document.getElementById("attasknotify-strings");
};


attasknotify.prototype.login = function(event) {
    if (event && event.button == 2) {
        return;
    }

	if(this.API && this.API.isLoggedIn()) {
		dump('logged in');
	}else {
		this.openLoginWindow();
	}
};

attasknotify.prototype.initLogin = function(gateway, username, password) {
	this.API = new attaskApi(gateway);
	this.API.login(username, password, function(response, fail) {
		window.AtTaskNotifier.API.get("user", response.userID, "", function(response, fail) {
			if(response) {
				window.AtTaskNotifier.login_window.setStatus("success");
				document.getElementById("at-notifier-statusbar").setAttribute("logged-in", true);
				document.getElementById("at-notifier-statusbar").setAttribute('label', response.name);
			}else{
				alert("error! " + fail);
			}
		});
	});
};

attasknotify.prototype.openLoginWindow = function() {
    this.login_window = window.openDialog("chrome://attasknotify/content/at-login.xul", "_blank", "chrome,resizable=yes,dependent=yes");
};

var AtTaskNotifier = new attasknotify();

window.addEventListener("load", function() { AtTaskNotifier.onLoad(); },false);