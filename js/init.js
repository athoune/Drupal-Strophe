var xmpp;
$(function() {
	poem.log('Settings:')
	poem.log(Drupal.settings.xmpp.passwd);
	xmpp = new poem.Tchat(
		Drupal.settings.xmpp.bosh_service,
		Drupal.settings.xmpp.jid,
		Drupal.settings.xmpp.passwd,
		Drupal.settings.xmpp.nickname
	);
	poem.log(xmpp);
})