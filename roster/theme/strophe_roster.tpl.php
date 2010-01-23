<script type="text/javascript">

$(function(){
	var roster = $('#xmpp-roster');
  xmpp.handlePresence(function(pres) {
    roster.empty();
    for(var p in this._presence) {
      poem.log(pp.jid.place);
      var pp = this._presence[p];
      //if(pp.jid.isRoom()) {
        presence.append(
          $('<li>').text(pp.jid.place)
        );
      //}
    }
  });
}
</script>

<ul id="xmpp-roster">
</ul>