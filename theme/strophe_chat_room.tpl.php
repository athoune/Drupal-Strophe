<h3><?php echo $chatroom->jid; ?></h3>
<script type="text/javascript">

	$(document).ready(function(){
		var tchat = $('#tchat');
		var xmpp = new Tchat(
			'<?php echo $chatroom->bosh_service; ?>',
			'<?php echo $chatroom->jid; ?>',
			'<?php echo $chatroom->passwd; ?>'
			);
		var room;
    xmpp.connect__presence_room = function() {
      room = this.room('<?php echo $chatroom->default_room; ?>','Drupal');
      room.presence();
    };
		xmpp.connect();
/*
		$('#login').click(function() {
			log("auth");
			Chatter.connect(
				$('#from').get(0).value,
				$('#mdp').get(0).value
			);
		});
		*/
		$('#doTchat').click(function() {
			xmpp.chat(
				$('#cible').get(0).value,
				$('#msg').get(0).value
			);
			$('#msg').get(0).value = "";
		});
		$('#doGroup').click(function() {
			room.message($('#msg').val());
			$('#msg').val("");
		});
	});

</script>

<input type="text" name="tchat" id="msg"/>
<!--<input type="button" value="Tchat" id="doTchat"/>-->
<input type="button" value="group" id="doGroup"/>
<hr/>

<div id="tchat"></div>
