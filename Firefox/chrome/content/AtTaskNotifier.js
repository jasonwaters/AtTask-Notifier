var AtTaskNotifier = {
	_interval: null,
	login_window:null,
	workRequests: null,
	notifications: null,
	initialized: false,
	
	onLoad: function() {
		this.initialized = true;
		this.updateLabelsAndIcons();
		
		//check if a username and password are stored.  If so, auto log in
		var gateway = AtTaskPrefs.getCharPref(AtTaskPrefs.PREF_GATEWAY);
		var username = AtTaskPrefs.getCharPref(AtTaskPrefs.PREF_USERNAME);
		var rememberPassword = AtTaskPrefs.getBoolPref(AtTaskPrefs.PREF_REMEMBER);
		var autoLogin = AtTaskPrefs.getBoolPref(AtTaskPrefs.PREFS_AUTO_LOGIN);
		
		if(autoLogin && gateway != null && gateway.length > 0 && username != null && username.length > 0 && rememberPassword) {
			var password = AtTaskPrefs.retrievePassword(username);
			if(password != null) {
				this.initLogin(gateway, username, password);
			}
		}
		
	},
	login: function(event) {
		// on windows, right click calls this method
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
			this.setLoginStatus("success", "Logged in.");
			this.updateLabelsAndIcons();
			this.refresh();
			this.startUpdateInterval();
		}else{
			this.setLoginStatus("fail", "Unable to log in.");
		}
	},
	
	setLoginStatus: function(status, message) {
		if(this.login_window != null)
			this.login_window.setStatus(status, message);	
	},

	startUpdateInterval: function() {
		if(this._interval)
			this.stopUpdateInterval();
			
		var MINUTE = 60*1000;
		var refreshInterval = AtTaskPrefs.getIntPref(AtTaskPrefs.PREF_REFRESH_INTERVAL);
		this._interval = window.setInterval(this.refresh.bind(this), refreshInterval*MINUTE);
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
		document.getElementById("at-context-menu-workrequests").setAttribute('disabled', !window.AtTaskAPI.isLoggedIn());
		document.getElementById("at-context-menu-notifications").setAttribute('disabled', !window.AtTaskAPI.isLoggedIn());
		
		document.getElementById("at-context-menu-check-now").setAttribute('disabled', !window.AtTaskAPI.isLoggedIn());
		document.getElementById("at-context-menu-logout").setAttribute('disabled', !window.AtTaskAPI.isLoggedIn());
		
		document.getElementById("at-notifier-statusbar").setAttribute("logged-in", window.AtTaskAPI.isLoggedIn());	
		document.getElementById("at-notifier-statusbar").setAttribute('label', this.workRequests != null ? this.workRequests.length : '');
		document.getElementById("at-notifier-statusbar").setAttribute("newNotifications", this.notifications != null && this.notifications.length > 0);
		
		if(window.AtTaskAPI.sessionID == null)
			document.getElementById("at-notifier-statusbar").tooltipText = "Please log in."; //this.getMessage('pleaseLogIn');
		else if(this.notifications != null && this.notifications.length > 0)
			document.getElementById("at-notifier-statusbar").tooltipText = "You have " + this.notifications.length + " new notification" + (this.notifications.length > 1 ? "s." : ".");
		else if(this.workRequests != null)
			document.getElementById("at-notifier-statusbar").tooltipText = "You have " + this.workRequests.length + " Work Request"+ (this.workRequests.length > 1 || this.workRequests.length == 0 ? "s." : ".");
	},
	getLocalizedString: function (aName) {
	  var strbundle=document.getElementById("AtTaskStrings");
	  return strbundle.getString(aName);
	},
	checkNow: function() {
		
		this.refresh();
	},
	loadPrefWindow: function() {
  		window.openDialog("chrome://attasknotify/content/options.xul", "", "centerscreen,chrome,resizable=no,dependent=yes");
	},
	logout: function() {
		if(window.AtTaskAPI.isLoggedIn()) {
			window.AtTaskAPI.logout(function(response, fail) {
				if(response) {
					this.notifications = null;
					this.workRequests = null;
					// this.login();
				}
				this.updateLabelsAndIcons();
			}.bind(this));
		}
	},
	initPopup: function() {
		return true; //return true to make the popup show
	}
};

window.addEventListener("load", function() { AtTaskNotifier.onLoad(); },false);