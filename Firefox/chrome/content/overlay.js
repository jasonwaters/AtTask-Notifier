// var AtTaskNotifier = new Class({
// 	Implements: [Options, Events],
// 	options: {
// 	},
// 		
// 	initialize: function(options) {
// 		this.setOptions(options);
// 	},
// 	
// 	onLoad: function() {
// 		// initialization code
// 		this.initialized = true;
// 		this.strings = document.getElementById("attasknotify-strings");
// 		// document.getElementById("at-notifier-statusbar").setAttribute('label', 'hi bobbo');
// 	},
// 	
// 	login: function() {
// 		alert('i like mootools');
// 	}
// 	
// });

// var attasknotify = new AttaskNotifier();

var attasknotify = {
    onLoad: function() {
        // initialization code
        this.initialized = true;
        this.strings = document.getElementById("attasknotify-strings");
        document.getElementById("at-notifier-statusbar").setAttribute('label', 'hi bobbo');
    },

    onMenuItemCommand: function(e) {
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
        .getService(Components.interfaces.nsIPromptService);
        promptService.alert(window, this.strings.getString("helloMessageTitle"),
        this.strings.getString("helloMessage"));
    },

    onToolbarButtonCommand: function(e) {
        // just reuse the function above.  you can change this, obviously!
        attasknotify.onMenuItemCommand(e);
    },

    login: function(event) {
		if(event && event.button == 2) {
			return;
		}
		
		this.openLoginWindow();
	},
	
	openLoginWindow: function() {
		this.login_window = window.openDialog("chrome://attasknotify/content/at-login.xul", "_blank", "chrome,resizable=yes,dependent=yes");
	}
};

window.addEventListener("load",
function() {
    attasknotify.onLoad();
},
false);
