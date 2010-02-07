poem.behaviors.append(function(){
    var directTalk = function(who) {
        poem.log('id', Drupal.settings.strophe.direct_talk_url + who);
//demande de discussion en direct, puis, redirection vers la page pour les deux personnes
        //document.location.href = Drupal.settings.strophe.direct_talk_url + who;
        xmpp.wannaTalk(who + '@' + Drupal.settings.xmpp.jid.split('@')[1]);
    };
    var presence = $('#xmpp_presence');
    muc_room.handleAvailable(function(pres){
        var u = pres.jid.place;
        if(presence.data('users')[u] == null) {
            presence.data('users')[u] = true;
            var li = $('<li>').attr('id', 'user-' + u);
            if(Drupal.settings.strophe.click_to_talk && Drupal.settings.strophe.me != u) {
                li.append($('<a>')
                    .attr('href', '#')
                    .text(u)
                    .click(function(){
                        directTalk(u);
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