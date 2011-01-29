/**
 * Invite someone to talk
 */
poem.XMPP.prototype.wannaTalk = function(to, callback, error) {
	this.connection.sendIQ(
		$iq({to:to})
			.c('wannatalk', {type:"question"})
			.tree(),
		function(stanza) {//callback
			poem.log(['wanna yes!', stanza]);
			callback(stanza);
		},
		function(stanza) {//error
			error(stanza);
		},
		30000);//30s timeout
};
/**
 * @argument handler a closure that take two arguments, a boolean and a post action closure
 */
poem.XMPP.prototype.handleWannaTalk = function(handler) {
	this.handleIQ('wannatalk', function(iq, wannatalk) {
		poem.log(['wanna iq', iq, this]);
		var type = wannatalk.getAttribute('type');
		var from = iq.getAttribute('from');
		if(type == "question") {
			var answer = handler(from, wannatalk);
			this.connection.send($iqr(iq)
				.c('wannatalk', {type:"answer"})
				.t(answer[0] ? '1':'0')
				.tree());
			if(answer.length > 1 && answer[0]) {
				this.flush();
				answer[1]();
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