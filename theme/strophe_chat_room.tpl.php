<h3><?php echo $chatroom->jid; ?></h3>

<script type="text/javascript">
	var connection = null;
	var BOSH_SERVICE = '<?php echo $chatroom->bosh_service; ?>';
	var chatter = null;

	function log(what) {
		console.log(what);
	}

	function rawInput(data) {
		log('RECV: ' + data);
	}

	function rawOutput(data) {
		log('SENT: ' + data);
	}

	$(document).ready(function(){
		tchat = $('#tchat');
		
		connection = new Strophe.Connection(BOSH_SERVICE);
		connection.rawInput = rawInput;
		connection.rawOutput = rawOutput;
		Chatter.connection = connection;
		
		Chat.prototype.handleMessage = function(from, to, type, body) {
			tchat.append('<p><b>' + from + '</b> : ' + body + '</p>');
		}
		Chatter.connect('<?php echo $chatroom->jid; ?>', '<?php echo $chatroom->passwd; ?>');
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
			Chatter.chat(
				$('#cible').get(0).value,
				$('#msg').get(0).value
			);
			$('#msg').get(0).value = "";
		});
		$('#doGroup').click(function() {
			var msg = $('#msg').get(0).value;
			log('Message : ' + msg);
			Chatter.groupchat(
				'<?php echo $chatroom->room; ?>',
				msg
			);
			$('#msg').get(0).value = "";
		});
	});

</script>

<input type="text" name="tchat" id="msg"/>
<!--<input type="button" value="Tchat" id="doTchat"/>-->
<input type="button" value="group" id="doGroup"/>
<hr/>

<div id="tchat"></div>
