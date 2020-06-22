Backbone.fetchCache.localStorage = true;
var customSync = Backbone.sync;

Backbone.sync = function(method, model, options){
    options.beforeSend = function(xhr){
        xhr.setRequestHeader('X-CSRFToken', token);
    };

    return customSync(method, model, options);
};