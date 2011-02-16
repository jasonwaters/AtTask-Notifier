var AtTaskAPI = {
	sessionID: null,
	userID: null,
	init: function(aGateway) {
		this.gateway = aGateway;
	},
	isLoggedIn: function() {
		return this.sessionID != null;
	},
	login: function(username, password, callback) {
		this.request("/login", "username="+username+"&password="+password, function(response, fail) {
			if(response != null) {
				window.AtTaskAPI.sessionID = response.sessionID;
				window.AtTaskAPI.userID = response.userID;
			}
			callback(response, fail);
		});
	},
	get: function(objCode, objID, params, callback) {
		this.request("/"+objCode+"/"+objID, params, callback);
	},
	request: function(path, params, callback) {
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
	}
};

var AtTaskNotifier = {
	login_window:null,
	sessionID:null,
	userID:null,
	onLoad: function() {
    	this.initialized = true;
    	this.strings = document.getElementById("attasknotify-strings");
	},
	login: function(event) {
	    if (event && event.button == 2) {
	        return;
	    }

		if(window.AtTaskAPI.isLoggedIn()) {
			dump('logged in');
		}else {
			this.openLoginWindow();
		}
	},
	initLogin: function(gateway, username, password) {
		window.AtTaskAPI.init(gateway);
		window.AtTaskAPI.login(username, password, function(response, fail) {
			window.AtTaskAPI.get("user", response.userID, "", function(response, fail) {
				if(response) {
					window.AtTaskNotifier.login_window.setStatus("success");
					document.getElementById("at-notifier-statusbar").setAttribute("logged-in", true);
					document.getElementById("at-notifier-statusbar").setAttribute('label', response.name);
				}else{
					alert("error! " + fail);
				}
			});
		});
	},
	openLoginWindow: function() {
    	this.login_window = window.openDialog("chrome://attasknotify/content/at-login.xul", "_blank", "chrome,resizable=yes,dependent=yes");
	}
};

window.addEventListener("load", function() { AtTaskNotifier.onLoad(); },false);