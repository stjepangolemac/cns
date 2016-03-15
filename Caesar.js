function encrypt(plaintext, key) {
    var c,
        ciphertext = "";
        
    if (key < 0 || key > 25) {
        console.log("ERROR: 'key' out of range [0,25]");
        return;    
    }        
        
    for (var i = 0, len = plaintext.length; i < len; i++) {
        
        c = plaintext.charCodeAt(i);
        //console.log(c);
        if (c >= 65 && c <= 90) { // Upper-case letters
            c = c + (key % 26);            
            if (c > 90) c -= 26;
            ciphertext += String.fromCharCode(c);
        } else if (c >= 97 && c <= 122) { // Lower-case letters
            c = c + (key % 26);
            if (c > 122) c -= 26;
            ciphertext += String.fromCharCode(c);
        } else {
            ciphertext += plaintext.charAt(i);
        } 
    }
    return ciphertext;
};

var plaintext = "Ovo je Samo test.";
console.log("plaintext: ", plaintext);
console.log("ciphertext: ", encrypt(plaintext, 3));


//module.exports = {encrypt: encrypt};