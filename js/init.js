var xmpp;

Drupal.behaviors._muc_init = function(context) {
	xmpp = new poem.XMPP(
		Drupal.settings.xmpp.bosh_service,
		Drupal.settings.xmpp.jid,
		Drupal.settings.xmpp.passwd,
		Drupal.settings.xmpp.nickname
	);
};