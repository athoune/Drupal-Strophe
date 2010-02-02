var poem = {
	log: function(what) {
		if(typeof console != 'undefined') {
			console.log(what);
		}
	},
	rawInput: function(data) {
		//poem.log('RECV: ' + data);
	},
	rawOutput: function(data) {
		//poem.log('SENT: ' + data);
	},
	/* adding a method Array.protoype break silly code wich iterate over array*/
	append: function(haystack, needle) {
		haystack[haystack.length] = needle;
		return haystack;
	}
};

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
};
poem.Jid.prototype = {
	toString: function() {
		return this.user + '@' + this.domain + '/' + this.place;
	},
	isRoom: function() {
		//[TODO] un peu naïf?
		if( this.domain == null)
			return false;
		return this.domain.split('.')[0] == 'conference';
	},
	roomName: function() {
		return this.user + '@' + this.domain;
	}
};

poem.Tchat = function(service, login, passwd, nickname) {
	this.jid = new poem.Jid(login);
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
		if(Strophe.Status.CONNECTED == status) {
			this.connection.addHandler(this.__message.bind(this),  null, 'message',  null, null, null); 
			this.connection.addHandler(this.__iq.bind(this),       null, 'iq',       null, null, null);
			this.connection.addHandler(this.__presence.bind(this), null, 'presence', null, null, null);
			this.presence();
		}
		if(Strophe.Status.DISCONNECTED == status) {
			poem.log("Disconnected");
		}
	});
	this.handlePresence(function(pres) {
		poem.log(["prez", pres]);
		if(pres.jid.isRoom()) {
			this._room[pres.jid.roomName()].triggerPresence(pres);
		}
		poem.log(['the rooms', pres.jid.roomName(), this._room[pres.jid.roomName()]]);
		this._presence[pres.from] = pres;
	});

};

