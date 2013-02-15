/*global define require*/
define(['jquery', 'backbone', 'handlebars', 'underscore', 'bootscope', 'require', 'bootstrap', 'registers'], function($, Backbone, Handlebars, _, bs, require){
    var AppRouter,
        router,
        albumsDeffered = $.getJSON("/diapos/albums.json"),
        cover,
        prevAlbumView;


    function scrollTo(id, preventAnimation){
        var scrollToSize = 0;

        if(id !== '#'){
            scrollToSize = $('#' + id).offset().top;
        }
        $('html, body').animate({
            scrollTop:scrollToSize
        }, preventAnimation ? 0 : 'slow', 'swing');
    }

    AppRouter = Backbone.Router.extend({
        routes: {
            "" : "covers",
            ":year" : "coversYear",
            "album/:cover": "diapos",
            ":albums": "albums"
        },
        buildBreadCumb : function(){

        },
        covers : function(){
            albumsDeffered.done(function(albums){
                require([
                    'views/covers',
                    'text!' + bs.globals.getUrl('js/templates/covers.phtml'),
                    'text!' + bs.globals.getUrl('js/templates/pagination.phtml')
                ], function(CoversView, coverTemplate, paginationTemplate){
                        if(!cover){
                            cover = new CoversView({
                                model : albums,
                                coversTemplate : coverTemplate,
                                paginationTemplate : paginationTemplate
                            });
                        }else{
                            cover.render();
                        }

                        scrollTo('#');

                        this.currentView = cover;
                    }
                );
            });
        },
        coversYear : function(year){
            albumsDeffered.done(function(albums){
                require([
                    'views/covers',
                    'text!' + bs.globals.getUrl('js/templates/covers.phtml'),
                    'text!' + bs.globals.getUrl('js/templates/pagination.phtml')
                ], function(CoversView, coverTemplate, paginationTemplate){
                        if(!cover){
                            cover = new CoversView({
                                model : albums,
                                coversTemplate : coverTemplate,
                                paginationTemplate : paginationTemplate
                            });
                        }else if(this.currentView !== cover){
                            cover.render();
                        }

                        scrollTo(year);

                        this.currentView = cover;
                    }
                );
            });
        },
        diapos: function(albumId) {
            albumsDeffered.done(function(albums){
                require([
                    'views/album',
                    'text!' + bs.globals.getUrl('js/templates/album.phtml')
                ], function(AlbumView, albumTemplate){
                        if(prevAlbumView){
                            prevAlbumView.undelegateEvents();
                        }
                        prevAlbumView = new AlbumView({
                            model : albums,
                            albumTemplate : albumTemplate,
                            albumId : albumId
                        });

                        this.currentView = prevAlbumView;
                    }
                );
            });
            //$.when(albumId, albumsDeffered, $.get("/" + bs.globals.baseUrl + "/js/templates/album.phtml")).done(showAlbum);
        },
        initialize : function(){
            //console.log("init");
        }
    });

    return function(){
        if(!router){
            router = new AppRouter();

            Backbone.history.start({
                root: bs.globals.baseUrl,
                pushState: true
            });
        }

        return router;
    };
});