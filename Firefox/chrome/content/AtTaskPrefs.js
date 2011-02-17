var AtTaskPrefs = {
	PREF_GATEWAY: 'extensions.attasknotify.gatewayURL',
	PREF_USERNAME: 'extensions.attasknotify.username',
	PREF_REMEMBER: 'extensions.attasknotify.remember-password',
	PREF_REFRESH_INTERVAL: 'extensions.attasknotify.refresh.interval',
	PREFS_AUTO_LOGIN: 'extensions.attasknotify.auto.login',
	
	prefBranch: null,
	
    getPrefBranch: function() {
        if (!this.prefBranch) {
            this.prefBranch = Components.classes['@mozilla.org/preferences-service;1'].getService();
            this.prefBranch = this.prefBranch.QueryInterface(Components.interfaces.nsIPrefBranch);
        }

        return this.prefBranch;
    },
	
	storePassword: function(username, password) {
		var url = "chrome://attasknotify/";
		
		var passwordManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		
		var passwords = passwordManager.findLogins({},url, null, "at-notifier");
		if (passwords.length > 0) {
		    for (var i = 0; i < passwords.length; i++) {
		        if (passwords[i].username == username) {
		            passwordManager.removeLogin(passwords[i]);
		            break;
		        }
		    }
		}

		var logininfo = Components.classes["@mozilla.org/login-manager/loginInfo;1"].createInstance(Components.interfaces.nsILoginInfo);

		//if password is null, then no password will be stored, and the old one (if any) will be removed.
		if (password) {
		    logininfo.init(url, null, "at-notifier", username, password, "", "");
		    passwordManager.addLogin(logininfo);
		}
	},
	
	retrievePassword: function(username) {
		var url = "chrome://attasknotify/";
		var passwordManager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		var passwords = passwordManager.findLogins({},url, null, "at-notifier");
		if (passwords.length > 0) {
		    for (var i = 0; i < passwords.length; i++) {
		        if (passwords[i].username == username) {
		            return passwords[i].password;
		        }
		    }
		}
		return null;
	},

    setBoolPref: function(aName, aValue) {
        try {
            this.getPrefBranch().setBoolPref(aName, aValue);
        } catch(e) {}
    },

    getBoolPref: function(aName) {
        var rv = null;

        try {
            rv = this.getPrefBranch().getBoolPref(aName);
        } catch(e) {}

        return rv;
    },

    setIntPref: function(aName, aValue) {
        try {
            this.getPrefBranch().setIntPref(aName, aValue);
        } catch(e) {}
    },

    getIntPref: function(aName) {
        var rv = null;

        try {
            rv = this.getPrefBranch().getIntPref(aName);
        } catch(e) {}

        return rv;
    },

    setCharPref: function(aName, aValue) {
        this.getPrefBranch().setCharPref(aName, aValue);
    },

    getCharPref: function(aName) {
        var rv = null;

        try {
            rv = this.getPrefBranch().getCharPref(aName);
        } catch(e) {}

        return rv;
    },

    initPref: function(aPrefName, aPrefType, aDefaultValue) {
        var prefExists;
        switch (aPrefType) {
        	case "bool":
	            prefExists = this.getBoolPref(aPrefName);
	            if (prefExists == null)
	            this.setBoolPref(aPrefName, aDefaultValue);
	            break;

	        case "int":
	            prefExists = this.getIntPref(aPrefName);
	            if (prefExists == null)
	            this.setIntPref(aPrefName, aDefaultValue);
	            break;

	        case "char":
	            prefExists = this.getCharPref(aPrefName);
	            if (prefExists == null)
	            this.setCharPref(aPrefName, aDefaultValue);
	            break;
        }
    },

    clearPref: function(aPrefName) {
        var rv = null;

        try {
            rv = this.getPrefBranch().clearUserPref(aPrefName);
        } catch(e) {}

        return rv;
    }
};