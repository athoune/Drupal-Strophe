<h3><?php echo $chatroom->room; ?></h3>
<div id="info"></div>
<script type="text/javascript">

	$(document).ready(function(){
		var tchat = $('#tchat');
		var presence = $('#xmpp_presence');
		var info = $("#info");
		var xmpp = new Tchat(
			'<?php echo $chatroom->bosh_service; ?>',
			'<?php echo $chatroom->jid; ?>',
			'<?php echo $chatroom->passwd; ?>',
			'<?php echo $chatroom->nickname; ?>'
			);
		var room;
    xmpp.handleConnect(function(status) {
      if('connected' == status) {
        info.empty();
        room = this.room('<?php echo $chatroom->default_room; ?>', 'Drupal');
        room.presence();
      } else {
        info.text(status);
        presence.empty();
      }
    });
    xmpp.handlePresence(function(pres) {
      presence.empty();
      for(var p in this._presence) {
        var pp = this._presence[p];
        if(pp.jid.isRoom()) {
          presence.append(
            $('<li>').text(pp.jid.place)
          );
        }
      }
    });
    xmpp.handleGroupChat(function(msg) {
      log(msg);
      tchat.append(
        $("<li>")
          .append($("<b>").text((msg.nick != null) ? msg.nick : msg.from_jid.place))
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
		$('#xmpp_form').submit(function() {
			room.message($('#msg').val());
			$('#msg').val("");
			return false;
		});
	});

</script>

<ul id="xmpp_presence"></ul>

<form id="xmpp_form">
<input type="text" name="tchat" id="msg"/>
<!--<input type="button" value="Tchat" id="doTchat"/>-->
<input type="submit" value="Tchat" id="doGroup"/>
</form>
<hr/>

<div id="tchat"></div>
