$(function(){
    var tchat = $('#tchat');
    var presence = $('#xmpp_presence');
    var info = $("#info");
    poem.log("settings");
    var room;
    xmpp.handleConnect(function(status) {
        if(Strophe.Status.CONNECTED == status) {
            info.empty();
            room = this.room(Drupal.settings.room);
            presence.empty();
            presence.data('users', {});
            room.handleAvailable(function(pres){
                var u = pres.jid.place;
                if(presence.data('users')[u] == null) {
                    presence.data('users')[u] = true;
                    presence.append($('<li>').attr('id', 'user-' + u).text(u));
                }
            });
            room.handleNotAvailable(function(pres){
                var u = pres.jid.place;
                if(presence.data('users')[u] != null) {
                    presence.find('#user-' + u).remove();
                }
            });
            room.presence();
        } else {
            info.text(poem.Tchat.status(status));
            presence.empty();
        }
        return true;
    });
    xmpp.handleEvent(function(event) {
        poem.log(event.textContent);
    });
    xmpp.handleGroupChat(function(msg) {
        poem.log(msg);
        tchat.append(
            $("<li>")
            .append($("<b>").text((msg.nick != null) ? msg.nick : msg.from_jid.place))
            .append(": " + msg.body)
        );
        tchat.scrollTop(tchat.attr('scrollHeight'));
    });
    xmpp.handleServerMessage(function(msg) {
        poem.log(msg);
        alert(msg.body.textContent);
    });
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
