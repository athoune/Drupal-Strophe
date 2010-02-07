/**
 * Invite someone to talk
 */
poem.Tchat.prototype.wannaTalk = function(to) {
	this.connection.send(
		$msg({type:'headline', to:to})
			.c('wannatalk',{})
			.tree()
	);	
};
poem.Tchat.prototype.handleWannaTalk = function(handler) {
	this.handleHeadline(function(head){
		if(head.getElementsByTagName('wannatalk').length > 0) {
			poem.log('wanna talk?');
			handler(head);
		}
	}.bind(this));
	//[FIXME] le bind n'est pas bon
};

poem.behaviors.append(function() {
	xmpp.handleWannaTalk(function(head){
		//poem.log(this);
		var name = head.getAttribute('from').split('@')[0];
		if(window.confirm(name + ' wonts to talk with you')) {
			document.location.href = Drupal.settings.strophe.direct_talk_url + name;
		}
	});
});