function onLoad() {
	document.getElementById("gateway").value = window.opener.AtTaskPrefs.getCharPref(window.opener.AtTaskPrefs.PREF_GATEWAY);
	document.getElementById("username").value = window.opener.AtTaskPrefs.getCharPref(window.opener.AtTaskPrefs.PREF_USERNAME);
	document.getElementById("store-password").checked = window.opener.AtTaskPrefs.getBoolPref(window.opener.AtTaskPrefs.PREF_REMEMBER);
	
	if(window.opener.AtTaskPrefs.getBoolPref(window.opener.AtTaskPrefs.PREF_REMEMBER) && window.opener.AtTaskPrefs.getCharPref(window.opener.AtTaskPrefs.PREF_USERNAME) != null && window.opener.AtTaskPrefs.getCharPref(window.opener.AtTaskPrefs.PREF_USERNAME).length > 0) {
		var password = window.opener.AtTaskPrefs.retrievePassword(window.opener.AtTaskPrefs.getCharPref(window.opener.AtTaskPrefs.PREF_USERNAME));
		if(password != null)
			document.getElementById("password").value = password;
	}
}

function onAccept() {
	setStatus("", "Logging in...");

	window.opener.AtTaskPrefs.setBoolPref(window.opener.AtTaskPrefs.PREF_REMEMBER, document.getElementById("store-password").checked);
	window.opener.AtTaskPrefs.setCharPref(window.opener.AtTaskPrefs.PREF_GATEWAY, document.getElementById("gateway").value);
	window.opener.AtTaskPrefs.setCharPref(window.opener.AtTaskPrefs.PREF_USERNAME, document.getElementById("username").value);

	if(document.getElementById("store-password").checked) {
		window.opener.AtTaskPrefs.storePassword(document.getElementById("username").value, document.getElementById("password").value);
	}else {
		window.opener.AtTaskPrefs.storePassword(document.getElementById("username").value, null);
	}
	
	window.opener.AtTaskNotifier.initLogin(document.getElementById("gateway").value, document.getElementById("username").value, document.getElementById("password").value);

	return false;
}

function setStatus(status, message) {
	if(message != null)
		document.getElementById("status").label = message;
	
	switch(status) {
		case "success":
			window.opener.AtTaskNotifier.login_window = null;
      		setTimeout("window.close()", 500);
			break;
		case "fail":
			break;
	}
}


