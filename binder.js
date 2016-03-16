'use strict'

/**
 * Implement simple two-way binding between model objects and DOM elements.
 */
function Bind(data, _model) {
    var model = {};
    if ( _model ) model = _model; // To be able to extend existing model _model
    
    /* Iterate over the key of data object. */
    var keys = Object.keys(data),
        len = keys.length,
        i = 0,
        key,
        value;
    while (i < len) {
        key = keys[i];
        value = data[key];
          
        /* Binding DOM elements to model. */
        (function() { 
            var _key = key,
                _value = value,
                _elArray,
                _len,
                _i = 0,
                _done = false;
            
            Object.defineProperty(model, _key, {
                get: function() {
                    //console.log('GET: ' + _key)
                    return _value; 
                },
                set: function(newValue) {
                    _value = newValue;
                    /* We cache queried DOM elements - makes sense only for static pages. */
                    if (!_done) {
                        _elArray = document.querySelectorAll( "[bind='" + _key +"']" );
                        _len = _elArray.length;
                        _done = true;
                    }
                     
                    _i = 0;    
                    while ( _i < _len ) {
                        _elArray[_i].innerHTML = _value;
                        _i += 1;
                    }                
                },
                configurable: true,
                enumerable: true                
            });
        
            /* Copy data to model. */
            model[_key] = _value;
          
            /* Binding model to DOM elements (we query elements by the id attribute). */
            var el = document.querySelector('#' + _key);
            
            if ( el !== null ) {
                function handler() {
                    if ( this.value ) { 
                        model[_key] = (this.value) ? (this.value) : data[_key]; // for <div> elements                      
                    } else if ( this.textContent ) {
                        model[_key] = (this.textContent ) ? (this.textContent ) : data[_key]; // for <table> cells                        
                    }                                     
                }
                el.addEventListener('input', handler);
                el.addEventListener('change', handler);            
            }
        })();
        
        i += 1;
    }   
    return model; 
}

module.exports = Bind;