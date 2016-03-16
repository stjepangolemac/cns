/**
 * Implement different utility functions.
 * (This is an example of the JavaScript Module Pattern)
 * 
 * Please check https://darrenderidder.github.io/talks/ModulePatterns
 */
var crypto = require('crypto'),
    date = new Date(),
    params =  {usernameLength: 5}; // Default username length.

var Utils = function(_params) {
        
    if (typeof params != 'undefined') {
        /* Iterate over the key of params object. */
        var keys = Object.keys(_params),
            len = keys.length,
            i = 0,
            key;
        while (i < len) {
            key = keys[i];
            params[key] = _params[key];
            i += 1;
        }    
    }
};

Utils.prototype.hash = hash;

Utils.prototype.getRandomName = function() {
    return hex2pwd( hash( date.getTime().toString() ) );
}

function hash(input) {
    return crypto.createHash('sha1').update(input).digest('hex');
}

function hex2pwd( hexx ) {
    var hex = hexx.toString();
    var str = '';
    var dec = 0;
    for (var i = 0; i < hex.length; i += 2) {
        dec = parseInt(hex.substr(i, 2), 16) % 25;
        if ( dec >= 10 && dec<=25 ) {
            dec = dec+55;
            str += String.fromCharCode(dec);
            if ( str.length >= params.usernameLength ) break;
        }
    }
    return str;
}

module.exports = Utils;