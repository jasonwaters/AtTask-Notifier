var AtTaskAPI = {
	sessionID: null,
	userID: null,
	init: function(aGateway) {
		this.gateway = aGateway;
		this.sessionID = null;
		this.userID = null;
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
	
	logout: function(callback) {
		if(this.sessionID) {
			this.request("/logout", "sessionID="+this.sessionID, function(response, fail) {
				if(response != null) {
					window.AtTaskAPI.sessionID = null;
					window.AtTaskAPI.userID = null;
				}
				callback(response,fail);
			});
		}
	},
	
	get: function(objCode, objID, params, callback) {
		this.request("/"+objCode+"/"+objID, params, callback);
	},
	request: function(path, params, callback) {
		var req = new XMLHttpRequest();
	
		var method = params == null || params.length == 0 ? "GET" : "POST";

		req.open(method, this.gateway + '/api-internal'+path, true);
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