<h1><?php echo $chatroom->jid; ?></h1>

<script type="text/javascript">
	var connection = null;
	var BOSH_SERVICE = '/http-bind';
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

		$('#login').click(function() {
			log("auth");
			Chatter.connect(
				$('#from').get(0).value,
				$('#mdp').get(0).value
			);
		});
		
		$('#doTchat').click(function() {
			Chatter.chat(
				$('#cible').get(0).value,
				$('#msg').get(0).value
			);
			$('#msg').get(0).value = "";
		});
		$('#doGroup').click(function() {
			Chatter.groupchat(
				'beuha@conference.garambrogne.net',
				$('#msg').get(0).value
			);
			$('#msg').get(0).value = "";
		});
	});

</script>

<input type="text" name="tchat" id="msg"/>
<input type="button" value="Tchat" id="doTchat"/>
<input type="button" value="group" id="doGroup"/>
<hr/>

<div id="tchat"></div>
