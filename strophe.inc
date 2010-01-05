<?php

class strophe_chat {
  function __construct($jid, $passwd) {
    $this->jid = $jid;
    $this->passwd = $passwd;
    $this->bosh_service = variable_get('strophe_bosh_url', '/http-bind');
    $this->lines = 5;
    $this->nickname = "Sponge Bob";
  }

  function tchat() {
    return "poem.Tchat('$this->bosh_service','$this->jid','$this->passwd','$this->nickname')";
  }
}

class strophe_chatroom extends strophe_chat {
  function __construct($jid, $passwd) {
    parent::__construct($jid, $passwd);
    $this->default_room = 'conference@conference.'. variable_get('strophe_domain', 'jabber.org');
  }
}
