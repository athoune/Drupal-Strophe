-- SUMMARY --

Brings all XMPP wonders to Drupal, interacting with user via javascript and plain old HTTP.
Strophe javascript library is used for handling all javascript gears :
http://code.stanziq.com/strophe/

-- REQUIREMENTS --
XMPP server with http-binding is the same domain as the drupal web site.
Developpement is done with Ejabberd and its modules
 * mod_muc
 * mod_http_bind
 * mod_webpresence can be nice

With the Drupal's module ejabberd_auth, drupal can provides users to ejabberd.

-- USAGE --
 * Install and configure an Ejabberd with drupal authentification and module http_bind.
 * Use proxy on your web server (apache, lighttpd ...) to provide /http-bind in the same adress as your website
 * Puts chat block where you wont on your website.

-- CONTACT --
Mathieu - http://drupal.org/user/378820
