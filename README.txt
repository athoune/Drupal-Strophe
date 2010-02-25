-- SUMMARY --

Brings all XMPP wonders to Drupal, interacting with user via javascript and plain old HTTP.
Strophe javascript library is used for handling all javascript gears :
http://code.stanziq.com/strophe/

-- REQUIREMENTS --
XMPP server with http-binding is the same domain as the drupal web site.
Developpement is done with Ejabberd and its modules
 * mod_muc
 * mod_http_bind

With the Drupal's module ejabberd_auth, drupal can provides users to ejabberd :
http://github.com/athoune/Drupal-Ejabberd-Auth

-- CONFIGURATION --

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

In your theme, you should have something like :
8<------------------------------------------------------

#tchat {
	overflow: auto;
	height: 100px;
	border: thin solid black ;
}

------------------------------------------------------>8

-- USAGE --
Strophe use sub modules: muc and chat. Muc is for Multi User Chatroom, and chat is a one to one discussion. With Ejabberd external auth, you don't have any user, so, every rosters are empty. For handling user presence, a simple chatroom is used, every user join this room, and you can display it or just use it for connection status.

The MUC module provides two blocks, one for the presence list, the other for the chatroom.
If you wont, presence list can be used as a starting point for a private discussion.

The Chat module provide one page, for a one to one discussion. The easiest way is to use presence list to trigger a discussion.

-- FRAMEWORK --
Strophe module is not a gtalk clone, it's a framework with usable features. You can use the power of xmpp and javascript with it. Event or query can be send throw XMPP. I click somewhere on my browser, something will happening on my correspondent's browser. I can ask query, and handling answer too.

The Strophe Javascript framework was build to handle chess party.

Psi is ugly xmpp client, but its XML console is priceless.
http://psi-im.org/

-- LATER --
 * No fancy pubsub stuuf is used, for now.
 * Chat as a popup, everywhere.

-- CONTACT --
Mathieu - http://drupal.org/user/378820
