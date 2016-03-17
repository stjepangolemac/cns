// Control logging with this flag.
var flag = false;

function seed(key) {
    var seed = 0;
    for (var i = 0; i < key.length; i++) {
        seed += key[i].charCodeAt(0);
    }
    return seed;
}

function encrypt(plaintext, key) {
    if (flag) console.log("encryption started!, plaintext is: ", plaintext);
    var c,
        ciphertext = "";
    var seedling = seed(key);
    
    if (seedling < 0 || seedling > 25) {
        seedling = seedling % 25;
        if (flag) console.log("encryption seedling is:", seedling);
    }

    for (var i = 0, len = plaintext.length; i < len; i++) {

        c = plaintext.charCodeAt(i);
        if (c >= 65 && c <= 90) { // Upper-case letters
            c = c + seedling; if (flag) console.log("c is:", c);
            if (c > 90) c -= 26;
            if (c < 65) c += 26;
            ciphertext += String.fromCharCode(c);
        } else if (c >= 97 && c <= 122) { // Lower-case letters
            c = c + seedling; if (flag) console.log("c is:", c);
            if (c > 122) c -= 26;
            if (c < 97) c += 26;
            ciphertext += String.fromCharCode(c);
        } else {
            ciphertext += plaintext.charAt(i);
        }
    }
    if (flag) console.log("ciphertext is: ", ciphertext, "\n");
    return ciphertext;
};

function decrypt(ciphertext, key) {
    if (flag) console.log("decryption started!, ciphertext is: ", ciphertext);
    var c,
        plaintext = "";
    var seedling = seed(key);

    if (seedling < 0 || seedling > 25) {
        seedling = seedling % 25;
        if (flag) console.log("decryption seedling is:", seedling);
    }

    for (var i = 0, len = ciphertext.length; i < len; i++) {

        c = ciphertext.charCodeAt(i);
        if (c >= 65 && c <= 90) { // Upper-case letters
            c = c - seedling; if (flag) console.log("c is:", c);
            if (c > 90) c -= 26;
            if (c < 65) c += 26;
            plaintext += String.fromCharCode(c);
        } else if (c >= 97 && c <= 122) { // Lower-case letters
            c = c - seedling; if (flag) console.log("c is:", c);
            if (c > 122) c -= 26;
            if (c < 97) c += 26;
            plaintext += String.fromCharCode(c);
        } else {
            plaintext += ciphertext.charAt(i);
        }
    }
    if (flag) console.log("plaintext is: ", plaintext, "\n");
    return plaintext;
};

module.exports = {encrypt: encrypt};
module.exports = {decrypt: decrypt};