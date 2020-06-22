var usuarios;

var Usuario = Backbone.Model.extend({
    url: function () {
        return BASE_URL + '/externos/perfil';
    },
    defaults: {name: 'Nombre'}
});

var Usuarios = Backbone.Collection.extend({
    model: Usuario,
    url: BASE_URL + '/externos/perfil'
});

var UsuarioView = Backbone.View.extend({
    tagName: 'div',
    className: 'perfil',
    template: _.template($('#perfil_content').html()),
    render: function() {
        return this.$el.html(this.template(this.model.attributes));
    }
});

var UsuariosView = Backbone.View.extend({
    initialize: function() {
        this.collection.on('add remove', this.render, this)
        this.collection.on('remove', this.remove, this)
    },
    remove: function(ruta){
        Backbone.sync('delete', ruta)
    },
    tagName: 'div',
    render:function () {
        $('#perfil_cotent_wrapper').children().detach();
        $('#perfil_cotent_wrapper').append(
            this.collection.map(function(usuario){
                return new UsuarioView({model: usuario}).render();
            })
        );
    }
});