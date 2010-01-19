<?php
include_once drupal_get_path('module', 'ejabberd_auth') . '/drupalAuth.inc';

function strophe_jid($user) {
	return is_string($user) ? $user : $user->name .'@'
		. variable_get('strophe_domain', 'jabber.org') .'/'
		. variable_get('strophe_place', 'Drupal_Strophe_Client');
}
class strophe_user {
  function __construct($user) {
    $this->jid = strophe_jid($user);
    $this->nickname = is_string($user) ? "Sponge Bob" : $user->name;
  }
}

class strophe_poem {
  /**
   * $user can be a jid, or a drupal user object
   * $password is optional
   */
  function __construct($user, $passwd = null) {
    $this->jid = strophe_jid($user);
    $this->nickname = is_string($user) ? "Sponge Bob" : $user->name;
    $this->passwd = ($passwd != null) ? $passwd : ejabberd_auth_hash($user->name);
    $this->bosh_service = variable_get('strophe_bosh_url', '/http-bind');
    $this->lines = 5;
    $this->default_room = 'conference@conference.'. variable_get('strophe_domain', 'jabber.org');
  }

  /**
   * javascript object
   */
  function tchat() {
    return "poem.Tchat('$this->bosh_service','$this->jid','$this->passwd','$this->nickname')";
  }

  function js_init() {
	static $xmpp = TRUE;
	if($xmpp) {
		$xmpp = FALSE;
    return <<<EOF
if(typeof xmpp == 'undefined') {
	var xmpp = new poem.Tchat('$this->bosh_service','$this->jid','$this->passwd','$this->nickname');
}
EOF;
	}
	return '';
  }
}