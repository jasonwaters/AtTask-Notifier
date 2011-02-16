var AtTaskPrefs = {

    PREF_UPDATE_INTERVAL: "at-notify.update.interval",
    PREF_REMEMBER_PASSWORD: "at-notify.remember.password",
    PREF_AUTOLOGIN_ENABLED: true,

    getPrefBranch: function() {
        if (!this.prefBranch) {
            this.prefBranch = Components.classes['@mozilla.org/preferences-service;1'].getService();
            this.prefBranch = this.prefBranch.QueryInterface(Components.interfaces.nsIPrefBranch);
        }

        return this.prefBranch;
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
        } catch(e) {
            }

        return rv;
    },

    setCharPref: function(aName, aValue) {
        this.getPrefBranch().setCharPref(aName, aValue);
    },

    getCharPref: function(aName) {
        var rv = null;

        try {
            rv = this.getPrefBranch().getCharPref(aName);
        } catch(e) {

            }

        return rv;
    },

    addObserver: function(aDomain, aFunction) {
        var myPrefs = this.getPrefBranch();
        var prefBranchInternal = myPrefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal);

        if (prefBranchInternal)
        prefBranchInternal.addObserver(aDomain, aFunction, false);
    },

    removeObserver: function(aDomain, aFunction) {
        var myPrefs = this.getPrefBranch();
        var prefBranchInternal = myPrefs.QueryInterface(Components.interfaces.nsIPrefBranchInternal);

        if (prefBranchInternal)
        prefBranchInternal.removeObserver(aDomain, aFunction);
    },

    initPrefs: function() {
        // migrate preferences
        var arePrefsUpToDate = this.getBoolPref(this.PREF_NOTIFICATIONS_REPEAT);
        if (arePrefsUpToDate == null) {
            // set prefs if they don't exit
            this.initPref(this.PREF_UPDATE_INTERVAL, "int", 10);
            this.initPref(this.PREF_REMEMBER_PASSWORD, "bool", false);
            this.initPref(this.PREF_AUTOLOGIN_ENABLED, "bool", false);
        }
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
        } catch(e) {
            }

        return rv;
    }
};