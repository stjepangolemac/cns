'use strict'

// AES algorithm
// --------------------------------------

var crypto = require('crypto');

// Control logging with this flag
var logging = false;

// Choose mode here
const algorithm = 'aes-128-ecb';
//const algorithm = 'aes-128-cbc';

//function getKey (password, salt, callback) {
//	crypto.pbkdf2(password, salt, 60000, 16, 'sha256', function(err, key) {
//        if (err) throw err;
//        callback(key);
//    });
//}

function getIV () {
	var iv = crypto.randomBytes(16);
	return iv;
}

function encrypt (key, iv, plaintext) {
	if(algorithm == 'aes-128-ecb') iv = new Buffer('');
    var cipher = crypto.createCipheriv(algorithm, key, iv);    
    cipher.setAutoPadding(true);
    var ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);        
    return ciphertext;
}

function decrypt (key, iv, ciphertext) {
	if(algorithm == 'aes-128-ecb') iv = new Buffer('');
    var decipher = crypto.createDecipheriv(algorithm, key, iv);    
    decipher.setAutoPadding(false); // IMPORTANT: By default OpenSSL uses PKCS#7 padding.    
    var plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext;
}

function pack (iv, ciphertext) {
	if(algorithm == 'aes-128-ecb') iv = new Buffer('');
	var item = Buffer.concat([iv, ciphertext]);
	return item;
}

function unpack (item) {
	var ivlength = 16;
	if(algorithm == 'aes-128-ecb') ivlength = 0;
	var ciphertext = item.slice(ivlength, item.length);
	return ciphertext;
}

module.exports = {encrypt, decrypt, pack, unpack, getIV};

//getKey('tralala', '13371337', function(key) {
//	console.log(key.toString('utf8'));
//});

//console.log(getIV());
//var key = crypto.pbkdf2Sync('sifraaa', '3655654dd', 60000, 16, 'sha256');
//var ciphertext = encrypt(key, '', 'radovane crni r');
//console.log('Ciphertext is: ', ciphertext);
//var plaintext = decrypt(key, '', ciphertext);
//console.log('Plaintext is: ', plaintext.toString('utf8'));
//var pacek = pack('', ciphertext);
//console.log('Package is: ', pacek);
//console.log('Unpackaged is : ', unpack(pacek, 0));