var AtTaskAPI = new Class({
	Implements: [Options, Events],
	options: {
		sessionID: null,
		gateway: 'http://localhost:8080/attask/api',
		jsonp: true
	},
	
	PATH_LOGIN: '/login',
	PATH_LOGOUT: '/logout',
	PATH_SEARCH: '/search',
	
	METH_DELETE: 'DELETE',
	METH_GET: 'GET',
	METH_POST: 'POST',
	METH_PUT: 'PUT',
	
	xhr: null,
	
	initialize: function(options) {
		this.setOptions(options);
	},
	
	request: function(path, params, fields, method, callback) {
		if(params == null){ params = {}; }

		if(this.options.sessionID != null) {
			params['sessionID'] = this.options.sessionID;
		}
		
		params.method = method;
		
		if (fields) {
			if (typeof fields == 'string') {
				params.fields = fields;
			} else if (fields.constructor == Array) {
				params.fields = fields.join();
			}
		}	
							
		if(this.options.jsonp) {
			this.xhr = new Request.JSONP({
							    url: this.options.gateway + path,
							    data: params,
							    callbackKey: 'jsonp',
							    log: true,
							    onSuccess: function(result) {
							        if (result && result.data) {
										if(typeOf(callback) == 'function')
							            	callback(result.data, null);
							        } else {
							            var error = result.error;
							            if (!error) error = {
							                "message": 'Request Error: empty response',
							                "class": 'RequestError'
							            };
										if(typeOf(callback) == 'function')
							            	callback(null, error);
							            this.xhr = null;
							        }
							    }.bind(this),
							    onError: function(xhr) {
							        var error = {
							            "message": 'Request Error: response status ' + xhr.status,
							            "class": 'RequestError',
							            "xhr": xhr
							        };

									if(typeOf(callback) == 'function')
							        	callback(null, error);

							        this.xhr = null;
							    }.bind(this)
							}).send();
		}
	},
	
	
	login: function(username, password, callback) {
		var params = {'username' : username, 'password': password};
		
		this.request(this.PATH_LOGIN, params, null, this.METH_GET, function(response, fail) {
			if(response != null) {
				this.options.sessionID = response['sessionID'];
			}
			if(typeOf(callback) == 'function')
				callback(response, fail);
		}.bind(this));
	},
	
	logout: function(callback) {
		if(this.sessionID) {
			var params = {"sessionID": this.sessionID};
			request(this.PATH_LOGOUT, params, null, this.METH_GET, callback);
		}else {
			if(typeOf(callback) == 'function')
				callback(null,{"success": false}); //indicate failure
		}
	},
	
	get: function(objCode, objID, params, fields, callback) {
		this.request("/"+objCode+"/"+objID, params,fields, this.METH_GET, callback);
	},
	
	search: function(objCode, query, fields, callback) {
		this.request("/"+objCode+this.PATH_SEARCH, query,fields,this.METH_GET,callback);
	}
	
	
});