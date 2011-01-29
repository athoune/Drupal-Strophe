var __cool = true;
var waitAlittle = function() {
	__cool = true;
	poem.log("Now, I'm cool");
}

poem.behaviors.append(function(){
	var other = Drupal.settings.strophe.chat.other;
	var head = $('<div style="font-size: 36px;position: relative; z-index:20;">☠</div>');
	var TIMING = 500;
	xmpp.handleHeadline('event', function(message, event){
		poem.log(event.textContent);
		//$('#discussion').css('background-color', event.textContent);
		var t = event.textContent.split(':');
		console.log({left: parseInt(t[0], 10), top: parseInt(t[1], 10)});
		head.animate({
			left: parseInt(t[0], 10),
			top: parseInt(t[1], 10)
		}, TIMING, function() {});
		/*head
			.css('left', parseInt(t[0], 10))
			.css('top',parseInt(t[1], 10));*/
	});
	xmpp.handleServerMessage(function(msg){
		poem.log(msg);
		alert(msg.body.textContent);
	});
	function post(who, what) {
		$('#discussion').append(
			$('<li>')
				.append($('<b>').text(who))
				.append(': ' + what)
		);
		
	}
	xmpp.handleChat(function(msg){
		poem.log('je recois un message');
		poem.log(msg);
		post((msg.nick != null) ? msg.nick : msg.from.split('@')[0], msg.body);
	});
	xmpp.handleConnect(function(status){
		if(Strophe.Status.CONNECTED == status){
			this.presence(other);
		}
	});
	var discussion_poz = $('#discussion').offset();
	$('#discussion').before(head).mousemove(function(evt) {
		poem.log(__cool);
		if(__cool) {
			__cool = false;
			xmpp.event(other, (evt.pageX - discussion_poz.left) + ":" + (evt.pageY - discussion_poz.top));
			setTimeout("waitAlittle()", TIMING);
		}
	});

	$('#discussion-form').submit(function(){
		var msg = $('#discussion-msg').get(0).value;
		post(xmpp.nickname, msg);
		xmpp.chat(other, msg);
		$('#discussion-msg').get(0).value = "";
		return false;
	});
	$('.discussion-event').click(function(){
		poem.log("j'envois un event à " + other);
		poem.log($(this).text());
		xmpp.event(other, $(this).text() );
		return false;
	});
});
