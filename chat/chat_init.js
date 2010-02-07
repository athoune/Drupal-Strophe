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
		poem.log(head.getElementsByTagName('wannatalk').length);
	});
};

