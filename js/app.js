var CFG;
var rootserver = "https://play.e-360.com.mx/";
//var rootserver = "http://localhost:8080/proyectos/e-360/aplicaciones/360play/";
jQuery(document).ready(function($) {
    $(".layer-load").show();
    $.post(rootserver +'config.php', { jscfg: '1' }, function(data, textStatus, xhr) {
        CFG = JSON.parse(data);
        var userSession = sessionStorage.getItem("usersession");
        if( userSession == null  ){
            window.location.assign("index.html");
        }else{
            loadPlayList();
        }
    });
    $("#logOutBtn").click(function(event) {
        event.preventDefault();
        $.post(CFG.base_url + "/" + 'phplibs/AjaxLogOutManager.php', { param1: 'value1' }, function(data, textStatus, xhr) {
            sessionStorage.clear();
            window.location.assign("index.html");
        });
    });

    function loadPlayList() {
        $(".layer-load").show();
        var userSession = JSON.parse(sessionStorage.getItem("usersession"));
        $.post(CFG.base_url + '/phplibs/AjaxPlayListManager.php', { userid: userSession.id }, function(mediadata, textStatus, xhr) {
            /*optional stuff to do after success */
            var playlist = jQuery.parseJSON(mediadata);
            //console.dir(playlist);
            if (playlist.playListLength > 0) {
                $.get('media-template.html', function(templatedata) {
                    $(".playlist-wall").html("");
                    var dummieMedia = $.parseHTML(templatedata);
                    $.each(playlist.data, function(index, media) {
                        $(dummieMedia).find('.card-e360play').attr('id', 'media' + index);
                        $(dummieMedia).find('.card-e360play').attr("data-playlistid", media.id);
                        $(dummieMedia).find(".poster-playlist").attr('src', CFG.base_url + "/" + media.posterplaylist);
                        if (media.resumen == null) {
                            $(dummieMedia).find(".media-resumen").hide();
                        } else {
                            $(dummieMedia).find(".media-resumen").html(media.resumen).show();
                        }
                        $(".playlist-wall").append($(dummieMedia).html());
                    });
                    $(".layer-load").hide();
                });
            } else {
                $(".layer-load").hide();
                $(".playlist-wall").html('<div class="col-md-12 col-lg-4 my-2"><h3>' + playlist.data + '</h3></div>');
            }
        });
    }

    var playlistMedia;
    $('body').on('click', 'div.card-e360play', function() {
        $(".layer-load").show();
        var playlistid = $(this).data("playlistid");
        var userSession = JSON.parse(sessionStorage.getItem("usersession"));
        $.post(CFG.base_url + '/phplibs/AjaxPlayListManager.php', { playlistid: playlistid, userid: userSession.id }, function(mediadata, textStatus, xhr) {
            playlistMedia = jQuery.parseJSON(mediadata);
            $("#tablelist").find('tbody').html("");

            if (playlistMedia.playListLength > 0) {
                $.each(playlistMedia.data, function(index, media) {
                    $("#tablelist").find('tbody').append('<tr><td class="playmedia" data-indice="' + index +
                        '" data-mediaType="' +
                        media.type +
                        '" data-mediaid="' +
                        media.mediaid + '">' +
                        media.media_nombre +
                        '</td></tr>');
                    $(".playlistname").html(media.nombre);
                    $("#seccionname").html(media.nombre);
                });
            }
            $('#tablelist').DataTable({
                "searching": false,
                "ordering": false,
                select: true
            });
            $(".medialist-wall").css('display', 'flex');
            $(".playlist-wall").hide();
            $(".layer-load").hide();
        });
    });

    $('body').on('click', '.playmedia', function() {
        var media = playlistMedia.data[parseInt($(this).data("indice"))];
        switch (media.type) {
            case 'video':
                renderVideo(media);
                break;
            case 'audio':
                renderAudio(media);
                break;
        }
    });


    function renderVideo(video) {
        $(".layer-load").show();
        $.get(CFG.base_url + '/video.template.html', function(templatedata) {
            var dummieMedia = $.parseHTML(templatedata);
            $("#mediaobject").html("");
            $(dummieMedia).find('source').attr('src', CFG.base_url + '/' + video.url);
            $("#mediaobject").html($(dummieMedia).html());
            //var videoObj = $("#resource-e360").mediaelementplayer();
            $("#seccionname").html(video.media_nombre);
            $(".layer-load").hide();
        });
    }



    setInterval(changeBG, 10000);
    var indexback = 0;

    function changeBG() {
        indexback++;
        var maxbg = $("#thebacks").find('img').length;
        if (indexback > maxbg - 1) { indexback = 0; }
        var nextUrl = 'url(' + $("#thebacks").find('img').eq(indexback).attr('src') + ')';
        $("body").css('background-image', nextUrl);
    }

    $("window").resize(function(event) {
        $("body").css('padding-top', $(".fixed-top").outerHeight() + "px");
    });
    $("body").css('padding-top', $(".fixed-top").outerHeight() + "px");

});