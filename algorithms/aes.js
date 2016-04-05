'use strict'

// AES algorithm
// --------------------------------------

var crypto = require('crypto');

// Control logging with this flag
var logging = false;
// For now, there was no need for logging

// Choose mode here
//const algorithm = 'aes-128-ecb';
const algorithm = 'aes-128-cbc';

function getKey (password, salt) {
	var key = crypto.pbkdf2Sync(password, salt, 60000, 16, 'sha256');
	return key;
}

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
	var IVandCipher = [item.slice(0, ivlength), item.slice(ivlength, item.length)];
	return IVandCipher;
}

module.exports = {encrypt, decrypt, pack, unpack, getIV};

var plaintext ='Ovo je neki sample tekst.';
var key = getKey('sifra123asd', '13371337');
var iv = getIV();
console.log('IV je: ', iv);

var ciphertext = encrypt(key, iv, plaintext);
console.log('Ciphertext je: ', ciphertext);

var packed = pack(iv, ciphertext);
console.log('Packed je: ', packed);

var unpacked = unpack(packed);
console.log('Unpacked je: ', unpacked);

console.log('Plaintext je: ', decrypt(key, unpacked[0], unpacked[1]).toString('utf8'));