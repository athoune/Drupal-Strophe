<?php
include_once drupal_get_path('module', 'ejabberd_auth') . '/drupalAuth.inc';

/**
 * Build a jabber id from a drupal user
 */
function strophe_jid($user) {
	return is_string($user) ? $user : $user->name .'@'
		. variable_get('strophe_domain', 'jabber.org') .'/'
		. variable_get('strophe_place', 'Drupal_Strophe_Client');
}
