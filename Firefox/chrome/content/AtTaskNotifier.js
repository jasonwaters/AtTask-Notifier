var AtTaskNotifier = {
	_interval: null,
	login_window:null,
	workRequests: null,
	notifications: null,
	initialized: false,
	
	onLoad: function() {
		this.initialized = true;
		this.updateLabelsAndIcons();
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
		window.AtTaskAPI.login(username, password, this.onLoginResult.bind(this));
	},

	onLoginResult: function(response, fail) {
		if(response) {
			this.login_window.setStatus("success");
			this.updateLabelsAndIcons();
			this.refresh();
			this.startUpdateInterval();
		}else{
			alert("error! " + fail);
		}
	},

	startUpdateInterval: function() {
		if(this._interval)
			this.stopUpdateInterval();
			
		var MINUTE = 60*1000;
		this._interval = window.setInterval(this.refresh.bind(this), 0.5*MINUTE);
	},
	
	stopUpdateInterval: function() {
		if(this._interval)
			window.clearInterval(this._interval);
	},

	refresh: function() {
		this.fetchUserNotifications();
		this.fetchWorkRequests();
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

		this.startUpdateInterval(); //reset the updateInterval
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
		document.getElementById("at-notifier-statusbar").setAttribute("logged-in", window.AtTaskAPI.sessionID != null);	
		document.getElementById("at-notifier-statusbar").setAttribute('label', this.workRequests != null && this.workRequests.length>0 ? this.workRequests.length : '');
		document.getElementById("at-notifier-statusbar").setAttribute("newNotifications", this.notifications != null && this.notifications.length > 0);
		
		if(window.AtTaskAPI.sessionID == null)
			document.getElementById("at-notifier-statusbar").tooltipText = "Please log in."; //this.getMessage('pleaseLogIn');
		else if(this.notifications != null && this.notifications.length > 0)
			document.getElementById("at-notifier-statusbar").tooltipText = "You have " + this.notifications.length + " new notifications.";
		else if(this.workRequests != null && this.workRequests.length > 0)
			document.getElementById("at-notifier-statusbar").tooltipText = "You have " + this.workRequests.length + " Work Requests.";
	},
	getLocalizedString: function (aName) {
	  var strbundle=document.getElementById("AtTaskStrings");
	  return strbundle.getString(aName);
	}
};

window.addEventListener("load", function() { AtTaskNotifier.onLoad(); },false);