<script type="text/javascript">
$(function(){
  var roster = $('#xmpp-roster');
  xmpp.handlePresence(function(pres) {
    roster.empty();
    //poem.log(this._presence);
    for(var p in this._presence) {
      var pp = this._presence[p];
      poem.log(pp.jid);
      if(pp.jid.domain.split('.')[0] != 'conference') {
        roster.append(
          $('<li>').text(pp.jid.user)
        );
      }
    }
  });
});
</script>

<ul id="xmpp-roster">
</ul>