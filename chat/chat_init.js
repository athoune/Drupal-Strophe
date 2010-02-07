/**
 * Invite someone to talk
 */
poem.Tchat.prototype.wannaTalk = function(to, callback, error) {
	/*
	this.connection.send(
		$msg({type:'headline', to:to})
			.c('wannatalk',{})
			.tree()
	);*/
	this.connection.sendIQ($iq({to:to})
			.c('wannatalk',{type:"question"})
			.tree(),
		function(stanza) {//callback
			poem.log(['wanna yes!', stanza]);
			callback(stanza);
		},
		function(stanza) {//error
			error(stanza);
		},
		30000);
};
poem.Tchat.prototype.handleWannaTalk = function(handler) {
	/*this.handleHeadline(function(head){
		if(head.getElementsByTagName('wannatalk').length > 0) {
			poem.log('wanna talk?');
			handler(head);
		}
	}.bind(this));
	//[FIXME] le bind n'est pas bon
	*/
	this.handleIQ(function(iq) {
		if(iq.getElementsByTagName('wannatalk').length > 0) {
			poem.log(['wanna iq', iq, this]);
			var id = iq.getAttribute('id');
			var from = iq.getAttribute('from');
			var wannatalk = iq.getElementsByTagName('wannatalk')[0];
			var type = wannatalk.getAttribute('type');
			if(type == "question") {
				var answer = handler(from, wannatalk);
				this.connection.send($iq({id:id, type:'result', to:from})
					.c('wannatalk', {type:"answer"})
					.t(answer[0] ? '1':'0')
					.tree());
				if(answer.length > 1 && answer[0]) {
					this.flush();
					answer[1]();
				}
			}
		}
	});
};

poem.behaviors.append(function() {
	xmpp.handleWannaTalk(function(who){
		var name = who.split('@')[0];
		var answer = window.confirm(name + ' wonts to talk with you');
		return [answer, function() {
			document.location.href = Drupal.settings.strophe.direct_talk_url + name;
		}];
	});
});