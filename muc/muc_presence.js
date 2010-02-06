poem.behaviors.append(function(){
    var directTalk = function(who) {
        console.log('id', who);
    };
    var presence = $('#xmpp_presence');
    muc_room.handleAvailable(function(pres){
        var u = pres.jid.place;
        if(presence.data('users')[u] == null) {
            presence.data('users')[u] = true;
            var li = $('<li>').attr('id', 'user-' + u);
            if(Drupal.settings.strophe.click_to_talk) {
                li.append($('<a>')
                    .attr('href', '#')
                    .text(u)
                    .click(function(){
                        var id = $(
                            $(this).parent().get(0)
                        ).attr('id').substr(5);
                        directTalk(id);
                        return false;
                    })
               );
            } else {
               li.text(u);
            }
            presence.append(li);
        }
    });
    muc_room.handleNotAvailable(function(pres){
        var u = pres.jid.place;
        if(presence.data('users')[u] != null) {
            presence.find('#user-' + u).remove();
        }
    });
    xmpp.handleConnect(function(status) {
        if(Strophe.Status.CONNECTED == status) {
            presence.empty();
            presence.data('users', {});
        } else {
            info.text(poem.Tchat.status(status));
            presence.empty();
        }
        return true;
    });

});