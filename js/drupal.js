function log(what) {
	console.log(what);
}

function rawInput(data) {
	log('RECV: ' + data);
}

function rawOutput(data) {
	log('SENT: ' + data);
}

var Tchat = function(service, login, passwd) {
	this.login = login;
	this.passwd = passwd;
	this.connection = new Strophe.Connection(service);
	this.connection.rawInput = rawInput;
	this.connection.rawOutput = rawOutput;
	this.connection.tchat = this;
	this.connection.addHandler(Tchat_onMessage, null, 'message', null, null,  null); 
};

Tchat.prototype.connect = function() {
	log(this.onConnect);
	this.connection.connect(this.login, this.passwd, Tchat_onConnect);
};

Tchat.prototype.connect_status = function(status) {
	log("Status: " +status);
}

Tchat_onConnect = function(status) {
	//this == Strophe.Connection
	if (status == Strophe.Status.CONNECTING) {
		log('Strophe is connecting.');
	} else if (status == Strophe.Status.CONNFAIL) {
		log('Strophe failed to connect.');
		this.tchat.connect_status('connect');
	} else if (status == Strophe.Status.DISCONNECTING) {
		log('Strophe is disconnecting.');
	} else if (status == Strophe.Status.DISCONNECTED) {
		log('Strophe is disconnected.');
		this.tchat.connect_status('disconnect');
	} else if (status == Strophe.Status.CONNECTED) {
		log('Strophe is connected.');
	}
	this.send($pres().tree());
};

Tchat_onMessage = function(msg) {
	//this == Strophe.Connection
		var to = msg.getAttribute('to');
		var from = msg.getAttribute('from');
		var type = msg.getAttribute('type');
		var elems = msg.getElementsByTagName('body');
		log("Message, Type: " + type);
		if (type == "chat" && elems.length > 0) {
			var body = elems[0];
			log('DRUPALBOT: I got a message from ' + from + ': ' + 
			Strophe.getText(body));
		}
	};

	
Tchat.prototype.handleMessage = function(from, to, type, body) {
		tchat.append('<p><b>' + from + '</b> : ' + body + '</p>');
		return this;
	};
