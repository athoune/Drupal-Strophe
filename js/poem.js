function log(what) {
	if(typeof console != 'undefined')
		console.log(what);
}

function rawInput(data) {
	log('RECV: ' + data);
}

function rawOutput(data) {
	log('SENT: ' + data);
}

if (!Array.prototype.append) {
	Array.prototype.append = function(a) {
		this[this.length] = a;
	}
}

var Jid = function(txt) {
	var t = txt.split('@');
	this.user = t[0];
	t = t[1].split('/');
	this.domain = t[0];
	this.place = t[1];
}
Jid.prototype = {
	toString: function() {
		return this.user + '@' + this.domain + '/' + this.place;
	},
	isRoom: function() {
		//[TODO] un peu naïf?
		return this.domain.split('.')[0] == 'conference';
	}
}

var Tchat = function(service, login, passwd, nickname) {
	this.login = login;
	this.passwd = passwd;
	this.nickname = nickname;
	this.connection = new Strophe.Connection(service);
	this.connection.rawInput = rawInput;
	this.connection.rawOutput = rawOutput;
	this.connection.tchat = this;
	this._room = {};
	this._presence = {};
	this._onConnect = [];
	this._onPresence = [];
	this._onChat = [];
	this._onGroupChat = [];
	this._onAnyChat = [];

	this.handleConnect(function() {
		this.connection.send($pres().tree());
	});
	
	this.handlePresence(function(pres) {
		this._presence[pres.from] = pres;
	});

};

Tchat.prototype = {
	handleConnect: function(h) {
		this._onConnect.append(h.bind(this));
	},

	handlePresence: function(h) {
		this._onPresence.append(h.bind(this));
	},
	
	handleChat: function(h) {
		this._onChat.append(h.bind(this));
	},

	handleGroupChat: function(h) {
		this._onGroupChat.append(h.bind(this));
	},

	handleAnyChat: function(h) {
		this._onAnyChat.append(h.bind(this));
	},

	connect: function() {
		this.connection.connect(this.login, this.passwd, Tchat_onConnect);
	},

	connect_status: function(status) {
		log("Status: " +status);
	},

	//Get a room, build it if needed
	room: function(room) {
		if(this._room[room] == null) {
			this._room[room] = new Room(this.connection, room, this.nickname);
			this._room[room].presence();
		}
		return this._room[room];
	},

	handleMessage: function(from, to, type, body) {
		tchat.append('<p><b>' + from + '</b> : ' + body + '</p>');
		return this;
	}
};

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
		this.addHandler(Tchat_onMessage.bind(this.tchat), null, 'message', null, null,  null); 
		this.addHandler(Tchat_onPresence.bind(this.tchat), null, 'presence', null, null,  null); 
		for(var i=0; i < this.tchat._onConnect.length; i++) {
			this.tchat._onConnect[i]();
		}
	}
	return true;
};

Tchat_onMessage = function(msg) {
	//this == Strophe.Connection
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var body = msg.getElementsByTagName('body');
	var nick = msg.getElementsByTagName('nick');
	nick = ( nick.length > 0) ? nick[0] : '';
	var m = {
		to: to,
		type: type,
		from: from,
		from_jid: new Jid(from),
		nick: (nick.length > 0) ? Strophe.getText(nick[0]) : null,
		body: ''
	};
	if(body.length > 0) {
		m.body = Strophe.getText(body[0]);
		for(var i=0; i < this._onAnyChat.length; i++) {
			this._onAnyChat[i](m);
		}
		if(type == 'groupchat') {
			for(var i=0; i < this._onGroupChat.length; i++) {
				this._onGroupChat[i](m);
			}
		}
		if(type == 'chat') {
			for(var i=0; i < this._onChat.length; i++) {
				this._onChat[i](m);
			}
		}
	}
	return true;
};

Tchat_onPresence = function(pres) {
	var from = pres.getAttribute('from');
	var to = pres.getAttribute('to');
	var type = pres.getAttribute('type');
	var status = pres.getElementsByTagName('status');
	var show = pres.getElementsByTagName('show');
	var p = {
		from: from,
		jid: new Jid(from),
		type: type,
		status: (status.length > 0) ? Strophe.getText(status[0]) : null,
		show: (show.length > 0) ? Strophe.getText(show[0]) : null
	};
	for(var i=0; i < this._onPresence.length; i++) {
		this._onPresence[i](p);
	}
	return true;
}

var Room = function(connection, room, pseudo) {
	this.connection = connection;
	this.room = room;
	this.pseudo = pseudo;
}

Room.prototype = {
	presence: function() {
		this.connection.send($pres({
			to: this.room + '/' + this.pseudo}).tree());
	},
	message: function(blabla) {
		var msg = $msg({
				to: this.room,
				type: 'groupchat'});
		msg.c('body',{}).t(blabla);
		this.connection.send(msg.tree());
	}
}