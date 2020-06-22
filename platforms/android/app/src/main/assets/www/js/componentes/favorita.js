var favoritas;

var Favorita = Backbone.Model.extend({
    url: function (){
        return this.id ? BASE_URL + '/externos/rutas/' + this.id : BASE_URL + '/externos/rutas';
    },
    defaults: {estado: 0}
});

var Favoritas = Backbone.Collection.extend({
    model: Favorita,
    url: BASE_URL + '/externos/rutas'
});

var FavoritaView = Backbone.View.extend({
    tagName: 'div',
    className: 'col-md-3 col-xs-6',
    template: _.template($('#favorita').html()),
    render: function(){
        return this.$el.html(this.template(this.model.attributes));
    }
});

var FavoritasView = Backbone.View.extend({
    initialize: function() {
        this.collection.on('add remove', this.render, this)
        this.collection.on('remove', this.remove, this)
    },
    remove: function(ruta){
        Backbone.sync('delete', ruta)
    },
    tagName: 'div',
    render:function () {
        $('#lista-favoritas').children().detach();
        $('#lista-favoritas').append(
            this.collection.map(function(ruta){
                return new FavoritaView({model: ruta}).render();
            })
        );
    }
});