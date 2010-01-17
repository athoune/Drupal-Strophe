$(function() {
	poem.log("connect");
	if(typeof xmpp != 'undefined') {
		xmpp.connect();
	}
});