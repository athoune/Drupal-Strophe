<h3><?php echo $chatroom->room; ?></h3>
<script type="text/javascript">

	$(document).ready(function(){
		var tchat = $('#tchat');
		var presence = $('#xmpp_presence');
		var xmpp = new Tchat(
			'<?php echo $chatroom->bosh_service; ?>',
			'<?php echo $chatroom->jid; ?>',
			'<?php echo $chatroom->passwd; ?>',
			'<?php echo $chatroom->nickname; ?>'
			);
		var room;
    xmpp.handleConnect(function() {
      room = this.room('<?php echo $chatroom->default_room; ?>', 'Drupal');
      room.presence();
    });
    xmpp.handlePresence(function(pres) {
      presence.empty();
      for(var p in this._presence) {
        var pp = this._presence[p];
        log(pp.jid);
        if(pp.jid.isRoom()) {
          presence.append(
            $('<li>').text(pp.jid.place)
          );
        }
      }
    });
    xmpp.handleAnyChat(function(msg) {
      tchat.append(
        $("<li>")
          .append($("<b>").text((msg.nick != null) ? msg.nick : msg.from))
          .append(": " + msg.body)
      );
    });
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

<ul id="xmpp_presence"></ul>

<input type="text" name="tchat" id="msg"/>
<!--<input type="button" value="Tchat" id="doTchat"/>-->
<input type="button" value="group" id="doGroup"/>
<hr/>

<div id="tchat"></div>
