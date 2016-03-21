'use strict'

var $ = require('jquery');
var net = require('net');
var Handlebars = require('handlebars');
// Import our own modules.
var Bind = require('./binder');
var Utils = require('./utils'),
    utils = new Utils({usernameLength: 8});
var Caesar = require('./Caesar');

var Clients = require('./controllers/clientCredentials.js'),
    clients; // A reference to a new clients object    

/* Default server info. */
var SERVER = {    
    server: 'localhost',
    port: '6968',
    nickname: utils.getRandomName()
};

/* Bind serverModel to the corresponding input fields. */

var serverModel = Bind(SERVER);


/* Readin and compile Handlebar msg template/s. */
var msgTmpl, msgTmplCompiled;
try {
    msgTmpl = require('fs').readFileSync('./view/msg.handlebars', 'utf-8');
} catch (err) {
    // Handle an error (e.g., file-not-found error)
    msgTmpl = '<div>' + err + '</div>'; // TODO: Inform the user...
} finally {
    msgTmplCompiled = Handlebars.compile(msgTmpl);  
}


var msg = {};
var date = new Date();
var username = null,
    clientID = null;

var clientSocket = null;
var TIMEOUT = 2000; /* Wait at most 2sec after requesting connection to the server.  */

$(window).bind('beforeunload', function(){
    //clientSocket.end('Client says: reloading');
	if (typeof clientSocket !== 'undefined' && username)
        clientSocket.destroy();
});

$(document).ready(function() {    
    
    var introPage = $(".intro"),
        mainPage =  $(".main"),
	    sendBtn = $("#botun"),
        joinBtn = $("#join"),
	    contentBox = $("#content"),
	    inputBox = $("#inputBox");
                               
    
    /* Make the intro page visible at the start of the app. */
    introPage.addClass('visible');
        
    if ( joinBtn.length ) { /* 'joinBtn' exist? */
        var timer;
        joinBtn.on("click", function() {
            var loader = showLoader(introPage, "Connecting to " + serverModel.server + ':' + serverModel.port); 
            
            try {
                clientSocket = net.connect({port: serverModel.port, host: serverModel.server
                }).on('connect', function() {
                        clearTimeout(timer);
                        username = serverModel.nickname;                                        

                        clientSocket.write( JSON.stringify({username: username}) ); // nickname selected by the user
                                                    
                        /* Hide intro then show main */
                        hide(introPage, 500, show(mainPage)); 
                        inputBox.focus();                
                        
                }).on('data', function(msg) {
                        clearTimeout(timer);      
                        try {
                            var _msg = JSON.parse(msg);
                            
                            /**
                             * Here we handle CONTROL messages.
                             */
                            if (_msg.type === 0) { // INIT message
                                clients = new Clients(mainPage, _msg.clients); 
                                                                                              
                                clientID = _msg.clients.clientID;
                                _msg.direction = 'incoming';
                                addMsg(msgTmplCompiled, contentBox, _msg);                                                                                                
                            
                            } else if (_msg.type === 1 && _msg.clientID && _msg.username) { // NEW CLIENT
                                clients.addClient(_msg);
                                
                            } else if (_msg.type === 2 && _msg.clientID ) { // CLIENT LEFT
                                clients.removeClient(_msg);
                            }
                            
                            /**
                             * Here we handle REGULAR messages (shown to the user).
                             */                            
                            if (_msg.clientID && _msg.username && _msg.timestamp && _msg.content) {
                                _msg.direction = 'incoming';

                                _msg.content = Caesar.decrypt(_msg.content, clients.getSecretOf(_msg.clientID));
                                addMsg(msgTmplCompiled, contentBox, _msg);
                                
                                console.log(_msg.clientID, "secret:", clients.getSecretOf(_msg.clientID));
                            }
                               
                        } catch(err) {
                            console.log(err);
                            console.log(msg);
                        }
                        
                }).on('error', function(err) {
                    clearTimeout(timer);
                    
                    hide(loader, 500); 
                    
                    /* Hide main, show intro. */
                    hide(mainPage, 250);
                    show(introPage, 250);
                                    
                    setTimeout(function(){ /* Give some time to the mainPage to dissapear (alert blocks it). */
                        alert(err);
                        location.reload(); /* Clean up everything. */  
                    }, 500);                
                });     
            
                timer = setTimeout(function() {
                    clientSocket.destroy();
                    hide(loader, 500);
                    setTimeout(function(){ /* Give some time to loader to dissapear (alert blocks it). */
                        alert('Connection to server "' + serverModel.server + ':' + serverModel.port + '" timed out!');
                    }, 50);        
                }, (TIMEOUT || 5000));
                
            } catch(err) {
                clearTimeout(timer);
                hide(loader, 500);
                alert(err);
            }      
        });   
    }

	if (sendBtn.length && contentBox.length ) { /* Check if DOM elements actually exist. */
		sendBtn.on("click", function(){
			var _msg = $.trim(inputBox.text());
			if ( _msg != '' ) {
				_msg = {clientID: clientID,
                        username: username,
						timestamp: date.getHours() + ":" + ('0' + date.getMinutes()).slice(-2),
						content: Caesar.encrypt(_msg, clients.getSecretOf(clientID))};
                        //content: _msg};

				clientSocket.write( JSON.stringify(_msg), function() {
                    addMsg(msgTmplCompiled, contentBox, _msg);
                });
			}
            
            inputBox.text('');

		});
	}

	$(document).keypress(function(e) {
		if(e.which == 13) {
			//ipc.send('electron-toaster-message', msg);            
            if ( mainPage.is('.visible') && sendBtn ) {
                sendBtn.trigger("click");
                return;
            }
            if ( introPage.is('.visible') && joinBtn ) joinBtn.trigger("click");
		}
	});
    
});

/* Using Handlebars templates. */
function addMsg(template, container, msg) {        
	msg.msg_cloud = 'out-msg-cloud';
    
    switch (msg.direction) {
        case 'incoming':
            msg.text_align ='left';
            msg.msg_cloud = (msg.username === 'SERVER@FESB') ? 'in-msg-srv-cloud' : 'in-msg-cloud';          
            break;
    
        default:
            msg.text_align ='right';
            break;
    }

    //msg.content = Caesar.decrypt(msg.content, clients.getSecretOf(msg.clientID));

	container.append($(template(msg)));
	container.animate({ scrollTop: container[0].scrollHeight }, 'slow');
}

/* Show loading gif. */
function showLoader(div, text) {
    var $divLoader = div.find('.loader-overlay');
    if ($divLoader.is('.visible')) return;
    $divLoader.find('p').text(text);
    $divLoader.addClass('visible');
    return $divLoader;
}

/**
 * Smooth transision from visible to hidden states.
 */ 
function hide(page, duration, callback) {
    if ( page ) {
        page.addClass('visuallyhidden');
        setTimeout(function(){ 
            page.removeClass('visuallyhidden');
            page.removeClass('visible');
            
            if ( callback && typeof(callback) == 'function' ) {
                callback();
                return;
            }                      
        }, (duration || 1000));
    }
    return;
}

/**
 * Smooth transision from hidden to visible states.
 */
function show(page, duration, callback) {
    if ( page ) {        
        page.addClass('visuallyhidden');
        page.addClass('visible');
        setTimeout(function(){ 
            page.removeClass('visuallyhidden');
            
            if ( callback && typeof(callback) == 'function' ) {
                callback();
                return;
            }
            
        }, (duration || 10));
    } 
    return;
}

