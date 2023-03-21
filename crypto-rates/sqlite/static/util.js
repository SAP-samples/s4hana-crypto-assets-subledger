//  random hex string generator
var randHex = function(len) {
    var maxlen = 12,
        min = Math.pow(16,Math.min(len,maxlen)-1) 
        max = Math.pow(16,Math.min(len,maxlen)) - 1,
        n   = Math.floor( Math.random() * (max-min+1) ) + min,
        r   = n.toString(16);
    while ( r.length < len ) {
       r = r + randHex( len - maxlen );
    }
    return r;
  };
  
  var genTenantID = function() {
    return randHex(8) + "-" + randHex(4) + "-" + randHex(4) + "-" + randHex(4) + "-" + randHex(`12`);
  };
  
  var genTrialTenantID = function() {
    return "0abbacab" + "-" + randHex(4) + "-" + randHex(4) + "-" + randHex(4) + "-" + randHex(`12`);
  };
  
  var checkForTenantID = function(tid) {
    let pattern = /[0-9A-Fa-f\-]/g;
    let result = tid.match(pattern);
    if ((!!result) && (result.length == 36) && (tid.charCodeAt(8) == 45) && (tid.charCodeAt(13) == 45) && (tid.charCodeAt(18) == 45) && (tid.charCodeAt(23) == 45)) {
      return true;
    } else {
      return false;
    }
      
  };
  
