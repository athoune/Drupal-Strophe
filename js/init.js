var xmpp;
$(function() {
	//poem.log(Drupal.settings.xmpp.passwd);
	xmpp = new poem.Tchat(
		Drupal.settings.xmpp.bosh_service,
		Drupal.settings.xmpp.jid,
		Drupal.settings.xmpp.passwd,
		Drupal.settings.xmpp.nickname
	);
	xmpp.handleConnect(function(status) {
		if(Strophe.Status.CONNECTED == status) {
			//xmpp.presence();
			xmpp.vcard(Drupal.settings.xmpp.nickname);
			xmpp.roster();
		}
	});
})