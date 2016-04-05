'use strict'
var net = require('net');
var debug = require('debug')('server'); // set DEBUG=server

var HOST = '0.0.0.0';
var PORT = 6968;

//const MAX_CLIENTS = 200;
var date = new Date();

var CLIENTS = [];

var utils = (function() {
	var crypto = require('crypto');

	var hex2dec = function(hexx) {
		var hex = hexx.toString();
		var str = '';
		var dec = 0;
		for (var i = 0; i < hex.length; i += 2) {
			dec = parseInt(hex.substr(i, 2), 16) % 25;
			if (dec >= 0 && dec <= 9) {
				dec = dec + 48;
				str += String.fromCharCode(dec);
			}
		}
		return str;
	}

	function getID() {
		return "ID" + hex2dec(crypto.randomBytes(30).toString('hex'));
	}

	return {
		getID: getID
	}
})();

var server = net.createServer(function(socket) {

	socket.on('data', function(data) {
		if (socket.username) { // client already registered
			broadcast(socket, data);
		} else { // client not registered yet
			try {
				socket.username = JSON.parse(data).username;

				broadcast(socket, JSON.stringify({
					type: 1, // 1 = new client joined
					clientID: socket.clientID,
					username: socket.username
				}));

			} catch (err) {
				debug(err);
				debug(data);
			}
		}
	});

	socket.on('error', function(error) {
		debug('ERROR ' + error.stack);
		deleteFromArray(socket.clientID);
	});

	socket.on('end', function() {
		deleteFromArray(socket.clientID);
	});

	socket.on('close', function() {
		debug('SOCKET CLOSED');
	});

});

server.listen(PORT, HOST, function() {
	debug('Server listening on ' + server.address().address + ':' + server.address().port);
});

server.on('connection', function(socket) {
	debug('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
	socket.clientID = utils.getID();
	CLIENTS.push(socket);
	socket.write(JSON.stringify({
		type: 0, // 0 = init message
		username: "SERVER@FESB",
		timestamp: date.getHours() + ":" + ('0' + date.getMinutes()).slice(-2),
		content: "Welcome to CHAT@FESB!",
		clients: getNames(socket)
	}));

	printClients(CLIENTS);
});

function broadcast(sender, msg) {
	debug('BROADCAST: ' + msg);

	var _msg = JSON.parse(msg);
	if(_msg.isEncrypted) {
		var buff = new Buffer(_msg.content);
		_msg.content = mixBuffer(buff, 'one', 'cbc');

		msg = JSON.stringify(_msg);
	}

	for (var i = 0, len = CLIENTS.length; i < len; i++) {
		if (typeof CLIENTS[i].clientID !== 'undefined' && CLIENTS[i] !== sender) {
			debug('SENDING: ' + sender.remotePort + '(' + sender.clientID + ') --> ' + CLIENTS[i].remotePort + '(' + CLIENTS[i].clientID + ')');
			CLIENTS[i].write(msg);
		}
	}
}


function deleteFromArray(clientID) {
	var client;
	for (var i = 0, len = CLIENTS.length; i < len; i++) {
		if (CLIENTS[i].clientID === clientID) {
			debug('DELETING clientID: ' + clientID);
			client = CLIENTS[i];
			CLIENTS.splice(i, 1);
			break;
		}
	}

	broadcast(client, JSON.stringify({
		type: 2, // 2 = client left
		clientID: client.clientID
	}));

	printClients(CLIENTS);
}

function printClients(clientArray) {
	debug('CLIENTS:')
	for (var i = 0, len = clientArray.length; i < len; i++) {
		debug((i + 1) + '. ' + clientArray[i].remoteAddress + ':' + clientArray[i].remotePort + ' (id: ' + clientArray[i].clientID + ')');
	}
}

function getNames(receiver) {
	var _clients = {
		'clientID': receiver.clientID,
		'clients': []
	};

	for (var i = 0, len = CLIENTS.length; i < len; i++) {
		if (typeof CLIENTS[i].clientID !== 'undefined') {
			_clients.clients.push({
				username: CLIENTS[i].username,
				clientID: CLIENTS[i].clientID
			});
		}
	}
	return _clients;
}

function mixBuffer(buff, mixwhat, aesmode) {
	console.log('Buff is:\t', buff);
	var buff2;
	var blocks = buff.length/16;

	if(mixwhat == 'all') {
		do { // Here the buffer is being mixed
			var tempbuff = buff;
			buff2 = new Buffer('');

			for (var i = 0; i <= blocks-1; i++) {
				var block = getRandomInt(0,blocks-1);
				if(aesmode == 'cbc' && i == 0) {
					buff2 = Buffer.concat([buff2, tempbuff.slice(0,16)]);
					i++;
				}
				buff2 = Buffer.concat([buff2, tempbuff.slice(block*16, block*16+16)]);
			}
		} while(buff.compare(buff2) == 0); // If the mixed buffer is the same as initial, mix again
	} else if(mixwhat == 'one') {
		do {
			var tempbuff = buff;
			buff2 = new Buffer('');
			var ifcbc = 0;
			if(aesmode == 'cbc') ifcbc = 1;
			var blockToSwap = getRandomInt(ifcbc,blocks-1);
			var swapBlock = getRandomInt(0,blocks-1);

			buff2 = Buffer.concat([buff.slice(0, blockToSwap*16), buff.slice(swapBlock*16, swapBlock*16+16), buff.slice(blockToSwap*16+16, buff.length)]);
		} while(buff.compare(buff2) == 0);
	}
	console.log('Mixed buff is:\t', buff2);
	console.log('Are they ==?', buff.compare(buff2));

	return buff2;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}