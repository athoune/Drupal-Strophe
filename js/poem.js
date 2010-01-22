var poem = {
	log: function(what) {
		if(typeof console != 'undefined') {
			console.log(what);
		}
	},
	rawInput: function(data) {
		//log('RECV: ' + data);
	},
	rawOutput: function(data) {
		//log('SENT: ' + data);
	}
}

if (!Array.prototype.append) {
	Array.prototype.append = function(a) {
		this[this.length] = a;
	}
}

/**
 * Jabber InDentification
 */
poem.Jid = function(txt) {
	this.domain = null;
	this.place = null;
	var t = txt.split('@');
	if(t.length == 1) {
		this.user = t;
	} else {
		this.user = t[0];
		t = t[1].split('/');
		this.domain = t[0];
		if(t.length > 0){
			this.place = t[1];
		}
	}
}
poem.Jid.prototype = {
	toString: function() {
		return this.user + '@' + this.domain + '/' + this.place;
	},
	isRoom: function() {
		//[TODO] un peu naïf?
		if( this.domain == null)
			return false;
		return this.domain.split('.')[0] == 'conference';
	}
}

poem.Tchat = function(service, login, passwd, nickname) {
	this.jid = new poem.Jid(login);
	poem.log(this.jid);
	this.login = login;
	this.passwd = passwd;
	this.nickname = nickname;
	this.connection = new Strophe.Connection(service);
	this.connection.rawInput = poem.rawInput;
	this.connection.rawOutput = poem.rawOutput;
	this.connection.tchat = this;
	this._room = {};
	this._presence = {};
	this._onConnect = [];
	this._onPresence = [];
	this._onChat = [];
	this._onGroupChat = [];
	this._onAnyChat = [];
	this._onServerMessage = [];
	this._onHeadline= [];
	this._onEvent = [];

	this.handleConnect(function(status) {
		if('connected' == status) {
			this.connection.addHandler(
				function(msg) {
					//this == Strophe.Connection
					var to = msg.getAttribute('to');
					var from = msg.getAttribute('from');
					var type = msg.getAttribute('type');
					var body = msg.getElementsByTagName('body');
					var nick = msg.getElementsByTagName('nick');
					var subject = msg.getElementsByTagName('subject');
					subject = (subject.length > 0) ? Strophe.getText(subject[0]) : null;
					nick = (nick.length > 0) ? Strophe.getText(nick[0]) : null;
					body = (body.length > 0) ? Strophe.getText(body[0]) : null;
					var m = {
						msg:      msg,
						to:       to,
						type:     type,
						from:     from,
						from_jid: new poem.Jid(from),
						subject:  subject,
						nick:     nick,
						body:     body
					};
					poem.log([from, type, body]);
					if(type == 'headline') {
						var childs = msg.childNodes;
						for(var i=0; i < childs.length; i++){
							var child = childs[i];
							if(child.localName == 'event') {
								for(var i=0; i < this._onEvent.length; i++) {
									this._onEvent[i](child);
								}
							}
						}
						
						for(var i=0; i < this._onHeadline.length; i++) {
							this._onHeadline[i](msg);
						}
					}
					if(body != null) {
						if(type == 'groupchat' || type == 'chat') {
							for(var i=0; i < this._onAnyChat.length; i++) {
								this._onAnyChat[i](m);
							}
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
						poem.log(this.jid);
						if(from == this.jid.domain) {
							for(var i=0; i < this._onServerMessage.length; i++) {
								this._onServerMessage[i](m);
							}
						}
					}
					return true;
				}.bind(this), null, 'message', null, null,  null); 
			this.connection.addHandler(
				function(pres) {
					var from = pres.getAttribute('from');
					var to = pres.getAttribute('to');
					var type = pres.getAttribute('type');
					var status = pres.getElementsByTagName('status');
					var show = pres.getElementsByTagName('show');
					var p = {
						from: from,
						jid: new poem.Jid(from),
						type: type,
						status: (status.length > 0) ? Strophe.getText(status[0]) : null,
						show: (show.length > 0) ? Strophe.getText(show[0]) : null
					};
					for(var i=0; i < this._onPresence.length; i++) {
						this._onPresence[i](p);
					}
					return true;
				}.bind(this), null, 'presence', null, null,  null); 
			this.connection.send($pres().tree());
		}
	});
	
	this.handlePresence(function(pres) {
		this._presence[pres.from] = pres;
	});

};

poem.Tchat.prototype = {
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
	handleServerMessage: function(h) {
		this._onServerMessage.append(h.bind(this));
	},
	handleHeadline: function(h) {
		this._onHeadline.append(h.bind(this));
	},
	handleEvent: function(h) {
		this._onEvent.append(h.bind(this));
	},
	connect: function() {
		this.connection.connect(this.login, this.passwd, 
			function(status) {
				//this == Strophe.Connection
				var st = poem.Tchat.status(status);
				poem.log('Strophe is ' + st);
				for(var i=0; i < this.tchat._onConnect.length; i++) {
					this.tchat._onConnect[i](st);
				}
				return true;
			}
		);
	},
	connect_status: function(status) {
		poem.log("Status: " +status);
	},
	//Get a room, build it if needed
	room: function(room) {
		if(this._room[room] == null) {
			this._room[room] = new poem.Room(this.connection, room, this.nickname);
			this._room[room].presence();
		}
		return this._room[room];
	},
	handleMessage: function(from, to, type, body) {
		poem.log([from, to, type, body]);
		tchat.append('<p><b>' + from + '</b> : ' + body + '</p>');
		return this;
	},
	chat: function(to, blabla) {
		var msg = $msg({
				to: to,
				type: 'chat'});
		msg.c('body',{}).t(blabla);
		poem.log(msg);
		poem.log(this.connection);
		this.connection.send(msg.tree());
	},
	event: function(to, blabla) {
		this.connection.send(
			$msg({type:'headline', to:to})
				.c('event',{})
				.t(blabla).tree()
		);
	}
};

//return a name from a status
poem.Tchat.status = function(status) {
	var dico = {};
	dico[Strophe.Status.CONNECTING] = 'connecting';
	dico[Strophe.Status.CONNFAIL] = 'connfail';
	dico[Strophe.Status.AUTHENTICATING] = 'authenticating';
	dico[Strophe.Status.AUTHFAIL] = 'authfail';
	dico[Strophe.Status.DISCONNECTING] = 'disconnecting';
	dico[Strophe.Status.DISCONNECTED] = 'disconnected';
	dico[Strophe.Status.CONNECTED] = 'connected';
	return dico[status];
}

/**
 * A chat room
 */
poem.Room = function(connection, room, pseudo) {
	this.connection = connection;
	this.room = room;
	this.pseudo = pseudo;
}

poem.Room.prototype = {
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
	},
	event: function(blabla) {
		this.connection.send($msg({
				type:'headline',
				to:this.room})
			.c('event',{})
			.t(blabla).tree());
	}
}