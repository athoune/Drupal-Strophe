var xmpp;

poem.log(poem.behaviors);
Drupal.behaviors._muc_init = function(context) {
	//poem.log(Drupal.settings.xmpp.passwd);
	function prems(stuff) {
		if(typeof stuff == 'string') return stuff;
		return stuff[0];
	}
	poem.log([
		prems(Drupal.settings.xmpp.bosh_service),
		prems(Drupal.settings.xmpp.jid),
		prems(Drupal.settings.xmpp.passwd),
		prems(Drupal.settings.xmpp.nickname)
	]);
	xmpp = new poem.Tchat(
		prems(Drupal.settings.xmpp.bosh_service),
		prems(Drupal.settings.xmpp.jid),
		prems(Drupal.settings.xmpp.passwd),
		prems(Drupal.settings.xmpp.nickname)
	);
/*	xmpp.handleConnect(function(status) {
		if(Strophe.Status.CONNECTED == status) {
			//xmpp.presence();
			//xmpp.vcard(prems(Drupal.settings.xmpp.nickname));
			//xmpp.roster();
		}
	});*/
};