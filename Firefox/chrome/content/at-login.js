const kPSWDMANAGER_CONTRACTID = "@mozilla.org/passwordmanager;1";
const nsIPasswordManager = Components.interfaces.nsIPasswordManager;

var gPasswordArray = new Array();

function onLoad() {


}

function onAccept() {
	window.opener.AtTaskNotifier.initLogin(document.getElementById("gateway").value, document.getElementById("username").value, document.getElementById("password").value);
	
	// remember login pref
  	// window.opener.AtTaskNotifier.wm_prefs.setBoolPref("gm-notifier.users.remember-password", document.getElementById("store-password").checked);
	
	return false;
}

function setStatus(status) {
	
	switch(status) {
		case "success":
			window.opener.AtTaskNotifier.login_window = null;
			window.close();
			break;
	}
	
}


