var enrutador;
var url_actual;
var history_navigation = [];

Enrutador = Backbone.Router.extend({
	routes:{
		"": "inicio",
        "senderos": "senderos",
		"perfil": "perfil",
        "clima": "clima",
		"rutas/:id": "ruta",
        "registro": "registro",
        "ficha": "ficha",
        "puntos": "puntos",
        "acerca": "acerca",
        "consejos": "consejos",
        "recomendaciones": "recomendaciones"
	},
    inicio: function() { 
    	app.inicio_render();
        API.close();
        history_navigation.push('#');
        app.updateBackButton();
    },
    senderos: function() {
        app.senderos_render();
        API.close();
        history_navigation.push('#senderos');
        app.updateBackButton();
    },
    perfil: function(){
    	app.perfil_render();
        API.close();
        history_navigation.push('#perfil');
        app.updateBackButton();
    },
    clima: function(){
        app.clima_render();
        API.close();
        history_navigation.push('#clima');
        app.updateBackButton();
    },
    registro: function(){
        app.registro_render();
        API.close();
        history_navigation.push('#registro');
        app.updateBackButton();
    },
    ruta: function(id){
    	app.ruta_render(id);
        API.close();
        history_navigation.push('#/rutas/' + id);
        app.updateBackButton();
    },
    ficha: function(){
        app.ficha_render();
        API.close();
        history_navigation.push('#ficha');
        app.updateBackButton();
    },
    puntos: function(){
        app.puntos_render();
        API.close();
        history_navigation.push('#puntos');
        app.updateBackButton();
    },
    acerca: function(){
        app.acerca_render();
        API.close();
        history_navigation.push('#acerca');
        app.updateBackButton();
    },
    consejos: function(){
        app.consejos_render();
        API.close();
        history_navigation.push('#consejos');
        app.updateBackButton();
    },
    recomendaciones: function(){
        app.recomendaciones_render();
        API.close();
        history_navigation.push('#recomendaciones');
        app.updateBackButton();
    }
 });

_.extend(Backbone.Router.prototype, {
    refresh: function () {
        var tmp = Backbone.history.fragment;
        this.navigate(tmp + (new Date).getTime());
        this.navigate(tmp, {trigger: true});
    }
});