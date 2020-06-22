var maps_api = null; var timer_mapa;
var mapa;
var limites;
var pis_markers = []; 
var pis_data = [];
var pis_estado = false;
var omapa = {
    verificar_api: function() {
        if(maps_api) {
            clearTimeout(timer_mapa);
            omapa.init();
        }
    },
    init: function() {
        pis_markers = []; 
        pis_data = [];
        pis_estado = false;

        var pos = {lat: -34.6050175, lng: -58.4386047};
        mapa = new google.maps.Map(document.getElementById('mapa'), {
            center: pos,
            scrollwheel: true,
            zoom: 16
        });
        limites = new google.maps.LatLngBounds();

        $.each(ruta_actual.posiciones, function( key, pos ) {
            pos.lat = parseFloat(pos.lat);
            pos.lng = parseFloat(pos.lng);
        });
        var ckeckpoints = _.where(ruta_actual.posiciones, {tipo: "checkpoint"});

        /*$.each(ruta_actual.posiciones, function( key, pos ) {
            omapa.mapaAddMarker(pos.id, pos.lat, pos.lng, pos.alt, pos.orden, pos.nombre, null, pos.tipo);
            limites.extend({lat: pos.lat, lng: pos.lng});
        });*/
        omapa.mapaAddMarker(0, pos_actual.lat, pos_actual.lng, 0, 0, 'Posicion Actual', null, 'pos_actual');
        $.each(ckeckpoints, function( key, pos ) {
            omapa.mapaAddMarker(pos.id, pos.lat, pos.lng, pos.alt, pos.orden, pos.nombre, null, pos.tipo);
            limites.extend({lat: pos.lat, lng: pos.lng});
        });

        var rutaPath = new google.maps.Polyline({
          path: ckeckpoints,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        rutaPath.setMap(mapa);

        if (ckeckpoints.length<=1) {
            mapa.setZoom(16);
            mapa.setCenter(new google.maps.LatLng(ckeckpoints[0].lat, ckeckpoints[0].lng));
        } else {
            mapa.fitBounds(limites);
        }

        var pis = _.filter(ruta_actual.posiciones, function(value) { return value.tipo != "checkpoint"; });
        pis_data = pis;

        //agregar pis desc
        var tmpl_data = {};
        var tpl = _.template($('#pis_content').html());
        $('#pis_wrapper').append(tpl(tmpl_data));
        $("a[target='_blank']").click(function(e){
            e.preventDefault();
            app.visitar($(e.currentTarget).attr('href'));
        });

    },
    pi_verificar_api: function() {
        if(maps_api) {
            clearTimeout(timer_mapa);
            omapa.piinit();
        }
    },
    piinit: function() {
        pis_markers = []; 
        pis_data = [];
        pis_estado = false;

        var pos = {lat: -34.6050175, lng: -58.4386047};
        mapa = new google.maps.Map(document.getElementById('mapa'), {
            center: pos,
            scrollwheel: true,
            zoom: 16
        });
        limites = new google.maps.LatLngBounds();

        $.each(puntos_interes, function( key, pos ) {
            pos.lat = parseFloat(pos.lat);
            pos.lng = parseFloat(pos.lng);
            omapa.mapaAddMarker(pos.id, pos.lat, pos.lng, pos.alt, pos.orden, pos.nombre, null, pos.tipo);
            limites.extend({lat: pos.lat, lng: pos.lng});
        });

        mapa.fitBounds(limites);
    },    
    mapaAddMarker: function(posicion_id, latitud, longitud, altitud, orden, nombre, recurso_id, tipo) {
        recurso_id = typeof recurso_id !== 'undefined' ? '/'+recurso_id : '';
        radio = typeof radio !== 'undefined' ? radio : 0;
        tipo = typeof tipo !== 'undefined' ? tipo : 'checkpoint';

        pos = { lat : latitud, lng : longitud };

        var contenido = latitud+', '+longitud;
        contenido +='<br><button onclick="omapa.navegar_hacia(\''+latitud+'\',\''+longitud+'\')">Navegar</button>;'
        //var icono = (tipo == 'checkpoint') ? BASE_URL + '/bo-assets/img/markers/marcador-rojo.png' : BASE_URL + '/bo-assets/img/markers/marcador-amarillo.png' ;
        var infowindow = new google.maps.InfoWindow({ content : contenido, maxWidth : 350 });

        switch(tipo) {
            case 'checkpoint':
                var lblMrkr = (orden < 10) ? '0'+String(orden) : String(orden);
                var marker = new MarkerWithLabel({
                  map: mapa,
                  position: pos,
                  icon: {
                    url: BASE_URL + '/bo-assets/img/markers/marcador-rojo.png',
                    size: new google.maps.Size(30, 36),
                  },
                  labelContent: lblMrkr,
                  labelAnchor: new google.maps.Point(6, 26),
                  labelClass: "marcador-label",
                  //labelInBackground: true
                });  
                break;
            case 'pos_actual':
                var marker = new google.maps.Marker({
                    position: pos,
                    icon: {
                        //url: (!usuario.avatar) ? 'img/demo/avatar_default.jpg' : BASE_URL+'/cdn/uploads/'+usuario.avatar,
                        //scaledSize: new google.maps.Size(30, 30),
                        url: BASE_URL + '/bo-assets/img/markers/marker-tuposition.png',
                        size: new google.maps.Size(40, 40),
                    },
                    /*label: {
                        text: String(orden),
                        color: "#333333",
                        fontSize: "14px",
                        fontWeight: "bold"
                    },*/
                    map: mapa
                });
                break;
            default:
            var marker = new google.maps.Marker({
                position: pos,
                icon: {
                    url: BASE_URL + '/bo-assets/img/markers/marker-'+tipo+'.png',
                    size: new google.maps.Size(40, 40),
                },
                map: mapa
            });
            pis_markers.push(marker);
        }

        var oPos = { 'id' : posicion_id, 'marker' : marker };
        //marker.addListener('click', function() { infowindow.open(mapa, marker); });
        marker.addListener('click', function() { omapa.navegar_hacia(latitud, longitud); });
        //mapa.setCenter(pos);
    },
    pi_toggle: function() {
        if (pis_estado == false) {
            if(pis_markers.length == 0) {
                $.each(pis_data, function(key, pos) {
                    omapa.mapaAddMarker(pos.id, pos.lat, pos.lng, pos.alt, pos.orden, pos.nombre, null, pos.tipo);
                    limites.extend({lat: pos.lat, lng: pos.lng});
                });
                mapa.fitBounds(limites);
            } else {
                $.each(pis_markers, function(key, pos) {
                    pis_markers[key].setMap(mapa);
                });
            }
            pis_estado = true;
            $('#pis_wrapper').show();
            $('html, body').animate({scrollTop: ($("#pis_wrapper").offset().top - $("header.header").height() - 35)}, 500);






            $('.sticky_horizontal_s').stick_in_parent({ offset_top: 50 });

            var $container = $('.isotope-wrapper-spi');
            $container.isotope({itemSelector: '.isotope-item-s', layoutMode: 'masonry'});
            $('.filters_listing_s').on('click', 'input', 'change', function() {
                var selector = $(this).attr('data-filter');
                var divSet = $(this).parents('.switch-field');
                divSet.find('.selected').removeClass('selected');
                $(this).addClass('selected');
                $('.isotope-wrapper-spi').isotope({filter: selector});
            });







        } else {
            $.each(pis_markers, function( key, pos ) { pis_markers[key].setMap(null); });
            pis_estado = false;
            $('#pis_wrapper').hide();
        }
    },
    posicion_actual: function() {
        mapa.setCenter(pos_actual);
    },
    navegar_hacia: function(lat, lng) {
        lat = typeof lat !== 'undefined' ? lat : null;
        lng = typeof lng !== 'undefined' ? lng : null;
        //debug(lat+'-'+lng);
        var origen      = new google.maps.LatLng(pos_actual.lat, pos_actual.lng)
        var destino     = new google.maps.LatLng(lat, lng);
        var distancia   = google.maps.geometry.spherical.computeDistanceBetween(origen, destino);
        var angulo      = google.maps.geometry.spherical.computeHeading(origen, destino);
        
        //debug("dist "+distancia);
        //debug("ang "+angulo);
        //debug("cardinal "+getCardinal(angulo));
        //alert('Ve '+Math.round(distancia)+" mts. en dirección "+getCardinal(angulo)+" sobre el sendero");
        Swal({
            imageUrl:"img/brujulas/brujula_"+getCardinal(angulo)+".png",
            text:"Ve "+Math.round(distancia)+" mts. en dirección "+getCardinal(angulo)+" sobre el sendero",
            showCloseButton: true,
            showConfirmButton: false
        });
    },
    iniciar_ruta: function() {
        var chkpnt = _.find(ruta_actual.posiciones, {tipo: "checkpoint", orden: 1});
        var ori = pos_actual.lat+','+pos_actual.lng;
        var des = chkpnt.lat+','+chkpnt.lng;
        var url = 'https://www.google.com/maps/dir/'+ori+'/'+des;
        debug(url);
        var ext_browser = cordova.InAppBrowser.open(url, '_system');
    },
    cargar_maps_api: function() {
        app.loadScript('https://maps.googleapis.com/maps/api/js?key='+MAPS_KEY+'&callback=omapa.cargar_externos', function(){
            debug('listo cargar_maps_api');
        }, true);
    },
    cargar_externos: function() {
        app.loadScript(LOCAL_URL + 'vendor/maps-v3-utility-library/markerwithlabel/markerwithlabel_packed.js', function(){
            maps_api = true;
        });
        app.loadScript(LOCAL_URL + 'vendor/panagea-1.1.0/js/infobox.js', function(){
            debug('cargue infobox');
        });
        debug('listo cargar_externos');
    },
}