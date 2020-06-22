var rutas;

var Ruta = Backbone.Model.extend({
    url: function (){
        return this.id ? BASE_URL + '/externos/rutas/' + this.id : BASE_URL + '/externos/rutas';
    },
    defaults: { estado: 0 }
});

var Rutas = Backbone.Collection.extend({
    model: Ruta,
    url: BASE_URL + '/externos/rutas'
});

var RutaViewItem = Backbone.View.extend({
    tagName: 'div',
    className: 'col-xl-4 col-lg-6 col-md-6',
    template: _.template($('#ruta').html()),
    render: function(){
        var res = this.$el.html(this.template(this.model.attributes));
        return res;
    }
});

var RutasView = Backbone.View.extend({
    initialize: function() {
        this.collection.on('add remove', this.render, this);
        this.collection.on('remove', this.remove, this);
    },
    remove: function(ruta){
        Backbone.sync('delete', ruta)
    },
    tagName: 'div',
    render:function () {
        $('#lista-rutas').children().detach();
        $('#lista-rutas').append(
            this.collection.map(function(ruta){
                return new RutaViewItem({model: ruta}).render();
            })
        );
        $('#recargar').hide();
    }
});