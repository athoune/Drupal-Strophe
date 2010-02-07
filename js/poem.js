/**
 * @namespace poem namespce
 */
var poem = {
    /**
    * simple logger
    */
	log: function(what) {
		if(typeof console != 'undefined') {
			console.log(what);
		}
	},
	rawInput: function(data) {
		poem.log('RECV: ' + data);
	},
	rawOutput: function(data) {
		poem.log('SENT: ' + data);
	},
	/**
	 * append helper for Array class
	 * adding a method Array.protoype break silly code wich iterate over array
	 */
	append: function(haystack, needle) {
		haystack[haystack.length] = needle;
		return haystack;
	}
};

/**
 * @class Jabber InDentification
 * @constructor
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

/**
 * High level class wrapping strophe functionality
 * @class XMPP server
 * @constructor
 * @param service the BOSH url
 * @param login Login
 * @param passwd Password
 * @param nickname Nickname
 */
poem.Tchat = function(service, login, passwd, nickname) {
	this.jid = new poem.Jid(login);
	this.login = login;
	this.passwd = passwd;
	this.nickname = nickname;

	this.connection = new Strophe.Connection(service);
	this.connection.rawInput = poem.rawInput;
	this.connection.rawOutput = poem.rawOutput;
	//this.connection.tchat = this;
	this.connection.addHandler(this.__message.bind(this),  null, 'message',  null, null, null); 
	this.connection.addHandler(this.__iq.bind(this),       null, 'iq',       null, null, null);
	this.connection.addHandler(this.__presence.bind(this), null, 'presence', null, null, null);

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
	this._onIQ = [];
	this._preConnect = [];

	this.handlePresence(function(pres) {
		poem.log(["prez", pres]);
		if(pres.jid.isRoom()) {
			this._room[pres.jid.roomName()].triggerPresence(pres);
		}
		poem.log(['the rooms', pres.jid.isRoom(), pres.jid.roomName(), pres.jid, this._room, this._room[pres.jid.roomName()]]);
		this._presence[pres.from] = pres;
	});
	this.handleConnect(function(status) {
		if(Strophe.Status.CONNECTED == status) {
			this.presence();
			//poem.log(['rooms', this._room]);
			for(r in this._room) {
				var room = this._room[r];
				//poem.log(['room presence', room.room]);
				if(room.autopresence) {
					room.presence();
				}
			}
		}
		return true;
	});
	this.handleGroupChat(function(message) {
		if(message.from_jid.isRoom()) {
			this._room[message.from_jid.roomName()].triggerMessage(message);
		}
	});
};

