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
		if (typeof CLIENTS[i].clientID !== 'undefined' && CLIENTS[i] !== receiver) {
			_clients.clients.push({
				username: CLIENTS[i].username,
				clientID: CLIENTS[i].clientID
			});
		}
	}
	return _clients;
}