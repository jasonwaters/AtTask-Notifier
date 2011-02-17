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

function validGateway(rawGateway) {
	if(rawGateway == null || rawGateway.length == 0)
		return null;
	
	var gateway = rawGateway.replace("//", "/");
	gateway = gateway.replace(":", "");
	
	var validHostRegex = new RegExp("^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])(:[0-9]+)*$");
	var validIpRegex = new RegExp("^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:[0-9]+)*$");
	
	var parts = gateway.split('/');
	
	var protocol = "https";
	var host = null;
	
	if(parts[0] == "http" || parts[0] == "https") {
		protocol = parts[0];
		parts.splice(0,1);
	}else if(parts[0] == "ftp" || parts[0] == "smb" || parts[0] == "vnc") {
		return null;
	}
	
	for(var i=0;i<parts.length;i++) {
		if(parts[i].match(validHostRegex) || parts[i].match(validIpRegex)) {
			host = parts[i];
			break;
		}
	}
	
	if(host == null)
		return null;
	
	var finalGateway = protocol + "://" + host + "/attask";
	
	return finalGateway;
}

function onAccept() {
	var gateway = validGateway(document.getElementById("gateway").value);
	
	
	if( gateway == null) {
		setStatus("fail", "It looks like your AtTask URL might be wrong.  Please try again.");		
		return false;
	}
	
	setStatus("", "Logging in...");

	window.opener.AtTaskPrefs.setBoolPref(window.opener.AtTaskPrefs.PREF_REMEMBER, document.getElementById("store-password").checked);
	window.opener.AtTaskPrefs.setCharPref(window.opener.AtTaskPrefs.PREF_GATEWAY, gateway);
	window.opener.AtTaskPrefs.setCharPref(window.opener.AtTaskPrefs.PREF_USERNAME, document.getElementById("username").value);

	if(document.getElementById("store-password").checked) {
		window.opener.AtTaskPrefs.storePassword(document.getElementById("username").value, document.getElementById("password").value);
	}else {
		window.opener.AtTaskPrefs.storePassword(document.getElementById("username").value, null);
	}
	
	window.opener.AtTaskNotifier.initLogin(gateway, document.getElementById("username").value, document.getElementById("password").value);

	return false;
}

function setStatus(status, message) {
	if(message != null)
		document.getElementById("status").value = message;
	
	switch(status) {
		case "success":
			window.opener.AtTaskNotifier.login_window = null;
      		setTimeout("window.close()", 500);
			break;
		case "fail":
			break;
	}
}


