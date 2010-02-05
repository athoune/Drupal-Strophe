var muc_room;
Drupal.behaviors.muc = function(context){
    muc_room = xmpp.room(typeof Drupal.settings.strophe.room == 'string' ? Drupal.settings.strophe.room : Drupal.settings.strophe.room[0]);
    xmpp.handleEvent(function(event) {
        poem.log(event.textContent);
    });
    xmpp.handleServerMessage(function(msg) {
        poem.log(msg);
        alert(msg.body.textContent);
    });
};
