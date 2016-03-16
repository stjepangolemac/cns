var Handlebars = require('handlebars');
var $ = require('jquery');
var Bind = require('../binder');

/* Readin and compile Handlebar msg template/s. */
var source,
    partial, 
    template,
    container,
    clients = {},
    clientsSecrets = {},
    table;
    
try {
    source = require('fs').readFileSync('./view/clientCredentials.handlebars', 'utf-8');
    partial = require('fs').readFileSync('./view/clientCredentialsPartial.handlebars', 'utf-8');
} catch (err) {
    // Handle an error (e.g., file-not-found error)
    source = '<div>' + err + '</div>'; // TODO: Inform the user...
} finally {    
    template = Handlebars.compile(source);
    templatePartial = Handlebars.compile(partial);
    Handlebars.registerPartial("client", partial);  
}


var Clients = function(_container, _clients) {
    container = _container;      
    clients = _clients;
    initClientsView(); 
    clientsSecrets = bindModelView(clients); 
    if ( $.isEmptyObject(clientsSecrets) ) table.hide();
    //console.log(clients); 
};

Clients.prototype.addClient = function(client) {
    var tmpModel = {};
    table.append($( templatePartial(client) ));
    tmpModel[client.clientID] = ''; 
    clientsSecrets = Bind(tmpModel, clientsSecrets);
    table.show();
    console.log(clientsSecrets);
}

Clients.prototype.removeClient = function(client) {
    $("." + client.clientID).remove();
    console.log("Before: ", clientsSecrets);    
    delete clientsSecrets[client.clientID];
    console.log("After: ", clientsSecrets);
    if ( $.isEmptyObject(clientsSecrets) ) table.hide();
}

Clients.prototype.getSecretOf = function(clientID) {
    console.log(clientsSecrets);
    return clientsSecrets[clientID];
}

function initClientsView() {
    container.append($( template(clients) ));
    table = $('#clients_table');
    table.keypress(function (event) {
    if (event.keyCode == 13) {
          $('#clients_table td').blur(); // try to find better solution
          return false;
    }

});
}

function bindModelView(model) {
    var tmpModel = {};
    for (var i=0, len = model.clients.length; i<len; i++) {
        tmpModel[model.clients[i].clientID] = '';
    }    
    return Bind(tmpModel);    
}

module.exports = Clients;