poem.Tchat.prototype = {
	__iq: function(iq) {
		poem.log(['iq', iq]);
		for(var i=0; i < this._onIQ.length; i++) {
			this._onIQ[i](iq);
		}
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
		var i;
		if(type == 'headline') {
			var childs = msg.childNodes;
			for(i=0; i < childs.length; i++){
				//[FIXME] put in an handleHeadline
				var child = childs[i];
				if(child.localName == 'event') {
					for(i=0; i < this._onEvent.length; i++) {
						this._onEvent[i](child);
					}
				}
			}
			for(i=0; i < this._onHeadline.length; i++) {
				this._onHeadline[i](msg);
			}
		}
		if(body != null) {
			if(type == 'groupchat' || type == 'chat') {
				for(i=0; i < this._onAnyChat.length; i++) {
					this._onAnyChat[i](m);
				}
			}
			if(type == 'groupchat') {
				for(i=0; i < this._onGroupChat.length; i++) {
					this._onGroupChat[i](m);
				}
			}
			if(type == 'chat') {
				for(i=0; i < this._onChat.length; i++) {
					this._onChat[i](m);
				}
			}
			poem.log(this.jid);
			if(from == this.jid.domain) {
				for(i=0; i < this._onServerMessage.length; i++) {
					this._onServerMessage[i](m);
				}
			}
		}
		return true;
	},
	handleConnect: function(h) {
		this._onConnect = poem.append(this._onConnect, h.bind(this));
	},
	/**
	 * Before connection
	 */
	handlePreConnect: function(h) {
		this._preConnect = poem.append(this._preConnect, h.bind(this));
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
	handleIQ: function(h) {
		this._onIQ = poem.append(this._onIQ, h.bind(this));
	},
	connect: function() {
		/*for(var i=0; i < this._preConnect.length; i++) {
			this._preConnect[i]();
		}*/
		var that = this;
		poem.log(['Connection', this.login, this.passwd]);
		this.connection.connect(this.login, this.passwd, 
			function(status, error) {
				poem.log('Strophe is ' + poem.Tchat.status(status) + ((error != null) ? '(' + error + ')' : ''));
				poem.log(['onConnect', that._onConnect.length, that._onConnect]);
				for(var j=0; j < that._onConnect.length; j++) {
					poem.log([j, status, that._onConnect[j]]);
					var stat = that._onConnect[j](status);
					poem.log(['connect status', stat]);
				}
				return true;
			}
		);
	},
	/*connect_status: function(status) {
		poem.log("Status: " +status);
	},*/
	/**
	 * Get a room, build it if needed
	 */
	room: function(room) {
		poem.log('Room: ' + room);
		if(this._room[room] == null) {
			this._room[room] = new poem.Room(this.connection, room, this.nickname);
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
		poem.log(msg);
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
	presence: function(to) {
		//[FIXME] GROS BUG
		//msg.up();
		//msg.c('priority', {}).t(5);
		poem.log(['connection presence', to]);
		var pres;
		if(typeof to == 'undefined'){
			pres = {};
		} else {
			pres = {to:to};//from:this.jid.toString,
		}
		this.connection.send($pres(pres).tree());
		var thaat = this;
		pres.type = "unavailable";
		$(window).unload(function(evt) {
			thaat.connection.send(
				$pres(pres)
				.c('status').t('logged out')
				.tree());
			thaat.connection.flush();
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
	},
	flush: function() {
		this.connection.flush();
	}
};

/**
 * Helper for connection status
 * return a name from a status
 */
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
 * @class A chat room
 * @constructor
 */
poem.Room = function(connection, room, pseudo) {
	this.connection = connection;
	this.room = room;
	this.pseudo = pseudo;
	this.autopresence = true;
	this.buddies = {};
	this._presence = [];
	this._available = [];
	this._notAvailable = [];
	this._message = [];
	this.handlePresence(function(pres){
		poem.log(["presence", pres.type, pres.from]);
		var i;
		if(pres.type == 'available') {
			for(i=0; i < this._available.length; i++) {
				this._available[i](pres);
			}
		} else {
			for(i=0; i < this._notAvailable.length; i++) {
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
//			.c('x', {xmlns:"http://jabber.org/protocol/muc"})
//			.up()
//			.c('status').t('available')
			.tree());
		poem.log(this.room + ' is here');
	},
	/** send message to that room */
	message: function(blabla) {
		var msg = $msg({
				to: this.room,
				type: 'groupchat'})
			.c('body',{}).t(blabla);
		//	poem.log(msg);*/
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
	},
	handleMessage: function(handler) {
		this._message = poem.append(this._message, handler.bind(this));
	},
	triggerMessage: function(message) {
		for(var i=0; i < this._message.length; i++) {
			this._message[i](message);
		}
	}
};

poem.Behaviors = function(){
	this.behaviors = [];
};
poem.Behaviors.prototype = {
	append: function(behavior) {
		this.behaviors[this.behaviors.length] = behavior;
	},
	trigger: function() {
		for(var i=0; i<this.behaviors.length; i++) {
			this.behaviors[i]();
		}
	}
};
/**
 * all behaviors will be triggered, juste before connection
 */
poem.behaviors = new poem.Behaviors();
