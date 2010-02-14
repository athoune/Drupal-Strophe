poem.behaviors.append(function() {
	var status = $("#strophe-status");
	var st = xmpp.show();
	var cpt = 0;
	$(status[0].options).each(function() {
		if(st == this.value) {
			status[0].selectedIndex = cpt;
		}
		cpt++;
	});
	status.change(function() {
		xmpp.show(this.options[this.selectedIndex].value);
		xmpp.presence();
		xmpp.flush();
	});
});