poem.Tchat.prototype = {
	__iq: function(iq) {
		poem.log(['iq', iq]);
		return true;
	},
	__presence: function(pres) {
		poem.log(['_presence', pres]);
		var from = pres.getAttribute('from');
		var to = pres.getAttribute('to');
		var type = pres.getAttribute('type');
		var status = pres.getElementsByTagName('status');
		var show = pres.getElementsByTagName('show');
		var p = {
			from: from,
			jid: new poem.Jid(from),
			type: (type == null) ? 'available' : type,
			status: (status.length > 0) ? Strophe.getText(status[0]) : null,
			show: (show.length > 0) ? Strophe.getText(show[0]) : null
		};
		poem.log(p);
		for(var i=0; i < this._onPresence.length; i++) {
			this._onPresence[i](p);
		}
		return true;
	},
	__message: function(msg) {
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
	},
	handleConnect: function(h) {
		this._onConnect = poem.append(this._onConnect, h.bind(this));
	},
	handlePresence: function(h) {
		this._onPresence = poem.append(this._onPresence, h.bind(this));
	},
	handleChat: function(h) {
		this._onChat = poem.append(this._onChat, h.bind(this));
	},
	handleGroupChat: function(h) {
		this._onGroupChat = poem.append(this._onGroupChat, h.bind(this));
	},
	handleAnyChat: function(h) {
		this._onAnyChat = poem.append(this._onAnyChat, h.bind(this));
	},
	handleServerMessage: function(h) {
		this._onServerMessage = poem.append(this._onServerMessage, h.bind(this));
	},
	handleHeadline: function(h) {
		this._onHeadline = poem.append(this._onHeadline, h.bind(this));
	},
	handleEvent: function(h) {
		this._onEvent = poem.append(this._onEvent, h.bind(this));
	},
	connect: function() {
		this.connection.connect(this.login, this.passwd, 
			function(status, error) {
				poem.log('Strophe is ' + poem.Tchat.status(status) + ((error != null) ? '(' + error + ')' : ''));
				for(var i=0; i < this.tchat._onConnect.length; i++) {
					this.tchat._onConnect[i](status);
				}
				return true;
			}
		);
	},
	/*connect_status: function(status) {
		poem.log("Status: " +status);
	},*/
	//Get a room, build it if needed
	room: function(room) {
		poem.log('Room: ' + room);
		if(this._room[room] == null) {
			this._room[room] = new poem.Room(this.connection, room, this.nickname);
			this._room[room].presence();
		}
		return this._room[room];
	},
	/*handleMessage: function(from, to, type, body) {
		poem.log([from, to, type, body]);
		//tchat.append('<p><b>' + from + '</b> : ' + body + '</p>');
		return this;
	},*/
	chat: function(to, blabla) {
		var msg = $msg({
				to: to,
				type: 'chat'});
		msg.c('body',{}).t(blabla);
		//poem.log(msg);
		//poem.log(this.connection);
		this.connection.send(msg.tree());
	},
	event: function(to, blabla) {
		this.connection.send(
			$msg({type:'headline', to:to})
				.c('event',{})
				.t(blabla).tree()
		);
	},
	presence: function() {
		//[FIXME] GROS BUG
		//msg.up();
		//msg.c('priority', {}).t(5);
		this.connection.send($pres({})
			.c('status', {}).t('available')
//			.up()
//			.c('priority', {}).t(5)
		.tree());
		var that = this;
		$(window).unload(function(evt) {
			that.connection.send(
				$pres({ type: "unavailable"})
				.c('status').t('logged out')
				.tree());
			that.connection.flush();
			return true;
		});
	},
	roster: function() {
		this.connection.sendIQ(
			$iq({type: 'get'}).c('query', {xmlns:Strophe.NS.ROSTER}).tree(),
			function(iq) {//success
				poem.log(['roster', iq]);
			},
			function(data) {//error
				poem.log(['roster error', iq]);
			},
			10000);
	},
	vcard: function(name) {
		/*
		<iq type="set" id="aacca" >
		<vCard xmlns="vcard-temp" version="2.0" prodid="-//HandGen//NONSGML vGen v1.0//EN" >
		<FN>Mathieu</FN>
		*/
		this.connection.sendIQ(
			$iq({type: 'set'})
				.c('vCard', {xmlns: 'vcard-temp', version: "2.0", prodid: "-//HandGen//NONSGML vGen v1.0//EN"})
				.c('FN').t(name).tree(),
			function(iq) {//success
				poem.log(['vcard', iq]);
			},
			function(data) {//error
				poem.log(['vcard error', iq]);
			},
			10000
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
};

/**
 * A chat room
 */
poem.Room = function(connection, room, pseudo) {
	this.connection = connection;
	this.room = room;
	this.pseudo = pseudo;
	this.buddies = {};
	this._presence = [];
	this._available = [];
	this._notAvailable = [];
	this.handlePresence(function(pres){
		poem.log(["presence", pres.type, pres.from]);
		if(pres.type == 'available') {
			for(var i=0; i < this._available.length; i++) {
				this._available[i](pres);
			}
		} else {
			for(var i=0; i < this._notAvailable.length; i++) {
				this._notAvailable[i](pres);
			}
		}
	});
	this.handleAvailable(function(pres) {
		this.buddies = poem.append(this.buddies, pres.from);
	});
	//[TODO] handle remove
};

poem.Room.prototype = {
	/** Send presence to that room*/
	presence: function() {
		var that = this;
		$(window).unload(function(evt) {
			that.connection.send(
				$pres({to: that.room + '/' + that.pseudo, type: "unavailable"})
				.c('x', {xmlns:"http://jabber.org/protocol/muc"})
				.up()
				.c('status').t('logged out')
				.tree());
			that.connection.flush();
			return true;
		});
		this.connection.send(
			$pres({to: this.room + '/' + this.pseudo})
			.c('x', {xmlns:"http://jabber.org/protocol/muc"})
			.up()
			.c('status').t('available')
			.tree());
	},
	/** send message to that room */
	message: function(blabla) {
		var msg = $msg({
				to: this.room,
				type: 'groupchat'});
		msg.c('body',{}).t(blabla);
		this.connection.send(msg.tree());
	},
	/** send an arbitrary event to that room */
	event: function(blabla) {
		this.connection.send($msg({
				type:'headline',
				to:this.room})
			.c('event',{})
			.t(blabla).tree());
	},
	/** register a new presence handler for that room 
	 * the handler will receive the presence object
	*/
	handlePresence: function(handler) {
		this._presence = poem.append(this._presence, handler.bind(this));
	},
	triggerPresence: function(pres) {
		for(var i=0; i < this._presence.length; i++) {
			this._presence[i](pres);
		}
	},
	handleAvailable: function(handler) {
		this._available = poem.append(this._available, handler.bind(this));
	},
	handleNotAvailable: function(handler) {
		this._notAvailable = poem.append(this._notAvailable, handler.bind(this));
	}
};