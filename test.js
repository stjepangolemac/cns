var caesar = require('./Caesar');

var plain = "if you already have a documentation method that works for you";
var key = "milevolidiskodisko";

console.log("Plain is:", plain);
console.log("Cipher is:", caesar.encrypt(plain, key));
console.log("Deciphered is:", caesar.decrypt(caesar.encrypt(plain, key), key));