var muc_room;
Drupal.behaviors.muc = function(context){
    muc_room = xmpp.room(Drupal.settings.strophe.room);
    xmpp.handleEvent(function(event) {
        poem.log(event.textContent);
    });
    xmpp.handleServerMessage(function(msg) {
        poem.log(msg);
        alert(msg.body.textContent);
    });
};
