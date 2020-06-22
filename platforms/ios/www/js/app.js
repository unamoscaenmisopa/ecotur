var disco;
var cold_start = true;
var mensaje = false;
var token = null;
var cache_estado = false;
var cache_duration = 300;
var usuario = false;
var ruta_actual;
var puntos_interes;
var dispositivo = null;
var soyCordova = false;
var iab;
var API;
var myDropzone;
var idioma = 'es';
var pronostico = null;
var rutas_pdi = false;

var app = {
    init: function() {
        debug('app.js - init');

        // document.addEventListener("deviceready", this.onDeviceReady, false);
        // document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        app.onDeviceReady();
    },
    onDeviceReady: function() {
        debug('app.js - onDeviceReady');

        disco = window.localStorage;
        app.verificarToken();
        if (token != null) {
            app.usuario_datos();
        }
        gps.init();
        app.ui_init();

        if (typeof rutas === 'undefined') {
            rutas = new Rutas();
            var rutasView = new RutasView({collection: rutas});
            rutas.fetch({cache: cache_estado, expires: cache_duration});
        }

        openFB.init({appId: '955583251319704'});
        if (typeof(cordova) == "object") {
            soyCordova  = true;
            if (typeof device !== 'undefined') {
                dispositivo = device.model;
                if (device.platform == 'iOS') $('.header').addClass('ios');
            }
        }
        setTimeout(app.cs_toggle, 1500);
    },
    router_init: function() {
        debug('app.js - router_init');

        enrutador = new Enrutador();
        Backbone.history.start();
        url_actual = Backbone.history.getFragment();
        enrutador.navigate(url_actual, {trigger: true});
    },
    cs_toggle: function() {
        debug('app.js - cs_toggle');

        cold_start = false;
    },
    ui_init: function() {
        debug('app.js - ui_init');

        app.panagea_render();
        app.inicio_render();
        app.panagea_scripts();
        $('#mm-li_sesion').on('click', function() {app.salir();});
        $('#btn_perfil').attr("href", "#/perfil");
        $('#btn_clima').attr("href", "#/clima");
        $('#btn_puntos').attr("href", "#/puntos");
        $('#btn_senderos').attr("href", "#/senderos");
        omapa.cargar_maps_api();
        app.router_init();
    },
    panagea_render: function() {
        debug('app.js - panagea_render');

        var tmpl_data = {};
        var tpl_footer = _.template($('#tpl_footer').html());
        $('#wraper_footer').append(tpl_footer(tmpl_data));
        app.bloquear();
    },
    rutasInit: function() {
        debug('app.js - rutasInit');

        rutas = new Rutas();
        var rutasView = new RutasView({collection: rutas});
        rutas.fetch({cache: cache_estado, expires: cache_duration});
        app.cargando(false);
        $('#recargar').on('click', function () {enrutador.refresh();});
        setTimeout(app.ruta_render_likes, 1000);
        setTimeout(app.aviso_ficha, 1000);
    },
    ruta_render: function(id) {
        debug('app.js - ruta_render');

        app.menuHamburgerDefaultColor();
        $.ajax({
            url: BASE_URL + '/externos/rutas/' + id,
            type: 'get',
            success: function (response) {
                ruta_actual = response;
                app.limpiar();
                if (parseInt(ruta_actual.reducida)) {
                    var detalle_reducida = _.template($('#detalle_reducida').html());
                    $('main').append(detalle_reducida({}));
                    var leave_review = _.template($('#leave_review').html());
                    $('main').append(leave_review({}));
                    var detalle_reviews = _.template($('#detalle_reviews').html());
                    $('main').append(detalle_reviews({}));
                } else {
                    var detalle_content = _.template($('#detalle_content').html());
                    $('main').append(detalle_content({}));
                    var leave_review = _.template($('#leave_review').html());
                    $('main').append(leave_review({}));
                    var detalle_reviews = _.template($('#detalle_reviews').html());
                    $('main').append(detalle_reviews({}));
                }

                var ppal = "url(\'" + BASE_URL + "/cdn/uploads/" + ruta_actual.imagen.path_source+ "\')";
                $('.hero_in.hotels_detail').css('background', ppal);
                $('.hero_in.hotels_detail').css('-webkit-background-size', 'cover');
                $('.hero_in.hotels_detail').css('-moz-background-size', 'cover');
                $('.hero_in.hotels_detail').css('-o-background-size', 'cover');
                $('.hero_in.hotels_detail').css('background-size', 'cover');
                $('.hero_in h1,.hero_in form').addClass('animated');
                $('.hero_single, .hero_in').addClass('start_bg_zoom');

                $('#imagegallery').lightSlider({
                    gallery: true,
                    item: 1,
                    loop: false,
                    thumbItem: 4,
                    enableDrag: false,
                    currentPagerPosition: 'left',
                    onSliderLoad: function(el) {
                        el.lightGallery({
                            selector: '#imagegallery .lslide',
                            download: false
                        });
                    }
                });

                //if (parseInt(ruta_actual.reducida) == 0) {
                    $('#wrapper_compartidas').lightSlider({
                        gallery: true,
                        item: 1,
                        loop: false,
                        thumbItem: 4,
                        enableDrag: false,
                        currentPagerPosition: 'left',
                        onSliderLoad: function(el) {
                            el.lightGallery({
                                selector: '#wrapper_compartidas .lslide',
                                download: false
                            });
                        }
                    });
                //}

                if(maps_api) {
                    omapa.init();
                } else {
                    timer_mapa = setInterval(omapa.verificar_api, 500);
                }

                $('.btn-punto-interes').on('click', function () {
                    omapa.pi_toggle();
                });

                $('.btn_pos').on('click', function () { omapa.posicion_actual(); });
                $('#btn_iniciar_ruta').on('click', function () { omapa.iniciar_ruta(); });
                $('#submit_review').on('click', function () { app.valorar_ruta(); });
                $('#btn_upld_img').on('click', function () { app.sacaFotoReview(); });
                $('#bt_compartir').on('click', function () { app.compartir() });
                app.verificar_mensaje('#mapa');
                $("a[target='_blank']").click(function(e){
                    e.preventDefault();
                    app.visitar($(e.currentTarget).attr('href'));
                });
                app.clima_buscar();
                setTimeout(app.modal_senales, 1500);
                window.scrollTo(0,0);
            },
            error: function(e) {
                debug(e.statusText);
                app.borrarSesion();
            }
        });
        app.footer_pintar_activo();
    },
    perfil_render: function() {
        debug('app.js - perfil_render');

        app.menuHamburgerGrayColor();
        app.limpiar();
        var perfil_wrapper = _.template($('#perfil_wrapper').html());
        $('main').append(perfil_wrapper({}));
        var fav_content = _.template($('#fav_content').html());
        $('main').append(fav_content({}));
        var parametros = {
            "token": token
        };
        $.ajax({
            data: parametros,
            url: BASE_URL + '/externos/ficha',
            type: 'post',
            success: function (response) {
                usuario = response;
                var imagenes = _.template($('#perfil_imagenes').html());
                $('main').append(imagenes({}));

                $('#wrapper_subidas').lightSlider({
                    gallery: true,
                    item: 1,
                    loop: false,
                    thumbItem: 4,
                    enableDrag: false,
                    currentPagerPosition: 'left',
                    onSliderLoad: function(el) {
                        el.lightGallery({
                            selector: '#wrapper_subidas .lslide',
                            download: false
                        });
                    }
                });

                $('.btn_delete_image').on('click', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    var image_id = $(this).attr('data-image_id');
                    var mensaje = (idioma == 'en') ? 'Do you want to delete the selected image?' : '¿Deseas eliminar la imagen seleccionada?';
                    var r = confirm(mensaje);
                    if (r == true) {
                        var parametros = {
                            "token": token,
                            "image_id": image_id
                        };
                        $.ajax({
                            data: parametros,
                            url: BASE_URL + '/externos/deleteimage',
                            type: 'post',
                            success:  function (response) {
                                app.bloquear();
                                enrutador.refresh();
                            },
                            error: function(e) {
                                debug(e.statusText);
                            }
                        });
                    }
                });
            },
            error: function(e) {
                debug(e.statusText);
            }
        });

        $('.sticky_horizontal').stick_in_parent({ offset_top: 50 });
        usuarios = new Usuarios();
        var usuariosView = new UsuariosView({collection: usuarios });
        usuarios.fetch({ cache: cache_estado, expires: cache_duration });
        app.cargando(false);
        app.verificar_mensaje();
        app.footer_pintar_activo();
    },
    inicio_render: function() {
        debug('app.js - inicio_render');

        app.menuHamburgerDefaultColor();
        app.limpiar();
        $('#login').remove();
        $('#register').remove();
        var tmpl_data = {};
        var hero = _.template($('#tpl_inicio').html());
        $('main').append(hero(tmpl_data));
        $('.sticky_horizontal').stick_in_parent({
            offset_top: 50
        });
        var ppal = "url(\'" + FO_ASSETS_URL + "/img/inicio.jpg\')";
        $('.hero_in.bienvenido').css('background', ppal);
        $('.hero_in.bienvenido').css('-webkit-background-size', 'cover');
        $('.hero_in.bienvenido').css('-moz-background-size', 'cover');
        $('.hero_in.bienvenido').css('-o-background-size', 'cover');
        $('.hero_in.bienvenido').css('background-size', 'cover');
        app.bloquear();
    },
    senderos_render: function() {
        debug('app.js -senderos_render');

        app.menuHamburgerDefaultColor();
        app.limpiar();
        $("#login").remove();
        var tmpl_data = {};
        var hero = _.template($('#tpl_senderos').html());
        $('main').append(hero(tmpl_data));
        var rutas = _.template($('#rutas').html());
        $('main').append(rutas(tmpl_data));
        if (cold_start) {
            setTimeout(app.rutasInit, 500);
        } else {
            app.rutasInit();
        }
        $('.sticky_horizontal').stick_in_parent({ offset_top: 50 });

        var ppal = "url(\'" + FO_ASSETS_URL + "/img/senderos.jpg\')";
        $('.hero_in.general').css('background', ppal);
        $('.hero_in.general').css('-webkit-background-size', 'cover');
        $('.hero_in.general').css('-moz-background-size', 'cover');
        $('.hero_in.general').css('-o-background-size', 'cover');
        $('.hero_in.general').css('background-size', 'cover');
        app.bloquear();
        app.footer_pintar_activo();
    },
    login_render: function() {
        debug('app.js - login_render');

        $('#register').remove();
        var tmpl_data = {};
        var tpl = _.template($('#tpl_login').html());
        $('body').append(tpl(tmpl_data));
        $('#btn_login').on('click', function () {
            app.identificarme();
        });
        $('#forgot').on('click', function () {
            app.olvide_pass();
        });
        $('#btnLogFB').on('click', function () {
            app.fbLogin();
        });
    },
    registro_render: function() {
        debug('app.js - registro_render');

        app.menuHamburgerDefaultColor();
        $('#login').remove();
        var tmpl_data = {};
        var tpl = _.template($('#tpl_registro').html());
        $('body').append(tpl(tmpl_data));
        $('#btn_registro').on('click', function () {
            app.registrarme();
        });
    },
    clima_render: function() {
        debug('app.js - clima_render');

        app.menuHamburgerDefaultColor();
        app.limpiar();
        $('#login').remove();
        $('#register').remove();
        var tmpl_data = {};
        var hero = _.template($('#tpl_clima').html());
        $('main').append(hero(tmpl_data));
        $('.sticky_horizontal').stick_in_parent({
            offset_top: 50
        });
        var ppal = "url(\'" + FO_ASSETS_URL + "/img/clima.jpg\')";
        $('.hero_in.clima').css('background', ppal);
        $('.hero_in.clima').css('-webkit-background-size', 'cover');
        $('.hero_in.clima').css('-moz-background-size', 'cover');
        $('.hero_in.clima').css('-o-background-size', 'cover');
        $('.hero_in.clima').css('background-size', 'cover');

        var arg = ["s=586104","m=3","uid=wg_fwdg_586104_3_1557942950747","wj=knots","tj=c","odh=0","doh=24","fhours=240","vt=forecasts",
            "p=TMPE,WCHILL"];
        var script = document.createElement("script");
        var tag = document.getElementsByTagName("script")[0];
        script.src = "https://www.windguru.cz/js/widget.php?" + (arg.join("&"));
        tag.parentNode.insertBefore(script, tag);

        var arg = ["s=586104","m=3","uid=wg_fwdg_586104_3_1552335603653","wj=knots","tj=c","odh=6","doh=19","fhours=48","vt=forecasts",
            "p=WINDSPD,GUST,MWINDSPD,SMER,TMPE"];
        var script = document.createElement("script");
        var tag = document.getElementsByTagName("script")[0];
        script.src = "https://www.windguru.cz/js/widget.php?" + (arg.join("&"));
        tag.parentNode.insertBefore(script, tag);

        var arg = ["s=586104","m=25","uid=wg_fwdg_586104_25_1552335685546","waj=m","odh=6","doh=19","fhours=48","vt=fcst_graph"];
        var script = document.createElement("script");
        var tag = document.getElementsByTagName("script")[0];
        script.src = "https://www.windguru.cz/js/widget.php?" + (arg.join("&"));
        tag.parentNode.insertBefore(script, tag);

        app.bloquear();
        app.footer_pintar_activo();
    },
    usuario_datos: function() {
        debug('app.js - usuario_datos');

        var parametros = {
            "token": token,
        };
        $.ajax({
            data: parametros,
            url: BASE_URL + '/externos/ficha',
            type: 'get',
            success:  function(response) {
                usuario = response;
                idioma = ((usuario.idioma == 'en') || (usuario.idioma == 'es')) ? usuario.idioma : 'es';
                disco.setItem("idioma", idioma);
                ir('#');
            },
            error: function(e) {
                debug(e.statusText);
            }
        });
    },
    ficha_render: function() {
        debug('app.js - ficha_render');

        app.menuHamburgerGrayColor();
        var parametros = {
            "token": token,
        };
        $.ajax({
            data: parametros,
            url: BASE_URL + '/externos/ficha',
            type: 'get',
            success:  function(response) {
                usuario = response;
                app.limpiar();      
                var tmpl_data = {};
                var tpl = _.template($('#tpl_ficha').html());
                $('#page').append(tpl(tmpl_data));
                $('#btn_updt_ficha').on('click', function () { app.ficha_update(); });
                $('#peperto').on('click', function () {app.sacaFoto();});
                $('.globo-edit').on('click', function () {app.sacaFoto();});
            },
            error: function(e) {
                debug(e.statusText);
            }
        });
    },
    puntos_render: function() {
        debug('app.js - puntos_render');

        var parametros = {
            "token" : token,
        };
        app.menuHamburgerGrayColor();
        $.ajax({
            data: parametros,
            url: BASE_URL + '/externos/rutas',
            type: 'get',
            success: function(response) {
                rutas_pdi = response;
                $.ajax({
                    data: parametros,
                    url: BASE_URL+'/externos/puntos',
                    type: 'get',
                    success: function(response) {
                        puntos_interes = response;
                        app.limpiar();
                        var tmpl_data = {};
                        var tpl = _.template($('#puntos_lista').html());
                        $('#page').append(tpl(tmpl_data));
                        $("a[target='_blank']").click(function(e){
                            e.preventDefault();
                            app.visitar($(e.currentTarget).attr('href'));
                        });
                        $('.sticky_horizontal').stick_in_parent({ offset_top: 50 });
                        var $container = $('.isotope-wrapper-pi');
                        $container.isotope({ itemSelector: '.isotope-item', layoutMode: 'masonry' });
                        $('.filters_listing').on('click', 'input', 'change', function() {
                            var selector = $(this).attr('data-filter');
                            var divSet = $(this).parents('.switch-field');
                            divSet.find('.selected').removeClass('selected');
                            $(this).addClass('selected');
                            var value = $('#rutapl').val();
                            var isoFilters = [];
                            isoFilters.push("." + value);
                            isoFilters.push(selector);
                            var selectorFilter = isoFilters.join('');
                            $('.isotope-wrapper-pi').isotope({filter: selectorFilter});
                        });
                        $('#rutapl').on('change', function() {
                            var value = $('#rutapl').val();
                            var selector = $('.filters_listing .switch-field');
                            var selectorOption = selector.find('.selected').attr('data-filter');
                            var isoFilters = [];
                            isoFilters.push("." + value);
                            isoFilters.push(selectorOption);
                            var selectorFilter = isoFilters.join('');
                            $('.isotope-wrapper-pi').isotope({filter: selectorFilter});
                        });
                        if(maps_api) {
                            omapa.piinit();
                        } else {
                            timer_mapa = setInterval(omapa.pi_verificar_api, 500);
                        }
                    },
                    error: function(e) {
                        debug(e.statusText);
                    }
                });
            },
            error: function(e) {
                debug(e.statusText);
            }
        });
        app.footer_pintar_activo();
    },
    ruta_render_likes: function() {
        debug('app.js - ruta_render_likes');

        $.each($('.wish_bt'), function( key, like ) {
            $("#"+like.id).attr("onclick", "app.ruta_like('" + $("#" + like.id).attr("data-ruta_id")+"')");
            var liked = _.find(usuario.liked, {ruta_id: parseInt($("#"+like.id).attr("data-ruta_id"))});
            if(_.isObject(liked)) {
                $("#" + like.id).toggleClass("liked", true);
            } else {
                var liked = _.find(usuario.liked, {ruta_id: $("#" + like.id).attr("data-ruta_id")});
                if(_.isObject(liked)) $("#" + like.id).toggleClass("liked", true);
            }
        });
    },
    ruta_like: function(ruta_id) {
        debug('app.js - ruta_like');

        var parametros = {
            "token": token,
            "ruta_id": ruta_id
        };
        $.ajax({
            data: parametros,
            url: BASE_URL + '/externos/like',
            type: 'post',
            success:  function(response) {
                if (response.like) {
                    $("#like_" + response.ruta_id).toggleClass("liked", true);
                    usuario.liked.push({'id': response.like,'ruta_id': parseInt(response.ruta_id), 'user_id': usuario.id});
                } else {
                    $("#like_" + response.ruta_id).toggleClass("liked", false);
                    usuario.liked.splice(usuario.liked.getIndexBy("ruta_id", ruta_id), 1);
                }
            },
            error: function(e) {
                debug(e.statusText);
            }
        });
    },
    verificarToken: function() {
        debug('app.js - verificarToken');

        if (token == null) {
            if (disco.getItem("token") != null) {
                token = disco.getItem("token");
                idioma = disco.getItem("idioma");
            } else {
                return false;
            }
        }
       return true;
    },
    bloquear: function() {
        debug('app.js - bloquear');

        if(app.verificarToken()) {
            $('#login').hide();          
            $('#logo').show();
            $('#page').show();            
            $('.btn_mobile').show();
            $('#bt_compartir').show();
        } else {
            app.login_render();
            $('#logo').hide();
            $('#page').hide();
            $('#login').show();
            $('.btn_mobile').hide();
            $('#bt_compartir').hide();
        }
        app.idioma_rerender();
    },
    borrarSesion: function() {
        debug('app.js - borrarSesion');

        token = null;
        disco.removeItem("token");
        disco.removeItem("idioma");
        disco.removeItem("modal_senales");
        disco.removeItem("aviso_ficha");
        disco.clear();
        lugares = [];
        app.bloquear();
    },
    salir: function() {
        debug('app.js - salir');

        app.borrarSesion();
        navigator.geolocation.clearWatch(watchPositionId);
        if (navigator.app) {
           navigator.app.exitApp();
        }
        else if (navigator.device) {
            navigator.device.exitApp();
        }
    },
    identificarme: function() {
        debug('app.js - identificarme');

        var parametros = {
            "email" : $('#email').val(),
            "password" : $('#password').val()
        };
        if ((!$('#email').val()) || (!$('#password').val())) {
             alertar((idioma == 'en') ? 'Enter the access data' : 'Introduzca los datos de acceso');
             return false;
        }
        $.ajax({
                data: parametros,
                url: BASE_URL + '/externos/authenticate',
                type: 'post',
                success:  function(response) {
                    token = response.token;
                    disco.setItem("token", token);
                    app.usuario_datos();
                    app.bloquear();
                    enrutador.refresh();
                },
                error: function(e) {
                    if (e.status == 401) {
                        alertar((idioma == 'en') ? 'Incorrect data' : 'Datos incorrectos');
                    }
                    debug(e.statusText);
                }
        });
    },
    registrarme: function() {
        debug('app.js - registrarme');

        var valido = 0;
        var npt_email = $('#npt_email').val();
        var npt_password = $('#npt_password1').val();
        var npt_password2 = $('#npt_password2').val();
        var npt_nombre = $('#npt_nombre').val();
        var npt_apellido = $('#npt_apellido').val();

		if(npt_email.length >= 6) valido++;
		if( /(.+)@(.+){2,}\.(.+){2,}/.test(npt_email) ) valido++;
		if(npt_password.length >= 6) valido++;
		if(npt_password.length == npt_password2.length) valido++;
		if(npt_nombre.length >= 3) valido++;

		if (valido == 5) {
	        var parametros = {
	            "email" : $('#npt_email').val(),
	            "password" : $('#npt_password1').val(),
	            "nombre" : $('#npt_nombre').val(),
	            "apellido" : $('#npt_apellido').val()
	        };
	        $.ajax({
                data: parametros,
                url: BASE_URL + '/externos/registrate',
                type: 'post',
                success:  function (response) {
                    token = response.token;
                    disco.setItem("token", token);
                    app.usuario_datos();
                    ir('#');
                },
                error: function(e) {
                    debug(e.statusText);
                }
	        });
		} else {
            alertar((idioma == 'en') ? 'An error occurred. Verify the email entered. The password must contain at least 6 characters. The name must contain at least 3 characters. Passwords must match.' : 'Ocurrió un error. Verifique el email ingresado. La contraseña debe contener al menos 6 caracteres. El nombre debe contener al menos 3 caracteres. Las contraseñas deben coincidir.');
		}
    },
    buscarPerfil: function() {
        debug('app.js - buscarPerfil');

        var parametros = {
            "token" : token
        };
        $.ajax({
            data: parametros,
            url: BASE_URL + '/externos/perfil',
            type: 'post',
            success:  function (response) {
                usuario = response.usuario;
                app.limpiar();
                var tpl_perfil = _.template($('#tpl_perfil').html());
                $('main').append(tpl_perfil(usuario));
                $('.sticky_horizontal').stick_in_parent({ offset_top: 50 });
                window.scrollTo(0,0);
            },
            error: function(e) {
                debug(e.statusText);
                app.borrarSesion();
            }
        });        
    },
    ficha_update: function() {
        debug('app.js - ficha_update');

        var parametros = {
            "token"                 : token,
            "name"                  : $('#nombre_completo').val(),
            "pais"                  : $('#pais').val(),
            "idioma"                : $('#idioma').val(),
            "sexo"                  : $('#sexo').val(),
            "edad"                  : $('#edad').val(),
            "estatura"              : $('#estatura').val(),
            "peso"                  : $('#peso').val(),
            "factor_sanguineo"      : $('#factor_sanguineo').val(),
            "alergias"              : $('#alergias').val(),
            "enfermedades"          : $('#enfermedades').val(),
            "contacto_emergencia"   : $('#contacto_emergencia').val()
        };
        $.ajax({
            data: parametros,
            url: BASE_URL + '/externos/ficha',
            type: 'post',
            success:  function (response) {
                usuario = response;
                idioma = ((usuario.idioma == 'en') || (usuario.idioma == 'es')) ? usuario.idioma : 'es';
                disco.setItem("idioma", idioma);
                app.idioma_rerender();
                mensaje = (idioma == 'en') ? 'Updated profile' : 'Perfil Actualizado';
                ir('#perfil');
            },
            error: function(e) {
                debug(e.statusText);
            }
        });
    },    
    limpiar: function(destino) {
        destino = typeof destino !== 'undefined' ? destino : 'main';
        $( destino ).empty();
        $('#wrapper_ficha').remove();
        $('#wrapper_pi').remove();
    },
    cargando: function(estado) {
        estado = typeof estado !== 'undefined' ? estado : false;
        if (estado) {
            $('#preloader').fadeIn();
            $('[data-loader="circle-side"]').fadeIn()
        } else {
            $('#preloader').fadeOut();
            $('[data-loader="circle-side"]').fadeOut()
        }
    },
    panagea_scripts: function() {
        debug('panagea_scripts');

        $(window).on('load', function () {
            $('[data-loader="circle-side"]').fadeOut(); // will first fade out the loading animation
            $('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
            $('body').delay(350);
            $('.hero_in h1,.hero_in form').addClass('animated');
            $('.hero_single, .hero_in').addClass('start_bg_zoom');
            $(window).scroll();
        });
        
        // Sticky nav
        $(window).on('scroll touchmove', function () {
            if ($(this).scrollTop() > 1) {
                $('.header').addClass("sticky");
            } else {
                $('.header').removeClass("sticky");
            }
        });
        
        // Sticky sidebar
        $('#sidebar').theiaStickySidebar({
            additionalMarginTop: 150
        });
                
        // Mobile Menú
        var txtsos = (idioma == 'en') ? 'S.O.S. EMERGENCY Call' : 'Llamada de EMERGENCIA S.O.S.'
        var $menu = $("nav#menu").mmenu({
            "extensions": ["pagedim-black"],
            counters: true,
            keyboardNavigation: {
                enable: true,
                enhance: true
            },
            navbar: {
                title: (idioma == 'en') ? 'MENU' : 'MENÚ'
            },
            navbars: [{position:'bottom',content: ['<a id="btn-emergencia" href="#">' + txtsos + '</a>']}]}, 
            {
            // configuration
            clone: true,
            classNames: {
                fixedElements: {
                    fixed: "menu_fixed",
                    sticky: "sticky"
                }
            }
        });
        var $icon = $("#hamburger");
        API = $menu.data("mmenu");
        $icon.on("click", function () {
            API.open();
        });
        API.bind("open:finish", function () {
            setTimeout(function () {
                $icon.addClass("is-active");
            }, 100);
        });
        API.bind("close:finish", function () {
            setTimeout(function () {
                $icon.removeClass("is-active");
            }, 100);
        });

        // Show Password
        $('#password').hidePassword('focus', {
            toggle: {
                className: 'my-toggle'
            }
        });

        // Forgot Password
        $("#forgot").click(function () {
            $("#forgot_pw").fadeToggle("fast");
        });

        // Sticky filters
        $(window).bind('load resize', function () {
            var width = $(window).width();
            if (width <= 991) {
                $('.sticky_horizontal').stick_in_parent({
                    offset_top: 50
                });
            } else {
                $('.sticky_horizontal').stick_in_parent({
                    offset_top: 67
                });
            }
        });
                    
        // Secondary nav scroll
        var $sticky_nav= $('.secondary_nav');
        $sticky_nav.find('a').on('click', function(e) {
            e.preventDefault();
            var target = this.hash;
            var $target = $(target);
            $('html, body').animate({
                'scrollTop': $target.offset().top - 138
            }, 800, 'swing');
        });
        $sticky_nav.find('ul li a').on('click', function () {
            $sticky_nav.find('ul li a.active').removeClass('active');
            $(this).addClass('active');
        });

        $('#btn-emergencia').on('click', function () { app.declarar_emergencia(); });
        //clearTimeout(timer_retriger);
    },
    loadScript: function(url, callback, defer){
        defer = typeof defer !== 'undefined' ? defer : false;
        var script = document.createElement("script")
        script.type = "text/javascript";
        script.onload = function(){ callback(); };
        script.src = url;
        //script.setAttribute('defer','');
        //if (defer) script.defer = true;
        document.getElementsByTagName("head")[0].appendChild(script);
    },
    dropzone_init: function(disparador, contenedor_tn, destino, nombre_input) {
        disparador = typeof disparador !== 'undefined' ? disparador : '#btn_upld_img';
        contenedor_tn = typeof contenedor_tn !== 'undefined' ? contenedor_tn : '#dz_tn_preview_ruta';
        destino = typeof destino !== 'undefined' ? destino : '/externos/review';
        nombre_input = typeof nombre_input !== 'undefined' ? nombre_input : 'file';

        var parametros = {
            "token" : token,
            "ruta_id" : ruta_actual.id,
        };

        myDropzone = new Dropzone(disparador, {
            capture:"camera",
            acceptedFiles:"image/*",
            paramName: nombre_input,
            params: parametros,
            previewsContainer: contenedor_tn,
            url: BASE_URL + destino,
            thumbnailWidth: 80,
            thumbnailHeight: 80,
        });
        myDropzone.on("complete", function(file) {
            myDropzone.removeFile(file);
            debug('termine upload');
            debug(file.xhr.response);
            //usuario = JSON.parse(file.xhr.response);
            //$('.btn_upld_img').attr("src", BASE_URL+"/cdn/uploads/"+usuario.avatar);
            mensaje = (idioma == 'en') ? 'Shared Image' : 'Imagen Compartida';
            enrutador.refresh();
        });       
    },
    valorar_ruta: function() {
        debug('valorar_ruta');
        var parametros = {
            "token"         : token,
            "valor"         : $('#rating_review').val(),
            "comentario"    : $('#review_text').val(),
            "ruta_id"       : ruta_actual.id,
        };
        $.ajax({
            data:  parametros,
            url:   BASE_URL+'/externos/review',
            type:  'post', //método de envio
            success:  function (response) {
                alertar(response.texto);
                //$('#review_text').val('');
                //window.scrollTo(0,0);
                enrutador.refresh();

            },
            error: function(e) {
                debug(e.statusText);
            }
        });
    },
    compartir: function(share_url) {
        share_url = typeof share_url !== 'undefined' ? share_url : BASE_URL + '/externos/ver/' + ruta_actual.id;
        if (soyCordova) {
            var options = {
                message: (idioma == 'en') ? 'Share' : 'Compartir',
                subject: (idioma == 'en') ? 'Route' : 'Ruta',
                url: share_url
            };
            window.plugins.socialsharing.shareWithOptions(options);
        } else {
            debug('Compartir ' + share_url);
        }
    },
    visitar: function(url) {
        if (soyCordova) {
            var ref = cordova.InAppBrowser.open(url, '_system');
        } else {
            var ref = window.open(url, '_blank');
        }
    },
    declarar_emergencia: function() {
        API.close();

        if (soyCordova) {
            var ref = cordova.InAppBrowser.open(SOS_TEL, '_system');
        } else {
            var ref = window.open(SOS_TEL, '_blank');
        }
        var parametros = {
            "token": token
        };
        $.ajax({
            data: parametros,
            url: BASE_URL + '/externos/emergencia',
            type: 'post',
            success: function(response) {
                debug(response);
                var txtsosook = (idioma == 'en') ? 'Emergency Declared' : 'Emergencia Declarada Exitosamente'
                var txtsoserr = (idioma == 'en') ? 'Error declaring Emergency' : 'Error al declarar Emergencia'
                if(response.estado == true) {
                    alertar(txtsosook, 'S.O.S.');
                } else {
                    alertar(txtsoserr, 'Error');
                }
            },
            error: function(e) {
                debug(e.statusText);
            }
        });
    },
    verificar_mensaje: function(destino) {
        destino = typeof destino !== 'undefined' ? destino : '.sticky_horizontal';
        if(mensaje) {
            var str = '';
            str += '<div class="alert alert-warning alert-dismissible" role="alert">';
            str += '  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
            str += mensaje;
            str += '</div>';            
            $(destino).before(str);
            mensaje = false;
        }
    },
    idioma_rerender: function() {
        $('#wraper_footer').empty();
        var tmpl_data = {};
        var tpl_footer = _.template($('#tpl_footer').html());
        $('#wraper_footer').append(tpl_footer(tmpl_data));
        $('#btn_perfil').attr("href", "#/perfil");
        $('#btn_clima').attr("href", "#/clima");
        $('#btn_puntos').attr("href", "#/puntos");
        $('#btn_senderos').attr("href", "#/senderos");

        var mntxtini = (idioma == 'en') ? 'Home' : 'Inicio' ;
        var mntxtsend = (idioma == 'en') ? 'Trails' : 'Senderos' ;
        var mntxtpi  = (idioma == 'en') ? 'Points of interest' : 'Puntos de Interés' ;
        var mntxtconsejos = (idioma == 'en') ? 'Hiking signs' : 'Señalética' ;
        var mntxtrecomend = (idioma == 'en') ? 'Recommendations' : 'Recomendaciones' ;
        var mntxtacerca = (idioma == 'en') ? 'Ecotur Partners' : 'Ecotur - Socios' ;
        var mntxtper = (idioma == 'en') ? 'User profile' : 'Perfil de usuario' ;
        var mntxtout = (idioma == 'en') ? 'Logout' : 'Cerrar Sesión' ;

        $('#mntxtini').html(mntxtini);
        $('#mntxtsend').html(mntxtsend);
        $('#mntxtpi').html(mntxtpi);
        $('#mntxtconsejos').html(mntxtconsejos);
        $('#mntxtrecomend').html(mntxtrecomend);
        $('#mntxtacerca').html(mntxtacerca);
        $('#mntxtper').html(mntxtper);
        $('#mntxtout').html(mntxtout);

        $('#mm-mntxtini').html(mntxtini);
        $('#mm-mntxtsend').html(mntxtsend);
        $('#mm-mntxtpi').html(mntxtpi);
        $('#mm-mntxtconsejos').html(mntxtconsejos);
        $('#mn-txtrecomend').html(mntxtrecomend);
        $('#mm-mntxtacerca').html(mntxtacerca);
        $('#mm-mntxtper').html(mntxtper);
        $('#mm-mntxtout').html(mntxtout);
    },
    olvide_pass: function() {
        iab = cordova.InAppBrowser.open(BASE_URL+'/password/reset', '_system');
    },
    footer_pintar_activo: function() {
        setTimeout(app.fpa, 500);
    },
    fpa: function() {
        $("#btn_senderos i, #btn_senderos span").css("color","#afadad");
        $("#btn_puntos i, #btn_puntos span").css("color","#afadad");
        $("#btn_perfil i, #btn_perfil span").css("color","#afadad");
        $("#btn_clima i, #btn_clima span").css("color","#afadad");
        var seccion = Backbone.history.getFragment();
        switch(seccion) {
          case "senderos":
            $("#btn_senderos i, #btn_senderos span").css("color","#2ccca7");
            break;
          case "puntos":
            $("#btn_puntos i, #btn_puntos span").css("color","#2ccca7");
            break;
          case "perfil":
            $("#btn_perfil i, #btn_perfil span").css("color","#2ccca7");
            break;
          case "clima":
            $("#btn_clima i, #btn_clima span").css("color","#2ccca7");
            break;
          default:
        }        
    },
    clima_buscar: function() {
        debug('app.js - clima_buscar');

        var owdef = (ruta_actual.owid) ? ruta_actual.owid : OW_CITY_ID;
        var parametros = {
            "id" : owdef,
            "APPID" : OW_KEY,
            "units" : 'metric',
            "lang" : idioma
        };

        $.ajax({
            data: parametros,
            url: 'https://api.openweathermap.org/data/2.5/weather',
            type: 'GET',
            success:  function (response) {
                pronostico = response;
                app.clima_render_widget();
            },
            error: function(e) {
                debug(e.statusText);
            }
        });
    },
    clima_render_widget: function() {
        debug('app.js - clima_render_widget');

        var titu = (idioma == 'en') ? 'Weather Forecast' : 'Pronóstico de Clima';
        var str = '';
        str += '<div class="row"><div class="col"><h4>' + titu + '</h4></div></div>';
        str += '<div id="owwidget" class="row">';
        str += '<div class="col-5"><span>' + pronostico.name + '</span><br><span class="ow_desc">' + pronostico.weather[0].description + '</span></div>';
        str += '<div class="col-4"><img class="ow_icon" src="https://openweathermap.org/img/w/' + pronostico.weather[0].icon + '.png" /></div>';
        str += '<div class="col-3">' + Math.round(pronostico.main.temp) + '° C</div>';
        str += '</div>';            
        $('#weather_wrapper').html(str);
    },
    modal_senales: function() {
        debug('app.js - modal_senales');

        if (disco.getItem("modal_senales") == null) {
            disco.setItem("modal_senales", true);
            Swal({
                imageUrl:'img/senalizacion_de_senderos.jpg',
                title: (idioma == 'en') ? 'Hiking signs' : 'Señalética de senderismo',
                showCloseButton: true,
                showConfirmButton: false
            });
        }        
    },
    aviso_ficha: function() {
        debug('app.js - aviso_ficha');

        if (disco.getItem("aviso_ficha") == null) {
            disco.setItem("aviso_ficha", true);
            var str = '';
            str += '<div class="alert alert-success alert-dismissible fade show" role="alert" style="margin-bottom: 20px;">';
            str += (idioma == 'en') ? 'It is important that you complete your' : 'Es importante que completes tu';
            str += ' <strong><a id="ficha-medica" href="#ficha">';
            str += (idioma == 'en') ? 'Medical Record' : 'Ficha Médica';
            str += ' </a></strong>';
            str += (idioma == 'en') ? 'in any emergency' : 'ante cualquier emergencia';
            str += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
            str += '</div>';
            $('#wrapper-rutas').prepend(str);
        }        
    },
    acerca_render: function() {
        debug('app.js - acerca_render');

        app.menuHamburgerDefaultColor();
        app.limpiar();
        var tmpl_data = {};
        var tpl = _.template($('#tpl_acerca').html());
        $('main').append(tpl(tmpl_data));
        var ppal = "url(\'" + FO_ASSETS_URL + "/img/acerca.jpg\')";
        $('.acerca-de-header').css('background', ppal);
        $('.acerca-de-header').css('-webkit-background-size', 'cover');
        $('.acerca-de-header').css('-moz-background-size', 'cover');
        $('.acerca-de-header').css('-o-background-size', 'cover');
        $('.acerca-de-header').css('background-size', 'cover');
        app.footer_pintar_activo();

        
        $('#collapseOne').on('shown.bs.collapse', function (e) {
            $('html,body').animate({
                scrollTop: $('#collapseOne').offset().top - 120
            }, 500);
        });
    },
    consejos_render: function() {
        debug('app.js - consejos_render');

        app.menuHamburgerDefaultColor();
        app.limpiar();
        var tmpl_data = {};
        var tpl = _.template($('#tpl_consejos').html());
        $('main').append(tpl(tmpl_data));
        var ppal = "url(\'" + FO_ASSETS_URL + "/img/consejos.jpg\')";
        $('.consejo-header').css('background', ppal);
        $('.consejo-header').css('-webkit-background-size', 'cover');
        $('.consejo-header').css('-moz-background-size', 'cover');
        $('.consejo-header').css('-o-background-size', 'cover');
        $('.consejo-header').css('background-size', 'cover');
        app.footer_pintar_activo();
    },
    recomendaciones_render: function() {
        debug('app.js - recomendaciones_render');

        app.menuHamburgerDefaultColor();
        app.limpiar();
        var tmpl_data = {};
        var tpl = _.template($('#tpl_recomendaciones').html());
        $('main').append(tpl(tmpl_data));
        var ppal = "url(\'" + FO_ASSETS_URL + "/img/recomendaciones.jpg\')";
        $('.recomendaciones-header').css('background', ppal);
        $('.recomendaciones-header').css('-webkit-background-size', 'cover');
        $('.recomendaciones-header').css('-moz-background-size', 'cover');
        $('.recomendaciones-header').css('-o-background-size', 'cover');
        $('.recomendaciones-header').css('background-size', 'cover');
        app.footer_pintar_activo();
    },
    fbLogin: function() {
        debug('Ini fbLogin');
        openFB.login(
            function(response) {
                if(response.status === 'connected') {
                    console.log(response);
                    app.fbGetInfo();
                } else {
                    alert('Facebook login failed: ' + response.error);
                }
            }, {scope: 'email'});
    }, 
    fbGetInfo: function() {
        debug('Ini fbGetInfo');
        openFB.api({
            path: '/me',
            params: { fields: 'name,email' },
            success: function(data) {
                console.log(JSON.stringify(data));
                app.fbIdentificate(data);
            },
            error: app.fbErrorHandler});
    },  
    fbReadPermissions: function() {
        openFB.api({
            method: 'GET',
            path: '/me/permissions',
            success: function(result) {
                alert(JSON.stringify(result.data));
            },
            error: app.fbErrorHandler
        });
    },
    fbRevoke: function() {
        openFB.revokePermissions(
                function() {
                    alert('Permissions revoked');
                },
                app.fbErrorHandler);
    },
    fbLogout: function() {
        openFB.logout(
                function() {
                    alert('Logout successful');
                },
                app.fbErrorHandler);
    },
    fbErrorHandler: function(error) {
        alert(error.message);
    },
    fbIdentificate: function(data) {
        console.log('fbIdentificate');
        var parametros = {
            "email" : data.email,
            "password" : data.id,
            "name" : data.name,
            "fb" : true
        };
        $.ajax({
            data:  parametros,
            url:   BASE_URL+'/externos/registrate',
            type:  'post',
            success:  function (response) {
                token = response.token;
                disco.setItem("token", token);
                app.usuario_datos();
                app.bloquear();
                console.log(response);
            },
            error: function(e) {
                console.log(e.statusText);
            }
        });
    },
    sacaFoto: function() {
        debug('app.js - sacaFoto');

        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            saveToPhotoAlbum: true
        });
        function onSuccess(imageData) {
            var image = document.createElement("IMG");
            image.src = "data:image/jpeg;base64," + imageData;
            var parametros = {
                "token": token,
                "file": imageData
            };
            $(".subiendo").css("display", "inline");
            $.ajax({
                data: parametros,
                url: BASE_URL + "/externos/ficha",
                type: 'post',
                success: function (response) {
                    usuario = response;
                    $('#peperto').attr("src", BASE_URL + "/cdn/uploads/" + response.avatar);
                    $(".subiendo").hide();
                },
                error: function(e) {
                    debug(e.statusText);
                }
            });
        }
        function onFail(message) {
            alertar('Failed because: ' + message);
        }
    },
    sacaFotoReview: function() {
        debug('app.js - sacaFotoReview');

        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            encodingType: Camera.EncodingType.JPEG,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            saveToPhotoAlbum: true
        });
        function onSuccess(imageData) {
            var image = document.createElement("IMG");
            image.src = "data:image/jpeg;base64," + imageData;
            var parametros = {
                "token": token,
                "ruta_id": ruta_actual.id,
                "file": imageData
            };
            $(".subiendo").css("display", "inline");
            $.ajax({
                data: parametros,
                url: BASE_URL + "/externos/review",
                type: 'post',
                success: function (response) {
                    mensaje = (idioma == 'en') ? 'Shared Image' : 'Imagen Compartida';
                    enrutador.refresh();
                },
                error: function(e) {
                    debug(e.statusText);
                }
            });
        }
        function onFail(message) {
            alertar('Failed because: ' + message);
        }
    },
    menuHamburgerGrayColor: function () {
        debug('app.js - menuHamburgerGrayColor');

        $('.hamburger-inner').addClass('hamburger-inner-gray');
        $('#back_to_page').addClass('back_to_page-gray');
    },
    menuHamburgerDefaultColor: function () {
        debug('app.js - menuHamburgerDefaultColor');

        $('.hamburger-inner').removeClass('hamburger-inner-gray');
        $('#back_to_page').removeClass('back_to_page-gray');
    },
    updateBackButton: function () {
        debug('app.js - updateBackButton');

        if (history_navigation.length == 1) {
            $('#li_back_to_page').hide();
        } else {
            $('#li_back_to_page').show();
        }
    }
};

app.init();