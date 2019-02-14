var CFG;
var rootserver = "https://play.e-360.com.mx/";
//var rootserver = "http://localhost:8080/proyectos/e-360/aplicaciones/360play/";
jQuery(document).ready(function($) {
    $.getQuery = function(query) {
        query = query.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var expr = "[\\?&]" + query + "=([^&#]*)";
        var regex = new RegExp(expr);
        var results = regex.exec(window.location.href);
        if (results !== null) {
            return results[1];
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        } else {
            return false;
        }
    };

    $(".layer-load").show();
    $.post(rootserver + 'config.php', { jscfg: '1' }, function(data, textStatus, xhr) {
        CFG = jQuery.parseJSON(data);
        $(".layer-load").hide();
        var userSession = sessionStorage.getItem("usersession");
        if( userSession != null  ){
            window.location.assign("play.html");
        }
        $("#debug").html( JSON.stringify (CFG));
    });

    $("#form").validate({
        submitHandler: function(form) {
            //form.submit();
            var action = CFG.base_url + "/" + $(form).attr('action');
            var method = $(form).attr('method');
            $(".layer-load").show();
            $.ajax({
                    url: action,
                    type: method,
                    data: $(form).serialize()
                })
                .done(function(response) {
                    var resultado = jQuery.parseJSON(response);
                    if (resultado.code == 1) {
                        $("#errorcode p").html(resultado.data);
                        $("#errorcode").show();
                    } else if (resultado.code == 0) {
                        console.log(JSON.stringify(resultado) );
                        sessionStorage.setItem("usersession",  JSON.stringify( resultado.user ) );
                        window.location.assign("play.html");
                    }
                })
                .fail(function(response) {
                    alert("Error al conectar con el servidor");
                })
                .always(function(response) {
                    $(".layer-load").hide();
                });

        }
    });
    if ($.getQuery('e')) { $("#errorcode p").html(base64.decode($.getQuery('e'))).show(); }
    $(".container").waitForImages({
        finished: function() {
            $(".layer-load").hide();
            setInterval(changeBG, 10000);
        },
        each: function(loaded, count, success) {
            var total = Math.floor((loaded * 100) / count);

        },
        waitForAll: true
    });
    var indexback = 0;

    function changeBG() {
        indexback++;
        var maxbg = $("#thebacks").find('img').length;
        if (indexback > maxbg - 1) { indexback = 0; }
        var nextUrl = 'url(' + $("#thebacks").find('img').eq(indexback).attr('src') + ')';
        $("body").css('background-image', nextUrl);
    }

});