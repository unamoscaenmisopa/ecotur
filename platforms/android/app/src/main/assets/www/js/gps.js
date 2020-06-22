var pos_actual = {lat: -34.6050175, lng: -58.4386047};
var watchPositionId;

var gps = {
    init: function() {
        navigator.geolocation.getCurrentPosition(gps.onSuccess, gps.onError);
        watchPositionId = navigator.geolocation.watchPosition(gps.onSuccess, gps.onError);
    },
    onSuccess : function(position) {
        pos_actual.lat = position.coords.latitude;
        pos_actual.lng = position.coords.longitude;
    },
    onError: function(error) {
        alertar('Necesitamos utilizar el GPS para localizarlo correctamente.', 'GPS');
    }
}