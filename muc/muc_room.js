poem.behaviors.append(function(){
    var info = $("#info");
    xmpp.handleConnect(function(status) {
		poem.log(['room connect', Strophe.Status.CONNECTED == status]);
        if(Strophe.Status.CONNECTED == status) {
            info.empty();
        } else {
            info.text(poem.Tchat.status(status));
        }
        return true;
    });
    muc_room.handleMessage(function(msg) {
        poem.log(msg);
        tchat.append(
            $("<li>")
            .append($("<b>").text((msg.nick != null) ? msg.nick : msg.from_jid.place))
            .append(": " + msg.body)
        );
        tchat.scrollTop(tchat.attr('scrollHeight'));
    });
    
    var tchat = $('#tchat');
    $('#doTchat').click(function() {
        xmpp.chat(
            $('#cible').get(0).value,
            $('#msg').get(0).value
        );
        $('#msg').get(0).value = "";
        return false;
    });
    $('#xmpp_form').submit(function() {
        room.message($('#msg').val());
        $('#msg').val("");
        return false;
    });
    $('#event').click(function(){
        room.event('admin@tchat.tld', 'carotte');
        return false;
    });
});