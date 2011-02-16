Function.prototype.bind = function(obj) {
    var method = this,
    temp = function() {
        return method.apply(obj, arguments);
    };
    return temp;
};

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
	
		var method = params == null || params.length == 0 ? "GET" : "POST";

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
	workRequests: null,
	notifications: null,
	
	onLoad: function() {
    	this.initialized = true;
    	this.strings = document.getElementById("attasknotify-strings");
	},
	login: function(event) {
	    if (event && event.button == 2) {
	        return;
	    }

		if(window.AtTaskAPI.isLoggedIn()) {
			if(this.notifications && this.notifications.length > 0)
				this.visitNotificationsURL();
			else
				this.visitWorkRequestsURL();
		}else {
			this.openLoginWindow();
		}
	},
	initLogin: function(aGateway, username, password) {
		window.AtTaskAPI.init(aGateway);
		window.AtTaskAPI.login(username, password, function(response, fail) {
			window.AtTaskAPI.get("user", response.userID, null, function(response, fail) {
				if(response) {
					window.AtTaskNotifier.login_window.setStatus("success");
					window.AtTaskNotifier.updateLabelsAndIcons();
				}else{
					alert("error! " + fail);
				}
			});
			window.AtTaskNotifier.fetchUserNotifications();
			window.AtTaskNotifier.fetchWorkRequests();
		});
	},

	openLoginWindow: function() {
    	this.login_window = window.openDialog("chrome://attasknotify/content/at-login.xul", "_blank", "chrome,resizable=yes,dependent=yes");
	},
	
	visitNotificationsURL: function() {
		var url = window.AtTaskAPI.gateway + "/userMessages.cmd?jsessionid="+window.AtTaskAPI.sessionID+"&ID="+window.AtTaskAPI.userID;
		this.loadURL(url);
		
		this.notifications = null;
		this.updateLabelsAndIcons();
	},
	
	visitWorkRequestsURL: function() {
		//http://localhost:8080/attask/teamHome.cmd;jsessionid=ED6E098F9434B089AD3CFE17FB48EE32#/home/workRequests
		var url = window.AtTaskAPI.gateway + "/teamHome.cmd?jsessionid="+window.AtTaskAPI.sessionID+"#/home/workRequests";
		this.loadURL(url);
	},

	loadURL: function(url) {
		var host = "", path ="";

		try {
			host = browser.currentURI.host;
			path = browser.currentURI.path;
		} catch (e){}
		//TODO: check if the user is already at the gateway url, if so open within that tab.
		
		
		if (getBrowser().mCurrentBrowser.currentURI.spec == "about:blank") {
			// if the current tab is empty, use it
			getBrowser().loadURI(url);
		} else{
			var myTab = getBrowser().addTab(url, null, null);
			getBrowser().selectedTab = myTab;
		}
	},
	
	fetchUserNotifications: function() {
		//http://localhost:8080/attask/api/notifications/myUnreadNotifications?fields=*,note:*
		window.AtTaskAPI.get("notifications", "myUnreadNotifications", null, this.onUserNotificationsReceived.bind(this));
	},
	
	onUserNotificationsReceived: function(response, fail) {
		if(response) {
			this.notifications = response;
			this.updateLabelsAndIcons();
		}
	},
	
	fetchWorkRequests: function() {
		//http://localhost:8080/attask/api/work/workRequests
		window.AtTaskAPI.get("work", "workRequests",null, this.onWorkRequestsReceived.bind(this));
	},
	onWorkRequestsReceived: function(response, fail) {
		if(response) {
			this.workRequests = response;
			this.updateLabelsAndIcons();
		}
	},
	updateLabelsAndIcons: function() {
		document.getElementById("at-notifier-statusbar").setAttribute("logged-in", window.AtTaskAPI.sessionID);	
		document.getElementById("at-notifier-statusbar").setAttribute('label', this.workRequests && this.workRequests.length>0 ? this.workRequests.length : 0);
		document.getElementById("at-notifier-statusbar").setAttribute("newNotifications", this.notifications && this.notifications.length > 0);
	}
};

window.addEventListener("load", function() { AtTaskNotifier.onLoad(); },false);