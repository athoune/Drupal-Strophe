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

You have to choose a domain for your xmpp server, it may be a real domain, if you wont to use classical xmpp client, or a fake one if you only wont to use it inside Drupal.

Ejabberd

Install and configure an Ejabberd with drupal authentification

Set your domain. Here, I use a fake domain : tchat.tld

8<------------------------------------------------------

%% Hostname
{hosts, ["localhost", "tchat.tld"]}.

------------------------------------------------------>8

Configure http_bind
8<------------------------------------------------------

{5280, ejabberd_http, [
       http_bind,
       http_poll,
       web_admin,
       ]}
]}.

------------------------------------------------------>8

And load the module in the right place, in the modules block, near the end of the config file. Be careful with the ending comma.

8<------------------------------------------------------

{mod_http_bind,  []},

------------------------------------------------------>8

Restart ejabberd. If you try to connect with a web browser to http://myserver:5280/http-bind you should see :

8<------------------------------------------------------
Ejabberd mod_http_bind v1.2

An implementation of XMPP over BOSH (XEP-0206)
------------------------------------------------------>8

http bind may not work with packaged version, use the source to compile a fresh ejabberd.

Web server

Use proxy on your web server (apache, lighttpd ...) to provide /http-bind in the same adress as your website. Be careful with open proxy.
Here is an apache 2 configuration example :

8<------------------------------------------------------

ProxyVia on
ProxyRequests off
ProxyPreserveHost on
Proxy *>
	Order deny,allow
	Allow from all
</Proxy>

ProxyPass /http-bind http://127.0.0.1:5280/http-bind
ProxyPassReverse /http-bind http://127.0.0.1:5280/http-bind

------------------------------------------------------>8

Restart Apache. You should see the debug page on http://myserver/http-bind

Drupal

Go to /admin/settings/strophe to set your domain

Puts chat block where you wont on your website.

-- CONTACT --
Mathieu - http://drupal.org/user/378820
