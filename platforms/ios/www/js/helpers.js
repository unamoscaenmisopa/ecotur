function ir(destino)
{
    if(destino!='') { window.location = destino; }
}
function confirmar(mensaje, destino)
{
    var r = confirm(mensaje);
    if (r==true) ir(destino);
}
function setCookie(cname, cvalue, exdays) 
{
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) 
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function checkCookie(nombre) {
    var galle = getCookie(nombre);
    return (galle != "") ? true : false ;
}
function removeCookie(cname) {
    var expires = "expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = cname + "=; " + expires;
}
function findHighestZIndex()
{
    var highest = -999;
    $("*").each(function() {
        var current = parseInt($(this).css("z-index"), 10);
        if(current && highest < current) highest = current;
    });
    return highest;
}
function aleatorio(cantidad) 
{
    cantidad = typeof cantidad !== 'undefined' ? cantidad : 10;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < cantidad; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function base64_encode (stringToEncode) 
{
    if (typeof window !== 'undefined') {
      if (typeof window.btoa !== 'undefined') {
        return window.btoa(decodeURIComponent(encodeURIComponent(stringToEncode)))
      }
    } else {
      return new Buffer(stringToEncode).toString('base64')
    }
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    var o1
    var o2
    var o3
    var h1
    var h2
    var h3
    var h4
    var bits
    var i = 0
    var ac = 0
    var enc = ''
    var tmpArr = []
    if (!stringToEncode) {
      return stringToEncode
    }
    stringToEncode = decodeURIComponent(encodeURIComponent(stringToEncode))
    do {
      o1 = stringToEncode.charCodeAt(i++)
      o2 = stringToEncode.charCodeAt(i++)
      o3 = stringToEncode.charCodeAt(i++)
      bits = o1 << 16 | o2 << 8 | o3
      h1 = bits >> 18 & 0x3f
      h2 = bits >> 12 & 0x3f
      h3 = bits >> 6 & 0x3f
      h4 = bits & 0x3f
      tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
    } while (i < stringToEncode.length)
    enc = tmpArr.join('')
    var r = stringToEncode.length % 3
    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
}

$.fn.extend({
  animateCss: function(animationName, callback) {
    var animationEnd = (function(el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };

      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));

    this.addClass('animated ' + animationName).one(animationEnd, function() {
      $(this).removeClass('animated ' + animationName);

      if (typeof callback === 'function') callback();
    });

    return this;
  },
});

function debug(mensaje) {
    if (APP_DEBUG) {
        console.log(mensaje);
    }
}

function rad(x) {
  return x * Math.PI / 180;
}

function getDistance(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
}

function getCardinal(angle) {
  if (angle < 0){
      angle = 360 + angle;
  }
  var directions = 8;
  var degree = 360 / directions;
  angle = angle + degree / 2;
  
  if (angle >= 0 * degree && angle < 1 * degree)
      return "N";
  if (angle >= 1 * degree && angle < 2 * degree)
      return "NE";
  if (angle >= 2 * degree && angle < 3 * degree)
      return "E";
  if (angle >= 3 * degree && angle < 4 * degree)
      return "SE";
  if (angle >= 4 * degree && angle < 5 * degree)
      return "S";
  if (angle >= 5 * degree && angle < 6 * degree)
      return "SO";
  if (angle >= 6 * degree && angle < 7 * degree)
      return "O";
  if (angle >= 7 * degree && angle < 8 * degree)
      return "NO";
  //Should never happen: 
  return "N";

}

function alertCallback() {
  console.log("Alerta Desestimada!");
}
function alertar(mensaje, titulo) {
  var titulo = typeof titulo  !== 'undefined' ? titulo : 'Mensaje';
  if (soyCordova) {
    navigator.notification.alert(
        mensaje,
        alertCallback,
        titulo
    );
    navigator.notification.beep(1);
  } else {
    alert(mensaje)
  }
}

Array.prototype.getIndexBy = function (name, value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][name] == value) {
            return i;
        }
    }
    return -1;
}

function restrellitas(valor, total, cant) {
    var max = 5;
    var valor = typeof valor  !== 'undefined' ? valor : null;
    var total = typeof total  !== 'undefined' ? total : null;
    var cant  = typeof cant   !== 'undefined' ? cant : null;
    var str = '';

    if (valor) {
        var quedan = max - valor;
        for (var i = 1; i <= valor; i++) {
            str += '<i class="icon_star voted"></i>';
        }
    } else {
        if (!total) {
            return "";
        }
        if (!cant) {
            return "";
        }
        var res = Math.round(total / cant);
        var quedan = max - res;
        for (var i = 1; i <= res; i++) {
            str += '<i class="icon_star voted"></i>';
        }
    }
    for (var i = 1; i <= quedan; i++) {
        str += '<i class="icon_star "></i>';
    }

    return str;
}

function valor_ruta(total, cant) {
  var total = typeof total  !== 'undefined' ? total : null;
  var cant  = typeof cant   !== 'undefined' ? cant : null;
  var str = '';
  if ((total) && (cant)) str = Math.round(total/cant); 
  return str;
}

function alerta_token_callback() {
  app.borrarSesion();
}
function alerta_token() {
  var mensaje = "La sesión se encuentra vencida. Debe volver a ingresar a la aplicación";
  if (soyCordova) {
    navigator.notification.alert(
        mensaje,
        alerta_token_callback,
        "Sesión Vencida"
    );
    navigator.notification.beep(1);
  } else {
    alert(mensaje)
  }
}

function getPais(codigo) {
  var codigo = typeof codigo  !== 'undefined' ? codigo : null;
  codigo = (codigo == null) ? 'ES' : codigo;
  var pais = _.find(paises, {code: codigo});
  return pais.name;
}

function onBackKeyDown() {
    var now_page = history_navigation.pop();
    var back_page = history_navigation.pop();
    ir(back_page);
}